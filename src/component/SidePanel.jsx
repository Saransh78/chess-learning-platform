import EvaluationBar from "./EvaluationBar";
import MoveHistory from "./MoveHistory";
import AnalysisPanel from "./AnalysisPanel";
import { useGame } from "../context/GameContext";
import Tabs from "./Tabs";
import GameList from "./GameList";

export default function SidePanel({
  moveHistory,
  currentPosition,
  engineEnabled,
}) {

  const {
    setRequestedPosition,
  } = useGame();
 return (
  <div className="relative w-[360px] h-[640px] bg-charcoal/90 border border-stone/40 rounded-2xl p-4 flex flex-col gap-4 shadow-2xl shadow-black/40 backdrop-blur before:pointer-events-none before:absolute before:-inset-10 before:bg-walnut/15 before:blur-3xl before:rounded-full before:content-['']">
    <EvaluationBar engineEnabled={engineEnabled} />

    <Tabs
      gamesContent={<GameList />}

      movesContent={
        <MoveHistory
          moveHistory={moveHistory}
          currentPosition={currentPosition}
          jumpToPosition={setRequestedPosition}
        />
      }

      analysisContent={
        <AnalysisPanel />
      }

      aiContent={
        <div className="text-sage text-center mt-10">
          AI Coach coming soon...
        </div>
      }
    />
  </div>
);
}