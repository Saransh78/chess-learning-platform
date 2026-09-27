function ErrorIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3.5 22 20H2L12 3.5Z" />
      <path d="M12 9v4.5m0 3h.01" />
    </svg>
  );
}

export default function ErrorStep({ message, cancelled = false, onTryAgain }) {
  return (
    <section
      aria-labelledby="analysis-error-title"
      className="mx-auto flex min-h-full w-full max-w-xl flex-col items-center justify-center px-2 py-10 text-center"
    >
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-clay/10 text-clay ring-1 ring-clay/30">
        <ErrorIcon />
      </span>
      <h2 id="analysis-error-title" className="mt-5 text-2xl font-semibold tracking-tight text-ivory">
        {cancelled ? "Analysis cancelled" : "Analysis could not be completed"}
      </h2>
      <p role="alert" className="mt-2 max-w-[58ch] text-sm leading-relaxed text-parchment">
        {message ||
          (cancelled
            ? "The job stopped at your request. Your PGN is still available to submit again."
            : "The analysis service could not complete this report. Check the connection and try again.")}
      </p>
      <button
        type="button"
        onClick={onTryAgain}
        className="mt-6 rounded-xl bg-bronze px-5 py-3 text-sm font-semibold text-obsidian transition-colors hover:bg-gold focus-visible:outline-offset-4"
      >
        Choose another PGN
      </button>
    </section>
  );
}
