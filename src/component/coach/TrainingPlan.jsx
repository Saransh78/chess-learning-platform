import Section from "./Section";
import { planByDay } from "./reportUtils";

export default function TrainingPlan({ items, delay = 0 }) {
  const days = planByDay(items);

  return (
    <Section title="Weekly training plan" delay={delay}>
      {days.length === 0 ? (
        <p className="text-[13px] leading-relaxed text-faded">
          No training plan available.
        </p>
      ) : (
        <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-stone/50">
          {days.map((entry) => (
            <li key={entry.day} className="relative pl-6">
              <span
                aria-hidden="true"
                className="absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full bg-bronze ring-4 ring-bronze/15"
              />
              <p className="text-xs font-semibold tracking-wide text-gold">
                {entry.day}
              </p>
              <ul className="mt-1.5 space-y-1.5">
                {entry.items.map((item, index) => (
                  <li
                    key={`${index}-${String(item).slice(0, 24)}`}
                    className="text-[13px] leading-relaxed text-ivory/90"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}
