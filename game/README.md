# 4D Mölkky · First Light

Mölkky with four spatial dimensions, in the browser. TypeScript and three.js. No Unity.

## Run

```sh
cd game
bun install
bun run dev        # http://localhost:5183
```

`bun run build` writes a static site to `dist/`. It uses relative paths, so it runs from any folder on any static host.

## Play

- **Aim** with the pointer. **Hold** the button (or Space) to charge. **Release** to throw. The ring shows where the skittle lands.
- **Scroll**, `Q` `E` or `←` `→` turn your view through the fourth dimension. Click a pin in the compass to turn to it. `0` turns back.
- `W` `S` change the loft. `T` changes how you hold the skittle: Wide, Deep (points into the hidden direction) or Spear.
- `V` zooms in. `L` shows or hides pin numbers. `M` mutes. `Esc` pauses.
- One fallen pin scores its number. Several score their count. Exactly 50 wins. Over 50 drops you to 25. Three misses in a row end your game.

## How the fourth dimension works

- The world has four axes: X and W sideways, Y up, Z along the throw. The ground is three-dimensional (X, Z, W).
- A pin is a spherinder: a solid ball in three directions, extruded along its axis. Its base is a ball, so it stands on the 3D ground.
- You see a 3D slice of the 4D world. The slice always contains up and the throw direction. Scrolling turns its sideways axis from X toward W.
- A pin whose centre is `d` from your slice shows with radius `sqrt(R² − d²)`. Beyond `R` it is out of your slice and shows as a blue or amber ghost.
- The opening rack is a close-packed cluster in the three ground directions: six pins in your first slice, three on each hidden side.
- Physics is a real 4D rigid-body simulation. Pins fall and scatter in W too, and are stood up where they land.

## Code map

| Path | What it holds |
| --- | --- |
| `src/math4.ts` | 4D vectors, rotations, bivectors |
| `src/physics/shape.ts` | Pin and skittle shape: signed distance, mass, inertia |
| `src/physics/world.ts` | Rigid bodies, contacts, solver |
| `src/game/field.ts` | Rack, throw, judging, re-standing |
| `src/game/rules.ts` | Scoring and turn order |
| `src/render/slicer.ts` | Cuts 4D tetrahedral meshes into the visible 3D mesh |
| `src/render/` | Pins, sky, lake, ground, grass, cabin, aim guide, dust |
| `src/ui/` | HUD, 4D compass, pin labels, menus |
| `src/audio.ts` | Synthesised sound |
| `src/app.ts` | Game loop, input, camera |

## Checks

```sh
bun run typecheck
bun run lint
bun run fmt:check
bun run test
```

Browser checks need the dev server and Google Chrome:

```sh
bun scripts/shot.ts http://127.0.0.1:5183/ <output-dir> match   # plays a whole match, saves screenshots
bun scripts/perf.ts                                             # frame times
bun scripts/sim-throws.ts                                       # physics outcomes and step cost, no browser
```

The page exposes `window.molkky` for these scripts: `state()`, `throw({...})`, `start(names)`, `setSlice(angle)`.

## Limits

- Desktop is the tested target. Phones get a working layout and turn buttons, but are not tuned.
- No VR mode yet. The renderer is WebGL through three.js, so WebXR is the planned path.
- Contacts use rim points against signed distances. Two rims that cross each other can overlap by a few millimetres before they are caught.
