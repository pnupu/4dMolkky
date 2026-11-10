import PhoneThrowCore
import SwiftUI
import UIKit

struct ThrowSurface: UIViewRepresentable {
    let model: MotionControllerModel

    func makeUIView(context: Context) -> HoldControl {
        let control = HoldControl()
        control.onBegin = { model.arm() }
        control.onRelease = { model.release() }
        control.onCancel = { model.cancel($0) }
        return control
    }

    func updateUIView(_ control: HoldControl, context: Context) {
        let armed = model.controller.state == .armed
        if !armed { control.blockUntilAllLift() }
        control.label.text = armed ? "Lift thumb to release" : "Hold to arm"
        control.backgroundColor = armed ? .systemOrange : .secondarySystemBackground
        control.accessibilityLabel = control.label.text
        control.accessibilityValue = model.status
    }

    static func dismantleUIView(_ control: HoldControl, coordinator: ()) {
        control.blockUntilAllLift()
        control.onCancel(.touchCancelled)
    }
}

final class HoldControl: UIView {
    var onBegin: () -> Bool = { false }
    var onRelease: () -> Void = {}
    var onCancel: (CancelReason) -> Void = { _ in }
    let label = UILabel()
    private var touchGate = PadTouchGate<ObjectIdentifier>()

    override init(frame: CGRect) {
        super.init(frame: frame)
        layer.cornerRadius = 12
        isMultipleTouchEnabled = true
        isAccessibilityElement = true
        accessibilityTraits = .button
        accessibilityIdentifier = "holdToThrow"
        accessibilityHint = "Touch and hold to arm; lift to release. Slide outside to cancel."
        label.font = .preferredFont(forTextStyle: .title2)
        label.adjustsFontForContentSizeCategory = true
        label.textAlignment = .center
        label.numberOfLines = 0
        label.isUserInteractionEnabled = false
        addSubview(label)
        label.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            label.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 16),
            label.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -16),
            label.centerYAnchor.constraint(equalTo: centerYAnchor)
        ])
    }

    required init?(coder: NSCoder) { nil }

    func blockUntilAllLift() {
        touchGate.blockUntilAllLift()
    }

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        handle(touchGate.began(Set(touches.map(ObjectIdentifier.init))))
    }

    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
        handle(touchGate.moved(outside: touches.contains { !bounds.contains($0.location(in: self)) }))
    }

    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        handle(touchGate.ended(Set(touches.map(ObjectIdentifier.init)),
                               inside: touches.allSatisfy { bounds.contains($0.location(in: self)) }))
    }

    override func touchesCancelled(_ touches: Set<UITouch>, with event: UIEvent?) {
        handle(touchGate.cancelled(Set(touches.map(ObjectIdentifier.init))))
    }

    private func handle(_ action: PadTouchAction) {
        switch action {
        case .none: break
        case .arm:
            if !onBegin() { touchGate.blockUntilAllLift() }
        case .release: onRelease()
        case .cancel(let reason): onCancel(reason)
        }
    }
}
