import EvaluationBar from "./EvaluationBar";
import MoveHistory from "./MoveHistory";
import EnginePanel from "./EnginePanel";
import Tabs from "./Tabs";
import GameList from "./GameList";
import CoachReport from "./CoachReport";
import { useGame } from "../context/GameContext";

export default function SidePanel({
  engineEnabled,
  hasSavedAnalysis,
  onOpenAnalysis,
}) {
  const { moveHistory, setRequestedPosition } = useGame();

  return (
    <aside className="w-full shrink-0 self-start xl:sticky xl:top-20">
      <div className="flex h-[672px] flex-col gap-4 rounded-2xl border border-stone/40 bg-charcoal p-4 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6)] xl:h-[calc(100dvh-5.75rem)]">
        <EvaluationBar engineEnabled={engineEnabled} />

        <Tabs
          initialTab={hasSavedAnalysis ? "coach" : "moves"}
          gamesContent={<GameList />}

          movesContent={
            <MoveHistory
              moveHistory={moveHistory}
              jumpToPosition={setRequestedPosition}
            />
          }

          engineContent={<EnginePanel engineEnabled={engineEnabled} />}

          coachContent={
            <CoachReport
              hasSavedAnalysis={hasSavedAnalysis}
              onOpenAnalysis={onOpenAnalysis}
            />
          }
        />
      </div>
    </aside>
  );
}
