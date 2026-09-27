import Section from "./Section";

export default function RecommendationList({ items, delay = 0 }) {
  return (
    <Section title="Coach recommendations" delay={delay}>
      {!items || items.length === 0 ? (
        <p className="text-[13px] leading-relaxed text-faded">
          Nothing to recommend right now.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li
              key={`${index}-${String(item).slice(0, 24)}`}
              className="flex items-start gap-2.5 rounded-xl bg-slate-ash/40 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-ash/60"
            >
              <span
                aria-hidden="true"
                className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-sage/15 text-[11px] font-bold text-sage ring-1 ring-sage/30"
              >
                ✓
              </span>
              <span className="text-[13px] leading-relaxed text-ivory/90">
                {item}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
