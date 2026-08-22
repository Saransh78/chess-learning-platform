# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Club and amateur chess players doing post-game review. They upload PGNs exported from Chess.com or Lichess (or recorded over the board) and replay/analyze them to improve. Confirmed with the user, 2026-08-21.

## Product Purpose

KnightMind is an AI-based chess learning platform. It turns uploaded games into improvement: Stockfish analyzes every position move by move, while the AI Coach studies patterns across multiple games to surface recurring weaknesses, tactical blind spots, opening trends, and personalized study recommendations. Success means a player understands why they lose games and what to train next.

## Positioning

Pattern-level coaching across many games — answering "why are you losing and what should you fix" — rather than only per-position engine evaluation. An engine-only analysis tool could not truthfully claim this mechanism.

## Operating Context

Post-game review sessions in the browser, desktop-first with tablet/laptop support. Games arrive as PGN files from Chess.com/Lichess exports. Everything runs client-side today: React SPA, chess.js for rules/PGN parsing, Stockfish 18 WASM served from `public/`.

## Capabilities and Constraints

Confirmed functionality that must be preserved:

- Interactive board with full rules (castling, en passant, promotion, check/mate/stalemate) and board flipping
- PGN upload, multi-game parsing, multi-game browser, instant game loading
- Replay system: undo/redo, keyboard navigation, clickable notation, jump to position, move highlighting
- Engine toggle; Stockfish integration (`src/Engine/stockfishEngine.js`, `useStockfish` hook)
- GameContext state management

Constraints:

- No backend today; fully client-side. The ML pipeline (Python/scikit-learn, 45+ features) exists separately and is not yet wired to the app.
- AI Coach UI ships now with realistic placeholder data until the model connects.
- Terminology is binding: "AI Coach" and "AI Report" everywhere; never "ML Coach"/"ML Report".

Undecided (do not invent): auth/cloud-save design, accuracy-calculation details, deployment target.

## Brand Commitments

- Name: **KnightMind**. Tagline: "AI Based Learning Platform". Hero message: "Train like a grandmaster. Learn like a coach."
- Permanent color system **Obsidian Bronze**: background `#171614`, surface `#22201D`, elevated `#2F2B27`, border `#4A443C`, divider `#6E675E`; text `#F4EFE7` / `#B7AFA2` / `#8E8578`; bronze `#C89B5A` (hover `#D8A867`, antique brass `#B78643`); sage `#7FA38A` / `#A8C1A5` as recognizable secondary identity (~70% warm neutrals / 15% bronze / 10% white / 5% sage). Typography: Inter.
- Feel: premium chess craftsmanship — Chess.com simplicity, Linear spacing, Aesop elegance; never a generic AI-startup look. The board is the visual hero.

## Evidence on Hand

- README.md feature/vision documentation; `screenshots/board.png`.
- A working app with real PGN parsing and replay to demo against.
- No testimonials, benchmarks, pricing, or customer logos exist — future work must not fabricate them.
- Author: Saransh Verma.

## Product Principles

1. Coaching over evaluation — every surface answers "what should I improve next", not just shows numbers.
2. Patterns beat positions — insight comes from across many games, not one moment.
3. Meet players where their games live — PGN import from popular platforms is the front door.
4. Honest intelligence — placeholder coach data stays plausible-but-stub until wired; never fabricate claims.
5. The board is the hero — chrome recedes; craft lives in the details.
