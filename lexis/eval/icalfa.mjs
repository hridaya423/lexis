#!/usr/bin/env node
// InterCode-ALFA-style external eval: nl -> command (production planner) ->
// execute model cmd + golds in fresh WSL fixtures on win-pc, compare outputs.
// usage: icalfa.mjs --model <id> [--limit 100] [--provider llama-server]
//        [--ssh win-pc] [--host-wsl]   (--host-wsl = run in local docker instead)

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { generatePlan, estimateTimeoutMs, PLAIN_SYSTEM_PROMPT } from "../src/planner.mjs";
import { PROVIDERS } from "../src/providers/index.mjs";
import { getMachine } from "../src/machine.mjs";

const run = promisify(execFile);
const root = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) =>
  a.startsWith("--") ? [a.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : true] : [a, true]));
const MODEL = args.model || "kitty-bash-0.5b";
const LIMIT = Number(args.limit || 100);
const SSH = args.ssh || "win-pc";
const LOCAL = Boolean(args["host-wsl"]); // fallback: local docker lxverify
const CONC = 8;

const FIXTURE = `d=$(mktemp -d); cd "$d"; mkdir -p sub "dir with space"; ` +
  `printf 'alpha\\nBeta\\nerror line\\nlast\\n' > a.txt; ` +
  `printf 'x\\ny\\n' > sub/b.csv; touch "my file.txt" c.log; `;

async function execRemote(cmd) {
  const script = `set -o pipefail; ${FIXTURE}${cmd.replace(/'/g, `'\\''`)}`;
  if (LOCAL) {
    try {
      const r = await run("docker", ["exec", "lxverify", "bash", "-c", script], { timeout: 15000, maxBuffer: 4 << 20 });
      return { exit: 0, out: r.stdout };
    } catch (e) { return { exit: e.code ?? -1, out: e.stdout || "", err: e.stderr || "" }; }
  }
  try {
    const r = await run("ssh", ["-o", "ConnectTimeout=8", "-o", "BatchMode=yes", SSH,
      `wsl -e bash -c '${script.replace(/'/g, `'\\''`)}'`], { timeout: 25000, maxBuffer: 4 << 20 });
    return { exit: 0, out: r.stdout };
  } catch (e) { return { exit: e.code ?? -1, out: e.stdout || "", err: e.stderr || "" }; }
}

const normOut = (s) => (s || "").trim().replace(/\s+/g, " ").replace(/\d{4}-\d{2}-\d{2}[T ]\S*/g, "TS");

async function main() {
  const { execSync } = await import("node:child_process");
  // fetch test split once via python/datasets -> jsonl cache
  const cache = path.join(os.homedir(), "lx-data", "alfa-test.jsonl");
  if (!fs.existsSync(cache)) {
    execSync(`uv run --with datasets python -c "
import json
from datasets import load_dataset
ds = load_dataset('westenfelder/NL2SH-ALFA', 'test', split='train')
with open('${cache}','w') as f:
    for r in ds: f.write(json.dumps(r)+'\\n')
print('cached')"`, { cwd: path.join(root, ".."), stdio: "inherit" });
  }
  const rows = fs.readFileSync(cache, "utf8").split("\n").filter(Boolean).map(JSON.parse).slice(0, LIMIT);

  const providerImpl = PROVIDERS[args.provider || "llama-server"];
  const config = {};
  await providerImpl.ensureReady?.(config, { onProgress: (m) => process.stderr.write(`  ${m}\n`) });
  const machine = getMachine();
  const context = { platform: "unix", shell: "bash", machine };
  const prodEntry = { format: "plain", platforms: ["unix", "windows"], dialectHint: true, webContext: false, shots: true };

  let pass = 0, fail = 0, exact = 0;
  const fails = [];
  const todo = rows.map((r, i) => [r, i]);
  async function worker() {
    while (todo.length) {
      const [r, i] = todo.pop();
      let gen;
      try {
        const res = await generatePlan({
          providerImpl, providerId: "llama-server", model: MODEL,
          systemPrompt: PLAIN_SYSTEM_PROMPT, userPrompt: r.nl,
          context, webContext: [], config, timeoutMs: estimateTimeoutMs(MODEL),
          entry: prodEntry,
        });
        gen = res?.commands?.[0]?.command || "";
      } catch (e) { gen = `__gen_err:${e.message}`; }
      if (!gen || gen.startsWith("__gen_err")) { fail++; fails.push({ i, nl: r.nl, gen, why: "gen" }); continue; }
      if (gen === r.bash || gen === r.bash2) { pass++; exact++; continue; }
      // execution equivalence
      const [g, g1, g2] = await Promise.all([execRemote(gen), execRemote(r.bash), execRemote(r.bash2 || r.bash)]);
      const ok = (normOut(g.out) && normOut(g.out) === normOut(g1.out)) || normOut(g.out) === normOut(g2.out);
      if (ok) pass++; else { fail++; fails.push({ i, nl: r.nl, gen, gold: r.bash, gout: normOut(g.out).slice(0, 80), eout: normOut(g1.out).slice(0, 80) }); }
      if ((pass + fail) % 25 === 0) process.stderr.write(`  ${pass + fail}/${rows.length} pass=${pass}\n`);
    }
  }
  await Promise.all(Array.from({ length: CONC }, worker));
  const acc = pass / (pass + fail);
  console.log(JSON.stringify({ model: MODEL, n: pass + fail, pass, fail, exact, execEq: pass - exact, acc: +acc.toFixed(4) }));
  fs.writeFileSync(path.join(root, "reports", `icalfa-${MODEL}-${Date.now()}.json`),
    JSON.stringify({ acc, pass, fail, exact, fails }, null, 1));
}

main().catch((e) => { console.error(e); process.exit(1); });
