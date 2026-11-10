# Alternative 4D Engine Survey

A quick survey found no alternative engine that clearly beats Engine4D for a VR 4D Mölkky prototype.

## Source

- Source record: `raw/sources/alternative-4d-engine-survey.md`
- Accessed: 2026-04-30

## Candidates

| Candidate | 4D support | VR support / docs | Fit for this project |
| --- | --- | --- | --- |
| Engine4D | Strong Unity 4D game toolkit; used by 4D Golf | VR/XR work in progress, but repo includes OpenXR config and VR scripts | Best current fit |
| Engine4 | Unity 4D library with manual and 4D physics/rendering APIs | No clear VR documentation found | Interesting predecessor, but docs list limits and no published games |
| Forth Engine / Forth Library | Open-source C++ 4D rendering/manipulation, planned engine features | No clear VR documentation found | Too early and GPLv3; not a better path for a commercial-friendly Unity VR prototype |
| 4D Engine Unity | Unity raymarching plugin for 4D shapes | No clear VR documentation found | Useful rendering reference, but collision system is explicitly listed as needing work |
| Miegakure / 4D Toys tech | Proven 4D game / toybox lineage; 4D Toys has SteamVR history | Not available as a reusable engine; Miegakure FAQ says source is not released initially | Inspirational reference, not a practical engine choice |
| LÖVR | No native 4D game stack found | Excellent VR-first docs and OpenXR/Vulkan support | Strong VR engine, but would require building 4D rendering/physics/game tooling ourselves |

## Findings

Engine4D remains the strongest option because it is already a Unity toolkit for 4D and 5D games, has custom 4D physics, 4D object transforms, 4D mesh workflows, shaders, sample scenes, and existing VR scaffolding.

The best VR documentation found belongs to LÖVR, which is explicitly a VR framework with stereo rendering, controller input, hand tracking, haptics, spatial audio, and OpenXR/Vulkan support. However, LÖVR is a 3D/VR framework, not a 4D game engine.

Engine4 has a more polished manual than Engine4D in some respects, but its limitations page notes no GPU/hardware acceleration, limited physics shape support, no dedicated 4D graphics solution, and no real games published with the library so far.

Forth Engine is conceptually relevant because it is a successor to Engine4, but the public site calls it in main development, and the Forth Library README warns that it is in heavy development. Its GPLv3 license is also less convenient for a game prototype than Engine4D's MIT license.

4D Engine Unity is worth bookmarking as a raymarching reference, but its README frames collision detection as an area needing improvement and does not show VR-specific documentation.

Miegakure and 4D Toys are important design references, especially for 4D physics and player education, but they do not appear to offer a reusable public engine.

## Recommendation

Proceed with Engine4D as the baseline unless local Unity validation fails badly. Keep LÖVR in mind only as a fallback if the project shifts toward building a bespoke 4D renderer/physics layer in a VR-first framework.

## Sources

- [[Engine4D]]
- [[Engine4D Project Inspection]]
- https://willnode.github.io/engine4-doc/index.html
- https://forth-engine.github.io/
- https://github.com/forth-engine/forth-library
- https://lovr.org/
- https://github.com/aniketrajnish/4D-Engine-Unity
- https://miegakure.com/

