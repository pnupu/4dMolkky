# 4D Pin Geometry

The first 4D pin should be readable before it is mathematically elegant.

## Real-World Reference

Mölkky pins are numbered wooden cylinders with a flat base and bevelled top. The throwing pin is longer but has the same diameter.

## 4D Geometry Options

- **Extruded cylinder:** Take a familiar 3D pin shape and extrude it along W. This is likely the easiest bridge from real Mölkky to 4D.
- **Layered pin:** Duplicate a pin across a small set of W layers, connected visually by ghost projection. This may be more legible in VR than a continuous 4D object.
- **Glome-like target:** A more native 4D shape, but it risks losing Mölkky's recognizable skittle identity.
- **Simplified capsule / sphere target:** Useful for physics tests, but too abstract for the final game identity.

## Prototype Recommendation

Use extruded or layered numbered pins for the first readability test. Use simple collision proxies and keep final visual geometry separate from scoring logic.

## Number Readability

Numbers are a 3D surface convention. In 4D, numbers should likely be UI labels or billboarded overlays tied to the pin, not procedural markings on every possible slice.

## Sources

- [[Mölkky Rules]]
- [[Engine4D Technical Model]]

