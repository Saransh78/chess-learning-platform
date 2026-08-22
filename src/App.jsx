import { useState } from "react";
import Chessboard from "./component/Chessboard";
import Header from "./component/Header";
import SidePanel from "./component/SidePanel";
import Welcome from "./component/Welcome";
import { useGame } from "./context/GameContext";

export default function App() {
  const [engineEnabled, setEngineEnabled] = useState(true);
  const { games, moveHistory, setMoveHistory } = useGame();

  const hasGames = games.length > 0;

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        engineEnabled={engineEnabled}
        setEngineEnabled={setEngineEnabled}
      />

      {!hasGames ? (
        <Welcome />
      ) : (
        <main className="mx-auto w-full max-w-[1400px] flex-1 animate-fade-in px-4 pb-8 pt-5 sm:px-6">
          <div className="flex flex-col items-center gap-10 xl:flex-row xl:items-start xl:gap-6">
            <div className="w-full min-w-0 animate-settle xl:flex-1">
              <Chessboard
                moveHistory={moveHistory}
                setMoveHistory={setMoveHistory}
                engineEnabled={engineEnabled}
              />
            </div>
            <div className="w-full max-w-[480px] animate-rise [animation-delay:120ms] md:w-[320px] md:max-w-none md:shrink-0 xl:w-[380px]">
              <SidePanel engineEnabled={engineEnabled} />
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
