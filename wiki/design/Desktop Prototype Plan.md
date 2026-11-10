# Desktop Prototype Plan

The next practical step is a desktop 4D Mölkky prototype scene inside Engine4D, because macOS OpenXR validation is blocked.

## Goal

Create a small scene that proves the Mölkky-specific loop before investing in VR runtime work.

## Scene Basis

Start from the working `SampleScene4D` rather than a blank scene. It already contains the required camera setup, sky setup, collider initialization, sample player controller, and known-good rendering configuration.

## Minimal Prototype Contents

- A flat throwing area.
- 3-5 numbered target pins.
- One simple throwable proxy.
- Hit detection.
- A basic score display or debug log.
- Reset / next throw flow.

## Implementation Strategy

- Duplicate the sample scene inside a project-owned prototype folder rather than editing the sample directly.
- Use existing Engine4D meshes first, likely `spherinder`, `icosa_cylinder`, `duocylinder`, or simple flat/extruded shapes.
- Keep visible pin geometry separate from scoring state.
- Use simplified hit detection before attempting realistic toppling.
- Defer VR-only interaction until the desktop scoring loop is understandable.

## First Milestone

The first milestone is not a real throwing simulation. It is a readable target field where the player can approach, inspect pins across W, trigger hits, and see correct Mölkky-style scoring.

## Sources

- [[Prototype Scope]]
- [[Engine4D Technical Model]]
- [[Mölkky Rules Model]]
- [[VR Feasibility]]
