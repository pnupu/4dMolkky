# Wiki Log

## [2026-04-30] ingest | LLM Wiki method and Engine4D README

Seeded the repository with the LLM-wiki structure, source records, source summaries, concept pages, a prototype scope, and an initial research backlog for a VR 4D Mölkky project.

## [2026-04-30] ingest | Mölkky rules and Engine4D project inspection

Added official Mölkky rules, detailed dimensions and setup notes, Engine4D license/project metadata, and first-pass VR/camera/physics script findings. Added concept pages for rules modeling, pin geometry, and VR interaction.

## [2026-04-30] query | Alternative 4D engines and VR documentation

Surveyed alternative 4D or higher-dimensional engines and VR-first frameworks. Added a comparison page and engine-selection page. Current recommendation remains Engine4D, with Unity/VR validation gates before fully locking in.

## [2026-04-30] setup | Engine4D submodule and Unity validation plan

Added Engine4D as a git submodule under `external/Engine4D`, added Unity-oriented ignore rules, and created `docs/unity-validation-spike.md` to guide the first Unity validation pass.

## [2026-04-30] validation | Unity editor detection

Checked local Unity installation. Unity Hub is installed, but no Unity editor binary was found in `/Applications`, `~/Library/Unity/Hub/Editor`, or Spotlight results. Added `docs/unity-validation-results.md` and marked validation blocked until an editor is installed through Hub.

## [2026-04-30] validation | Engine4D import and compile

Unity `2022.2.2f1` was installed and used to open `external/Engine4D`. Initial package import and assembly reload completed without C# compiler errors, shader errors, or explicit exception entries in the editor log. Next validation step is manual Play Mode testing of `Assets/Sample/SampleScene4D.unity`.

## [2026-04-30] validation | Engine4D desktop sample

Manual Unity GUI check of `Assets/Sample/SampleScene4D.unity` passed at a high level. User reported that everything seems to be working. Desktop Engine4D viability gate is cleared; XR/OpenXR validation remains.

## [2026-04-30] validation | macOS OpenXR blocker

Enabled OpenXR in Unity and inspected the sample `MainCamera` VR setup. Unity OpenXR Project Validation reports that only Windows x64 standalone is supported for this OpenXR path, so real macOS Play Mode XR validation is blocked. Continue prototype work in desktop mode; reserve VR validation for Windows PC VR or a later Android/Quest build path.

## [2026-04-30] prototype | Debug HUD versioning

Added `MolkkyPrototypeController.PrototypeVersion` and displayed it in the debug HUD. Current prototype version is `0.1.0`; future prototype behavior/UI updates should increment it.

## [2026-04-30] prototype | Throwable runtime repair

Incremented prototype to `0.1.1`. Added runtime repair so the controller can find `Molkky Thrower` or legacy `Throw Marker` objects and attach `MolkkyThrower4D` if the serialized scene reference is missing.

## [2026-04-30] prototype | Ground runtime repair

Incremented prototype to `0.1.2`. Added prototype ground marker and runtime repair path so older generated scenes can recover a missing ground object and rebuild 4D colliders.

## [2026-04-30] prototype | Same-slice skittles and W knockdown

Incremented prototype to `0.1.3`. Updated the pin/skittle layout so all targets start in the player's `W=0` 3D slice. Hits now push knocked skittles into positive or negative W to make the first 4D behavior visible.

## [2026-04-30] prototype | Start view and knockdown animation

Incremented prototype to `0.1.4`. Moved the player start to `W=0, Z=0`, placed skittles directly ahead in the same 3D slice, and changed knockdown from an instant transform to a short animated fall into W.

## [2026-04-30] prototype | Heavier thrower and repeat skittle movement

Incremented prototype to `0.1.5`. Increased thrower size/collision radius and throw speed, reduced bounce restitution, and allowed already-knocked skittles to receive additional shove/W movement from later impacts.

## [2026-08-31] ingest | Nimble Game Jam and preparation plan

Recorded the September 4–6 Nimble Game Jam rules and participation requirements. Added a pre-jam readiness checklist covering registration, the already-installed Unity/Engine4D environment, VR equipment options, a Quest Android deployment spike, a Thursday fallback decision, and submission safety.

## [2026-09-02] ingest | 4D Golf playlist transcripts and pitfall review

Downloaded metadata and all available English captions for the 11-video 4D Golf YouTube playlist. Nine videos supplied captions; the two short trailers did not. Added a source summary separating HackerPoet's statements from 4D Mölkky inferences, including navigation, mesh, rendering, content, tutorial, performance, UI, and VR pitfalls.

