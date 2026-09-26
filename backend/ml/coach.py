"""Create personalized chess coaching from measured M5.1 pattern evidence.

This module only transforms an existing structured pattern report. It does not
analyze new positions, invoke the model, or generate unsupported advice.
"""

from collections.abc import Mapping
from statistics import fmean
from typing import Any

from jsonschema import Draft202012Validator

COACH_REPORT_SCHEMA_VERSION: int = 1
WEEK_DAYS: tuple[str, ...] = (
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
)

DEFAULT_COACHING_TEMPLATES: dict[str, dict[str, Any]] = {
    "rook_endings": {
        "title": "Rook-ending decisions are a recurring challenge",
        "why_it_matters": (
            "Across {sample_size} scored rook-ending positions, average CPL was "
            "{average_cpl:.1f} versus {comparison_average_cpl:.1f} elsewhere; "
            "{mistake_count} moves crossed the mistake threshold."
        ),
        "recommended_training_focus": (
            "Practice rook-ending calculation and active-rook choices; track "
            "mistakes against the {mistake_cpl:.0f}-CPL threshold."
        ),
        "training_activities": [
            "Review the {mistake_count} mistake-level decisions in the "
            "{sample_size}-position rook-ending sample.",
            "Practice a rook-ending conversion and record the evaluation after "
            "each critical decision.",
        ],
    },
    "pawn_islands": {
        "title": "Fragmented pawn islands coincide with higher CPL",
        "why_it_matters": (
            "The fragmented group averaged {average_cpl:.1f} CPL across "
            "{sample_size} scored positions, compared with "
            "{comparison_average_cpl:.1f} in lower-island positions."
        ),
        "recommended_training_focus": (
            "Review pawn breaks and exchanges that create separated pawn "
            "islands; compare the resulting positions with the lower-island "
            "group's measured CPL."
        ),
        "training_activities": [
            "Annotate the fragmented-island positions and identify the pawn "
            "break or exchange preceding each structure.",
            "Solve pawn-structure positions focused on preserving connected "
            "pawns, then compare your choices with the lower-island sample.",
        ],
    },
    "isolated_pawns": {
        "title": "Isolated-pawn positions have higher CPL",
        "why_it_matters": (
            "Positions with isolated pawns averaged {average_cpl:.1f} CPL "
            "across {sample_size} scored positions, versus "
            "{comparison_average_cpl:.1f} when none were present."
        ),
        "recommended_training_focus": (
            "Practice defending and creating isolated pawns; review the "
            "mistake-level decisions in the measured isolated-pawn group."
        ),
        "training_activities": [
            "Review isolated-pawn positions and annotate the exchanges that "
            "created or targeted the pawn.",
            "Practice one isolated-queen-pawn middlegame plan and check the "
            "resulting evaluation after each pawn break.",
        ],
    },
    "weakest_game_phase": {
        "title": "{phase} blunders exceed the overall rate",
        "why_it_matters": (
            "The {phase} sample had a {blunder_rate_percent:.1f}% blunder rate "
            "across {sample_size} scored positions, compared with "
            "{comparison_blunder_rate_percent:.1f}% overall."
        ),
        "recommended_training_focus": (
            "Prioritize {phase_lower} calculation and review the "
            "{blunder_count} blunder-level decisions in this phase."
        ),
        "training_activities": [
            "Review the {blunder_count} blunder-level {phase_lower} decisions "
            "against their engine alternatives.",
            "Complete a focused {phase_lower} calculation session and record "
            "CPL for each reviewed position.",
        ],
    },
    "highest_risk_move_range": {
        "title": "Blunders increase in moves {move_range}",
        "why_it_matters": (
            "Moves {move_range} had a {blunder_rate_percent:.1f}% blunder rate "
            "across {sample_size} scored positions, versus "
            "{comparison_blunder_rate_percent:.1f}% overall."
        ),
        "recommended_training_focus": (
            "Review calculation and decision quality in moves {move_range}; "
            "the sample contains {blunder_count} blunders."
        ),
        "training_activities": [
            "Analyze the {blunder_count} blunder-level decisions from moves "
            "{move_range} and record the missed candidate moves.",
            "Review a late-game position from moves {move_range} with a "
            "deliberate candidate-move checklist.",
        ],
    },
}

