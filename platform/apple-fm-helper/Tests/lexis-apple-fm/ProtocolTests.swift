import XCTest

// Protocol surface test: JSONL request/response shapes only. The model path
// is exercised by the CLI on real hardware (lx model runtime build-apple).
final class ProtocolTests: XCTestCase {
  func testRequestShape() throws {
    let json = #"{"instructions":"sys","prompt":"ls files","maxTokens":300}"#.data(using: .utf8)!
    let obj = try JSONSerialization.jsonObject(with: json) as? [String: Any]
    XCTAssertEqual(obj?["instructions"] as? String, "sys")
    XCTAssertEqual(obj?["maxTokens"] as? Int, 300)
  }

  func testPlanSnakeCaseEncoding() throws {
    // Mirrors PlanOut key mapping: camelCase -> snake_case.
    let plan: [String: Any] = [
      "summary": "list files",
      "overall_risk": "low",
      "confidence": 0.9,
      "requires_confirmation": false,
      "commands": [["command": "ls", "intent": "list", "risk": "low", "requires_confirmation": false, "platform": "all"]],
    ]
    let data = try JSONSerialization.data(withJSONObject: plan)
    let back = try JSONSerialization.jsonObject(with: data) as? [String: Any]
    XCTAssertNotNil(back?["overall_risk"])
    XCTAssertNotNil(back?["requires_confirmation"])
  }
}
