# Mölkky Rules Implementation Checklist

This checklist defines the smallest rules-complete Mölkky loop for the game jam and separates it from competitive tournament extras.

## P0: Rules-Complete First Set

### Setup and state

- [x] Spawn exactly 12 uniquely numbered pins.
- [x] Use the correct near-to-far rows: `1 2`; `3 10 4`; `5 11 12 6`; `7 9 8`.
- [x] Put the nearest initial pins 3.50 m from the launch line in gameplay scale.
- [x] Start the solo entrant at score 0 and miss streak 0. Multi-entrant activity state remains P1.
- [x] Store field state independently of the currently visible W slice.
- [ ] Label the ruleset version in match/replay data.

### Throw lifecycle

- [x] Permit one throw by the active entrant.
- [ ] Snapshot all pin states before release.
- [x] Lock additional throws and scoring while a throw is in flight or resolving.
- [x] Wait until the Mölkky and all affected pins settle; include a deterministic timeout/fallback.
- [x] Judge direct and indirect knockdowns caused by the active Mölkky.
- [ ] Restore any pin displaced by an unrelated cause and exclude it from scoring.

### Fallen-pin judgment

- [ ] Count a pin only when it lies on the ground and is unsupported after everything settles.
- [ ] Do not count a pin leaning on another pin, the Mölkky, terrain, or a fixed object.
- [x] Track affected non-counting pins separately because they still need to be re-stood.
- [x] Keep judgment independent of camera slice and render visibility.
- [x] Default the jam build to an unlimited field; guide lines do not change scoring.

### Scoring and misses

- [x] Zero fallen pins: add 0 and increment the active entrant's miss streak.
- [x] One fallen pin: add its printed number and reset the miss streak.
- [x] Two or more fallen pins: add their count and reset the miss streak.
- [x] If the new total is exactly 50, end the set immediately with that entrant as winner.
- [x] If the new total exceeds 50, set it to 25 and continue play.
- [x] On the third consecutive zero-point throw, eliminate the solo entrant and set its set score to 0.
- [ ] If elimination leaves one active entrant, end the set and give that entrant the official 50-point win result.
- [x] In solo play, the third consecutive miss ends the set as a loss.

### Re-standing and next turn

- [x] Re-stand every fallen or leaning pin at the base point where it came to rest.
- [x] Resolve pins from nearest to the throwing zone to farthest.
- [x] Keep each pin's resolved X/Z/W location; rotate upright without erasing W displacement.
- [x] Face the number toward the launch zone using one documented 4D orientation rule.
- [x] Freeze or otherwise isolate placement so re-standing cannot create a second unscored collision cascade.
- [ ] Advance to the next active entrant only after re-standing is complete.
- [x] Reset/recover the throwing Mölkky for the next turn without moving target pins.

### Player feedback

- [x] Show solo mode, total score, consecutive misses, and explain the target “exactly 50.” Entrant identity awaits the multiplayer model.
- [x] Resolve a throw with readable feedback: fallen pin IDs, rule used (single number or count), points, and new total.
- [x] Make bust feedback explicit: “over 50 → reset to 25.”
- [ ] Warn clearly at two consecutive misses and announce elimination at three.
- [x] Announce the winner and provide a full-set reset.

## P1: Local Multiplayer Structure

- [ ] Model each scoring side as an entrant so solo players and teams share the same score logic.
- [ ] Cycle entrants once per round, skipping eliminated entrants.
- [ ] For teams, capture a fixed player order before the set and rotate that team's thrower on its turns.
- [ ] Allow team player order to change only between sets.
- [ ] Configure first entrant explicitly; for casual play, default to a coin toss or random draw.
- [ ] Support a new set while preserving match-level set wins and alternating/configuring first throw.
- [ ] Prevent simultaneous winners: exact 50 ends immediately before another turn can begin.

## P2: Competitive/Tournament Options

- [ ] Limited-field mode: a base completely outside counts as fallen even if upright/leaning, then re-stand one Mölkky length inside perpendicular to the boundary.
- [ ] Fixed-obstacle spacing: re-place a leaning pin with one Mölkky length between pin and obstacle.
- [ ] Launch-zone faults, dropped-Mölkky misthrows, throw timer, wrong-order penalties, and the 37-point fault rule.
- [ ] Best-of-N sets, organiser-defined first-throw policy, qualification/tie rules, and Mölkk-Out.
- [ ] Substitutions and referee overrides with an audit log.

P2 is deliberately excluded from the jam-critical path. None of these options should complicate P0 scoring code.

## Acceptance Tests

| ID | Given | When | Expected |
| --- | --- | --- | --- |
| R01 | New set | Formation loads | All numbers 1–12 occur once in the four official rows; nearest row is 3.50 m from launch |
| R02 | Score 0, no misses | No pin is countably down | Score stays 0; miss streak becomes 1 |
| R03 | Any score, miss streak 2 | No pin is countably down | Entrant is eliminated; displayed set score becomes 0 |
| R04 | Any miss streak | Only pin 12 is countably down | Throw scores 12; miss streak becomes 0 |
| R05 | Any miss streak | Pins 7, 9, and 12 are countably down | Throw scores 3, not 28; miss streak becomes 0 |
| R06 | Pin 8 lies on a pin or the Mölkky | Throw resolves | Pin 8 scores nothing but is re-stood at its resting base |
| R07 | Pin 8 touches ground unsupported | Throw resolves | Pin 8 counts as fallen |
| R08 | Pin falls after unrelated movement | Throw resolves | It scores nothing and returns to its pre-throw state |
| R09 | Entrant has 42 | Sole pin 8 falls | Total becomes exactly 50; set ends immediately |
| R10 | Entrant has 49 | Two pins fall | Total becomes 25; play continues; miss streak is 0 |
| R11 | Two entrants remain | One is eliminated | Remaining entrant wins with official set result 50 |
| R12 | Three entrants, middle eliminated | First entrant finishes turn | Turn advances to third entrant, never the eliminated one |
| R13 | Fallen pin rests at nonzero W | It is re-stood | Base retains X/Z/W, pin becomes upright, number faces launch by the documented rule |
| R14 | Fallen and leaning pins are scattered | Re-standing runs | Order is nearest-to-farthest and no placement creates scoring or extra field motion |
| R15 | Result screen is open | Player chooses reset | Scores, misses, eliminations, turn cursor, pins, and Mölkky return to initial state |

## Open Decisions And Risks

- **Inference:** the exact numeric settle, ground-contact, support, and upright-angle tolerances must be tuned for Engine4D; the physical rules do not define engine thresholds.
- **Inference:** “number faces the Mölkkaari” has no unique 4D rotation. The jam rule should preserve W and choose the shortest stable rotation that faces the launch position in the pin's current slice.
- Decide whether replay data stores final judged state or enough deterministic simulation input to reproduce it. For a jam, storing the judged throw result is safer.
- Decide whether a debug-only shorter score target is necessary. It must never masquerade as standard Mölkky.

## Sources

- [[Mölkky Rules]]
- [[IMO Tournament Rules]]
- [[Mölkky Rules Model]]
