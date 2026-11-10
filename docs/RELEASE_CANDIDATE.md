# First Light — release candidates

The user clarified on 2026-09-05 that Steam is a game-readiness quality target, not a next-day publication deadline. Prioritize gameplay and usability; no store submission is scheduled.

The active target is now **hackathon submission-ready**, as subsequently requested. See `wiki/design/Hackathon Submission Readiness.md` for the acceptance contract. Steam account, store, depot and commercial-release gates below are deferred; hands-on playability, a tested downloadable package, credits, theme/eligibility and the itch.io entry remain required. This document records build evidence, not proof of a submitted jam entry.

## Current hackathon candidate: 0.11.1

Air release: `/Users/ilkka/4dmolkky/artifacts/releases/aim-v0111/`, running normally. Removed the shared target-selection yaw/pitch snap: F and roster selection move only W. Help and status text explain manual aiming. No physics, power curve, scoring, scatter or camera-FOV change; all 17,280 pin-motion rows match 0.11.0 exactly. The match harness explicitly aims its own test shots instead of using a player shortcut.

One focused interface run and seven final Air jobs pass with exit 0: 15/60 FPS capture, 24 varied throws over 974 observed frames, 17 match throws, and interface checks at 960×600, 1280×720 and 1920×1080. New assertions prove selection preserves aim while aligning W and a selected-but-off-target shot misses. Six ops tests pass. These are not measured human single-pin success rates. See `wiki/design/Manual Aiming.md`.