COACH_REPORT_SCHEMA: dict[str, Any] = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "required": [
        "schema_version",
        "executive_summary",
        "strengths",
        "weaknesses",
        "phase_analysis",
        "tactical_focus",
        "training_plan",
    ],
    "properties": {
        "schema_version": {"const": COACH_REPORT_SCHEMA_VERSION},
        "executive_summary": {"$ref": "#/$defs/executive_summary"},
        "strengths": {"$ref": "#/$defs/strength_section"},
        "weaknesses": {"$ref": "#/$defs/weakness_section"},
        "phase_analysis": {"$ref": "#/$defs/phase_analysis"},
        "tactical_focus": {"$ref": "#/$defs/tactical_focus"},
        "training_plan": {"$ref": "#/$defs/training_plan"},
    },
    "$defs": {
        "confidence": {"type": "number", "minimum": 0, "maximum": 1},
        "evidence": {"type": "object"},
        "nullable_finding": {
            "oneOf": [
                {"type": "null"},
                {
                    "type": "object",
                    "required": ["title", "confidence", "evidence", "supporting_metric"],
                    "properties": {
                        "title": {"type": "string"},
                        "confidence": {"$ref": "#/$defs/confidence"},
                        "evidence": {"$ref": "#/$defs/evidence"},
                        "supporting_metric": {"$ref": "#/$defs/evidence"},
                    },
                },
            ]
        },
        "executive_summary": {
            "type": "object",
            "required": [
                "confidence", "games_analyzed", "positions_analyzed",
                "strongest_area", "weakest_area", "primary_coaching_focus",
            ],
            "properties": {
                "confidence": {"$ref": "#/$defs/confidence"},
                "games_analyzed": {"type": "integer", "minimum": 0},
                "positions_analyzed": {"type": "integer", "minimum": 0},
                "strongest_area": {"$ref": "#/$defs/nullable_finding"},
                "weakest_area": {"$ref": "#/$defs/nullable_finding"},
                "primary_coaching_focus": {"$ref": "#/$defs/nullable_finding"},
            },
        },
        "strength": {
            "type": "object",
            "required": ["title", "evidence", "confidence", "supporting_metric"],
            "properties": {
                "rank": {"type": "integer", "minimum": 1, "maximum": 3},
                "title": {"type": "string"},
                "evidence": {"$ref": "#/$defs/evidence"},
                "confidence": {"$ref": "#/$defs/confidence"},
                "supporting_metric": {"$ref": "#/$defs/evidence"},
            },
        },
        "strength_section": {
            "type": "object",
            "required": ["confidence", "status", "items"],
            "properties": {
                "confidence": {"$ref": "#/$defs/confidence"},
                "status": {"enum": ["supported", "insufficient_evidence"]},
                "items": {
                    "type": "array", "maxItems": 3,
                    "items": {"$ref": "#/$defs/strength"},
                },
            },
        },
        "weakness": {
            "type": "object",
            "required": [
                "rank", "title", "why_it_matters", "supporting_metric",
                "confidence", "recommended_training_focus", "evidence",
                "evidence_status",
            ],
            "properties": {
                "rank": {"type": "integer", "minimum": 1},
                "title": {"type": "string"},
                "why_it_matters": {"type": "string"},
                "supporting_metric": {"$ref": "#/$defs/evidence"},
                "confidence": {"$ref": "#/$defs/confidence"},
                "evidence_status": {"enum": ["adequate", "low_sample"]},
                "severity_score": {"type": "number", "minimum": 0, "maximum": 100},
                "recommended_training_focus": {"type": "string"},
                "evidence": {"$ref": "#/$defs/evidence"},
                "training_activities": {"type": "array", "items": {"type": "string"}},
            },
        },
        "weakness_section": {
            "type": "object",
            "required": ["confidence", "status", "items"],
            "properties": {
                "confidence": {"$ref": "#/$defs/confidence"},
                "status": {"enum": ["supported", "low_confidence", "insufficient_evidence"]},
                "items": {"type": "array", "items": {"$ref": "#/$defs/weakness"}},
            },
        },
        "phase_finding": {
            "type": "object",
            "required": ["confidence", "status", "summary", "actionable_advice", "evidence"],
            "properties": {
                "confidence": {"$ref": "#/$defs/confidence"},
                "status": {"enum": ["supported", "insufficient_evidence"]},
                "summary": {"type": ["string", "null"]},
                "actionable_advice": {"type": ["string", "null"]},
                "evidence": {"$ref": "#/$defs/evidence"},
            },
        },
        "phase_analysis": {
            "type": "object",
            "required": ["confidence", "weakest_phase", "phases"],
            "properties": {
                "confidence": {"$ref": "#/$defs/confidence"},
                "weakest_phase": {"type": ["string", "null"]},
                "phases": {
                    "type": "object",
                    "required": ["Opening", "Middlegame", "Endgame"],
                    "properties": {
                        "Opening": {"$ref": "#/$defs/phase_finding"},
                        "Middlegame": {"$ref": "#/$defs/phase_finding"},
                        "Endgame": {"$ref": "#/$defs/phase_finding"},
                    },
                },
            },
        },
        "tactical_assessment": {
            "type": "object",
            "required": ["area", "status", "confidence", "evidence"],
            "properties": {
                "area": {"type": "string"},
                "status": {"enum": ["supported", "no_supported_pattern", "insufficient_evidence"]},
                "confidence": {"$ref": "#/$defs/confidence"},
                "evidence": {"$ref": "#/$defs/evidence"},
            },
        },
        "tactical_item": {
            "type": "object",
            "required": ["title", "recommendation", "confidence", "evidence"],
            "properties": {
                "title": {"type": "string"},
                "recommendation": {"type": "string"},
                "confidence": {"$ref": "#/$defs/confidence"},
                "evidence": {"$ref": "#/$defs/evidence"},
            },
        },
        "tactical_focus": {
            "type": "object",
            "required": ["confidence", "items", "assessments"],
            "properties": {
                "confidence": {"$ref": "#/$defs/confidence"},
                "items": {"type": "array", "items": {"$ref": "#/$defs/tactical_item"}},
                "assessments": {"type": "array", "items": {"$ref": "#/$defs/tactical_assessment"}},
            },
        },
        "training_day": {
            "type": "object",
            "required": ["day", "focus", "activity", "confidence", "evidence", "status"],
            "properties": {
                "day": {
                    "enum": [
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                        "Sunday",
                    ]
                },
                "focus": {"type": ["string", "null"]},
                "activity": {"type": ["string", "null"]},
                "confidence": {"$ref": "#/$defs/confidence"},
                "evidence": {"$ref": "#/$defs/evidence"},
                "status": {"enum": ["evidence_backed", "low_confidence", "insufficient_evidence"]},
            },
        },
        "training_plan": {
            "type": "object",
            "required": ["confidence", "days"],
            "properties": {
                "confidence": {"$ref": "#/$defs/confidence"},
                "days": {
                    "type": "array", "minItems": 7, "maxItems": 7,
                    "items": {"$ref": "#/$defs/training_day"},
                },
            },
        },
    },
}
Draft202012Validator.check_schema(COACH_REPORT_SCHEMA)

DEFAULT_COACHING_TEMPLATES: dict[str, dict[str, Any]] = {
    "rook_endings": {
        "title": "Rook-ending decisions are a recurring challenge",
        "why_it_matters": (
            "Across {sample_size} scored rook-ending positions, average CPL was "
            "{average_cpl:.1f} versus {comparison_average_cpl:.1f} elsewhere; "
            "{mistake_count} moves crossed the mistake threshold."
        ),
        "recommended_training_focus": (
            "Practice rook-ending calculation and active-rook choices; track "
            "mistakes against the {mistake_cpl:.0f}-CPL threshold."
        ),
        "training_activities": [
            "Review the {mistake_count} mistake-level decisions in the "
            "{sample_size}-position rook-ending sample.",
            "Practice a rook-ending conversion and record the evaluation after "
            "each critical decision.",
        ],
    },
    "pawn_islands": {
        "title": "Fragmented pawn islands coincide with higher CPL",
        "why_it_matters": (
            "The fragmented group averaged {average_cpl:.1f} CPL across "
            "{sample_size} scored positions, compared with "
            "{comparison_average_cpl:.1f} in lower-island positions."
        ),
        "recommended_training_focus": (
            "Review pawn breaks and exchanges that create separated pawn "
            "islands; compare the resulting positions with the lower-island "
            "group's measured CPL."
        ),
        "training_activities": [
            "Annotate fragmented-island positions and identify the pawn break "
            "or exchange preceding each structure.",
            "Practice pawn-structure positions focused on preserving connected "
            "pawns, then compare with the lower-island sample.",
        ],
    },
    "isolated_pawns": {
        "title": "Isolated-pawn positions have higher CPL",
        "why_it_matters": (
            "Positions with isolated pawns averaged {average_cpl:.1f} CPL "
            "across {sample_size} scored positions, versus "
            "{comparison_average_cpl:.1f} when none were present."
        ),
        "recommended_training_focus": (
            "Practice defending and creating isolated pawns; review the "
            "mistake-level decisions in the measured isolated-pawn group."
        ),
        "training_activities": [
            "Review isolated-pawn positions and annotate the exchanges that "
            "created or targeted the pawn.",
            "Practice an isolated-pawn middlegame plan and check the resulting "
            "evaluation after each pawn break.",
        ],
    },
    "weakest_game_phase": {
        "title": "{phase} blunders exceed the overall rate",
        "why_it_matters": (
            "The {phase} sample had a {blunder_rate_percent:.1f}% blunder rate "
            "across {sample_size} scored positions, compared with "
            "{comparison_blunder_rate_percent:.1f}% overall."
        ),
        "recommended_training_focus": (
            "Prioritize {phase_lower} calculation and review the "
            "{blunder_count} blunder-level decisions in this phase."
        ),
        "training_activities": [
            "Review the {blunder_count} blunder-level {phase_lower} decisions "
            "against their engine alternatives.",
            "Complete a focused {phase_lower} calculation session and record "
            "CPL for each reviewed position.",
        ],
    },
    "highest_risk_move_range": {
        "title": "Blunders increase in moves {move_range}",
        "why_it_matters": (
            "Moves {move_range} had a {blunder_rate_percent:.1f}% blunder rate "
            "across {sample_size} scored positions, versus "
            "{comparison_blunder_rate_percent:.1f}% overall."
        ),
        "recommended_training_focus": (
            "Review calculation and decision quality in moves {move_range}; "
            "the sample contains {blunder_count} blunders."
        ),
        "training_activities": [
            "Analyze the {blunder_count} blunder-level decisions from moves "
            "{move_range} and record the missed candidate moves.",
            "Review a late-game position from moves {move_range} with a "
            "deliberate candidate-move checklist.",
        ],
    },
}
Draft202012Validator.check_schema(COACH_REPORT_SCHEMA)


