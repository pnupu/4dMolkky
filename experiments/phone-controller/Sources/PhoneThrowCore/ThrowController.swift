import Foundation
import simd

public struct MotionSample: Sendable {
    public let timestamp: TimeInterval
    public let attitude: simd_quatd
    public let accelerationG: SIMD3<Double>
    public let rotationRate: SIMD3<Double>

    public init(timestamp: TimeInterval, attitude: simd_quatd,
                accelerationG: SIMD3<Double>, rotationRate: SIMD3<Double>) {
        self.timestamp = timestamp
        self.attitude = attitude
        self.accelerationG = accelerationG
        self.rotationRate = rotationRate
    }

    var isValid: Bool {
        let values = [timestamp, attitude.vector.x, attitude.vector.y,
                      attitude.vector.z, attitude.vector.w,
                      accelerationG.x, accelerationG.y, accelerationG.z,
                      rotationRate.x, rotationRate.y, rotationRate.z]
        return values.allSatisfy(\.isFinite) && timestamp >= 0
            && (0.95...1.05).contains(simd_length(attitude.vector))
            && simd_length(accelerationG) * 9.80665 <= 30
            && simd_length(rotationRate) <= 12
    }
}

public enum Grip: String, CaseIterable, Sendable {
    case right, left
}

public enum PracticeMode: Sendable {
    case timed, experimentalMotion
}

public enum PracticePower: Equatable, Sendable {
    case timed(multiplier: Double)
    case experimentalMotion(effort: Double)
}

public enum CancelReason: String, Sendable {
    case touchCancelled, additionalTouch, movedOutside, userCancelled, inactive
    case sensorUnavailable, staleMotion, invalidMotion, holdTimeout, insufficientMotion, calibrationUnsteady
}

public enum ThrowState: Equatable, Sendable {
    case uncalibrated, ready, armed, released
    case cancelled(CancelReason)
}

public struct ThrowPreview: Sendable {
    public let relativeAttitude: simd_quatd
    public let yawDegrees: Double
    public let elevationDegrees: Double
    public let motionEffort: Double

    public var projectedDirection: SIMD3<Double> {
        let yaw = yawDegrees * .pi / 180
        return SIMD3(sin(yaw), 0, cos(yaw))
    }
}

public struct LocalRelease: Sendable {
    public let sequence: UInt64
    public let timestamp: TimeInterval
    public let preview: ThrowPreview
    public let power: PracticePower
    public let samples: [MotionSample]
}

public struct ThrowController: Sendable {
    public static let motionWindow: TimeInterval = 0.2
    public static let staleAfter: TimeInterval = 0.15
    public static let maximumHold: TimeInterval = 3

    public private(set) var state: ThrowState = .uncalibrated
    public private(set) var grip: Grip = .right
    public private(set) var mode: PracticeMode = .timed
    public private(set) var latest: MotionSample?
    private var reference: simd_quatd?
    private var armedAt: TimeInterval?
    private var steadySince: TimeInterval?
    private var samples: [MotionSample] = []
    private var sequence: UInt64 = 0

    public init() {}

    public var isCalibrated: Bool { reference != nil }

    public mutating func ingest(_ sample: MotionSample, now: TimeInterval) {
        guard sample.isValid, now.isFinite else {
            reset(.invalidMotion)
            return
        }
        guard now >= sample.timestamp, now - sample.timestamp <= Self.staleAfter else {
            reset(.staleMotion)
            return
        }
        if let latest {
            guard sample.timestamp > latest.timestamp else {
                reset(.invalidMotion)
                return
            }
            if sample.timestamp - latest.timestamp > Self.staleAfter {
                reset(.staleMotion)
            }
        }
        latest = sample
        if state != .armed, simd_length(sample.accelerationG) * 9.80665 < 0.5,
           simd_length(sample.rotationRate) < 0.3 {
            if steadySince == nil { steadySince = sample.timestamp }
        } else {
            steadySince = nil
        }
        tick(now: now)
        if reference != nil, preview == nil {
            reset(.invalidMotion)
            return
        }
        if state == .armed, let armedAt, sample.timestamp >= armedAt {
            samples.append(sample)
            samples.removeAll { sample.timestamp - $0.timestamp > Self.motionWindow }
            if samples.count > 64 { samples.removeFirst(samples.count - 64) }
        }
    }

    @discardableResult
    public mutating func calibrate(now: TimeInterval) -> Bool {
        if state == .armed {
            cancel(.userCancelled)
            return false
        }
        guard fresh(now: now), let latest else {
            reset(.staleMotion)
            return false
        }
        guard let steadySince, latest.timestamp - steadySince >= 0.5 else {
            reset(.calibrationUnsteady)
            return false
        }
        reference = latest.attitude.normalized
        guard preview != nil else {
            reset(.invalidMotion)
            return false
        }
        state = .ready
        return true
    }

