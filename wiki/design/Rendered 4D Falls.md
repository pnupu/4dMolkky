# Rendered 4D Falls

Prototype `0.9.0 · Rendered 4D Falls` connects the visible pin rotation to the same four-dimensional axis used by the contact solver.

## Recovered Development Context

The source conversation is Codex thread `01a0574c-47bf-7522-9b32-ad8f15c89ef9`, titled “It's the macbook air. The remote login is enabled. Do the verification”. Its standing request was to continue toward a playable demo, repair intersecting pins, and make pins fall into the fourth dimension. [[W-Fall Playtest]] was its last completed iteration.

## Confirmed Defect

The `0.8.0` pin animator changed Unity's quaternion and Engine4D's initialization-only `dualEuler` values without updating `Object4D.localRotation4D`. The renderer retained the upright matrix while the collision trace reported an 84-degree fall. The original acceptance gate compared synthetic capsules and never compared them with the rendered matrix.

A matched 360-frame baseline on the MacBook Air passed the old checks but failed the new rendered-axis and ground checks: maximum unit-axis distance was `1.338261`, and the rendered upright capsule extended `40.74 mm` below ground. This invalidates the earlier claim that the visible fall had been fully verified.

## Implementation

- Each animation frame applies Engine4D's existing `Transform4D.FromToRotation` to the pin's actual 4D matrix.
- Re-standing refreshes the rendered upright orientation; reset restores the initial 4D matrix.
- Ground support is calculated from the actual extruded pin mesh vertices, including its sloped top and W thickness, rather than an upright-only height.
- The capture checks the rendered world-matrix axis against the collision axis and measures the lowest rendered mesh vertex.
- An opt-in throw sweep exercises four power/aim combinations at 15, 30, and 60 FPS, with a second throw after W-preserving re-standing and pin focus.

## Validation

The final macOS Development build compiled on the MacBook Air in 13.50 seconds. Its 360-frame, 24-second gameplay capture passed every original rule/turn check and the new render checks:

- Maximum rendered/collision unit-axis difference: `2.17 × 10⁻⁷`, down from `1.338261`.
- Lowest rendered mesh point: at ground, never below it.
- Minimum pin capsule clearance across the complete capture: `0.743 mm`.
- Opening result remains pins `[1, 2, 10]` for three points, with signed W falls and W-preserving re-standing.
- The same final binary passed 24 additional throws across 915 frames at 15/30/60 FPS; minimum capsule clearance was `1.000 mm`, maximum axis error `1.78 × 10⁻⁷`, and no mesh penetrated the ground.
- Local and remote source hashes match. The three build-runner tests pass.

Baseline evidence is under `artifacts/video-tests/rendered-fall-baseline/`. Final video, reports, frame trace, cropped comparison sheet, sweep results, and build manifest are under `artifacts/video-tests/rendered-fall-v090/`. The standard capture took 111.98 seconds of wall time on the Air; the encoded video retains its simulation-time duration of 24 seconds.

[Actual gameplay video](https://4d-molkky-unity-video-te-2dywdy3wcj-ilkka-lappetelainen.dev-pages.vinssi.ai/).

The published MP4 matches the local SHA-256 and plays in the collaborative browser at 1280×720 for 24 seconds. The game process was relaunched on the Air, but its macOS session was locked; a final live keyboard/foreground check could not be performed. The recorded deterministic runtime checks above completed successfully.

## Remaining Boundary

Pin-to-pin contact still uses capsule proxies and deterministic cascade/placement logic. Matching the rendered axis does not make the extruded mesh a capsule or establish exact convex-mesh collision, support stacks, or reciprocal rigid-body impulses. The desktop target remains the playable test surface; this change does not establish VR support.

## Sources

- [[W-Fall Playtest]]
- [[Playable Desktop Demo]]
- [[Engine4D Technical Model]]
- Local implementation: `Object4D.cs`, `Transform4D.cs`, `MolkkyPin4D.cs`, and `MolkkyCaptureDemo.cs` under `external/Engine4D/Assets/`.
