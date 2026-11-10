// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "PhoneThrowCore",
    platforms: [.macOS(.v13), .iOS(.v17)],
    products: [.library(name: "PhoneThrowCore", targets: ["PhoneThrowCore"])],
    targets: [
        .target(name: "PhoneThrowCore"),
        .testTarget(name: "PhoneThrowCoreTests", dependencies: ["PhoneThrowCore"])
    ]
)
