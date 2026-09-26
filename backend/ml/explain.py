"""Cached SHAP explanations and offline global explainability artifacts.

Run from the backend directory to generate dataset-wide outputs:

    python -m ml.explain ../all_38positionsss.csv
"""

import argparse
import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Mapping, Sequence

import numpy as np
import pandas as pd

from ml.predict import (
    DEFAULT_MODEL_DIR,
    LoadedArtifacts,
    _feature_mapping_to_frame,
    _format_prediction,
    _load_artifacts,
    _prepare_feature_frame,
    _resolve_models_dir,
)

DEFAULT_TOP_N: int = 5
DEFAULT_PLOT_DISPLAY: int = 20
GLOBAL_IMPORTANCE_FILENAME: str = "global_feature_importance.json"
PLOTS_DIRECTORY_NAME: str = "plots"
SUMMARY_PLOT_FILENAME: str = "shap_summary_plot.png"
SHAP_BAR_FILENAME: str = "shap_bar_plot.png"
TOP_FEATURES_PLOT_FILENAME: str = "top20_feature_importance.png"


@lru_cache(maxsize=8)
def _load_explainer(models_dir: str) -> Any:
    """Create one TreeExplainer per model directory and reuse it across calls."""
    try:
        import shap
    except ImportError as exc:
        raise RuntimeError(
            "SHAP is required for model explanations. Install backend requirements."
        ) from exc

    artifacts = _load_artifacts(models_dir)
    return shap.TreeExplainer(artifacts.model)


def _normalize_shap_values(
    shap_values: Any,
    sample_count: int,
    feature_count: int,
    class_count: int,
) -> np.ndarray:
    """Normalize SHAP version-specific outputs to (rows, features, classes)."""
    if hasattr(shap_values, "values"):
        shap_values = shap_values.values

    if isinstance(shap_values, (list, tuple)):
        class_arrays = [np.asarray(class_values) for class_values in shap_values]
        if len(class_arrays) == class_count and all(
            values.shape == (sample_count, feature_count) for values in class_arrays
        ):
            return np.stack(class_arrays, axis=2)

    values = np.asarray(shap_values)
    if values.shape == (sample_count, feature_count, class_count):
        return values
    if values.shape == (class_count, sample_count, feature_count):
        return np.transpose(values, (1, 2, 0))
    if values.shape == (sample_count, class_count, feature_count):
        return np.transpose(values, (0, 2, 1))
    if class_count == 1 and values.shape == (sample_count, feature_count):
        return values[:, :, np.newaxis]

    raise ValueError(
        "Unexpected SHAP output shape. Expected rows × features × classes; "
        f"received {values.shape} for {sample_count} rows, {feature_count} "
        f"features, and {class_count} classes."
    )


def _validate_top_n(top_n: int) -> None:
    """Reject invalid explanation display limits."""
    if isinstance(top_n, bool) or not isinstance(top_n, int) or top_n < 1:
        raise ValueError("top_n must be a positive integer.")


def _ranked_contributions(
    shap_row: np.ndarray,
    feature_names: list[str],
    top_n: int,
    positive: bool,
) -> list[dict[str, Any]]:
    """Build sorted, display-ready positive or negative feature impacts."""
    if positive:
        indexes = [index for index, impact in enumerate(shap_row) if impact > 0]
        indexes.sort(key=lambda index: shap_row[index], reverse=True)
        direction = "supports"
    else:
        indexes = [index for index, impact in enumerate(shap_row) if impact < 0]
        indexes.sort(key=lambda index: abs(shap_row[index]), reverse=True)
        direction = "opposes"

    contributions = []
    for index in indexes[:top_n]:
        feature_name = feature_names[index]
        impact = float(shap_row[index])
        contributions.append(
            {
                "feature": feature_name,
                "impact": impact,
                "formatted": (
                    f"{feature_name} {direction} the prediction "
                    f"(SHAP impact {impact:+.4f})"
                ),
            }
        )
    return contributions