## [2026-09-02] design | Phone motion controller and feature inventory

Assessed iPhone/Jolla browser motion input, native iOS Core Motion, volume-button limitations, Tailscale Serve, controller protocol, calibration, throw estimation, target focus, safety, and fallbacks. Added a prioritized product feature inventory covering rules, 4D visualization, phone/VR input, settings, presentation, replay highlights, persistence, diagnostics, and shipping.

## [2026-09-02] design | Native iPhone controller and Action button decision

Narrowed the controller scope to one native SwiftUI/Core Motion iPhone app. Selected direct acknowledged UDP over local Wi-Fi with Tailscale addressing as a fallback. Reserved the Action button for one-shot App Shortcut actions such as launch, reconnect, or calibration because general apps do not receive its held press lifecycle; rejected misuse of camera-only capture-event APIs as the throw trigger.

## [2026-09-02] query | Phone motion-controller prior art and reusable components

Found direct precedent in the MIT-licensed Simo project for combining iPhone motion with touch-based gesture segmentation. Selected TouchOSC plus MIT-licensed extOSC as the fastest interaction spike, followed by a native SwiftUI/Core Motion controller using MIT-licensed SwiftOSC. Marked the GPLv3 Arvos sensor streamer as reference-only unless the controller adopts GPLv3.

## [2026-09-02] design | Agent-operated game-jam weekend

Added a 48-hour runbook designed for intermittent human availability: one root T3 thread, three delegated work lanes, strict shared-file and Unity-lease rules, short phone checkpoints, automated Unity batch builds/tests, deterministic screenshot/video evidence, scope cutoffs, release gates, and a phone-oriented Vinssi dashboard.

## [2026-09-04] prototype | First Light playable

Built and verified prototype `0.2.0 · First Light`. Added a Finnish lakeside-dawn environment made from Engine4D-native geometry, tuned the default throw to score, enforced aiming/in-flight/result/win/loss states, added next-throw re-standing, W focus and home-slice controls, reticle and W-aware HUD, and a deterministic gameplay capture report. Published a 14-second H.264 capture showing pin 2 score and movement to `W=+1.21` on the existing Vinssi page.

## [2026-09-04] ingest/design | Authoritative Mölkky rules and implementation checklist

Ingested the 2024 third-edition English International Mölkky Organisation Tournament Rules and refreshed the Mölkky Oy / Mölkky World source record. Established a source hierarchy, exact 12-pin formation, 3.50 m setup, settle-and-support fallen-pin test, nearest-first re-standing, exact-50 and over-50 behavior, three-zero elimination, team turn structure, field-boundary edge cases, and the conflict over artificial supports. Added a jam-prioritized implementation checklist with deterministic 4D inferences and 15 acceptance tests.

## [2026-09-04] prototype/process | Authentic Field playable

Built and verified prototype `0.4.0 · Authentic Field`. Replaced generic crystal pins and the debug ball with purpose-built regulation-derived 4D meshes, pale birch materials, the official touching rack, a 3.50 m setup, and a four-piece Mölkkaari. Added swept 4D hit detection, a real standing eye height, corrected dawn-field framing, and true hiding of the throwing pin between turns. The 270-frame deterministic capture passed with pins 1 and 2, two points, W focus, landing-position re-standing, and reset. Added a change-aware locked Unity runner and combined scene/build entry point to skip unchanged work and prevent concurrent access to one Unity project.

## [2026-09-04] validation | Change-aware Air cycle

Ran the new Unity cycle end to end on the MacBook Air. Combined scene generation and macOS build completed in 11.80 seconds; the passing 270-frame capture completed in 28.24 seconds. An immediately repeated unchanged cycle reused the validated app and capture in 0.44 seconds wall time.

## [2026-09-04] prototype | Settled Rules playable

Built and verified prototype `0.5.0 · Settled Rules`. Throw resolution now waits for affected pins to settle, separates all affected pins from the legally fallen scoring set, and resolves a throw exactly once. Re-standing runs nearest-to-farthest, preserves landed X/Z/W, restores upright orientation, and faces numbers toward the throwing zone. Added a restrained trampled-earth patch at the Mölkkaari. The 270-frame MacBook Air capture passed all rule-timing, score, position, orientation, slice, and reset checks; the current 60-degree fall test remains an explicit approximation until support and ground-contact queries exist.

## [2026-09-04] prototype | Clean Field shadow fix

