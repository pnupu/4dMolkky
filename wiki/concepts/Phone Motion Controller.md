# Phone Motion Controller

A phone can replace part of the missing VR controller by sending orientation and acceleration to the desktop game, but it cannot provide tracked position in the room without a separate tracking system.

## Current isolated spike — 2026-09-05

Two parallel workstreams produced a [proposed native/Unity contract](../../docs/phone-controller-protocol.md) and a [native SwiftUI/Core Motion practice scaffold](../../experiments/phone-controller/README.md). Neither connects a phone to the game yet. The scaffold has no networking, signing, installation, or Unity changes; its results remain local and in memory.

- Default stationary timed power matches the game's 0.70→1.15 multiplier over 1.20 seconds. Optional motion effort is explicitly experimental and a different typed result, not measured hand speed or game power.
- Calibration, bounded horizontal yaw, stale-sensor cancellation, a three-second hold timeout, and explicit touch cancellation are implemented. A second touch beginning on the pad cancels and blocks rearming until every pad touch lifts. This does not observe extra touches outside the pad.
- Scrollable practice content and an independently reachable bottom cancel control avoid a fixed-height screen assumption; device layout, gesture delivery, and assistive input still need verification.
- The protocol defines guarded input ownership, explicit W selection, authenticated local transport, acknowledgements, and physical-iPhone acceptance gates as proposals, not shipped functionality. Keep keyboard gameplay available and preserve the Finnish lakeside theme.

All 29 Swift tests pass, and the unsigned arm64 iOS 17.0 scaffold compiles/links with Swift 6.3.3 and iPhoneOS SDK 26.5; the parent repeated both checks successfully. See the scaffold README for exact commands and deliberate contract differences. Synthetic Swift tests and an unsigned iOS build do not establish physical handling safety, sensor coordinate signs, touch/haptic behavior, network latency, or phone-to-game play. The older reuse options below are research alternatives, not dependencies installed by this spike.

## Recommendation

Build one sideloaded native iPhone controller in SwiftUI using Core Motion. The project has one known iPhone, a paid Apple Developer membership, and Xcode already installed, so a web client's cross-platform advantage no longer compensates for its weaker sensor timing, lifecycle control, haptics, and diagnostics.

Use a large on-screen hold/release trigger. The Action button can launch or invoke a one-shot app action, but it should not be the timing-critical throw-release control.

## Rejected Web Alternative

On a supporting mobile browser, `DeviceMotionEvent` can provide:

- acceleration including and excluding gravity,
- rotation rate around the phone's three axes,
- update interval,
- device orientation through the related orientation event.

On iPhone, access requires HTTPS, a user gesture, and an explicit permission request. Sensor delivery can be throttled or stopped when Safari is backgrounded or the screen sleeps. These constraints, plus the lack of a second supported phone target, are why the website is now only a fallback concept rather than planned work.

This is not a speedometer in the strict sense. Accelerometers measure acceleration. Integrating acceleration to estimate absolute hand velocity accumulates error and drift quickly. The useful throwing signal should combine:

- the phone's fused attitude,
- gravity-compensated acceleration over a short window,
- rotation rate,
- the last roughly 100–250 ms before trigger release,
- calibration and game-side clamping.

## Why the Volume Button Is Fragile

Mobile Safari does not provide a dependable iPhone volume-button down/up stream to page JavaScript.

A native iOS app can observe changes to `AVAudioSession.outputVolume`, but that is not equivalent to receiving a physical button release:

- it reports a volume value change rather than a stable button lifecycle,
- it stops changing at minimum or maximum volume,
- holding may produce repeated changes rather than a single timed press,
- it visibly or audibly changes system volume,
- Apple says apps that alter or disable standard volume-switch behavior can be rejected.

For a private sideloaded prototype, observing volume changes could be an optional experiment, but it must not be the only way to throw. A large SwiftUI press gesture provides a real began/ended lifecycle without changing system volume.

## Action Button

The iPhone Action button is useful, but its supported general-app API is based on App Shortcuts and App Intents. A configured press invokes one discrete action; it does not expose a continuous button-down/button-up stream suitable for measuring a held throw.

Good uses for it are:

- launch or foreground the controller,
- connect/reconnect to the game,
- recalibrate orientation,
- return to the throw slice,
- toggle armed state as an accessibility alternative.

