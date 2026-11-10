import XCTest
import simd
@testable import PhoneThrowCore

final class ThrowControllerTests: XCTestCase {
    private func sample(_ timestamp: Double, acceleration: Double = 0.8,
                        rotation: Double = 1,
                        attitude: simd_quatd = simd_quatd(real: 1, imag: .zero)) -> MotionSample {
        MotionSample(timestamp: timestamp, attitude: attitude,
                     accelerationG: SIMD3(acceleration, 0, 0),
                     rotationRate: SIMD3(0, rotation, 0))
    }

    private func calibrated(mode: PracticeMode = .experimentalMotion) -> ThrowController {
        var controller = ThrowController()
        controller.setMode(mode)
        stationary(&controller)
        XCTAssertTrue(controller.calibrate(now: 1))
        return controller
    }

    private func stationary(_ controller: inout ThrowController, endingAt: Double = 1,
                            attitude: simd_quatd = simd_quatd(real: 1, imag: .zero)) {
        for index in 0...30 {
            let timestamp = endingAt - Double(30 - index) * 0.02
            controller.ingest(sample(timestamp, acceleration: 0, rotation: 0, attitude: attitude), now: timestamp)
        }
    }

    private func motion(_ controller: inout ThrowController, start: Double = 1,
                        count: Int = 10, interval: Double = 0.02,
                        acceleration: Double = 0.8, rotation: Double = 1) {
        for index in 1...count {
            let timestamp = start + Double(index) * interval
            controller.ingest(sample(timestamp, acceleration: acceleration, rotation: rotation), now: timestamp)
        }
    }

    func testRequiresFreshCalibration() {
        var controller = ThrowController()
        XCTAssertFalse(controller.arm(now: 1))
        XCTAssertFalse(controller.calibrate(now: 1))
        controller.ingest(sample(1), now: 1)
        XCTAssertFalse(controller.arm(now: 1))
        XCTAssertFalse(controller.calibrate(now: 1))
        controller = calibrated()
        XCTAssertEqual(controller.preview?.yawDegrees, 0)
        XCTAssertTrue(controller.arm(now: 1))
        XCTAssertFalse(controller.arm(now: 1.01))
    }

    func testReleaseOccursOncePerHoldAndSequenceIncreases() {
        var controller = calibrated()
        XCTAssertTrue(controller.arm(now: 1))
        motion(&controller)
        let release = controller.release(now: 1.2)
        XCTAssertEqual(release?.sequence, 1)
        XCTAssertEqual(controller.state, .released)
        XCTAssertNil(controller.release(now: 1.2))
        XCTAssertTrue(controller.arm(now: 1.2))
        motion(&controller, start: 1.2)
        XCTAssertEqual(controller.release(now: 1.4)?.sequence, 2)
    }

    func testAllCancellationReasonsSuppressRelease() {
        let reasons: [CancelReason] = [.touchCancelled, .additionalTouch, .movedOutside, .userCancelled,
                                      .inactive, .sensorUnavailable, .staleMotion,
                                      .invalidMotion, .holdTimeout, .insufficientMotion, .calibrationUnsteady]
        for reason in reasons {
            var controller = calibrated()
            controller.arm(now: 1)
            motion(&controller)
            controller.cancel(reason)
            motion(&controller, start: 1.2, count: 1)
            XCTAssertNil(controller.release(now: 1.22))
            XCTAssertEqual(controller.state, .cancelled(reason))
        }
    }

    func testStaleWatchdogInvalidatesCalibrationWithoutNewSamples() {
        var controller = calibrated()
        controller.arm(now: 1)
        controller.tick(now: 1.16)
        XCTAssertEqual(controller.state, .cancelled(.staleMotion))
        XCTAssertFalse(controller.isCalibrated)
        XCTAssertNil(controller.release(now: 1.16))
    }

