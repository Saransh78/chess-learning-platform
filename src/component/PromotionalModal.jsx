import { pieceImages } from "../data/pieceImages";

export default function PromotionModal({
  promotionPawn,
  promotePawn,
}) {
  if (!promotionPawn) return null;

  return (
    <div className="fixed inset-0 bg-obsidian/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative bg-charcoal border border-stone/50 rounded-2xl p-6 shadow-2xl shadow-black/60">
        <h2 className="text-ivory text-xl font-semibold mb-4 text-center">
          Choose Promotion
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {["queen", "rook", "bishop", "knight"].map((piece) => (
            <button
              key={piece}
              onClick={() => promotePawn(piece)}
              className="bg-slate-ash hover:bg-stone border border-stone/40 hover:border-bronze/50 p-4 rounded-lg transition"
            >
              <img
                src={pieceImages[promotionPawn.color][piece]}
                alt={piece}
                className="w-16 h-16"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}