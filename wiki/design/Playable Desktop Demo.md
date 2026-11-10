# Playable Desktop Demo

Prototype `0.7.0 · Desktop Match` is the first build treated as a complete solo desktop demo rather than a one-throw 4D proof of concept.

Superseded physics behavior: [[W-Fall Playtest]] corrects the throwing skittle's contact stop, makes home-slice hits topple into W, and verifies non-penetration throughout rendered motion rather than only at settlement.

## Playable Gate

- The player starts at the legal Mölkkaari launch zone and cannot shorten the 3.50 m throw by walking forward.
- Hold Space to arm and choose bounded power; release once to make one throw. `T` remains a quick-throw fallback.
- Mouse aim, LMB 4D aim, Q/E slice movement, pin focus, and home-slice recovery are explained in the first-run help.
- A throw waits for the Mölkky and affected pins, resolves once, identifies fallen and leaning pins, applies single-pin-number or multi-pin-count scoring, and preserves the result until continued.
- A next turn re-stands affected pins at their landed X/Z/W bases and recovers the throwing skittle.
- Exact 50 wins, over 50 resets to 25, and a third solo miss ends the match with result zero.
- Escape pauses and releases the cursor; the pause panel can resume, restart, or quit.

## Collision Correction

The `0.6.0` scripted poses could place fallen pin capsules through other pins. The measured worst overlap was not a camera illusion: pin 10's axis crossed upright pin 9, and several pairs overlapped by more than 3 cm.

`0.7.0` reconstructs every pin as its 5.9 cm diameter capsule. After the causal impact wave is known, affected pins search outward from their predicted landing pose for the nearest position that is valid both while fallen/leaning and after re-standing. Untouched pins and the grounded throwing skittle are fixed obstacles. The search changes X/Z placement but never invents W movement; W displacement still comes from the impact direction.

The authoritative capture measured:

- initial rack surface clearance: 2.50 mm;
- minimum settled result clearance: 2.34 mm;
- minimum future upright clearance: 2.37 mm;
- lowest pin surface at or above ground;
- no fallback placement errors.

## Verification

The MacBook Air built the final candidate and ran a 360-frame, 24-second capture from that exact app. Its 4,320-row pin trace proves the complete path:

1. first-run help appears and can be hidden;
2. Space enters `Armed`, power increases within 70–115%, and release starts one throw;
3. changing the camera position cannot change the legal launch X/Z;
4. the opening cascade scores pins 1, 2, and 10 for three points after all seven affected pins settle;
5. every result and re-standing capsule clears every pin and the Mölkky;
6. pause/resume preserves the turn;
7. a second player-path throw resolves;
8. three actual off-slice misses produce `Lost`, three misses, and score zero;
9. restart restores the initial rack, score, camera, and Mölkky.

Published evidence: [Desktop Match gameplay capture](https://4d-molkky-unity-video-te-2dywdy3wcj-ilkka-lappetelainen.dev-pages.vinssi.ai/).

## Boundary

This is a playable game-jam demo, not a finished simulation. Engine4D does not provide dynamic rigid-body-to-rigid-body pin physics, so contact transfer and final resting placement are deterministic approximations. The shipped slice is solo desktop play; phone motion, VR, multiplayer, replay, and full settings remain outside this gate.

## Sources

- [[Mölkky Rules]]
- [[IMO Tournament Rules]]
- [[Mölkky Rules Model]]
- [[Pin Cascade Playable]]
- [[Engine4D]]
