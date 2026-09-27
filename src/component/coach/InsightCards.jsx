import Section from "./Section";

function WarningIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="mt-0.5 h-4 w-4 shrink-0 text-clay"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3.5L22 20H2L12 3.5z" />
      <path d="M12 10v4.5" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="mt-0.5 h-4 w-4 shrink-0 text-sage"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5.5" />
    </svg>
  );
}

export function WeaknessCard({ text }) {
  return (
    <li className="flex items-start gap-2.5 rounded-xl bg-clay/[0.07] p-3.5 ring-1 ring-clay/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-clay/[0.11]">
      <WarningIcon />
      <p className="text-[13px] leading-relaxed text-ivory/90">{text}</p>
    </li>
  );
}

export function StrengthCard({ text }) {
  return (
    <li className="flex items-start gap-2.5 rounded-xl bg-sage/[0.07] p-3.5 ring-1 ring-sage/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sage/[0.11]">
      <SuccessIcon />
      <p className="text-[13px] leading-relaxed text-ivory/90">{text}</p>
    </li>
  );
}

function CardList({ title, items, emptyText, Card, delay = 0 }) {
  return (
    <Section title={title} delay={delay}>
      {!items || items.length === 0 ? (
        <p className="text-[13px] leading-relaxed text-faded">{emptyText}</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item, index) => (
            <Card key={`${index}-${String(item).slice(0, 24)}`} text={item} />
          ))}
        </ul>
      )}
    </Section>
  );
}

export function WeaknessList({ items, delay = 0 }) {
  return (
    <CardList
      title="Recurring weaknesses"
      items={items}
      emptyText="No major weaknesses detected."
      Card={WeaknessCard}
      delay={delay}
    />
  );
}

export function StrengthList({ items, delay = 0 }) {
  return (
    <CardList
      title="Strengths"
      items={items}
      emptyText="No standout strengths yet."
      Card={StrengthCard}
      delay={delay}
    />
  );
}
