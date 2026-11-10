# Engine4D Technical Model

Engine4D extends Unity with 4D transforms, rendering, mesh generation, shaders, and custom physics rather than relying on Unity's normal 3D model.

## Scene Model

A 4D scene needs Engine4D camera infrastructure to render:

- the current 3D slice through 4D space,
- ghost projections,
- wireframes,
- UI overlays,
- special effects.

The README recommends starting with the `MainCamera` prefab and optionally adding `UICanvas` for overlays.

## Object Model

4D objects use `Object4D` for fourth-dimensional position, rotation, and scale. Unity's normal transform supplies x, y, and z, while Engine4D adds W position and W scale. Full 4D rotation uses six angles: Unity Euler angles plus `DualEuler`, later represented internally as a 4D rotation matrix.

Runtime caveat confirmed in [[Rendered 4D Falls]]: `Object4D.Awake()` initializes that matrix, but changing Unity rotation or `dualEuler` during play does not rebuild it. Runtime animation must assign `localRotation4D`; `MakeRotation()` can convert the initialization fields when deliberately restoring an upright orientation. The rendered world matrix, not the initialization fields, is the verification boundary. See [[Engine4D]] and the local `Object4D.cs` implementation.

For rendered objects, `ShadowFilter` routes the correct mesh to slice, ghost projection, and wireframe cameras.

## Mesh Model

Engine4D expects 4D geometry as tetrahedral meshes plus optional ghost and wireframe projection meshes. It includes generators for flat meshes, extrusions, pyramids, revolutions, path extrusions, duo-prisms, OFF imports, and 4DO imports.

The inspected hypercube floor mesh uses coordinates from −1 to +1, not Unity's usual half-unit cube bounds. A floor at Y=−0.05 with Y scale 0.12 therefore has a visible top at +0.07. The First Light field now centers that mesh at −0.12 so its top is Y=0. `MolkkyPrototypeGround.SurfaceY` measures transformed mesh vertices; pin-ground verification subtracts that measured surface rather than assuming the visible floor matches the solver plane. This is a project implementation finding, not a claim from the Engine4D README.

## Physics Model

Unity physics is not used for 4D interactions. Objects needing gravity, velocity, and collisions inherit from `Physical4D`; derived classes decide when to call `UpdatePhysics()`. The documented physics object collision shape is spherical.

The inspected `Physical4D` script confirms custom gravity, drag, collision displacement, hit tracking, and elastic collision handling. Moving physics objects use `colliderRadius`, which means prototype throwing can start with a sphere-like collision proxy even if the visible object is baton-shaped.

## Implications For Mölkky

- Pins may need custom collider behavior if simple spherical physics is not enough for satisfying toppling.
- A thrown baton could begin as a sphere-like physical object for a first prototype, then become a more faithful 4D capsule or compound collider later.
- Scoring and pin state should be designed independently from visual mesh complexity.
- Readability will depend heavily on ghost projection and UI overlays, not just physical simulation.
- Engine4D's MIT license makes experimentation and modification legally straightforward, subject to preserving the copyright and license notice.

## Sources

- [[Engine4D]]
- [[Engine4D Project Inspection]]
