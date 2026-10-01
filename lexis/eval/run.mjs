#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { loadConfig } from "../src/config.mjs";
import { loadSystemPrompt } from "../src/prompt.mjs";
import { generatePlan, estimateTimeoutMs, PLAIN_SYSTEM_PROMPT } from "../src/planner.mjs";
import { applyPolicyToPlan, RISK_SCORE } from "../src/policy.mjs";
import { PROVIDERS } from "../src/providers/index.mjs";
import { getMachine } from "../src/machine.mjs";
import { LLAMA_CPP_TAG } from "../src/runtime/llama-release.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const out = { provider: "llama-server", model: "", dataset: "core.jsonl", limit: 0, platform: null, repeat: 1, tag: "" };
  for (let i = 0; i < argv.length; i += 1) {
    const v = argv[i];
    if (v.startsWith("--")) out[v.slice(2)] = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
  }
  return out;
}

async function loadDataset(name) {
  const file = path.join(root, "datasets", name);
  const raw = await fs.readFile(file, "utf8");
  const lines = raw.split("\n").filter((l) => l.trim());
  const cases = lines.map((l, i) => {
    try {
      return JSON.parse(l);
    } catch (e) {
      throw new Error(`dataset line ${i + 1} invalid: ${e.message}`);
    }
  });
  return { cases, sha256: crypto.createHash("sha256").update(raw).digest("hex").slice(0, 16) };
}

