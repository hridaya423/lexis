import { installHooks, uninstallHooks, hooksDiff, SUPPORTED_SHELLS } from "../shell/install.mjs";
import { loadConfig, saveConfig } from "../config.mjs";
import { detectShell } from "../machine.mjs";

export async function hooksCommand(args) {
  const sub = args[0] || "status";
  const flags = parseFlags(args.slice(1));
  const shells = flags.options.shell ? String(flags.options.shell).split(",").map((s) => s.trim()) : null;
  const mode = ["auto", "lx"].includes(flags.options.mode) ? flags.options.mode : undefined;

  if (sub === "install") {
    const config = await loadConfig();
    const useMode = mode || config.execution?.hookMode || "auto";
    const result = await installHooks({ mode: useMode, shells });
    for (const item of result.results) {
      process.stdout.write(`${item.changed ? "updated" : "unchanged"} ${item.filePath}${item.error ? ` — ${item.error}` : ""}\n`);
    }
    config.execution.hookMode = useMode;
    await saveConfig(config);
    process.stdout.write(`Mode: ${useMode}. Open a new terminal to apply.\n`);
    return;
  }

  if (sub === "uninstall" || sub === "remove") {
    const result = await uninstallHooks({ shells });
    for (const item of result.results) {
      process.stdout.write(`${item.changed ? "removed from" : "unchanged"} ${item.filePath}\n`);
    }
    process.stdout.write("Hooks removed. Open a new terminal.\n");
    return;
  }

  if (sub === "diff") {
    const diffs = await hooksDiff({ mode: mode || "auto", shells });
    for (const d of diffs) {
      process.stdout.write(`\n=== ${d.file} (${d.shell}) ${d.alreadyInstalled ? "[installed]" : "[not installed]"} ===\n`);
      process.stdout.write(d.snippet);
    }
    return;
  }

  if (sub === "status") {
    const shell = detectShell();
    const diffs = await hooksDiff({ shells: [shell] });
    const installed = diffs.some((d) => d.alreadyInstalled);
    process.stdout.write(`Shell: ${shell}\nHooks: ${installed ? "installed" : "not installed"}\n`);
    for (const d of diffs) process.stdout.write(`  ${d.file} ${d.alreadyInstalled ? "(installed)" : ""}\n`);
    process.stdout.write(`Supported shells: ${SUPPORTED_SHELLS.join(", ")}\n`);
    return;
  }

  throw new Error("Usage: lx hooks <status|install|uninstall|diff> [--mode auto|lx] [--shell bash,zsh,fish,powershell]");
}

function parseFlags(args) {
  const options = {};
  for (let i = 0; i < args.length; i += 1) {
    if (!args[i].startsWith("--")) continue;
    const key = args[i].slice(2);
    const next = args[i + 1];
    if (!next || next.startsWith("--")) { options[key] = true; continue; }
    options[key] = next;
    i += 1;
  }
  return { options };
}