    public mutating func setGrip(_ grip: Grip) {
        guard grip != self.grip else { return }
        self.grip = grip
        reset(.userCancelled)
    }

    public mutating func setMode(_ mode: PracticeMode) {
        guard mode != self.mode else { return }
        cancel(.userCancelled)
        self.mode = mode
    }

    public func practicePower(now: TimeInterval) -> PracticePower? {
        guard fresh(now: now), reference != nil else { return nil }
        switch mode {
        case .timed:
            let elapsed = armedAt.map { now - $0 } ?? 0
            guard elapsed >= 0 else { return nil }
            return .timed(multiplier: 0.70 + 0.45 * min(1, elapsed / 1.20))
        case .experimentalMotion:
            return .experimentalMotion(effort: power)
        }
    }

    @discardableResult
    public mutating func arm(now: TimeInterval) -> Bool {
        guard state != .armed, preview != nil, fresh(now: now) else { return false }
        samples.removeAll(keepingCapacity: true)
        armedAt = now
        state = .armed
        return true
    }

    public mutating func tick(now: TimeInterval) {
        guard reference != nil else { return }
        guard fresh(now: now) else {
            reset(.staleMotion)
            return
        }
        if let armedAt, now - armedAt >= Self.maximumHold {
            cancel(.holdTimeout)
        }
    }

    public mutating func release(now: TimeInterval) -> LocalRelease? {
        tick(now: now)
        guard state == .armed else { return nil }
        samples.removeAll { now - $0.timestamp > Self.motionWindow }
        if mode == .experimentalMotion {
            guard let first = samples.first, let last = samples.last,
                  samples.count >= 4, last.timestamp - first.timestamp >= 0.08,
                  power >= 0.04 else {
                cancel(.insufficientMotion)
                return nil
            }
        }
        guard let preview, let practicePower = practicePower(now: now) else {
            cancel(.insufficientMotion)
            return nil
        }
        sequence += 1
        let result = LocalRelease(sequence: sequence, timestamp: now,
                                  preview: preview, power: practicePower, samples: samples)
        state = .released
        armedAt = nil
        samples.removeAll(keepingCapacity: true)
        return result
    }

    public mutating func cancel(_ reason: CancelReason) {
        state = .cancelled(reason)
        armedAt = nil
        samples.removeAll(keepingCapacity: true)
    }

    public mutating func reset(_ reason: CancelReason) {
        cancel(reason)
        reference = nil
        latest = nil
        steadySince = nil
    }

    public var preview: ThrowPreview? {
        guard let reference, let latest else { return nil }
        let relative = (reference.inverse * latest.attitude.normalized).normalized
        let baseline = reference.act(SIMD3<Double>(0, 1, 0))
        let forward = latest.attitude.normalized.act(SIMD3<Double>(0, 1, 0))
        let baselineHorizontal = SIMD3(baseline.x, baseline.y, 0)
        let forwardHorizontal = SIMD3(forward.x, forward.y, 0)
        guard simd_length(baselineHorizontal) >= 0.25,
              simd_length(forwardHorizontal) >= 0.25 else { return nil }
        let baselineDirection = simd_normalize(baselineHorizontal)
        let forwardDirection = simd_normalize(forwardHorizontal)
        let right = simd_cross(baselineDirection, SIMD3<Double>(0, 0, 1))
        let yaw = atan2(simd_dot(forwardDirection, right),
                        simd_dot(forwardDirection, baselineDirection)) * 180 / .pi
        let elevation = asin(min(1, max(-1, forward.z))) * 180 / .pi
        return ThrowPreview(relativeAttitude: relative,
                            yawDegrees: min(30, max(-30, yaw)),
                            elevationDegrees: min(25, max(-25, elevation)),
                            motionEffort: power)
    }

    private func fresh(now: TimeInterval) -> Bool {
        guard now.isFinite, let latest else { return false }
        return now >= latest.timestamp && now - latest.timestamp <= Self.staleAfter
    }

    private var power: Double {
        guard let first = samples.first, let last = samples.last,
              last.timestamp > first.timestamp else { return 0 }
        var integral = 0.0
        for (previous, current) in zip(samples, samples.dropFirst()) {
            integral += (effort(previous) + effort(current)) * 0.5
                * (current.timestamp - previous.timestamp)
        }
        return min(1, max(0, integral / (last.timestamp - first.timestamp)))
    }

    private func effort(_ sample: MotionSample) -> Double {
        let acceleration = min(1, max(0, (simd_length(sample.accelerationG) - 0.06) / 1.5))
        let rotation = min(1, max(0, (simd_length(sample.rotationRate) - 0.15) / 5))
        return 0.8 * acceleration + 0.2 * rotation
    }
}
