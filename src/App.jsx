import { useState } from "react";
import Chessboard from "./component/Chessboard";
import Header from "./component/Header";
import SidePanel from "./component/SidePanel";
import { useGame } from "./context/GameContext";

export default function App() {
 const [engineEnabled, setEngineEnabled] = useState(true);
 const {
  moveHistory,
  setMoveHistory,
  currentPosition,
  setCurrentPosition,
} = useGame();
  return (
    <div className="max-w-7xl mx-auto px-4 pb-12 flex flex-col">
      <Header
        engineEnabled={engineEnabled}
        setEngineEnabled={setEngineEnabled}
      />

      <div className="flex gap-10 items-start mt-8">
       <Chessboard
  moveHistory={moveHistory}
  setMoveHistory={setMoveHistory}
  engineEnabled={engineEnabled}
/>
       <SidePanel
    moveHistory={moveHistory}
    currentPosition={currentPosition}
    engineEnabled={engineEnabled}
/>
      </div>
    </div>
  );
}