# Input Transition Safety

First Light 0.10.4 prevents retained throw inputs from becoming a new throw across a change of input context.

## Behavior

- Pause, restart, starting a match, and entering/leaving pointer selection cancel charging and block throw input until both Space and T are released. A new press is then required.
- Pointer selection cannot arm or quick-throw. Tab still opens/closes target selection; ordinary mouse aim and hold-duration power are unchanged.
- Beginning a charge stops automatic W focus at the current slice. The launch slice cannot continue moving underneath a held throw.
- Fresh Space hold/release and fresh T quick throws remain supported. Repeated held samples cannot quick-throw repeatedly.
- Scoring, pin motion, persistent W shadows, wide gameplay camera, and Finnish lakeside presentation are not redesigned by this change.

## Cause and checks

Previously pause/reset cleared the remembered Space state. A key still held after resume therefore appeared to be a fresh press. The shared `ProcessThrowInput` boundary now handles actual held samples from the same Update path and retains a release-before-rearm gate across transitions. It is not a separate test-only throw implementation.

The Air interface harness checks retained inputs after pause/restart, pointer cancellation, menu/start rejection, fresh charged/quick throws with repeat suppression, and a fixed W slice while armed. These six assertions pass in the patched non-development macOS build. The harness injects held input samples at the game's input boundary; it does not prove physical keyboard event delivery or unlocked foreground behavior.

## Sources and remaining risks

The five final Air jobs exit 0: 15/60 FPS captures, 24 varied throws over 967 frames, 17 match throws (exact 50 and bust-to-25), and the expanded interface test. All 17,280 60 FPS pin rows match 0.10.3 byte-for-byte. Both desktop targets compile and are runtime-patched; macOS signature verification passes. Windows execution and physical-input delivery remain unverified.

The actual Air recording is on the [existing Vinssi playtest page](https://4d-molkky-unity-video-te-2dywdy3wcj-ilkka-lappetelainen.dev-pages.vinssi.ai), version `01a070f3-41f5-75ed-b2b8-b37d72db5517`. The recording shows unchanged normal gameplay; the separate interface report, not that video, is the evidence for transition tests.

- `external/Engine4D/Assets/Prototype/Scripts/MolkkyPrototypeController.cs` and `MolkkyCaptureDemo.cs`.
- `artifacts/pin-fall-fix/input-final/` and `docs/RELEASE_CANDIDATE.md` for final regression/build evidence.
- [[Lakeside Camera and W Shadows]] and [[Phone Motion Controller]]. Phone ownership/network input remains separate and unimplemented.