Diagnosed the field-wide triangular bands with live Engine4D shadow-mode A/B captures. The artifact came from the solid 4D projection camera rendering large W-depth scenery volumes, not the directional dawn light. Patch `0.5.1 · Clean Field` now starts with that projection camera disabled while retaining key `2` diagnostic modes. The 270-frame MacBook Air capture passed the new clean-shadow-mode assertion and every existing gameplay check; visual inspection found no triangular bands.

## [2026-09-04] prototype | Pin Cascade playable

Built and verified prototype `0.6.0 · Pin Cascade`. Replaced independent direct-hit animations with deterministic breadth-first X/Z/W impulse transfer: pins 1 and 2 directly topple, pin 10 topples through combined secondary momentum, and pins 3, 4, 11, and 12 lean and absorb the cascade. Removed arbitrary odd/even W displacement, corrected fallen height and the oversized pin collider, and made scoring wait for all seven affected pins. The MacBook Air capture passed exact direct, secondary, fallen, leaning, untouched, settle, scoring, re-standing, shadow, and reset assertions. Added a 3,240-row per-pin motion trace; the final pin settled on frame 41 and the three-point score appeared on frame 42.

## [2026-09-04] prototype | Playable desktop demo

Promoted the build to `0.7.0 · Desktop Match` after rejecting two collision-settlement candidates that still overlapped. Replaced conflicting push constraints with a deterministic nearest-valid-placement search over each pin's real 4D capsule, corrected ground height, added bounded ground rolling, and measured 2.34 mm minimum result clearance plus 2.37 mm future upright clearance. Added hold/release power throws, a fixed legal launch origin, first-run rules/help, persistent result breakdown, pause/resume/restart/quit, throwing-skittle recovery, and solo three-miss elimination to zero. The final MacBook Air capture passed 360 frames and 4,320 trace rows, including two player-path throws, pause recovery, three off-slice misses, terminal loss, and full reset. Published the validated 24-second clip to the existing Vinssi gameplay page.

## [2026-09-04] prototype | W-Fall playtest

Built and verified `0.8.0 · W-Fall Playtest`. Ordinary home-slice impacts now derive signed W toppling from contact side, direct pins split across W, and re-standing preserves W landing bases. Corrected the throwing skittle to stop at exact swept entry rather than inside the rack, made charge timing deterministic under slow capture, prioritized hidden-axis settlement over visible X/Z teleporting, and added a rendered-frame 4D capsule resolver. The MacBook Air capture passed 360 frames and 4,320 motion rows with 0.77 mm minimum clearance over the entire two-throw run, 2.86–9.11 cm measured fallen-pin W displacement, zero X/Z settlement correction, full match-state checks, and reset.

## [2026-09-04] query + prototype | Recovered thread and rendered 4D falls

Recovered source conversation `01a0574c-47bf-7522-9b32-ad8f15c89ef9` and continued its playable-demo work as `0.9.0 · Rendered 4D Falls`. A matched runtime baseline invalidated part of the prior visual verification: the pin script changed Unity rotation and initialization-only dual Euler values but never updated Engine4D's rendered rotation matrix. The old collision axis differed from the rendered axis by 1.338261, and upright rendered pins sank 40.74 mm below ground. Applied actual 4D rotation matrices, refreshed re-standing/reset rotations, derived ground support from mesh vertices, and ordered contact correction before renderer submission. The final 360-frame capture and 4,320 pin rows pass with axis error below 2.17e-7, no mesh below ground, and 0.743 mm minimum capsule clearance. A further 24 throws at 15/30/60 FPS pass over 915 frames, including varied power/aim and W-focused second turns. All three build-runner tests pass; remote/local sources match and the completed build/capture cache is reusable. Published and verified the exact 24-second MP4 at the existing Vinssi URL. The game process was relaunched, but the Air's macOS screen lock prevented final manual keyboard and foreground verification. Exact mesh-to-mesh collision and general rigid-body physics remain unimplemented; see [[Rendered 4D Falls]].

## [2026-09-04] query | Visual rejection of 0.9.0

Inspected enlarged samples across the exact published 24-second MP4 after the user rejected the pin appearance. The initial rack reads as overlapping flat tokens; around seconds 4–10 almost all pin geometry disappears while a cluster of black numbers remains above a small wood fragment. Re-standing restores shapes abruptly. Source inspection confirms numbers are screen-space GUI labels at a fixed vertical offset, faded over a 0.45 m W range independently of mesh visibility and orientation. Therefore the numeric axis/ground/capsule passes in [[Rendered 4D Falls]] do not establish visually readable pins, attached numbering, or a convincing fall. This was an assessment; no gameplay code changed.

