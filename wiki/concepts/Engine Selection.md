# Engine Selection

The game now runs on a project-owned web engine: TypeScript, three.js, and a 4D rigid-body simulation in `game/`. Engine4D and Unity are the previous choice and remain as a reference.

## Decision

Use the web stack for the game. Decided 2026-11-10 by the owner, after a comparison of three options. Details of the build: [[Web Rebuild]].

## Rationale

- It is verified on the development machine. Headless Chrome on the MacBook Air renders WebGL 2 on the M4 GPU, so graphics and gameplay are checked after each change. No Unity Editor is installed on the Air.
- The cycle is about one second from a code change to a result. The Unity cycle was about 40 seconds for a build and a capture on the Air (`ops/unity-cycle.md`).
- Players open a link. There is no download, so the unresolved Gatekeeper rejection of the non-notarized Mac build does not apply ([[Hackathon Candidate 0.11.0]]).
- Tumbling pins needed new physics in every option. Engine4D's documented moving collider is a sphere ([[Engine4D Technical Model]]).
- WebXR gives a path to headsets from the same code.

## Costs accepted

- No reuse of Engine4D's slicing shaders, 4D mesh tools or scenes. Slicing and physics are project code and must be maintained here.
- A browser has a lower graphics ceiling than a native engine, and headset browsers have less performance headroom.
- A Steam release would need an app wrapper.

## Alternatives considered

- **Unity 2022.2.2f1 with Engine4D, clean project.** Proven 4D toolkit and a native path to Steam and headsets. Rejected: not installed on the Air, slow cycle, sphere-only physics, per-build Unity runtime patch, Gatekeeper block, and VR marked work in progress in Engine4D's README ([[Engine4D]]).
- **Godot 4 with project 4D code.** Free and small, native, OpenXR. Rejected: no 4D toolkit either, not installed, same download signing problem, and weaker automated visual checks on the Air.
- Earlier survey of 4D engines: [[Alternative 4D Engine Survey]].

## Reconsider if

- WebXR performance in a headset is unacceptable with a twelve-pin field.
- The contact model cannot be made robust enough without a general 4D convex collision library.
- A commercial native release becomes the main goal.

## Sources

- [[Web Rebuild]]
- [[Engine4D]], [[Engine4D Project Inspection]], [[Engine4D Technical Model]]
- [[Alternative 4D Engine Survey]]
- [[VR Feasibility]]
