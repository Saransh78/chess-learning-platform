const ITEMS = [
  {
    label: "Stockfish-powered",
    path: "M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2",
  },
  {
    label: "Multi-game analysis",
    path: "M4 6h16M4 12h16M4 18h10",
  },
  {
    label: "Personalized coaching",
    path: "M3.5 17.5l5.2-5.2 3.4 3.4 6.9-6.9M14.5 8.5H19V13",
  },
  {
    label: "Chess.com & Lichess compatible",
    path: "M12 3v10M12 17.5v.5M7 8l5-5 5 5",
  },
];

export default function TrustStrip() {
  return (
    <section aria-label="Highlights" className="border-y border-stone/30">
      <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-4 px-6 py-6 lg:grid-cols-4">
        {ITEMS.map((item) => (
          <li
            key={item.label}
            className="flex items-center justify-center gap-2.5 text-xs font-medium tracking-wide text-faded"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-bronze/80"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={item.path} />
            </svg>
            {item.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
