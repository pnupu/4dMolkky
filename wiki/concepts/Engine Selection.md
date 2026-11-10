# Engine Selection

Engine4D is the current default engine choice, but the decision should stay provisional until Unity and VR validation are complete.

## Decision

Use Engine4D for the first technical spike.

Current status: desktop import, compile, and sample-scene play mode have passed in Unity `2022.2.2f1`. XR validation remains open.

## Rationale

- It is a Unity toolkit specifically built for 4D and 5D games.
- It is the core of 4D Golf, which is the closest known production-quality reference to this project.
- It includes 4D object transforms, mesh workflows, custom physics, camera slicing, ghost projections, and sample scenes.
- Its repository includes OpenXR configuration and VR-specific scripts.
- It is MIT licensed.

## Alternatives Considered

See [[Alternative 4D Engine Survey]].

The short version: no surveyed alternative has a stronger combined package of 4D gameplay support, practical Unity integration, permissive licensing, and plausible VR path.

## Validation Gates

Engine4D should be reconsidered if:

- the VR rendering path fails in a way that requires rewriting most of the camera/shader stack,
- `Physical4D` cannot support even simplified throwing and target collision,
- project performance is unacceptable in headset with a small pin field.

## Fallback Paths

- Use Engine4D for desktop 4D prototype first, then port the validated interaction model to another VR stack later.
- Use LÖVR if the project becomes VR-first and accepts building a custom 4D layer from scratch.
- Use 4D Engine Unity only as a rendering reference, not as the main gameplay engine, unless its collision and interaction gaps are resolved.

## Sources

- [[Alternative 4D Engine Survey]]
- [[Engine4D]]
- [[Engine4D Project Inspection]]
