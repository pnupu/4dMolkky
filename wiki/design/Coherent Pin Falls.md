# Coherent Pin Falls

`0.10.2 · First Light` makes falls ground-led and visually continuous while preserving throw controls, scoring, and turn rules.

The current 0.10.3 build retains this motion byte-for-byte in the tested capture and adds [[Lakeside Camera and W Shadows]].

## Ground-led revision: 0.10.2

- The previous pins travelled up to 16.7 cm while still within 45° of upright. Delaying base sliding until after tipping begins reduces this to 2.4 cm in matched 60 FPS Air traces; the 31.4 cm opening landing span remains unchanged.
- Fallen pins settle flat at 90°, not 84°. Tipping takes approximately 0.25–0.34 seconds, followed by a decelerating skid within a 0.78-second total movement. Leaning retains a shorter animation.
- The default added W deflection is reduced from 1.0/0.70 to 0.30/0.21 for direct/cascade impacts. W displacement, polarity, and re-standing persist, but exact W landing positions deliberately change.
- Transient collision corrections persist and decay smoothly instead of being discarded at each animation update. For the matched pin-1 trace, the largest one-frame change in W velocity falls from 1.271 to 0.178 m/s. This is a discrete trace metric, not a claim of measured physical acceleration.
- With W aids enabled, falling/fallen pins use a continuous numbered wooden body projection rather than a mixture of shrinking slice fragments and flat blue/amber fills. G exposes strict slice geometry without changing poses or score. Ground-contact shading is a projected visual aid, not a physical shadow calculation.
- Patched non-development Air validation passes: 60 FPS capture, repeated 15 FPS capture, 24 sweep throws, 17 complete-match throws including exact 50 on turn 8 and a bust-to-25, and menu checks. All five final processes exit 0. The first 15 FPS capture wrote a passing report but crashed during native Mono/CoreVideo shutdown; it is retained as rejected lifecycle evidence, not silently counted as a clean pass. The repeat exits normally. No claim of fixing that intermittent native shutdown defect is made.
- Evidence: `artifacts/pin-fall-fix/grounded-final/`, including `motion-comparison.json` and `exit-codes.txt`. [Published gameplay and comparison](https://4d-molkky-unity-video-te-2dywdy3wcj-ilkka-lappetelainen.dev-pages.vinssi.ai), version `01a0707b-f073-7468-b23c-07d051cfb971`; current video bytes and browser playback verified.

## Previous revision: 0.10.1

## Motion and readability

- One angular trajectory drives X/Z/W together. Impact strength controls the initial tipping speed and time to the landing pose; the existing 420 ms settle budget remains unchanged.
- The pin turns around its moving base. Base travel decelerates, support height follows the actual rotated mesh, and a small bounded recoil/lift distinguishes ground settling from a smooth mid-air stop.
- Following the user's additional spread request, fallen pins now skid farther in X/Z, with a contact-side deflection that fans direct hits left/right. The ground-travel tuning is 12–32 cm across normalized strength; the fall threshold makes the effective minimum about 19 cm. W impulse magnitude and the short W skid are retained rather than increasing spread by hiding pins farther in W.
- Impact classifications, cascade strengths/delays, throw controls, scoring thresholds, and re-standing rules remain unchanged. Landing positions and the next-turn layout deliberately change; exact placement preservation from the initial motion-only fix no longer applies.
- Translucent blue −W / amber +W surfaces supplement the existing outlines for falling/fallen pins only. They project the same transformed pin pose, preserving a readable body when the true slice becomes thin or empty. Standing and leaning pins retain thin outlines to avoid obscuring the focused pin. G toggles both aids. They have no colliders and cannot score.
- Crowded transient contact correction now allows up to 128 passes, still exiting as soon as constraints are satisfied. The old 32-pass limit left a 1.759 mm overlap in a 60 FPS full-power break; a 15 FPS capture did not sample that failure.

## Evidence and limits

The initial motion-only revision matched all 4,320 baseline gameplay rows and settled poses exactly. The user then requested wider spread and gameplay testing specifically on the Air. The wider-scatter build is validated on the MacBook Air, not by the earlier local captures. The first tested throw still directly hits 1 and 2, cascades to 10, and scores 3, while its landing layout spreads farther apart.

The old trajectory's maximum fall-plane deviation was approximately 0.485 from its rounded CSV. The Air's corrected captures/sweep report less than 0.000000137. These are unit-axis residuals, not millimetres or video-derived physical measurements.

| Final-package check on the Air | Result |
| --- | --- |
| Standard captures at 15 and 60 FPS | Both passed; 1,800 rendered frames and 21,600 pin rows combined |
| Ground spread on the opening throw | Fallen landing span 31.4 cm, previously 6.15 cm; ground travel 21.9–26.2 cm, previously 3.8–4.1 cm |
| Contacts and floor | Minimum capsule gap about 1.00 mm; rendered floor clearance zero within floating-point precision |
| Varied-throw sweep at 15/30/60 FPS | 24 throws, 896 observed frames; plane, clearance, settlement, and re-standing checks passed |
| Complete matches | 26 throws; overshoot-to-25 and exact-50 win on turn 15 passed, plus pause/terminal rejection and restart |
| Menu/start/pause/resume/menu | Passed at 1280×720 |
| Projection readability | Fallen body projection observed; non-fallen body fills stayed hidden; contact sheet and focused-pin frame inspected |

Tests use the actual game's public throw/aim/turn operations and engine-rendered frames. They do not establish human keyboard/mouse feel or Windows execution. macOS universal and Windows x64 non-development builds compile; both receive Unity's official runtime remediation. The tested macOS assembly SHA-256 is `bf709b9f4ed0168749a419ca29067a0d49c93b836417a7c9a233682d9e72cc83`, matching the Air and local artifact copy. No local gameplay test is substituted for this final Air gate.

The reference-inspired trajectory and recoil are **design inferences**, not calibrated rigid-body parameters. This remains a deterministic gameplay solver with prescribed endpoints. Transparent projections may overlap in the image even when pins occupy separate W positions; only opaque wood represents the current slice. Capsule clearance does not certify exact mesh-to-mesh contact.

## Artifacts

- [Published Air gameplay, comparison, and slow motion](https://4d-molkky-unity-video-te-2dywdy3wcj-ilkka-lappetelainen.dev-pages.vinssi.ai), Vinssi version `01a07040-9b58-753e-93a5-77e3874e309b`. All published assets match the originals; all three current videos decode and advance in the browser without media errors. User-facing videos are always published to Vinssi before delivery.
- Release builds: `artifacts/releases/scatter-v0101/macos/FirstLight4D.app` and `artifacts/releases/scatter-v0101/windows/FirstLight4D.exe`.
- Baseline: `artifacts/pin-fall-fix/baseline/`, `baseline-sweep/`, and `baseline-match/`.
- Final-package gameplay validation runs on the Air: `artifacts/pin-fall-fix/air-final/`. Local copies of those reports/images are analysis artifacts, not local gameplay runs.
- Actual Air gameplay: `artifacts/pin-fall-fix/air-final/scatter-v0101.mp4`, 1280×720, 60 FPS, 24 seconds with game audio. `scatter-quarter-speed.mp4` is explicitly slowed for motion inspection.
- Rejected 60 FPS development capture: `artifacts/pin-fall-fix/readable-60/`; retained as overlap evidence, not a passing deliverable.
- Earlier `release-final/capture-60/` had a different aim/hit result and failed; it is not final acceptance evidence. The later Air run uses the intended straight-break scenario and passes.
- Capture/sweep commands and rate selection: `ops/unity-cycle.md`.

## Sources

- [[Mölkky Motion References]] — primary real-play references and observation limits.
- [[First Light Match]] and [[Rendered 4D Falls]] — previous gameplay, rendering, and collision contracts.
- `Assets/Prototype/Scripts/MolkkyPin4D.cs`, `MolkkyThrower4D.cs`, `MolkkyPinPresentation.cs`, and `MolkkyCaptureDemo.cs` within `external/Engine4D`.
