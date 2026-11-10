import XCTest
import PhoneThrowCore

final class PadTouchGateTests: XCTestCase {
    func testSingleTouchReleasesOnlyOnce() {
        var gate = PadTouchGate<Int>()
        XCTAssertEqual(gate.began([1]), .arm)
        XCTAssertEqual(gate.ended([1], inside: true), .release)
        XCTAssertEqual(gate.ended([1], inside: true), .none)
    }

    func testSecondTouchCancelsAndBothLiftOrdersStayLatched() {
        for firstToLift in [1, 2] {
            let remaining = firstToLift == 1 ? 2 : 1
            var gate = PadTouchGate<Int>()
            XCTAssertEqual(gate.began([1]), .arm)
            XCTAssertEqual(gate.began([2]), .cancel(.additionalTouch))
            XCTAssertEqual(gate.ended([firstToLift], inside: true), .none)
            XCTAssertEqual(gate.began([3]), .cancel(.additionalTouch))
            XCTAssertEqual(gate.ended([remaining], inside: true), .none)
            XCTAssertEqual(gate.ended([3], inside: true), .none)
            XCTAssertEqual(gate.began([4]), .arm)
            XCTAssertEqual(gate.ended([4], inside: true), .release)
        }
    }

    func testSimultaneousTouchesNeverArmOrRelease() {
        var gate = PadTouchGate<Int>()
        XCTAssertEqual(gate.began([1, 2]), .cancel(.additionalTouch))
        XCTAssertEqual(gate.ended([1, 2], inside: true), .none)
        XCTAssertEqual(gate.began([3]), .arm)
    }

    func testDraggingOutsideThenBackInsideStaysCancelled() {
        var gate = PadTouchGate<Int>()
        XCTAssertEqual(gate.began([1]), .arm)
        XCTAssertEqual(gate.moved(outside: true), .cancel(.movedOutside))
        XCTAssertEqual(gate.moved(outside: false), .none)
        XCTAssertEqual(gate.ended([1], inside: true), .none)
        XCTAssertEqual(gate.began([2]), .arm)
        XCTAssertEqual(gate.ended([2], inside: false), .cancel(.movedOutside))
    }

    func testSystemCancellationCannotReleaseRemainingTouches() {
        var gate = PadTouchGate<Int>()
        XCTAssertEqual(gate.began([1]), .arm)
        XCTAssertEqual(gate.began([2]), .cancel(.additionalTouch))
        XCTAssertEqual(gate.cancelled([1]), .cancel(.touchCancelled))
        XCTAssertEqual(gate.ended([2], inside: true), .none)
        XCTAssertEqual(gate.began([3]), .arm)
        XCTAssertEqual(gate.cancelled([3]), .cancel(.touchCancelled))
        XCTAssertEqual(gate.ended([3], inside: true), .none)
    }

    func testExternalCancellationOrRejectedArmRequiresLift() {
        var gate = PadTouchGate<Int>()
        XCTAssertEqual(gate.began([1]), .arm)
        gate.blockUntilAllLift()
        XCTAssertEqual(gate.began([1]), .none)
        XCTAssertEqual(gate.ended([1], inside: true), .none)
        XCTAssertEqual(gate.began([2]), .arm)
    }

    func testUnknownOrEmptyTouchEventsCannotReleaseOrUnlockLatch() {
        var gate = PadTouchGate<Int>()
        XCTAssertEqual(gate.began([]), .none)
        XCTAssertEqual(gate.began([1]), .arm)
        gate.blockUntilAllLift()
        XCTAssertEqual(gate.ended([99], inside: true), .none)
        XCTAssertEqual(gate.cancelled([99]), .none)
        XCTAssertEqual(gate.ended([], inside: true), .none)
        XCTAssertEqual(gate.ended([1], inside: true), .none)
        XCTAssertEqual(gate.began([2]), .arm)
    }
}
