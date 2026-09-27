import VerticalEvalBar from "../VerticalEvalBar";
import { pieces } from "../../data/startingPosition";
import { pieceImages } from "../../data/pieceImages";

function BoardMock() {
  const bySquare = new Map(pieces.map((p) => [`${p.row}-${p.col}`, p]));

  return (
    <div
      aria-hidden="true"
      className="grid flex-1 grid-cols-8 overflow-hidden rounded-lg ring-1 ring-stone/50"
    >
      {Array.from({ length: 64 }, (_, index) => {
        const row = Math.floor(index / 8);
        const col = index % 8;
        const piece = bySquare.get(`${row}-${col}`);
        const isLight = (row + col) % 2 === 1;

        return (
          <div
            key={index}
            className={`relative flex aspect-square items-center justify-center ${
              isLight ? "bg-amber-100" : "bg-amber-900"
            }`}
          >
            {piece && (
              <img
                src={pieceImages[piece.color][piece.type]}
                alt=""
                draggable={false}
                className="relative z-10 h-[84%] w-[84%] drop-shadow-[0_3px_4px_rgba(0,0,0,0.28)]"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[440px] animate-rise [animation-delay:200ms] lg:mx-0">
      <p className="sr-only">
        Preview of the BoardSense app: chessboard with live evaluation and AI
        Coach panel.
      </p>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-8 rounded-[2rem] bg-bronze/[0.07] blur-3xl"
      />

      <div className="motion-safe:animate-float">
        <div className="relative rounded-2xl border border-stone/50 bg-charcoal/95 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.7)] ring-1 ring-ivory/[0.04] transition-transform duration-500 [transform:perspective(1200px)_rotateX(3deg)_rotateY(-7deg)] hover:[transform:perspective(1200px)_rotateX(0deg)_rotateY(0deg)] hover:-translate-y-1 before:pointer-events-none before:absolute before:inset-x-10 before:top-0 before:z-10 before:h-px before:bg-gradient-to-r before:from-transparent before:via-gold/50 before:to-transparent">
          <div className="pointer-events-none flex select-none flex-col gap-3 p-4">
            <div className="flex items-center gap-1.5 px-1">
              <span className="h-2.5 w-2.5 rounded-full bg-stone/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-stone/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-bronze/60" />
              <span className="ml-2 hidden rounded-md bg-obsidian/70 px-2.5 py-1 text-[10px] tracking-wide text-faded ring-1 ring-stone/40 sm:block">
                boardsense.app
              </span>
            </div>

            <div className="flex h-60 gap-3 sm:h-64">
              <BoardMock />
              <div className="flex min-h-0 [&>div]:min-h-0">
                <VerticalEvalBar />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 rounded-xl bg-obsidian/60 px-3 py-2 ring-1 ring-stone/40">
              <span className="truncate text-[11px] font-medium text-parchment">
                Stockfish 18 · Best move{" "}
                <span className="font-semibold text-gold">Nf3</span>
              </span>
              <span className="shrink-0 rounded-full bg-sage/10 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-sage-light ring-1 ring-sage/30">
                +0.4
              </span>
            </div>

            <div className="rounded-xl bg-sage/[0.07] p-3 text-left ring-1 ring-sage/25">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sage-light">
                AI Coach
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ivory/90">
                Recurring blind spot: knights landing on the rim lose a tempo.
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-bronze/15 px-2 py-0.5 text-[10px] font-semibold text-gold ring-1 ring-bronze/40">
                  Tactical 84
                </span>
                <span className="rounded-full bg-sage/10 px-2 py-0.5 text-[10px] font-semibold text-sage-light ring-1 ring-sage/30">
                  Solid 76
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
