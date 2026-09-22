# PREDICTED

PREDICTED is a dependency-free browser game about outsmarting an imperfect model that learns from the player's choices.

## Run & Operate

- `pnpm --filter @workspace/predicted-game run dev` — run the game preview
- `PORT=26062 BASE_PATH=/ pnpm --filter @workspace/predicted-game run build` — build the static game bundle
- `pnpm run typecheck` — full typecheck across all packages
- No backend, database, secrets, or API keys are required for the game.

## Stack

- pnpm workspace, Node.js 24, Vite
- Frontend: vanilla HTML, CSS, and JavaScript
- Build: Vite static bundle

## Where things live

- `artifacts/predicted-game/index.html` — static entrypoint and metadata
- `artifacts/predicted-game/src/main.js` — game state, prediction model, scoring, persistence, and rendering
- `artifacts/predicted-game/src/index.css` — responsive visual system and motion

## Architecture decisions

- The player model is local and intentionally imperfect: frequency, recency, transition weights, and a small error rate create room to bluff.
- Reward placement is randomized every turn so the highest-value lane does not become a fixed optimal choice.
- The run profile is stored in `localStorage`; no server state is needed for the first-session retention concept.

## Product

- A 60-second run presents three rewarded choices and exposes the model's current predicted move.
- Players can use mouse/touch or A/S/D keyboard controls, earn high-confidence bluff bonuses, and review an end-of-run archetype and challenge.

## User preferences

- Keep the prototype focused on the prediction/bluff loop; do not add accounts, multiplayer, progression systems, ads, or external AI services.

## Gotchas

- The artifact Vite config requires `PORT` and `BASE_PATH` for manual CLI builds; the managed preview workflow supplies them automatically.
- The source entrypoints use relative paths so the unbuilt static files can be hosted from a GitHub Pages repository path.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
