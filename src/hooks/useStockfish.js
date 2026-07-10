import { useEffect } from "react";
import stockfishEngine from "../Engine/stockfishEngine";

export default function useStockfish() {
  useEffect(() => {
    stockfishEngine.start();

    return () => {
      stockfishEngine.stop();
    };
  }, []);
}