"""Feature contract validation and notebook-compatible encoding."""

import json
from pathlib import Path
from typing import Any

import pandas as pd
from sklearn.preprocessing import LabelEncoder

TARGET_COLUMN: str = "Result"
GROUP_COLUMN: str = "GameID"
GAME_PHASE_COLUMN: str = "GamePhase"
EXPECTED_FEATURE_COUNT: int = 34
EXCLUDED_METADATA_COLUMNS: list[str] = [
    "FEN",
    "GameID",
    "WhitePlayer",
    "BlackPlayer",
    "WhiteElo",
    "BlackElo",
]
EXCLUDED_MOVE_COLUMNS: list[str] = [
    "PlayedMove",
    "BestMove",
    "BestMoveUCI",
    "PlayedMoveUCI",
]
EXCLUDED_COLUMNS: list[str] = [
    "FEN",
    "GameID",
    "WhitePlayer",
    "BlackPlayer",
    "WhiteElo",
    "BlackElo",
    "Result",
    "PlayedMove",
    "BestMove",
    "BestMoveUCI",
    "PlayedMoveUCI",
]
BACKEND_DIR: Path = Path(__file__).resolve().parents[1]
DEFAULT_SCHEMA_PATH: Path = BACKEND_DIR / "models" / "feature_schema.json"


def load_feature_schema(schema_path: Path = DEFAULT_SCHEMA_PATH) -> dict[str, Any]:
    """Load and verify the dataset and preprocessing contract."""
    with schema_path.open(encoding="utf-8") as schema_file:
        schema = json.load(schema_file)

    if not isinstance(schema, dict):
        raise ValueError(f"Feature schema must be a JSON object: {schema_path}")

    if schema.get("schema_version") != 1:
        raise ValueError("Unsupported or missing feature schema_version; expected 1.")

    feature_names = schema.get("feature_names")
    if not isinstance(feature_names, list) or not all(
        isinstance(feature, str) for feature in feature_names
    ):
        raise ValueError("feature_names must be an ordered JSON array of strings.")

    expected_contract = {
        "categorical_features": [GAME_PHASE_COLUMN],
        "target_column": TARGET_COLUMN,
        "group_column": GROUP_COLUMN,
        "excluded_metadata_columns": EXCLUDED_METADATA_COLUMNS,
        "excluded_move_columns": EXCLUDED_MOVE_COLUMNS,
        "excluded_columns": EXCLUDED_COLUMNS,
    }
    for key, expected_value in expected_contract.items():
        if schema.get(key) != expected_value:
            raise ValueError(
                f"Feature schema field {key!r} must match the production contract."
            )

    if len(feature_names) != EXPECTED_FEATURE_COUNT:
        raise ValueError(
            f"Feature schema must contain exactly {EXPECTED_FEATURE_COUNT} features."
        )
    if len(set(feature_names)) != len(feature_names):
        raise ValueError(
            "Feature schema cannot contain duplicate feature names."
        )

    return schema


# Keep a convenient default contract for callers while sourcing it from the
# JSON schema rather than maintaining a second hard-coded feature list.
FEATURE_NAMES: list[str] = load_feature_schema()["feature_names"]


def validate_and_select_features(
    dataframe: pd.DataFrame, schema: dict[str, Any]
) -> pd.DataFrame:
    """Validate required columns, then select them in schema order."""
    feature_names = schema["feature_names"]
    missing = [feature for feature in feature_names if feature not in dataframe.columns]

    if missing:
        raise ValueError(f"Dataset is missing required feature columns: {missing}")

    schema_features = set(feature_names)
    input_feature_order = [
        column for column in dataframe.columns if column in schema_features
    ]
    if input_feature_order != feature_names:
        raise ValueError(
            "Dataset feature ordering does not match feature_schema.json. "
            f"Expected {feature_names}; received {input_feature_order}."
        )

    features = dataframe.loc[:, feature_names].copy()

    if features.columns.tolist() != feature_names:
        raise ValueError(
            "Selected feature ordering does not match feature_schema.json."
        )

    if features.isnull().any().any():
        null_columns = features.columns[features.isnull().any()].tolist()
        raise ValueError(f"Feature columns contain missing values: {null_columns}")

    return features


def validate_training_columns(dataframe: pd.DataFrame) -> None:
    """Fail early when target or group identifiers are unavailable."""
    required = [TARGET_COLUMN, GROUP_COLUMN]
    missing = [column for column in required if column not in dataframe.columns]

    if missing:
        raise ValueError(f"Dataset is missing required training columns: {missing}")

    if dataframe[[TARGET_COLUMN, GROUP_COLUMN]].isnull().any().any():
        raise ValueError("Target and GameID columns must not contain missing values.")


def encode_train_test_data(
    train_features: pd.DataFrame,
    test_features: pd.DataFrame,
    train_target: pd.Series,
    test_target: pd.Series,
    all_target_values: pd.Series,
    feature_names: list[str],
) -> tuple[
    pd.DataFrame,
    pd.DataFrame,
    pd.Series,
    pd.Series,
    LabelEncoder,
    LabelEncoder,
]:
    """Fit notebook-compatible encoders on training rows and transform both sets.

    Encoders are fitted only on training rows. Persist the returned encoders
    with the model and load them for any future inference path.
    """
    if train_features.columns.tolist() != feature_names:
        raise ValueError(
            "Feature ordering does not match the required 34-feature schema."
        )

    if test_features.columns.tolist() != feature_names:
        raise ValueError(
            "Test feature ordering does not match the required feature schema."
        )

    train_labels = train_target.astype(str)
    test_labels = test_target.astype(str)
    all_labels = set(all_target_values.astype(str))

    if set(train_labels) != all_labels:
        missing_labels = sorted(all_labels - set(train_labels))
        raise ValueError(
            "The grouped training split does not contain every target class: "
            f"{missing_labels}. Provide more games or adjust the grouped split "
            "strategy."
        )

    label_encoder = LabelEncoder()
    encoded_train_target = pd.Series(
        label_encoder.fit_transform(train_labels),
        index=train_target.index,
        name=TARGET_COLUMN,
    )
    encoded_test_target = pd.Series(
        label_encoder.transform(test_labels),
        index=test_target.index,
        name=TARGET_COLUMN,
    )

    game_phase_encoder = LabelEncoder()
    encoded_train_features = train_features.copy()
    encoded_test_features = test_features.copy()
    encoded_train_features[GAME_PHASE_COLUMN] = game_phase_encoder.fit_transform(
        encoded_train_features[GAME_PHASE_COLUMN].astype(str)
    )
    try:
        encoded_test_features[GAME_PHASE_COLUMN] = game_phase_encoder.transform(
            encoded_test_features[GAME_PHASE_COLUMN].astype(str)
        )
    except ValueError as exc:
        raise ValueError(
            "Test data contains a GamePhase category absent from the training data."
        ) from exc

    if encoded_train_features.columns.tolist() != feature_names:
        raise ValueError(
            "Encoded training feature order does not match the feature schema."
        )

    if encoded_test_features.columns.tolist() != feature_names:
        raise ValueError(
            "Encoded test feature order does not match the feature schema."
        )

    return (
        encoded_train_features,
        encoded_test_features,
        encoded_train_target,
        encoded_test_target,
        label_encoder,
        game_phase_encoder,
    )