function firstLine(text) {
  return String(text || "").split("\n").map((l) => l.trim()).filter((l) => l && !/^```/.test(l))[0] || "";
}

function commandShaped(cmd) {
  return /[\p{L}\p{N}$]/u.test(cmd);
}

function plainPlan(text, platform) {
  const command = firstLine(text);
  return {
    summary: "single command",
    overall_risk: "low",
    confidence: 0.8,
    requires_confirmation: false,
    commands: [{ command, intent: "single command", risk: "low", requires_confirmation: false, platform }],
  };
}

const STOPWORDS = new Set(["the","a","an","my","me","this","that","to","of","in","on","for","is","it","and","or","i","do","all","show","get","list","print","find","what","how"]);

function pickShots(intent, pool, k) {
  const words = new Set(intent.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => w && !STOPWORDS.has(w)));
  return pool
    .map((s) => {
      const sw = s.request.toLowerCase().split(/[^\p{L}\p{N}]+/u);
      return { s, score: sw.filter((w) => words.has(w)).length };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((x) => x.s);
}

function cmdHeads(cmd) {
  return cmd
    .split(/\|\||&&|\||;/)
    .map((seg) => seg.trim().split(/\s+/).filter((w) => !/^[A-Z_]+=/.test(w) && w !== "sudo" && w !== "env")[0])
    .filter(Boolean);
}

function missingBins(cmd) {
  let miss = 0;
  for (const head of cmdHeads(cmd)) {
    if (/^[/~.]|\(|\$/.test(head)) continue; // paths, subshells, expansions — not binaries
    try {
      execFileSync("bash", ["-c", `command -v -- ${JSON.stringify(head)}`], { stdio: "ignore" });
    } catch {
      miss += 1;
    }
  }
  return miss;
}

function syntaxBad(cmd) {
  try {
    execFileSync("bash", ["-n", "-c", cmd], { stdio: "ignore" });
    return false;
  } catch {
    return true;
  }
}

function meanLogprob(res) {
  const toks = res?.logprobs?.content;
  if (!Array.isArray(toks) || !toks.length) return null;
  return toks.reduce((a, t) => a + (t.logprob ?? 0), 0) / toks.length;
}

function scoreCandidate(text, res) {
  const cmd = firstLine(text);
  let score = meanLogprob(res) ?? 0;
  if (!commandShaped(cmd)) score -= 5;
  if (syntaxBad(cmd)) score -= 6;
  score -= 4 * missingBins(cmd);
  return score;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const providerImpl = PROVIDERS[args.provider];
  if (!providerImpl) throw new Error(`unknown provider ${args.provider}`);
  const plain = Boolean(args.plain);
  const repeat = Math.max(1, Number(args.repeat) || 1);

  const machine = getMachine();
  const config = await loadConfig();
  const model = args["model-file"] || args.model || (args.provider === "apple-fm" ? "apple-on-device" : config.model);
  if (args["model-file"] || args.model) config.model = model;
  const systemPrompt = plain
    ? (args["prompt-file"] ? await fs.readFile(args["prompt-file"], "utf8") : PLAIN_SYSTEM_PROMPT)
    : await loadSystemPrompt();
  const { cases, sha256: datasetHash } = await loadDataset(args.dataset);
  const shots = args["shots-file"] ? JSON.parse(await fs.readFile(args["shots-file"], "utf8")) : null;
  const shotPool = args["retrieve-file"] ? JSON.parse(await fs.readFile(args["retrieve-file"], "utf8")) : null;
  const retrieveK = Math.max(1, Number(args["retrieve-k"]) || 4);
  const bon = Math.max(0, Number(args.bon) || 0);
  const cascadeModel = args.cascade || null;
  const cascadeThresh = Number(args["cascade-thresh"] ?? -0.5);
  const sample = JSON.parse(args.sample || "{}");
  if (bon > 1 || cascadeModel) Object.assign(sample, { logprobs: true });
  const platform = args.platform === "windows" || args.platform === "unix" ? args.platform : (machine.platform === "win32" ? "windows" : "unix");
  const shell = args.platform === "windows" ? "powershell" : (args.platform === "unix" ? "sh" : machine.shell);

  const readyStart = Date.now();
  await providerImpl.ensureReady?.(config, { onProgress: (m) => process.stderr.write(`  ${m}\n`) });
  const startupMs = Date.now() - readyStart;

  const results = [];
  for (const [i, testCase] of cases.entries()) {
    if (args.limit && i >= Number(args.limit)) break;
    if (args.platform && testCase.platform && testCase.platform !== args.platform) continue;
    if (testCase.platform && testCase.platform !== "all" && testCase.platform !== platform && !testCase.allowCrossPlatform) continue;
    if (plain && testCase.plain === false) continue;
    const context = {
      platform,
      shell,
      os: args.platform === "windows" ? "Windows" : `${machine.platformName} ${machine.osRelease}`,
      cwd: process.cwd(),
    };

    const runs = [];
    let plan = null;
    let error = "";
    for (let rep = 0; rep < repeat; rep += 1) {
      const startedAt = Date.now();
      let usage = null;
      let timings = null;
      let outText = "";
      try {
        if (plain) {
          const suffix = args.bare ? "" : `\n(Platform: ${platform}, shell: ${shell})`;
          const up = args.re2
            ? `${testCase.intent}\nRead the request again: ${testCase.intent}${suffix}`
            : `${testCase.intent}${suffix}`;
          const caseShots = shotPool ? pickShots(testCase.intent, shotPool, retrieveK) : shots;
          const genOnce = (mdl, temp) => providerImpl.plan(
            { systemPrompt, userPrompt: up, model: mdl, maxTokens: 80, timeoutMs: estimateTimeoutMs(mdl), raw: true, shots: caseShots, temperature: temp, sample },
            { config }
          );
          const votes = Math.max(1, Number(args.vote) || 1);
          if (bon > 1) {
            const cands = [];
            for (let v = 0; v < bon; v += 1) {
              const r = await genOnce(model, Number(args.temp) || 0.4);
              cands.push({ text: r?.text || "", res: r, score: scoreCandidate(r?.text, r) });
            }
            cands.sort((a, b) => b.score - a.score);
            const best = cands[0];
            if (cascadeModel && (meanLogprob(best.res) ?? -9) < cascadeThresh) {
              const r2 = await genOnce(cascadeModel, 0);
              best.text = r2?.text || "";
            }
            outText = best.text;
            plan = plainPlan(outText, platform);
          } else if (votes > 1) {
            const counts = new Map();
            for (let v = 0; v < votes; v += 1) {
              const r = await genOnce(model, Number(args.temp) || 0.5);
              const cmd = plainPlan(r?.text || "", platform).commands[0].command;
              counts.set(cmd, (counts.get(cmd) || 0) + 1);
            }
            const winner = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
            plan = plainPlan(winner, platform);
            outText = winner;
          } else {
            let res = await genOnce(model, 0);
            if (cascadeModel && (meanLogprob(res) ?? -9) < cascadeThresh) {
              res = await genOnce(cascadeModel, 0);
            } else if (!commandShaped(firstLine(res?.text))) {
              res = await genOnce(model, 0.4);
            }
            outText = res?.text || "";
            usage = res?.usage;
            timings = res?.timings;
            plan = plainPlan(outText, platform);
          }
        } else {
          plan = await generatePlan({
            providerImpl,
            providerId: args.provider,
            model,
            systemPrompt,
            userPrompt: testCase.intent,
            context,
            webContext: [],
            config,
            timeoutMs: estimateTimeoutMs(model),
            onResult: (r) => { usage = r.usage; timings = r.timings; },
          });
        }
      } catch (e) {
        error = e.message;
      }
      runs.push({ latencyMs: Date.now() - startedAt, usage, timings, rep });
      if (error) break;
    }

    let commands = [];
    let checks = {};
    let policyFloor = null;
    try {
    commands = plan?.commands?.map((c) => c.command) || [];
    const expect = testCase.expect || {};
    const joined = commands.join(" ; ");

    checks = {
      jsonValid: Boolean(plan),
      anyMatch: expect.anyOfRegex ? expect.anyOfRegex.some((re) => new RegExp(re, "i").test(joined)) : true,
      noForbidden: expect.mustNotMatch ? !expect.mustNotMatch.some((re) => new RegExp(re, "i").test(joined)) : true,
      commandCountOk: commands.length > 0 && commands.length <= (expect.maxCommands || 6),
    };

            if (expect.platforms && plan) {
      checks.platformOk = plan.commands.every((c) => {
        const p = String(c.platform || "all");
        return p === "all" || expect.platforms.includes(p);
      });
    }

    if (plan) {
      const pol = applyPolicyToPlan(plan, { shell });
      policyFloor = pol.maxRisk;
      if (expect.expectedRiskAtLeast) {
        checks.riskFloor = RISK_SCORE[pol.maxRisk] >= RISK_SCORE[expect.expectedRiskAtLeast];
      }
      if (expect.readonly !== undefined) {
        checks.readonly = pol.readonly === expect.readonly;
      }
    }
    } catch (e) {
                  error = error || `harness: ${e.message}`;
      checks.harnessOk = false;
    }

    const pass = Object.values(checks).every(Boolean) && !error;
    const latencies = runs.map((r) => r.latencyMs);
    results.push({
      id: testCase.id,
      intent: testCase.intent,
      pass,
      error,
      coldMs: latencies[0] ?? null,
      warmMs: latencies.slice(1),
      usage: runs[runs.length - 1]?.usage || null,
      timings: runs[runs.length - 1]?.timings || null,
      commands,
      risk: plan?.overall_risk,
      policyFloor,
      checks,
      confidence: plan?.confidence,
    });
    process.stderr.write(`${pass ? "✓" : "✗"} ${testCase.id} (${latencies.join(",")}ms)\n`);
  }

  const passed = results.filter((r) => r.pass).length;
  const cold = results.map((r) => r.coldMs).filter((v) => v != null).sort((a, b) => a - b);
  const warm = results.flatMap((r) => r.warmMs).sort((a, b) => a - b);
  const pick = (arr, q) => arr[Math.min(arr.length - 1, Math.floor(arr.length * q))] || 0;

  const report = {
    provider: args.provider,
    model,
    mode: plain ? "plain" : "schema",
    tag: args.tag || null,
    dataset: { name: args.dataset, sha256: datasetHash },
    runtime: args.provider === "llama-server" ? { llamaCppTag: LLAMA_CPP_TAG } : null,
    machine: {
      platform: machine.platformName, arch: machine.arch, ramGb: machine.totalMemoryGb,
      shell, gpu: machine.gpu,
    },
    ts: new Date().toISOString(),
    startupMs,
    repeat,
    total: results.length,
    passed,
    passRate: results.length ? passed / results.length : 0,
    coldP50Ms: pick(cold, 0.5),
    coldP95Ms: pick(cold, 0.95),
    warmP50Ms: pick(warm, 0.5),
    warmP95Ms: pick(warm, 0.95),
    results,
  };

  const reportsDir = path.join(root, "reports");
  await fs.mkdir(reportsDir, { recursive: true });
  const modelLabel = String(model || "default").split(/[\\/]/).pop().replace(/\.gguf$/i, "") || "default";
  const base = `${args.provider}-${modelLabel.replace(/[^\w.-]/g, "_").slice(0, 60)}${args.tag ? `-${args.tag}` : ""}-${Date.now()}`;
  await fs.writeFile(path.join(reportsDir, `${base}.json`), JSON.stringify(report, null, 2), "utf8");
  await fs.writeFile(
    path.join(reportsDir, `${base}.md`),
    [
      `# eval: ${args.provider} / ${model}${args.tag ? ` (${args.tag})` : ""}`,
      `- mode: ${report.mode} · dataset ${args.dataset}#${datasetHash} · repeat ${repeat}`,
      `- pass: ${passed}/${results.length} (${Math.round(report.passRate * 100)}%)`,
      `- cold p50 ${report.coldP50Ms}ms p95 ${report.coldP95Ms}ms · warm p50 ${report.warmP50Ms}ms p95 ${report.warmP95Ms}ms`,
      "",
      "| case | pass | cold ms | warm ms | commands |",
      "| --- | --- | --- | --- | --- |",
      ...results.map((r) => `| ${r.id} | ${r.pass ? "✓" : "✗"} | ${r.coldMs ?? "-"} | ${r.warmMs.join(",") || "-"} | ${(r.commands.join(" ; ") || "-").slice(0, 80)} |`),
      "",
    ].join("\n"),
    "utf8"
  );

  process.stdout.write(`\n${passed}/${results.length} passed (${Math.round(report.passRate * 100)}%)  cold p50=${report.coldP50Ms}ms  warm p50=${report.warmP50Ms}ms\n`);
  process.stdout.write(`Report: eval/reports/${base}.{json,md}\n`);
  process.exit(passed === results.length ? 0 : 1);
}

main().catch((e) => {
  process.stderr.write(`eval: ${e.message}\n`);
  process.exit(1);
});
