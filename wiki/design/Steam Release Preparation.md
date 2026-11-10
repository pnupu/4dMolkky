# Steam Release Preparation

Prepare a genuinely playable desktop release candidate without confusing build completion with Steam publication readiness.

## Target

The earlier next-day Steam wording was superseded on 2026-09-05: Steam first became a quality target, then the user explicitly selected hackathon submission readiness. [[Hackathon Submission Readiness]] is the active scope. This page preserves deferred commercial-release requirements; do not spend the jam critical path on Steam accounts, depots or store submission.

## External release gates

- **Steam account and application:** no verified AppID, depot IDs, onboarding completion, or eligible release date in this workspace.
- **Valve approval:** store/build review and Coming Soon timing cannot be bypassed by code changes.
- **Brand permission:** verify permission to market a commercial game using Mölkky, or choose a cleared title before a public store submission. This is an unresolved rights question, not a legal finding.
- **Platform testing:** the patched non-development macOS candidate runs on the Air; the Windows x64 candidate builds successfully but has not been executed on Windows. Physical keyboard/mouse and live resizing still need unlocked-session QA.
- **Signing:** a development or ad-hoc signature is not Apple Developer ID notarization. Do not describe it as such.
- **Security:** apply official Unity runtime remediation where required; preserve patch logs and retest the exact patched package.

## Store claims

Describe the current solo exact-50 game and four-dimensional slice navigation. Do not advertise multiplayer, VR, phone controls, Steam achievements, full controller support, Steam Deck verification, or general-purpose 4D rigid-body physics.

## Evidence

After the rendered-floor correction and final camera/UI fixes, the patched release-package test passed 22 actual throws across two scenarios: an overshoot returned 45 to 25, and a match reached exactly 50 on throw 14. It used the public throw/focus/next-turn path, not assigned scores. Boot/menu/control-state tests passed at three launch resolutions. The 24-second 1080p capture includes actual game audio and 4,320 pin-motion rows. See [[First Light Match]] and `docs/RELEASE_CANDIDATE.md` for exact artifact paths, validation boundaries, archives, and security-remediation evidence.

## Sources

- [[Steam Release Requirements]]
- [[Rendered 4D Falls]] — earlier verification gaps are not release evidence.
- Final runtime evidence: `artifacts/release-validation/v0100-rc2/` on the Air and local workspace.
