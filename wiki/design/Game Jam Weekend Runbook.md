# Game Jam Weekend Runbook

This runbook organizes the 48-hour Nimble Game Jam so agents can do most implementation while the human owner supplies the theme interpretation, product decisions, physical iPhone testing, visual judgment, and final submission authority.

## Operating Assumptions

- Jam: Friday 4 September 2026 at 18:00 through Sunday 6 September 2026 at 18:00 Helsinki time.
- Target: a tested downloadable macOS desktop game; the iPhone motion controller is optional until its first end-to-end gate passes.
- Unity: `2022.2.2f1`, Engine4D project at `external/Engine4D`.
- Human availability: intermittent rather than continuous.
- Steering channel: the persistent root T3 Code thread from the phone app.
- Status surface: one unlisted Vinssi Pages URL, republished at the same address after each milestone.
- Maximum concurrent work: root orchestrator plus three agents.
- The user owns theme interpretation, scope changes, physical-device tests, aesthetic approval, and itch.io submission.

## Definition of Success

[[Hackathon Submission Readiness]] is the current acceptance contract. By Sunday at 16:30, the internal buffer target, there is a tested downloadable build that a new player can launch, understand, play through a complete match, and restart or quit. It includes credits, controls, tested-platform notes, known issues, and the theme explanation. The itch.io entry must be submitted and verified before the official close; no Steam submission is required.

Current handoff: [[Manual Aiming]] is 0.11.1, with eight clean Air runs, a verified public Mac archive, screenshots/video and `docs/JAM_SUBMISSION.md`. It removes target-selection auto-aim without changing pin motion. [[Hackathon Candidate 0.11.0]] retains the earlier lifecycle evidence. Normal downloaded launch is blocked by Gatekeeper, and physical newcomer testing plus theme/team/eligibility and authenticated itch.io submission remain unpassed. Do not treat the available download as a completed entry.

## Scope Stack

### Submission floor

- macOS build launches outside Unity,
- keyboard/mouse throwing works,
- retain the already implemented twelve readable pins and complete rules,
- throw resolves exactly once,
- score/miss/win rules work,
- reset and replay-next-throw work,
- active slice and hidden-W state are legible,
- one-minute first-run instructions,
- pause/quit and basic audio controls,
- credits and download instructions.

### Preferred jam build

- announced theme is integrated into the core loop,
- focus a pin and move to its slice,
- clear score breakdown and results screen,
- sound and restrained visual feedback,
- automatic screenshot and short highlight recording.

### Stretch only

- native iPhone throwing, only after its physical-device end-to-end gate passes,
- sophisticated replay editor,
- multiple environments,
- multiplayer,
- VR,
- online services,
- level editor.

## Agent Topology

### Root orchestrator and integrator

Owns the backlog, task assignment, shared architecture, conflict resolution, Unity lease, integration, builds, evidence, dashboard updates, and final handoff. It is the only lane allowed to change shared scene-builder code or create release builds unless it explicitly transfers the Unity lease.

### Lane A — gameplay and 4D rules

Owns core C# domain logic, tests, pin/throw state, scoring, W behavior, focus/slice commands, and keyboard fallback. It should prefer code-created objects and testable state machines over manual scene edits.

### Lane B — native iPhone controller

Owns the SwiftUI/Core Motion app, OSC/UDP schema, calibration, touch arm/release, acknowledgement/retry behavior, haptics, physical-device build instructions, and recorded sensor fixtures. It must not edit gameplay rule files.

### Lane C — presentation, QA, and release material

Owns HUD/menu/help/credits assets, automated smoke tests, screenshots, video capture scripts, itch.io copy, controls sheet, regression checklist, and performance/error review. It may report UI findings but should not rewrite core gameplay files without reassignment.

## Shared-Workspace Rules

- Root assigns exact file ownership before parallel work.
- Only one agent may run or build Unity at a time.
- Before launching Unity, acquire `ops/unity-lease.md`; release it after the process exits.
- Never open a second Unity instance against `external/Engine4D`.
- Agents inspect `git status --short` before editing and preserve unrelated changes.
- Every task ends with: files changed, tests run, evidence paths, known risks, and recommended next task.
- No agent may expand P0 scope without a root decision.
- No destructive Git commands, package upgrades, Unity-version migration, or submission upload without explicit user authority.

## Agent-Ready Unity Strategy

