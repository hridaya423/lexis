import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { generatePlan, estimateMaxTokens, estimateTimeoutMs } from "../src/planner.mjs";
import { PLAN_JSON_SCHEMA } from "../src/plan-schema.mjs";

const VALID_PLAN = {
  summary: "show version",
  overall_risk: "low",
  confidence: 0.9,
  requires_confirmation: false,
  commands: [{ command: "node --version", intent: "show node version", risk: "low", requires_confirmation: false, platform: "all" }],
};

function fakeServer(handler) {
  return new Promise((resolve) => {
    const srv = http.createServer(handler);
    srv.listen(0, "127.0.0.1", () => resolve({ srv, port: srv.address().port }));
  });
}

test("planner returns validated plan from a fake OpenAI-compatible server", async () => {
  let sawSchema = false;
  const { srv, port } = await fakeServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      const parsed = JSON.parse(body);
      if (parsed.response_format?.json_schema?.schema) sawSchema = true;
      res.end(JSON.stringify({ choices: [{ message: { content: JSON.stringify(VALID_PLAN) } }] }));
    });
  });
  try {
    const impl = {
      capabilities: { structuredOutput: true },
      plan: async (req) => {
        const res = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            model: "lexis",
            stream: false,
            response_format: { type: "json_schema", json_schema: { name: PLAN_JSON_SCHEMA.name, schema: PLAN_JSON_SCHEMA.schema } },
            messages: [
              { role: "system", content: req.systemPrompt },
              { role: "user", content: req.userPrompt },
            ],
          }),
        });
        const payload = await res.json();
        return { text: payload.choices[0].message.content };
      },
    };
    const result = await generatePlan({
      providerImpl: impl,
      providerId: "llama-server",
      model: "qwen2.5-coder-3b",
      systemPrompt: "sys",
      userPrompt: "show node version",
      context: { platform: "unix", shell: "zsh", cwd: "/" },
      config: {},
      timeoutMs: 10000,
    });
    assert.equal(result.summary, "show version");
    assert.ok(sawSchema, "request must carry json_schema");
  } finally {
    srv.close();
  }
});

test("planner retries once for unstructured providers, then fails", async () => {
  let calls = 0;
  const impl = {
    capabilities: { structuredOutput: false },
    plan: async () => { calls += 1; return { text: "not json at all" }; },
  };
  await assert.rejects(
    generatePlan({ providerImpl: impl, providerId: "openai-compat", model: "m", systemPrompt: "s", userPrompt: "x", context: { platform: "unix", shell: "zsh", cwd: "/" }, config: {}, timeoutMs: 5000 }),
    /JSON|json|parse/i
  );
  assert.equal(calls, 2);
});

test("structured provider gets no retry on invalid output", async () => {
  let calls = 0;
  const impl = {
    capabilities: { structuredOutput: true },
    plan: async () => { calls += 1; return { text: "garbage" }; },
  };
  await assert.rejects(
    generatePlan({ providerImpl: impl, providerId: "llama-server", model: "m", systemPrompt: "s", userPrompt: "x", context: { platform: "unix", shell: "zsh", cwd: "/" }, config: {}, timeoutMs: 5000 })
  );
  assert.equal(calls, 1);
});

test("max token estimate scales with prompt complexity", () => {
  assert.ok(estimateMaxTokens("ls", []) <= estimateMaxTokens("a much longer prompt and then also do this and that and more", []));
  assert.ok(estimateMaxTokens("x", []) >= 200);
});

test("timeout estimate follows model size", () => {
  assert.ok(estimateTimeoutMs("kitty-bash-0.5b") <= estimateTimeoutMs("qwen3-linuxcmd-4b"));
});

