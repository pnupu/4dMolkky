# Mölkky Motion References

Real-play references distinguish readable wooden-pin impacts from the staged fall currently used by [[First Light Match]].

## Watch and compare

- [Break technique, 06:52](https://www.youtube.com/watch?v=tW433WQ5Cy0&t=412s): the strongest observed comparison for rack scatter. Samples show pins changing orientation and position, then continuing to move after the initial knockdown.
- [Soft/lob practice, 07:08](https://www.youtube.com/watch?v=NM2SqQQTvRQ&t=428s): contrast a targeted lob with a rack break. The practice chapter and throw were verified; a precise isolated-pin trajectory was not.
- [World Championship final play, 08:45:00](https://www.youtube.com/watch?v=7vAq3wIvH04&t=31500s): normal match pacing and dispersed-field context rather than an edited promotional shot.

## Current implementation comparison

Source inspection of `external/Engine4D/Assets/Prototype/Scripts/MolkkyPin4D.cs`, especially `ApplyImpact` and `Update`, finds a planned endpoint and fixed 0.42-second animation, not a contact-driven angular-motion simulation. The visible X/Z phase starts at 18% of that duration (75.6 ms), while the W phase completes at 58% (243.6 ms). Visible travel continues until 420 ms. Both phases use smoothstep easing.

**Inference:** the phase mismatch helps explain why pins appear to leave the visible slice before a convincing sideways fall. Collision-clearance tests do not establish convincing material motion. Simply slowing the same interpolation would preserve the underlying choreography.

**Design recommendation, not implemented:** make rotation and translation consequences of the same contact response, with readable ground contact and settling. W should participate in one coherent 4D motion, rather than run ahead as a separate disappearance phase. Real footage constrains familiar visible material behavior, not the correctness of fourth-dimensional physics.

## Limits and open questions

- No calibrated frame-by-frame timing, friction, or restitution has been extracted from these videos.
- Grass and gravel need separate surface assumptions.
- A genuinely out-of-slice pin can disappear; how should the player read its motion without substituting a fake 3D fall?
- The current user request is assessment and references. No gameplay changes or new build were made.

## Sources

- Source observations and provenance: `raw/sources/molkky-motion-references-2026-09-05.md`.
- Primary videos linked above; accessed 2026-09-05.
- [[Mölkky Rules]] and [[Rendered 4D Falls]] for scoring and earlier rendering verification boundaries.
