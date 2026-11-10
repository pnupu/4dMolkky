# IMO Tournament Rules

The 2024 International Mölkky Organisation Tournament Rules provide the project's most precise authority for pin judging, re-standing, team turns, elimination, and field boundaries.

## Source

- Official document: https://www.international-molkky.org/_files/ugd/734080_f950738b65824021b4f831250eedb153.pdf
- Official documents page: https://www.international-molkky.org/documents
- Edition: third edition, original English
- Released: 2024-02-11
- Accessed: 2026-09-04
- Source record: `raw/sources/international-molkky-tournament-rules.md`

## Core Findings

- Initial distance is 3.5 m from the Mölkkaari, with ±0.1 m tolerance.
- The assembly diagram shows the near-to-far rows `1 2`; `3 10 4`; `5 11 12 6`; `7 9 8` when viewed from the Mölkkaari.
- A throw starts when the Mölkky leaves the hand from inside the throwing area and is complete after it has touched the ground and stopped moving.
- Direct or indirect pin hits are valid.
- Judge pins only after every pin and the Mölkky have come to rest.
- A pin scores as fallen only if it lies on the ground unsupported by another pin, the Mölkky, or anything else.
- One fallen pin scores its number; multiple fallen pins score their count.
- Fallen and leaning pins are re-stood where their bases came to rest, number facing the Mölkkaari, nearest first.
- A score above 50 becomes 25; exactly 50 wins.
- Three consecutive zero-point attempts remove a team from the set and set its result to zero.
- If every opponent has ended prematurely, the remaining team receives 50 and wins.

## Turn Structure

- Each team has one throw per round.
- The team captain reports the participating players in throwing order before a game. That order is fixed during a set, apart from a referee-approved injury exception, and may change before the next set.
- The organiser defines who throws first. The rules give a schedule or coin toss as examples and allow first throw to alternate in later sets.

## Edge Rules Relevant To A Digital Game

- A pin that falls after the throw for an unrelated reason is restored to its previous position and does not score.
- A pin moved by anything other than direct or indirect contact caused by the thrown Mölkky is likewise restored.
- A limited field counts a pin as down if its base is entirely outside, even when it finishes upright or leaning, then relocates it one Mölkky length inside the boundary.
- An unlimited field preserves the resting location outside guide lines.
- A pin leaning on a fixed object does not score and is moved away enough to fit one Mölkky lengthwise between it and the object.
- Dropping the Mölkky while active in the throwing area is a zero-point misthrow, subject to handling exceptions.
- Throwing out of player or team order, crossing the Mölkkaari, and time violations have tournament penalties. These are not needed for the jam-critical casual loop.

## Risks And Scope

- The rules explicitly leave unenumerated situations to referee judgment; a digital game needs a versioned deterministic interpretation for those cases.
- Tournament rules include multiple sets, substitutions, fouls, time limits, and Mölkk-Out. They should be optional competitive features, not prerequisites for the first playable.
- “Player” and “team” are used analogously in the document. The game model should therefore score an entrant, with an entrant containing one or more human players.

## Related Pages

- [[Mölkky Rules]]
- [[Mölkky Rules Model]]
- [[Mölkky Rules Implementation Checklist]]
