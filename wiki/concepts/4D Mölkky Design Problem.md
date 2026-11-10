# 4D Mölkky Design Problem

The design challenge is to preserve Mölkky's clarity while making the fourth spatial dimension tactically meaningful.

## Baseline Game Identity

Mölkky is recognizable because it has a simple loop: throw a baton-like skittle, knock pins down, score from either one pin's number or the count of pins, and reposition fallen pins. The official target is exactly 50 points; exceeding 50 resets the player to 25; three consecutive misses eliminate the player.

## 4D Translation Questions

- What is the shape of a "pin" in 4D: extruded cylinder, glome-like body, prism, or another readable object?
- What is the shape of the throwing object: baton, 4D capsule analogue, hyperspherinder, or simplified ball for the first prototype?
- How does the player perceive pins outside the current 3D slice?
- Does the player move the slice, rotate their 4D viewpoint, or both?
- Are pins laid out in a 4D volume, in layered 3D slices, or on a lower-dimensional throwing plane embedded in 4D?
- How should knocked-down and standing states work in 4D without becoming visually ambiguous?

## Early Design Direction

Use the first prototype to test layered 3D slices rather than a fully unconstrained 4D volume. This preserves a familiar Mölkky target field while introducing W-position as a tactical axis. Ghost projections can reveal out-of-slice pins, and an explicit slice control can let the player inspect target layers before throwing.

Preserve field evolution: fallen pins should re-stand where they land, including W displacement if the throw produces it. This is likely more important than exact dimensions in the first prototype.

## Inference

Engine4D's slicing and ghost projection system is a strong match for a game where hidden or partially visible 4D target geometry matters. The risk is that VR players may find fourth-dimensional camera manipulation uncomfortable unless it is constrained and explained through interaction design.

## Sources

- [[Engine4D]]
- [[Mölkky Rules]]
- [[Mölkky Rules Model]]
