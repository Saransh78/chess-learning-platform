class StockfishEngine {
  constructor() {
    this.worker = null;
    this.listeners = [];
  }

  start() {
    if (this.worker) return;

    this.worker = new Worker(
      "/stockfish/stockfish-18-lite-single.js"
    );

    this.worker.onmessage = (event) => {

    const message = event.data;

    console.log("[Stockfish]", message);

    this.listeners.forEach(listener =>
        listener(message)
    );

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
  addListener(callback) {
    this.listeners.push(callback);
}

removeListener(callback) {
    this.listeners =
        this.listeners.filter(
            listener => listener !== callback
        );
}
}


export default new StockfishEngine();