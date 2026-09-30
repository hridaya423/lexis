import Foundation
#if canImport(FoundationModels)
import FoundationModels
#endif

// lexis-apple-fm: JSONL protocol over stdio.
//   lexis-apple-fm availability            -> {"ok":true} | {"ok":false,"reason":...}
//   lexis-apple-fm plan                    -> stdin {"instructions","prompt","maxTokens"}
//                                            stdout {"ok":true,"plan":{...}} | {"ok":false,"error":...}
//   lexis-apple-fm --fixture <file.json>   -> print file contents (CI without Apple Intelligence)

enum Out {
  static func line(_ dict: [String: Any]) {
    if let data = try? JSONSerialization.data(withJSONObject: dict),
       let s = String(data: data, encoding: .utf8) {
      FileHandle.standardOutput.write(Data((s + "\n").utf8))
    }
  }
}

let args = Array(CommandLine.arguments.dropFirst())

if args.first == "--fixture", let file = args.dropFirst().first {
  if let data = FileManager.default.contents(atPath: file) {
    FileHandle.standardOutput.write(data)
    if !data.isEmpty && data.last != 0x0a { FileHandle.standardOutput.write(Data([0x0a])) }
    exit(0)
  }
  FileHandle.standardError.write(Data("fixture not found: \(file)\n".utf8))
  exit(1)
}

#if canImport(FoundationModels)

@Generable
struct PlanStep {
  var command: String
  var intent: String
  @Guide(.anyOf(["low", "moderate", "high", "critical"]))
  var risk: String
  var requiresConfirmation: Bool
  @Guide(.anyOf(["all", "unix", "windows"]))
  var platform: String?
  var rollback: String?
}

@Generable
struct PlanSource {
  var title: String
  var url: String
}

@Generable
struct CommandPlan {
  @Guide(description: "Short plan summary, at most 12 words")
  var summary: String
  @Guide(.anyOf(["low", "moderate", "high", "critical"]))
  var overallRisk: String
  @Guide(.range(0.0...1.0))
  var confidence: Double
  var requiresConfirmation: Bool
  @Guide(.count(1...6))
  var commands: [PlanStep]
  var preflightChecks: [String]?
  var sources: [PlanSource]?
}

// Codable mirror for snake_case output matching PLAN_JSON_SCHEMA.
struct PlanOut: Codable {
  struct Step: Codable {
    var command: String
    var intent: String
    var risk: String
    var requiresConfirmation: Bool
    var platform: String?
    var rollback: String?
  }
  struct Source: Codable { var title: String; var url: String }
  var summary: String
  var overallRisk: String
  var confidence: Double
  var requiresConfirmation: Bool
  var commands: [Step]
  var preflightChecks: [String]?
  var sources: [Source]?
}

struct Request: Codable {
  var instructions: String
  var prompt: String
  var maxTokens: Int?
}

func availabilityDict() -> [String: Any] {
  let model = SystemLanguageModel.default
  var context = 4096
  context = model.contextSize
  switch model.availability {
  case .available:
    return ["ok": true, "contextSize": context]
  case .unavailable(let reason):
    let name = String(describing: reason)
    let mapped: String
    if name.localizedCaseInsensitiveContains("deviceNotEligible") { mapped = "deviceNotEligible" }
    else if name.localizedCaseInsensitiveContains("appleIntelligenceNotEnabled") { mapped = "appleIntelligenceNotEnabled" }
    else if name.localizedCaseInsensitiveContains("modelNotReady") { mapped = "modelNotReady" }
    else { mapped = name }
    return ["ok": false, "reason": mapped, "contextSize": context]
  }
}

func errorDict(_ error: Error) -> [String: Any] {
  let name = String(describing: error)
  var code = "generationFailed"
  if name.localizedCaseInsensitiveContains("guardrail") { code = "guardrailViolation" }
  else if name.localizedCaseInsensitiveContains("contextWindow") || name.localizedCaseInsensitiveContains("exceededContext") { code = "exceededContextWindowSize" }
  else if name.localizedCaseInsensitiveContains("unsupportedLanguage") || name.localizedCaseInsensitiveContains("locale") { code = "unsupportedLanguage" }
  else if name.localizedCaseInsensitiveContains("cancel") { code = "cancelled" }
  else if name.localizedCaseInsensitiveContains("refusal") || name.localizedCaseInsensitiveContains("refused") { code = "refusal" }
  else if name.localizedCaseInsensitiveContains("rate") { code = "rateLimited" }
  else if name.localizedCaseInsensitiveContains("notReady") || name.localizedCaseInsensitiveContains("asset") { code = "modelNotReady" }
  return ["ok": false, "error": code, "message": name]
}

