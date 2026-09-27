import FullCoachReport from "../report/FullCoachReport";

export default function CompletedReportStep({
  report,
  analysisDepth,
  duration,
  scrollRootRef,
  onAnalyzeAnother,
}) {
  return (
    <div className="space-y-6">
      <FullCoachReport
        report={report}
        analysisDepth={analysisDepth}
        duration={duration}
        scrollRootRef={scrollRootRef}
      />
      <div className="flex justify-center pb-2">
        <button
          type="button"
          onClick={onAnalyzeAnother}
          className="rounded-xl border border-stone/55 px-5 py-2.5 text-sm font-semibold text-parchment transition-colors hover:border-bronze/45 hover:bg-bronze/[0.07] hover:text-ivory focus-visible:outline-offset-4"
        >
          Analyze another PGN
        </button>
      </div>
    </div>
  );
}
