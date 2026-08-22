import { useRef } from "react";
import { parsePGNFiles } from "../utils/pgnParser";
import { useGame } from "../context/GameContext";

export default function usePgnImport() {
  const inputRef = useRef(null);
  const { setGames } = useGame();

  async function handleFileSelect(event) {
    const files = Array.from(event.target.files);

    if (files.length === 0) return;

    const uploadedGames = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        size: file.size,
        content: await file.text(),
      }))
    );

    setGames(parsePGNFiles(uploadedGames));

    event.target.value = "";
  }

  function openPicker() {
    inputRef.current?.click();
  }

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept=".pgn"
      multiple
      onChange={handleFileSelect}
      className="hidden"
    />
  );

  return { openPicker, fileInput };
}
