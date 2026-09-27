const PHASES = [
  { label: "Opening", key: "Opening Score", source: "opening_report" },
  {
    label: "Middlegame",
    key: "Middlegame Score",
    source: "middlegame_report",
  },
  { label: "Endgame", key: "Endgame Score", source: "endgame_report" },
];

export function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

export function getPhaseScores(report) {
  return PHASES.map((phase) => ({
    label: phase.label,
    value: report?.[phase.source]?.[phase.key],
  })).filter((phase) => isFiniteNumber(phase.value));
}

export function formatCount(value) {
  return new Intl.NumberFormat().format(value);
}

export function formatScore(value) {
  return isFiniteNumber(value) ? value.toFixed(1) : "—";
}

export function formatConfidence(value) {
  return isFiniteNumber(value)
    ? `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`
    : "Not reported";
}

export function getCoachStrengths(report) {
  const strengths = report?.coach_report?.strengths?.items;
  if (Array.isArray(strengths)) return strengths.slice(0, 3);

  return (report?.strengths || []).slice(0, 3).map((title) => ({ title }));
}

export function getCoachWeaknesses(report) {
  const weaknesses = report?.coach_report?.weaknesses?.items;
  if (Array.isArray(weaknesses)) return weaknesses;

  return (report?.weaknesses || []).map((title, index) => ({
    rank: index + 1,
    title,
  }));
}

function findingPattern(item) {
  return String(item?.evidence?.pattern || item?.pattern || "").toLowerCase();
}

export function getCoachingTopic(item) {
  const pattern = findingPattern(item);
  if (!pattern && !item?.evidence?.observed_group && !item?.title) return "—";
  const source = `${pattern} ${item?.evidence?.observed_group || ""} ${item?.title || ""}`.toLowerCase();

  if (
    source.includes("isolated_pawns_absent") ||
    source.includes("isolated pawns absent") ||
    source.includes("positions without isolated pawns")
  ) {
    return "Connected pawn structures";
  }
  if (source.includes("bishop_pair") || source.includes("bishop pair")) {
    return "Bishop-pair positions";
  }
  if (
    source.includes("pawn_islands") ||
    source.includes("isolated_pawn") ||
    source.includes("doubled_pawn") ||
    source.includes("pawn structure")
  ) {
    return "Pawn structure";
  }
  if (source.includes("major_piece_imbalance") || source.includes("major-piece")) {
    return "Major-piece decisions";
  }

  const phase = pattern.match(/(?:weakest_game_phase:)(opening|middlegame|endgame)/);
  if (phase) return `${phase[1][0].toUpperCase()}${phase[1].slice(1)} decisions`;

  const moveRange = pattern.match(/highest_risk_move_range:(\d+-\d+|\d+\+)/);
  if (moveRange) {
    return `Decisions in moves ${moveRange[1].replace("-", "–")}`;
  }

  if (/middlegame/i.test(source)) return "Middlegame decisions";
  if (/endgame/i.test(source)) return "Endgame decisions";
  if (/opening/i.test(source)) return "Opening decisions";

  return String(item?.title || "Coaching focus")
    .replace(/\s+(?:show|coincide with|have)\s+.*$/i, "")
    .replace(/\bCPL\b/gi, "")
    .replace(/[.!]+$/, "")
    .trim();
}

export function getStrengthInsight(item) {
  const source = `${findingPattern(item)} ${item?.evidence?.observed_group || ""} ${item?.title || ""}`.toLowerCase();
  if (source.includes("bishop_pair") || source.includes("bishop pair")) {
    return "You made steadier decisions in positions where you held the bishop pair.";
  }
  if (source.includes("isolated_pawns_absent") || source.includes("isolated pawns absent")) {
    return "Your play was more reliable when your pawns stayed connected.";
  }
  if (source.includes("major_piece_imbalance") || source.includes("major-piece imbalance")) {
    return "You handled major-piece imbalances with steadier decisions.";
  }
  return "This is a repeatable strength to bring into your next games.";
}

