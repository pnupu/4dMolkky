# Authentic Field Playable

The `0.4.0 · Authentic Field` build replaces the prototype markers with regulation-derived Mölkky equipment and preserves the verified 4D throw, score, focus, and re-standing loop.

## Implemented

- Purpose-built 4D meshes use the official source dimensions: numbered pins are 5.9 cm in diameter and 15 cm at the tall edge, with a 45-degree face; the cylindrical throwing pin is 5.9 cm by 22.5 cm.
- All equipment is pale birch and the numbered faces initially point toward the throwing zone.
- The pins touch in the official near-to-far formation: `1 2`; `3 10 4`; `5 11 12 6`; `7 9 8`.
- The front of the rack is 3.50 m from a four-piece Mölkkaari built from 24 × 3.2 × 1.8 cm sections.
- The desktop camera uses a tighter field of view for legibility without scaling the equipment.
- The throwing pin is hidden between throws, launches as a cylinder rather than a ball, and uses swept 4D collision tests so a small target cannot be skipped between fixed frames.
- The existing score, miss, exact-50, bust-to-25, W focus, home-slice, reset, and next-turn re-standing behaviors remain active.
- The lakeside cabin, lake, dock, pine, birch, low dawn light, and uncluttered grass field remain the atmosphere layer.

## Verification

The macOS Development build compiled with Unity `2022.2.2f1`. A deterministic 270-frame run at 15 FPS passed with all numbers 1–12 present, pins 1 and 2 hit, two points awarded, a move to `W=-0.215`, re-standing at the same X/Z/W landing point, and full reset restoration.

Published evidence: [Authentic Field gameplay capture](https://4d-molkky-unity-video-te-2dywdy3wcj-ilkka-lappetelainen.dev-pages.vinssi.ai/).

## Known Gaps

- The current fall animation is deterministic and rule-shaped, not a complete rigid-body contact simulation.
- Superseded by [[Settled Rules Playable]]: scoring now waits for the scripted fall to settle, but support-collider and ground-contact judgment remain P0 work.
- The build currently implements a solo score/miss loop, not entrant/team turn order or official multiplayer elimination.
- Digits are projected onto the visible pin faces for desktop clarity; they are not yet baked into the moving 4D mesh material.
- Audio, throw variation, replay highlights, and VR input remain outside this slice.

## Build Cycle

`ops/unity_cycle.py` fingerprints scene-generation inputs, Unity build inputs, and captures separately. It serializes Unity access for this project, skips unchanged work, and rejects builds if Unity inputs change while the build runs. Scene generation and macOS build can share one Unity startup through `AutomatedMolkkyBuild.GenerateSceneAndBuildMacOS`.

Measured on the MacBook Air, the first complete run took 11.80 seconds for combined generation/build and 28.24 seconds for the deterministic capture. An unchanged second run validated and reused both artifacts in 0.44 seconds.

Multiple Unity instances must not build the same project path concurrently. Independent source, encoding, page, documentation, and review work can proceed in parallel; separate Unity clones can technically build concurrently, but are not recommended on the 16 GB MacBook Air during the jam.

## Sources

- [[IMO Tournament Rules]]
- [[Mölkky Rules]]
- [[Mölkky Rules Model]]
- [[Mölkky Rules Implementation Checklist]]
- [[Settled Rules Playable]]
- [Mölkky World equipment dimensions](https://www.molkky.world/molkky-rules)