Apple also provides `AVCaptureEventInteraction` and SwiftUI camera-capture events with precise `began`, `ended`, and `cancelled` phases for the Action button and volume controls. That looks ideal technically, but Apple restricts the API to genuine camera-capture use cases and sends events only while the app actively uses the camera. Turning on the camera merely to obtain a game trigger would add battery, privacy, permission, and review risks and would misuse the intended API.

If a future controller genuinely records the player's throw for replay, the capture API could be reevaluated. It is unnecessary and too risky for the jam controller.

## Proposed Interaction

### Calibration

- Place the phone in the natural throwing grip and tap Calibrate.
- Store the reference attitude and show a centered direction reticle.
- Offer left-handed and right-handed grip presets.
- Recalibrate whenever the phone orientation or grip changes.

### Throw

- Hold the full-screen trigger to arm the throw.
- Stream timestamped attitude, rotation rate, acceleration, and sequence number at 50–100 Hz.
- On release, send a reliable `release` event plus the recent sample window.
- Start with attitude-based direction and the existing timed hold-power curve; standing still must remain sufficient.
- Treat filtered motion strength as a separately enabled experiment, with clamping and rejection of implausible spikes.
- Provide haptic and screen feedback when armed, connected, and released.

### Other Controls

- Swipe or tap a visible pin/ghost in a compact overhead diagram to focus it.
- `Focus pin` should move the player's active 3D slice to the target's W coordinate, while preserving a visible transition and an undo/return command.
- Buttons: recalibrate, return to throw slice, next/previous target, toggle slice/ghost view, reset throw, pause.
- Show connection quality, packet age, battery, current selected pin, W coordinate, and armed state.

## Network Architecture

### Native iPhone prototype

```text
SwiftUI + Core Motion on iPhone
              |
       UDP over local Wi-Fi
       or the Tailscale network
              v
        Unity game on Mac
```

The native app does not need an HTTPS page, Tailscale Serve, or a separate web relay. It can send packets directly to a small UDP receiver in Unity. Prefer local Wi-Fi for the least setup and latency. Use direct Tailscale addressing when venue Wi-Fi prevents peer-to-peer traffic; both devices must then be connected to the same tailnet.

Repeat critical `arm`, `release`, `cancel`, and command packets until Unity acknowledges their sequence number. Ordinary motion samples may be dropped when superseded by newer samples.

A SwiftUI app using Core Motion can sample processed attitude, user acceleration, gravity, and rotation rate, commonly at 50–100 Hz, and send UDP or WebSocket packets directly. It provides more predictable sensor timing, wake behavior, haptics, and diagnostics. The paid Apple Developer membership allows signing and installing the app on the registered iPhone without waiting for App Store review.

Keep manual Mac address/port entry as a fallback even if automatic discovery or QR pairing is added.

## Protocol Minimum

Every packet should contain:

- protocol version and controller ID,
- monotonically increasing sequence number,
- controller timestamp,
- calibrated quaternion,
- user acceleration vector,
- rotation-rate vector,
- trigger state,
- selected target ID or command,
- optional battery and sensor interval.

The desktop should acknowledge connection, calibration, arm, and release. Ignore stale or out-of-order motion packets, but treat release as a reliable event. Stop accepting a throw if packet age exceeds a safety threshold.

## Prior Art and Reuse Plan

This interaction has direct precedent. The open-source Simo research controller uses an iPhone as a motion controller and explicitly combines device/hand movement with touchscreen input to segment gestures. It also demonstrates a Unity-to-iPhone workflow. Simo is MIT licensed, but its ARKit camera tracking and older Unity iOS project are much larger than this controller needs. Reuse its interaction and coordinate-mapping ideas selectively rather than adopting the whole project.

The quickest proof of the physical interaction requires almost no iOS code:

1. Create a TouchOSC layout with one full-screen momentary button.
2. Send its touch state as `/throw/touch` and accelerometer/gyroscope samples as OSC messages over Wi-Fi.
3. Receive the messages in Unity with the MIT-licensed `extOSC` package.
4. Confirm that holding, moving, and releasing feels usable before building the native app.

TouchOSC exposes accelerometer and gyroscope samples, control touch-state changes, OSC sending, timestamps, battery state, and vibration scripting. It is suitable for interaction validation, but its raw sensors and configurable runtime are less controlled than a purpose-built Core Motion app.

For the native implementation, assemble a small controller from permissively licensed parts:

