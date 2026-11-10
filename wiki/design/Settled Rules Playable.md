# Settled Rules Playable

The `0.5.0 · Settled Rules` build moves throw resolution from contact time to a deterministic settle-and-judge phase, then preserves the evolved 4D field during re-standing.

Patch `0.5.1 · Clean Field` disables Engine4D's solid projection camera by default. Large W-depth ground and scenery meshes had appeared as field-wide triangular bands; ordinary dawn lighting remains active, and key `2` still exposes the projection modes for diagnostics.

Superseded interaction behavior: [[Pin Cascade Playable]] adds deterministic secondary pin contacts, causal W motion, correct fallen height, and a regulation-sized pin collider.

## Implemented

- A throw cannot resolve or score while an affected pin is still animating its fall; a one-second deterministic fallback prevents a stuck resolution.
- Affected pins and scoring pins are separate sets. Every affected pin is retained for re-standing, while the current classifier counts only settled pins tilted at least 60 degrees.
- Zero countable pins produces a miss even if the Mölkky contacted and displaced a non-counting pin.
- The controller re-stands all affected pins nearest-to-farthest from the throwing zone.
- Re-standing preserves each pin's landed X, Z, and W coordinates, restores it upright, and faces its number toward the throwing-zone origin.
- The Mölkkaari now sits on a subtle trampled-earth patch without adding a collider or changing the regulation equipment layout.

The 60-degree classifier is a jam-build approximation, not a claim that Engine4D currently models every real support contact. A future rigid-body pass must add ground-contact and support-collider tests so a deeply tilted pin resting on another object cannot score.

## Verification

The macOS Development build compiled with Unity `2022.2.2f1` on the MacBook Air. The authoritative 270-frame capture passed with:

- exactly 12 pins numbered 1–12;
- affected pins `[1, 2]` and countable fallen pins `[1, 2]`;
- scoring delayed until both affected pins reported settled;
- two points and zero misses;
- all affected pins re-stood at their landed X/Z/W positions, upright, with numbered faces toward the throwing zone;
- pin W preserved from `-0.215` fallen to `-0.215` re-stood; and
- reset restoring the complete field and score state.

The combined scene generation and build took 17.49 seconds; capture took 29.01 seconds. An unchanged follow-up plan reused the scene, build, and validated capture.

The `0.5.1` incremental build took 16.86 seconds and its 28.55-second capture added a passing clean-shadow-mode assertion while preserving every `0.5.0` gameplay result.

Published evidence: [Settled Rules gameplay capture](https://4d-molkky-unity-video-te-2dywdy3wcj-ilkka-lappetelainen.dev-pages.vinssi.ai/).

## Remaining Rules Gaps

- Ground contact and support by another pin, the throwing Mölkky, terrain, or a fixed object are not yet queried; the 60-degree test is the explicit approximation.
- Restoration of movement unrelated to the active throw is not yet modeled.
- The playable remains a solo loop rather than entrant/team turn order with official elimination results.
- The fall motion is deterministic animation rather than full 4D rigid-body pin physics.

## Sources

- [[IMO Tournament Rules]]
- [[Mölkky Rules]]
- [[Mölkky Rules Model]]
- [[Mölkky Rules Implementation Checklist]]
- [[Authentic Field Playable]]