class _TemplateContext(dict[str, Any]):
    """Format template placeholders without inventing missing metric values."""

    def __missing__(self, key: str) -> str:
        return f"[{key} unavailable]"


def _mapping(value: Any) -> Mapping[str, Any]:
    """Safely view a mapping or return an empty mapping for absent sections."""
    return value if isinstance(value, Mapping) else {}


def _finite_number(value: Any) -> float | None:
    """Read finite numeric evidence without leaking NaN into the JSON report."""
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return None
    number = float(value)
    return number if number == number and abs(number) != float("inf") else None


def _nonnegative_integer(value: Any, default: int = 0) -> int:
    """Read a nonnegative count from partially populated JSON safely."""
    number = _finite_number(value)
    if number is None or number < 0:
        return default
    return int(number)


def _unit_confidence(value: Any, fallback_sample: int, minimum_sample: int) -> float:
    """Use saved support confidence or the M5.1 support formula as a fallback."""
    explicit = _finite_number(value)
    if explicit is not None:
        return max(0.0, min(explicit, 1.0))
    if fallback_sample <= 0:
        return 0.0
    return fallback_sample / (fallback_sample + max(minimum_sample, 1))


def _section_confidence(items: list[Mapping[str, Any]]) -> float:
    """Summarize item confidence without overclaiming beyond the weakest item."""
    values = [
        confidence
        for item in items
        if (confidence := _finite_number(item.get("confidence"))) is not None
    ]
    return min(values) if values else 0.0


def _coaching_templates(
    overrides: Mapping[str, Mapping[str, Any]] | None,
) -> dict[str, dict[str, Any]]:
    """Copy defaults and apply caller-provided phrasing overrides."""
    templates = {
        key: dict(value) for key, value in DEFAULT_COACHING_TEMPLATES.items()
    }
    if overrides is None:
        return templates
    for key, override in overrides.items():
        if key not in templates or not isinstance(override, Mapping):
            continue
        templates[key].update(override)
    return templates


def _template_key(pattern: str) -> tuple[str | None, str | None]:
    """Map M5.1 pattern identifiers to approved evidence-based templates."""
    if pattern.startswith("rook_endings:"):
        return "rook_endings", None
    if pattern.startswith("pawn_islands:"):
        return "pawn_islands", None
    if pattern.startswith("isolated_pawns:"):
        return "isolated_pawns", None
    if pattern.startswith("weakest_game_phase:"):
        return "weakest_game_phase", pattern.split(":", maxsplit=1)[1]
    if pattern.startswith("highest_risk_move_range:"):
        return "highest_risk_move_range", pattern.split(":", maxsplit=1)[1]
    return None, None


def _comparison_for_pattern(
    pattern: str, pattern_report: Mapping[str, Any]
) -> tuple[str, Mapping[str, Any]]:
    """Find an existing report group used for a measured comparison."""
    if pattern.startswith("rook_endings:"):
        group = _mapping(
            _mapping(
                _mapping(pattern_report.get("material_imbalance_analysis")).get(
                    "rook_endings"
                )
            ).get("groups")
        ).get("absent")
        return "positions without rook endings", _mapping(group)
    if pattern.startswith("pawn_islands:"):
        group = _mapping(
            _mapping(
                _mapping(pattern_report.get("pawn_structure_analysis")).get(
                    "pawn_islands"
                )
            ).get("groups")
        ).get("lower_island_count")
        return "lower-island positions", _mapping(group)
    if pattern.startswith("isolated_pawns:"):
        group = _mapping(
            _mapping(
                _mapping(pattern_report.get("pawn_structure_analysis")).get(
                    "isolated_pawns"
                )
            ).get("groups")
        ).get("absent")
        return "positions without isolated pawns", _mapping(group)
    overall = _mapping(pattern_report.get("overall"))
    return "overall positions", {
        "positions": overall.get("positions"),
        "sample_size": overall.get("scored_positions"),
        "average_centipawn_loss": overall.get("average_cpl"),
        "mistake_count": overall.get("mistake_count"),
        "mistake_rate": overall.get("mistake_rate"),
        "blunder_count": overall.get("blunder_count"),
        "blunder_rate": overall.get("blunder_rate"),
    }


def _context_for_pattern(
    pattern: str,
    pattern_item: Mapping[str, Any],
    comparison: Mapping[str, Any],
    mistake_cpl: float,
) -> dict[str, Any]:
    """Build template variables only from report metrics and configured limits."""
    metrics = _mapping(pattern_item.get("metrics"))
    average_cpl = _finite_number(
        metrics.get("average_centipawn_loss", metrics.get("average_cpl"))
    )
    comparison_cpl = _finite_number(comparison.get("average_centipawn_loss"))
    mistake_rate = _finite_number(metrics.get("mistake_rate"))
    blunder_rate = _finite_number(metrics.get("blunder_rate"))
    comparison_mistake_rate = _finite_number(comparison.get("mistake_rate"))
    comparison_blunder_rate = _finite_number(comparison.get("blunder_rate"))
    context: dict[str, Any] = {
        "sample_size": _nonnegative_integer(pattern_item.get("sample_size")),
        "average_cpl": average_cpl,
        "comparison_average_cpl": comparison_cpl,
        "mistake_count": _nonnegative_integer(metrics.get("mistake_count")),
        "blunder_count": _nonnegative_integer(metrics.get("blunder_count")),
        "mistake_rate_percent": 100.0 * mistake_rate if mistake_rate is not None else None,
        "blunder_rate_percent": 100.0 * blunder_rate if blunder_rate is not None else None,
        "comparison_mistake_rate_percent": (
            100.0 * comparison_mistake_rate
            if comparison_mistake_rate is not None
            else None
        ),
        "comparison_blunder_rate_percent": (
            100.0 * comparison_blunder_rate
            if comparison_blunder_rate is not None
            else None
        ),
        "mistake_cpl": mistake_cpl,
    }
    template_key, dynamic_value = _template_key(pattern)
    if template_key == "weakest_game_phase":
        context["phase"] = dynamic_value or "game phase"
        context["phase_lower"] = (dynamic_value or "game phase").lower()
    elif template_key == "highest_risk_move_range":
        context["move_range"] = dynamic_value or "the observed range"
    return context


