import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pkg = require("../../package.json");

async function latestVersion() {
  try {
    const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(pkg.name)}/latest`, {
      signal: AbortSignal.timeout(10000),
      headers: { accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()).version || null;
  } catch {
    return null;
  }
}

function isNewer(a, b) {
  const pa = a.split(/[.-]/).map((n) => parseInt(n, 10) || 0);
  const pb = b.split(/[.-]/).map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) > (pb[i] || 0);
  }
  return false;
}

export async function updateCommand() {
  const current = pkg.version;
  process.stdout.write(`lexis ${current}\nChecking npm for updates...\n`);
  const latest = await latestVersion();
  if (!latest) {
    process.stderr.write("Could not reach the npm registry. Try again later.\n");
    process.exitCode = 1;
    return;
  }
  if (!isNewer(latest, current)) {
    process.stdout.write(latest === current ? "Already up to date.\n" : `Local ${current} is ahead of published ${latest} — nothing to do.\n`);
    return;
  }
  process.stdout.write(`Updating ${current} → ${latest}...\n`);
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const code = await new Promise((resolve) => {
    const child = spawn(npm, ["install", "-g", `${pkg.name}@latest`], { stdio: "inherit" });
    child.on("error", () => resolve(1));
    child.on("exit", resolve);
  });
  if (code === 0) {
    process.stdout.write(`Updated to ${latest}. Restart your terminal to pick up the new version.\n`);
  } else {
    process.stderr.write(`npm install failed — update manually:\n  npm install -g ${pkg.name}@latest\n`);
    process.exitCode = 1;
  }
}
