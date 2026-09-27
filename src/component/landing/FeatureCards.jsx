function FeatureIcon({ children, className = "" }) {
  return (
    <div
      className={`grid h-11 w-11 place-items-center rounded-xl bg-slate-ash/70 ring-1 ring-stone/60 ${className}`}
    >
      {children}
    </div>
  );
}

const CARDS = [
  {
    title: "Upload Games",
    body: "Drop in a .pgn from Chess.com or Lichess — one game or your whole archive.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5 text-gold"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 16V4M12 4L7 9M12 4l5 5" />
        <path d="M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17" />
      </svg>
    ),
    accent: "",
  },
  {
    title: "Analyze Every Move",
    body: "Live Stockfish evaluation, best moves, and depth on every position.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5 text-gold"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="7.5" />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
        <path d="M12 2v2.5M12 19.5V22M22 12h-2.5M4.5 12H2" />
      </svg>
    ),
    accent: "",
  },
  {
    title: "Personalized Coach",
    body: "Recurring weaknesses and a weekly training plan across all your games.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5 text-sage"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3.5 17.5l5.2-5.2 3.4 3.4 6.9-6.9" />
        <path d="M14.5 8.5H19V13" />
      </svg>
    ),
    accent: "!bg-sage/10 !ring-sage/30",
  },
];

export default function FeatureCards() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <h2 className="text-center text-2xl font-semibold tracking-tight text-ivory sm:text-3xl">
        Everything you need to improve
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-center text-sm leading-relaxed text-faded">
        From raw PGNs to a personal training plan.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {CARDS.map((card, index) => (
          <article
            key={card.title}
            className="group animate-rise rounded-2xl border border-stone/50 bg-charcoal p-6 shadow-[0_12px_32px_-16px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-1 hover:border-stone hover:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.65)]"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <FeatureIcon className={card.accent}>{card.icon}</FeatureIcon>
            <h3 className="mt-5 text-base font-semibold text-ivory">
              {card.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-parchment">
              {card.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
