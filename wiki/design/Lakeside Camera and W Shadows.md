# Lakeside Camera and W Shadows

`0.10.3 · First Light` restores a wider gameplay camera and keeps off-slice pins discoverable without changing the accepted pin motion.

## Presentation contract

- Normal play, new matches, resets, and the menu use a 50° field of view instead of the earlier 10° close-up. The Finnish lakeside cabin, dock, and field are visible again. V selects an optional 18° inspection view; it changes only the lens, not the launch position or aim.
- W-outline silhouettes and ground-contact shadows remain enabled regardless of G or W distance. The old 0.7 m visibility cutoff no longer hides these shadows. Blue denotes negative W and amber positive W relative to the viewed slice.
- G controls full-body fall aids only. Turning them off reveals literal wooden slices but retains persistent W shadows. Whole-body aids still fade with distance so they do not fill the entire field with solid-looking off-slice pins.
- These shadows are projected visual aids, not rigid-body geometry, additional scoring pins, or a claim of physically simulated four-dimensional illumination.
- The 0.10.2 ground-led fall, smoothed transient contact response, 31.4 cm opening landing span, controls, scoring, and turn rules are retained. See [[Coherent Pin Falls]].

## Air evidence

The complete 60 FPS gameplay CSV matches all 17,280 rows of the 0.10.2 trace byte-for-byte. The camera/shadow update does not change that tested game's simulation.

Seven final processes exit 0: 15/60 FPS captures, 24 varied throws over 967 frames, 17 full-match throws, and menu/camera flows at 960×600, 1280×720, and 1920×1080. Captures verify persistent ground and W shadows, including the far-W miss sequence and G toggles; interface checks verify the normal/inspection lens pair without moving the player. Actual Air screenshots were inspected at normal, inspection, and W=+2 views.

- Reports, screenshots, source hashes, and the 24-second 60 FPS recording: `artifacts/pin-fall-fix/lakeside-final/`.
- Air release: `/Users/ilkka/4dmolkky/artifacts/releases/lakeside-v0103/macos/FirstLight4D.app`. macOS universal and Windows x64 non-development builds compile and receive Unity's runtime remediation. macOS deep/strict signature verification passes.
- Tested macOS assembly SHA-256: `0c8b10537d01d22aea6e4c70c434bdf8ee358fe29272e2adfb196f190af9d21a`.
- [Published wide-camera gameplay and fall comparisons](https://4d-molkky-unity-video-te-2dywdy3wcj-ilkka-lappetelainen.dev-pages.vinssi.ai), version `01a07089-79a7-7479-94c8-7615e089ceea`: 16 files, 7,678,861 bytes. All assets return HTTP 200 and match staged bytes; all three embedded videos decode and advance without browser errors.

## Remaining limits

The initial 16-file publication's desktop playback check did not establish mobile compatibility. The user reported failure on mobile; the range probe and WebKit reproduction confirmed a delivery gap. The replacement publication `01a070dd-fc83-7523-9051-61856a7f187b` has 17 files and 7,681,706 bytes, with unchanged footage and on-demand local-Blob playback. All assets match over HTTP; all three clips advance and seek in muted WebKit iPhone emulation, including network retry. See [[Safari Video Delivery]]. An unmuted WebKit run stalls despite readyState 4; an independent synthetic H.264/AAC control also stalls without any server. This limits the audio harness evidence, not proof that phone sound is verified.

Physical keyboard/mouse feel, Windows execution, and phone-to-game throwing are not established by these automated tests. The earlier 0.10.2 native Mono/CoreVideo shutdown crash remains recorded; seven clean 0.10.3 exits do not prove it impossible. The game remains a deterministic gameplay solver, not general-purpose 4D rigid-body physics or a Steam-approved release.

## Sources

- [[First Light Playable]], [[First Light Match]], and [[Coherent Pin Falls]].
- `MolkkyPrototypeController.cs`, `MolkkyPinPresentation.cs`, `MolkkyCaptureDemo.cs`, and `MolkkyNearby4D.shader` under `external/Engine4D/Assets/Prototype/`.
- `ops/unity-cycle.md` and `ops/vinssi-pages.md` for reproduction and publication.