## [2026-09-04] development + research | First Light game and Steam target

The user requested continued overnight development toward a next-day Steam release. Implemented physical face-number textures, readable aiming magnification, optional nearby-W pin outlines, selectable targets, slower controlled W motion, menus/settings, personal-best tracking, and procedural sound feedback. A complete actual-throw test reached exactly 50 in 14 throws and verified a separate 45-to-25 bust. Subsequent visual inspection found another root cause missed by the old proxy tests: the rendered hypercube floor topped out at Y=0.07 while pin support and throwing logic assumed Y=0. The floor now aligns with Y=0, and clearance verification reads its actual mesh surface. The old statements about no mesh below ground referred only to the assumed plane and did not prove clearance from the visible floor. Final visual and match revalidation continues. Ingested primary Valve, Unity, and brand-owner sources into [[Steam Release Requirements]] and recorded external publication gates in [[Steam Release Preparation]].

## [2026-09-05] validation + candidate | First Light 0.10.0

Completed the non-development macOS universal and Windows x64 candidates and applied Unity's official 1.3.3 runtime patcher. The final patched macOS package passed all six runtime reports: boot/menu/cursor/camera checks at 960×600, 1280×720, and 1920×1080; a 360-frame 1080p capture with 4,320 motion rows and actual game audio; 22 physical throws proving a 45→25 bust and exact-50 win on throw 14; and 24 varied throws at 15/30/60 FPS over 914 observed frames. Minimum capsule clearance was 0.743 mm in the video and 1.000 mm in the sweep; the actual floor measurement and minimum rendered ground clearance were both zero. Corrected a one-frame identity-camera reset and clipped control copy found during visual QA. Five build/package tests pass; both ZIPs pass integrity checks, all 332 packaged file hashes match, and the extracted macOS app passes deep/strict signature verification. Sources and the tested assembly match the Air.

Published the verified 24-second H.264/AAC recording at the existing Vinssi playtest URL, version `01a06e42-26b0-7011-ae26-8262d1f69743`. HTTP 200, downloaded MP4 SHA-256, browser playback, 1920×1080 dimensions, and no video error were verified. Prepared six unedited HD gameplay screenshots, player instructions, Steam store/depot drafts, and the exact handoff in `docs/RELEASE_CANDIDATE.md`; see [[First Light Match]]. Relaunched the final macOS app normally on the Air. Its screen remains locked, so physical input and foreground QA are not claimed. A rapid programmatic live resize hung inside native AppKit/Unity window handling; separate launch resolutions passed, and the native sample is retained. Windows execution, private Steam installation, account/review eligibility, commercial naming, and final branded store submission remain unresolved. No Steam upload, purchase, commit, or branch was made.

## [2026-09-05] ingest | Steam content survey and graphical assets

Added primary Valve content-survey and store/library asset records. Updated [[Steam Release Requirements]], [[Steam Release Preparation]], and the wiki index. The store draft distinguishes AI-assisted player-facing content from live generation, lists current capsule/library dimensions, and requires actual gameplay screenshots rather than marketing composites. Commercial naming and final publisher declarations remain owner decisions.

## [2026-09-05] query + ingest | Real-play pin motion references

Responded to the user's remaining dissatisfaction with falling pins by finding primary break/lob tutorials and World Championship footage. Recorded timestamped links and the limits of sparse browser observations in [[Mölkky Motion References]]. Source inspection identifies a fixed 420 ms eased fall, delayed visible X/Z motion, and W progress completing before visible travel. This is a concrete staged-motion explanation, not a calibrated comparison or proof of correct 4D dynamics. Saved source provenance and updated the index. No gameplay code, build, or deployment changed.

## [2026-09-05] development + Air validation | Coherent falls and wider scatter

Implemented `0.10.1 · First Light` after the user requested motion fixes, then wider spread and gameplay testing specifically on the Air. Replaced separate W/visible phases with a shared angular trajectory, moving-base tipping, decelerating skid, and bounded settling recoil. Added translucent projections only for falling/fallen pins, retaining thin outlines elsewhere after visual inspection exposed focused-pin clutter. A 60 FPS capture caught a 1.759 mm overlap missed at 15 FPS; the transient solver now has sufficient convergence passes and retains its early exit. Added plane, projection-state, and visible-spread regression checks.

The initial motion-only revision preserved the baseline trace and settled poses exactly. The later spread request intentionally superseded placement preservation: contact-side deflection and longer X/Z skids widen the tested fallen landing span from 6.15 to 31.4 cm and ground travel from 3.8–4.1 to 21.9–26.2 cm, without increasing the original W skid. Controls, scoring, and re-standing rules remain unchanged.

