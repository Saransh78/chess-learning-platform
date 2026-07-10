import { createContext, useContext, useState } from "react";
import { pieces } from "../data/startingPosition";

const GameContext = createContext();

export function GameProvider({ children }) {
  const [moveHistory, setMoveHistory] = useState([]);
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [boardHistory, setBoardHistory] = useState([
  {
    board: pieces.map(piece => ({ ...piece })),
    turn: "white",
    lastMove: null,
    moveHistory: [],
    gameOver: false,
    gameResult: "",
  },
]);

  const [currentPosition, setCurrentPosition] = useState(0);
  const [requestedPosition, setRequestedPosition] = useState(null);
  const [boardSnapshot, setBoardSnapshot] = useState(null);

  return (
    <GameContext.Provider
      value={{
        moveHistory,
        setMoveHistory,

        boardHistory,
        setBoardHistory,

        currentPosition,
        setCurrentPosition,

        requestedPosition,
        setRequestedPosition,

        boardSnapshot,
        setBoardSnapshot,

        games,
        setGames,

        selectedGame,
        setSelectedGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}