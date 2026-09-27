export default function HeroCopy({ onGetStarted }) {
  return (
    <div className="min-w-0 text-center lg:text-left">
      <p className="animate-rise text-[11px] font-semibold uppercase tracking-[0.24em] text-bronze">
        AI Chess Coaching Platform
      </p>

      <h1 className="mt-5 animate-rise text-balance text-5xl font-semibold leading-[1.06] tracking-[-0.03em] text-ivory [animation-delay:80ms] sm:text-6xl">
        Train like a grandmaster.
        <br />
        <span className="text-bronze">Learn like a coach.</span>
      </h1>

      <p className="mx-auto mt-6 max-w-xl animate-rise text-lg leading-relaxed text-sage [animation-delay:150ms] lg:mx-0 lg:max-w-md">
        Upload your Chess.com or Lichess PGNs and turn every game into
        actionable improvement. Stockfish analyzes every position move by
        move, while BoardSense&rsquo;s AI Coach studies patterns across your
        games to uncover recurring weaknesses and the skills you should focus
        on next.
      </p>

      <div className="mt-9 flex animate-rise flex-col items-center gap-3 [animation-delay:220ms] sm:flex-row sm:justify-center lg:justify-start">
        <button
          onClick={onGetStarted}
          className="w-full rounded-xl bg-bronze px-8 py-3.5 text-sm font-semibold text-obsidian shadow-lg shadow-bronze/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold hover:shadow-xl hover:shadow-bronze/30 active:translate-y-0 sm:w-auto"
        >
          Launch BoardSense
        </button>
        <span className="inline-flex w-full items-center justify-center gap-2 sm:w-auto">
          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Coming soon"
            className="w-full cursor-not-allowed rounded-xl border border-stone/60 px-8 py-3.5 text-sm font-semibold text-faded sm:w-auto"
          >
            Watch Demo
          </button>
          <span className="shrink-0 rounded-full border border-stone/50 px-2 py-0.5 text-[10px] font-medium tracking-wide text-faded">
            Soon
          </span>
        </span>
      </div>

      <p className="mt-5 animate-rise text-xs tracking-wide text-faded [animation-delay:280ms]">
        Supports .pgn exports from Chess.com &amp; Lichess
      </p>
    </div>
  );
}
