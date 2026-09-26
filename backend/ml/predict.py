"""Load saved M4.1 artifacts and predict chess-game outcomes offline.

Run from the backend directory:

    python -m ml.predict sample_features.json
    python -m ml.predict sample.csv
"""

import argparse
import hashlib
import json
from dataclasses import dataclass
from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path
from typing import Any, Mapping

import joblib
import numpy as np
import pandas as pd
from pandas.api.types import is_numeric_dtype
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

from ml.preprocess import (
    BACKEND_DIR,
    load_feature_schema,
    validate_and_select_features,
)

DEFAULT_MODEL_DIR: Path = BACKEND_DIR / "models"
MODEL_FILENAME: str = "random_forest.joblib"
LABEL_ENCODER_FILENAME: str = "label_encoder.joblib"
GAME_PHASE_ENCODER_FILENAME: str = "game_phase_encoder.joblib"
PREPROCESSING_METADATA_FILENAME: str = "preprocessing_metadata.json"


@dataclass(frozen=True)
class LoadedArtifacts:
    """In-memory, validated model artifacts cached for inference calls."""

    model: RandomForestClassifier
    label_encoder: LabelEncoder
    game_phase_encoder: LabelEncoder
    schema: dict[str, Any]
    preprocessing_metadata: dict[str, Any]
    public_metadata: dict[str, Any]


