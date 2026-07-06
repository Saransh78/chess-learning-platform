import EvaluationBar from "./EvaluationBar";
import MoveHistory from "./MoveHistory";
import AnalysisPanel from "./AnalysisPanel";
export default function SidePanel({
  moveHistory,
  currentPosition,
}) {
  return (
   <div className="w-[360px] h-[640px] bg-zinc-800 rounded-xl p-4 flex flex-col gap-4 shadow-lg">
      <EvaluationBar />
      <MoveHistory
  moveHistory={moveHistory}
  currentPosition={currentPosition}
/>
      <AnalysisPanel />
    </div>
  );
}