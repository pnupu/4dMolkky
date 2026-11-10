# Prototype Scope

The first playable prototype should prove whether 4D Mölkky is legible and physically satisfying before committing to full VR production.

## Prototype Goal

Create a minimal 4D target-throwing loop:

- a small numbered pin set,
- one throwable object,
- slice or W-layer inspection,
- collision feedback,
- basic scoring,
- reset or next-throw flow.

## Suggested Milestones

1. Engine4D import and sample scene validation.
2. Static 4D pin field with slice and ghost projection readability.
3. Rules model: numbered pins, fallen-pin detection, exact-score scoring, and miss tracking.
4. Simple throwable using Engine4D physics and a sphere-like collision proxy.
5. Pin hit detection and knocked/standing state.
6. XR rendering feasibility test.
7. VR throwing and slice-control experiment.

## Prototype Constraints

- Use simple shapes before investing in bespoke 4D pin meshes.
- Keep pin count low until readability is proven.
- Prefer constrained W layers over arbitrary 4D free movement for the first test.
- Preserve Mölkky's scoring identity, but allow a shorter debug target score during iteration.
- Treat final pin dimensions as secondary until throwing and readability are proven.

## Done Criteria

The prototype succeeds if a tester can understand what they are aiming at, make a deliberate throw, see why a pin was hit, and understand the score result.

## Current Status

`0.7.0 · Desktop Match` clears the playable solo desktop gate. It has a deliberate hold/release throw, legal launch origin, complete multi-turn score/re-stand/recovery loop, first-run rules and controls, pause/restart/quit, non-intersecting result placement, retained exact-50/bust rules, and a runtime-verified three-miss loss. See [[Playable Desktop Demo]]. Phone motion input and VR remain separate validation gates.

## Sources

- [[Engine Selection]]
- [[Engine4D]]
- [[Engine4D Project Inspection]]
- [[4D Mölkky Design Problem]]
- [[4D Pin Geometry]]
- [[Mölkky Rules]]
- [[Mölkky Rules Model]]
- [[VR Feasibility]]
- [[VR Interaction Model]]