Built both non-development targets on the Air and applied Unity's official runtime remediation there. Final Air gameplay tests pass: 15/60 FPS captures totaling 1,800 frames and 21,600 pin rows, 24 sweep throws over 896 frames, 26 full-match throws proving bust-to-25 and exact-50 victory on turn 15, and menu/start/pause/resume checks. Minimum capsule gap is approximately 1 mm; floor error is within float precision. The opening throw remains pins 1 + 2 + 10 for 3 points. Saved and visually inspected actual Air frames and a 60 FPS recording; see [[Coherent Pin Falls]]. Earlier local or rejected runs are not substituted for final Air evidence. Windows execution, human input validation, and general-purpose rigid-body physics remain unclaimed. No public upload, Steam submission, commit, or branch was made.

## [2026-09-05] publication + preference | Always deliver videos through Vinssi

Published the 0.10.1 Air gameplay recording, before/after comparison, and quarter-speed inspection clip to the existing Vinssi playtest site. Version `01a07040-9b58-753e-93a5-77e3874e309b` contains 10 files totaling 3,462,709 bytes. All assets return HTTP 200 and match their staged originals; all three current videos decode and advance in browser playback without media errors. The previous 0.10.0 recording remains linked. Updated [[Coherent Pin Falls]], the release handoff, and the wiki index. Recorded the user's standing instruction in `AGENTS.md` and `ops/vinssi-pages.md`: always publish user-facing videos to Vinssi, verify them, and deliver the shareable link rather than local paths alone.

## [2026-09-05] development + Air validation | Ground-led, continuous falls

Iterated through a shader compile rejection, a first motion revision, smoothed transient contact correction, and continuous wood presentation. The matched opening throw reduces upright base travel from 16.7 to 2.4 cm while retaining a 31.4 cm fallen landing span. Pins land flat and keep readable numbered bodies in the default W-aid presentation; G reveals literal slicing without changing positions. The smaller W kick changes dimensional landing locations intentionally, not rules or throw controls. See [[Coherent Pin Falls]].

The patched non-development 0.10.2 Air build passes five final process gates with exit 0: 60 FPS capture, repeated 15 FPS capture, 24 varied throws, 17 match throws with exact-50 and bust-to-25, and interface flow. One earlier 15 FPS capture passed gameplay checks but crashed during native Mono/CoreVideo shutdown; this rejected lifecycle evidence remains recorded and is not claimed fixed. Published the actual Air recording and matched slow-motion comparison to the existing Vinssi site, version `01a0707b-f073-7468-b23c-07d051cfb971` (12 files, 5,092,807 bytes). Page/current-video hashes and browser playback verified. User subsequently requested persistent W shadows, a wider release camera, and a separate phone-controller workstream; these are the next scoped tasks, not claims about this version.

## [2026-09-05] development + Air validation + publication | Lakeside camera and persistent W shadows

Completed `0.10.3 · First Light`: normal/menu/reset camera uses 50° rather than 10°, with optional 18° V inspection. Retained the Finnish lakeside cabin/dock/First Light setting. Off-slice silhouettes and ground shadows stay enabled across W distances and G body-aid toggles. The complete 17,280-row gameplay trace is byte-identical to 0.10.2, preserving its ground-led falls, wider spread, throw controls, and scoring. Seven final Air processes exit 0: 15/60 FPS captures, 24-throw sweep, 17-throw match, and interface/camera checks at three resolutions. Five local ops tests pass. Both desktop targets compile and receive runtime remediation; macOS signature verification passes. The final app remains running normally on the Air. Physical-input feel, Windows execution, and the earlier native shutdown issue remain explicit limits; see [[Lakeside Camera and W Shadows]].

Published the actual wide-camera Air recording, clearly labelled close-up motion references, and normal/inspection screenshots at the existing Vinssi URL, version `01a07089-79a7-7479-94c8-7615e089ceea` (16 files, 7,678,861 bytes). Every asset returns HTTP 200 with matching bytes; all three embedded videos decode and advance in browser playback. No Steam submission, commit, or branch was made.

## [2026-09-05] parallel development | Isolated native phone-throw practice