Unity `2022.2.2f1` does not need a dedicated MCP if the project exposes automation entry points.

### Required automation additions

- `JamAutomation.BuildMac()` editor command for a deterministic macOS build.
- `JamAutomation.OpenDemo()` to open the canonical prototype scene.
- `JamAutomation.RunSmoke()` or Unity Test Framework EditMode/PlayMode tests.
- `JamAutomation.CaptureEvidence()` to load a deterministic state and save screenshots.
- A demo/autoplay component that performs a known throw and exits or loops.
- Structured logs with prototype version, scene, score events, controller packets, and build result.

### Batch-mode contract

Agents should be able to invoke Unity with explicit project, log, and exit behavior:

```text
Unity -batchmode -nographics -quit \
  -projectPath external/Engine4D \
  -executeMethod JamAutomation.BuildMac \
  -logFile artifacts/logs/unity-build.log
```

Tests and builds must have timeouts, preserve logs, and fail on compiler errors. Batch mode cannot run while the editor owns the project.

### GUI boundary

Argent is installed locally, but it targets simulators/emulators and Chromium rather than the macOS Unity Editor, and its MCP tools are not exposed in the current T3 session. AppleScript UI automation is a fragile last resort and requires Accessibility permission. The plan therefore avoids routine GUI editing.

Use a human checkpoint only when a decision genuinely requires visual judgment or physical input. All other work should run through source files, editor scripts, tests, builds, logs, screenshots, and a standalone player.

## Screenshots and Video Evidence

### Screenshots

- Use Unity's `ScreenCapture.CaptureScreenshot` from deterministic demo states when possible.
- Store images under `artifacts/screenshots/<build-id>/`.
- Capture: title/help, initial slice, armed throw, pin impact, W displacement, score breakdown, and result screen.

### Video

- Build and launch the standalone macOS player with a deterministic autoplay/demo mode.
- Record a bounded interval using macOS `screencapture -v -V <seconds>`.
- Store original `.mov` under `artifacts/videos/<build-id>/`.
- Transcode a review copy with `ffmpeg` if necessary.
- Screen Recording permission must be granted to the terminal/T3 host before the jam.
- Do one pre-jam 10-second capture test; never discover permissions on Sunday.

### Evidence manifest

Each candidate build gets `artifacts/builds/<build-id>/manifest.md` containing:

- commit/diff identity,
- prototype version,
- build command and exit result,
- test summary,
- known issues,
- screenshot/video links,
- platform and controls,
- SHA-256 of the downloadable archive.

## T3 Phone Steering Protocol

Keep one root thread alive for the entire jam. The root agent delegates work and consolidates results; the user should not manage three independent agent conversations from the phone.

Every agent update must use this compact structure:

```text
STATE: green | yellow | red
DONE: one sentence
EVIDENCE: path or build ID
BLOCKER: none or one concrete decision
NEXT: one proposed action
DECIDE BY: time, only when necessary
```

Useful phone commands:

- `Continue autonomously toward the current P0 gate. Do not add scope.`
- `Status: only blockers, current build ID, and next human decision.`
- `Approve the proposed fallback. Update the dashboard and continue.`
- `Drop phone-controller work. Move Lane B to gameplay QA.`
- `Freeze features. Fix only submission blockers and produce a candidate build.`
- `Record a 20-second demo of the current candidate and report the artifact path.`
- `Prepare the submission package, but do not upload it.`

## Vinssi Dashboard Protocol

- Publish `docs/gamejam-control/index.html` once before the jam.
- Keep the returned `siteId` in a local operational note, not in public page content.
- Republish to the same site after every gate and whenever state becomes red.
- The dashboard is unlisted but publicly readable to anyone with the URL: include no credentials, private tokens, personal calendar details, or unpublished secrets.
- The page is status and steering support, not a command backend. Copy a command from it into the T3 phone thread.
- Local dashboard checkboxes are personal browser state and do not report completion to agents.

## Human Checkpoint Budget

The plan asks for approximately 15–25 minutes at each checkpoint. Outside these windows, agents continue until a gate, blocker, or stop condition.

### Friday

- **17:50–18:20 — Theme and scope:** read the theme, choose one interpretation, authorize P0, and start lanes.
- **21:00 — First playable review:** test keyboard throw, decide whether the concept reads, and cut any weak mechanic.
- **23:30 — Phone gate:** physically test controller if available. Pass it, give one bounded fix attempt, or drop it from P0.

