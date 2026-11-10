# VR Feasibility

VR is the desired platform, but Engine4D's current public README does not establish finished VR support.

## Evidence

Engine4D's README contains a `VR and XR` section that says support is still work in progress and more documentation will come when official VR support is finished.

The repository also contains OpenXR package configuration, `Assets/VR/VRCamera.cs`, `Assets/Scripts/VRInputManager.cs`, and VR branches in `CameraControl4D`. This is positive evidence that VR support is partially implemented, but not proof that the full sample scene works comfortably in headset.

Local validation on macOS hit a Unity/OpenXR platform blocker: OpenXR Project Validation reports that only Windows x64 standalone is supported for this OpenXR path. The desktop Engine4D sample works, but real headset validation remains unresolved.

## Technical Questions

- Does Engine4D currently compile with Unity XR packages installed?
- Can its multi-camera slice, projection, wireframe, and overlay rendering be adapted to stereo rendering?
- Does ghost projection create comfort or depth-perception problems in headset displays?
- How should fourth-dimensional camera controls map to VR input without causing nausea?
- Is a seated or standing interaction model better for throwing precision?

## Prototype Recommendation

Treat VR as a parallel feasibility track:

- First, make a non-VR desktop 4D throwing sandbox if Engine4D setup is not already working. Initial Engine4D desktop sample validation has passed.
- Then adapt the smallest possible view to XR on a supported runtime: static scene, visible pins, no scoring.
- Only after stereo rendering is comfortable, add throwing, slice controls, and scoring.

The first VR test should be deliberately small: launch a static 4D scene with a few pins, verify stereo rendering, verify world-space UI, and verify left-controller 4D rotation before implementing full throwing.

## Sources

- [[Engine4D]]
- [[Engine4D Project Inspection]]
- [[VR Interaction Model]]
