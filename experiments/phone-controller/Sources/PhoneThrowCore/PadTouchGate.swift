public enum PadTouchAction: Equatable {
    case none, arm, release, cancel(CancelReason)
}

public struct PadTouchGate<TouchID: Hashable> {
    private var activeTouches: Set<TouchID> = []
    private var blocked = false

    public init() {}

    public mutating func began(_ touches: Set<TouchID>) -> PadTouchAction {
        let wasEmpty = activeTouches.isEmpty
        activeTouches.formUnion(touches)
        if activeTouches.count > 1 {
            blocked = true
            return .cancel(.additionalTouch)
        }
        return wasEmpty && !blocked && activeTouches.count == 1 ? .arm : .none
    }

    public mutating func moved(outside: Bool) -> PadTouchAction {
        guard outside, !activeTouches.isEmpty else { return .none }
        blocked = true
        return .cancel(.movedOutside)
    }

    public mutating func ended(_ touches: Set<TouchID>, inside: Bool) -> PadTouchAction {
        guard !activeTouches.isDisjoint(with: touches) else { return .none }
        let eligible = !blocked && activeTouches.count == 1
        activeTouches.subtract(touches)
        if activeTouches.isEmpty { blocked = false }
        guard eligible else { return .none }
        return inside ? .release : .cancel(.movedOutside)
    }

    public mutating func cancelled(_ touches: Set<TouchID>) -> PadTouchAction {
        guard !activeTouches.isDisjoint(with: touches) else { return .none }
        activeTouches.subtract(touches)
        blocked = !activeTouches.isEmpty
        return .cancel(.touchCancelled)
    }

    public mutating func blockUntilAllLift() {
        blocked = !activeTouches.isEmpty
    }
}
