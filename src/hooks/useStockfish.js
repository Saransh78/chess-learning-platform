import { useCallback, useEffect, useState } from "react";
import stockfishEngine from "../Engine/stockfishEngine";
import { useRef } from "react";
export default function useStockfish() {
    const currentFen = useRef("");
    const [evaluation, setEvaluation] = useState(0);
  useEffect(() => {
    stockfishEngine.start();
const handleMessage = (message) => {

  const match = message.match(/score cp (-?\d+)/);

  if (match) {
   const cp = Number(match[1]) / 100;

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

const analyzePosition = useCallback((fen) => {
  console.log("Sending FEN:", fen);

    currentFen.current = fen;

    stockfishEngine.send("stop");
    stockfishEngine.send(`position fen ${fen}`);
    stockfishEngine.send("go depth 18");

}, []);
  return {
    analyzePosition,
    evaluation,
};
}