    func testStreamGapCannotResumeAnArmedThrow() {
        var controller = calibrated()
        controller.arm(now: 1)
        motion(&controller)
        controller.ingest(sample(1.4), now: 1.4)
        XCTAssertFalse(controller.isCalibrated)
        XCTAssertNil(controller.release(now: 1.4))
        stationary(&controller, endingAt: 2.02)
        XCTAssertTrue(controller.calibrate(now: 2.02))
        XCTAssertTrue(controller.arm(now: 2.02))
    }

    func testHoldTimeoutRequiresNewTouch() {
        var controller = calibrated()
        controller.arm(now: 1)
        motion(&controller, count: 151)
        XCTAssertEqual(controller.state, .cancelled(.holdTimeout))
        let timestamp = controller.latest!.timestamp
        XCTAssertNil(controller.release(now: timestamp))
        XCTAssertTrue(controller.arm(now: timestamp))
    }

    func testMalformedAndImplausibleSamplesInvalidateCalibration() {
        let invalid = [
            sample(1.02, acceleration: .nan), sample(1.02, acceleration: .infinity),
            sample(1.02, acceleration: 3.06), sample(1.02, rotation: 12.01),
            sample(1.02, attitude: simd_quatd(vector: .zero)),
            sample(1.02, attitude: simd_quatd(vector: SIMD4(0, 0, 0, 2))),
            sample(.nan), sample(-1)
        ]
        for sample in invalid {
            var controller = calibrated()
            controller.arm(now: 1)
            controller.ingest(sample, now: 1.02)
            XCTAssertFalse(controller.isCalibrated)
            XCTAssertNil(controller.release(now: 1.02))
        }
    }

    func testDuplicateReversedFutureAndDelayedTimestampsCancel() {
        for timestamp in [1.0, 0.99, 1.03, 0.5] {
            var controller = calibrated()
            controller.arm(now: 1)
            controller.ingest(sample(timestamp), now: 1.02)
            XCTAssertFalse(controller.isCalibrated)
            XCTAssertNil(controller.release(now: 1.02))
        }
    }

    func testInvalidClockCannotRelease() {
        for timestamp in [Double.nan, .infinity, 0.9] {
            var controller = calibrated()
            controller.arm(now: 1)
            motion(&controller)
            XCTAssertNil(controller.release(now: timestamp))
            XCTAssertFalse(controller.isCalibrated)
        }
    }

    func testTapAndStationaryHoldDoNotThrow() {
        var controller = calibrated()
        controller.arm(now: 1)
        motion(&controller, count: 2)
        XCTAssertNil(controller.release(now: 1.04))
        controller.arm(now: 1.04)
        motion(&controller, start: 1.04, acceleration: 0.01, rotation: 0.01)
        XCTAssertNil(controller.release(now: 1.24))
        XCTAssertEqual(controller.state, .cancelled(.insufficientMotion))
    }

    func testPowerIsBoundedAndApproximatelyRateIndependent() throws {
        var powers: [Double] = []
        for interval in [0.01, 0.02] {
            var controller = calibrated()
            controller.arm(now: 1)
            motion(&controller, count: Int((0.2 / interval).rounded()), interval: interval)
            let release = try XCTUnwrap(controller.release(now: 1.2))
            powers.append(release.preview.motionEffort)
            XCTAssertGreaterThan(release.preview.motionEffort, 0)
            XCTAssertLessThanOrEqual(release.preview.motionEffort, 1)
            XCTAssertEqual(release.power, .experimentalMotion(effort: release.preview.motionEffort))
        }
        XCTAssertEqual(powers[0], powers[1], accuracy: 0.000001)
        var controller = calibrated()
        controller.arm(now: 1)
        motion(&controller, acceleration: 3, rotation: 11)
        XCTAssertEqual(controller.release(now: 1.2)?.preview.motionEffort, 1)
    }

