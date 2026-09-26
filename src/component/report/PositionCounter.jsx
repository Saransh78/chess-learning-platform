function formatCount(value) {
  return new Intl.NumberFormat().format(value);
}

export default function PositionCounter({ current = 0, total = 0 }) {
  const known = total > 0;
  const processed = Math.min(Math.max(current, 0), total);
  const remaining = known ? Math.max(total - processed, 0) : null;

  return (
    <div className="grid grid-cols-2 gap-3" aria-live="polite">
      <div className="rounded-xl bg-obsidian/60 px-4 py-3 ring-1 ring-stone/40">
        <p className="text-xs font-medium text-parchment">Positions processed</p>
        <p className="mt-1 text-lg font-semibold tabular-nums text-ivory">
          {known ? formatCount(processed) : "—"}
        </p>
      </div>
      <div className="rounded-xl bg-obsidian/60 px-4 py-3 ring-1 ring-stone/40">
        <p className="text-xs font-medium text-parchment">Positions remaining</p>
        <p className="mt-1 text-lg font-semibold tabular-nums text-ivory">
          {remaining === null ? "—" : formatCount(remaining)}
        </p>
      </div>
    </div>
  );
}