def _artifact_digest(model_path: Path) -> str:
    """Return a stable model fingerprint without reading the entire artifact at once."""
    digest = hashlib.sha256()
    with model_path.open("rb") as model_file:
        for chunk in iter(lambda: model_file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _read_json_object(path: Path) -> dict[str, Any]:
    """Read a JSON object and give malformed or missing artifacts a clear error."""
    try:
        with path.open(encoding="utf-8") as json_file:
            value = json.load(json_file)
    except FileNotFoundError as exc:
        raise FileNotFoundError(f"Required model artifact not found: {path}") from exc
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON in model artifact {path}: {exc}") from exc

    if not isinstance(value, dict):
        raise ValueError(f"Model metadata must be a JSON object: {path}")
    return value


def _build_public_metadata(
    model_path: Path,
    schema: dict[str, Any],
    preprocessing_metadata: dict[str, Any],
) -> dict[str, Any]:
    """Expose saved model/schema metadata, with explicit legacy fallbacks."""
    model_config = preprocessing_metadata.get("model")
    if not isinstance(model_config, dict) or not model_config.get("type"):
        raise ValueError(
            "preprocessing_metadata.json must contain a model configuration."
        )

    model_version = preprocessing_metadata.get("model_version")
    model_version_source = "preprocessing_metadata"
    if not isinstance(model_version, str) or not model_version.strip():
        model_version = f"{model_config['type']}-{_artifact_digest(model_path)[:12]}"
        model_version_source = "model_artifact_sha256"

    training_timestamp = preprocessing_metadata.get("training_timestamp")
    training_timestamp_source = "preprocessing_metadata"
    if not isinstance(training_timestamp, str) or not training_timestamp.strip():
        artifact_timestamp = datetime.fromtimestamp(
            model_path.stat().st_mtime, tz=timezone.utc
        )
        training_timestamp = artifact_timestamp.isoformat().replace("+00:00", "Z")
        training_timestamp_source = "model_artifact_mtime"

    return {
        "model_version": model_version,
        "model_version_source": model_version_source,
        "training_timestamp": training_timestamp,
        "training_timestamp_source": training_timestamp_source,
        "feature_schema_version": schema["schema_version"],
        "supported_feature_count": len(schema["feature_names"]),
    }


@lru_cache(maxsize=8)
def _load_artifacts(models_dir: str) -> LoadedArtifacts:
    """Load and validate model files once per model directory."""
    directory = Path(models_dir)
    model_path = directory / MODEL_FILENAME
    label_encoder_path = directory / LABEL_ENCODER_FILENAME
    game_phase_encoder_path = directory / GAME_PHASE_ENCODER_FILENAME
    preprocessing_metadata_path = directory / PREPROCESSING_METADATA_FILENAME
    schema_path = directory / "feature_schema.json"

    required_paths = (
        model_path,
        label_encoder_path,
        game_phase_encoder_path,
        preprocessing_metadata_path,
        schema_path,
    )
    missing_paths = [str(path) for path in required_paths if not path.is_file()]
    if missing_paths:
        raise FileNotFoundError(
            "Required inference artifacts are missing: " + ", ".join(missing_paths)
        )

    schema = load_feature_schema(schema_path)
    preprocessing_metadata = _read_json_object(preprocessing_metadata_path)
    try:
        model = joblib.load(model_path)
        label_encoder = joblib.load(label_encoder_path)
        game_phase_encoder = joblib.load(game_phase_encoder_path)
    except Exception as exc:
        raise RuntimeError(
            f"Failed to load saved inference artifacts from {directory}"
        ) from exc

    if not isinstance(model, RandomForestClassifier):
        raise TypeError(
            f"Expected a saved RandomForestClassifier, received {type(model).__name__}."
        )
    if not isinstance(label_encoder, LabelEncoder):
        raise TypeError("Saved label_encoder.joblib is not a LabelEncoder.")
    if not isinstance(game_phase_encoder, LabelEncoder):
        raise TypeError("Saved game_phase_encoder.joblib is not a LabelEncoder.")

    feature_names = schema["feature_names"]
    if preprocessing_metadata.get("schema_version") != schema["schema_version"]:
        raise ValueError(
            "Model preprocessing metadata schema_version does not match "
            "feature_schema.json."
        )
    if preprocessing_metadata.get("feature_names") != feature_names:
        raise ValueError(
            "Model preprocessing metadata feature order does not match "
            "feature_schema.json."
        )
    if preprocessing_metadata.get("categorical_features") != schema[
        "categorical_features"
    ]:
        raise ValueError(
            "Model preprocessing metadata categorical features do not match "
            "feature_schema.json."
        )
    if preprocessing_metadata.get("target_column") != schema["target_column"]:
        raise ValueError(
            "Model preprocessing metadata target column does not match "
            "feature_schema.json."
        )
    if preprocessing_metadata.get("label_classes") != label_encoder.classes_.tolist():
        raise ValueError(
            "Saved label encoder classes do not match preprocessing metadata."
        )
    if preprocessing_metadata.get("game_phase_classes") != (
        game_phase_encoder.classes_.tolist()
    ):
        raise ValueError(
            "Saved GamePhase encoder classes do not match preprocessing metadata."
        )
    if getattr(model, "n_features_in_", None) != len(feature_names):
        raise ValueError(
            "Saved model feature count does not match feature_schema.json."
        )
    model_feature_names = getattr(model, "feature_names_in_", None)
    if model_feature_names is not None and model_feature_names.tolist() != feature_names:
        raise ValueError(
            "Saved model feature ordering does not match feature_schema.json."
        )
    model_config = preprocessing_metadata.get("model")
    if not isinstance(model_config, dict):
        raise ValueError(
            "preprocessing_metadata.json must contain a model configuration."
        )
    if model_config.get("type") != type(model).__name__:
        raise ValueError(
            "Saved model type does not match preprocessing_metadata.json."
        )
    expected_model_classes = list(range(len(label_encoder.classes_)))
    if np.asarray(model.classes_).tolist() != expected_model_classes:
        raise ValueError("Saved model classes do not match the saved label encoder.")

    public_metadata = _build_public_metadata(
        model_path, schema, preprocessing_metadata
    )
    return LoadedArtifacts(
        model=model,
        label_encoder=label_encoder,
        game_phase_encoder=game_phase_encoder,
        schema=schema,
        preprocessing_metadata=preprocessing_metadata,
        public_metadata=public_metadata,
    )


def _resolve_models_dir(models_dir: Path | str) -> str:
    """Normalize model directory paths for stable cache keys."""
    return str(Path(models_dir).expanduser().resolve())


def get_model_metadata(models_dir: Path | str = DEFAULT_MODEL_DIR) -> dict[str, Any]:
    """Return version and feature metadata from the cached saved artifacts."""
    artifacts = _load_artifacts(_resolve_models_dir(models_dir))
    return dict(artifacts.public_metadata)


def _prepare_feature_frame(
    dataframe: pd.DataFrame, artifacts: LoadedArtifacts
) -> pd.DataFrame:
    """Validate raw values and transform categorical columns using saved encoders."""
    schema = artifacts.schema
    feature_names = schema["feature_names"]
    known_excluded_columns = set(schema["excluded_columns"])
    unknown_columns = [
        column
        for column in dataframe.columns
        if column not in feature_names and column not in known_excluded_columns
    ]
    if unknown_columns:
        raise ValueError(f"Input contains unknown columns: {unknown_columns}")

    features = validate_and_select_features(dataframe, schema)
    categorical_features = schema["categorical_features"]
    for column in categorical_features:
        non_string_mask = ~features[column].map(lambda value: isinstance(value, str))
        if non_string_mask.any():
            row_indexes = features.index[non_string_mask].tolist()[:5]
            raise ValueError(
                f"Categorical feature {column!r} must contain strings; "
                f"invalid rows: {row_indexes}."
            )

        known_categories = set(artifacts.game_phase_encoder.classes_.tolist())
        unknown_categories = sorted(set(features[column]) - known_categories)
        if unknown_categories:
            raise ValueError(
                f"Unknown value(s) for categorical feature {column!r}: "
                f"{unknown_categories}. Supported values: "
                f"{sorted(known_categories)}."
            )

        features[column] = artifacts.game_phase_encoder.transform(features[column])

    numeric_features = [
        feature for feature in feature_names if feature not in categorical_features
    ]
    non_numeric_columns = [
        column
        for column in numeric_features
        if not is_numeric_dtype(features[column].dtype)
    ]
    if non_numeric_columns:
        raise ValueError(
            f"Numeric feature columns contain non-numeric values: {non_numeric_columns}"
        )

    numeric_values = features[numeric_features].to_numpy(dtype=float)
    if not np.isfinite(numeric_values).all():
        raise ValueError("Numeric feature columns must contain only finite values.")

    if features.columns.tolist() != feature_names:
        raise ValueError(
            "Prepared feature ordering does not match feature_schema.json."
        )
    return features


def _format_prediction(
    encoded_class: Any,
    probability_row: np.ndarray,
    artifacts: LoadedArtifacts,
) -> dict[str, Any]:
    """Convert model outputs into the public prediction structure."""
    predicted_result = str(
        artifacts.label_encoder.inverse_transform([int(encoded_class)])[0]
    )
    probabilities = {
        str(label): float(probability)
        for label, probability in zip(
            artifacts.label_encoder.classes_, probability_row, strict=True
        )
    }
    return {
        "predicted_result": predicted_result,
        "confidence": probabilities[predicted_result],
        "probabilities": probabilities,
        "model_version": artifacts.public_metadata["model_version"],
        "feature_schema_version": artifacts.public_metadata[
            "feature_schema_version"
        ],
    }


def predict_dataframe(
    dataframe: pd.DataFrame, models_dir: Path | str = DEFAULT_MODEL_DIR
) -> list[dict[str, Any]]:
    """Predict results for a batch of feature rows using one cached model load."""
    artifacts = _load_artifacts(_resolve_models_dir(models_dir))
    prepared_features = _prepare_feature_frame(dataframe, artifacts)
    if prepared_features.empty:
        return []

    probability_matrix = artifacts.model.predict_proba(prepared_features)
    model_class_ids = np.asarray(artifacts.model.classes_)
    predicted_classes = model_class_ids[np.argmax(probability_matrix, axis=1)]
    return [
        _format_prediction(encoded_class, probabilities, artifacts)
        for encoded_class, probabilities in zip(
            predicted_classes, probability_matrix, strict=True
        )
    ]


def predict_position(
    feature_dict: Mapping[str, Any], models_dir: Path | str = DEFAULT_MODEL_DIR
) -> dict[str, Any]:
    """Predict one position from a feature mapping without exposing model details.

    Known feature keys are assembled according to the saved schema. Missing or
    unknown keys are rejected instead of being silently discarded.
    """
    if not isinstance(feature_dict, Mapping):
        raise TypeError("feature_dict must be a mapping of feature names to values.")

    artifacts = _load_artifacts(_resolve_models_dir(models_dir))
    feature_names = artifacts.schema["feature_names"]
    missing = [feature for feature in feature_names if feature not in feature_dict]
    known_non_features = set(artifacts.schema["excluded_columns"])
    unknown = [
        key
        for key in feature_dict
        if key not in feature_names and key not in known_non_features
    ]
    if missing:
        raise ValueError(f"Prediction input is missing required features: {missing}")
    if unknown:
        raise ValueError(f"Prediction input contains unknown features: {unknown}")

    ordered_features = {feature: feature_dict[feature] for feature in feature_names}
    return predict_dataframe(pd.DataFrame([ordered_features]), models_dir)[0]


def _load_cli_input(
    input_path: Path, models_dir: Path
) -> dict[str, Any] | list[dict[str, Any]]:
    """Read JSON feature mappings or CSV feature frames and run predictions."""
    suffix = input_path.suffix.lower()
    if suffix == ".json":
        try:
            with input_path.open(encoding="utf-8") as input_file:
                payload = json.load(input_file)
        except json.JSONDecodeError as exc:
            raise ValueError(f"Invalid JSON input {input_path}: {exc}") from exc

        if isinstance(payload, dict):
            return predict_position(payload, models_dir)
        if isinstance(payload, list) and all(
            isinstance(row, dict) for row in payload
        ):
            return predict_dataframe(pd.DataFrame(payload), models_dir)
        raise ValueError(
            "JSON input must be one feature object or an array of feature objects."
        )

    if suffix == ".csv":
        try:
            dataframe = pd.read_csv(input_path)
        except pd.errors.EmptyDataError as exc:
            raise ValueError(f"CSV input is empty: {input_path}") from exc
        return predict_dataframe(dataframe, models_dir)

    raise ValueError("Input file must have a .json or .csv extension.")


def main() -> None:
    """Run prediction from the command line and print JSON results."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="A feature JSON object or CSV file")
    parser.add_argument(
        "--models-dir",
        type=Path,
        default=DEFAULT_MODEL_DIR,
        help="Directory containing the saved model artifacts",
    )
    args = parser.parse_args()

    try:
        result = _load_cli_input(args.input, args.models_dir)
    except (OSError, TypeError, ValueError, RuntimeError) as exc:
        parser.error(str(exc))

    print(json.dumps(result, indent=2, allow_nan=False))


if __name__ == "__main__":
    main()