### Saturday

- **10:00 — Overnight integration:** play the latest candidate and answer at most three blocking questions.
- **15:00 — UX/readability:** assess W cues, scoring clarity, instructions, and comfort.
- **21:00 — Feature freeze decision:** choose what survives; require first packaged candidate before sleep.

### Sunday

- **10:00 — Candidate review:** play from downloaded archive, not from the editor.
- **14:00 — Hard feature freeze:** fixes, packaging, evidence, and submission copy only.
- **16:30 — Release candidate approval:** validate archive, controls, description, and known issues.
- **17:15 — Submission authority:** user uploads/submits or explicitly authorizes the final external action. Target completion by 17:30.

If a checkpoint is missed, the root follows the previously approved P0 and chooses the least expansive fallback. Missing a checkpoint never authorizes uploading, purchasing, deleting, or changing the core theme.

## Weekend Timeline and Gates

### Before Friday 17:00 — automation rehearsal

- create automation entry points,
- prove batch compile/test/build,
- prove standalone launch,
- prove screenshot and 10-second video capture,
- publish the dashboard,
- test T3 phone access,
- build the simplest iPhone motion/touch spike,
- prepare itch.io draft text and credit ledger.

Gate: one command produces a playable desktop build and evidence without touching the Unity GUI.

### Friday 18:00–21:00 — theme to playable

- translate theme into one sentence and one mechanic,
- integrate only the smallest theme expression,
- stabilize throw/resolve/score/reset,
- retain keyboard fallback,
- create initial instructions.

Gate: complete loop in a standalone build.

### Friday 21:00–Saturday 10:00 — parallel depth

- Lane A: scoring, focus/slice, deterministic tests,
- Lane B: native phone connect/calibrate/arm/release,
- Lane C: HUD, instructions, evidence automation,
- root: integrate in small batches and rebuild after each.

Gate: morning candidate with tests and evidence. Phone path is either green or explicitly optional.

### Saturday 10:00–21:00 — comprehension and presentation

- prioritize why a hit happened over adding mechanics,
- tune W visibility and recentering,
- add score/result feedback,
- test first-run experience,
- address performance and hangs,
- make itch.io page and credits nearly final.

Gate: first submission-shaped archive by 21:00.

### Saturday 21:00–Sunday 10:00 — freeze and harden

- no new systems after feature freeze,
- run repeated smoke flows,
- repair blocker-level defects,
- test clean launch and save/settings defaults,
- record a short demonstration.

Gate: release candidate 1 with known-issues list.

### Sunday 10:00–14:00 — external-machine mindset

- test the archive rather than editor play mode,
- remove assumptions about developer paths,
- validate controls and phone fallback wording,
- ensure credits/licenses and theme explanation are present.

Gate: content-complete candidate.

### Sunday 14:00–17:30 — submission lane

- blocker fixes only,
- rebuild and hash archive,
- capture final screenshots/video,
- finalize description and specifications,
- user performs or explicitly authorizes upload,
- verify the download once uploaded.

Gate: submitted and downloadable before 17:30, leaving 30 minutes of contingency.

## Automatic Stop Conditions

- Phone controller: drop from P0 after one bounded repair cycle or if it is not end-to-end by Friday 23:30.
- VR: no implementation during the jam unless working hardware and a proven build path exist before theme reveal.
- Replay: reduce to deterministic highlight capture; do not build a general replay system.
- Unity GUI: after two automation failures, improve the editor script or schedule a human checkpoint; do not blindly click.
- Build regression: revert or isolate the latest lane's change, not the whole worktree.
- Sunday 14:00: all non-blocking feature work stops.

## Decision Hierarchy

When the user is unavailable, root decides in this order:

1. Preserve a downloadable build.
2. Preserve the complete throw-and-score loop.
3. Preserve understandable 4D behavior.
4. Preserve keyboard/mouse fallback.
5. Preserve theme clarity.
6. Preserve phone input.
7. Preserve polish and stretch features.

## Sources

- [[Nimble Game Jam]]
- [[Game Jam Preparation]]
- [[Feature Inventory]]
- [[Phone Motion Controller]]
- [[Prototype Scope]]
- [Official OpenAI Codex use cases](https://developers.openai.com/codex/use-cases)