def _template_has_required_evidence(
    template_key: str, context: Mapping[str, Any]
) -> bool:
    """Only render a default recommendation when all referenced metrics exist."""
    required_context = {
        "rook_endings": (
            "sample_size", "average_cpl", "comparison_average_cpl", "mistake_count"
        ),
        "pawn_islands": ("sample_size", "average_cpl", "comparison_average_cpl"),
        "isolated_pawns": ("sample_size", "average_cpl", "comparison_average_cpl"),
        "weakest_game_phase": (
            "sample_size", "blunder_count", "blunder_rate_percent",
            "comparison_blunder_rate_percent",
        ),
        "highest_risk_move_range": (
            "sample_size", "blunder_count", "blunder_rate_percent",
            "comparison_blunder_rate_percent",
        ),
    }
    return all(
        _finite_number(context.get(key)) is not None
        for key in required_context.get(template_key, ())
    )


def _pattern_consistency(
    observed: Mapping[str, Any], comparison: Mapping[str, Any]
) -> float:
    """Measure agreement among CPL, mistake-rate, and blunder-rate directions."""
    metric_pairs = (
        (
            _finite_number(
                observed.get("average_centipawn_loss", observed.get("average_cpl"))
            ),
            _finite_number(comparison.get("average_centipawn_loss")),
        ),
        (
            _finite_number(observed.get("mistake_rate")),
            _finite_number(comparison.get("mistake_rate")),
        ),
        (
            _finite_number(observed.get("blunder_rate")),
            _finite_number(comparison.get("blunder_rate")),
        ),
    )
    directions = [
        left >= right
        for left, right in metric_pairs
        if left is not None and right is not None
    ]
    if not directions:
        return 0.0
    weak_direction = sum(directions) / len(directions)
    return max(weak_direction, 1.0 - weak_direction)


def _strength_consistency(
    observed: Mapping[str, Any], comparison: Mapping[str, Any]
) -> float:
    """Score how consistently CPL, mistake, and blunder rates favor a group."""
    metric_pairs = (
        (
            _finite_number(
                observed.get("average_centipawn_loss", observed.get("average_cpl"))
            ),
            _finite_number(comparison.get("average_centipawn_loss")),
        ),
        (
            _finite_number(observed.get("mistake_rate")),
            _finite_number(comparison.get("mistake_rate")),
        ),
        (
            _finite_number(observed.get("blunder_rate")),
            _finite_number(comparison.get("blunder_rate")),
        ),
    )
    comparisons = [
        left <= right
        for left, right in metric_pairs
        if left is not None and right is not None
    ]
    return fmean(comparisons) if comparisons else 0.0


def _weakness_confidence(
    pattern_item: Mapping[str, Any],
    metrics: Mapping[str, Any],
    comparison: Mapping[str, Any],
    sample_size: int,
    minimum_sample: int,
) -> tuple[float, dict[str, float]]:
    """Combine support, severity, and recurring/consistent signals conservatively."""
    sample_support = _unit_confidence(None, sample_size, minimum_sample)
    reported_support = _unit_confidence(
        pattern_item.get("confidence"), sample_size, minimum_sample
    )
    support = min(sample_support, reported_support)
    severity = _finite_number(pattern_item.get("severity_score")) or 0.0
    severity_component = min(max(severity / 20.0, 0.0), 1.0)
    mistake_count = _nonnegative_integer(metrics.get("mistake_count"))
    recurrence_component = min(mistake_count / max(minimum_sample, 1), 1.0)
    consistency_component = _pattern_consistency(metrics, comparison)
    repeatability = (recurrence_component + consistency_component) / 2.0
    confidence_multiplier = (
        0.5 + 0.25 * severity_component + 0.25 * repeatability
    )
    confidence = support * confidence_multiplier

    return confidence, {
        "sample_support": support,
        "severity_component": severity_component,
        "recurrence_component": recurrence_component,
        "consistency_component": consistency_component,
        "confidence_multiplier": confidence_multiplier,
    }


def _evidence_comparison(
    comparison_name: str,
    comparison: Mapping[str, Any],
) -> dict[str, Any]:
    """Project only measured comparison fields into evidence payloads."""
    fields = (
        "positions",
        "sample_size",
        "average_centipawn_loss",
        "mistake_count",
        "mistake_rate",
        "blunder_count",
        "blunder_rate",
        "average_evaluation_loss",
        "average_mobility",
    )
    return {
        "group": comparison_name,
        **{field: comparison.get(field) for field in fields if field in comparison},
    }


