import CoreMotion
import Foundation
import Observation
import PhoneThrowCore
import UIKit
import simd

@MainActor
@Observable
final class MotionControllerModel {
    private(set) var controller = ThrowController()
    private(set) var lastRelease: LocalRelease?
    @ObservationIgnored private let motion = CMMotionManager()
    @ObservationIgnored private var polling: Task<Void, Never>?

    var status: String {
        switch controller.state {
        case .uncalibrated: "Hold your usual grip, then calibrate"
        case .ready: "Ready — hold the pad to arm"
        case .armed: "Armed — lift your thumb to release"
        case .released: "Released locally — hold to try again"
        case .cancelled(let reason):
            switch reason {
            case .sensorUnavailable: "Motion unavailable on this device"
            case .staleMotion, .invalidMotion: "Motion interrupted — calibrate again"
            case .inactive: "Paused — calibrate when you return"
            case .holdTimeout: "Hold timed out — lift your thumb and try again"
            case .insufficientMotion: "No throw — use a small, controlled movement"
            case .calibrationUnsteady: "Hold still for half a second, then calibrate"
            case .additionalTouch: "Cancelled — lift all fingers off the pad"
            default: controller.isCalibrated ? "Cancelled — hold to try again" : "Calibrate before throwing"
            }
        }
    }

    func start() {
        guard polling == nil else { return }
        guard motion.isDeviceMotionAvailable,
              CMMotionManager.availableAttitudeReferenceFrames().contains(.xArbitraryZVertical) else {
            controller.reset(.sensorUnavailable)
            return
        }
        motion.deviceMotionUpdateInterval = 1.0 / 60.0
        motion.startDeviceMotionUpdates(using: .xArbitraryZVertical)
        polling = Task { [weak self] in
            while !Task.isCancelled {
                self?.readMotion()
                do { try await Task.sleep(for: .milliseconds(16)) } catch { break }
            }
        }
    }

    func stop() {
        polling?.cancel()
        polling = nil
        motion.stopDeviceMotionUpdates()
        controller.reset(.inactive)
    }

    func calibrate() {
        if controller.calibrate(now: now) {
            UINotificationFeedbackGenerator().notificationOccurred(.success)
        }
    }

    func setGrip(_ grip: Grip) { controller.setGrip(grip) }

    func setMode(_ mode: PracticeMode) { controller.setMode(mode) }

    var practicePower: PracticePower? { controller.practicePower(now: now) }

    func arm() -> Bool {
        let armed = controller.arm(now: now)
        if armed { UIImpactFeedbackGenerator(style: .light).impactOccurred() }
        return armed
    }

    func release() {
        if let release = controller.release(now: now) {
            lastRelease = release
            UINotificationFeedbackGenerator().notificationOccurred(.success)
        }
    }

    func cancel(_ reason: CancelReason) {
        guard controller.state == .armed else { return }
        controller.cancel(reason)
    }

    private var now: TimeInterval { ProcessInfo.processInfo.systemUptime }

    private func readMotion() {
        let deviceMotion = motion.deviceMotion
        let timestamp = now
        controller.tick(now: timestamp)
        guard let deviceMotion,
              deviceMotion.timestamp != controller.latest?.timestamp else { return }
        let attitude = deviceMotion.attitude.quaternion
        let acceleration = deviceMotion.userAcceleration
        let rotation = deviceMotion.rotationRate
        controller.ingest(MotionSample(
            timestamp: deviceMotion.timestamp,
            attitude: simd_quatd(ix: attitude.x, iy: attitude.y, iz: attitude.z, r: attitude.w),
            accelerationG: SIMD3(acceleration.x, acceleration.y, acceleration.z),
            rotationRate: SIMD3(rotation.x, rotation.y, rotation.z)
        ), now: timestamp)
    }
}
