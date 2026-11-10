# First Light Playable

The `0.2.0 · First Light` build is the first verified playable slice: a desktop 4D Mölkky throw and score loop staged at a Finnish lakeside cabin at dawn.

## Implemented

- Five pins begin together in the player's `W=0` slice.
- A tuned physical throw can hit the center pin from the starting position.
- Single-pin and multi-pin scoring, bust-to-25, exact-score win, and three-miss loss are enforced as game states.
- Hit pins fall and move into W, then stand at their landing position before the next throw.
- The HUD shows score, misses, current W, result text, controls, pin states, and a center reticle.
- `F` focuses successive pin slices; `0` returns to the home slice. Camera movement and view changes lock during flight.
- The scene uses Engine4D-native geometry for a grass clearing, lake, dock, red cabin, trees, and a first-light horizon.

## Verification

The macOS build compiled with Unity `2022.2.2f1`. A deterministic 210-frame capture at 15 FPS scored pin 2, moved it to `W=+1.21`, focused that slice, returned to `W=0`, and emitted a passing JSON report.

Published evidence: [First Light gameplay capture](https://4d-molkky-unity-video-te-2dywdy3wcj-ilkka-lappetelainen.dev-pages.vinssi.ai/).

## Open Risks

- Input is still keyboard/mouse; the native iPhone throwing controller is not connected.
- Pins use a colour legend in the HUD rather than numbers projected onto the moving geometry.
- The rules state machine needs edit-mode tests before it becomes safe to extend quickly during the jam.
- The current build is a Development build and has no sound, replay highlight system, or VR interaction.

## Next Vertical Slice

Connect a single iPhone controller to the working `TryThrow` boundary, preserve keyboard input as the fallback, and record one real touch-and-motion throw against the same deterministic gameplay checks.

## Sources

- [[Prototype Scope]]
- [[Desktop Prototype Plan]]
- [[Phone Motion Controller]]
- [[Mölkky Rules Model]]
