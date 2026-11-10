# 4D Mölkky Wiki Index

This wiki tracks research, source notes, design synthesis, and open questions for a VR 4D Mölkky game.

## Orientation

- [[Web Rebuild]] - current game: browser build in `game/` with real 4D rigid-body physics, slice rendering, rack, rules and evidence.
- [[Hackathon Submission Readiness]] - September 2026 jam acceptance contract for the Unity build (historical): one polished, tested downloadable jam game; Steam and optional features deferred.
- [[Hackathon Candidate 0.11.0]] - fixed-window IL2CPP build, 27 clean Air jobs, public package/video evidence and remaining owner gates.
- [[Manual Aiming]] - last Unity candidate, 0.11.1: W selection no longer auto-aims; preserved motion, eight clean Air runs and explicit regression coverage.
- [[Project Overview]] - current thesis, goals, and major constraints.
- [[Prototype Scope]] - proposed first playable prototype and what it must prove.

## Source Notes

- [[Alternative 4D Engine Survey]] - survey of other 4D and VR engine options.
- [[Engine4D]] - Unity toolkit for 4D games; core technical source for feasibility.
- [[Engine4D Project Inspection]] - repository metadata and first script-level inspection.
- [[Unity Mac IL2CPP Build Compatibility]] - verified matching module and temporary zlib platform-guard adjustment for the Air's SDK.
- [[Steam Release Requirements]] - verified Valve release gates, content survey, artwork specifications, rights questions, and Unity runtime remediation.
- [[LLM Wiki Method]] - source method used to maintain this repository.
- [[Mölkky Rules]] - canonical scoring loop, setup, dimensions, and knockdown criteria.
- [[Mölkky Motion References]] - real-play video comparisons and the current staged-fall timing diagnosis.
- [[Safari Video Delivery]] - mobile playback failure, byte-range evidence, short-clip Blob delivery, and WebKit verification limits.
- [[IMO Tournament Rules]] - official 2024 international rules for deterministic judging, team turns, elimination, and boundaries.
- [[Nimble Game Jam]] - dates, rules, participation requirements, and project implications for the September 2026 jam.
- [[4D Golf Devlogs]] - local transcript corpus and lessons from HackerPoet's 4D Golf development series.

## Concepts

- [[4D Mölkky Design Problem]] - what changes when Mölkky moves from 3D to 4D.
- [[4D Pin Geometry]] - candidate shapes and readability strategy for pins.
- [[Engine Selection]] - web engine decision of 2026-11-10, its costs, the Unity and Godot alternatives, and when to reconsider.
- [[Engine4D Technical Model]] - scene, object, mesh, shader, and physics assumptions, including runtime rotation matrices and the measured floor surface.
- [[Mölkky Rules Model]] - how scoring, field evolution, and knockdown rules should carry into 4D.
- [[Phone Motion Controller]] - isolated native iPhone practice spike, proposed integration contract, timed throwing, and physical-device validation limits.
- [[VR Interaction Model]] - candidate hand, head, slice, and throwing controls.
- [[VR Feasibility]] - current evidence and risks around VR/XR support.

## Design

- [[Coherent Pin Falls]] - 0.10.2 ground-led tipping, continuous wooden projections, retained wider scatter, Air validation, and published Vinssi videos.
- [[Lakeside Camera and W Shadows]] - 0.10.3 wider camera, persistent off-slice shadows, seven clean Air jobs, and corrected mobile-video delivery.
- [[Input Transition Safety]] - 0.10.4 release-before-rearm, pointer cancellation, and fixed W position during charging.
- [[Steam Release Preparation]] - deferred commercial-release reference, not the hackathon acceptance checklist.
- [[First Light Match]] - `0.10.0` solo game, corrected visible pins, physical numbering, W navigation, menus, settings, and sound.

- [[Desktop Prototype Plan]] - next desktop-first implementation plan after macOS XR blocker.
- [[First Light Playable]] - implemented `0.2.0` lakeside-dawn slice, verification evidence, current controls, and remaining risks.
- [[Authentic Field Playable]] - implemented `0.4.0` regulation-derived equipment, 3.5 m field setup, verified 4D turn, and faster build cycle.
- [[Settled Rules Playable]] - implemented `0.5.0` settle-timed scoring, affected-versus-fallen classification, and X/Z/W-preserving re-standing.
- [[Pin Cascade Playable]] - implemented `0.6.0` deterministic pin-to-pin impulse transfer, leaning states, causal W movement, and frame-level motion proof.
- [[Playable Desktop Demo]] - implemented `0.7.0` charged throws, a complete solo match loop, non-intersecting pin settlement, pause/recovery, and multi-turn runtime proof.
- [[W-Fall Playtest]] - implemented `0.8.0` contact-side W toppling, exact throwing-skittle contact, per-frame capsule separation, and W-preserving field evolution.
- [[Rendered 4D Falls]] - `0.9.0` corrects the previously unchanged rendered pin rotation and verifies mesh grounding, axis agreement, and varied multi-turn throws.
- [[Game Jam Preparation]] - pre-jam registration, Unity, hardware, XR spike, fallback, and submission checklist.
- [[Game Jam Weekend Runbook]] - agent-operated 48-hour schedule, phone steering, Unity automation, evidence, gates, and submission controls.
- [[Feature Inventory]] - prioritized full-game backlog and the 4D consequence of every major system.
- [[Mölkky Rules Implementation Checklist]] - jam-critical rules checklist, competitive extensions, and exact acceptance tests.
- [[Prototype Scope]] - milestone definition for the first playable slice.

## Questions

- [[Research Backlog]] - open questions to investigate next.
