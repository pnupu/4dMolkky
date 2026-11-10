# Unity Validation Results

Running status log for the Engine4D Unity validation spike.

## [2026-04-30] Editor Detection

Status: passed.

Findings:

- Unity Hub is installed at `/Applications/Unity Hub.app`.
- Unity `2022.2.2f1` is installed at `/Applications/Unity/Hub/Editor/2022.2.2f1/Unity.app/Contents/MacOS/Unity`.
- Unity opened `external/Engine4D` through Hub.

Next action:

- Continue with desktop sample validation.

## [2026-04-30] Initial Import And Compile

Status: passed.

Unity command observed:

`/Applications/Unity/Hub/Editor/2022.2.2f1/Unity.app/Contents/MacOS/Unity -projectpath /Users/ilkka/4dmölkky/external/Engine4D`

Findings:

- Package import completed.
- `Assets/Objects3D/MainCamera.prefab` imported.
- `Assets/Sample/UICanvas.prefab` imported.
- OpenXR package assets imported.
- Assembly reload completed.
- No `error CS`, `Compiler Error`, `Scripts have compiler errors`, `Shader error`, or explicit `Exception:` entries were found in `~/Library/Logs/Unity/Editor.log`.

Non-blocking notes:

- Unity logged package files outside `Assets` that "will not be compiled"; these appear to be normal package import noise.
- Unity logged `EditorUpdateCheck: Failed The requested URL returned error: 404`; this is not relevant to Engine4D compile health.

Next action:

- In the Unity GUI, open `Assets/Sample/SampleScene4D.unity`.
- Press Play and validate slice rendering, camera movement, 4D controls, and basic collisions.

## [2026-04-30] Desktop Sample Validation

Status: passed by manual GUI check.

Scene:

`external/Engine4D/Assets/Sample/SampleScene4D.unity`

Findings:

- The sample scene opens and runs in Unity `2022.2.2f1`.
- User reported that everything seems to be working.
- This clears the basic Engine4D viability gate for desktop mode.

Remaining unknowns:

- Exact control mappings used during the manual check.
- Whether all shadow/ghost/wireframe toggles were exercised.
- Whether any warnings appear only during extended play.
- XR rendering and controller input are still unvalidated.

Next action:

- Validate XR/OpenXR settings and minimal VR run.

## [2026-04-30] macOS OpenXR Validation

Status: blocked by platform support.

Findings:

- OpenXR was enabled in XR Plug-in Management.
- `Initialize XR on Startup` was enabled.
- A Valve Index Controller Profile was added.
- Mock Runtime and Runtime Debugger were enabled.
- `MainCamera` has Engine4D's `VR Camera` script with `UICamera` wired.
- Unity's OpenXR Project Validation reported: "The only standalone target supported is Windows x64 with OpenXR. Other architectures and operating systems are not supported at this time."

Interpretation:

- The macOS editor can run the desktop Engine4D sample, but this Unity/OpenXR package path does not provide real standalone OpenXR Play Mode on macOS.
- This is not currently evidence against Engine4D's VR scaffolding; it is a platform/runtime blocker.

Next action:

- Continue prototype work in desktop mode on macOS.
- Use Windows for PC VR validation later, or Android/Quest build validation if targeting standalone Quest.

## [2026-04-30] Prototype Versioning

Status: active.

Current prototype version:

- `0.1.5`

Convention:

- Increment `MolkkyPrototypeController.PrototypeVersion` after each prototype behavior/UI update.
- The version is shown in the in-game debug HUD.

## [2026-09-05] First Light release candidate

Current version: `0.10.0`. Status: macOS candidate tested; Windows compiled; Steam publication unresolved.

All six final-package runtime reports passed: three boot/menu resolution tests, a 360-frame 1080p gameplay/audio capture, full exact-50 and bust match scenarios, and a 24-throw 15/30/60 FPS sweep. Five build/package helper tests also pass. The visible floor, physical face numbers, camera reset, and control text were inspected in actual rendered frames.

Exact evidence, package locations, runtime-remediation hashes, the native live-resize failure, and remaining Windows/manual/Steam gates are recorded in `docs/RELEASE_CANDIDATE.md`. These results do not replace an unlocked-session keyboard/mouse playtest or a Windows execution test.
