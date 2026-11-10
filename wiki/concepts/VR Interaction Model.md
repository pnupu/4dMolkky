# VR Interaction Model

VR interaction should make throwing feel embodied while keeping fourth-dimensional controls constrained and understandable.

## Engine Evidence

Engine4D includes a `VRInputManager` for XR controller input and `CameraControl4D` support for 4D rotation using the left-hand controller when XR is enabled. `VRCamera` also adjusts UI and shader behavior for VR.

## Interaction Split

- Right hand: physical throw of the Mölkky object.
- Left hand: inspect or rotate the 4D slice.
- Head: natural 3D view only; avoid mapping head pitch or roll directly to 4D rotation.
- UI: world-space score and pin status, not flat overlay locked to the face.

## Comfort Constraints

- Avoid continuous artificial 3D camera rotation in headset.
- Keep W navigation deliberate and slow enough to maintain orientation.
- Prefer preview/inspection gestures before throwing rather than changing the 4D slice mid-throw.
- Use ghost projections and pin labels to reduce the need for aggressive viewpoint manipulation.

## Prototype Controls

1. Grip or trigger right controller to pick up and throw.
2. Hold left trigger to enter 4D inspection mode.
3. Move or rotate the left controller to shift the slice or rotate 4D view.
4. Release left trigger to lock the view for throwing.

## Sources

- [[Engine4D Project Inspection]]
- [[VR Feasibility]]

