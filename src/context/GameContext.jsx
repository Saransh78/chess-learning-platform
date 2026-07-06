import { createContext, useContext, useState } from "react";

const GameContext = createContext();

export function GameProvider({ children }) {
  const [moveHistory, setMoveHistory] = useState([]);

  const [boardHistory, setBoardHistory] = useState([
    {
      board: [],
      turn: "white",
      lastMove: null,
      moveHistory: [],
      gameOver: false,
      gameResult: "",
    },
  ]);

  const [currentPosition, setCurrentPosition] = useState(0);

  return (
    <GameContext.Provider
      value={{
        moveHistory,
        setMoveHistory,

        boardHistory,
        setBoardHistory,

        currentPosition,
        setCurrentPosition,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}