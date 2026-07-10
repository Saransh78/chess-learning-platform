class StockfishEngine {
  constructor() {
    this.worker = null;
  }

  start() {
    if (this.worker) return;

    this.worker = new Worker(
      "/stockfish/stockfish-18-lite-single.js"
    );

    this.worker.onmessage = (event) => {
      console.log("[Stockfish]", event.data);
    };

    this.worker.postMessage("uci");
    this.worker.postMessage("isready");
  }

  stop() {
    if (!this.worker) return;

    this.worker.terminate();
    this.worker = null;
  }

  send(command) {
    if (!this.worker) return;

    this.worker.postMessage(command);
  }
}

export default new StockfishEngine();