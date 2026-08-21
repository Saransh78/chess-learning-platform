import { useCallback, useEffect, useState } from "react";
import stockfishEngine from "../Engine/stockfishEngine";
import { useRef } from "react";
export default function useStockfish(enabled = true) {
    const currentFen = useRef("");
    const pendingFen = useRef(null);
    const searching = useRef(false);
    const cancelling = useRef(false);
    const [evaluation, setEvaluation] = useState(0);

const startSearch = (fen) => {
  currentFen.current = fen;
  pendingFen.current = null;
  searching.current = true;

  stockfishEngine.send(`position fen ${fen}`);
  stockfishEngine.send("go depth 18");
};

  useEffect(() => {
    stockfishEngine.start();

    searching.current = false;
    cancelling.current = false;
    pendingFen.current = null;

const handleMessage = (message) => {

  if (message.startsWith("bestmove")) {
    searching.current = false;
    cancelling.current = false;

    if (pendingFen.current !== null) {
      startSearch(pendingFen.current);
    }

    return;
  }

  if (cancelling.current || !searching.current) {
    return;
  }

  const match = message.match(/score (cp|mate) (-?\d+)/);

  if (match) {
   const value = Number(match[2]);

   const cp =
    match[1] === "mate"
        ? value > 0
            ? 5
            : -5
        : value / 100;

const evaluation =
    currentFen.current.includes(" b ")
        ? -cp
        : cp;

setEvaluation(evaluation);
  }

};

    stockfishEngine.addListener(handleMessage);

    return () => {
      stockfishEngine.removeListener(handleMessage);
      stockfishEngine.stop();
    };
  }, []);

  useEffect(() => {
    if (enabled) {
      stockfishEngine.start();
    } else {
      stockfishEngine.stop();
    }

    searching.current = false;
    cancelling.current = false;
    pendingFen.current = null;
  }, [enabled]);

const analyzePosition = useCallback((fen) => {
  console.log("Sending FEN:", fen);

  pendingFen.current = fen;

  if (searching.current) {
    cancelling.current = true;
    stockfishEngine.send("stop");
  } else {
    startSearch(fen);
  }
}, []);
  return {
    analyzePosition,
    evaluation,
};
}