def _explain_prepared_frame(
    prepared_features: pd.DataFrame,
    artifacts: LoadedArtifacts,
    top_n: int,
    models_dir: str,
    predictions: Sequence[Mapping[str, Any]] | None = None,
) -> list[dict[str, Any]]:
    """Explain a preprocessed batch using one cached explainer execution."""
    if prepared_features.empty:
        return []

    explainer = _load_explainer(models_dir)
    raw_values = explainer.shap_values(prepared_features)
    feature_names = artifacts.schema["feature_names"]
    class_count = len(artifacts.label_encoder.classes_)
    shap_tensor = _normalize_shap_values(
        raw_values,
        sample_count=len(prepared_features),
        feature_count=len(feature_names),
        class_count=class_count,
    )

    model_class_ids = np.asarray(artifacts.model.classes_)
    if predictions is not None:
        if len(predictions) != len(prepared_features):
            raise ValueError(
                "Precomputed prediction count does not match explanation row count."
            )
        try:
            predicted_classes = np.asarray(
                [
                    artifacts.label_encoder.transform(
                        [str(prediction["predicted_result"])]
                    )[0]
                    for prediction in predictions
                ]
            )
        except (KeyError, ValueError) as exc:
            raise ValueError(
                "Precomputed predictions contain a missing or unknown result label."
            ) from exc
        prediction_rows = [
            {
                "predicted_result": str(prediction["predicted_result"]),
                "confidence": float(prediction["confidence"]),
                "model_version": artifacts.public_metadata["model_version"],
                "feature_schema_version": artifacts.public_metadata[
                    "feature_schema_version"
                ],
            }
            for prediction in predictions
        ]
    else:
        probability_matrix = artifacts.model.predict_proba(prepared_features)
        predicted_classes = model_class_ids[np.argmax(probability_matrix, axis=1)]
        prediction_rows = [
            _format_prediction(encoded_class, probabilities, artifacts)
            for encoded_class, probabilities in zip(
                predicted_classes, probability_matrix, strict=True
            )
        ]
    explanations = []

    for row_index, encoded_class in enumerate(predicted_classes):
        class_index = int(np.flatnonzero(model_class_ids == encoded_class)[0])
        prediction = prediction_rows[row_index]
        class_impacts = shap_tensor[row_index, :, class_index]
        explanations.append(
            {
                "prediction": prediction["predicted_result"],
                "confidence": prediction["confidence"],
                "top_positive_features": _ranked_contributions(
                    class_impacts, feature_names, top_n, positive=True
                ),
                "top_negative_features": _ranked_contributions(
                    class_impacts, feature_names, top_n, positive=False
                ),
                "model_version": prediction["model_version"],
                "feature_schema_version": prediction["feature_schema_version"],
            }
        )

    return explanations


def explain_dataframe(
    dataframe: pd.DataFrame,
    top_n: int = DEFAULT_TOP_N,
    models_dir: Path | str = DEFAULT_MODEL_DIR,
    predictions: Sequence[Mapping[str, Any]] | None = None,
) -> list[dict[str, Any]]:
    """Explain a batch of positions with a single cached TreeExplainer call."""
    _validate_top_n(top_n)
    normalized_models_dir = _resolve_models_dir(models_dir)
    artifacts = _load_artifacts(normalized_models_dir)
    prepared_features = _prepare_feature_frame(dataframe, artifacts)
    return _explain_prepared_frame(
        prepared_features,
        artifacts,
        top_n,
        normalized_models_dir,
        predictions,
    )


