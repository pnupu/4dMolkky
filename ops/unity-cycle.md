# Change-aware Unity cycle

`ops/unity_cycle.py` serializes access to the Engine4D Unity project and reuses unchanged scene, build, and capture stages. It uses only Python's standard library.

## Use on the MacBook Air

Preview work without starting Unity:

```sh
cd /Users/ilkka/4dmolkky
python3 ops/unity_cycle.py plan
```

Generate the scene when its generator inputs changed, build when player inputs changed, and capture when the matching validated capture does not exist:

```sh
python3 ops/unity_cycle.py run
```

Build without producing capture frames:

```sh
python3 ops/unity_cycle.py run --no-capture
```

Force one stage. Forcing the scene also forces its downstream build and capture; forcing the build also forces capture.

```sh
python3 ops/unity_cycle.py run --force scene
python3 ops/unity_cycle.py run --force build
python3 ops/unity_cycle.py run --force capture
```

The first run establishes the generated-scene fingerprint, so it rebuilds the authoritative prototype scene. Close the Unity Editor first. The runner fails rather than competing with an editor that owns `Temp/UnityLockfile`. Forced or incomplete captures replace only their exact generated hash directory under `artifacts/unity-cycle/captures/`.

Outputs are under `artifacts/unity-cycle/`:

- `build/MolkkyPrototype4D.app` and `build-complete.json`
- `captures/<hash>/frame-*.png`, `capture-report.json`, and `player.log`
- `logs/build-<hash>.log`
- `state.json` and `last-run.json`

A capture is reusable only when its report says `passed`, `complete.txt` is valid, and the exact reported number of PNG frames exists.

After a pin-motion change, also run the varied-throw regression against that same completed build:

```sh
artifacts/unity-cycle/build/MolkkyPrototype4D.app/Contents/MacOS/Engine4D \
  -screen-fullscreen 0 -screen-width 1280 -screen-height 720 \
  -molkkyCaptureDemo -molkkyThrowSweep \
  -molkkyCaptureOutput "$PWD/artifacts/throw-sweep" \
  -logFile "$PWD/artifacts/throw-sweep.log"
```

This explicitly enabled mode checks 24 throws: four power/aim combinations at 15, 30, and 60 FPS, with a second turn after re-standing and W focus. It writes `throw-sweep.csv`, result screenshots, and `throw-sweep-report.json`; exit code 4 means a failed check. The standard capture also requires the rendered matrix axis to match the collision axis and the actual pin mesh to remain above ground. These remain capsule contact checks, not exact mesh-to-mesh collision certification.

For detailed pin motion, add `-molkkyCaptureFps 60` to the standard `-molkkyCaptureDemo` invocation and use a separate output directory. Accepted rates are 15, 30, and 60; default remains 15. Charge, pause, and reset timings scale with the chosen rate, and the report records `framesPerSecond`. Both the capture and sweep reject a pin axis that leaves its impact plane. The standard capture also verifies that a fallen pin has a visible nearby-W projection. Use the 60 FPS capture as well as the sweep: its full-power straight rack break exposed crowded-contact non-convergence that the other scenarios missed. Capture simulation rate is not a measured rendering-performance guarantee.

Run gameplay QA on the MacBook Air. The 0.10.1 straight-break capture additionally requires at least 18 cm fallen-pin ground travel and a 30 cm fallen landing span, and rejects filled projections on non-fallen pins. These assertions cover the requested wider ground scatter without treating additional W displacement as visible spreading.

The 0.10.2 capture also rejects more than 3.5 cm base travel while a falling pin remains within 45° of upright, unsupported presentation shaders, and body-aid toggles that move pins. In 0.10.3 it additionally requires persistent ground and W-outline shadows, including the far-W miss sequence. Normal capture uses the same wide camera as released play, not an implicit close-up. Interface QA checks the 50° start camera and the optional 18° inspection toggle, preserving the player's position.

Require both a passing report and a clean process exit. The first 0.10.2 release capture wrote a passing gameplay report but crashed during native Mono/CoreVideo shutdown; repeated capture and the other final jobs exited 0. Preserve such incidents separately rather than treating a JSON result alone as complete lifecycle evidence.

