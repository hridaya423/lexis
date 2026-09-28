import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { snippetsDir } from "../paths.mjs";
import { detectShell } from "../machine.mjs";
import { recordManifestEntry, loadManifest } from "../manifest.mjs";

export const MARKERS = {
  start: "# >>> lexis >>>",
  end: "# <<< lexis <<<",
};

export const SUPPORTED_SHELLS = ["bash", "zsh", "fish", "powershell"];

const SNIPPET_FILES = {
  "bash:auto": "bash.sh", "bash:lx": "bash.lx.sh",
  "zsh:auto": "zsh.zsh", "zsh:lx": "zsh.lx.zsh",
  "fish:auto": "fish.fish", "fish:lx": "fish.lx.fish",
  "powershell:auto": "powershell.ps1", "powershell:lx": "powershell.lx.ps1",
};

export function rcFilesForShell(shell) {
  const home = os.homedir();
  if (shell === "bash") return [path.join(home, ".bashrc")];
  if (shell === "zsh") return [path.join(home, ".zshrc")];
  if (shell === "fish") return [path.join(home, ".config", "fish", "config.fish")];
  if (shell === "powershell") {
    if (process.platform === "win32") {
      const docs = path.join(os.homedir(), "Documents");
      return [
        path.join(docs, "PowerShell", "Microsoft.PowerShell_profile.ps1"),
        path.join(docs, "WindowsPowerShell", "Microsoft.PowerShell_profile.ps1"),
      ];
    }
    return [path.join(home, ".config", "powershell", "Microsoft.PowerShell_profile.ps1")];
  }
  return [];
}

export async function readSnippet(shell, mode) {
  const file = SNIPPET_FILES[`${shell}:${mode}`];
  if (!file) throw new Error(`No snippet for ${shell}:${mode}`);
  return fs.readFile(path.join(snippetsDir(), file), "utf8");
}

export async function installHooks({ mode = "auto", shells } = {}) {
  const targetShells = shells?.length ? shells : [detectShell()];
  const results = [];
  for (const shell of targetShells) {
    if (!SUPPORTED_SHELLS.includes(shell)) {
      results.push({ filePath: shell, changed: false, error: `unsupported shell '${shell}'` });
      continue;
    }
    const snippet = await readSnippet(shell, mode);
    for (const rcFile of rcFilesForShell(shell)) {
      results.push(await writeSnippet(rcFile, snippet, shell));
    }
  }
  return { results, mode };
}

export async function uninstallHooks({ shells } = {}) {
  const manifest = await loadManifest();
  const knownRc = manifest.rcFiles.map((r) => (typeof r === "string" ? r : r.path));
  const targets = shells?.length
    ? shells.flatMap((s) => rcFilesForShell(s))
    : unique([...knownRc, ...SUPPORTED_SHELLS.flatMap((s) => rcFilesForShell(s))]);
  const results = [];
  for (const filePath of targets) {
    results.push(await stripSnippet(filePath));
  }
  return { results };
}

export async function hooksDiff({ mode = "auto", shells } = {}) {
  const targetShells = shells?.length ? shells : [detectShell()];
  const out = [];
  for (const shell of targetShells) {
    const snippet = await readSnippet(shell, mode);
    for (const rcFile of rcFilesForShell(shell)) {
      const current = await readMaybe(rcFile);
      out.push({
        file: rcFile,
        shell,
        alreadyInstalled: current.includes(MARKERS.start),
        snippet,
      });
    }
  }
  return out;
}

async function writeSnippet(filePath, snippet, shell) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const existing = await readMaybe(filePath);
  const cleaned = stripBlocks(existing).replace(/\n+$/g, "");
  if (existing.includes(MARKERS.start) && existing.includes(snippet)) {
    return { filePath, shell, changed: false };
  }
  const eol = existing.includes("\r\n") ? "\r\n" : "\n";
  const body = snippet.trim().replace(/\n/g, eol);
  const separator = cleaned.length > 0 ? `${eol}${eol}` : "";
  await fs.writeFile(filePath, `${cleaned}${separator}${body}${eol}`, "utf8");
  await recordManifestEntry("rcFiles", { path: filePath, shell });
  return { filePath, shell, changed: true };
}

async function stripSnippet(filePath) {
  const existing = await readMaybe(filePath);
  if (!existing.length) {
    return { filePath, changed: false };
  }
  const stripped = stripBlocks(existing).replace(/\n{3,}/g, "\n\n").replace(/\n+$/g, "") + "\n";
  if (stripped === existing) {
    return { filePath, changed: false };
  }
  await fs.writeFile(filePath, stripped, "utf8");
  return { filePath, changed: true };
}

function stripBlocks(content) {
  const pattern = new RegExp(`${escapeRegex(MARKERS.start)}[\\s\\S]*?${escapeRegex(MARKERS.end)}\\n?`, "g");
  return content.replace(pattern, "");
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function readMaybe(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return "";
  }
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}
