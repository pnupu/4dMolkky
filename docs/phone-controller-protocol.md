# First Light: native iPhone controller spike

This contract defines a single-iPhone development spike for controlled touch-and-motion throws in the Finnish lakeside First Light game; it is not a production feature commitment.

Status: proposed, 2026-09-05. No phone, networking, build, or gameplay validation was performed for this document. **Inference/design:** all requirements and numeric thresholds below are proposed engineering choices, except the explicitly identified repository and Apple/Unity facts. Tune thresholds only with recorded physical-device evidence.

## Scope and existing boundaries

The plan in [[Phone Motion Controller]] recommends native SwiftUI/Core Motion, local UDP, acknowledged critical events, calibration, and keyboard fallback. This spike retains that direction. Its small JSON wire format below is an explicit alternative to the plan's suggested OSC addresses; it is not compatible with an OSC receiver without an adapter. Defer TouchOSC, Bonjour discovery, QR scanning, Tailscale, camera tracking, Action/volume buttons, arbitrary W steering, and inspect mode.

Repository facts, read-only inspection of Unity `2022.2.2f1`, controller version `0.10.2 · First Light`:

| Existing surface | Actual behavior / integration consequence |
| --- | --- |
| `BeginPlayerThrow()` → bool | Arms only from unpaused `Aiming`, with no throw in progress. |
| `ReleasePlayerThrow()` → bool | Uses current hold-duration power. There is no public motion-power parameter. |
| `TryThrow()` → bool | Quick throw at power 1.0; do not use it to bypass phone arming. |
| `CancelArming()` | Private. `SetPaused(true)` publicly cancels arming and freezes the game. Cancel must not call release or reset. |
| `SetPaused(bool)`, `IsPaused`, `State`, `Turn`, `MainMenuVisible` | Useful host guards; guard menu state explicitly as well as pause. |
| `FocusPin(int)`, `ReturnToHomeSlice()` | Public W selection. Focus also changes aim and animates W at 0.8 units/s. `UpdateSliceFocus()` can continue while armed: wait for completion before accepting arm. |
| `CameraControl4D.m1`, `lookYZ`, `CreateCamMatrix(...)`; `BasicCamera4D.camMatrix`, `position4D` | Public camera fields/matrix helper, not a controller-level aim API. `TryThrow` reads the matrix's forward vector, removes Y, and normalizes. Camera update rebuilds that matrix. |

Sources: [controller](../external/Engine4D/Assets/Prototype/Scripts/MolkkyPrototypeController.cs), [camera](../external/Engine4D/Assets/Scripts/CameraControl4D.cs), [base camera](../external/Engine4D/Assets/Scripts/BasicCamera4D.cs), [project version](../external/Engine4D/ProjectSettings/ProjectVersion.txt), [[First Light Match]], [[First Light Playable]]. Older playable notes are historical, not the current API contract.

**Integration prerequisite, not implemented here:** the Unity owner must provide one input-ownership boundary for phone versus keyboard/mouse, atomic aim-and-release, cancellation, and (only for the motion experiment) bounded power. Existing `Update()` directly handles mouse, Space, T, and W keys; adding an independent receiver that calls the public methods does not prevent competing inputs. Preserve these game-state checks instead of calling `MolkkyThrower4D.Fire` directly.

## Pairing and transport

- One foreground native iPhone, one desktop, same trusted local Wi-Fi. Desktop explicitly enables the receiver on a selected LAN interface and displayed UDP port (default 42042). No public listener or automatic network traversal.
- Desktop displays address, port, and a random 128-bit pairing secret as 32 hex digits, valid for 60 seconds. Enter/paste these into the phone; a short PIN alone is not the secret. An authenticated `hello` carries a fresh random `clientNonce`; desktop confirmation admits exactly one controller and returns `welcome` with a random 128-bit `session`. Repeated identical hello returns the same welcome. Reject other nonces after admission. Never log the secret.
- Use that secret for HMAC-SHA256 in both directions. Datagram bytes are `ASCII("FLP1") || 32-byte MAC || UTF-8 JSON`. MAC input is `ASCII("phone>host")` or `ASCII("host>phone")`, then the four magic bytes, then the exact JSON bytes. Verify before parsing or acknowledging; never reserialize for verification. The secret never travels in a datagram. Pairing authenticates input but does not encrypt telemetry; use only the trusted LAN for this spike.
- A reconnect requires a newly enabled pairing window, new secret/session, clock sync, and calibration. No reconnect may restore an arm. `welcome` is bound to the hello nonce; all subsequent traffic is bound to the session. Receiver restart, match reset, or controller replacement invalidates outstanding throws.
- Motion: request 50 Hz initially; send at most 100 packets/s. Drop superseded motion, never retransmit it. Events use acknowledgement and bounded retries below. Heartbeat/state runs at 10 Hz in both directions, including while paused, using monotonic real time.
- Maximum datagram 1,200 bytes, JSON depth 4, strings 64 bytes, no duplicate keys, no arbitrary nested payloads. Rate cap 150 authenticated packets/s per controller, burst 30. Keep at most 32 motion samples and 16 pending events; overflow revokes phone ownership and pauses. Drain network data through a bounded queue on Unity's main thread; never mutate Unity objects from a socket callback.

