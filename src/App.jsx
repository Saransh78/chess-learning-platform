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
        <main className="mx-auto w-full max-w-[1360px] flex-1 animate-fade-in px-4 pb-16 pt-6 sm:px-6">
          <div className="flex flex-col items-center gap-10 xl:flex-row xl:items-start xl:justify-center">
            <div className="w-full min-w-0 max-w-[880px] xl:flex-1">
              <Chessboard
                moveHistory={moveHistory}
                setMoveHistory={setMoveHistory}
                engineEnabled={engineEnabled}
              />
            </div>
            <SidePanel engineEnabled={engineEnabled} />
          </div>
        </main>
      )}
    </div>
  );
}
