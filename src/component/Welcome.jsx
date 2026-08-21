import Logo from "./Logo";
import usePgnImport from "../hooks/usePgnImport";

function FeatureIcon({ children }) {
  return (
    <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-ash/70 ring-1 ring-stone/60">
      {children}
    </div>
  );
}

function Bullet({ children }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-parchment">
      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-bronze/80" />
      {children}
    </li>
  );
}

const STEPS = [
  {
    title: "Import your PGN games",
    body: "Bring in your Chess.com or Lichess archives.",
  },
  {
    title: "Every position analyzed",
    body: "Stockfish evaluates each move and every evaluation swing.",
  },
  {
    title: "Insights across games",
    body: "The ML model aggregates patterns that span multiple games.",
  },
  {
    title: "Your Coach Report",
    body: "Recurring weaknesses highlighted, with what to study next.",
  },
];

export default function Welcome() {
  const { openPicker, fileInput } = usePgnImport();

  return (
    <main className="relative flex-1 overflow-hidden">
      <section className="mx-auto max-w-3xl px-6 pt-20 pb-16 text-center sm:pt-24">
        <div className="flex justify-center animate-rise">
          <Logo size="xl" />
        </div>

        <h1 className="mt-8 animate-rise text-5xl font-bold tracking-tight text-ivory [animation-delay:60ms] sm:text-6xl">
          Knight<span className="text-bronze">Mind</span>
        </h1>

        <p className="mt-4 animate-rise text-lg font-medium text-parchment [animation-delay:120ms] sm:text-xl">
          Train like a grandmaster.{" "}
          <span className="text-bronze">Learn like a coach.</span>
        </p>

        <p className="mx-auto mt-6 max-w-xl animate-rise leading-relaxed text-parchment/90 [animation-delay:180ms]">
          Upload your Chess.com or Lichess PGNs and turn every game into
          actionable improvement.
        </p>

        <p className="mx-auto mt-4 max-w-xl animate-rise text-sm leading-relaxed text-faded [animation-delay:220ms]">
          <span className="font-medium text-ivory/80">Stockfish</span> analyzes
          every position move by move, while{" "}
          <span className="font-medium text-ivory/80">
            KnightMind&rsquo;s ML Coach
          </span>{" "}
          studies patterns across your games to uncover recurring weaknesses,
          tactical blind spots, opening trends, and the skills you should focus
          on next.
        </p>

        <div className="mt-9 animate-rise [animation-delay:280ms]">
          <button
            onClick={openPicker}
            className="rounded-xl bg-bronze px-7 py-3.5 text-sm font-semibold text-obsidian shadow-lg shadow-bronze/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold hover:shadow-xl hover:shadow-bronze/30 active:translate-y-0"
          >
            Import PGNs
          </button>
          <p className="mt-3.5 text-xs tracking-wide text-faded">
            Supports .pgn exports from Chess.com &amp; Lichess
          </p>
        </div>

        {fileInput}
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid gap-5 md:grid-cols-3">
          <article
            className="group animate-rise rounded-2xl border border-stone/50 bg-charcoal p-6 shadow-[0_12px_32px_-16px_rgba(0,0,0,0.5)] transition-all duration-300 [animation-delay:340ms] hover:-translate-y-1 hover:border-stone hover:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.65)]"
          >
            <FeatureIcon>
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
            </FeatureIcon>
            <h3 className="mt-5 text-base font-semibold text-ivory">
              Stockfish Analysis
            </h3>
            <ul className="mt-4 space-y-2.5">
              <Bullet>Live evaluation</Bullet>
              <Bullet>Best moves</Bullet>
              <Bullet>Principal variation</Bullet>
              <Bullet>Engine depth</Bullet>
            </ul>
          </article>

          <article
            className="relative animate-rise overflow-hidden rounded-2xl border border-bronze/40 bg-charcoal p-6 shadow-[0_16px_40px_-18px_rgba(0,0,0,0.65)] transition-all duration-300 [animation-delay:400ms] hover:-translate-y-1 hover:border-bronze/70 hover:shadow-[0_24px_48px_-18px_rgba(0,0,0,0.75)] before:pointer-events-none before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-bronze/70 before:to-transparent"
          >
            <FeatureIcon>
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-bronze" fill="currentColor">
                <path d="M12 2.5l1.9 6.1a1 1 0 0 0 .66.66l6.1 1.9-6.1 1.9a1 1 0 0 0-.66.66L12 19.77l-1.9-6.05a1 1 0 0 0-.66-.66l-6.1-1.9 6.1-1.9a1 1 0 0 0 .66-.66L12 2.5z" opacity="0.9" />
                <path d="M19 15.5l.8 2.45 2.45.8-2.45.8-.8 2.45-.8-2.45-2.45-.8 2.45-.8.8-2.45z" opacity="0.55" />
              </svg>
            </FeatureIcon>
            <div className="mt-5 flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-ivory">
                ML Coach Report
              </h3>
              <span className="shrink-0 rounded-full border border-bronze/30 bg-bronze/10 px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-gold">
                Exclusive
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-parchment">
              Our machine learning model studies your games together&mdash;not
              just one at a time&mdash;to identify recurring mistakes and build
              a personalized improvement report.
            </p>
          </article>

          <article
            className="group animate-rise rounded-2xl border border-stone/50 bg-charcoal p-6 shadow-[0_12px_32px_-16px_rgba(0,0,0,0.5)] transition-all duration-300 [animation-delay:460ms] hover:-translate-y-1 hover:border-stone hover:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.65)]"
          >
            <FeatureIcon>
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-sage"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 5l7 7-7 7" />
                <path d="M13 5l7 7-7 7" />
              </svg>
            </FeatureIcon>
            <h3 className="mt-5 text-base font-semibold text-ivory">
              Interactive Replay
            </h3>
            <ul className="mt-4 space-y-2.5">
              <Bullet>Step through positions</Bullet>
              <Bullet>Navigate every move</Bullet>
              <Bullet>Study critical moments</Bullet>
            </ul>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-28">
        <div className="border-t border-stone/30 pt-14 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-ivory sm:text-3xl">
            How KnightMind Works
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-faded">
            Instead of only showing engine evaluations, KnightMind builds a
            long-term picture of your chess.
          </p>

          <ol className="mt-12 grid gap-x-8 gap-y-10 text-left sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative">
                <span className="text-xs font-semibold tracking-[0.2em] text-bronze/90">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="mt-3 h-px w-full bg-gradient-to-r from-stone/70 to-transparent" />
                <h3 className="mt-4 text-sm font-semibold leading-snug text-ivory">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-faded">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
