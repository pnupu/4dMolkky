# Mölkky Rules Model

The rules model for 4D Mölkky should preserve exact-50 tension and positional field evolution while turning physical referee judgments into deterministic, versioned simulation rules.

## Domain Model

- A **match** contains one or more sets and a configured first-throw policy.
- A **set** owns the field, entrant scores, miss streaks, active/eliminated state, and turn cursor.
- An **entrant** is either a solo player or a team. A team owns an ordered roster and a per-team internal throw cursor.
- A **throw result** records the pre-throw pin state, causal contacts, settled pin state, countable fallen-pin IDs, points, score transition, miss transition, re-standing positions, and any winner.
- A **ruleset version** identifies the fallen-pin, boundary, and tournament-fault interpretations used by a saved match or replay.

## Canonical Scoring

- One fallen pin scores that pin's number.
- Two or more fallen pins score the count of fallen pins.
- The target score is exactly 50.
- Exceeding 50 resets the player to 25.
- Three consecutive misses eliminate the player.

For implementation, “miss” means a resolved throw with zero countable points, not merely failure to contact a pin. A positive throw resets the miss streak, including a throw that causes an over-50 reset to 25.

## Resolution Order

1. Snapshot pin transforms and active entrant before release.
2. Simulate until the Mölkky and all pins settle or a safety timeout resolves them.
3. Reject movements without a causal path from the active Mölkky and restore those pins from the snapshot.
4. Classify countable fallen pins under the selected field-boundary rule.
5. Compute throw points: zero, the sole pin number, or the fallen-pin count.
6. Update miss streak and eliminate on the third consecutive zero.
7. Apply points; exactly 50 wins, while more than 50 becomes 25.
8. If no entrant reached 50, award the set to the only remaining entrant when all opponents are eliminated.
9. Re-stand fallen and leaning pins from nearest to farthest, preserving their resolved base positions and facing labels toward the throwing zone.
10. If the set continues, advance to the next active entrant and then the next player in that team's fixed order.

The implementation must define whether elimination or scoring is processed first. The order above is unambiguous because an elimination throw has zero points, so the two effects cannot conflict.

## Field Evolution

After each throw, fallen and leaning pins are stood upright at their resting base points. This is crucial: the initial tight formation disperses into a player-shaped tactical field.

For 4D Mölkky, field evolution should include W-axis displacement. If W is only decorative, the game risks becoming normal Mölkky with harder visuals.

## Knockdown Criteria Problem

In physical Mölkky, a pin must be fully fallen to count. In 4D, "fallen" needs an explicit rule because a 4D object can rotate in planes that do not map cleanly to a normal 3D topple.

Possible prototype rules are all project-specific **Inferences**, not sourced Mölkky rules:

- Count a pin as down when its local up vector deviates from the gravity direction beyond a threshold.
- Count a pin as down when its base no longer contacts the ground plane.
- Count a pin as down when a simplified hit-state trigger fires, independent of visual topple.

## Recommended Jam Interpretation

- Keep the official 50-point target in normal play. A shorter target may exist only as an explicitly labelled debug setting.
- Start with an orientation/contact test: the pin is settled, its body is lying on the ground, and no other collider supports it. If the engine cannot represent support reliably, use an up-angle threshold plus ground contact and document it as an approximation.
- Preserve the resting X/Z and W base position when re-standing. This makes the fourth dimension mechanically persistent.
- Rotate the pin into its canonical upright orientation without altering W, then orient the readable number face toward the launch position projected into its current W slice. This orientation rule is an **Inference**.
- Default to an unlimited field for the jam. It preserves spatial drift and avoids boundary exception logic.
- Run one entrant through a full exact-50 set before adding team rosters, tournament faults, multiple sets, or Mölkk-Out.

## Determinism Risks

- A real pin can be “supported” by irregular terrain; a physics engine may jitter or report shallow contact indefinitely.
- A pin can be visible in several W slices, so visible appearance alone cannot be the scoring test.
- Re-standing overlapping 4D bodies can create explosive contacts. Freeze the field during placement and resolve overlaps deterministically before the next throw. This is an **Inference**.
- Physics settle timeouts must not make the same replay score differently on different machines.

## Sources

- [[Mölkky Rules]]
- [[IMO Tournament Rules]]
- [[Mölkky Rules Implementation Checklist]]
- [[Engine4D Technical Model]]