[Current download and screenshots](https://first-light-mac-candidat-9e9autz9cj-ilkka-lappetelainen.dev-pages.vinssi.ai): 42,097,325-byte ZIP, SHA-256 `cdce38a2fdb351ce03a28adfacabd6ebbd6ba5d0115f0a037cf302784bbdb347`. Actual public download on the Air passes ZIP integrity, all 33 file hashes and deep/strict signature verification. Gatekeeper still rejects it, exit 3; no security bypass or normal downloaded-launch pass is claimed.

[Current Air recording and selected-pin-miss screenshot](https://4d-molkky-unity-video-te-2dywdy3wcj-ilkka-lappetelainen.dev-pages.vinssi.ai): 24-second 1280×720 H.264/AAC at 60 captured FPS, 1,067,840 bytes. Both sites' 34 assets return 200 with matching bytes. All three embedded clips pass muted WebKit iPhone-emulation playback/seek/retry and no-autoload checks. Physical input/phone audio, notarization and jam entry gates remain unresolved. No submission, commit or branch was made.

## Previous hackathon candidate: 0.11.0

Air release: `/Users/ilkka/4dmolkky/artifacts/releases/jam-v0110/`. The original tested app is running normally on the Air. Clearer first-throw help, fixed window and IL2CPP avoid the older normal live-resize and Mono shutdown paths without changing gameplay. Unity's official runtime patcher succeeds; no Mono library ships. Five gameplay jobs and 22 additional interface/lifecycle runs pass with exit 0, including three launch sizes. Six ops tests pass. All 17,280 captured rows retain the same score/state/outcomes/axes as 0.10.4; printed Z/W differs by at most 0.01 mm.

[Download candidate and three screenshots](https://first-light-mac-candidat-9e9autz9cj-ilkka-lappetelainen.dev-pages.vinssi.ai). `FirstLight4D-macOS.zip`: 42,099,913 bytes, SHA-256 `eacb6bb522f7f609395e97ef2a2eec3490c82d1a16f08900ca0f0679f1b68d99`. The actual public download is extracted on the Air: ZIP integrity, all 33 file hashes and deep/strict code signature pass. **Gatekeeper rejects it, exit 3.** No quarantine/security override or fresh-download execution workaround was used. No valid Developer ID Application identity is available, so notarization and ordinary launch remain blocked.

[Current Air gameplay](https://4d-molkky-unity-video-te-2dywdy3wcj-ilkka-lappetelainen.dev-pages.vinssi.ai): 24-second 1280×720 H.264/AAC capture, 60 captured FPS. Gameplay and download sites' 32 files return HTTP 200 with identical staged bytes. All three video players pass muted WebKit iPhone-emulation playback, seeking, retry and no-autoload checks. Physical iPhone/audio validation remains unclaimed.

Full evidence: `wiki/design/Hackathon Candidate 0.11.0.md`. Submission copy: `docs/JAM_SUBMISSION.md`. Build prerequisites: `ops/unity-mac-il2cpp.md`. Remaining acceptance gates are physical newcomer/keyboard/mouse testing, notarized normal launch, theme/team/Discord/provenance confirmation, and the actual owner-reviewed itch.io entry. The Air was locked during automation; a later check no longer showed the lock flag, but no human test result is available. The collaborative browser redirects itch.io dashboard to login/challenge. No jam submission, Steam upload, commit or branch was made.

## Previous verified update: 0.10.4

Air release: `/Users/ilkka/4dmolkky/artifacts/releases/input-v0104/`. Pause/restart/menu/pointer transitions now require Space and T to be released before a fresh throw; pointer selection cancels charging and cannot throw. Arming stops automatic W focus at the current slice. The normal power curve, scoring, pin motion, shadows, and lakeside camera remain unchanged.

Five final Air jobs exit 0: 60/15 FPS capture, 24 sweep throws, 17 match throws, and interface flow including six new input assertions. The complete 17,280-row 60 FPS pin trace matches 0.10.3 byte-for-byte. Exact-50 victory and bust-to-25 pass. Five ops tests pass. macOS universal and Windows x64 builds compile and receive runtime remediation; macOS deep/strict signature verification passes. Windows execution and physical keyboard delivery remain unverified. See `wiki/design/Input Transition Safety.md`.

Tested macOS `Assembly-CSharp.dll` SHA-256: `14e12a9f59dadd7c90b12020426cf3c3814f5e6e59fc73d2dcf4d4247d237b14`. Four changed source/settings files match the Air. Reports: `artifacts/pin-fall-fix/input-final/`. [Current Vinssi gameplay](https://4d-molkky-unity-video-te-2dywdy3wcj-ilkka-lappetelainen.dev-pages.vinssi.ai), publication `01a070f3-41f5-75ed-b2b8-b37d72db5517`: 18 files, 8,818,364 bytes, including the actual 24-second 60 FPS Air recording. The mobile Blob loader remains in use; WebKit playback tests do not replace physical-iPhone/audio validation.

## Previous verified update: 0.10.3

Air release: `/Users/ilkka/4dmolkky/artifacts/releases/lakeside-v0103/`. Normal camera is 50°, with optional 18° inspection; off-slice W silhouettes and ground shadows remain visible regardless of body-aid mode or W distance. The complete 17,280-row gameplay trace matches 0.10.2 unchanged. Seven Air jobs exit 0, covering 15/60 FPS capture, 24 varied throws, 17 match throws, and interface/camera flow at 960×600, 1280×720, and 1920×1080. Both desktop targets compile and are patched; Windows execution remains unverified. See `wiki/design/Lakeside Camera and W Shadows.md` for hashes and boundaries.

[Current Vinssi gameplay](https://4d-molkky-unity-video-te-2dywdy3wcj-ilkka-lappetelainen.dev-pages.vinssi.ai), version `01a070dd-fc83-7523-9051-61856a7f187b`: all 17 assets match their staged originals over HTTP 200. The mobile-delivery correction loads short clips into local Blob URLs because the gateway ignores byte ranges. All three clips decode, advance and seek in muted WebKit iPhone emulation; physical-phone and audible-output validation remain open. Close-up 0.10.2 clips remain clearly labelled as motion references, not the current default camera. No Steam publication or physical phone integration is claimed.

## Verified pin-motion update: 0.10.2

The Air builds are under `/Users/ilkka/4dmolkky/artifacts/releases/grounded-v0102/`. Pins now tip before sliding, settle flat, retain continuous wooden projections by default, and keep the previous wide ground spread. G exposes strict slicing. Controls and scoring rules are unchanged; W landing positions change intentionally. Five final Air jobs exit 0: 15/60 FPS capture, 24 sweep throws, 17 match throws, and interface checks. The initial 15 FPS run passed its gameplay checks but crashed during native Mono/CoreVideo shutdown; a repeat and the other final jobs exited cleanly. This intermittent native shutdown issue is not claimed fixed.

[Verified Vinssi videos](https://4d-molkky-unity-video-te-2dywdy3wcj-ilkka-lappetelainen.dev-pages.vinssi.ai), publication `01a0707b-f073-7468-b23c-07d051cfb971`, show actual 0.10.2 Air gameplay, the 0.10.1 comparison, and quarter-speed inspection. Page/video bytes and browser playback verified. Detailed motion evidence is in `wiki/design/Coherent Pin Falls.md`. The release gates below still apply.

## Historical pin-motion update: 0.10.1

The 0.10.1 game update is `artifacts/releases/scatter-v0101/macos/FirstLight4D.app` (also on the Air under `/Users/ilkka/4dmolkky`) and `artifacts/releases/scatter-v0101/windows/FirstLight4D.exe`. It fixes the staged W-first fall, adds readable fallen-pin projections, and widens ground scatter. Controls and scoring rules are unchanged; landing layouts deliberately spread farther apart.

Final gameplay QA runs on the MacBook Air: 15/60 FPS captures, a 24-throw sweep, 26 full-match throws, and interface checks all pass. The first throw still scores 3, with a 31.4 cm fallen landing span versus 6.15 cm previously. Reports and the 60 FPS game video are under `artifacts/pin-fall-fix/air-final/`; details are in `wiki/design/Coherent Pin Falls.md`. Both non-development builds have Unity's runtime remediation; Windows execution remains unverified. The Steam eligibility and scope gates below remain unresolved.

The [Vinssi playtest page](https://4d-molkky-unity-video-te-2dywdy3wcj-ilkka-lappetelainen.dev-pages.vinssi.ai) now shows the actual 0.10.1 Air recording, a quarter-speed before/after comparison, and a slow-motion clip. Version `01a07040-9b58-753e-93a5-77e3874e309b`: all 10 assets return HTTP 200 with identical downloaded bytes, and all three current clips pass browser playback checks. The previous 0.10.0 video remains available as an archive link. Future user-facing videos must also be published to Vinssi; see `ops/vinssi-pages.md`.

## 0.10.0 baseline

Prepared 2026-09-05. This is a tested macOS desktop candidate and a compiled Windows candidate, not a published or approved Steam release.

## Play and inspect

- macOS: `artifacts/releases/first-light-v0100/macos/FirstLight4D.app`
- Windows: `artifacts/releases/first-light-v0100/windows/FirstLight4D.exe`
- Archives and per-file SHA-256 manifest: `artifacts/releases/first-light-v0100-packages/`
- Actual 1920×1080 gameplay recording: `artifacts/video-tests/first-light-v0100/molkky-first-light-v0100.mp4`
- [Verified playtest page](https://4d-molkky-unity-video-te-2dywdy3wcj-ilkka-lappetelainen.dev-pages.vinssi.ai): HTTP 200, matching MP4 SHA-256, and browser playback verified; page version `01a06e42-26b0-7011-ae26-8262d1f69743`.
- Six unedited 1920×1080 gameplay screenshots: `artifacts/steam-store-v0100/screenshots/`
- Instructions: `docs/PLAYER_GUIDE.md`. Store text and artwork specifications: `docs/STEAM_STORE_DRAFT.md`. Depot/QA handoff: `ops/steam/README.md`.

The repository and candidate paths on the MacBook Air begin at `/Users/ilkka/4dmolkky`; the local workspace is `/Users/ilkka/4dmölkky`.

The final macOS app was relaunched normally on the Air; process and startup log were verified. The screen lock was not removed.

## Final-package evidence

Evidence root: `artifacts/release-validation/v0100-rc2/`. Tests ran the patched, non-development macOS package on the Air's Apple M4. Local and Air `Assembly-CSharp.dll` SHA-256 matched: `c4a1e6d3c0f5fd733f48f2bfa6f62d514ff78b82df132e281cd03413e4313c59`.

| Check | Result |
| --- | --- |
| Boot menu, cursor, immediate camera alignment, start/pause/resume/menu | Passed at 960×600, 1280×720, and 1920×1080; screenshots inspected |
| Actual gameplay capture | Passed: 360 frames, 24 seconds, 4,320 pin-motion rows, two throws, re-standing, pause, three-miss loss, reset |
| Pin contact and floor | Minimum capsule clearance 0.743 mm; minimum mesh clearance from measured visible floor 0; maximum rendered-axis error 2.17e−7 |
| Full matches through real throw operations | Passed: 22 throws across two scenarios; 45→25 bust; exact 50 on winning throw 14; terminal/pause rejection and restart |
| Varied-throw sweep | Passed: 24 throws at 15/30/60 FPS, 914 observed frames, minimum capsule clearance 1.000 mm, no mesh below the measured floor |
| Audio and video | H.264 1920×1080, 15 FPS, 24 seconds; stereo AAC 48 kHz; captured audio peak 0.194, encoded peak −14.2 dBFS |
| Build helpers | Five Python tests passed; tracked diffs pass whitespace checks |
| Package integrity | Both ZIPs pass extraction checks; extracted macOS app passes deep/strict code-signature verification |

The menu/first-throw images exposed an identity-camera flash and a clipped W-control line during testing. Both were fixed and rechecked in this candidate. Earlier `v0100/` checks are retained separately and are not substituted for the final `v0100-rc2/` results.

## Runtime remediation

Both builds use `BuildOptions.None`. macOS contains arm64 and x86_64 executables; the Windows executable is x86-64. Architecture presence does not prove successful execution on an Intel Mac or Windows.

Unity's signed official application patcher 1.3.3 applied CVE-2025-59489 remediation; the final check reports both runtimes already patched. Logs and original/patched hashes are under `artifacts/releases/first-light-v0100/security/`. Final runtime SHA-256:

- Windows `UnityPlayer.dll`: `470d06334b0b07f72a0e68f2e23acaa4bacfab8e9882c5baec28de553aff56da`
- macOS `UnityPlayer.dylib`: `3bcbe990ee6fdda6faf32e8f84bd97444caebf9e2bc4f26e4578359ccf89cbb3`

The editor remains Unity 2022.2.2f1; it was not upgraded. Recheck remediation after rebuilding. The macOS signature is not Developer ID notarization. See [Unity's remediation guidance](https://unity.com/security/sept-2025-01/remediation).

## Unresolved release gates

1. **Steamworks access and release eligibility:** no verified AppID/depot IDs, onboarding status, Coming Soon date, or store/build approvals. Valve's review and waiting periods cannot be bypassed by preparing a binary. [Onboarding](https://partner.steamgames.com/doc/gettingstarted/onboarding), [review process](https://partner.steamgames.com/doc/store/review_process).
2. **Commercial identity:** the working Mölkky name needs permission or a cleared replacement. The [brand owner's site](https://www.molkky.com/) identifies Tactic Games Oy; no permission record is verified. Final branded capsules, publisher identity, pricing, and content-survey answers have not been submitted.
3. **Windows and Steam installation:** a Windows build succeeded, but no Windows test machine or authorized private Steam install was available. Do not advertise tested Windows compatibility yet.
4. **Unlocked-session QA:** the Air is screen-locked. Automated public-gameplay calls and engine-rendered screenshots do not prove physical mouse/keyboard, focus-loss recovery, or settings persistence across human play. Live resizing also remains unresolved: a rapid scripted resize hung in native AppKit/Unity window handling, while separate launches at three resolutions passed. The stack sample is retained under `artifacts/release-validation/v0100/interface/native-resize-sample.txt`.
5. **Scope honesty:** solo desktop only; no VR, phone input, multiplayer, achievements, or verified gamepad/Steam Deck support. The solver is deterministic gameplay code, not general 4D rigid-body physics.

No Steam upload, purchase, account change, public store submission, git commit, or branch creation was performed. The updated gameplay page is an unlisted playtest recording, not a game release.