test("plain-format catalog model wraps a bare command deterministically", async () => {
  const calls = [];
  const impl = {
    capabilities: { structuredOutput: true },
    plan: async (req) => {
      calls.push(req);
      return { text: "rm -rf ~\n" };
    },
  };
  const plan = await generatePlan({
    providerImpl: impl,
    providerId: "llama-server",
    model: "qwen3-linuxcmd-4b",
    systemPrompt: "s",
    userPrompt: "delete my home dir",
    context: { platform: "unix", shell: "zsh", cwd: "/" },
    config: {},
    timeoutMs: 5000,
  });
  assert.equal(plan.commands.length, 1);
  assert.equal(plan.commands[0].command, "rm -rf ~");
  assert.equal(calls[0].raw, true);
  assert.equal(calls[0].maxTokens, estimateMaxTokens("delete my home dir"));
  const { applyPolicyToPlan } = await import("../src/policy.mjs");
  applyPolicyToPlan(plan, { shell: "zsh" });
  assert.equal(plan.commands[0].requires_confirmation, true);
  assert.equal(plan.overall_risk, "critical");
});

test("plain prompt carries a Reference block when web context exists", async () => {
  const calls = [];
  const impl = { capabilities: {}, plan: async (req) => { calls.push(req); return { text: "brew install jq\n" }; } };
  await generatePlan({
    providerImpl: impl,
    providerId: "llama-server",
    model: "qwen3-linuxcmd-4b",
    systemPrompt: "s",
    userPrompt: "install jq",
    context: { platform: "unix", shell: "zsh", cwd: "/" },
    webContext: [{ title: "jq formula", url: "https://formulae.brew.sh/formula/jq", content: "brew install jq" }],
    config: {},
    timeoutMs: 5000,
  });
  assert.match(calls[0].userPrompt, /Reference: jq formula — https:\/\/formulae\.brew\.sh\/formula\/jq/);
  assert.match(calls[0].userPrompt, /\(Platform: unix, shell: zsh\)/);
});

test("webContext:false models never see the Reference block", async () => {
  const calls = [];
  const impl = { capabilities: {}, plan: async (req) => { calls.push(req); return { text: "brew install jq\n" }; } };
  await generatePlan({
    providerImpl: impl,
    providerId: "llama-server",
    model: "kitty-bash-0.5b",
    systemPrompt: "s",
    userPrompt: "install jq",
    context: { platform: "unix", shell: "zsh", cwd: "/" },
    webContext: [{ title: "jq formula", url: "https://formulae.brew.sh/formula/jq", content: "brew install jq" }],
    config: {},
    timeoutMs: 5000,
  });
  assert.doesNotMatch(calls[0].userPrompt, /Reference:/);
});

test("cross-platform plain model (qwen3-linuxcmd-4b) runs on Windows", async () => {
  const impl = { capabilities: {}, plan: async () => ({ text: "Get-ChildItem\n" }) };
  const plan = await generatePlan({
    providerImpl: impl,
    providerId: "llama-server",
    model: "qwen3-linuxcmd-4b",
    systemPrompt: "s",
    userPrompt: "list files",
    context: { platform: "windows", shell: "powershell", cwd: "/" },
    config: {},
    timeoutMs: 5000,
  });
  assert.equal(plan.commands[0].command, "Get-ChildItem");
  assert.equal(plan.commands[0].platform, "windows");
});

test("unix-only plain model (kitty-bash-0.5b) refuses on Windows", async () => {
  const impl = { capabilities: {}, plan: async () => ({ text: "ls" }) };
  await assert.rejects(
    generatePlan({
      providerImpl: impl,
      providerId: "llama-server",
      model: "kitty-bash-0.5b",
      systemPrompt: "s",
      userPrompt: "x",
      context: { platform: "windows", shell: "powershell", cwd: "/" },
      config: {},
      timeoutMs: 5000,
    }),
    /unix single commands/
  );
});

test("buildChatBody: no grammar, json schema for structured", async () => {
  const { buildChatBody } = await import("../src/providers/llama-server.mjs");
  const raw = buildChatBody({ systemPrompt: "s", userPrompt: "u", maxTokens: 64, raw: true });
  assert.equal(raw.grammar, undefined);
  assert.equal(raw.response_format, undefined);
  const structured = buildChatBody({ systemPrompt: "s", userPrompt: "u", maxTokens: 400, raw: false });
  assert.equal(structured.grammar, undefined);
  assert.equal(structured.response_format?.json_schema?.name, PLAN_JSON_SCHEMA.name);
});