    func testOnlyRecentArmedMotionContributesToPower() {
        var controller = calibrated()
        motion(&controller)
        controller.arm(now: 1.2)
        XCTAssertNil(controller.release(now: 1.2))
        controller.arm(now: 1.2)
        motion(&controller, start: 1.2, acceleration: 3, rotation: 11)
        motion(&controller, start: 1.4, count: 15, acceleration: 0, rotation: 0)
        XCTAssertEqual(controller.preview?.motionEffort, 0)
        XCTAssertNil(controller.release(now: 1.7))
    }

    func testDelayedPreArmSamplesAreExcluded() {
        var controller = calibrated()
        controller.arm(now: 1.1)
        for index in 1...5 {
            controller.ingest(sample(1 + Double(index) * 0.018), now: 1.1)
        }
        XCTAssertEqual(controller.preview?.motionEffort, 0)
        XCTAssertNil(controller.release(now: 1.1))
    }

    func testCalibrationUsesRelativeQuaternionAndAimClamps() throws {
        let reference = simd_quatd(angle: 0.7, axis: SIMD3(0, 0, 1))
        var controller = ThrowController()
        stationary(&controller, attitude: reference)
        controller.calibrate(now: 1)
        XCTAssertEqual(try XCTUnwrap(controller.preview).yawDegrees, 0, accuracy: 0.000001)
        let yaw = simd_quatd(angle: -.pi / 3, axis: SIMD3(0, 0, 1))
        controller.ingest(sample(1.02, attitude: reference * yaw), now: 1.02)
        XCTAssertEqual(controller.preview?.yawDegrees, 30)
        let pitch = simd_quatd(angle: .pi / 3, axis: SIMD3(1, 0, 0))
        controller.ingest(sample(1.04, attitude: reference * pitch), now: 1.04)
        let preview = try XCTUnwrap(controller.preview)
        XCTAssertEqual(preview.elevationDegrees, 25)
        XCTAssertEqual(preview.projectedDirection.y, 0)
        XCTAssertEqual(simd_length(preview.projectedDirection), 1, accuracy: 0.000001)
    }

    func testGripChangeAndRecalibrationCancelHeldThrow() throws {
        var controller = calibrated()
        controller.arm(now: 1)
        motion(&controller)
        XCTAssertFalse(controller.calibrate(now: 1.2))
        XCTAssertNil(controller.release(now: 1.2))
        controller.arm(now: 1.2)
        controller.setGrip(.left)
        XCTAssertFalse(controller.isCalibrated)
        XCTAssertNil(controller.release(now: 1.2))
        stationary(&controller, endingAt: 2)
        controller.calibrate(now: 2)
        let yaw = simd_quatd(angle: .pi / 9, axis: SIMD3(0, 0, 1))
        controller.ingest(sample(2.02, attitude: yaw), now: 2.02)
        XCTAssertEqual(try XCTUnwrap(controller.preview).yawDegrees, -20, accuracy: 0.000001)
    }

    func testCalibrationRequiresSteadyHalfSecondAndHorizontalTopEdge() {
        var controller = ThrowController()
        controller.ingest(sample(1, acceleration: 0, rotation: 0), now: 1)
        XCTAssertFalse(controller.calibrate(now: 1))
        let vertical = simd_quatd(angle: .pi / 2, axis: SIMD3(1, 0, 0))
        stationary(&controller, endingAt: 2, attitude: vertical)
        XCTAssertFalse(controller.calibrate(now: 2))
        XCTAssertFalse(controller.isCalibrated)
        stationary(&controller, endingAt: 3)
        XCTAssertTrue(controller.calibrate(now: 3))
        controller.arm(now: 3)
        controller.ingest(sample(3.02, attitude: vertical), now: 3.02)
        XCTAssertFalse(controller.isCalibrated)
        XCTAssertNil(controller.release(now: 3.02))
    }

