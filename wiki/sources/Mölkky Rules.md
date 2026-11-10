# Mölkky Rules

Mölkky is a turn-based throwing game whose identity comes from exact-50 scoring and re-standing displaced numbered pins where they finish.

## Sources

- Official rules page: https://www.molkky.com/game/rules/
- Detailed rules and dimensions: https://www.molkky.world/molkky-rules
- Source record: `raw/sources/molkky-rules.md`
- Tournament interpretation: [[IMO Tournament Rules]]
- Accessed: 2026-09-04

## Source Hierarchy

1. The official Mölkky Oy / Tactic page is authoritative for the branded game's core loop.
2. The I.M.O. Tournament Rules are the most precise source for deterministic judging and organised multiplayer.
3. Mölkky World supplies a readable setup diagram, dimensions, and casual-play explanation.

Where details disagree, the game should use the I.M.O. tournament rule and name the ruleset in its settings or match metadata.

## Setup

- Use twelve pins numbered 1 through 12 and one unnumbered throwing skittle, the Mölkky.
- Place the initial formation 3.50 m from the throwing zone. The I.M.O. tournament tolerance is ±0.10 m.
- Viewed from the throwing zone, the rows from nearest to farthest are:

```text
        7   9   8
      5  11  12  6
        3  10  4
          1   2
       throwing zone
```

- Mölkky World gives pin dimensions of 15 cm high by 5.9 cm diameter and a throwing skittle 22.5 cm long by 5.9 cm diameter.

## Core Loop

- Players or teams take one throw per turn.
- Wait until the Mölkky and all pins have stopped before judging the throw.
- Zero countable fallen pins scores zero and adds one consecutive miss.
- Exactly one fallen pin scores the number printed on it.
- Two or more fallen pins score the number of countable fallen pins.
- A positive score clears the consecutive-miss streak.
- Add the throw score. Exactly 50 wins immediately; more than 50 sets the total to 25.
- Re-stand fallen and leaning pins, then advance to the next active player or team.
- Three consecutive zero-point attempts eliminate that player or team from the set; under tournament rules its set score becomes zero.

## Detailed Rule Notes

### Fallen-pin test

Under the I.M.O. rule, a pin is fallen only when all motion has stopped and it lies on the ground without support from another pin, the Mölkky, or anything else. A leaning or supported pin scores nothing, but is still re-stood. A valid fall may result from direct or indirect contact caused by the thrown Mölkky.

A pin displaced or toppled by an unrelated cause is restored to its previous position and does not score. On a limited field, a pin whose base finishes completely outside the field counts as fallen even if it is upright or leaning.

Mölkky World says a pin supported by an artificial object counts as down, while the 2024 I.M.O. rules say support by “anything else” prevents it from counting and then give a special placement rule for fixed objects. This project adopts the I.M.O. interpretation.

### Re-standing

- Re-stand both fallen and leaning pins after the score is judged.
- Keep the point where the base meets the ground fixed, rotate the pin upright around that point, then turn its number toward the Mölkkaari / throwing zone.
- Work from the pin nearest the throwing zone to the farthest, preventing later placements from changing a nearer pin's resolved position.
- If a pin leans against a fixed object, move it far enough away that the Mölkky fits lengthwise between the pin and object; it did not count as fallen unless it was outside a limited field.
- On an unlimited field, position is preserved even beyond marked guide lines. On a limited field, an out-of-bounds pin is re-stood one Mölkky length inside the boundary, perpendicular to its resting location.

### Multiplayer and match end

- Each player or team gets one throw in cyclic order. In team play, the roster order is declared before the set and cannot change during it except by referee decision for injury; it may change between sets.
- The first player or team to reach exactly 50 wins the set immediately.
- If only one active player or team remains because every opponent has ended prematurely, that remaining side wins and receives 50 under tournament rules.
- A game may comprise multiple sets. Starting order and tie-breaking are organiser-defined; the I.M.O. examples include a schedule or coin toss followed by alternating first throw. These are competition configuration, not core scoring law.

## Relevance To 4D Mölkky

The essential design identity is simple scoring plus spatial drift: fallen and leaning pins are re-erected at their resting bases. A 4D version should preserve that drift, including W displacement, because it is the main way the game state evolves.

## Open Questions

- What is the 4D equivalent of "fallen entirely to the ground"?
- Should W displacement be preserved exactly during re-standing, or quantized to readable slices?
- Does the shipping game need both limited-field and unlimited-field rules, or only the latter?
