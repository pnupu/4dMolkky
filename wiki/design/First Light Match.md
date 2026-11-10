# First Light Match

`0.10.0 · First Light` turns the desktop slice into a complete solo wooden-pin game with readable equipment, onboarding, sound, and an exact-50 match loop.

## What changed

- Pin numbers are textures on the sloped wooden faces, not floating screen labels. Side grain and end grain distinguish the physical surfaces.
- The visible floor now ends at the solver's Y=0 plane. Its previous top at +0.07 hid 7 cm of each upright pin; older proxy checks did not detect this. Ground clearance now uses the actual transformed floor mesh.
- A close aiming view makes regulation-derived equipment readable without changing its dimensions or throwing distance. V switches to a wider view.
- Optional blue −W / amber +W outlines locate nearby off-slice pins. Solid geometry remains a true slice. The roster shows every pin's state and W position; F or pointer selection focuses a target.
- Q/E moves slowly through W. The player remains anchored at the throwing zone; debug camera movement no longer throws the view across the field.
- Menus, first-throw help, pause/restart, sound/mouse settings, a local winning-turn best, charged throws, result explanations, and win/loss states form the solo loop.
- Original procedural audio covers release, wooden contact, scoring, misses, re-standing, and victory. Captures record the Unity audio output, not an added soundtrack.
- Camera reset now initializes the rendered camera matrix immediately instead of briefly exposing its identity pose.

## Play

Mouse aims; hold/release Space charges and throws. T takes a quick throw or starts the next turn after settling. F cycles/focuses targets; Tab releases the pointer for roster selection; Q/E moves the slice; 0 returns home; G toggles outlines; V toggles the wider view; H toggles help; Esc pauses; R restarts.

One fallen pin scores its number, multiple fallen pins score their count, and leaning pins do not score. Exactly 50 wins; overshooting returns the score to 25; three consecutive misses ends the match. Re-standing preserves landing X/Z/W.

## Verification boundary

Numeric collision checks alone are not visual acceptance. Inspect actual gameplay frames, numbers, ground contact, W disappearance/reappearance, and UI alongside JSON/CSV traces. Tests drive public gameplay operations; they do not substitute for an unlocked-session keyboard/mouse playtest or a Windows run.

The solver remains deterministic gameplay code, not general-purpose 4D rigid-body physics. This release candidate does not include VR, multiplayer, phone input, Steam achievements, or verified controller support. Steam publication has separate account, review, rights, platform, and store-material gates; see [[Steam Release Preparation]].

## Sources and evidence

- [[Engine4D Technical Model]] — actual runtime matrix and floor-mesh conventions.
- [[Mölkky Rules]] and [[Mölkky Rules Model]] — source rules and the solo adaptation.
- [[Rendered 4D Falls]] — preceding fixes and the verification gaps found afterward.
- `docs/PLAYER_GUIDE.md`, `docs/STEAM_STORE_DRAFT.md`, `ops/steam/README.md`.
- Release-candidate evidence is recorded in `docs/RELEASE_CANDIDATE.md`.
