import { formatEta } from "../../services/api";

export default function ETAChip({ etaSeconds, status }) {
  const label =
    status === "completed"
      ? "Ready"
      : status === "cancelled"
        ? "Stopped"
        : etaSeconds == null
          ? "Estimating"
          : formatEta(etaSeconds);

  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl bg-obsidian/60 px-4 py-3 ring-1 ring-stone/40 sm:justify-start sm:gap-4">
      <span className="text-xs font-medium text-parchment">Time remaining</span>
      <span className="truncate text-sm font-semibold tabular-nums text-ivory">
        {label}
      </span>
    </div>
  );
}
