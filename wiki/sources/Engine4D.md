# Engine4D

Engine4D is a Unity toolkit for making higher-dimensional games and is the likely technical base for a 4D Mölkky prototype.

## Source

- Repository: https://github.com/HackerPoet/Engine4D
- Source record: `raw/sources/engine4d-github.md`
- Accessed: 2026-04-30

## Key Points

- Engine4D is a set of Unity scripts, tools, and extensions for developing 4D and 5D games.
- It is the core of 4D Golf, minus golf-specific assets.
- A 4D scene uses a special camera setup for slice rendering, ghost projections, UI overlays, and effects.
- The `MainCamera` prefab is the documented starting point for camera setup.
- `UICanvas` can add overlays such as a compass and volume line.
- 4D objects require `Object4D`; rendered objects using `MeshRenderer` also require `ShadowFilter`.
- 4D physics cannot use Unity's built-in physics. Physics objects should inherit from `Physical4D` and call `UpdatePhysics()`.
- Engine4D includes mesh generation and modeling workflows for tetrahedral meshes, ghost projections, wireframes, custom shaders, and procedural 4D geometry.
- VR/XR is explicitly marked as work in progress in the README.

## Relevance To 4D Mölkky

Engine4D appears suitable for prototyping 4D spatial objects, slicing, projections, and custom physics. The biggest technical uncertainty is how much work is required to make the camera and rendering pipeline comfortable in VR.

## Follow-Up Needed

- Inspect the Unity project version and render pipeline.
- Inspect camera classes such as `BasicCamera4D`, `CameraControl4D`, and prefabs.
- Inspect `Physical4D` collision model to estimate whether thrown batons and falling pins are practical.
- Confirm license obligations before embedding or modifying Engine4D.

## Follow-Up Completed

- A first pass over project metadata, VR scripts, camera controls, and `Physical4D` is captured in [[Engine4D Project Inspection]].