def _build_weaknesses(
    pattern_report: Mapping[str, Any],
    templates: Mapping[str, Mapping[str, Any]],
    minimum_sample: int,
    mistake_cpl: float,
) -> tuple[list[dict[str, Any]], dict[str, dict[str, Any]]]:
    """Turn supported M5.1 findings into ranked coaching recommendations."""
    report_patterns = pattern_report.get("patterns")
    if not isinstance(report_patterns, list):
        return [], {}

    weaknesses: list[dict[str, Any]] = []
    activities_by_pattern: dict[str, dict[str, Any]] = {}

    for item in sorted(
        (value for value in report_patterns if isinstance(value, Mapping)),
        key=lambda value: _finite_number(value.get("severity_score")) or 0.0,
        reverse=True,
    ):
        pattern = item.get("pattern")
        if not isinstance(pattern, str):
            continue
        template_key, _ = _template_key(pattern)
        template = templates.get(template_key or "")
        if template is None:
            continue

        raw_metrics = _mapping(item.get("metrics"))
        average_cpl = _finite_number(
            raw_metrics.get("average_centipawn_loss", raw_metrics.get("average_cpl"))
        )
        sample_size = _nonnegative_integer(item.get("sample_size"))
        if average_cpl is None or sample_size <= 0:
            continue

        comparison_name, comparison = _comparison_for_pattern(
            pattern, pattern_report
        )

        comparison_cpl = _finite_number(comparison.get("average_centipawn_loss"))
        if comparison_cpl is None:
            continue

        context = _context_for_pattern(pattern, item, comparison, mistake_cpl)
        if not _template_has_required_evidence(template_key or "", context):
            continue
        title_template = template.get("title")
        why_template = template.get("why_it_matters")
        focus_template = template.get("recommended_training_focus")
        activities_template = template.get("training_activities", [])
        if not all(
            isinstance(value, str)
            for value in (title_template, why_template, focus_template)
        ):
            continue
        if not isinstance(activities_template, list) or not all(
            isinstance(activity, str) for activity in activities_template
        ):
            activities_template = []

        context_values = _TemplateContext(context)
        try:
            title = title_template.format_map(context_values)
            why = why_template.format_map(context_values)
            training_focus = focus_template.format_map(context_values)
            activities = [
                activity.format_map(context_values)
                for activity in activities_template
            ]
        except (KeyError, TypeError, ValueError) as exc:
            raise ValueError(f"Invalid coaching template for {template_key!r}.") from exc
        rendered_values = [title, why, training_focus, *activities]
        if any("[" in value and " unavailable]" in value for value in rendered_values):
            continue
        reported_severity = min(
            max(_finite_number(item.get("severity_score")) or 0.0, 0.0), 100.0
        )
        confidence, confidence_components = _weakness_confidence(
            item, raw_metrics, comparison, sample_size, minimum_sample
        )
        reported_confidence = _unit_confidence(
            item.get("confidence"), sample_size, minimum_sample
        )
        severity = (
            reported_severity * confidence / reported_confidence
            if reported_confidence > 0
            else 0.0
        )
        evidence_status = (
            "adequate" if sample_size >= minimum_sample else "low_sample"
        )
        if evidence_status == "low_sample":
            title = f"Limited-sample signal: {title}"
            why = f"This finding is based on a small sample. {why}"
        comparison_evidence = _evidence_comparison(comparison_name, comparison)
        metrics_evidence = {
            key: raw_metrics.get(key)
            for key in (
                "positions",
                "sample_size",
                "average_centipawn_loss",
                "average_cpl",
                "mistake_count",
                "mistake_rate",
                "blunder_count",
                "blunder_rate",
                "average_confidence",
                "average_mobility",
                "average_evaluation_loss",
            )
            if key in raw_metrics
        }
        evidence = {
            "pattern": pattern,
            "sample_size": sample_size,
            "severity_score": severity,
            "evidence_status": evidence_status,
            "confidence_components": confidence_components,
            "metrics": metrics_evidence,
            "comparison": comparison_evidence,
        }
        supporting_metric = {
            "name": "average_centipawn_loss",
            "unit": "centipawns",
            "value": average_cpl,
            "comparison_group": comparison_name,
            "comparison_value": comparison_cpl,
            "difference": average_cpl - comparison_cpl,
            "sample_size": sample_size,
        }
        weakness = {
            "rank": len(weaknesses) + 1,
            "title": title,
            "why_it_matters": why,
            "supporting_metric": supporting_metric,
            "confidence": confidence,
            "severity_score": severity,
            "evidence_status": evidence_status,
            "recommended_training_focus": training_focus,
            "training_activities": activities,
            "evidence": evidence,
        }
        weaknesses.append(weakness)
        activities_by_pattern[pattern] = {"activities": activities}

    weaknesses.sort(
        key=lambda item: (
            -item["severity_score"],
            -item["confidence"],
            -item["evidence"]["sample_size"],
            item["evidence"]["pattern"],
        )
    )
    for rank, weakness in enumerate(weaknesses, start=1):
        weakness["rank"] = rank
    return weaknesses, activities_by_pattern


def _strength_candidate(
    title: str,
    dimension: str,
    observed_group: str,
    observed: Mapping[str, Any],
    comparison_group: str,
    comparison: Mapping[str, Any],
    minimum_sample: int,
) -> dict[str, Any] | None:
    """Describe a measured lower-CPL group without implying causation."""
    observed_cpl = _finite_number(observed.get("average_centipawn_loss"))
    comparison_cpl = _finite_number(comparison.get("average_centipawn_loss"))
    observed_n = _nonnegative_integer(observed.get("sample_size"))
    comparison_n = _nonnegative_integer(comparison.get("sample_size"))
    if (
        observed_cpl is None
        or comparison_cpl is None
        or observed_cpl >= comparison_cpl
        or min(observed_n, comparison_n) < minimum_sample
    ):
        return None

    sample_support = min(
        _unit_confidence(None, observed_n, minimum_sample),
        _unit_confidence(None, comparison_n, minimum_sample),
    )
    consistency = _strength_consistency(observed, comparison)
    confidence_multiplier = 0.75 + 0.25 * consistency
    confidence = sample_support * confidence_multiplier
    improvement = comparison_cpl - observed_cpl
    return {
        "title": title,
        "dimension": dimension,
        "confidence": confidence,
        "improvement": improvement,
        "sample_size": observed_n,
        "evidence": {
            "observed_group": observed_group,
            "comparison_group": comparison_group,
            "observed": {
                "sample_size": observed_n,
                "average_cpl": observed_cpl,
                "mistake_rate": observed.get("mistake_rate"),
                "blunder_rate": observed.get("blunder_rate"),
            },
            "comparison": {
                "sample_size": comparison_n,
                "average_cpl": comparison_cpl,
                "mistake_rate": comparison.get("mistake_rate"),
                "blunder_rate": comparison.get("blunder_rate"),
            },
            "confidence_components": {
                "sample_support": sample_support,
                "metric_consistency": consistency,
                "confidence_multiplier": confidence_multiplier,
            },
        },
        "supporting_metric": {
            "name": "average_centipawn_loss",
            "unit": "centipawns",
            "value": observed_cpl,
            "comparison_value": comparison_cpl,
            "lower_by": improvement,
            "sample_size": observed_n,
        },
    }


def _build_strengths(
    pattern_report: Mapping[str, Any], minimum_sample: int
) -> list[dict[str, Any]]:
    """Select the three strongest evidence-backed comparisons when available."""
    candidates: list[dict[str, Any]] = []
    overall = _mapping(pattern_report.get("overall"))
    phase_analysis = _mapping(pattern_report.get("game_phase_analysis"))
    opening = _mapping(_mapping(phase_analysis.get("phases")).get("Opening"))
    candidate = _strength_candidate(
        "Opening positions show lower CPL than the full-game baseline",
        "game_phase",
        "Opening",
        opening,
        "overall positions",
        overall,
        minimum_sample,
    )
    if candidate is not None:
        candidates.append(candidate)

    material = _mapping(pattern_report.get("material_imbalance_analysis"))
    bishop_pair_groups = _mapping(
        _mapping(material.get("bishop_pair")).get("groups")
    )
    candidate = _strength_candidate(
        "Bishop-pair positions show lower CPL",
        "bishop_pair",
        "bishop pair present",
        _mapping(bishop_pair_groups.get("present")),
        "bishop pair absent",
        _mapping(bishop_pair_groups.get("absent")),
        minimum_sample,
    )
    if candidate is not None:
        candidates.append(candidate)

    pawn_structure = _mapping(pattern_report.get("pawn_structure_analysis"))
    isolated_groups = _mapping(
        _mapping(pawn_structure.get("isolated_pawns")).get("groups")
    )
    candidate = _strength_candidate(
        "Positions without isolated pawns show lower CPL",
        "pawn_structure",
        "isolated pawns absent",
        _mapping(isolated_groups.get("absent")),
        "isolated pawns present",
        _mapping(isolated_groups.get("present")),
        minimum_sample,
    )
    if candidate is not None:
        candidates.append(candidate)

    major_groups = _mapping(
        _mapping(material.get("major_piece_imbalance")).get("groups")
    )
    candidate = _strength_candidate(
        "Major-piece-imbalance positions show lower CPL",
        "material_imbalance",
        "major-piece imbalance present",
        _mapping(major_groups.get("present")),
        "major-piece imbalance absent",
        _mapping(major_groups.get("absent")),
        minimum_sample,
    )
    if candidate is not None:
        candidates.append(candidate)

    candidates.sort(
        key=lambda item: (
            -(item["improvement"] * item["confidence"]),
            -item["sample_size"],
            item["dimension"],
        )
    )
    strengths = []
    for candidate in candidates[:3]:
        strengths.append(
            {
                "rank": len(strengths) + 1,
                "title": candidate["title"],
                "evidence": candidate["evidence"],
                "confidence": candidate["confidence"],
                "supporting_metric": candidate["supporting_metric"],
            }
        )
    return strengths


