# First Light — hackathon candidate 0.11.1

A solo wooden-pin game at a Finnish lakeside. Reach exactly 50 while following pins through neighbouring slices of four-dimensional space.

## Download and launch

1. Download `FirstLight4D-macOS.zip` and extract it with Archive Utility.
2. Open the extracted `macos` folder and launch `FirstLight4D.app`.
3. Choose Start solo match. Unity, a phone, a headset and a network connection are not required for gameplay.

The candidate is not Developer ID notarized. Gatekeeper assessment on the Air rejects it, so ordinary fresh-download launch has not passed. Do not disable Gatekeeper or remove quarantine to make a test appear to pass. Retain the download source/hash when reporting a launch issue.

## One-minute controls

- Mouse aims. Hold Space for power, then release once to throw. T makes a quick throw.
- After the score appears, T stands the pins where they landed and begins the next turn.
- One fallen pin scores its number; several score their count. Exactly 50 wins, going over returns to 25, and three consecutive misses ends the match.
- Blue −W and amber +W shadows mark pins outside your slice. F follows a target into its slice without auto-aim; you still aim with the mouse. 0 returns home. Q/E moves W manually.
- V inspects more closely. Tab releases the pointer for target selection and cancels charging. Esc pauses; H toggles help; R restarts.
- After pause/restart/selection, lift Space and T before pressing again. Quit is in the main menu.

## Tested configuration and scope

Automated validation: MacBook Air, Apple M4, 16 GB RAM, macOS 26.3, Metal, 1280×720 window, with separate 960×600 and 1920×1080 interface launches. Seven final jobs and the initial focused interface check pass with clean exits, including aim preservation and a selected-but-off-target miss. The earlier 22-run lifecycle stress check belongs to 0.11.0. Physical keyboard/mouse acceptance and human single-pin success rates remain unmeasured. These are test configurations, not minimum requirements. The jam profile disables window resizing and uses IL2CPP instead of Mono.

See `KNOWN_ISSUES.md` for current acceptance limits and `PLAYER_GUIDE.md` for full controls. This is a solo desktop candidate, not a Steam release; no Windows, VR, phone input, multiplayer or gamepad support is advertised for this package.

Credits and the engine licence are included. The gameplay solver is deterministic and project-specific, not a general-purpose 4D rigid-body simulator.
