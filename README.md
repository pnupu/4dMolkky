# 4D Mölkky

Mölkky with four spatial dimensions, and the research wiki behind it.

## Current state

The game is the browser build in [`game/`](game/README.md): **4D Mölkky · First Light**. It was rebuilt from nothing in November 2026 with TypeScript and three.js.

**[Play it in the browser](https://4d-molkky-first-light-9mux3zyu6w-ilkka-lappetelainen.pages.vinssi.ai)** · [Watch 42 seconds of gameplay](https://4d-molkky-web-rebuild-ga-pzv2n3ck9h-ilkka-lappetelainen.pages.vinssi.ai)

- Pins and the throwing skittle are 4D rigid bodies. They fall, roll and scatter in all four directions.
- You see one 3D slice of the field. Scroll to turn the slice through the fourth dimension. Pins outside the slice show as blue and amber ghosts, and on a 4D compass.
- Standard Mölkky rules: twelve pins, exactly 50 to win, over 50 drops to 25, three misses in a row end your game. Solo, or two to four players on one screen.
- A Finnish lakeside at first light, drawn with procedural shaders. All sound is synthesised. The build has no image or audio files.

```sh
cd game
bun install
bun run dev      # http://localhost:5183
bun run test     # 36 tests: 4D maths, physics, rules, slicing
bun run build    # static site in game/dist
```

Design, decisions and evidence: [`wiki/design/Web Rebuild.md`](wiki/design/Web%20Rebuild.md) and [`wiki/concepts/Engine Selection.md`](wiki/concepts/Engine%20Selection.md).

Not built yet: VR (the planned path is WebXR), and a recorded human playtest.

## Repository map

- `game/` is the game: source, tests and browser check scripts.
- `wiki/` is the LLM-maintained design and research wiki. Start at `wiki/index.md`.
- `raw/sources/` holds immutable source records. It stays local and is not in the public repository.
- `docs/`, `ops/` and `experiments/phone-controller/` belong to the earlier Unity prototype and its September 2026 game-jam candidate. They are kept as history.
- `external/Engine4D` is HackerPoet's Engine4D as a git submodule. The earlier prototype was built on it. The current game does not use it.

## Earlier Unity prototype

`0.11.1 · First Light` was the last Unity candidate (Unity 2022.2.2f1 with Engine4D). Its evidence and limits are in `docs/RELEASE_CANDIDATE.md`, `docs/KNOWN_ISSUES.md` and the wiki pages `Manual Aiming` and `Hackathon Candidate 0.11.0` under `wiki/design/`. Its source lived as local changes inside the submodule and is not part of this repository.

To fetch Engine4D for reference:

```sh
git submodule update --init --recursive
```
