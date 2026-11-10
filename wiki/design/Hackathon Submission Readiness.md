# Hackathon Submission Readiness

Deliver one understandable, enjoyable, reliably downloadable First Light desktop game for the Nimble Game Jam—not a commercial Steam release or the full VR vision.

## Acceptance target

**Project decision:** a first-time player can download and launch without Unity or developer assistance, understand the basic throw and W mechanic within roughly two minutes, play a complete match, and restart or quit. The two-minute target is our usability bar, not an organizer rule. Preserve the Finnish lakeside identity, twelve-pin rules, wide camera, persistent W shadows, and current pin motion unless testing exposes a specific defect.

## Must finish before calling it submission-ready

- **First-time playtest on the Air:** physical mouse/keyboard, one complete match, W targeting, pause/resume, restart and quit. Existing automated passes are supporting evidence, not a substitute.
- **Legibility and feel:** deliberate aiming, understandable hits/misses and score, convincing enough falls, readable W shadows and a useful default camera. Fix confusing interactions; no general-purpose physics rewrite.
- **Short onboarding:** make the existing help sufficient to explain hold/release, exact 50, W selection and next turn. A separate tutorial system is unnecessary if a new player succeeds with the help.
- **Submission-blocking stability:** no reproducible launch/play/exit failure in the supported path. Investigate the recorded shutdown crash and live-resize hang; fix them or provide a tested safe configuration that genuinely avoids the affected path. Listing a known issue alone does not pass this gate.
- **One final downloadable package:** zip the exact patched candidate, download/extract it and test launch on the Air without the editor. Include controls, tested system specifications, credits/licences, version and honest known issues. The older 0.10.0 archive is not the current package.
- **Theme and eligibility:** explain the game's connection to the announced theme and document work made during the jam versus credited pre-existing foundations. The public page still does not name the theme; do not infer that “First Light” is the organizer's theme. Verify itch.io/Discord participation and team details.
- **Submission page:** concise hook, controls, download/run instructions, tested platform/specs, theme explanation, creator credits and required team Discord names. Include a few clear screenshots and the verified Vinssi gameplay link as presentation evidence.
- **Actual entry verification:** upload the tested build, submit its itch.io page to the jam, then verify the download and that the entry appears in the jam. Preparing files is not submission. Final submission remains the user's authorized action.

## Platform and feature cut

macOS is the minimum verified platform; its fresh-download launch still needs testing. Add Windows only after testing the exact Windows package on Windows. A compilation alone is insufficient. Wider judge access makes Windows valuable, but an untested second platform must not destabilize the working submission.

Phone throwing is a bonus only after a safe physical-iPhone end-to-end pass; keyboard/mouse must remain sufficient. VR, multiplayer, achievements, Steam Cloud, gamepad/Deck claims, additional environments, progression, replay editors, save/resume, and comprehensive settings are not submission gates. Retain existing sound/sensitivity settings. No Steam onboarding, depot setup, store assets, pricing, or review process is required for this itch.io jam submission. Credits and permitted use of third-party material still matter.

## Current status

Current candidate is **0.11.1**, documented in [[Manual Aiming]]. W selection no longer aims at the chosen pin; mouse aim is preserved. One focused interface run and seven final Air jobs pass, including explicit aim-preservation and selected-pin-miss checks. Motion is byte-identical to 0.11.0. The public Mac archive is now 42,097,325 bytes; the installation, human-test and submission gates remain unpassed. The paragraphs below retain the 0.11.0 foundation and its historical measurements.

0.11.0 supplies the complete solo loop, clearer first-throw help, sound, menus and the retained camera/falls/W aids. The fixed-window IL2CPP profile removes Mono and normal live resizing; five gameplay jobs plus 22 additional interface/lifecycle runs pass with exit 0 on the Air. This is automated evidence for the supported configuration, not a physical-input or universal-crash-immunity claim. See [[Hackathon Candidate 0.11.0]].

The current 42,099,913-byte Mac archive, guides, credits, licences, three screenshots and submission copy are prepared. The [public candidate download](https://first-light-mac-candidat-9e9autz9cj-ilkka-lappetelainen.dev-pages.vinssi.ai) returns matching bytes; extraction, all 33 content hashes and deep/strict code-signature validation pass on the Air. **Gatekeeper rejects it (exit 3)**: notarized normal download/launch acceptance remains blocked, with no Developer ID Application identity available. Code-signature integrity is not Gatekeeper approval.

Physical newcomer/keyboard/mouse testing remains pending. The Air was locked during automated QA; a later recheck no longer showed the lock flag, but this session has no remote native-UI control path to the Air and no human acceptance record. A collaborative browser can show the public pages; itch.io dashboard redirects to login/challenge, so no authenticated upload or entry is verified. Official theme, team/Discord participation and provenance eligibility still require owner/organizer confirmation. `docs/JAM_SUBMISSION.md` contains the ready-to-use draft and exact upload checklist. No itch.io submission has been made.

## Sources

- [[Nimble Game Jam]] — official rules, participation, credits and deadline; rechecked 2026-09-05. The listed close is Sunday 6 September at 18:00 Helsinki time; late entries are not accepted.
- [[Input Transition Safety]], [[Lakeside Camera and W Shadows]], and `docs/RELEASE_CANDIDATE.md` — current implementation and verification boundaries.
- User scope decision, 2026-09-05: redefine readiness as hackathon submission-ready. [[Steam Release Preparation]] remains a deferred reference only.