export function getStrengthWhy(item) {
  const source = `${findingPattern(item)} ${item?.evidence?.observed_group || ""} ${item?.title || ""}`.toLowerCase();
  if (source.includes("bishop_pair") || source.includes("bishop pair")) {
    return "The bishop pair can influence both color complexes and create long-range pressure.";
  }
  if (source.includes("isolated_pawns_absent") || source.includes("isolated pawns absent")) {
    return "Connected pawns protect one another and can leave fewer targets to defend.";
  }
  if (source.includes("major_piece_imbalance") || source.includes("major-piece imbalance")) {
    return "Recognizing material imbalances helps you choose a plan that fits the position.";
  }
  return "Noticing this pattern helps you repeat the decisions that worked well.";
}

export function getStrengthEvidenceSummary(item) {
  const metric = item?.supporting_metric;
  const sampleSize = metric?.sample_size ?? item?.evidence?.observed?.sample_size;
  const lowerBy = metric?.lower_by;
  const evidence = [];

  if (isFiniteNumber(sampleSize)) evidence.push(`${formatCount(sampleSize)} positions`);
  if (isFiniteNumber(lowerBy)) {
    evidence.push(`${lowerBy.toFixed(2)} lower avg CPL vs comparison`);
  }

  return evidence.length > 0 ? evidence.join(" · ") : "Evidence details not supplied";
}

export function getWeaknessInsight(item) {
  const pattern = findingPattern(item);
  if (pattern.includes("pawn_islands:fragmented")) {
    return "Your pawn structure decisions were less steady when your pawns split into separate islands.";
  }
  if (pattern.includes("isolated_pawns:present")) {
    return "Isolated-pawn positions were more difficult for you to manage consistently.";
  }
  if (pattern.includes("weakest_game_phase:middlegame")) {
    return "Your middlegame decisions produced more blunder-level mistakes than your overall play.";
  }
  if (pattern.includes("highest_risk_move_range:")) {
    const range = pattern.match(/highest_risk_move_range:(\d+-\d+|\d+\+)/)?.[1];
    return range
      ? `Your decisions in moves ${range.replace("-", "–")} were a more difficult stretch than the rest of the game.`
      : "This part of the game is a useful place to review your decision-making.";
  }
  return "This pattern is a useful place to review the decisions behind your positions.";
}