def explain_position(
    feature_dict: Mapping[str, Any],
    top_n: int = DEFAULT_TOP_N,
    models_dir: Path | str = DEFAULT_MODEL_DIR,
) -> dict[str, Any]:
    """Explain one prediction without exposing model or SHAP internals."""
    _validate_top_n(top_n)
    if not isinstance(feature_dict, Mapping):
        raise TypeError("feature_dict must be a mapping of feature names to values.")

    normalized_models_dir = _resolve_models_dir(models_dir)
    artifacts = _load_artifacts(normalized_models_dir)
    dataframe = _feature_mapping_to_frame(feature_dict, artifacts)
    prepared_features = _prepare_feature_frame(dataframe, artifacts)
    return _explain_prepared_frame(
        prepared_features,
        artifacts,
        top_n,
        normalized_models_dir,
    )[0]


def _all_class_values(
    prepared_features: pd.DataFrame,
    artifacts: LoadedArtifacts,
    models_dir: str,
) -> np.ndarray:
    """Compute normalized multiclass SHAP values for an entire dataset batch."""
    explainer = _load_explainer(models_dir)
    raw_values = explainer.shap_values(prepared_features)
    return _normalize_shap_values(
        raw_values,
        sample_count=len(prepared_features),
        feature_count=len(artifacts.schema["feature_names"]),
        class_count=len(artifacts.label_encoder.classes_),
    )


def _global_importance_report(
    shap_tensor: np.ndarray,
    artifacts: LoadedArtifacts,
) -> dict[str, Any]:
    """Aggregate absolute impacts evenly across rows and target classes."""
    mean_absolute_impact = np.mean(np.abs(shap_tensor), axis=(0, 2))
    total_impact = float(mean_absolute_impact.sum())
    percentages = (
        mean_absolute_impact / total_impact * 100
        if total_impact > 0
        else np.zeros_like(mean_absolute_impact)
    )
    order = np.argsort(-mean_absolute_impact, kind="stable")

    running_percentage = 0.0
    ranked_features = []
    for rank, index in enumerate(order, start=1):
        contribution_percentage = float(percentages[index])
        running_percentage += contribution_percentage
        ranked_features.append(
            {
                "rank": rank,
                "feature": artifacts.schema["feature_names"][index],
                "mean_absolute_shap_impact": float(mean_absolute_impact[index]),
                "percentage_contribution": contribution_percentage,
                "cumulative_percentage": float(min(running_percentage, 100.0)),
            }
        )

    return {
        "model_version": artifacts.public_metadata["model_version"],
        "feature_schema_version": artifacts.schema["schema_version"],
        "sample_count": int(shap_tensor.shape[0]),
        "class_labels": artifacts.label_encoder.classes_.tolist(),
        "aggregation": "mean absolute SHAP averaged across samples and classes",
        "features": ranked_features,
    }


