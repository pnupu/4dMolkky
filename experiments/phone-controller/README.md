# Isolated iPhone throw spike

Native SwiftUI/Core Motion practice scaffold and a dependency-free Swift package core; release results stay in memory and never reach Unity.

## Implemented

- Screen-up, top-edge-forward calibration requires fresh motion and at least 0.5 seconds below 0.5 m/s² acceleration and 0.3 rad/s rotation. Near-vertical top-edge projections are rejected. Changing grip or returning from inactivity requires calibration; neither hand mirrors sensor signs.
- A large UIKit `UIView` inside SwiftUI explicitly handles touch began/moved/ended/cancelled events. A second pad touch cancels; a testable identity-based latch suppresses arm/release until every tracked pad touch has ended or been cancelled. Drag-out, system cancellation, view removal, explicit cancel, inactivity, invalid/stale motion and a 3-second hold timeout cannot release. Never physically release the phone.
- Practice content scrolls, with calibration controls stacked vertically and menu pickers replacing cramped segments. The hold pad has a finite 220-point base height scaled with Dynamic Type. Cancel stays in a bottom safe-area inset outside the scroll content. Small-screen layout, maximum Dynamic Type and scroll-versus-pad event delivery still require visual/device validation.
- Core Motion requests 60 Hz with `xArbitraryZVertical`; a foreground task reads the newest sample about every 16 ms using acquisition timestamps and a 150 ms watchdog. It skips unchanged samples and stops sensors when inactive.
- Yaw follows the protocol's horizontally projected top-edge convention, relative to calibration, clamped to ±30°. `projectedDirection` is a unit `(X, 0, Z)` vector; pitch is diagnostic only. There is no W input, tracked position, or absolute velocity estimate.
- Finite values, quaternion norm [0.95, 1.05], acceleration ≤30 m/s² and rotation ≤12 rad/s are checked. Invalid, reversed, duplicate, future or stale core samples invalidate calibration. Sensor input is represented in g and rad/s; timestamps are monotonic seconds.
- **Timed practice is the default:** `0.70 + 0.45*clamp(heldSeconds/1.20, 0, 1)`, matching the documented game's hold curve. Staying still is sufficient; calibration and fresh orientation samples remain required. A short inside touch-up yields the minimum 0.70 multiplier; power reaches 1.15 after 1.20 seconds and resets for each new hold. The 3-second timeout still cancels.
- **Optional experimental motion effort** uses only armed samples from the last 200 ms, capped at 64 entries. It requires ≥4 samples spanning ≥80 ms. Each sample contributes `0.8*clamp((|a_g|-0.06)/1.5) + 0.2*clamp((|omega|-0.15)/5)`; the time-weighted trapezoidal mean is clamped to [0, 1]. Results below 0.04 are cancelled. This is a provisional effort score, not measured hand speed.
- `LocalRelease.power` distinguishes `.timed(multiplier:)` from `.experimentalMotion(effort:)`; there is no shared untyped game-power value. The UI labels each mode and last result separately. Switching modes cancels an existing hold; the picker is disabled while armed. No raw recordings are written; the latest release retains its bounded sample window in memory.

## Deliberate differences from the proposed wire contract

Read [the protocol proposal](../../docs/phone-controller-protocol.md) before integration. This scaffold is **not a protocol client**.