Apple fact: outgoing LAN UDP requires local-network access; include `NSLocalNetworkUsageDescription` and handle denied/undetermined access in the foreground. Bonjour would additionally require its service declarations. Denial leaves keyboard play available. [Apple TN3179](https://developer.apple.com/documentation/technotes/tn3179-understanding-local-network-privacy)

## Version 1 message contract

All post-pairing JSON objects contain `v:1`, `session` (32 hex), `kind`, `seq` (integer 1…2^53−1), and `t` (sender monotonic seconds). Sequences increase separately for motion, critical events, and each direction's control traffic; no wrap within a session. Retries retain the original sequence, timestamp, and payload. Sensor timestamps describe acquisition, not socket send time.

| Kind | Additional fields / semantics |
| --- | --- |
| `hello`, `welcome` | Before the common session envelope: `v`, `kind`, `clientNonce`; welcome adds `session`, `epoch`, supported `powerMode`. No gameplay until sync/calibration completes. |
| `sync`, `syncReply` | `probeId`, `phoneSend`; reply echoes it and adds `hostReceive`, `hostSend`. Phone records receive time and sends `syncResult` with all four timestamps. |
| `calibrate` | Critical event: `calibration` (increasing integer), `q0:[x,y,z,w]`, `sampleT`. Host captures baseline game yaw and replies with accepted calibration. |
| `motion` | `calibration`, `q:[x,y,z,w]`, `a:[x,y,z]` in m/s², `omega:[x,y,z]` in rad/s, `held` bool. `t` is sample acquisition time. `held` is diagnostic only and never causes an arm/release. |
| `arm` | Critical event: `epoch`, `turn`, `calibration`, `throwId` (random 128-bit hex), `powerMode` (`timed` or explicitly enabled `motion`). |
| `release` | Critical event: same arm identity, `sampleSeq` referencing the last sample acquired before touch-up. `t` is the touch-up time, not retry time. No client-supplied velocity or score. |
| `cancel` | Critical event: arm identity, `reason` from `user`, `touchCancelled`, `inactive`, `sensor`, `timeout`. Legal even if arm ACK has not arrived. |
| `selectW` | Critical event: `epoch`, `turn`, either `pinId` from the host roster or `home:true`. No raw W coordinate accepted. |
| `pause` | Critical event, pause-only. Resume/reset/next turn stays on desktop for this spike. |
| `ack` | Control: `eventSeq`, `status` (`accepted`, `rejected`, `cancelled`, `thrown`), `reason`, `epoch`, `turn`, `throwId` when applicable. Acknowledge the game decision, not just receipt. |
| `state` | Control: `epoch` (new host match token), `turn`, `gameState`, `paused`, `owner`, `calibration`, `armedThrowId` or null, `actualW`, `targetW`, `wSettled`, `powerMode`, `armedPower`. This is authoritative UI state. |
| `pin` | Host control: `epoch`, `rosterRevision`, `pinId`, finite `w`, `index`, `count` (maximum 64). Assemble a complete revision before enabling selection; resend on subsequent roster cycles until complete. |
| `heartbeat` | Control, no additional fields. Does not substitute for fresh motion while arming. |

Only allowlisted kinds/fields/types are accepted. Host roster updates may be split into individual pin records containing `pinId` and finite W rather than exceeding the datagram limit. Host `state` must carry the same identity used in ACKs so a lost release ACK can be reconciled without another throw.

### Ordering, age, and exactly-once effects

1. Estimate `hostTime = phoneTime + offset` with eight four-timestamp probes. For phone send/receive `p0,p3` and host receive/send `h1,h2`, use `offset=((h1-p0)+(h2-p3))/2` and `RTT=(p3-p0)-(h2-h1)`. Choose the lowest nonnegative RTT; uncertainty is RTT/2. Require uncertainty ≤25 ms. Repeat every 5 s; sync older than 10 s, timestamp regression, or an offset jump >25 ms cancels the arm and requires resync. This is a spike approximation, not a network-delay guarantee.
2. For host receive time `now`, evaluate age `now-(t+offset)`. Reject actionable data if `age+uncertainty >150 ms` or `age < -uncertainty-10 ms`. At arm/release, the referenced motion must also be ≤80 ms old using the conservative upper bound, same calibration, and before touch-up. Check again when draining the main-thread queue: recent socket receipt does not make delayed work fresh.
3. Accept only increasing motion sequences. Critical events have a separate high-water mark so a later motion sample cannot suppress release. Cache the outcome of the last 256 event sequences, for the session; after authentication/session validation, an exact duplicate returns its prior ACK before freshness checks, with no side effect. Reusing a sequence with different bytes is rejected. An older uncached event is rejected, never reapplied. Unknown protocol/session/epoch/turn/throw identity cannot operate the game.
4. Retry critical events every 40 ms, up to 200 ms from their original timestamp. Only one ordinary critical event is outstanding. Phone must receive arm ACK while its finger is still down before release becomes eligible. Touch-up before ACK means cancel, never a queued release. A matching cancel/pause may supersede an outstanding arm immediately; its higher sequence invalidates the delayed arm. Freshness checks still apply to retries.
5. A release arriving before its referenced motion is rejected and consumes that throw; do not wait for future data or reuse a later sample. A release either commits once and records `thrown`, or closes the throw as rejected/cancelled. A cancelled `throwId` cannot rearm. If release commits before cancel arrives, cancellation cannot undo flight; return its terminal outcome. Rejecting stale arm/release must not leave the corresponding arm live. Current-session cancel/pause may always reduce authority despite age.
6. No valid heartbeat for 300 ms, no fresh motion for 150 ms while armed, ACK timeout, or total arm duration >3 s revokes phone ownership, invalidates its throw, and calls pause/cancel. On host main-thread stall, enforce timeout before processing queued release on recovery. Replays from prior sessions remain inert even after sequence-cache eviction.

## Calibration and the fourth axis

Apple facts: `xArbitraryZVertical` uses vertical Z and an arbitrary horizontal X; it is not compass north. Motion timestamps are seconds since boot, and requested sample intervals are hardware-dependent. Check actual timestamps. [Reference frame](https://developer.apple.com/documentation/coremotion/cmattitudereferenceframe/xarbitraryzvertical), [timestamps](https://developer.apple.com/documentation/coremotion/cmlogitem/timestamp), [sampling interval](https://developer.apple.com/documentation/coremotion/cmmotionmanager/devicemotionupdateinterval)

**Design frame convention:** lock the controller UI to portrait. Device axes are X toward the phone's right edge, Y toward its top edge, Z out through its screen. The wire quaternion is a normalized Hamilton quaternion in `[x,y,z,w]` order, actively rotating device vectors into the Core Motion reference frame. Verify native matrix/quaternion direction and invert in the native adapter if needed; copying four components into a Unity quaternion is not the conversion. Core Motion acceleration units are g: multiply gravity-removed `userAcceleration` by 9.80665 before sending. [Device axes](https://developer.apple.com/documentation/coremotion/cmmotionmanager), [processed motion](https://developer.apple.com/documentation/coremotion/), [acceleration units](https://developer.apple.com/documentation/coremotion/cmacceleration)

Calibration requires unarmed, stationary input for 0.5 s (`|a|<0.5 m/s²`, `|omega|<0.3 rad/s`), a settled W slice, and a fresh sample. Hold the screen generally upward, top edge toward the pins; support either hand without mirroring sensor signs. Capture quaternion `q0` and host yaw `yaw0`. Changing grip, sensor restart, reconnect, or changing selected target requires fresh calibration.

Define reference up `up=(0,0,1)` and device forward `top=(0,1,0)`. With quaternion rotation `rotate(q,vector)`:

```text
horizontal(vector) = vector - up * dot(vector, up)
forward0 = normalize(horizontal(rotate(q0, top)))
right0 = cross(forward0, up)
forward = normalize(horizontal(rotate(q, top)))
deltaYaw = atan2(dot(forward, right0), dot(forward, forward0))
yaw = yaw0 + clamp(deltaYaw, -30 degrees, +30 degrees)
direction4D = (sin(yaw), 0, cos(yaw), 0)
```

Reject calibration/aim if either horizontal projection has length <0.25 before normalization; a near-vertical top edge cannot define stable yaw. Unwrap yaw across samples. Stabilize preview with a 40 ms time-constant low-pass filter using actual sample intervals; use that same filtered direction at the referenced release sample. No prediction beyond the newest sample. Pitch/roll are diagnostic; this version preserves the game's flat ground throw and configured lift.

For the current camera, planar yaw corresponds to `m1=Quaternion.Euler(0,0,-yawDegrees)` as in `FocusPin`; rebuild `camMatrix=CreateCamMatrix(m1,lookYZ)` in the same controlled main-thread operation before release. Require normal slice view, fixed existing `lookYZ`, and verify the resulting flattened forward vector equals `direction4D`. This avoids both stale matrices and accidental W velocity.

**W is selected, never inferred from the phone.** Phone offers `Home · W=0` and host-provided pin targets with signed W. Host calls `FocusPin`/`ReturnToHomeSlice`, reports target and actual W, and blocks arm until within 0.001 units for two consecutive host frames. Lock W and target selection throughout an arm/flight. Launch origin uses the selected actual W; `direction4D.w=0`. Thus the player throws *within an explicitly chosen parallel slice*. Phone orientation has three rotational degrees of freedom but does not supply a tracked 4D position or independent W axis. Free W velocity is a separate future design, not part of this spike.

## Touch, power, and desktop fallback

- A large hold surface owns exactly one touch. Touch-down sends arm; show “Connecting throw…” until accepted, then “Ready — lift your thumb to throw.” Touch-up inside the surface releases only that accepted arm. Dragging outside, another touch, system cancellation, app inactivity, rotation/grip change, or sensor failure cancels and stays cancelled until all fingers lift. Implement began/ended/cancelled explicitly, for example with a UIKit surface hosted in SwiftUI; disappearance or a generic gesture completion is never release.
- Apple documents system interruptions as touch cancellation; this is distinct from finger-up. Send best-effort cancel on lifecycle loss, clear local state immediately, stop sensors, and rely on the host watchdog if transmission is impossible. Restore the idle-timer setting when leaving active control. [UIKit cancellation](https://developer.apple.com/documentation/uikit/uiresponder/touchescancelled(_:with:))
- Start with `powerMode:timed`: existing public arm/release behavior ramps 0.70→1.15 over 1.20 s. Advertise “Hold for power.” Motion is logged only with consent and supplies yaw; do not claim motion controls strength in this mode.
- Optional `powerMode:motion` requires the Unity owner's new guarded power boundary. On release, use host-cached samples from the last 150 ms: at least six, spanning ≥100 ms, no gap >40 ms. Reject incomplete windows. Rotate acceleration into the reference frame, project onto the release forward direction, apply a three-sample median, then take the maximum positive value `peak`. Proposed mapping: `power=0.70+0.45*clamp((peak-0.5)/3.5,0,1)` with acceleration in m/s². Gyro rejects implausible data; it does not add power. This is a tunable gesture-strength signal, not measured hand velocity. No absolute acceleration integration, automatic swing release, or silent switch of power mode while armed.
- Validate finite numbers and vector lengths. Accept quaternion norm only in [0.95,1.05], then normalize; account for q and −q equivalence. Reject `|a|>30 m/s²`, `|omega|>12 rad/s`, or implied attitude speed >12 rad/s. Invalid armed samples cancel rather than being converted into maximum power. Clamp derived yaw and power; never accept arbitrary launch position, velocity, turn, score, or unknown pin IDs.
- Desktop explicitly selects phone ownership only from unpaused `Aiming` with all local throw keys up. Mouse/throw/W input cannot compete while owned. Esc or deliberate keyboard takeover cancels and revokes phone ownership first. For the existing public API, cancel/disconnect calls `SetPaused(true)` and leaves it paused; do not auto-unpause around cancellation. Desktop Esc resumes. Discard the triggering takeover key and require a fresh press after all throw keys are up, preventing a held Space/T from firing on resume.
- Keep complete keyboard play: mouse aim, Space hold/release, T quick throw/next turn, F target, Q/E slice, 0 home, Esc pause, R restart. No phone is required to start or finish a match. Disconnect in flight pauses the existing throw; desktop resume lets it settle once without resetting score or consuming another turn.

Unity documents per-script execution ordering, but ordinary separate `Update` calls are not an atomic input contract. Establish receiver/input/camera ordering explicitly and validate the matrix at release. [Unity 2022.2 execution order](https://docs.unity3d.com/2022.2/Documentation/Manual/ExecutionOrder.html)

## Handheld safety and First Light presentation

Use short, gentle underarm motions, ideally with a fitted wrist strap and clear space away from people, screens, and water. Keep the phone in the hand: “Keep hold of your phone. Lift your thumb to release.” Support seated play and the stationary timed-power mode; never require an overhead swing or greater force to reach maximum power. Test physical handling over a soft surface. A strap is a precaution, not evidence of safety.

Keep the lakeside dawn identity: warm wood and mist colours, quiet type, restrained haptics, blue −W / amber +W accents consistent with [[First Light Match]]. Label W numerically as well as with colour. Show only connection, selected slice, power mode, and arm state in play; keep packet/sensor diagnostics in a developer panel. “Connection lost — game paused. Continue with keyboard.” should be actionable without breaking the scene's calm tone. Record raw motion only by opt-in, locally, without identifiers/secrets, with a clear delete action.

## Risks and physical-iPhone acceptance gate

All tests below require an actual iPhone, native app, and desktop game together. Simulator data, synthetic packets, and a successful build are useful adjuncts but cannot pass this gate. Record phone model/iOS version, native/game revision, network, sample cadence, power mode, pass/fail counts, and latency percentiles. These tests are **not run**.

| Risk | Required physical test and pass condition |
| --- | --- |
| Pairing/privacy/venue LAN | Fresh install: deny then enable Local Network access; wrong secret, occupied receiver, and expired pairing window must not control play. Pair correctly on the intended LAN. Restricted LAN yields a clear failure and usable keyboard play, not repeated permission prompts. |
| Coordinate sign, drift, grip | Both hands: neutral, gentle left/right ±15° and ±30°, pitch/roll, and near-vertical grip. Left/right must match reticle and recorded launch direction; pitch/roll never change W. After two minutes stationary, yaw drift ≤3° or require recalibration. Regrip/reconnect cannot reuse calibration. |
| W race / unintended fourth-axis throw | Select home and available positive/negative-W targets (prepare a test fixture if needed). Attempt arm during transition and change W while armed: both rejected. After settling, launch W matches acknowledged actual W within 0.001; launch direction W is zero. |
| Accidental release / duplicates | Perform 30 intentional gentle releases: exactly one launch per accepted release and none per rejected release. Perform 10 each of drag-out, second touch, touch-up before ACK, lock screen, app switch, and real interruption/call while armed: zero unintended launches. |
| Packet loss, age, and clocks | Through a controlled test transport, add 10% loss, duplicates, reordering, 250 ms delay, timestamp offsets, and replay captured old-session/turn packets while using the phone. Each throw has at most one effect; expired or incomplete releases have none. Lost ACK reconciles to the original result, never a second throw. |
| Watchdog and fallback | Disable phone Wi-Fi, kill/background the app, stop sensor delivery, and interrupt desktop focus while armed/in flight. With responsive host, revoke control by 300 ms plus one frame (150 ms for stale armed sensors). After a host stall, queued release is rejected before gameplay resumes. Keyboard completes the same match; held Space/T during takeover never fires. |
| Latency / stalls | On intended Wi-Fi, measure 100 real touch releases: touch-up→host decision p95 ≤100 ms, no accepted age bound violation. Separately measure touch-up→visible launch using synchronized instrumentation or external high-frame-rate video; do not equate ACK timing with display latency. Target visible p95 ≤150 ms; report clock uncertainty. |
| Power / physical handling | With fitted strap or supported grip, perform 10 gentle low/medium/high gestures in each hand, seated and standing where practical. At least 8/10 gestures per requested band fall in ordered thirds of [0.70,1.15], with no hard swing needed. Timed mode remains usable without movement. If motion-power tuning fails, retain timed mode and report the motion experiment as failed. |
| Lifecycle, battery, permission | Run 20 minutes, including low-power mode, permission changes where applicable, interruptions, background/foreground and reconnect. Report battery/temperature and cadence; no stale sample reuse, recovered arm, or false throw. Missing/failed Core Motion disables phone ownership cleanly. |

Proceed beyond the spike only after these results are reviewed. The principal open risks are touch cancellation versus physical grip, quaternion conversion, network rejection rate, and the missing Unity input-ownership/motion-power boundary. Any safety or duplicate-launch failure blocks gameplay enablement; a negative result is a valid spike outcome.
