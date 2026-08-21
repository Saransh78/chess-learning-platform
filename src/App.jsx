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
        <main className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6">
          <div className="mt-8 flex items-start gap-10">
            <Chessboard
              moveHistory={moveHistory}
              setMoveHistory={setMoveHistory}
              engineEnabled={engineEnabled}
            />
            <SidePanel
              moveHistory={moveHistory}
              engineEnabled={engineEnabled}
            />
          </div>
        </main>
      )}
    </div>
  );
}
