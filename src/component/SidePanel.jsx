import EvaluationBar from "./EvaluationBar";
import MoveHistory from "./MoveHistory";
import EnginePanel from "./EnginePanel";
import Tabs from "./Tabs";
import GameList from "./GameList";
import CoachReport from "./CoachReport";
import { useGame } from "../context/GameContext";
export default function SidePanel({ engineEnabled }) {
  const { moveHistory, setRequestedPosition } = useGame();

  return (
    <aside className="w-full max-w-[480px] shrink-0 self-start md:max-w-none md:w-[420px] xl:sticky xl:top-20">
      <div className="flex h-[672px] flex-col gap-4 rounded-2xl border border-stone/40 bg-charcoal p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6)]">
        <EvaluationBar engineEnabled={engineEnabled} />

        <Tabs
          gamesContent={<GameList />}

          movesContent={
            <MoveHistory
              moveHistory={moveHistory}
              jumpToPosition={setRequestedPosition}
            />
          }

          engineContent={<EnginePanel engineEnabled={engineEnabled} />}

          coachContent={<CoachReport />}
        />
      </div>
    </aside>
  );
}