def _phase_coaching(
    pattern_report: Mapping[str, Any], minimum_sample: int
) -> dict[str, Any]:
    """Create evidence-backed, actionable summaries for all three phases."""
    phase_section = _mapping(pattern_report.get("game_phase_analysis"))
    phase_groups = _mapping(phase_section.get("phases"))
    overall = _mapping(pattern_report.get("overall"))
    overall_cpl = _finite_number(overall.get("average_cpl"))
    overall_mistake_rate = _finite_number(overall.get("mistake_rate"))
    overall_blunder_rate = _finite_number(overall.get("blunder_rate"))
    weakest_phase = phase_section.get("weakest_phase")
    phases: dict[str, dict[str, Any]] = {}

    for phase in ("Opening", "Middlegame", "Endgame"):
        metrics = _mapping(phase_groups.get(phase))
        sample_size = _nonnegative_integer(metrics.get("sample_size"))
        average_cpl = _finite_number(metrics.get("average_centipawn_loss"))
        mistake_rate = _finite_number(metrics.get("mistake_rate"))
        blunder_rate = _finite_number(metrics.get("blunder_rate"))
        phase_consistency = _pattern_consistency(
            {
                "average_centipawn_loss": average_cpl,
                "mistake_rate": mistake_rate,
                "blunder_rate": blunder_rate,
            },
            {
                "average_centipawn_loss": overall_cpl,
                "mistake_rate": overall_mistake_rate,
                "blunder_rate": overall_blunder_rate,
            },
        )
        phase_support = _unit_confidence(None, sample_size, minimum_sample)
        confidence_multiplier = 0.75 + 0.25 * phase_consistency
        confidence = phase_support * confidence_multiplier
        adequate = sample_size >= minimum_sample and average_cpl is not None

        evidence = {
            "phase": phase,
            "positions": _nonnegative_integer(metrics.get("positions")),
            "sample_size": sample_size,
            "average_cpl": average_cpl,
            "overall_average_cpl": overall_cpl,
            "mistake_count": _nonnegative_integer(metrics.get("mistake_count")),
            "mistake_rate": mistake_rate,
            "overall_mistake_rate": overall_mistake_rate,
            "blunder_count": _nonnegative_integer(metrics.get("blunder_count")),
            "blunder_rate": blunder_rate,
            "overall_blunder_rate": overall_blunder_rate,
            "average_confidence": _finite_number(metrics.get("average_confidence")),
            "average_mobility": _finite_number(metrics.get("average_mobility")),
            "confidence_components": {
                "sample_support": phase_support,
                "metric_consistency": phase_consistency,
                "confidence_multiplier": confidence_multiplier,
            },
        }

        summary: str | None = None
        advice: str | None = None
        if adequate:
            if overall_cpl is not None:
                cpl_comparison = (
                    "below" if average_cpl < overall_cpl else "above or level with"
                )
                summary = (
                    f"{phase} positions averaged {average_cpl:.1f} CPL, "
                    f"{cpl_comparison} the {overall_cpl:.1f} overall average."
                )
            if phase == "Opening":
                if mistake_rate is not None and overall_mistake_rate is not None:
                    advice = (
                        f"Review the {evidence['mistake_count']} opening moves at or "
                        f"above the mistake threshold; the phase mistake rate is "
                        f"{mistake_rate:.1%} versus {overall_mistake_rate:.1%} overall."
                    )
            elif phase == "Middlegame":
                if mistake_rate is not None and overall_mistake_rate is not None:
                    advice = (
                        f"Use a candidate-move checklist in middlegames; the measured "
                        f"mistake rate is {mistake_rate:.1%} versus "
                        f"{overall_mistake_rate:.1%} overall across {sample_size} positions."
                    )
            elif blunder_rate is not None and overall_blunder_rate is not None:
                advice = (
                    f"Prioritize endgame calculation review: {evidence['blunder_count']} "
                    f"blunders in {sample_size} scored positions ({blunder_rate:.1%}, "
                    f"versus {overall_blunder_rate:.1%} overall)."
                )

        phases[phase] = {
            "confidence": confidence,
            "status": "supported" if adequate else "insufficient_evidence",
            "summary": summary,
            "actionable_advice": advice,
            "evidence": evidence,
        }

    phase_confidences = [phase["confidence"] for phase in phases.values()]
    return {
        "confidence": fmean(phase_confidences) if phase_confidences else 0.0,
        "weakest_phase": weakest_phase if isinstance(weakest_phase, str) else None,
        "phases": phases,
    }


