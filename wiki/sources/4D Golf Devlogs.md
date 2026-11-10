# 4D Golf Devlogs

HackerPoet's 4D Golf devlogs document the design, rendering, content-production, UI, performance, multiplayer, and VR problems encountered while building a complete 4D game.

## What Matters for 4D Mölkky

- A pure slice view makes objects easy to lose. 4D Golf adds a translucent whole-scene projection, opacity as hidden-axis distance, and a 3D compass.
- 4D navigation was deliberately made easy so that the dimensional reasoning serves the golf challenge rather than becoming a movement tax.
- Walking or colliding with angled geometry can unexpectedly push objects through the fourth dimension.
- Tetrahedral 4D meshes are much more expensive and difficult to author than ordinary triangle meshes.
- CPU slicing at gameplay scale is too slow; Engine4D encodes tetrahedra for GPU slicing and replaces branching with a lookup texture.
- Procedural track pieces and text serialization made 4D level building tractable.
- Deforming extruded meshes can expose gaps when neighboring tetrahedralizations disagree.
- Conventional texturing does not transfer cleanly: 3D textures are scarce and expensive, GPUs do not directly sample 4D textures, and procedural coordinate-based shaders are often the practical answer.
- Most of a 4D mesh is invisible in any one slice, while ghost projections add more rendering work. Low polygon counts matter even on desktop.
- Testers reportedly needed about 30 minutes of tutorial play before 4D Golf began to click.
- For VR, HackerPoet said the 4D rendering was already working, but VR UI redesign and motion-controller integration were the main blockers.
- Stationary play and teleporting were chosen to reduce VR motion sickness.

## Project-Specific Inferences

The following are inferences for 4D Mölkky, not claims made directly about Mölkky in the videos:

- A pin that leaves the active slice needs a persistent ghost, W-distance cue, or focus command or the player may believe it disappeared.
- Ordinary collision response can accidentally change W. Gameplay physics should explicitly decide when W motion is allowed.
- A jam build should reuse simple Engine4D primitives and procedural materials instead of creating bespoke 4D pins, foliage, or terrain.
- A phone controller can map its three-axis attitude naturally to a direction on 4D ground, but calibration and visual feedback are mandatory.
- The tutorial must teach one 4D operation at a time and should not assume the concept becomes intuitive in a single round.
- Replay highlights must capture the active slice, camera orientation, and W trajectories; a conventional 3D replay alone will hide why a throw succeeded.

## Sources and Local Evidence

- [4D Golf playlist](https://www.youtube.com/playlist?list=PLh9DXIT3m6N4GygehtlHl0ukgrgPJZteI)
- Raw inventory: `raw/sources/4d-golf-youtube-playlist.md`
- Downloaded metadata and captions: `raw/sources/youtube/4d-golf-playlist/`
- [[Engine4D]]
