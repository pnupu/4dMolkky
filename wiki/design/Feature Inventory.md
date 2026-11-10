# Feature Inventory

This is the product backlog for a complete, presentable 4D Mölkky game, separated into jam-critical, important, and post-jam work, with the extra consequences introduced by four-dimensional play.

## Priority Key

- **P0:** required for a coherent jam submission.
- **P1:** important polish or a strong stretch goal.
- **P2:** post-jam/full-game feature.
- **Current:** already present at least in prototype form and still needs production validation.

## Core Match Loop

| Priority | Feature | 4D consequence |
|---|---|---|
| P0 / Current | Start, aim, throw, resolve, score, reset loop | Every throw needs an explicit active slice and W state. Resolution must wait for motion across all four axes to settle. |
| P0 / Current | Throwable physics | Decide whether throws are restricted to the active 3D slice or can have W velocity. Clamp accidental W impulses. |
| P0 / Current | Pin hit and knockdown detection | “Fallen” needs a 4D definition. A pin moving out of the slice is not automatically fallen. |
| P0 / Current | Score counting | Single-pin number versus multi-pin count is unchanged, but all pins hit across W must be included consistently. |
| P0 / Current | Bust rule | Score over 50 resets to 25; dimensional position must not affect the rule. |
| P0 / Current | Miss counting and elimination | A miss cannot be inferred from invisibility; wait for the complete 4D outcome. |
| P0 | Pin repositioning after valid throws | Re-standing pins at their fallen 4D positions can spread the field in W and become unreadable; choose constrained W bands or an explicit re-slice rule. |
| P0 | Turn state machine | Lock controls during resolution, slice transitions, scoring, and replay so network or phone events cannot double-throw. |
| P0 | Win/lose state and restart | End screen must preserve the final 4D state long enough to understand the result. |
| P1 | Multiple local players | Store per-player score/misses while sharing one 4D field. Show whose slice and controller calibration are active. |
| P2 | AI player | AI needs a 4D shot planner and a legible visualization of its chosen slice/trajectory. |
| P2 | Online multiplayer | Synchronize 4D transforms, authoritative physics, slice state, and controller events; much larger scope than hot seat. |

## Aiming, Camera, and 4D Comprehension

| Priority | Feature | 4D consequence |
|---|---|---|
| P0 / Current | Slice view | Always display the active W coordinate and make slice changes animated rather than instantaneous. |
| P0 / Current | Ghost/projection view | Encode hidden-axis distance with opacity/color and avoid visual overload when many pins overlap. |
| P0 | Pin focus | Selecting a pin moves or rotates to its 3D slice; show the path, target W, and a one-action return to the throw slice. |
| P0 | Target labels | Labels need occlusion and W-distance handling so numbers remain attached to the correct ghost/slice object. |
| P0 | Aim preview | Show projected direction and power without falsely promising a deterministic trajectory through 4D collisions. |
| P0 | Compass/orientation aid | A conventional compass is insufficient; show the 3D ground-direction representation and active W relation. |
| P0 | Reset/recenter view | Players will get lost after 4D rotation. One action must return to a known canonical view. |
| P1 | Slice history/breadcrumbs | Mark the throw slice, focused target slice, and previous slice to prevent disorientation. |
| P1 | Overview/map | A compact W-layer diagram or projection should show player, pins, and selection without pretending 4D is a flat map. |
| P1 | Adjustable ghost modes | Offer slice-only, nearby ghosts, all ghosts, and W color bands for performance and accessibility. |
| P2 | Free 4D exploration | Six rotation planes create high cognitive and control complexity; constrain or teach them progressively. |

## Input and Phone Controller

| Priority | Feature | 4D consequence |
|---|---|---|
| P0 | Keyboard/mouse fallback | Must expose every required action even if phone, Tailscale, or VR fails. |
| P0 | Phone pairing/status | Show controller identity, packet age, signal health, calibration, trigger state, and selected input source. |
| P0 | Motion calibration | Map phone coordinates to game coordinates and current slice orientation; support left/right-handed grips. |
| P0 | Hold/release trigger | Use a full-screen native touch trigger. Release is a reliable acknowledged network event; motion packets can be lossy. |
| P0 | Motion-to-throw filter | Use short-window attitude/acceleration/rotation data, smoothing, dead zones, clamping, and repeatable low-force gestures. |
| P0 | Phone focus controls | Selecting a pin changes W intentionally; prevent focus commands while a throw is armed. |
| P0 | Reconnect/fallback | Losing the phone mid-throw must cancel safely and immediately enable keyboard/mouse. |
| P0 | Native iOS client | SwiftUI, Core Motion, haptics, foreground/wake handling, UDP transport, and diagnostics are the sole phone target. |
| P1 | Action button shortcut | Use a one-shot App Shortcut for launch, reconnect, or recalibrate—not held throw release. |
| P1 | Controller tuning screen | Visualize raw versus filtered motion and allow sensitivity, power curve, grip, handedness, and calibration changes. |
| P2 | VR controllers | Stereo UI, tracked hands, controller mapping, comfort, and performance are a separate platform project. |

## Rules and Game Modes

| Priority | Feature | 4D consequence |
|---|---|---|
| P0 | Short jam mode | Use fewer pins or a lower target score while clearly labeling deviations from official Mölkky. |
| P1 | Standard rules mode | Twelve pins, target 50, bust to 25, three misses, and correct repositioning need full validation in 4D. |
| P1 | Tutorial challenges | Teach slice, ghost, focus, throw, W movement, single-pin score, multi-pin score, and bust separately. |
| P1 | Practice sandbox | Freeze/reset selected pins and expose W so players can build intuition without match pressure. |
| P1 | Daily/seeded challenge | Seed all 4D positions and physics-relevant randomness for comparable results. |
| P2 | Campaign/progression | New W mechanics must be introduced incrementally; avoid levels that reduce to ordinary 3D. |
| P2 | Custom rules | Expose target, miss limit, pin count, W bands, throw-W permission, and focus assistance. |

