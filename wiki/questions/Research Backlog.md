# Research Backlog

Open questions to answer before implementation decisions harden.

## Source Ingestion

- Inspect Engine4D sample scenes in Unity, not only as repository files.
- Inspect Engine4D prefabs, especially `MainCamera` and sample `UICanvas`.
- Find any issues, branches, commits, or discussions mentioning VR/XR in Engine4D.
- Ingest Unity XR/OpenXR setup notes relevant to Unity 2022.2.2f1 and OpenXR 1.6.0 if we proceed with implementation.
- Optionally inspect LÖVR examples if Engine4D VR validation fails.

## Gameplay Design

- Define the first 4D pin layout.
- Decide whether first throwing object is a baton analogue visually with a sphere proxy physically, or a fully simplified sphere.
- Decide how W-axis inspection works in VR controllers.
- Decide whether the player can rotate in 4D or only move the slice.
- Define a readable knocked-over state for 4D pins.
- Decide whether the prototype target score is exactly 50 or shortened for testing.

## Technical Feasibility

- Verify Engine4D in a local Unity version using `docs/unity-validation-spike.md`. Initial desktop validation passed in Unity `2022.2.2f1`.
- Test whether Engine4D's rendering stack works with Unity XR on a supported runtime. macOS OpenXR Play Mode is blocked by Unity/OpenXR platform support.
- Estimate cost of stereo 4D projection rendering.
- Determine whether built-in `Physical4D` is enough for throwing and pin impact.
- Decide what has to be custom versus inherited from sample code.
- Determine whether 4D pin toppling should use physics, explicit state transitions, or a hybrid.
- Decide whether Engine4D passes the validation gates in [[Engine Selection]] before building larger systems on top.

## Wiki Maintenance

- Add pages for pin geometry, throwing interaction, scoring variants, and 4D visualization once researched.
- Run a lint pass after 5-10 more pages to find missing links and contradictions.
