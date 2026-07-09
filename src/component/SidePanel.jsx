import EvaluationBar from "./EvaluationBar";
import MoveHistory from "./MoveHistory";
import AnalysisPanel from "./AnalysisPanel";
import { useGame } from "../context/GameContext";

export default function SidePanel({
  moveHistory,
  currentPosition,
}) {

  const {
    setRequestedPosition,
  } = useGame();
  return (
   <div className="w-[360px] h-[640px] bg-zinc-800 rounded-xl p-4 flex flex-col gap-4 shadow-lg">
      <EvaluationBar />
      <MoveHistory
  moveHistory={moveHistory}
  currentPosition={currentPosition}
  jumpToPosition={setRequestedPosition}
/>
      <AnalysisPanel />
    </div>
  );
}