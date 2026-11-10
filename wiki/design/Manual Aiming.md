# Manual Aiming

First Light 0.11.1 removes automatic camera aiming from target selection so single-pin shots require the player's own aim while W navigation stays accessible.

## Cause and change

The user wanted hitting exactly one pin to be difficult and then requested continued development. Inspection found that `FocusPin` both selected W and computed yaw/pitch directly toward the numbered pin. F cycling and roster selection shared this shortcut. The match automation also relied on it, so its successful precision shots were not human-balance evidence.

Removed that camera mutation at the shared function. F and roster selection now preserve yaw/pitch and move only W; the status message and help explain the difference. Mouse aim, throw power, collisions, scoring, pin spread, fall motion, persistent shadows and inspection camera are unchanged. No artificial random error or extra collision radius was introduced. W still aligns exactly by design; this is an accessibility aid, not a requirement to aim all four dimensions manually.

The match test now computes its own precise aim inside the opt-in capture harness. That keeps exact-50/bust regression coverage without restoring a player lock-on or disguising bot shots as human play.

## Air verification

- Patched non-development IL2CPP macOS build succeeds; sources/settings match the Air and the lease is released after the editor exits.
- One focused interface run plus seven final jobs exit 0: 60/15 FPS capture, 24-throw sweep, 17-throw match, and interface tests at 960×600, 1280×720 and 1920×1080.
- New assertions verify preserved yaw/pitch while W aligns, then a deliberately off-target throw with pin 12 selected still misses and leaves the score at zero. Existing input-cancellation and release-before-rearm checks still pass.
- The complete 17,280-row pin trace matches 0.11.0 byte-for-byte. Opening throw remains pins 1 + 2 + 10 for 3; the sweep observes 974 frames with 0.9996 mm minimum clearance. Exact 50 and overshoot-to-25 pass.
- Six ops tests pass. Actual Air help, miss and gameplay frames are inspected; current footage remains on Vinssi with the on-demand mobile loader.
- Evidence: `artifacts/pin-fall-fix/aim-final/`, `artifacts/releases/aim-v0111/`, `artifacts/video-tests/aim-v0111-site/`.

GameAssembly SHA-256: `65a87f7e9cabcc77a3a78165eb1c0b6ac24a719f9cdd44f80295c96070e501b2`.
Mac ZIP: 42,097,325 bytes, SHA-256 `cdce38a2fdb351ce03a28adfacabd6ebbd6ba5d0115f0a037cf302784bbdb347`.

Public delivery verifies all 34 files across the existing gameplay/download sites. The actual Air download passes ZIP integrity, 33 content hashes and deep/strict signature verification; Gatekeeper rejects it, exit 3. The three video players pass muted WebKit iPhone-emulation playback, seeking, retry and no-autoload checks. The tested original app is left running normally on the Air; no security workaround is applied to the download.

## Boundaries

This verifies removal of the aiming shortcut, not a measured human single-pin success rate or final difficulty balance. Physical playtesting remains necessary. The package remains non-notarized and is not a submitted jam entry; the existing signing/eligibility/account gates are unchanged. Earlier 0.11.0 lifecycle stress results are historical, not additional 0.11.1 runs.

## Sources

- User feedback, 2026-09-05: hitting one pin should be hard; continue development and improve the game.
- Project source and Air reports listed above; [[Hackathon Candidate 0.11.0]] and [[Input Transition Safety]].
- [Current gameplay and selected-pin miss](https://4d-molkky-unity-video-te-2dywdy3wcj-ilkka-lappetelainen.dev-pages.vinssi.ai).
- [Current Mac candidate and controls](https://first-light-mac-candidat-9e9autz9cj-ilkka-lappetelainen.dev-pages.vinssi.ai).
