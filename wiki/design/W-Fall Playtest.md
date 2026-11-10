# W-Fall Playtest

Prototype `0.8.0 · W-Fall Playtest` makes an ordinary home-slice throw produce causal fourth-dimensional toppling while preventing pin capsules from intersecting during or after the cascade.

Correction from the subsequent [[Rendered 4D Falls]] investigation: the capsule axis changed, but the actual Engine4D render matrix stayed upright. The measurements below establish the synthetic collision trace, not correct visible toppling or mesh separation.

## Implemented Motion

- The swept throwing-skittle path resolves the exact entry point of the first pin contact and stops the skittle behind that point instead of inside the rack.
- Contact side supplies a signed W polarity. The verified center throw sends direct pins 1 and 2 to opposite W sides; explicitly W-aimed throws retain the throw's W direction.
- Direct falls use equal visible/Z and W toppling components. Secondary falls retain more forward momentum while still leaving the original slice.
- Affected pins search for clear settlement along their causal W direction before using any visible X/Z correction. The verified run required no X/Z placement correction.
- Before each rendered frame, a bounded 4D capsule pass separates an actively moving child from any penetrated pin. The final landing target is unchanged.
- Re-standing preserves the resolved landing-base X/Z/W coordinate, so field spread in W persists between turns.

## Verified Run

The authoritative macOS Development build and its 24-second deterministic capture passed with:

- direct pins `[1, 2]`, secondary pins `[3, 4, 10, 11, 12]`, and scoring pins `[1, 2, 10]`;
- direct pins split across negative and positive W;
- minimum fallen landing-base displacement `|W| = 2.86 cm` and maximum fallen-center displacement `|W| = 9.11 cm`;
- minimum capsule clearance `0.77 mm` over all 360 rendered frames, including the second throw;
- minimum settled-result clearance `1.01 mm` and future upright clearance `5.43 mm`;
- zero visible X/Z settlement correction;
- deterministic `100%` first release despite variable screenshot wall time;
- W-preserving re-standing, pause/resume, a second throw, three-miss loss, and reset; and
- 4,320 trace rows with position, current 4D axis, impact W, polarity, generation, source, and settlement correction.

Published evidence: [W-Fall gameplay capture](https://4d-molkky-unity-video-te-2dywdy3wcj-ilkka-lappetelainen.dev-pages.vinssi.ai/).

## Boundary

This remains deterministic custom 4D contact, not a general rigid-body solver. Outcome thresholds approximate the official grounded-and-unsupported test; arbitrary support stacks and reciprocal angular impulses remain open work.

## Sources

- [[Mölkky Rules Model]]
- [[Pin Cascade Playable]]
- [[Playable Desktop Demo]]
- [[Engine4D Technical Model]]
