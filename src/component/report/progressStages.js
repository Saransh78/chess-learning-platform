export const PROGRESS_STAGES = [
  {
    id: "queued",
    label: "Queued",
    description: "Your report job is ready to begin.",
  },
  {
    id: "parsing_pgn",
    label: "Parsing PGN",
    description: "Reading game headers and move sequences.",
  },
  {
    id: "extracting_features",
    label: "Extracting features",
    description: "Building position-level signals from each game.",
  },
  {
    id: "stockfish_analysis",
    label: "Stockfish analysis",
    description: "Evaluating positions with the chess engine.",
  },
  {
    id: "ml_prediction",
    label: "ML prediction",
    description: "Scoring patterns across the analyzed positions.",
  },
  {
    id: "shap_analysis",
    label: "SHAP analysis",
    description: "Finding the signals behind each prediction.",
  },
  {
    id: "pattern_mining",
    label: "Pattern mining",
    description: "Connecting recurring themes across your games.",
  },
  {
    id: "coaching",
    label: "Coaching",
    description: "Turning the findings into a personal training plan.",
  },
  {
    id: "completed",
    label: "Completed",
    description: "Your AI Coach report is ready.",
  },
];

const LEGACY_PHASES = {
  parsing: "parsing_pgn",
  stockfish: "stockfish_analysis",
  pattern_detection: "pattern_mining",
  report_generation: "coaching",
};

export function getProgressStageId(jobState, lastActiveStage) {
  if (jobState?.status === "completed") return "completed";
  if (jobState?.status === "cancelled" || jobState?.status === "failed") {
    return lastActiveStage || LEGACY_PHASES[jobState?.phase] || "queued";
  }

  const stage = jobState?.stage;
  if (PROGRESS_STAGES.some((item) => item.id === stage)) return stage;

  return LEGACY_PHASES[jobState?.phase] || "queued";
}
