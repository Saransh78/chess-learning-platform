import { useEffect, useState } from "react";
import {
  getDurationLabel,
  getCoachingTopic,
  getTrainingActivity,
  getTrainingDays,
} from "./reportData";

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4l2.5 1.5" />
    </svg>
  );
}

export default function TrainingTimeline({ report, id = "training-plan" }) {
  const days = getTrainingDays(report);
  const [completedDays, setCompletedDays] = useState(() => new Set());
  const [timelineRevealed, setTimelineRevealed] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setTimelineRevealed(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  function toggleDay(index) {
    setCompletedDays((previous) => {
      const next = new Set(previous);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <section
      id={id}
      aria-labelledby="training-timeline-title"
      className="scroll-mt-4 rounded-2xl bg-charcoal/55 p-5 ring-1 ring-stone/45 sm:p-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="training-timeline-title" className="text-xl font-semibold tracking-tight text-ivory">
            Your 7-day training plan
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-parchment">
            A practical route from the patterns in your games to your next session.
          </p>
          <p className="mt-1 text-xs text-faded">
            Session times are approximate where the report has no duration data.
          </p>
        </div>
        <p className="text-xs tabular-nums text-parchment">
          {completedDays.size} of {days.length} days complete
        </p>
      </div>

      {days.length === 0 ? (
        <p className="mt-5 rounded-xl bg-obsidian/40 p-4 text-sm text-parchment ring-1 ring-stone/30">
          No training sessions were included in this report.
        </p>
      ) : (
        <div className="relative mt-6">
          <span
            aria-hidden="true"
            className="absolute bottom-7 left-[15px] top-7 w-px origin-top bg-gradient-to-b from-bronze/60 via-stone/45 to-transparent transition-transform duration-700 ease-out motion-reduce:transition-none"
            style={{ transform: timelineRevealed ? "scaleY(1)" : "scaleY(0)" }}
          />
          <ol className="space-y-3">
          {days.map((day, index) => {
            const rawActivity =
              day.activity || (Array.isArray(day.exercises) ? day.exercises.join(" ") : "");
            const activity = getTrainingActivity(rawActivity, day);
            const complete = completedDays.has(index);
            const weakness = getCoachingTopic({
              title: day.focus,
              evidence: day.evidence,
            });

            return (
              <li
                key={`${day.day || "Day"}-${index}`}
                className="relative pl-10 motion-safe:animate-settle"
                style={{ animationDelay: `${Math.min(index * 40, 240)}ms` }}
              >
                <button
                  type="button"
                  onClick={() => toggleDay(index)}
                  aria-pressed={complete}
                  aria-label={`${complete ? "Mark" : "Complete"} ${day.day || `day ${index + 1}`} ${complete ? "incomplete" : "complete"}`}
                  className={`absolute left-0 top-4 z-10 grid h-8 w-8 place-items-center rounded-full ring-4 ring-charcoal transition-colors focus-visible:outline-offset-2 ${
                    complete
                      ? "bg-sage text-obsidian ring-sage/15"
                      : "bg-charcoal text-parchment ring-bronze/20 hover:text-gold"
                  }`}
                >
                  {complete ? (
                    <svg
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m4 10 4 4 8-8" />
                    </svg>
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-bronze" />
                  )}
                </button>

                <article className="rounded-xl bg-obsidian/45 p-4 ring-1 ring-stone/35 transition-[transform,background-color,ring-color] duration-200 hover:-translate-y-0.5 hover:bg-obsidian/65 hover:ring-bronze/30 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-baseline gap-3">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
                        Day {index + 1}
                      </span>
                      <h3 className={`truncate text-base font-semibold ${complete ? "text-sage-light" : "text-ivory"}`}>
                        {day.day || `Day ${index + 1}`}
                      </h3>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-charcoal px-2.5 py-1.5 text-xs tabular-nums text-parchment ring-1 ring-stone/40">
                      <ClockIcon />
                      {getDurationLabel(day)}
                    </span>
                  </div>
                  <p className="mt-3 text-base font-medium leading-relaxed text-ivory/95">
                    {activity}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-parchment">
                    <span className="font-semibold text-faded">Supports</span>
                    <span>{weakness === "—" ? "your coaching priorities" : weakness}</span>
                  </div>
                </article>
              </li>
            );
          })}
          </ol>
        </div>
      )}
    </section>
  );
}
