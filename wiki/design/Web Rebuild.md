# Web Rebuild

The 2026-11 rebuild replaces the Unity and Engine4D prototype with a browser game in `game/`: TypeScript, three.js, and a 4D rigid-body simulation written for this project.

## Why a rebuild

- The owner asked for a completely new build with good graphics and a game that works, developed on the MacBook Air.
- No Unity Editor is installed on the Air. The old cycle needed a build per change, and the download was blocked by Gatekeeper (see [[Hackathon Candidate 0.11.0]]).
- Engine4D physics supports sphere colliders only (see [[Engine4D Technical Model]]). The old game used a scripted fall solver; its player guide said it was "not a general rigid-body engine". Tumbling pins needed new physics in every engine option.
- A browser game is tested on the Air by headless Chrome on the real GPU, and is played by link with no install.

Decision record: [[Engine Selection]].

## Key points

All items below are project decisions (**Inference**), not sourced Mölkky or Engine4D facts, unless a source is named.

### Space and view

- Axes: X and W sideways, Y up, Z along the throw. The ground is the 3D space (X, Z, W).
- The player sees one 3D slice. It always contains Y and Z. Its sideways axis is `cos(a) X + sin(a) W`, where `a` is the slice angle. Scrolling changes `a`.
- Every point on the throw axis is in every slice, so the rack centre never leaves the view. A pin at ground position (x, w) is centred in the slice at `a = atan2(w, x)`.
- The throw goes where the player looks: aim inside the slice, and the slice angle supplies the W part of the direction.

### Pins

- A pin is a spherinder: a 3-ball of radius 2.95 cm in (x, z, w), extruded 15 cm along its axis, with the top cut at 45 degrees. The skittle is 22.5 cm with flat ends. Dimensions: [[Mölkky Rules]].
- A slice that misses the pin centre by `d` shows a cylinder of radius `sqrt(R² − d²)`. A pin lying along the hidden direction shows as a wooden ball.
- The part outside the slice shows as a ghost: blue on one hidden side, amber on the other, with a ring on the ground. This keeps the earlier W-shadow idea from [[Lakeside Camera and W Shadows]].
- The number on the cut face always reads along the slice's sideways axis, so it is legible at every slice angle. This is a readability aid, not physical paint.

### Rack

- Twelve pins in a close-packed cluster in the three ground directions: a triangle of six in the first slice (pin 1 in front), and three pins in its hollows on each hidden side.
- Pins 10, 11 and 12 have the most neighbours, like the centre of the classic rack. The classic flat 2-3-4-3 rack was rejected: it stays in one slice by symmetry, which would make W cosmetic.

### Physics

- Bodies carry a 4x4 rotation matrix and a bivector angular velocity (6 components). Inertia acts per rotation plane in the principal frame; mass properties come from numerical integration of the cut shape.
- Contacts: rim points tested against the other body's signed distance, an exact side-to-side test on the axis segments, and analytic deepest rim points against the ground. A rim uses the surface of the other body that its centre faces; this fixed upright neighbours sinking into each other.
- Solver: sequential impulses, 8 substeps per 60 Hz step, 3D Coulomb friction in the contact's tangent space, contacts one step early for fast bodies. Overlap is removed directly in position, never through velocity, so resolving a contact cannot throw a body up.
- Feel, set by the owner on 2026-11-10: the skittle is 0.85 kg against 0.26 kg for a pin, and the ground returns 4 percent of an impact (wood on wood: 42 percent).
- A lying spherinder rolls like a ball in two ground directions. Rolling resistance stands in for sand and gravel.
- The simulation is deterministic at a fixed step. The same throw gives the same result.

### Rules

- Scoring, bust to 25, three-miss elimination, last-side-standing and turn order follow [[Mölkky Rules Model]]. With two or more players, an eliminated player's score becomes 0 and the last player standing receives 50 (tournament rule in [[Mölkky Rules]]). A solo player keeps the score when three misses end the game: a project decision.
- Fallen means settled, axis within about 15 degrees of flat, and centre low. A pin resting on another pin or on the skittle is steeper or higher and does not count ([[IMO Tournament Rules]] interpretation).
- Re-standing pivots the pin upright on the point where its base met the ground, nearest the throwing line first. A pin that tipped over without sliding returns to where it stood. Its position in all three ground directions, W included, is kept. Pins that are stood up do not overlap; pins that stayed standing are not moved.

### Presentation

- Setting: Finnish lakeside at first light, as in [[First Light Match]]: low sun over a lake, far spruce shore, mist, red sauna cabin with a dock.
- Far scenery is the same in every slice. Ground cover and grass are functions of ground position (x, z, w), so they change as the slice turns. The cabin is 4D too: it dissolves when the slice leaves it and returns mirrored half a turn later.
- HUD: scoreboard, power bar, a 4D compass that looks along the throw with the slice as a horizontal band, and pin-number labels laid out without overlap.
- Sound is synthesised in the browser. There are no audio or image files.

## Evidence

- 42 unit tests: 4D maths, shape, free motion (angular momentum and energy), single-pin stability and falls along X, Z and W, collisions, determinism, rules, rack, re-standing, a scripted full match, and slice geometry (`r² = R² − d²`, ball cross-section, winding).
- Headless Chrome on the Air (Apple M4, Metal): a scripted match runs to the end with no console errors. Frame time at 2160x1350: 11 ms median while aiming, 15 ms during a throw. Physics: about 1 ms per step on average, 5 to 8 ms at the worst impact frame.
- Evidence type: fixture and headless-browser runs. No human playtest record exists yet.

## Open questions and risks

- Human playtest: is the slice turn understood in the first two minutes? Is single-pin aiming fair once the field has spread in W?
- Two crossing rims can overlap by a few millimetres before a contact is found. A 4D GJK/EPA pass would remove this.
- VR is not built. WebXR on the same renderer is the intended path; headset performance is unmeasured. See [[VR Feasibility]].
- Phone layout works but is not tuned; loft and hold use on-screen buttons there.

## Sources

- [[Mölkky Rules]], [[IMO Tournament Rules]], [[Mölkky Rules Model]] for rules and dimensions.
- [[Engine4D]], [[Engine4D Technical Model]] for the limits of the previous engine.
- Code and tests: `game/README.md`, `game/src/`, `game/tests/`.