- Start the sensor service from the MIT-licensed `iOS-CoreMotion-Example`, updated to current Swift concurrency and processed `deviceMotion` rather than copying the old app wholesale.
- Use Apple's `CMMotionManager` and the `xArbitraryZVertical` reference frame to obtain quaternion attitude, user acceleration, gravity, and rotation rate.
- Use the MIT-licensed SwiftOSC package for OSC-over-UDP on iPhone.
- Use MIT-licensed `extOSC` in Unity `2022.2.2f1` for receiving and debugging OSC addresses.
- Write the SwiftUI hold/release surface, calibration, acknowledgements, filtering, and 4D mapping specifically for this game; those are the small project-specific core.

Do not copy Arvos directly unless the controller is intentionally released under GPLv3. It is an excellent modern reference for high-rate IMU streaming, timestamps, diagnostics, and WebSocket architecture, but its copyleft license and camera/LiDAR scope make it a poor base for the jam app.

### Earlier reuse option (not the current scaffold)

- **Spike A:** TouchOSC + extOSC, raw acceleration/gyro, large touch button.
- **Spike B:** Decide the gesture and power curve using recorded samples.
- **Native app:** SwiftUI + Core Motion + SwiftOSC, retaining the same OSC address schema.
- **Game integration:** replace raw values with calibrated quaternion and filtered impulse without changing Unity's input abstraction.

Suggested OSC addresses:

- `/controller/hello`
- `/controller/motion` — sequence, timestamp, quaternion, user acceleration, rotation rate
- `/controller/throw/arm`
- `/controller/throw/release`
- `/controller/throw/cancel`
- `/controller/calibrate`
- `/controller/focus` — pin ID
- `/game/ack` — acknowledged sequence
- `/game/state` — connection, turn, selected pin, W slice

## 4D Mapping

The phone only measures 3D orientation, which is still useful: a unit direction on the game's 3D ground has three degrees of freedom and can map to the three directional components available when aiming around the player's active 3D slice. It does not determine an arbitrary 4D position.

Use explicit modes instead of overloading one gesture:

- Throw mode: phone attitude controls the projected throw direction; timed hold controls power by default, with motion power an explicit experiment.
- Slice mode: tilting or swiping changes W or focuses a target.
- Inspect mode: phone attitude rotates the 4D view without arming a throw.

Mode changes must be visually and haptically obvious. Otherwise a player may alter W while intending to throw.

## Safety and Test Risks

- Use a wrist strap or two-handed grip; throwing a phone is a real physical risk.
- Never require a full-force swing. Tune for small, controlled motion.
- Test false releases caused by touch cancellation, calls, notifications, app backgrounding, and screen rotation.
- Estimate clock offset rather than assuming phone and Mac clocks match.
- Record raw samples for tuning, but make recording opt-in and easy to clear.
- Provide keyboard/mouse controls as a complete fallback.

## Sources

- [Apple Core Motion](https://developer.apple.com/documentation/CoreMotion)
- [Apple: Getting processed device-motion data](https://developer.apple.com/documentation/coremotion/getting-processed-device-motion-data)
- [MDN: DeviceMotionEvent permission](https://developer.mozilla.org/en-US/docs/Web/API/DeviceMotionEvent/requestPermission_static)
- [Apple: AVAudioSession outputVolume](https://developer.apple.com/documentation/avfaudio/avaudiosession/outputvolume)
- [Apple: Action button design guidance](https://developer.apple.com/design/human-interface-guidelines/action-button)
- [Apple: App Shortcuts](https://developer.apple.com/documentation/appintents/app-shortcuts)
- [Apple: AVCaptureEventInteraction](https://developer.apple.com/documentation/avkit/avcaptureeventinteraction)
- [Apple: Camera capture controls](https://developer.apple.com/videos/play/wwdc2025/253/)
- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Tailscale Serve](https://tailscale.com/docs/features/tailscale-serve)
- [Simo iPhone motion controller](https://github.com/teobabic/Simo)
- [iOS Core Motion example](https://github.com/maximbilan/iOS-CoreMotion-Example)
- [SwiftOSC](https://github.com/orchetect/swift-osc)
- [TouchOSC manual](https://hexler.net/touchosc/manual/complete)
- [extOSC for Unity](https://github.com/Iam1337/extOSC)
- [Arvos sensor streamer](https://github.com/jaskirat1616/Arvos)
- [[4D Golf Devlogs]]