Two agents separately produced `docs/phone-controller-protocol.md` and `experiments/phone-controller/`. Parent review required second-pad-touch cancellation latched until every pad finger lifts, stationary timed power matching the game's 0.70→1.15 curve over 1.20 seconds, a distinct optional experimental motion-effort type, and reachable safety controls in scrollable content. All 29 core tests pass, and the unsigned arm64 iOS 17.0 app compiles/links against SDK 26.5; the parent repeated both checks successfully. Work is deliberately disconnected: no networking, signing, device installation, physical sensor/touch/haptic validation, or Unity input integration. Outside-pad multi-touch is not observed. The proposed host-ownership/transport contract and physical-iPhone acceptance gates are documented, not implemented. See [[Phone Motion Controller]] and the scaffold README for evidence and remaining limits.

## [2026-09-05] clarification + mobile delivery fix | Readiness, not a publishing deadline

The user clarified that Steam means making the game as ready as possible, not publishing tomorrow. Before the next gameplay change, they reported the newest video failing on mobile. A `bytes=0-1` request returns HTTP 200 and all 1,101,586 bytes; the original page stalls at media readyState 0 in WebKit iPhone emulation. Ingested [[Safari Video Delivery]] and changed the three embedded players to explicitly download only the selected short clip into a local Blob URL before a Play tap. No codec, footage, gameplay, or shared gateway changes were made. Timeout/retry and native video controls remain available.

Published the same Vinssi site as version `01a070dd-fc83-7523-9051-61856a7f187b`, 17 files and 7,681,706 bytes. Every asset returns 200 and matches staged bytes. Final public-URL WebKit/iPhone-emulation checks pass for no automatic downloads, failed-fetch retry, all three clips advancing/decoding, seeking, and mobile layout; screenshot inspected. Tests were muted: unmuted playback stalls even for an independent synthetic H.264/AAC control without a server, so audible output and physical-iPhone behavior remain unverified. The published player retains audio and is not forced muted. Evidence is under `artifacts/video-tests/mobile-*`; the Air game remains unchanged at 0.10.3.

## [2026-09-05] development + Air validation | Input transition safety

Continued readiness work as 0.10.4. Pause/reset previously cleared remembered throw-key state, so a retained key could look like a new press after resuming. The shared held-input boundary now requires both Space and T up before rearming across pause, restart, menu/start, and pointer transitions. Pointer selection cancels charging and rejects throws; arming freezes automatic W focus at the current slice. Existing fresh-press power, quick throws, score rules, pin motion, shadows, and lakeside camera remain intact. See [[Input Transition Safety]].

Built macOS universal and Windows x64 on the Air, applied runtime remediation, and verified the macOS signature. Six new input assertions pass in the focused interface run and the final five-job gate. Final 15/60 FPS captures, 24-throw sweep, 17-throw match, and interface checks all exit 0. All 17,280 high-rate pin rows match 0.10.3 byte-for-byte; exact-50 and bust-to-25 pass. Five ops tests pass; changed source/settings hashes match the Air. The 0.10.4 app is running normally there. Windows execution and human keyboard/focus delivery remain unverified, not substituted with injected-input evidence.

Published the new actual Air video to the existing Vinssi page, version `01a070f3-41f5-75ed-b2b8-b37d72db5517` (18 files, 8,818,364 bytes). All assets return 200 with matching bytes. The mobile Blob loader remains intact; all three embedded clips decode, advance and seek in muted WebKit iPhone emulation, including failed-fetch retry and no automatic downloads. Physical-phone sound is still unverified. No Steam submission, commit, branch, or phone integration was made.

## [2026-09-05] scope redefinition + rule recheck | Hackathon submission-ready

Replaced the active Steam-quality checklist with [[Hackathon Submission Readiness]] at the user's request. The target is one coherent, legible First Light desktop game that a newcomer can download, launch, understand, finish and restart. Preserve the working twelve-pin loop and Finnish lakeside identity. Required remaining work is physical Air/newcomer testing, blocking-stability resolution or a tested safe configuration, current package/download validation, credits/theme/eligibility, and the itch.io page and verified jam entry. Phone input, VR, multiplayer, Steam features and commercial-release paperwork are outside the submission gate. Windows is included only after testing its exact build.

Rechecked the official Nimble itch.io page and recorded a new source recheck without modifying the earlier raw record. Rules retain credited pre-existing assets, jam-window development, participation/team requirements, download instructions/specifications and a strict Sunday 18:00 close; the publicly displayed theme remains unspecified. Updated the runbook, release-evidence introduction, deferred Steam page, source summary and index. No game code, package, public page or submission was changed.

## [2026-09-05] development + Air validation + publication | Hackathon candidate 0.11.0

