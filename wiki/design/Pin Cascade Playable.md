# Pin Cascade Playable

The `0.6.0 · Pin Cascade` build replaces independent hit animations with a deterministic 4D impulse cascade that can topple, lean, and re-stand secondary pins.

## Why A Custom Cascade Exists

Engine4D's `Physical4D` moves a spherical point against passive collider surfaces. It does not provide mass, angular velocity, torque, rigid-body sleeping, or reciprocal impulses between dynamic bodies. Turning every pin into a `Physical4D` object would still not produce Mölkky rigid bodies.

**Inference:** the jam build therefore resolves pin interaction as deterministic breadth-first contact waves in horizontal X/Z/W space. This keeps the fourth coordinate causal and makes identical throws score identically across machines without pretending that Unity PhysX understands W.

## Implemented Interaction

- The throwing pin's swept path identifies the earliest direct contact band. The verified center throw directly reaches pins 1 and 2.
- Direct impact strength depends on speed and lateral contact distance.
- Each fallen pin transfers 70% of its remaining scalar impulse to the nearest forward contact band. Simultaneous contributions are accumulated before classifying the receiving pin, and pin-number ordering breaks exact ties.
- Strength below `0.16` leaves a pin untouched; `0.16–0.34` produces a leaning, non-scoring pin that absorbs the chain; `0.34` or more produces a fallen scoring pin that may propagate once.
- Contact propagation is capped at 12 waves and the current rack terminates after generation 2.
- Pure forward force produces no W displacement. W motion now comes only from incoming W impulse; the previous odd/even pin-number fallback is gone.
- Fallen pin centers finish at the real 2.95 cm radius above ground instead of floating. The pin collider now matches the 15 cm equipment height.
- All direct and secondary pins remain in one affected set. Scoring waits for every delayed animation to settle, then counts only the fallen subset.
- Fallen and leaning pins re-stand at their resolved base X/Z/W, nearest-first, with labels facing the throwing zone.

## Verified Center Throw

The macOS Development build compiled with Unity `2022.2.2f1` on the MacBook Air. The authoritative 270-frame capture and 3,240-row motion trace passed with:

- direct pins `[1, 2]`;
- secondary pins `[3, 4, 10, 11, 12]`;
- fallen/scoring pins `[1, 2, 10]`;
- leaning/non-scoring pins `[3, 4, 11, 12]`;
- untouched pins `[5, 6, 7, 8, 9]` retaining exact transforms;
- generation 2 as the final propagation wave;
- all affected pins settled by frame 41 and score 3 first appearing at frame 42;
- exactly one throw resolution;
- W remaining `0` throughout the pure-Z cascade; and
- every affected pin re-standing at its landing base before exact full-field reset.

Scene generation and build took 17.07 seconds; the validated capture took 27.71 seconds.

Published evidence: [Pin Cascade gameplay capture](https://4d-molkky-unity-video-te-2dywdy3wcj-ilkka-lappetelainen.dev-pages.vinssi.ai/).

Superseded behavior: [[W-Fall Playtest]] derives signed W toppling from contact side even for an ordinary home-slice throw and adds rendered-frame capsule separation.

## Remaining Physics Gaps

- This is a tuned, deterministic contact approximation rather than general 4D rigid-body dynamics.
- The current classifier does not query support contacts, so a deeply tilted pin resting on another object is not yet distinguished from an unsupported fallen pin.
- The throwing pin still uses a swept center path rather than its complete rotating 22.5 cm cylindrical volume.
- Uneven terrain, post-impact rolling, reciprocal recoil, and arbitrary multi-contact piles remain outside this slice.

## Sources

- [[Engine4D]]
- [[Engine4D Technical Model]]
- [[Mölkky Rules Model]]
- [[Mölkky Rules Implementation Checklist]]
- [[Settled Rules Playable]]
