import {
  formatCount,
  formatScore,
  getCoachStrengths,
  getCoachWeaknesses,
  getCoachingTopic,
} from "./reportData";

function KpiIcon({ kind }) {
  const paths = {
    score: <><path d="M4 16.5 8.5 12l3 2.5L20 6" /><path d="M14.5 6H20v5.5" /></>,
    strength: <><path d="m12 3 2.3 5 5.5.7-4 3.8 1 5.5-4.8-2.7-4.8 2.7 1-5.5-4-3.8 5.5-.7L12 3Z" /></>,
    weakness: <><path d="M12 3.5 22 20H2L12 3.5Z" /><path d="M12 9v4.5m0 3h.01" /></>,
    focus: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2m10 8h-2M4 12H2m10 10v-2" /></>,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.55"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[kind]}
    </svg>
  );
}

function KpiCard({ label, value, note, kind, delay = 0 }) {
  return (
    <article
      className="group min-w-0 rounded-2xl bg-obsidian/45 p-4 ring-1 ring-stone/40 transition-[transform,background-color,ring-color] duration-200 hover:-translate-y-0.5 hover:bg-obsidian/65 hover:ring-bronze/35 motion-safe:animate-settle sm:p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-bronze/10 text-gold ring-1 ring-bronze/25">
          <KpiIcon kind={kind} />
        </span>
        <p className="min-w-0 text-xs font-medium leading-snug text-parchment">{label}</p>
      </div>
      <p className="mt-4 min-h-12 break-words text-lg font-semibold leading-snug text-ivory sm:text-xl">
        {value || "—"}
      </p>
      {note && <p className="mt-1.5 text-xs leading-relaxed text-faded">{note}</p>}
    </article>
  );
}

export default function SummaryHero({ report, id = "executive-summary" }) {
  const coaching = report?.coach_report || {};
  const summary = coaching.executive_summary || {};
  const strengths = getCoachStrengths(report);
  const weaknesses = getCoachWeaknesses(report);
  const strongest = summary.strongest_area || strengths[0];
  const weakest = weaknesses[0] || summary.weakest_area;
  const firstPlanDay = coaching.training_plan?.days?.[0];
  const performance = report?.strength_scores?.["Overall Playing Strength"];
  const gameCount =
    report?.upload_summary?.games_detected ??
    report?.player_statistics?.Games ??
    summary.games_analyzed;
  const strengthTopic = getCoachingTopic(strongest);
  const weaknessTopic = getCoachingTopic(weakest);
  const weeklyFocus = getCoachingTopic({
    title: firstPlanDay?.focus || summary.primary_coaching_focus?.title,
    evidence: firstPlanDay?.evidence || summary.primary_coaching_focus?.evidence,
  });

  return (
    <section
      id={id}
      aria-labelledby="executive-summary-title"
      className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-[#30271D] via-charcoal to-[#201F1B] p-5 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.75)] ring-1 ring-bronze/35 sm:p-7 lg:p-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-28 -z-10 h-72 w-72 rounded-full bg-bronze/[0.12] blur-3xl"
      />
      <div className="max-w-3xl">
        <h2
          id="executive-summary-title"
          className="text-3xl font-semibold leading-tight tracking-tight text-ivory sm:text-4xl"
        >
          {gameCount == null
            ? "Your games, in focus."
            : `You played ${formatCount(gameCount)} ${gameCount === 1 ? "game" : "games"}.`}
        </h2>
        <p className="mt-3 text-base leading-relaxed text-parchment sm:text-lg">
          {strengthTopic && (
            <>Your strongest area is <strong className="font-semibold text-sage-light">{strengthTopic}</strong>. </>
          )}
          {weaknessTopic && (
            <>Your biggest improvement opportunity is <strong className="font-semibold text-clay">{weaknessTopic.toLowerCase()}</strong>.</>
          )}
        </p>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Overall performance score"
          value={formatScore(performance)}
          note="Playing strength · / 100"
          kind="score"
          delay={0}
        />
        <KpiCard
          label="Biggest strength"
          value={strengthTopic}
          note="A pattern to keep building on"
          kind="strength"
          delay={45}
        />
        <KpiCard
          label="Biggest weakness"
          value={weaknessTopic}
          note="The clearest opportunity to improve"
          kind="weakness"
          delay={90}
        />
        <KpiCard
          label="Main focus this week"
          value={weeklyFocus}
          note="First priority in your training plan"
          kind="focus"
          delay={135}
        />
      </div>
    </section>
  );
}
