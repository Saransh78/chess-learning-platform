import { useRef, useState } from "react";
import { useGame } from "../context/GameContext";
import useReport from "../hooks/useReport";
import CoachSkeleton from "./coach/CoachSkeleton";
import ReportModal from "./report/ReportModal";
import {
  clearSavedReportJobId,
  getSavedReportJobId,
  saveReportJobId,
} from "../services/reportJobStorage";

const ACCENTS = {
  clay: { dot: "bg-clay", label: "text-clay" },
  bronze: { dot: "bg-bronze", label: "text-gold" },
  sage: { dot: "bg-sage", label: "text-sage-light" },
};

const PREVIEW_INSIGHTS = [
  {
    tag: "Recurring Weakness",
    accent: "clay",
    quote: "Losing space in Caro-Kann structures.",
  },
  {
    tag: "Tactical Pattern",
    accent: "bronze",
    quote: "Missed forks across multiple games.",
  },
  {
    tag: "Opening Trend",
    accent: "sage",
    quote:
      "Strong early development but weak central control after the opening.",
  },
  {
    tag: "Study Recommendation",
    accent: "sage",
    quote:
      "Focus on isolated pawn structures and minor-piece coordination this week.",
  },
];

export default function CoachReport() {
  const { games } = useGame();
  const { status, report, error, filename, isUploading, submitReport, reset } =
    useReport();
  const inputRef = useRef(null);
  const [activeJobId, setActiveJobId] = useState(getSavedReportJobId);
  const [modalOpen, setModalOpen] = useState(() => Boolean(getSavedReportJobId()));

  const gameCount = games.length;
  const jobId = report?.job_id || null;

  function openPicker() {
    inputRef.current?.click();
  }

  async function handleFileSelect(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) {
      clearSavedReportJobId();
      setActiveJobId(null);
      setModalOpen(false);
      const submitted = await submitReport(file);
      if (submitted?.job_id) {
        saveReportJobId(submitted.job_id);
        setActiveJobId(submitted.job_id);
        setModalOpen(true);
      }
    }
  }

  function handleReset() {
    reset();
    clearSavedReportJobId();
    setActiveJobId(null);
    setModalOpen(false);
  }

  function handleCloseModal(jobStatus) {
    if (jobStatus === "cancelled" || jobStatus === "failed") {
      clearSavedReportJobId();
      setActiveJobId(null);
    }
    setModalOpen(false);
  }

  function handleReopen() {
    if (activeJobId) setModalOpen(true);
  }

  return (
    <div className="space-y-5 px-0.5 pb-2">
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-b from-sage/[0.08] to-charcoal px-5 py-6 text-center ring-1 ring-sage/25">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 left-1/2 h-32 w-56 -translate-x-1/2 rounded-full bg-sage/15 blur-3xl"
        />

        <div className="relative mx-auto grid h-11 w-11 place-items-center rounded-xl bg-sage/15 ring-1 ring-sage/30">
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
        </div>

        <h3 className="relative mt-4 text-base font-semibold tracking-tight text-ivory">
          AI Coach
        </h3>
        <p className="relative mx-auto mt-1.5 max-w-[28ch] text-xs leading-relaxed text-parchment">
          Your personalized improvement report.
        </p>

        <button
          onClick={openPicker}
          disabled={isUploading}
          className="relative mt-5 w-full rounded-xl bg-bronze px-4 py-2.5 text-sm font-semibold text-obsidian shadow-lg shadow-bronze/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold hover:shadow-xl hover:shadow-bronze/25 active:translate-y-0 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {isUploading ? "Analyzing your games…" : "Generate AI Report"}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept=".pgn"
          onChange={handleFileSelect}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />

        {isUploading ? (
          <div className="relative mt-4 text-left">
            <CoachSkeleton filename={filename} />
          </div>
        ) : status === "success" && jobId ? (
          <div className="relative mt-4">
            <p className="text-[11px] leading-relaxed text-sage-light">
              You can return to this analysis in this browser.
            </p>
            <button
              onClick={handleReopen}
              className="relative mt-3 w-full rounded-xl border border-bronze/40 bg-bronze/10 px-4 py-2.5 text-sm font-semibold text-gold transition-all duration-200 hover:-translate-y-0.5 hover:bg-bronze/20"
            >
              Resume analysis
            </button>
            <button
              onClick={handleReset}
              className="relative mt-2 w-full rounded-xl border border-stone/60 bg-transparent px-4 py-2 text-xs font-semibold text-parchment transition-colors duration-200 hover:border-stone hover:text-ivory"
            >
              Analyze different games
            </button>
          </div>
        ) : activeJobId ? (
          <div className="relative mt-4">
            <p className="text-[11px] leading-relaxed text-parchment">
              A saved analysis job is available to resume.
            </p>
            <button
              onClick={handleReopen}
              className="mt-3 w-full rounded-xl border border-bronze/40 bg-bronze/10 px-4 py-2.5 text-sm font-semibold text-gold transition-colors duration-200 hover:bg-bronze/20"
            >
              Resume analysis
            </button>
            <button
              onClick={handleReset}
              className="mt-2 w-full rounded-xl border border-stone/60 bg-transparent px-4 py-2 text-xs font-semibold text-parchment transition-colors duration-200 hover:border-stone hover:text-ivory"
            >
              Forget saved job
            </button>
          </div>
        ) : (
          <>
            {status === "error" ? (
              <p
                role="alert"
                className="relative mt-3 animate-fade-in text-[11px] leading-relaxed text-clay"
              >
                {error}
              </p>
            ) : (
              gameCount > 0 && (
                <p className="relative mt-3 text-[11px] text-faded">
                  Runs across all {gameCount} imported{" "}
                  {gameCount === 1 ? "game" : "games"}.
                </p>
              )
            )}
          </>
        )}
      </section>

      <div>
        <h4 className="px-1 pb-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-faded">
          Sample insights
        </h4>

        <ul className="space-y-2.5">
          {PREVIEW_INSIGHTS.map((insight) => {
            const accent = ACCENTS[insight.accent];
            return (
              <li
                key={insight.tag}
                className="group rounded-xl bg-slate-ash/40 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-ash/60"
              >
                <blockquote className="text-[13px] leading-relaxed text-ivory/90">
                  &ldquo;{insight.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-2.5 flex items-center gap-1.5">
                  <span className={`h-1 w-1 rounded-full ${accent.dot}`} />
                  <span className={`text-[11px] font-medium ${accent.label}`}>
                    {insight.tag}
                  </span>
                </figcaption>
              </li>
            );
            })}
          </ul>
        </div>

      {modalOpen && activeJobId && (
        <ReportModal key={activeJobId} jobId={activeJobId} onClose={handleCloseModal} />
      )}
    </div>
  );
}
