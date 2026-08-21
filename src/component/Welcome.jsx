import Logo from "./Logo";
import usePgnImport from "../hooks/usePgnImport";

function FeatureIcon({ children, className = "" }) {
  return (
    <div
      className={`grid h-11 w-11 place-items-center rounded-xl bg-slate-ash/70 ring-1 ring-stone/60 ${className}`}
    >
      {children}
    </div>
  );
}

function Bullet({ children, tone = "bronze" }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-parchment">
      <span
        className={`mt-[7px] h-1 w-1 shrink-0 rounded-full ${
          tone === "sage" ? "bg-sage" : "bg-bronze/80"
        }`}
      />
      {children}
    </li>
  );
}

const STEPS = [
  {
    title: "Import your PGN games",
    body: "Drop in a .pgn export from Chess.com or Lichess — one game or your whole archive.",
  },
  {
    title: "Stockfish evaluates every position",
    body: "Live evaluation, best moves, depth, and principal variation follow you move by move.",
  },
  {
    title: "The AI Coach studies patterns across multiple games",
    body: "Recurring mistakes, tactical blind spots, and opening trends surface across everything you upload.",
  },
  {
    title: "Receive a personalized AI Report",
    body: "Recurring weaknesses called out clearly, with what to study next.",
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

        <p className="mt-7 animate-rise text-sm font-semibold tracking-tight text-ivory [animation-delay:40ms]">
          Knight<span className="text-bronze">Mind</span>
          <span className="mx-2.5 text-faded" aria-hidden="true">
            ·
          </span>
          <span className="font-medium tracking-wide text-parchment">
            AI Based Learning Platform
          </span>
        </p>

        <h1 className="mt-8 animate-rise text-5xl font-semibold leading-[1.08] tracking-[-0.03em] text-balance text-ivory [animation-delay:90ms] sm:text-6xl">
          Train like a grandmaster.
          <br />
          <span className="text-bronze">Learn like a coach.</span>
        </h1>

        <p className="mx-auto mt-8 max-w-xl animate-rise text-lg leading-relaxed text-ivory/85 [animation-delay:150ms]">
          Upload your Chess.com or Lichess PGNs and turn every game into
          actionable improvement.
        </p>

        <p className="mx-auto mt-5 max-w-xl animate-rise text-base leading-relaxed text-parchment [animation-delay:200ms]">
          <span className="font-medium text-ivory">Stockfish</span> analyzes
          every position move by move, while{" "}
          <span className="font-medium text-sage">KnightMind&rsquo;s AI Coach</span>{" "}
          studies patterns across your games to uncover recurring weaknesses,
          tactical blind spots, opening trends, and the skills you should focus
          on next.
        </p>

        <div className="mt-10 animate-rise [animation-delay:250ms]">
          <button
            onClick={openPicker}
            className="rounded-xl bg-bronze px-8 py-3.5 text-sm font-semibold text-obsidian shadow-lg shadow-bronze/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold hover:shadow-xl hover:shadow-bronze/30 active:translate-y-0"
          >
            Import PGNs
          </button>
          <p className="mt-4 text-xs tracking-wide text-faded">
            Supports .pgn exports from Chess.com &amp; Lichess
          </p>
        </div>

        {fileInput}
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid gap-5 md:grid-cols-3">
          <article
            className="group animate-rise rounded-2xl border border-stone/50 bg-charcoal p-6 shadow-[0_12px_32px_-16px_rgba(0,0,0,0.5)] transition-all duration-300 [animation-delay:310ms] hover:-translate-y-1 hover:border-stone hover:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.65)]"
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
              <Bullet>Engine depth</Bullet>
              <Bullet>Principal variation</Bullet>
            </ul>
          </article>

          <article
            className="group relative animate-rise overflow-hidden rounded-2xl border border-sage/35 bg-charcoal p-6 shadow-[0_16px_40px_-18px_rgba(0,0,0,0.65)] transition-all duration-300 [animation-delay:370ms] hover:-translate-y-1 hover:border-sage/60 hover:shadow-[0_24px_48px_-18px_rgba(0,0,0,0.75)] before:pointer-events-none before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-sage/60 before:to-transparent"
          >
            <FeatureIcon className="!bg-sage/10 !ring-sage/30">
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
            </FeatureIcon>
            <div className="mt-5 flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-ivory">AI Coach</h3>
              <span className="shrink-0 rounded-full border border-sage/30 bg-sage/10 px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-sage-light">
                Across your games
              </span>
            </div>
            <ul className="mt-4 space-y-2.5">
              <Bullet tone="sage">Analyzes multiple games together</Bullet>
              <Bullet tone="sage">Finds recurring mistakes</Bullet>
              <Bullet tone="sage">Personalized improvement report</Bullet>
              <Bullet tone="sage">Training recommendations</Bullet>
            </ul>
          </article>

          <article
            className="group animate-rise rounded-2xl border border-stone/50 bg-charcoal p-6 shadow-[0_12px_32px_-16px_rgba(0,0,0,0.5)] transition-all duration-300 [animation-delay:430ms] hover:-translate-y-1 hover:border-stone hover:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.65)]"
          >
            <FeatureIcon>
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-gold"
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
              <Bullet>Replay every position</Bullet>
              <Bullet>Navigate every move</Bullet>
              <Bullet>Understand critical moments</Bullet>
            </ul>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-28">
        <div className="border-t border-stone/30 pt-16">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-ivory sm:text-3xl">
            How KnightMind Works
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-sm leading-relaxed text-faded">
            Instead of only showing engine evaluations, KnightMind builds a
            long-term picture of your chess.
          </p>

          <ol className="mt-14 grid gap-x-8 gap-y-10 text-left sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative">
                <span className="text-xs font-semibold tabular-nums tracking-[0.2em] text-bronze/90">
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
