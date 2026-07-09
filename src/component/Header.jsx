import Button from "./button"
import { useRef } from "react";
import { parsePGNFiles } from "../utils/pgnParser";
import { useGame } from "../context/GameContext";
export default function Header() {

  const fileInputRef = useRef(null);
  const { setGames } = useGame();

  function handleUploadClick() {
    fileInputRef.current.click();
  }

 async function handleFileSelect(event) {
  const files = Array.from(event.target.files);

  const uploadedGames = await Promise.all(
    files.map(async (file) => {
      return {
        name: file.name,
        size: file.size,
        content: await file.text(),
      };
    })
  );

const parsedGames = parsePGNFiles(uploadedGames);

setGames(parsedGames);

console.table(parsedGames);
console.log(`Loaded ${parsedGames.length} games`);
}
  return <header className="flex items-center justify-between ">
    <div className="flex flex-col gap-1">
<h1 className="text-3xl font-bold text-blue-500">AI Chess Learning Platform</h1>
      <div>
  <button
    onClick={handleUploadClick}
    className="mt-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm transition"
  >
    📂 Upload Games
  </button>

  <input
    type="file"
    ref={fileInputRef}
    accept=".pgn"
    multiple
    onChange={handleFileSelect}
    className="hidden"
  />
</div>
    </div>
    <div className="flex flex-col gap-2 items-end">
    <span className=" text-2xl font-bold text-blue-500">Stockfish Analysis</span>
      <div className="flex items-center gap-3">
        <Button text="Start" />
        <Button text="Report" />
      </div>
    </div>
  </header>
}