## UI, Menus, and Settings

| Priority | Feature | 4D consequence |
|---|---|---|
| P0 | Title/start screen | State desktop/phone requirements and offer a no-phone start path. |
| P0 | Pause menu | Pause physics, phone arming, and replay recording together. |
| P0 | In-game HUD | Score, misses, player, throw state, selected pin, W/slice, controls, and connection status compete for space; prioritize context. |
| P0 | Results screen | Explain which pins counted and why, including their W positions and final standing/fallen test. |
| P0 | Basic settings | Master/music/effects volume, resolution/fullscreen, quality, mouse sensitivity, phone sensitivity, handedness, and reset defaults. |
| P0 | Controls/help page | Separate throw controls from slice/focus controls and visualize phone orientation. |
| P1 | 4D visualization settings | Ghost opacity, W color palette, projection density, labels, transition speed, and reduced visual complexity. |
| P1 | Accessibility settings | Colorblind-safe W encoding, text scale, reduced motion, high contrast, remapping, subtitles, and non-motion input. |
| P1 | Save settings | Persist versioned settings safely and recover from incompatible values. |
| P2 | Profiles/statistics | Stats must define whether throws across different assistance/4D modes are comparable. |

## Feedback, Audio, and Presentation

| Priority | Feature | 4D consequence |
|---|---|---|
| P0 | Throw feedback | Show armed/released state, power, direction, and whether motion data was fresh. |
| P0 | Hit/score feedback | Use spatial audio, impact effects, labels, and a score breakdown even when the struck pin is outside the slice. |
| P0 | W-transition feedback | Animate, color, and sound slice/focus changes so objects do not appear to teleport arbitrarily. |
| P0 | Basic environment/art | Use low-poly 4D-native shapes and procedural/world-coordinate materials; conventional 3D assets may slice badly. |
| P1 | Directional/dynamic audio | Sound can communicate hidden-axis direction or distance, but needs a conventional stereo fallback and restrained mixing. |
| P1 | Music and ambience | Avoid making music essential to spatial understanding for hearing accessibility. |
| P1 | Juice | Camera shake and motion trails must respect reduced-motion settings and avoid implying false 4D motion. |
| P2 | Multiple environments | Every new environment multiplies tetrahedral modeling, texture, readability, and performance work. |

## Replay, Highlights, and Spectating

| Priority | Feature | 4D consequence |
|---|---|---|
| P1 | Instant throw replay | Record initial state, deterministic inputs or transform samples, active slice, camera basis, pin states, and W trajectories. |
| P1 | Automatic highlight trigger | Candidate events: exact win, bust, maximum multi-pin hit, long W displacement, bank shot, or last-miss survival. |
| P1 | Replay camera modes | Provide original view, target-follow, fixed overview, and W-follow. A normal 3D camera may hide the decisive event. |
| P1 | Timeline/scrub | Scrubbing must restore all 4D transforms and visualization settings without rerunning unstable physics. |
| P1 | Save/share clip | For the jam, save metadata plus a screen recording; a full replay file format is stretch work. |
| P2 | Match replay | Version the simulation and assets or store transform streams so updates do not break old replays. |
| P2 | Spectator mode | Spectators need independent slice/camera controls without affecting the player's aim or phone calibration. |

## Persistence, Diagnostics, and Shipping

| Priority | Feature | 4D consequence |
|---|---|---|
| P0 | Build and packaging | Publish a tested desktop build with exact OS, controls, and phone-network requirements. |
| P0 | Error handling | Detect missing Engine4D objects, bad slice state, stale controller packets, NaNs, escaped pins, and throws that never settle. |
| P0 | Debug overlay/logging | Include FPS, tetrahedron/ghost load, W coordinates, physics state, and network latency behind a toggle. |
| P0 | Credits/licenses | Track all premade assets and tools as required by the jam. |
| P0 | First-run instructions | Explain 4D view, focus, fallback controls, phone permission, and network connection in under a minute. |
| P1 | Save/resume | Serialize all player scores, pin 4D transforms/states, active slice, turn, and rule version. |
| P1 | Crash recovery | Autosave only at stable turn boundaries, not during unresolved 4D physics. |
| P1 | Performance profiles | Slice and ghost rendering have different costs; test integrated GPU and target frame-rate tiers. |
| P1 | Analytics/test telemetry | Local opt-in logs should capture confusion points such as repeated recentering or focus use, without recording personal data. |
| P2 | Localization | 4D terms and tutorial diagrams need careful translation, not string substitution alone. |
| P2 | Achievements/leaderboards | Separate assisted, phone-motion, mouse, VR, and custom-rule results where control advantages differ. |

## Recommended Jam Cut

The realistic submission is:

- five or twelve readable pins in constrained W layers,
- one complete throw/resolve/score/win loop,
- keyboard/mouse controls,
- native iPhone controller with touch release and Core Motion aiming,
- focus selected pin and return-to-throw-slice,
- slice plus restrained ghost view,
- compact tutorial/help and settings,
- clear score breakdown, reset, and results screen,
- tested downloadable desktop build.

Replay highlights, advanced controller polish, standard twelve-pin field evolution, multiple environments, VR, multiplayer, and online services should remain stretch or post-jam unless the P0 loop is stable by Saturday.

## Sources

- [[Mölkky Rules Model]]
- [[Prototype Scope]]
- [[Phone Motion Controller]]
- [[4D Golf Devlogs]]
- [[VR Interaction Model]]
