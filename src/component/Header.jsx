import Button from "./button"
import { useRef } from "react";
import { parsePGNFiles } from "../utils/pgnParser";
import { useGame } from "../context/GameContext";
export default function Header({ engineEnabled, setEngineEnabled }) {

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
  return (
    <header className="relative">
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-[42rem] rounded-full bg-walnut/25 blur-[110px]" />

      <nav className="relative flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl leading-none text-bronze">♞</span>
          <span className="text-xl font-bold tracking-tight text-ivory">
            Knight<span className="text-bronze">Mind</span>
          </span>
        </div>

        <button
          onClick={() => setEngineEnabled((on) => !on)}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
            engineEnabled
              ? "bg-bronze hover:bg-gold text-obsidian border-transparent shadow-md shadow-bronze/25"
              : "bg-charcoal hover:bg-slate-ash text-ivory/80 border-stone/50"
          }`}
        >
          Stockfish: {engineEnabled ? "ON" : "OFF"}
        </button>
      </nav>

      <section className="relative mt-12 mb-2 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-bronze/80">
          AI Chess Laboratory
        </p>

        <h1 className="mt-4 text-5xl sm:text-6xl font-bold tracking-tight bg-gradient-to-r from-gold via-bronze to-gold bg-clip-text text-transparent">
          KnightMind
        </h1>

        <p className="mt-4 max-w-xl mx-auto leading-relaxed text-ivory/60">
          Upload your games and read every position like a grandmaster —
          powered by a world-class chess engine.
        </p>

        <button
          onClick={handleUploadClick}
          className="mt-7 bg-bronze hover:bg-gold px-6 py-3 rounded-xl text-obsidian text-sm font-semibold transition shadow-lg shadow-bronze/30 hover:-translate-y-0.5"
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
      </section>
    </header>
  );
}