Built the fixed-window IL2CPP jam profile and clarified the existing first-throw help, retaining the lakeside camera, twelve-pin loop, fall/scatter solver, W shadows and input rules. Installed the exact officially signed Unity 2022.2.2f1 macOS IL2CPP module after the first build reported it missing. Native compilation then exposed an obsolete bundled-zlib platform guard; the one-line upstream-aligned correction builds successfully with the modern SDK. Restored the editor header afterward, preserving original/patched hashes and rejected logs. See [[Unity Mac IL2CPP Build Compatibility]].

Applied Unity's official runtime remediation to the actual candidate. Five final Air gameplay jobs and 22 additional interface/lifecycle runs pass with exit 0, including separate 960×600 and 1920×1080 launches. The 60 FPS recording has 1,440 frames/17,280 pin rows, 0.9926 mm minimum animation clearance, 2.40 cm upright travel and 31.40 cm fallen width; opening score remains 3. The sweep covers 24 throws/967 frames, and the 17-throw match scenarios verify bust-to-25 and exact-50 victory at turn 8. Compared with Mono 0.10.4, states/outcomes/score/axes match; printed Z/W values differ at most 0.01 mm. Six ops tests pass; captured help/pause screens are visually inspected.

Packaged only the patched Mac app plus instructions/specifications, credits, known issues, Engine4D MIT and Liberation Sans OFL notices. ZIP: 42,099,913 bytes, SHA-256 `eacb6bb522f7f609395e97ef2a2eec3490c82d1a16f08900ca0f0679f1b68d99`; all 33 file hashes and deep/strict signature match after extraction locally and after public download on the Air. Published the candidate and three current screenshots to a separate Vinssi site, version `01a0718f-3dbe-73fc-93ca-51f1412799ff` (10 files, 44,132,735 bytes). Published actual 0.11.0 H.264/AAC Air gameplay on the existing video URL, final version `01a07195-53a7-741c-b725-a9080d9b6feb` (22 files, 10,618,041 bytes). All 32 public assets match staged bytes. Three embedded clips advance/seek/retry with no eager downloads in muted WebKit iPhone emulation; physical-iPhone sound remains unclaimed. Desktop and narrow download-page previews are inspected; narrow preview resizing reported a timeout, although its subsequent snapshot shows the applied narrow layout, so no exact viewport-size pass is asserted.

Gatekeeper rejects both the candidate and downloaded copy, exit 3. No Developer ID Application identity is available; no quarantine removal or security override was used. Physical newcomer/keyboard/mouse testing is still pending: the Air was locked during automated runs, later no longer showed the lock flag, but no remote native-UI control or human acceptance record is available. The collaborative browser reaches itch.io login/security verification, not an authenticated dashboard. Theme, team/Discord participation, provenance eligibility and final owner-reviewed submission remain unresolved. Prepared `docs/JAM_SUBMISSION.md` and updated [[Hackathon Submission Readiness]], the runbook, README and release evidence without claiming a jam entry.

A final source/settings comparison caught temporary build settings left serialized on disk. Added explicit asset saving after restoration in `finally`; a separate successful verification build restores resizable/Mono settings and produces the same GameAssembly hash as the public candidate. Local and Air source/settings now match. Cleared the Unity lease and left the original tested 0.11.0 app running normally on the Air. No unpatched verification build was published, and no itch.io/Steam upload, commit or branch was made. Full handoff: [[Hackathon Candidate 0.11.0]].

## [2026-09-05] development + Air validation + publication | Manual aiming 0.11.1

Removed automatic yaw/pitch targeting from the shared pin-selection function: F and numbered roster selection now change only the W slice. Players must aim with the mouse. Updated the controls and help without adding random inaccuracy or changing throw power, collision geometry, scoring, camera distance, pin motion or scatter. The exact-score test harness now aims explicitly rather than depending on player auto-aim. See [[Manual Aiming]].

Built and runtime-patched the fixed-window IL2CPP 0.11.1 candidate on the Air, then restored the temporary editor-header correction and source build settings. Seven final gameplay jobs plus one focused interface run pass with exit 0. All four interface runs verify that selection preserves yaw/pitch and a deliberately off-target throw still misses after selecting a pin. The 24-throw sweep and 17-throw match scenarios pass; the complete 17,280-row opening pin-motion CSV is byte-identical to 0.11.0. Six ops tests pass. Automated results establish removal of auto-aim, not a measured human single-pin hit rate or newcomer acceptance.

