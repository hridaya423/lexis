// swift-tools-version: 6.2
import PackageDescription

let package = Package(
  name: "lexis-apple-fm-helper",
  platforms: [.macOS(.v26)],
  targets: [
    .executableTarget(name: "lexis-apple-fm", path: "Sources/lexis-apple-fm"),
    .testTarget(name: "LexisAppleFMTests", path: "Tests/lexis-apple-fm"),
  ]
)