    func testQuaternionSignDoesNotChangeAimAndNegativeYawClamps() throws {
        var controller = calibrated()
        let yaw = simd_quatd(angle: .pi / 3, axis: SIMD3(0, 0, 1))
        controller.ingest(sample(1.02, attitude: yaw), now: 1.02)
        let before = try XCTUnwrap(controller.preview)
        controller.ingest(sample(1.04, attitude: simd_quatd(vector: -yaw.vector)), now: 1.04)
        XCTAssertEqual(before.yawDegrees, -30)
        XCTAssertEqual(controller.preview?.yawDegrees, before.yawDegrees)
    }

    func testTimedIsDefaultAndStationaryReleaseUsesBoundedHoldPower() throws {
        XCTAssertEqual(ThrowController().mode, .timed)
        for (duration, expected) in [(0.0, 0.70), (0.6, 0.925), (1.2, 1.15), (1.8, 1.15)] {
            var controller = calibrated(mode: .timed)
            XCTAssertTrue(controller.arm(now: 1))
            if duration > 0 {
                motion(&controller, count: Int((duration / 0.02).rounded()), acceleration: 0, rotation: 0)
            }
            let timestamp = controller.latest!.timestamp
            let release = try XCTUnwrap(controller.release(now: timestamp))
            guard case .timed(let multiplier) = release.power else {
                return XCTFail("Timed practice must not return experimental effort")
            }
            XCTAssertEqual(multiplier, expected, accuracy: 0.000001)
            XCTAssertEqual(release.preview.motionEffort, 0)
            XCTAssertNil(controller.release(now: timestamp))
        }
    }

    func testTimedCancellationAndTimeoutCannotRelease() {
        for reason: CancelReason in [.userCancelled, .touchCancelled, .additionalTouch, .inactive] {
            var controller = calibrated(mode: .timed)
            controller.arm(now: 1)
            motion(&controller, acceleration: 0, rotation: 0)
            controller.cancel(reason)
            XCTAssertNil(controller.release(now: 1.2))
            XCTAssertEqual(controller.state, .cancelled(reason))
        }
        var controller = calibrated(mode: .timed)
        controller.arm(now: 1)
        motion(&controller, count: 150, acceleration: 0, rotation: 0)
        XCTAssertNil(controller.release(now: 4))
        XCTAssertEqual(controller.state, .cancelled(.holdTimeout))
    }

    func testTimedStillRequiresCalibrationFreshSensorsAndValidClock() {
        var controller = ThrowController()
        XCTAssertFalse(controller.arm(now: 1))
        XCTAssertNil(controller.release(now: 1))
        for timestamp in [Double.nan, .infinity, 0.9, 1.16] {
            controller = calibrated(mode: .timed)
            controller.arm(now: 1)
            XCTAssertNil(controller.release(now: timestamp))
        }
    }

    func testTimedPowerRestartsAtMinimumForNewHold() throws {
        var controller = calibrated(mode: .timed)
        controller.arm(now: 1)
        motion(&controller, count: 60, acceleration: 0, rotation: 0)
        let timestamp = controller.latest!.timestamp
        XCTAssertNotNil(controller.release(now: timestamp))
        XCTAssertTrue(controller.arm(now: timestamp))
        let release = try XCTUnwrap(controller.release(now: timestamp))
        XCTAssertEqual(release.power, .timed(multiplier: 0.70))
    }

    func testChangingPracticeModeCancelsInsteadOfReinterpretingHeldThrow() {
        var controller = calibrated(mode: .timed)
        controller.arm(now: 1)
        motion(&controller)
        controller.setMode(.experimentalMotion)
        XCTAssertEqual(controller.state, .cancelled(.userCancelled))
        XCTAssertNil(controller.release(now: 1.2))
        XCTAssertTrue(controller.arm(now: 1.2))
        motion(&controller, start: 1.2)
        controller.setMode(.timed)
        XCTAssertNil(controller.release(now: 1.4))
    }
}