def _tactical_focus(
    pattern_report: Mapping[str, Any],
    weaknesses: list[dict[str, Any]],
    minimum_sample: int,
    minimum_cpl_delta: float,
    minimum_rate_delta: float,
) -> dict[str, Any]:
    """Coach mobility, king-safety proxies, and material trends only when supported."""
    mobility_report = _mapping(pattern_report.get("mobility_analysis"))
    quartiles = _mapping(mobility_report.get("quartiles"))
    low = _mapping(quartiles.get("Q1"))
    high = _mapping(quartiles.get("Q4"))
    low_n = _nonnegative_integer(low.get("sample_size"))
    high_n = _nonnegative_integer(high.get("sample_size"))
    mobility_confidence = min(
        _unit_confidence(None, low_n, minimum_sample),
        _unit_confidence(None, high_n, minimum_sample),
    )
    mobility_supported = bool(
        mobility_report.get("reduced_mobility_precedes_mistakes")
        and low_n >= minimum_sample
        and high_n >= minimum_sample
    )
    assessments: list[dict[str, Any]] = [
        {
            "area": "mobility",
            "status": "supported" if mobility_supported else (
                "no_supported_pattern"
                if low_n >= minimum_sample and high_n >= minimum_sample
                else "insufficient_evidence"
            ),
            "confidence": mobility_confidence,
            "evidence": {
                "low_mobility_quartile": {
                    "sample_size": low_n,
                    "average_cpl": _finite_number(low.get("average_centipawn_loss")),
                    "mistake_rate": _finite_number(low.get("mistake_rate")),
                },
                "high_mobility_quartile": {
                    "sample_size": high_n,
                    "average_cpl": _finite_number(high.get("average_centipawn_loss")),
                    "mistake_rate": _finite_number(high.get("mistake_rate")),
                },
            },
        }
    ]

    castling_report = _mapping(pattern_report.get("castling_analysis"))
    castling_details: dict[str, Any] = {}
    castling_confidences: list[float] = []
    castling_supported = False
    for color in ("White", "Black"):
        color_metrics = _mapping(castling_report.get(color))
        castled = _mapping(color_metrics.get("castled"))
        uncastled = _mapping(color_metrics.get("uncastled"))
        castled_n = _nonnegative_integer(castled.get("sample_size"))
        uncastled_n = _nonnegative_integer(uncastled.get("sample_size"))
        confidence = min(
            _unit_confidence(None, castled_n, minimum_sample),
            _unit_confidence(None, uncastled_n, minimum_sample),
        )
        castling_confidences.append(confidence)
        castled_rate = _finite_number(castled.get("blunder_frequency"))
        uncastled_rate = _finite_number(uncastled.get("blunder_frequency"))
        adverse_cpl = (
            _finite_number(uncastled.get("average_evaluation_loss"))
            - _finite_number(castled.get("average_evaluation_loss"))
            if _finite_number(uncastled.get("average_evaluation_loss")) is not None
            and _finite_number(castled.get("average_evaluation_loss")) is not None
            else None
        )
        supported = bool(
            min(castled_n, uncastled_n) >= minimum_sample
            and (
                (
                    castled_rate is not None
                    and uncastled_rate is not None
                    and uncastled_rate - castled_rate >= minimum_rate_delta
                )
                or (adverse_cpl is not None and adverse_cpl >= minimum_cpl_delta / 100.0)
            )
        )
        castling_supported = castling_supported or supported
        castling_details[color] = {
            "castled": {
                "sample_size": castled_n,
                "blunder_frequency": castled_rate,
                "average_evaluation_loss": _finite_number(castled.get("average_evaluation_loss")),
            },
            "uncastled": {
                "sample_size": uncastled_n,
                "blunder_frequency": uncastled_rate,
                "average_evaluation_loss": _finite_number(uncastled.get("average_evaluation_loss")),
            },
            "uncastled_evaluation_loss_delta": adverse_cpl,
            "supported_king_safety_signal": supported,
        }
    castling_confidence = min(castling_confidences) if castling_confidences else 0.0
    assessments.append(
        {
            "area": "king_safety_and_castling",
            "status": "supported" if castling_supported else (
                "no_supported_pattern"
                if castling_confidences and min(castling_confidences) > 0
                else "insufficient_evidence"
            ),
            "confidence": castling_confidence,
            "evidence": castling_details,
        }
    )

    material = _mapping(pattern_report.get("material_imbalance_analysis"))
    imbalance = _mapping(material.get("major_piece_imbalance"))
    imbalance_groups = _mapping(imbalance.get("groups"))
    balanced = _mapping(imbalance_groups.get("absent"))
    imbalanced = _mapping(imbalance_groups.get("present"))
    balanced_n = _nonnegative_integer(balanced.get("sample_size"))
    imbalanced_n = _nonnegative_integer(imbalanced.get("sample_size"))
    balanced_cpl = _finite_number(balanced.get("average_centipawn_loss"))
    imbalanced_cpl = _finite_number(imbalanced.get("average_centipawn_loss"))
    material_supported = bool(
        min(balanced_n, imbalanced_n) >= minimum_sample
        and balanced_cpl is not None
        and imbalanced_cpl is not None
        and imbalanced_cpl - balanced_cpl >= minimum_cpl_delta
    )
    material_confidence = min(
        _unit_confidence(None, balanced_n, minimum_sample),
        _unit_confidence(None, imbalanced_n, minimum_sample),
    )
    assessments.append(
        {
            "area": "major_piece_imbalance",
            "status": "supported" if material_supported else (
                "no_supported_pattern"
                if min(balanced_n, imbalanced_n) >= minimum_sample
                else "insufficient_evidence"
            ),
            "confidence": material_confidence,
            "evidence": {
                "balanced_sample_size": balanced_n,
                "balanced_average_cpl": balanced_cpl,
                "imbalanced_sample_size": imbalanced_n,
                "imbalanced_average_cpl": imbalanced_cpl,
                "cpl_delta_imbalanced_minus_balanced": (
                    imbalanced_cpl - balanced_cpl
                    if imbalanced_cpl is not None and balanced_cpl is not None
                    else None
                ),
            },
        }
    )

    items: list[dict[str, Any]] = []
    if mobility_supported:
        items.append(
            {
                "title": "Reduced mobility precedes a higher error rate",
                "recommendation": (
                    "Review low-mobility positions before the move and identify "
                    "candidate moves that improve piece activity."
                ),
                "confidence": mobility_confidence,
                "evidence": assessments[0]["evidence"],
            }
        )
    if castling_supported:
        items.append(
            {
                "title": "Castled and uncastled groups show different risk metrics",
                "recommendation": (
                    "Compare the color-specific castled and uncastled samples; "
                    "use the recorded blunder frequency and evaluation-loss "
                    "difference to guide king-safety review."
                ),
                "confidence": castling_confidence,
                "evidence": castling_details,
            }
        )
    if material_supported:
        items.append(
            {
                "title": "Major-piece imbalance positions have elevated CPL",
                "recommendation": (
                    "Review material-trade decisions in major-piece-imbalance "
                    "positions and compare their CPL with balanced positions."
                ),
                "confidence": material_confidence,
                "evidence": assessments[-1]["evidence"],
            }
        )

    rook_weakness = next(
        (
            item
            for item in weaknesses
            if item["evidence"].get("pattern", "").startswith("rook_endings:")
        ),
        None,
    )
    if rook_weakness is not None:
        items.append(
            {
                "title": "Rook-ending conversion needs focused practice",
                "recommendation": rook_weakness["recommended_training_focus"],
                "confidence": rook_weakness["confidence"],
                "evidence": rook_weakness["evidence"],
            }
        )

    confidence_values = [item["confidence"] for item in assessments]
    return {
        "confidence": fmean(confidence_values) if confidence_values else 0.0,
        "items": items,
        "assessments": assessments,
    }


