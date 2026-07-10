import { useCallback, useEffect } from "react";
import stockfishEngine from "../Engine/stockfishEngine";

export default function useStockfish() {
  useEffect(() => {
    stockfishEngine.start();

    const handleMessage = (message) => {
      console.log("[Engine]", message);
    };

    stockfishEngine.addListener(handleMessage);

    return () => {
      stockfishEngine.removeListener(handleMessage);
      stockfishEngine.stop();
    };
  }, []);

  const analyzePosition = useCallback((fen) => {
  stockfishEngine.send("stop");
  stockfishEngine.send(`position fen ${fen}`);
  stockfishEngine.send("go depth 10");
}, []);
  return {
    analyzePosition,
  };
}