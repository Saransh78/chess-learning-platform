"""Evaluation helpers for the offline Random Forest training pipeline."""

from typing import Any

import pandas as pd
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.preprocessing import LabelEncoder


def build_metrics(
    model: Any,
    features: pd.DataFrame,
    target: pd.Series,
    label_encoder: LabelEncoder,
    train_game_count: int,
    test_game_count: int,
    train_row_count: int,
    test_row_count: int,
) -> dict[str, Any]:
    """Return the notebook's metrics plus grouped split sizes."""
    predictions = model.predict(features)
    class_ids = list(range(len(label_encoder.classes_)))

    report = classification_report(
        target,
        predictions,
        labels=class_ids,
        target_names=label_encoder.classes_.tolist(),
        output_dict=True,
        zero_division=0,
    )
    matrix = confusion_matrix(target, predictions, labels=class_ids)
    weighted_average = report["weighted avg"]

    return {
        "accuracy": float(accuracy_score(target, predictions)),
        "precision": float(weighted_average["precision"]),
        "recall": float(weighted_average["recall"]),
        "f1": float(weighted_average["f1-score"]),
        "metric_average": "weighted",
        "class_labels": label_encoder.classes_.tolist(),
        "classification_report": report,
        "confusion_matrix": {
            "labels": label_encoder.classes_.tolist(),
            "matrix": matrix.tolist(),
        },
        "train_game_count": int(train_game_count),
        "test_game_count": int(test_game_count),
        "train_row_count": int(train_row_count),
        "test_row_count": int(test_row_count),
    }


def format_metrics_summary(metrics: dict[str, Any]) -> str:
    """Format evaluation metrics and split sizes for a readable CLI summary."""
    lines = [
        "Training complete",
        "==================",
        f"Accuracy:  {metrics['accuracy']:.4f}",
        f"Precision: {metrics['precision']:.4f} (weighted)",
        f"Recall:    {metrics['recall']:.4f} (weighted)",
        f"F1:        {metrics['f1']:.4f} (weighted)",
        "",
        "Grouped split",
        f"  Train: {metrics['train_game_count']} games / "
        f"{metrics['train_row_count']} rows",
        f"  Test:  {metrics['test_game_count']} games / "
        f"{metrics['test_row_count']} rows",
        "",
        "Per-class report",
        f"{'Class':<12} {'Precision':>9} {'Recall':>9} {'F1':>9} {'Support':>9}",
    ]

    report = metrics["classification_report"]
    for class_label in metrics["class_labels"]:
        class_metrics = report[class_label]
        lines.append(
            f"{class_label:<12} "
            f"{class_metrics['precision']:>9.3f} "
            f"{class_metrics['recall']:>9.3f} "
            f"{class_metrics['f1-score']:>9.3f} "
            f"{int(class_metrics['support']):>9}"
        )

    lines.extend(["", "Confusion matrix (rows=true, columns=predicted)"])
    lines.append("Labels: " + ", ".join(metrics["confusion_matrix"]["labels"]))
    lines.extend(
        "  " + " ".join(str(value) for value in row)
        for row in metrics["confusion_matrix"]["matrix"]
    )
    return "\n".join(lines)