def _weekly_plan(
    weaknesses: list[dict[str, Any]],
    activities_by_pattern: Mapping[str, Mapping[str, Any]],
) -> dict[str, Any]:
    """Schedule seven evidence-linked daily sessions from detected weaknesses."""
    days: list[dict[str, Any]] = []
    for day_index, day in enumerate(WEEK_DAYS):
        if not weaknesses:
            days.append(
                {
                    "day": day,
                    "focus": None,
                    "activity": None,
                    "confidence": 0.0,
                    "evidence": {},
                    "status": "insufficient_evidence",
                }
            )
            continue

        weakness = weaknesses[day_index % len(weaknesses)]
        pattern = weakness["evidence"]["pattern"]
        pattern_plan = _mapping(activities_by_pattern.get(pattern))
        activities = pattern_plan.get("activities", [])
        occurrence = day_index // len(weaknesses)
        activity = (
            activities[occurrence % len(activities)]
            if isinstance(activities, list) and activities
            else weakness["recommended_training_focus"]
        )
        days.append(
            {
                "day": day,
                "focus": weakness["title"],
                "activity": activity,
                "confidence": weakness["confidence"],
                "evidence": weakness["evidence"],
                "status": (
                    "evidence_backed"
                    if weakness["evidence_status"] == "adequate"
                    else "low_confidence"
                ),
            }
        )

    return {
        "confidence": _section_confidence(days),
        "days": days,
    }


def validate_coach_report(report: Mapping[str, Any]) -> None:
    """Validate a coach report against the public JSON Schema contract."""
    errors = sorted(
        Draft202012Validator(COACH_REPORT_SCHEMA).iter_errors(report),
        key=lambda error: tuple(str(part) for part in error.absolute_path),
    )
    if errors:
        first_error = errors[0]
        location = ".".join(str(part) for part in first_error.absolute_path) or "report"
        raise ValueError(
            f"Coach report schema validation failed at {location}: "
            f"{first_error.message}"
        )


def generate_coach_report(
    pattern_report: Mapping[str, Any],
    templates: Mapping[str, Mapping[str, Any]] | None = None,
    minimum_rate_delta: float = 0.01,
) -> dict[str, Any]:
    """Transform a pattern report into personalized evidence-backed coaching."""
    if not isinstance(pattern_report, Mapping):
        raise TypeError("pattern_report must be a mapping of mined report sections.")
    if (
        _finite_number(minimum_rate_delta) is None
        or minimum_rate_delta < 0
        or minimum_rate_delta > 1
    ):
        raise ValueError("minimum_rate_delta must be a finite fraction from 0 to 1.")

    effective_templates = {
        key: dict(value) for key, value in DEFAULT_COACHING_TEMPLATES.items()
    }
    if templates is not None:
        for key, values in templates.items():
            if key in effective_templates and isinstance(values, Mapping):
                effective_templates[key].update(values)

    thresholds = _mapping(pattern_report.get("thresholds"))
    minimum_sample = thresholds.get("minimum_sample_size", 20)
    configured_mistake_cpl = _finite_number(thresholds.get("mistake_cpl"))
    mistake_cpl = (
        configured_mistake_cpl if configured_mistake_cpl is not None else 100.0
    )
    configured_cpl_delta = _finite_number(thresholds.get("minimum_cpl_delta"))
    minimum_cpl_delta = (
        configured_cpl_delta if configured_cpl_delta is not None else 10.0
    )
    minimum_sample = (
        int(minimum_sample)
        if isinstance(minimum_sample, int) and not isinstance(minimum_sample, bool)
        and minimum_sample >= 1
        else 20
    )
    dataset = _mapping(pattern_report.get("dataset"))
    overall = _mapping(pattern_report.get("overall"))
    weaknesses, activities_by_pattern = _build_weaknesses(
        pattern_report,
        effective_templates,
        minimum_sample,
        mistake_cpl,
    )
    strengths = _build_strengths(pattern_report, minimum_sample)
    phase_analysis = _phase_coaching(pattern_report, minimum_sample)
    tactical_focus = _tactical_focus(
        pattern_report,
        weaknesses,
        minimum_sample,
        minimum_cpl_delta,
        minimum_rate_delta,
    )
    training_plan = _weekly_plan(weaknesses, activities_by_pattern)

    strongest = strengths[0] if strengths else None
    weakest_phase = phase_analysis["weakest_phase"]
    phase_metrics = _mapping(
        _mapping(phase_analysis["phases"]).get(weakest_phase)
    ) if weakest_phase else {}
    if weakest_phase and phase_metrics.get("status") == "supported":
        weak_evidence = _mapping(phase_metrics.get("evidence"))
        weakest = {
            "title": f"{weakest_phase} is the phase with the highest observed blunder rate",
            "confidence": phase_metrics["confidence"],
            "evidence": dict(weak_evidence),
            "supporting_metric": {
                "name": "blunder_rate",
                "value": weak_evidence.get("blunder_rate"),
                "comparison_value": weak_evidence.get("overall_blunder_rate"),
                "sample_size": weak_evidence.get("sample_size"),
            },
        }
    elif weaknesses:
        weakest = {
            "title": weaknesses[0]["title"],
            "confidence": weaknesses[0]["confidence"],
            "evidence": weaknesses[0]["evidence"],
            "supporting_metric": weaknesses[0]["supporting_metric"],
        }
    else:
        weakest = None

    primary_focus = (
        {
            "title": weaknesses[0]["title"],
            "confidence": weaknesses[0]["confidence"],
            "evidence": weaknesses[0]["evidence"],
            "supporting_metric": weaknesses[0]["supporting_metric"],
        }
        if weaknesses
        else None
    )
    games_analyzed = _nonnegative_integer(
        dataset.get("games", overall.get("games", 0))
    )
    positions_analyzed = _nonnegative_integer(
        dataset.get("positions", overall.get("positions", 0))
    )
    summary_confidence_items = [
        item["confidence"]
        for item in (strongest, weakest, primary_focus)
        if isinstance(item, Mapping)
    ]

    report = {
        "schema_version": COACH_REPORT_SCHEMA_VERSION,
        "executive_summary": {
            "confidence": fmean(summary_confidence_items) if summary_confidence_items else 0.0,
            "games_analyzed": games_analyzed,
            "positions_analyzed": positions_analyzed,
            "strongest_area": (
                {
                    "title": strongest["title"],
                    "confidence": strongest["confidence"],
                    "evidence": strongest["evidence"],
                    "supporting_metric": strongest["supporting_metric"],
                }
                if strongest
                else None
            ),
            "weakest_area": weakest,
            "primary_coaching_focus": primary_focus,
        },
        "strengths": {
            "confidence": _section_confidence(strengths),
            "status": "supported" if len(strengths) == 3 else "insufficient_evidence",
            "items": strengths,
        },
        "weaknesses": {
            "confidence": _section_confidence(weaknesses),
            "status": (
                "supported"
                if any(item["evidence_status"] == "adequate" for item in weaknesses)
                else "low_confidence"
                if weaknesses
                else "insufficient_evidence"
            ),
            "items": weaknesses,
        },
        "phase_analysis": phase_analysis,
        "tactical_focus": tactical_focus,
        "training_plan": training_plan,
    }
    validate_coach_report(report)
    return report