Published the actual Air recording and focused-miss evidence to the [existing Vinssi playtest page](https://4d-molkky-unity-video-te-2dywdy3wcj-ilkka-lappetelainen.dev-pages.vinssi.ai), version `01a07216-56ee-7239-ac9c-19a3d8adc496`. Three clips pass advance, seek and failed-fetch retry checks in muted WebKit iPhone emulation, with no eager download or horizontal overflow; physical-phone sound remains unverified. Published the [Mac candidate download](https://first-light-mac-candidat-9e9autz9cj-ilkka-lappetelainen.dev-pages.vinssi.ai), version `01a07216-f77f-740e-8c3c-5a4fc991f739`. All 34 public assets match staged bytes. The ZIP is 42,097,325 bytes, SHA-256 `cdce38a2fdb351ce03a28adfacabd6ebbd6ba5d0115f0a037cf302784bbdb347`; the actual public download on the Air passes archive integrity, all 33 file hashes and deep/strict signature verification.

Gatekeeper still rejects the non-notarized download, exit 3; no security override was used. The historical 22-run lifecycle evidence remains explicitly attributed to 0.11.0. Left the tested 0.11.1 app running normally on the Air. Physical gameplay acceptance, notarization and owner-dependent jam entry requirements remain open. No itch.io/Steam submission, commit or branch was made.

## [2026-11-10] design update + rebuild | Web game replaces the Unity prototype

The owner asked for a completely new build with good graphics and a working game, developed on the MacBook Air. Findings before the decision: no Unity Editor is installed on the Air; the old game is uncommitted C# inside the Engine4D submodule; headless Chrome on the Air renders WebGL 2 on the M4 GPU. The owner compared three engines (web with three.js, Unity with Engine4D, Godot 4) and chose the web stack, desktop first with VR later. Recorded in [[Engine Selection]].

Built `game/`: TypeScript and three.js with project code for 4D rigid-body physics and slice rendering. Pins are spherinders with the 45 degree cut top; the rack is a close-packed cluster in the three ground directions; the view is a 3D slice that turns in the X-W plane; pins outside the slice show as blue and amber ghosts and on a 4D compass. Rules follow [[Mölkky Rules Model]]. Design and reasons: [[Web Rebuild]].

Three defects found and fixed during the build, each with a test or a measured check: upright neighbours sank into each other because a rim point level with a neighbour's base was pushed up instead of sideways (contacts now use the surface that the rim's centre faces); cut faces showed pinwheel holes when the slice passed exactly through a mesh vertex (quad winding now uses the diagonals); frame time was 39 ms at Retina resolution because ground and grass computed noise in the shader (now a precomputed 3D noise texture and adaptive resolution: 11 ms median aiming, 15 ms during a throw at 2160x1350).

Evidence: 36 unit tests pass; typecheck, lint and format are clean; the production build plays a scripted 17-throw match to the end in headless Chrome with no console errors. Evidence type is fixture and headless browser. No human playtest exists. A 42-second frame-exact gameplay clip was captured without sound.

Also in this change: baseline commit of the wiki, docs and ops to the public GitHub repository, with `raw/` kept local by owner decision; `AGENTS.md` assumptions, the project README and [[Engine Selection]] updated; the Unity material is marked historical in the index. Publication of the playable build and the clip to Vinssi Pages is recorded in the next entry.

## [2026-11-10] publication | Playable web build and gameplay clip

Published the production build of `game/` to Vinssi Pages with the production CLI 0.1.4 after the owner approved the sign-in: [play the game](https://4d-molkky-first-light-9mux3zyu6w-ilkka-lappetelainen.pages.vinssi.ai), site `01a1c4db-14f2-75d6-8d81-440613b0daf6`, 3 files, 692,078 bytes. The URL returns HTTP 200, and one scripted throw against the public URL completes in headless Chrome with no console errors.

Published the gameplay clip on a new page: [watch](https://4d-molkky-web-rebuild-ga-pzv2n3ck9h-ilkka-lappetelainen.pages.vinssi.ai), site `01a1c4db-9333-74da-9af0-d5930885fcfa`. The clip is 41.6 seconds, 1280x720, H.264, 10,808,659 bytes, captured frame by frame at 30 frames per second with the game clock stepped per frame; it has no sound. The public MP4 matches the local file byte for byte (SHA-256). The existing playtest page was not updated: it is on the dev service and its staged assets are not on this machine.

The production gateway answers a two-byte range request with HTTP 200 and the whole file, like the dev gateway in [[Safari Video Delivery]]. With a plain video source the clip played but a seek to 30 seconds fell back to the start. The page now uses the existing load-then-play Blob loader; in Chrome at 390x844 the clip loads, advances, seeks to 30 seconds and continues, with no page errors and no horizontal overflow. Safari and physical phones are not checked. Operations: `ops/vinssi-pages.md`.
