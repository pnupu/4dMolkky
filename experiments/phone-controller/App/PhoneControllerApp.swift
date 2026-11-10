import SwiftUI
import PhoneThrowCore

@main
struct PhoneControllerApp: App {
    var body: some Scene {
        WindowGroup { ControllerView() }
    }
}

struct ControllerView: View {
    @Environment(\.scenePhase) private var scenePhase
    @State private var model = MotionControllerModel()
    @ScaledMetric(relativeTo: .title2) private var holdPadHeight = 220.0

    var body: some View {
        ScrollView {
            practiceContent
                .padding()
        }
        .safeAreaInset(edge: .bottom) {
            Button(role: .destructive) { model.cancel(.userCancelled) } label: {
                Text("Cancel throw").frame(maxWidth: .infinity)
            }
            .buttonStyle(.bordered)
            .padding()
            .background(.bar)
        }
        .onChange(of: scenePhase, initial: true) { _, phase in
            if phase == .active { model.start() } else { model.stop() }
        }
    }

    private var practiceContent: some View {
        VStack(spacing: 16) {
            Text("Throw controller").font(.title.bold())
            Text("Local practice · No game connection").font(.subheadline)
            Text("Keep hold of your phone. Screen up, top edge forward. Hold still to calibrate; lift only your thumb to release. Use small movements and a wrist strap or two-handed grip.")
                .font(.callout)
            Text(model.status).font(.headline).accessibilityIdentifier("controllerStatus")
            Picker("Practice mode", selection: Binding(
                get: { model.controller.mode },
                set: { model.setMode($0) }
            )) {
                Text("Timed").tag(PracticeMode.timed)
                Text("Motion experiment").tag(PracticeMode.experimentalMotion)
            }
            .pickerStyle(.menu)
            .disabled(model.controller.state == .armed)
            VStack(spacing: 12) {
                Button("Calibrate") { model.calibrate() }
                    .buttonStyle(.bordered)
                    .disabled(model.controller.latest == nil)
                Picker("Grip", selection: Binding(
                    get: { model.controller.grip },
                    set: { model.setGrip($0) }
                )) {
                    Text("Right").tag(Grip.right)
                    Text("Left").tag(Grip.left)
                }
                .pickerStyle(.menu)
                .disabled(model.controller.state == .armed)
            }
            if let preview = model.controller.preview {
                Text(String(format: "Aim %+.0f°", preview.yawDegrees))
                    .monospacedDigit()
            }
            if let power = model.practicePower {
                switch power {
                case .timed(let multiplier):
                    ProgressView("Hold for power · Stay still", value: (multiplier - 0.70) / 0.45)
                    Text(String(format: "Timed practice %.2f×", multiplier)).monospacedDigit()
                case .experimentalMotion(let effort):
                    ProgressView("Experimental local effort · Not game power", value: effort)
                }
            }
            ThrowSurface(model: model)
                .frame(height: holdPadHeight)
            Text("Slide outside or add a finger to cancel. Lift all pad fingers before retrying.").font(.footnote)
            if let release = model.lastRelease {
                switch release.power {
                case .timed(let multiplier):
                    Text(String(format: "Last local release #%llu · Timed %.2f×", release.sequence, multiplier))
                        .font(.footnote).monospacedDigit()
                case .experimentalMotion(let effort):
                    Text("Last local release #\(release.sequence) · Experimental effort \(Int((effort * 100).rounded()))%")
                        .font(.footnote).monospacedDigit()
                }
            }
        }
    }
}

#Preview { ControllerView() }
