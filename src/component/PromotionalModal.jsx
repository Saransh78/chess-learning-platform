import { pieceImages } from "../data/pieceImages";

export default function PromotionModal({
  promotionPawn,
  promotePawn,
}) {
  if (!promotionPawn) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-800 rounded-xl p-6">
        <h2 className="text-white text-xl font-semibold mb-4 text-center">
          Choose Promotion
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {["queen", "rook", "bishop", "knight"].map((piece) => (
            <button
              key={piece}
              onClick={() => promotePawn(piece)}
              className="bg-zinc-700 hover:bg-zinc-600 p-4 rounded-lg transition"
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
