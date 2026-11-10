# First Light — itch.io submission draft

Prepared for the Nimble Game Jam. This is copy and an upload checklist, not a submitted entry. Resolve the explicitly pending fields before publishing the itch.io page.

## Page fields

- Title: First Light — 4D Mölkky
- Short description: A Finnish lakeside pin game where every throw changes the field—in four dimensions.
- Kind: downloadable game; free jam candidate; single-player desktop.
- Platform: macOS only. Do not enable Windows, Linux, VR or controller support without testing those targets.
- Version: 0.11.1, fixed-window IL2CPP candidate with manual aiming.

## Description

At first light, the lake is quiet and twelve wooden pins wait on the shore. Aim, charge and throw. Knock down one pin to score its number, or several to score their count. Reach exactly 50 without overshooting.

The twist is where the pins land. They can fall into neighbouring slices of four-dimensional space—and stay there for the next turn. Blue and amber shadows keep them visible. Follow a target into its slice, choose your next shot, and turn the scattered field into a route to 50.

First Light is a complete solo-match candidate with a lakeside setting, sound, a normal field view and optional close inspection, pause/settings, restart, and a locally saved best winning throw count. Its deterministic gameplay solver is designed for this game, not as general-purpose 4D rigid-body physics.

### How to play

Mouse aims. Hold Space for power and release to throw; T is a quick throw. After the result, T stands the pins at their landing positions for the next turn. F cycles targets and follows only their W slice—it does not aim at them. The numbered roster behaves the same way. You aim a single-pin shot yourself. 0 returns home. Blue means −W, amber means +W. Q/E moves through W manually.

One fallen pin scores its number; multiple pins score their count. Exactly 50 wins, overshooting returns to 25, and three consecutive misses ends the match. Esc pauses; H shows help; V toggles close inspection; R restarts. After pause or target selection, release Space and T before pressing again.

### Download and run

Staged candidate and three current screenshots: [Vinssi download page](https://first-light-mac-candidat-9e9autz9cj-ilkka-lappetelainen.dev-pages.vinssi.ai). Archive SHA-256: `cdce38a2fdb351ce03a28adfacabd6ebbd6ba5d0115f0a037cf302784bbdb347` (42,097,325 bytes). This is not an itch.io upload.

Download `FirstLight4D-macOS.zip`, extract it, and open `macos/FirstLight4D.app`. No Unity editor, phone, headset or network connection is required to play. The archive includes detailed controls, credits, licences and current verification limits.

The candidate is not Developer ID notarized. Gatekeeper assessment on the Air rejects it; ordinary fresh-download launch is blocked. Do not present a security override as a successful installation test.

Validation target: Apple M4 MacBook Air, 16 GB RAM, macOS 26.3, Metal, keyboard/mouse and a fixed 1280×720 window. These are a test configuration, not measured minimum requirements. No other platform is claimed tested.

### Footage

[Actual MacBook Air gameplay and comparison clips](https://4d-molkky-unity-video-te-2dywdy3wcj-ilkka-lappetelainen.dev-pages.vinssi.ai). On mobile, choose Load video, then Play. Footage is gameplay evidence, not proof of a physical-phone gameplay controller.

### Credits and tools

Game concept and direction: Ilkka Lappeteläinen. Built using Unity and HackerPoet's MIT-licensed Engine4D, with AI coding assistance and project-generated scene/interface/sound work. Full Engine4D and Liberation Sans notices accompany the archive. No live AI service is required to play. Mölkky is the rules reference, with no claim of brand affiliation.

### Theme and team — pending, do not invent

- Official announced theme: **not verified**. “First Light” is our setting/title, not a verified organizer theme.
- Theme connection: write only after the actual announcement is available.
- Human team roster and required Discord usernames: **owner confirmation required**; do not count coding agents as teammates.
- itch.io registration and Discord participation: **not verified**.
- Eligibility: Engine4D, earlier research and tooling predate the jam; development records document the playable game work on 4–5 September. Confirm this satisfies the organizers' jam-window rule rather than claiming all work started from scratch.

## Final upload gate

1. Finish a physical first-time-player match and normal download/launch/quit on the Air; retain observations, not just automated reports.
2. Resolve theme, roster, Discord participation and provenance eligibility. Review the organizers' showcase/promotion permission before final submission.
3. In the owner's authenticated itch.io account, create/edit the game page with this copy, clear platform labels and current unedited gameplay screenshots.
4. Upload the exact tested archive; compare its SHA-256 with `manifest.json`. Set the download to macOS and verify the downloaded copy, not just the local build.
5. Submit that page to [Nimble Game Jam](https://itch.io/jam/nimble-game-jam) before the listed Sunday 6 September 18:00 Helsinki close. Verify the actual entry page and download after submission. A Vinssi page alone is not an itch.io entry.

Source: [official jam rules](https://itch.io/jam/nimble-game-jam), rechecked 2026-09-05. The public page still does not state the announced theme.
