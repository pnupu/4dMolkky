# Engine4D Project Inspection

Engine4D includes Unity 2022 metadata, OpenXR packages, VR scripts, and VR-specific branches in its camera control code.

## Source

- Repository: https://github.com/HackerPoet/Engine4D
- Source record: `raw/sources/engine4d-project-inspection.md`
- Accessed: 2026-04-30

## Project Metadata

- Unity editor version: 2022.2.2f1.
- Package manifest includes `com.unity.xr.openxr` version 1.6.0.
- Package manifest includes Unity Input System 1.4.4.
- License is MIT, copyright HackerPoet 2024.

## VR-Related Files

- `Assets/VR/VRCamera.cs` changes UI camera behavior when XR is enabled, enables a `VR_RENDER` shader keyword, adds tracked pose support, and converts canvases to world-space rendering.
- `Assets/Scripts/VRInputManager.cs` wraps controller button, position, and orientation access for left and right XR controllers.
- `Assets/Scripts/CameraControl4D.cs` has XR-specific behavior for camera height, 4D rotation using the left-hand controller, and disabling desktop up/down look override in VR.
- `CompassContainer.cs` and `CompassLetter.cs` contain XR checks for UI/compass behavior.

## Physics-Related Files

- `Assets/Scripts/Physical4D.cs` implements custom 4D movement, gravity, drag, collision handling, and bounce / restitution behavior.
- `Physical4D` uses a sphere radius as the moving object's collider shape.

## Interpretation

Engine4D is not merely desktop-only: it has VR scaffolding and OpenXR configuration. However, the README still says VR/XR documentation is not finished, so the practical status must be validated in Unity before relying on it for production.

## Sources

- [[Engine4D]]

