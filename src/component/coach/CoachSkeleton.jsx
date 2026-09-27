function ShimmerBlock({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-shimmer bg-gradient-to-r from-slate-ash/40 via-stone/50 to-slate-ash/40 bg-[length:200%_100%] ${className}`}
    />
  );
}

function SkeletonShell({ title, children }) {
  return (
    <section className="rounded-xl bg-slate-ash/40 p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-faded">
        {title}
      </p>
      <div className="mt-2.5 space-y-2.5">{children}</div>
    </section>
  );
}

export default function CoachSkeleton({ filename }) {
  return (
    <div
      className="space-y-3"
      aria-live="polite"
      aria-busy="true"
      aria-label="Analyzing your games"
    >
      <p className="text-[13px] leading-relaxed text-sage-light animate-fade-in">
        Analyzing your games
        {filename ? ` (${filename})` : ""}…
      </p>

      <SkeletonShell title="Coach summary">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          {[0, 1, 2, 3].map((index) => (
            <div key={index}>
              <ShimmerBlock className="h-2.5 w-16 rounded-full" />
              <ShimmerBlock className="mt-2 h-7 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      </SkeletonShell>

      <SkeletonShell title="Strength meter">
        {[0, 1, 2].map((index) => (
          <div key={index}>
            <ShimmerBlock className="h-2.5 w-24 rounded-full" />
            <ShimmerBlock className="mt-1.5 h-2 w-full rounded-full" />
          </div>
        ))}
      </SkeletonShell>

      <SkeletonShell title="Recurring weaknesses">
        <ShimmerBlock className="h-12 w-full rounded-xl" />
        <ShimmerBlock className="h-12 w-full rounded-xl" />
      </SkeletonShell>
    </div>
  );
}
