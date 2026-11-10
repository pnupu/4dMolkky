# Hackathon Candidate 0.11.0

First Light 0.11.0 is a tested, downloadable Mac candidate with clearer onboarding and a fixed-window IL2CPP runtime, but unresolved human, signing and jam-entry gates.

Historical build record: [[Manual Aiming]] supersedes it as 0.11.1. Shared Vinssi download/video URLs now serve that newer candidate; the 0.11.0 hashes below describe the retained historical artifacts, not the current download.

## Changes and scope

- The existing help now explains hold/release, next turn, exact 50, overshoot/misses and W-target following in one panel. Pause/settings remain legible at the three tested launch sizes.
- `AutomatedMolkkyBuild.BuildHackathonMacOS` uses IL2CPP and disables live window resizing. It restores the previous scripting backend/resizability settings after building. The bundle is universal; only Apple Silicon execution is tested.
- A final build-helper check caught unsaved restoration: Unity had retained the temporary profile on disk. Saving assets in `finally` fixes this. A separate successful verification build restores resizable/Mono settings and produces the identical GameAssembly hash; it does not replace the patched public candidate.
- The supported configuration removes the Mono runtime implicated in the earlier CoreVideo shutdown crash and normal user live-resize path implicated in the AppKit hang. This is a targeted mitigation, not proof against every native crash or arbitrary display/fullscreen changes.
- No fall, scoring, power-curve, input-transition or camera changes. Comparing 17,280 captured rows with 0.10.4 gives identical states, outcomes, score and axes. Printed Z/W coordinates differ by at most 0.00001 m (0.01 mm); the traces are not byte-identical across backends.
- Mac-only packaging includes player controls, tested specifications, known issues, credits, Engine4D's MIT notice and the project's Liberation Sans OFL notice. No Windows, phone, VR or Steam claims are added.

## Air evidence

Target: Apple M4 MacBook Air, 16 GB RAM, macOS 26.3, Metal. This is a test configuration, not a measured minimum requirement.

| Check | Result | Evidence |
|---|---|---|
| Non-development IL2CPP build | Exit 0 after matching module and SDK guard correction | `artifacts/releases/jam-v0110/build-il2cpp-sdk-compat.log` |
| Official Unity runtime remediation | Patcher 1.3.3 success; deep/strict signature valid | `runtime-patch.log` beside build log |
| 60 FPS capture and repeated 15 FPS capture | Both pass and exit 0; 1,800 frames total | `artifacts/pin-fall-fix/jam-final/` |
| Throw sweep | 24 throws, 967 frames, pass/exit 0 | `sweep/throw-sweep-report.json` |
| Complete match | 17 throws across scenarios; exact 50 at turn 8 and bust-to-25, pass/exit 0 | `match/match-report.json` |
| Interface and lifecycle | Main interface plus 22 additional runs pass/exit 0; 960×600, 1280×720, 1920×1080 launches | `interface/` and `lifecycle/lifecycle-report.json` |
| Ops helpers | Six unit tests pass | `python3 -m unittest discover -s ops -p 'test_*.py'` |
| Public archive on Air | Matching SHA-256, ZIP integrity, all 33 content hashes and deep/strict signature pass | `artifacts/releases/jam-v0110-public-download/download-verification.json` |
| Gatekeeper | **Rejected, exit 3** | `gatekeeper.txt` alongside download report |

The opening throw remains pins 1 + 2 + 10 for 3. Minimum animation clearance is 0.9926 mm; sweep clearance is 0.9969 mm. Upright base travel is 2.40 cm and fallen landing width is 31.40 cm. Ground clearance is within float precision of zero; persistent far-W silhouettes/shadows and projection toggles pass.

GameAssembly SHA-256: `254b4501f54d31dd2ae15e7e724aa731e38241209d3c5ff74656e4db4bbeae29`.
Patched UnityPlayer SHA-256: `00c6856492bfa962b53d2ffc5d33c9cc5fc13782e44e20529238339e936af8cb`.

## Deliverables

- [Candidate download and three gameplay screenshots](https://first-light-mac-candidat-9e9autz9cj-ilkka-lappetelainen.dev-pages.vinssi.ai): archive 42,099,913 bytes, SHA-256 `eacb6bb522f7f609395e97ef2a2eec3490c82d1a16f08900ca0f0679f1b68d99`. Debug/IL2CPP backup folders are excluded.
- [Actual Air gameplay and comparisons](https://4d-molkky-unity-video-te-2dywdy3wcj-ilkka-lappetelainen.dev-pages.vinssi.ai): 24-second H.264/AAC 1280×720 recording at 60 captured FPS, 1,139,824 bytes. The existing on-demand Blob loader remains. All three clips advance/seek in muted WebKit iPhone emulation with failed-fetch retry and no eager downloads; physical-iPhone/audio acceptance is not claimed.
- `docs/JAM_SUBMISSION.md`: hook, controls, installation/specifications, credits/provenance, screenshots/video link, exact archive hash and final entry checklist. Theme/team fields are explicitly pending, not invented.
- `docs/JAM_README.md`, `docs/KNOWN_ISSUES.md`, `docs/CREDITS.md` and `docs/PLAYER_GUIDE.md` accompany the package.
- The original tested build is running normally on the Air at `artifacts/releases/jam-v0110/macos/FirstLight4D.app`; the rejected public download was not launched via a security workaround.

## Unpassed acceptance gates

1. Physical keyboard/mouse and a first-time-player complete match/restart/quit. Automated runs took place with the Air locked; a later state check no longer showed the lock flag, but no human result or remote native-UI control is available in this session.
2. Developer ID signing/notarization and successful ordinary downloaded launch. Air has no valid signing identity; the other Mac has only Apple Development, not Developer ID Application. `curl` transfer/extraction does not establish a normal browser/Finder launch. No quarantine removal, Gatekeeper change or new certificate/account creation was performed.
3. Official theme, human roster/Discord usernames, participation and provenance eligibility. “First Light” is not claimed as the organizer theme.
4. Authenticated itch.io upload, owner-reviewed final submission and visible jam entry. The dashboard redirects to login/challenge. The public Vinssi page is not an itch.io entry.

No commit, branch, Steam upload or jam submission was made. These remaining gates prevent calling the whole submission complete.

## Sources

- [[Hackathon Submission Readiness]], [[Nimble Game Jam]], [[Input Transition Safety]], [[Lakeside Camera and W Shadows]] and [[Coherent Pin Falls]].
- [[Unity Mac IL2CPP Build Compatibility]] and `ops/unity-mac-il2cpp.md` — module provenance, temporary build-header correction and restoration.
- Local/Air reports and exact archive hashes listed above — project measurements, not external physics claims.