export function getWeaknessTrainingFocus(item) {
  const pattern = findingPattern(item);
  if (pattern.includes("pawn_islands")) {
    return "Review the pawn break or exchange that split your pawns; look for a plan that keeps your structure connected.";
  }
  if (pattern.includes("isolated_pawns")) {
    return "Practice both creating and defending an isolated pawn. Review the exchanges that change the structure.";
  }
  if (pattern.includes("weakest_game_phase:middlegame")) {
    return "Prioritize middlegame calculation and review your critical decisions against the engine’s suggestion.";
  }
  if (pattern.includes("highest_risk_move_range:")) {
    const range = pattern.match(/highest_risk_move_range:(\d+-\d+|\d+\+)/)?.[1]?.replace("-", "–");
    return `Review ${range ? `moves ${range}` : "this stretch of the game"} and write down the candidate moves you considered.`;
  }
  return String(item?.recommended_training_focus || "Review the decisions behind this pattern.")
    .replace(/lower-island group(?:'s|’s) measured CPL/gi, "positions with a more connected pawn structure")
    .replace(/\bCPL\b/gi, "evaluation change")
    .replace(/blunder-level/gi, "critical");
}

export function getWeaknessEvidenceSummary(item) {
  const sampleSize = item?.supporting_metric?.sample_size;
  return isFiniteNumber(sampleSize)
    ? `${formatCount(sampleSize)} scored positions`
    : "Position-level evidence available in the technical appendix";
}

export function getPatternTopic(item) {
  const pattern = findingPattern(item);
  if (pattern.includes("pawn_islands")) return "Pawn islands";
  if (pattern.includes("doubled_pawns")) return "Doubled pawns";
  if (pattern.includes("isolated_pawns")) return "Isolated pawns";
  if (pattern.includes("weakest_game_phase:")) {
    const phase = pattern.split(":").at(-1);
    return `${phase[0].toUpperCase()}${phase.slice(1)} decisions`;
  }
  if (pattern.includes("highest_risk_move_range:")) {
    const range = pattern.split(":").at(-1).replace("-", "–");
    return `Moves ${range}`;
  }
  return getCoachingTopic(item);
}

export function getPatternInsight(item) {
  const pattern = findingPattern(item);
  if (pattern.includes("pawn_islands")) {
    return "Split pawn groups gave opponents more targets and made these positions harder to handle.";
  }
  if (pattern.includes("doubled_pawns")) {
    return "Doubled pawns were linked with less steady decisions in these positions.";
  }
  if (pattern.includes("isolated_pawns")) {
    return "Positions with an isolated pawn were more challenging to manage consistently.";
  }
  if (pattern.includes("weakest_game_phase:middlegame")) {
    return "Middlegame positions contained the highest share of blunder-level decisions.";
  }
  if (pattern.includes("highest_risk_move_range:")) {
    return "This stretch of the game was a recurring decision-making challenge.";
  }
  return "This habit recurred across analyzed positions.";
}

export function getTrainingActivity(activity, day) {
  if (typeof activity !== "string" || !activity.trim()) return "Review the focus for this day in your games.";

  const pattern = findingPattern(day);
  if (pattern.includes("pawn_islands")) {
    return "Review the pawn break or exchange that split your pawns, then compare it with a more connected structure.";
  }
  if (pattern.includes("isolated_pawns")) {
    return "Practice plans for isolated-pawn positions and review the exchanges that created or targeted the pawn.";
  }
  if (pattern.includes("weakest_game_phase:middlegame")) {
    const count = activity.match(/\b\d+\b/)?.[0];
    return count
      ? `Review ${count} key middlegame decisions against the engine’s suggested move.`
      : "Practice a focused middlegame calculation session and check candidate moves before committing.";
  }
  if (pattern.includes("highest_risk_move_range:")) {
    const range = pattern.match(/highest_risk_move_range:(\d+-\d+|\d+\+)/)?.[1]?.replace("-", "–");
    const count = activity.match(/\b\d+\b/)?.[0];
    return `Review ${count ? `${count} ` : "the "}decisions${range ? ` in moves ${range}` : " in this part of the game"} and write down the candidate move you missed.`;
  }

  const normalized = activity.toLowerCase();
  if (normalized.includes("first-choice agreement")) {
    return "Before committing to a move, list candidate moves and check the opponent’s forcing replies.";
  }
  if (normalized.includes("average centipawn loss")) {
    return "Review positions where your plan became harder to execute and compare the candidate moves.";
  }
  if (normalized.includes("piece activity")) {
    return "Look for a useful square for each piece before starting an attack.";
  }

  return activity
    .replace(/blunder-level/gi, "critical")
    .replace(/centipawn loss|CPL/gi, "evaluation change")
    .replace(/engine alternatives/gi, "the engine’s suggested move")
    .replace(/record the resulting evaluation/gi, "note how the position changed");
}

export function getTrainingDays(report) {
  const days = report?.coach_report?.training_plan?.days;
  if (Array.isArray(days) && days.length > 0) return days;

  const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const activities = report?.training_plan || [];

  return weekdays.map((day, index) => ({
    day,
    activity: activities[index],
  }));
}

export function getDurationLabel(day) {
  const minutes = day?.estimated_minutes ?? day?.duration_minutes;
  if (isFiniteNumber(minutes) && minutes > 0) {
    return `${formatCount(minutes)} min`;
  }

  if (typeof day?.estimated_time === "string" && day.estimated_time.trim()) {
    return day.estimated_time;
  }

  return "~20–30 min";
}
