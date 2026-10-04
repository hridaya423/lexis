// Remembered approvals: "always allow <command family> in this folder".
// A family is the head + its first bare-word subcommand per pipeline segment
// (`npm run`, `git push`, `rm`). A command auto-runs when every segment's family
// was remembered for the current cwd and the analysis stays <= moderate.
import fs from "node:fs";
import path from "node:path";
import { configDir } from "./paths.mjs";
import { analyzeCommand, splitCommandLine, segmentHead, RISK_SCORE } from "./policy.mjs";

function file() {
  return path.join(configDir(), "approvals.json");
}

export function loadApprovals() {
  try {
    const d = JSON.parse(fs.readFileSync(file(), "utf8"));
    return Array.isArray(d.entries) ? d.entries : [];
  } catch {
    return [];
  }
}

export function saveApprovals(entries) {
  const f = file();
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify({ entries }, null, 1) + "\n");
}

// heads whose first bare word is a subcommand, not a filename
const SUBCOMMAND_HEADS = new Set([
  "git", "docker", "kubectl", "systemctl", "npm", "npx", "pnpm", "yarn", "bun", "node",
  "brew", "apt", "apt-get", "dnf", "yum", "pacman", "zypper", "apk", "snap", "flatpak",
  "winget", "choco", "scoop", "pip", "pip3", "gem", "cargo", "go", "gh", "aws", "az",
  "gcloud", "ollama", "launchctl", "diskutil", "networksetup", "scutil", "dscl",
  "defaults", "pmset", "xattr", "codesign", "hdiutil", "ipconfig", "route", "ip",
  "netsh", "schtasks", "reg", "powercfg", "tzutil", "journalctl", "resolvectl",
  "loginctl", "hostnamectl", "timedatectl", "xcode-select", "xcrun", "ffmpeg",
  "service", "sysctl", "softwareupdate", "launchctl", "mas", "vagrant", "tmux",
]);

export function commandFamilies(command, { shell = "sh" } = {}) {
  const fams = [];
  for (const seg of splitCommandLine(command)) {
    const { head, args } = segmentHead(seg);
    if (!head) return null;
    const first = (args.match(/("[^"]*"|'[^']*'|\S+)/g) || [""])[0].replace(/^["']|["']$/g, "");
    fams.push(SUBCOMMAND_HEADS.has(head) && /^[a-z][a-z0-9-]{0,20}$/i.test(first) ? `${head} ${first.toLowerCase()}` : head);
  }
  return fams;
}

// "npm run" covers `npm run test`, `npm run build`… but family must still pass
// the risk gate below on every future match.
export function rememberedMatch(commands, { shell = "sh", cwd = process.cwd() } = {}) {
  const remembered = new Set(loadApprovals().filter((e) => e.cwd === cwd).map((e) => e.family));
  if (!remembered.size) return null;
  for (const cmd of commands) {
    const a = analyzeCommand(cmd, { shell });
    if (a.risk === "critical" || RISK_SCORE[a.risk] > RISK_SCORE.moderate) return null;
    if (a.tags.includes("elevated") || a.tags.includes("remote-or-encoded")) return null;
    const fams = commandFamilies(cmd, { shell });
    if (!fams || fams.some((f) => !remembered.has(f))) return null;
  }
  return true;
}

export function remember(commands, { shell = "sh", cwd = process.cwd() } = {}) {
  const entries = loadApprovals();
  const fams = [...new Set(commands.flatMap((c) => commandFamilies(c, { shell }) || []))];
  const seen = new Set(entries.map((e) => `${e.cwd}${e.family}`));
  for (const f of fams) {
    if (seen.has(`${cwd}${f}`)) continue;
    entries.push({ family: f, cwd, example: commands[0], ts: Date.now() });
  }
  saveApprovals(entries);
  return fams;
}