def _save_global_plots(
    prepared_features: pd.DataFrame,
    shap_tensor: np.ndarray,
    importance_report: dict[str, Any],
    artifacts: LoadedArtifacts,
    plots_dir: Path,
    max_display: int,
) -> list[Path]:
    """Generate headless SHAP summary/bar charts and a ranked top-20 chart."""
    import matplotlib

    matplotlib.use("Agg", force=True)
    import matplotlib.pyplot as plt
    import shap

    plots_dir.mkdir(parents=True, exist_ok=True)
    feature_names = artifacts.schema["feature_names"]
    values_by_class = [shap_tensor[:, :, class_index] for class_index in range(
        shap_tensor.shape[2]
    )]
    class_names = artifacts.label_encoder.classes_.tolist()
    generated_paths = []

    probability_matrix = artifacts.model.predict_proba(prepared_features)
    predicted_class_indexes = np.argmax(probability_matrix, axis=1)
    predicted_class_values = np.stack(
        [
            shap_tensor[row_index, :, class_index]
            for row_index, class_index in enumerate(predicted_class_indexes)
        ]
    )

    shap.summary_plot(
        predicted_class_values,
        prepared_features,
        feature_names=feature_names,
        plot_type="dot",
        max_display=max_display,
        show=False,
    )
    summary_path = plots_dir / SUMMARY_PLOT_FILENAME
    plt.gca().set_title("SHAP Summary for Each Position's Predicted Result")
    plt.gcf().set_size_inches(12, 8)
    plt.savefig(summary_path, dpi=180, bbox_inches="tight")
    plt.close()
    generated_paths.append(summary_path)

    shap.summary_plot(
        values_by_class,
        prepared_features,
        feature_names=feature_names,
        class_names=class_names,
        plot_type="bar",
        max_display=max_display,
        show=False,
    )
    bar_path = plots_dir / SHAP_BAR_FILENAME
    plt.gcf().set_size_inches(12, 8)
    plt.savefig(bar_path, dpi=180, bbox_inches="tight")
    plt.close()
    generated_paths.append(bar_path)

    top_features = importance_report["features"][: min(20, len(feature_names))]
    figure, axis = plt.subplots(figsize=(12, 8))
    names = [feature["feature"] for feature in reversed(top_features)]
    values = [
        feature["mean_absolute_shap_impact"] for feature in reversed(top_features)
    ]
    axis.barh(names, values, color="#3b82f6", edgecolor="#1e3a8a", linewidth=0.5)
    axis.set_title("Top 20 Features by Mean Absolute SHAP Impact")
    axis.set_xlabel("Mean absolute SHAP impact")
    axis.set_ylabel("Feature")
    axis.grid(axis="x", alpha=0.25)
    axis.set_axisbelow(True)
    figure.tight_layout()
    top_path = plots_dir / TOP_FEATURES_PLOT_FILENAME
    figure.savefig(top_path, dpi=180, bbox_inches="tight")
    plt.close(figure)
    generated_paths.append(top_path)

    return generated_paths


def generate_global_explainability(
    dataframe: pd.DataFrame,
    models_dir: Path | str = DEFAULT_MODEL_DIR,
    max_display: int = DEFAULT_PLOT_DISPLAY,
) -> dict[str, Any]:
    """Save dataset-wide SHAP importance JSON and all required plots."""
    if isinstance(max_display, bool) or not isinstance(max_display, int) or max_display < 1:
        raise ValueError("max_display must be a positive integer.")

    normalized_models_dir = _resolve_models_dir(models_dir)
    output_dir = Path(normalized_models_dir)
    artifacts = _load_artifacts(normalized_models_dir)
    prepared_features = _prepare_feature_frame(dataframe, artifacts)
    if prepared_features.empty:
        raise ValueError("Global explainability requires at least one feature row.")

    import matplotlib

    matplotlib.use("Agg", force=True)
    shap_tensor = _all_class_values(
        prepared_features, artifacts, normalized_models_dir
    )
    importance_report = _global_importance_report(shap_tensor, artifacts)
    generated_paths = _save_global_plots(
        prepared_features,
        shap_tensor,
        importance_report,
        artifacts,
        output_dir / PLOTS_DIRECTORY_NAME,
        max_display,
    )
    importance_report["plot_files"] = [path.name for path in generated_paths]
    (output_dir / GLOBAL_IMPORTANCE_FILENAME).write_text(
        json.dumps(importance_report, indent=2, allow_nan=False) + "\n",
        encoding="utf-8",
    )
    return importance_report


def main() -> None:
    """Generate global SHAP artifacts from a feature CSV."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("dataset", type=Path, help="Feature dataset CSV")
    parser.add_argument(
        "--models-dir",
        type=Path,
        default=DEFAULT_MODEL_DIR,
        help="Directory containing saved model artifacts and output files",
    )
    parser.add_argument(
        "--max-display",
        type=int,
        default=DEFAULT_PLOT_DISPLAY,
        help="Maximum features displayed in SHAP summary plots",
    )
    args = parser.parse_args()

    try:
        dataset = pd.read_csv(args.dataset)
        report = generate_global_explainability(
            dataset, args.models_dir, args.max_display
        )
    except (OSError, ValueError, RuntimeError) as exc:
        parser.error(str(exc))

    print(json.dumps(report, indent=2, allow_nan=False))


if __name__ == "__main__":
    main()
