import { pieceImages } from "../data/pieceImages";

export default function PromotionModal({
  promotionPawn,
  promotePawn,
}) {
  if (!promotionPawn) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/80 backdrop-blur-sm">
      <div className="relative rounded-2xl border border-stone/50 bg-charcoal p-6 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.8)] animate-rise">
        <h2 className="mb-4 text-center text-lg font-semibold tracking-tight text-ivory">
          Choose Promotion
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {["queen", "rook", "bishop", "knight"].map((piece) => (
            <button
              key={piece}
              onClick={() => promotePawn(piece)}
              aria-label={`Promote to ${piece}`}
              className="rounded-xl border border-stone/40 bg-slate-ash p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-bronze/50 hover:bg-stone"
            >
              <img
                src={pieceImages[promotionPawn.color][piece]}
                alt={piece}
                className="h-16 w-16"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}