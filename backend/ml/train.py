"""Train the notebook's Random Forest using a game-grouped holdout split.

Run from the backend directory, for example:

    python -m ml.train ../all_38positionsss.csv
"""

import argparse
import json
from pathlib import Path
from typing import Any

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import GroupShuffleSplit

from ml.evaluate import build_metrics, format_metrics_summary
from ml.preprocess import (
    BACKEND_DIR,
    DEFAULT_SCHEMA_PATH,
    GROUP_COLUMN,
    TARGET_COLUMN,
    encode_train_test_data,
    load_feature_schema,
    validate_and_select_features,
    validate_training_columns,
)

DEFAULT_MODEL_DIR: Path = BACKEND_DIR / "models"
MODEL_FILENAME: str = "random_forest.joblib"
LABEL_ENCODER_FILENAME: str = "label_encoder.joblib"
GAME_PHASE_ENCODER_FILENAME: str = "game_phase_encoder.joblib"
METRICS_FILENAME: str = "metrics.json"
PREPROCESSING_METADATA_FILENAME: str = "preprocessing_metadata.json"
SPLIT_RANDOM_STATE: int = 42
SPLIT_TEST_SIZE: float = 0.2
SPLIT_CANDIDATES: int = 100


def grouped_split_indices(
    features: pd.DataFrame,
    target: pd.Series,
    groups: pd.Series,
    test_size: float = SPLIT_TEST_SIZE,
    random_state: int = SPLIT_RANDOM_STATE,
) -> tuple[list[int], list[int]]:
    """Select a reproducible grouped split with every class in each partition.

    Candidate partitions come from GroupShuffleSplit. Selecting the first
    candidate containing all target classes on both sides avoids undefined or
    misleading per-class metrics for rare game outcomes while keeping games
    disjoint.
    """
    if len(features) != len(target) or len(target) != len(groups):
        raise ValueError("Features, target, and groups must have the same row count.")
    if groups.nunique() < 2:
        raise ValueError(
            "At least two distinct GameID groups are required for splitting."
        )

    expected_classes = set(target.astype(str))
    splitter = GroupShuffleSplit(
        n_splits=SPLIT_CANDIDATES,
        test_size=test_size,
        random_state=random_state,
    )

    for train_indices, test_indices in splitter.split(features, target, groups=groups):
        train_groups = set(groups.iloc[train_indices])
        test_groups = set(groups.iloc[test_indices])

        if train_groups & test_groups:
            raise RuntimeError("GroupShuffleSplit produced overlapping GameID groups.")

        train_classes = set(target.iloc[train_indices].astype(str))
        test_classes = set(target.iloc[test_indices].astype(str))
        if train_classes == expected_classes and test_classes == expected_classes:
            return train_indices.tolist(), test_indices.tolist()

    raise ValueError(
        "Could not find a leakage-safe grouped split containing every target class "
        f"in both partitions after {SPLIT_CANDIDATES} deterministic candidates "
        f"(test_size={test_size}, random_state={random_state}). Ensure each class "
        "appears in at least two distinct games or adjust the dataset."
    )


def train_model(
    dataset_path: Path,
    output_dir: Path = DEFAULT_MODEL_DIR,
    schema_path: Path = DEFAULT_SCHEMA_PATH,
) -> dict[str, Any]:
    """Train, evaluate, and save the model and its preprocessing artifacts."""
    dataframe = pd.read_csv(dataset_path)
    validate_training_columns(dataframe)

    # The selected frame is explicitly ordered from the checked-in schema.
    schema = load_feature_schema(schema_path)
    features = validate_and_select_features(dataframe, schema)
    target = dataframe[TARGET_COLUMN].astype(str)
    groups = dataframe[GROUP_COLUMN]

    train_indices, test_indices = grouped_split_indices(
        features,
        target,
        groups,
    )

    train_features = features.iloc[train_indices].copy()
    test_features = features.iloc[test_indices].copy()
    train_target = target.iloc[train_indices]
    test_target = target.iloc[test_indices]
    train_groups = groups.iloc[train_indices]
    test_groups = groups.iloc[test_indices]

    if set(train_groups) & set(test_groups):
        raise RuntimeError(
            "Grouped split leakage detected: a GameID occurs in both sets."
        )

    if train_features.columns.tolist() != features.columns.tolist():
        raise ValueError(
            "Training feature ordering does not match feature_schema.json."
        )

    if test_features.columns.tolist() != features.columns.tolist():
        raise ValueError("Test feature ordering does not match feature_schema.json.")

    (
        X_train,
        X_test,
        y_train,
        y_test,
        label_encoder,
        game_phase_encoder,
    ) = encode_train_test_data(
        train_features,
        test_features,
        train_target,
        test_target,
        target,
        schema["feature_names"],
    )

    model = RandomForestClassifier(
        n_estimators=300,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    metrics = build_metrics(
        model=model,
        features=X_test,
        target=y_test,
        label_encoder=label_encoder,
        train_game_count=train_groups.nunique(),
        test_game_count=test_groups.nunique(),
        train_row_count=len(X_train),
        test_row_count=len(X_test),
    )

    # Do not persist any artifacts until schema/order validation and evaluation
    # have completed successfully.
    feature_names = schema["feature_names"]
    if (
        X_train.columns.tolist() != feature_names
        or X_test.columns.tolist() != feature_names
    ):
        raise ValueError("Feature ordering does not match feature_schema.json.")

    output_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, output_dir / MODEL_FILENAME)
    joblib.dump(label_encoder, output_dir / LABEL_ENCODER_FILENAME)
    joblib.dump(game_phase_encoder, output_dir / GAME_PHASE_ENCODER_FILENAME)
    (output_dir / METRICS_FILENAME).write_text(
        json.dumps(metrics, indent=2, allow_nan=False) + "\n", encoding="utf-8"
    )
    preprocessing_metadata = {
        "schema_version": schema["schema_version"],
        "feature_names": feature_names,
        "categorical_features": schema["categorical_features"],
        "target_column": schema["target_column"],
        "group_column": schema["group_column"],
        "excluded_metadata_columns": schema["excluded_metadata_columns"],
        "excluded_move_columns": schema["excluded_move_columns"],
        "excluded_columns": schema["excluded_columns"],
        "label_classes": label_encoder.classes_.tolist(),
        "game_phase_classes": game_phase_encoder.classes_.tolist(),
        "split": {
            "strategy": "GroupShuffleSplit",
            "group_column": GROUP_COLUMN,
            "test_size": SPLIT_TEST_SIZE,
            "random_state": SPLIT_RANDOM_STATE,
            "candidate_splits": SPLIT_CANDIDATES,
        },
        "model": {
            "type": "RandomForestClassifier",
            "n_estimators": 300,
            "random_state": 42,
            "n_jobs": -1,
        },
    }
    (output_dir / PREPROCESSING_METADATA_FILENAME).write_text(
        json.dumps(preprocessing_metadata, indent=2, allow_nan=False) + "\n",
        encoding="utf-8",
    )

    return metrics


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "dataset", type=Path, help="CSV exported from the feature notebook"
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_MODEL_DIR,
        help="Directory for model artifacts",
    )
    parser.add_argument(
        "--schema",
        type=Path,
        default=DEFAULT_SCHEMA_PATH,
        help="Ordered feature schema JSON",
    )
    args = parser.parse_args()

    metrics = train_model(args.dataset, args.output_dir, args.schema)
    print(format_metrics_summary(metrics))
    print(f"\nArtifacts written to: {args.output_dir.resolve()}")


if __name__ == "__main__":
    main()
