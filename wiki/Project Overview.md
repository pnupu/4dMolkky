# Project Overview

This project explores a VR game that translates Mölkky into a four-dimensional play space.

## Current Thesis

The strongest direction is not "Mölkky with novelty math layered on top." It is a spatial target-throwing game where VR gives the player embodied aiming and throwing, while 4D mechanics create new tactics around slice position, hidden geometry, ghost projection, and higher-dimensional pin layouts.

## Known Anchors

- Engine4D is a Unity toolkit for making 4D and 5D games. See [[Engine4D]] and [[Engine4D Technical Model]].
- Engine4D has OpenXR configuration and VR-specific scripts, but its README still describes VR/XR as work in progress. See [[Engine4D Project Inspection]] and [[VR Feasibility]].
- A quick alternative-engine survey did not find a better combined 4D + VR candidate. See [[Alternative 4D Engine Survey]] and [[Engine Selection]].
- Engine4D is now included locally as a submodule at `external/Engine4D`; the first Unity validation checklist is in `docs/unity-validation-spike.md`.
- Mölkky's canonical loop is exact-score target throwing with field evolution after every throw. See [[Mölkky Rules]] and [[Mölkky Rules Model]].
- The LLM wiki pattern is being used so research, design decisions, and contradictions compound over time. See [[LLM Wiki Method]].

## Early Product Shape

- Platform: VR-first Unity prototype.
- Core fantasy: throw into a 4D arrangement of numbered pins and reason about targets that appear through a 3D slice or projection.
- First goal: prove that aiming, throwing, pin reading, scoring, and fourth-dimensional navigation can be understandable and fun.

## Major Risks

- VR rendering may require nontrivial work because Engine4D VR/XR support is not documented as complete.
- Mölkky's simple physical readability may be damaged by 4D abstraction unless the visualization is very clear.
- Physics interactions for throwing and pin impacts may need custom 4D behavior, because Engine4D does not use Unity's built-in physics for 4D objects.
- The 4D definition of "fallen pin" is a design and technical rule, not something inherited directly from real Mölkky.
- If Engine4D's VR path fails, the fallback likely means building much more custom 4D technology rather than switching to a ready-made better engine.
