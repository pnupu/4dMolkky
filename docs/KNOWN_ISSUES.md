# First Light — candidate verification limits

- Physical keyboard/mouse and first-time-player acceptance are still pending. Removing selection auto-aim is verified, but a human single-pin success rate and difficulty/feel are not measured by the automation.
- The package is not Developer ID notarized. Gatekeeper assessment on the Air rejects the candidate (exit 3). Neither machine has a valid Developer ID Application signing identity available. Ordinary fresh-download launch is blocked, not passed; no quarantine removal or security override was used.
- The older Mono candidate once crashed in Mono/CoreVideo shutdown. The jam IL2CPP profile removes Mono. 0.11.1 passes seven final Air jobs plus one focused interface run, with clean exits and separate 960×600 and 1920×1080 launches. The earlier 22-run lifecycle stress test belongs to 0.11.0. Neither establishes immunity to all native crashes or replaces a physical Quit-button test.
- The older resizable candidate hung during rapid live resizing. The jam profile uses a fixed window with no in-game resize control. Arbitrary window/fullscreen changes and other display configurations are not claimed tested.
- Default play projects off-slice falling bodies for readability. G reveals literal slicing; blue/amber silhouettes and ground shadows remain. These visual aids do not change collision or scoring.
- No Windows runtime, VR, physical phone throwing, controller/Steam Deck, multiplayer, cloud save or mid-match save/resume is included in the jam support claim.
- The official theme, final team/Discord details, participation and eligibility must be confirmed before the jam entry is submitted.