func emitPlan(_ plan: CommandPlan, latencyMs: Int) {
  let out = PlanOut(
    summary: plan.summary,
    overallRisk: plan.overallRisk,
    confidence: plan.confidence,
    requiresConfirmation: plan.requiresConfirmation,
    commands: plan.commands.map {
      PlanOut.Step(command: $0.command, intent: $0.intent, risk: $0.risk,
                   requiresConfirmation: $0.requiresConfirmation,
                   platform: $0.platform ?? "all", rollback: $0.rollback)
    },
    preflightChecks: plan.preflightChecks,
    sources: plan.sources?.map { PlanOut.Source(title: $0.title, url: $0.url) }
  )
  let encoder = JSONEncoder()
  encoder.keyEncodingStrategy = .convertToSnakeCase
  if let data = try? encoder.encode(out),
     var obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
    obj["ok"] = true
    obj["latencyMs"] = latencyMs
    let planPart = obj
    var wrapper: [String: Any] = ["ok": true, "latencyMs": latencyMs]
    wrapper["plan"] = { () -> [String: Any] in var p = planPart; p.removeValue(forKey: "ok"); p.removeValue(forKey: "latencyMs"); return p }()
    Out.line(wrapper)
  } else {
    Out.line(["ok": false, "error": "encodeFailure"])
  }
}

func readStdin() -> String {
  var data = Data()
  while let chunk = try? FileHandle.standardInput.read(upToCount: 65536), !chunk.isEmpty {
    data.append(chunk)
  }
  return String(data: data, encoding: .utf8) ?? ""
}

func main() async {
  guard #available(macOS 26.0, *) else {
    Out.line(["ok": false, "reason": "unsupportedOS", "detail": "Apple Foundation Models requires macOS 26+"])
    return
  }

  if args.first == "availability" {
    Out.line(availabilityDict())
    return
  }

  guard args.first == "plan" else {
    FileHandle.standardError.write(Data("usage: lexis-apple-fm <availability|plan|--fixture file>\n".utf8))
    exit(2)
  }

  let raw = readStdin()
  guard let reqData = raw.data(using: .utf8),
        let req = try? JSONDecoder().decode(Request.self, from: reqData) else {
    Out.line(["ok": false, "error": "badRequest", "message": "expected JSON {instructions,prompt,maxTokens} on stdin"])
    return
  }

  let avail = availabilityDict()
  guard (avail["ok"] as? Bool) == true else {
    Out.line(["ok": false, "error": avail["reason"] ?? "unavailable", "message": "model not available"])
    return
  }

  // Rough token budget: ~4 chars/token; schema + output reserve space.
  let estTokens = (req.instructions.count + req.prompt.count) / 4 + (req.maxTokens ?? 400)
  let contextSize = (avail["contextSize"] as? Int) ?? 4096
  if estTokens > contextSize {
    Out.line(["ok": false, "error": "exceededContextWindowSize", "message": "estimated \(estTokens) tokens > \(contextSize) context"])
    return
  }

  let startedAt = Date()
  do {
    let session = LanguageModelSession(model: .default, instructions: req.instructions)
    let response = try await session.respond(
      to: req.prompt,
      generating: CommandPlan.self,
      options: GenerationOptions(temperature: 0)
    )
    emitPlan(response.content, latencyMs: Int(Date().timeIntervalSince(startedAt) * 1000))
  } catch {
    Out.line(errorDict(error))
  }
}

await main()

#else
// FoundationModels not in this SDK.
Out.line(["ok": false, "reason": "frameworkMissing", "detail": "FoundationModels framework unavailable (needs macOS 26+ SDK)"])
#endif
