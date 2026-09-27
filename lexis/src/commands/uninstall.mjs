import fs from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import { spawn } from "node:child_process";
import { loadManifest } from "../manifest.mjs";
import { uninstallHooks } from "../shell/install.mjs";
import { stopServer } from "../runtime/supervisor.mjs";
import { configDir, dataDir, cacheDir, legacyVenvDir, modelHistoryPath } from "../paths.mjs";

export async function uninstallCommand(args) {
  const yes = args.includes("--yes") || args.includes("-y");
  const keepNpm = args.includes("--keep-npm");

  if (!yes) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
      const answer = (await rl.question("Uninstall Lexis and remove its files? [y/N] ")).trim().toLowerCase();
      if (!/^y(es)?$/i.test(answer)) {
        process.stdout.write("Aborted.\n");
        return;
      }
    } finally {
      rl.close();
    }
  }

  process.stdout.write("Stopping model server...\n");
  await stopServer();

  process.stdout.write("Removing shell hooks...\n");
  const hookResults = await uninstallHooks();
  for (const r of hookResults.results) {
    if (r.changed) process.stdout.write(`  cleaned ${r.filePath}\n`);
  }

  const manifest = await loadManifest();
  process.stdout.write("Removing owned files...\n");
  const owned = [
    ...manifest.files,
    ...manifest.dirs,
    runtimeDirSafe(),
    legacyVenvDir(),
  ].filter(Boolean);
  for (const target of owned) {
    const p = typeof target === "string" ? target : target?.path;
    if (!p) continue;
    try {
      await fs.rm(p, { recursive: true, force: true });
      process.stdout.write(`  removed ${p}\n`);
    } catch (e) {
      process.stdout.write(`  failed ${p}: ${e.message}\n`);
    }
  }

  for (const legacy of [modelHistoryPath(), path.join(cacheDir(), "web-search")]) {
    try {
      await fs.rm(legacy, { recursive: true, force: true });
    } catch {}
  }

  process.stdout.write("Removing config and data directories...\n");
  for (const dir of [configDir(), dataDir(), cacheDir()]) {
    try {
      await fs.rm(dir, { recursive: true, force: true });
      process.stdout.write(`  removed ${dir}\n`);
    } catch (e) {
      process.stdout.write(`  failed ${dir}: ${e.message}\n`);
    }
  }

  if (!keepNpm) {
    process.stdout.write("Removing global npm package...\n");
    const code = await run("npm", ["uninstall", "-g", "@hridyacodes/lexis"]);
    process.stdout.write(code === 0 ? "  done\n" : "  npm uninstall returned non-zero — remove manually if needed\n");
  }

  process.stdout.write("Uninstall complete. Open a new terminal.\n");
}

function runtimeDirSafe() {
  return path.join(dataDir(), "runtime");
}

function run(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: "inherit", windowsHide: true });
    child.on("error", () => resolve(1));
    child.on("exit", (c) => resolve(c ?? 1));
  });
}
