import Chessboard from "./component/Chessboard";
import Header from "./component/Header";
import SidePanel from "./component/SidePanel";
import { useState } from "react";

export default function App() {
  const [moveHistory, setMoveHistory] = useState([]);
  return (
    <div className="max-w-7xl mx-auto p-4 flex flex-col gap-4">
      <Header />

      <div className="flex gap-8 items-start mt-2">
        <Chessboard
  moveHistory={moveHistory}
  setMoveHistory={setMoveHistory}
/>
       <SidePanel
  moveHistory={moveHistory}
/>
      </div>
    </div>
  );
}