## What may run in parallel

For input changes, the interface harness also requires all six transition assertions: held Space/T suppression after pause and restart, pointer-mode cancellation, menu/start suppression, fresh charged/quick throw behavior, and no W drift during arming. These run through `ProcessThrowInput`, the same held-input boundary used by Update, rather than injecting resolved velocities. Physical keyboard/focus delivery is still a separate manual gate.

Do not run multiple Unity Editors or builds against `external/Engine4D`. Unity itself rejects that; `docs/unity-build-prototype.log` records the fatal “Multiple Unity instances cannot open the same project” result. The runner adds an advisory lock so two runner processes wait instead of colliding, then checks Unity's own project lock before starting.

Separate project copies can technically build concurrently, but this duplicates `Library` state and competes for the MacBook Air's 16 GB memory, package cache, licensing client, CPU, and disk. It is not a useful jam optimization.

Safe parallel work is downstream of a completed build: video encoding, contact-sheet generation, page preparation, and log inspection. Source-only agent work can continue, but if tracked Unity inputs change while a build is running the runner rejects that build and requires a clean rerun. Multiple standalone captures are possible with distinct output directories, but GPU contention makes their timing and visual evidence less repeatable; the runner serializes identical captures by capture hash.

## Cycle-time evidence

Metric: wall-clock time from requesting a cycle until a passing capture exists. Correctness guardrail: the same validated app/capture hash, complete frame count, and passing capture report.

Observed evidence from the existing workflow:

- The successful standard-field captures contain 270 frames.
- File timestamps show an 18-second frame-writing span in both `standard-field-v03-visual` and `standard-field-v03-baton-final`.
- Each full PNG set is about 68–69 MB.
- `docs/unity-build-prototype.log` proves an attempted second Unity process fails immediately when the project is already open.
- No successful editor build log with start/end timestamps was preserved, so an honest build-duration baseline cannot be reconstructed from this checkout.

The accepted optimization is structural: an unchanged iteration performs hashing and validation only, skipping scene generation, Unity startup/build, and the 18-second capture. When scene generation is necessary, `AutomatedMolkkyBuild.GenerateSceneAndBuildMacOS` now performs generation and build in one Unity process rather than paying for two launches.

Local matched planner samples on 2026-09-04 were `0.33 s`, `0.15 s`, and `0.15 s` (`p50 0.15 s`; the first sample paid cold filesystem/cache cost). The first complete MacBook Air cycle then measured `11.80 s` for combined scene generation and build plus `28.24 s` for the 270-frame capture. The immediately repeated unchanged cycle reused both artifacts and completed in `0.44 s` wall time.

Record actual Air timings from `build-complete.json` and `last-run.json`. For a matched before/after measurement, run one forced cycle followed by three unchanged cycles:

```sh
python3 ops/unity_cycle.py run --force all
python3 ops/unity_cycle.py run
python3 ops/unity_cycle.py run
python3 ops/unity_cycle.py run
```

Do not compare a cold import with a warm incremental build. Preserve `artifacts/unity-cycle/logs/`, `build-complete.json`, and `last-run.json` with any reported timing.

Run the local orchestration regression checks with:

```sh
python3 -m unittest discover -s ops -p 'test_unity_cycle.py'
```

## Optimization ledger

| Iteration | Change | Before | After | Decision |
|---|---|---:|---:|---|
| Baseline | Always invoke requested Unity/capture stages | Capture alone: 18 s frame span; successful build duration unavailable | — | Reference |
| 1 | Content hashes, validated artifact reuse, serialized locks | Unity/build/capture repeated | Unchanged decision path p50: 0.15 s locally | Accepted |
| 2 | Combined scene-generation and build editor method | Two potential Unity launches | One Unity launch; 11.80 s on the Air | Accepted |
| 3 | Reuse validated hash-addressed app and capture | Full cycle required | 0.44 s unchanged cycle on the Air | Accepted |

Stopping reason: the remaining expensive work is required Unity build/rendering; parallel builds against one project are invalid, and deeper build profiling needs a preserved successful remote build log.
