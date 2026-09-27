import HeroMetrics from "./coach/HeroMetrics";
import RecommendationList from "./coach/RecommendationList";
import StrengthMeter from "./coach/StrengthMeter";
import StyleBadges from "./coach/StyleBadges";
import TrainingPlan from "./coach/TrainingPlan";
import { StrengthList, WeaknessList } from "./coach/InsightCards";

const STAGGER_MS = 70;

export default function ReportView({ report, onReset }) {
  if (!report) return null;

  return (
    <div className="space-y-3 animate-fade-in">
      <HeroMetrics report={report} delay={0} />
      <StrengthMeter report={report} delay={STAGGER_MS} />
      <StyleBadges report={report} delay={STAGGER_MS * 2} />
      <WeaknessList items={report.weaknesses} delay={STAGGER_MS * 3} />
      <StrengthList items={report.strengths} delay={STAGGER_MS * 4} />
      <RecommendationList
        items={report.recommendations}
        delay={STAGGER_MS * 5}
      />
      <TrainingPlan items={report.training_plan} delay={STAGGER_MS * 6} />

      <button
        type="button"
        onClick={onReset}
        className="w-full rounded-xl border border-stone/60 bg-transparent px-4 py-2.5 text-sm font-semibold text-parchment transition-all duration-200 hover:border-stone hover:text-ivory"
      >
        Analyze different games
      </button>
    </div>
  );
}