- No sockets, pairing, HMAC, OSC/JSON, ACKs/retries, sessions, host ownership, clock sync, host watchdog, host yaw, W selection, or game state. `LocalRelease.sequence` only numbers local practice results; it is not a network sequence or throw identity.
- The default timed curve now matches the proposal. Optional experimental effort still differs from its 150 ms directional median/peak calculation. The experimental [0, 1] value must **not** be passed directly to the game's proposed [0.70, 1.15] power boundary. Neither mode sends a result to the game; no game power boundary is implemented here.
- Yaw is unsmoothed; angle unwrapping, the proposed 40 ms filter and implied quaternion-speed rejection are deferred. Release-window completeness is deliberately less strict than the proposal's ≥6 samples/≥100 ms/no gap >40 ms. The native quaternion direction/sign still requires physical-device verification.
- Additional-finger cancellation and the all-touches-ended latch apply only to touches that began on the pad. No global outside-pad touch observer is implemented. Actual UIKit delivery, physical lift behavior, scroll-view gesture competition/delayed touches/cancellation, interruptions, outside-pad interactions, VoiceOver and other assistive input remain **unverified**. Automatic screen sleep remains enabled; inactivity cancels rather than changing the global idle timer.
- Grip selection currently invalidates calibration only. The scaffold has no signed Xcode project, provisioning, app icon, persistence, networking permissions, or distribution packaging. Its minimal unsigned `.app` is compile evidence, not an installable release.

## Local verification — 2026-09-05

From this directory:

```sh
swift test --scratch-path .build --cache-path .build/cache --config-path .build/config --security-path .build/security --disable-sandbox
bash build-unsigned.sh
xcrun vtool -show-build build/iphoneos/PhoneController.app/PhoneController
codesign -dv build/iphoneos/PhoneController.app
```

- Swift 6.3.3 / Xcode 26.6 (17F113): **29 XCTest cases passed**, zero failures, on the local arm64 macOS host. This includes 7 pad-latch tests (both lift orders, simultaneous/third touches, drag-out, cancellation and unknown events) and 5 focused timed/default/mode-switch tests, plus the previous 17 calibration, motion and cancellation tests. Timed bounds cover 0, 0.6, 1.2 and 1.8 seconds while stationary.
- The native app and core compile/link for **arm64 iOS 17.0**, against iPhoneOS SDK 26.5; plist validation passes. `vtool` reports platform IOS, minimum 17.0, SDK 26.5. `codesign -dv` is expected to exit 1 with “code object is not signed at all”. No signing identity or account changes are made.
- **Not run:** simulator/device installation, launch, visual QA, actual Core Motion cadence, physical quaternion mapping, touch/interruptions, haptics, handling safety, latency, VoiceOver, or any Unity integration. Synthetic core tests cannot satisfy the protocol's physical-iPhone acceptance gate.

Next: after the parent's gameplay gate, reconcile the deliberate contract differences, then validate native touch cancellation and quaternion signs on a physical iPhone before considering a transport adapter.

## Files and sources

All authored files are confined to this directory: `.gitignore`, `Package.swift`, `Sources/PhoneThrowCore/ThrowController.swift`, `Sources/PhoneThrowCore/PadTouchGate.swift`, `Tests/PhoneThrowCoreTests/ThrowControllerTests.swift`, `Tests/PhoneThrowCoreTests/PadTouchGateTests.swift`, `App/PhoneControllerApp.swift`, `App/MotionControllerModel.swift`, `App/ThrowSurface.swift`, `App/Info.plist`, `build-unsigned.sh`, and this `README.md`. Generated artifacts stay in ignored `.build/` and `build/`.

Read-only project context: [Phone Motion Controller](../../wiki/concepts/Phone%20Motion%20Controller.md), [Game Jam Weekend Runbook](../../wiki/design/Game%20Jam%20Weekend%20Runbook.md), [First Light Playable](../../wiki/design/First%20Light%20Playable.md), and [protocol proposal](../../docs/phone-controller-protocol.md). Numeric mapping choices are design hypotheses, not Apple facts.

Apple references consulted: [CMMotionManager](https://developer.apple.com/documentation/coremotion/cmmotionmanager) for processed motion and lifecycle; [touch cancellation](https://developer.apple.com/documentation/uikit/uicontrol/event/touchcancel) and [cancelTracking](https://developer.apple.com/documentation/uikit/uicontrol/canceltracking(with:)) for distinguishing cancellation from release.
