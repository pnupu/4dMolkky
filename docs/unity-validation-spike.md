# Unity Validation Spike

Purpose: validate whether Engine4D is a practical base for a VR 4D Mölkky prototype before building gameplay systems on top of it.

## Current Repo Setup

- Engine4D is included as a submodule at `external/Engine4D`.
- Upstream: https://github.com/HackerPoet/Engine4D
- Current submodule commit: `d9322378e91d6c3c023387a0d126bef97aab36bd`
- Engine4D Unity version: `2022.2.2f1`
- Relevant scenes:
  - `external/Engine4D/Assets/Sample/SampleScene4D.unity`
  - `external/Engine4D/Assets/Sample/SampleScene5D.unity`
- Relevant prefabs:
  - `external/Engine4D/Assets/Objects3D/MainCamera.prefab`
  - `external/Engine4D/Assets/Sample/UICanvas.prefab`
- Results log:
  - `docs/unity-validation-results.md`

## Preconditions

- Install Unity Hub.
- Install Unity `2022.2.2f1` if available, or the closest compatible Unity 2022.2 editor.
- Include macOS build support and any XR modules Unity Hub offers for the editor version.

## Step 1: Open Engine4D

Open `external/Engine4D` as a Unity project.

Expected:

- Unity opens the project.
- Package restoration completes.
- No blocking compile errors remain after import.

Record:

- Unity editor version used: `2022.2.2f1`
- Import errors: none found in editor log
- Package manager errors: none blocking found in editor log
- Compile errors: none found in editor log

## Step 2: Desktop Sample Validation

Open and run:

`Assets/Sample/SampleScene4D.unity`

Validate:

- Scene enters play mode.
- Main slice rendering is visible.
- Ghost projection or shadow view can be toggled.
- Camera movement works.
- 4D look / W-axis movement controls work.
- Sample colliders behave plausibly.

Record:

- Play mode result: passed by manual GUI check
- Rendering result: apparently working
- Movement result: apparently working
- 4D controls result: apparently working
- Physics/collision result: apparently working
- Notes: user reported "Everything seems to be working"; detailed toggle/control notes still pending

## Step 3: Inspect Camera and UI Prefabs

Inspect:

- `Assets/Objects3D/MainCamera.prefab`
- `Assets/Sample/UICanvas.prefab`

Validate:

- Which cameras are present.
- Which scripts are attached.
- Whether `VRCamera` is present or must be added manually.
- Whether `UICanvas` behaves in desktop play mode.

Record:

- MainCamera scripts:
- Child cameras:
- UI scripts:
- VR-specific components:
- Notes:

## Step 4: XR Package Validation

Check Project Settings:

- XR Plug-in Management
- OpenXR
- Input System

Validate:

- OpenXR settings load without errors.
- Unity does not force incompatible package upgrades.
- Input actions asset `Resources/Controls` is present and valid.

Record:

- XR Plug-in status:
- OpenXR status:
- Input System status:
- Notes:

## Step 5: Minimal VR Run

Use the smallest possible test:

1. Start from `SampleScene4D`.
2. Enable XR/OpenXR.
3. Enter play mode with a headset connected, or use available XR simulation if no headset is ready.

Validate:

- Stereo rendering appears.
- Head tracking affects the view.
- World-space UI is visible and not stuck to the face.
- Left controller can affect 4D rotation if mapped.
- Right controller can be detected for future throwing.

Record:

- Headset / runtime: macOS OpenXR path blocked; no real runtime available through this Unity/OpenXR package
- Stereo rendering: unvalidated
- Head tracking: unvalidated
- Controller detection: unvalidated
- UI behavior: `MainCamera` contains `VRCamera` wired to `UICamera`, but runtime behavior unvalidated
- Comfort issues: unvalidated
- Notes: Unity OpenXR Project Validation reports only Windows x64 standalone support for this package path

## Step 6: Go / No-Go

Proceed with Engine4D if:

- desktop sample runs,
- 4D rendering is legible,
- custom physics works enough for a simple throwable proxy,
- XR can render at least a static 4D scene.

Reconsider if:

- sample project cannot compile,
- VR rendering requires rewriting most camera/shader infrastructure,
- controller input cannot be made reliable,
- performance is unacceptable with a small scene.

## First Prototype After Validation

If the spike passes, create a separate prototype scene with:

- 3-5 numbered 4D target pins,
- one simplified throwable,
- hit detection,
- basic Mölkky scoring,
- slice or W-layer inspection.
