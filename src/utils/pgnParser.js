import { Chess } from "chess.js";

export function parsePGNFiles(files) {
  const games = [];

  files.forEach((file) => {
    // Split one file into individual games
    const gameTexts = file.content
      .trim()
      .split(/\n\n(?=\[Event)/);

    gameTexts.forEach((gameText) => {
      const chess = new Chess();

      try {
        chess.loadPgn(gameText);

        const headers = chess.header();

games.push({
    id: games.length + 1,

    white: headers.White || "Unknown",

    black: headers.Black || "Unknown",

    result: headers.Result || "*",

    event: headers.Event || "",

    date: headers.Date || "",

    headers,

    moves: chess.history(),

    pgn: gameText,
});
      } catch (error) {
    console.error(
        `Failed game ${games.length + 1}`,
        error,
        gameText
    );
}
    });
  });

  return games;
}