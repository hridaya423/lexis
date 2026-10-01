import fsSync from "node:fs";
import path from "node:path";

export const RISK_LEVELS = ["low", "moderate", "high", "critical"];
export const RISK_SCORE = { low: 0, moderate: 1, high: 2, critical: 3 };

const READONLY_HEADS_UNIX = new Set([
  "ls", "ll", "cat", "head", "tail", "less", "more", "pwd", "whoami", "id",
  "which", "whereis", "type", "file", "stat", "echo", "printf", "true", "uname",
  "env", "printenv", "date", "cal", "hostname", "uptime", "w", "last", "who",
  "df", "du", "free", "lsof", "netstat", "ss", "ps", "pgrep", "top", "htop",
  "sw_vers", "system_profiler", "sysctlbyname", "mdfind", "plutil",
  "command", "history", "man", "apropos", "tldr", "wc", "grep",
  "egrep", "fgrep", "rg", "fd", "find", "tree", "awk",
  "readlink", "realpath", "dirname", "basename", "locate", "strings",
  "zcat", "dmesg", "lastlog",
  "sort", "uniq", "cut", "tr", "diff", "cmp", "md5", "md5sum", "shasum",
  "sha256sum", "base64", "xxd", "od", "hexdump", "jq", "yq", "pbcopy",
  "pbpaste", "mdls", "ioreg", "iostat", "vm_stat", "memory_pressure",
  "locale", "kextstat", "nvram",
  "nproc", "arch", "getconf", "lsb_release", "os-release", "ip", "ifconfig",
  "ping", "traceroute", "nslookup", "dig", "host", "route", "arp",
  "lsblk", "lsusb", "lspci", "blkid",
]);

const READONLY_HEADS_WINDOWS = new Set([
  "get-childitem", "gci", "dir", "ls", "get-content", "gc", "type", "cat",
  "get-process", "gps", "ps", "get-command", "gcm", "get-item", "gi",
  "get-location", "gl", "pwd", "get-host", "get-date", "get-history",
  "get-service", "gsv", "get-psdrive", "get-volume", "get-disk",
  "get-netipaddress", "get-netadapter", "test-connection", "resolve-dnsname",
  "get-computerinfo", "get-ciminstance", "get-wmiobject", "get-localuser",
  "get-localgroup", "get-childitem env:", "echo", "write-output",
  "whoami", "hostname", "ipconfig", "systeminfo", "tasklist", "where",
  "ver", "set", "driverquery", "get-executionpolicy", "measure-command",
]);

const READONLY_SUBCOMMANDS = {
  git: new Set([
    "status", "log", "diff", "show", "rev-parse",
    "ls-files", "ls-tree", "blame", "describe", "shortlog",
    "config --get", "config --list", "version", "help",
    "=tag", "tag -l", "tag --list", "tag --points-at",
    "=branch", "branch -l", "branch --list", "branch -a", "branch -v", "branch -r", "branch --show-current",
    "=remote", "remote -v", "remote get-url", "remote show",
    "stash list", "stash show", "stash diff",
  ]),
    node: new Set(["--version", "-v", "--help"]),
  npm: new Set(["--version", "-v", "list", "ls", "view", "info", "search", "outdated", "=audit", "audit signatures", "config get", "prefix", "root", "whoami", "doctor", "help", "explain", "why"]),
  npx: new Set(["--version", "-v"]),
  pnpm: new Set(["--version", "-v", "list", "ls", "outdated", "why", "info", "doctor"]),
  yarn: new Set(["--version", "-v", "list", "info", "why"]),
  bun: new Set(["--version", "-v"]),
  deno: new Set(["--version", "-V", "info", "doc"]),
  python: new Set(["--version", "-V", "-m pip list", "-m pip show", "--help"]),
  python3: new Set(["--version", "-V", "-m pip list", "-m pip show", "--help"]),
  pip: new Set(["--version", "-V", "list", "show", "freeze", "check"]),
  pip3: new Set(["--version", "-V", "list", "show", "freeze", "check"]),
  brew: new Set(["list", "info", "search", "doctor", "--version", "leaves", "deps", "uses", "config", "services list", "outdated", "desc", "cat"]),
  pmset: new Set(["-g"]),
  systemsetup: new Set(["-gettimezone", "-listtimezones", "-getcomputersleep", "-getdisplaysleep", "-getharddisksleep", "-getremotelogin", "-getremoteappleevents", "-getrestartfreeze", "-getwaitforstartupafterpowerfailure", "-getwakeonmodem", "-getwakeonnetworkaccess", "-getlocalsubnetname", "-getcomputername", "-getusingnetworktime", "-getnetworktimeserver"]),
  dscacheutil: new Set(["-q", "-statistics", "-configuration", "-cachedump"]),
  defaults: new Set(["read", "read-type", "find", "export", "domains", "help"]),
  ipconfig: new Set(["getifaddr", "getsummary", "getpacket", "getv6packet", "getoption", "getiflist", "waitall"]),
  scutil: new Set(["--dns", "--proxy", "--nc list", "--nwi", "--rni", "get ", "show "]),
  diskutil: new Set(["list", "info", "apfs list", "apfs listusers", "apfs listsnapshots", "cs list", "corestorage list", "listfilesystems", "activity"]),
  launchctl: new Set(["list", "print", "print-cache", "print-disabled", "procinfo", "hostinfo", "getenv"]),
  log: new Set(["show", "stats", "config --status", "config --property", "erase --status"]),
  crontab: new Set(["-l"]),
  softwareupdate: new Set(["-l", "--list", "--history", "--dump-state"]),
  dscl: new Set([". -read", ". -readall", ". -list", ". -cat", ". -search", "-read", "-readall", "-list", "-cat", "-search"]),
  sysctl: new Set(["-n", "-a"]),
  apt: new Set(["list", "show", "search", "policy", "depends", "rdepends", "--version"]),
  "apt-get": new Set(["--version", "satisfy"]),
  "apt-cache": new Set(["policy", "show", "search", "depends", "stats"]),
  dpkg: new Set(["-l", "--list", "-s", "--status", "-L", "--listfiles", "--version"]),
  dnf: new Set(["list", "info", "search", "--version", "history"]),
  yum: new Set(["list", "info", "search", "--version", "history"]),
  pacman: new Set(["-Q", "-Qi", "-Ql", "-Qs", "-Qu", "-Si", "-Ss", "--version"]),
  zypper: new Set(["se", "search", "info", "if", "lr", "--version"]),
  apk: new Set(["info", "list", "search", "--version"]),
  snap: new Set(["list", "info", "find", "--version", "services"]),
  flatpak: new Set(["list", "info", "search", "--version"]),
  winget: new Set(["list", "search", "show", "--version", "source list"]),
  choco: new Set(["list", "search", "info", "--version", "outdated"]),
  scoop: new Set(["list", "search", "info", "status", "--version"]),
  docker: new Set(["ps", "images", "inspect", "logs", "version", "info", "stats --no-stream", "compose ls", "compose ps", "top", "port", "diff"]),
  kubectl: new Set(["get", "describe", "logs", "version", "config view", "config current-context", "api-resources", "explain", "top"]),
  systemctl: new Set(["status", "list-units", "list-unit-files", "is-active", "is-enabled", "is-failed", "show", "cat", "--version", "list-timers"]),
  launchctl: new Set(["list", "print", "print-cache", "version"]),
  ollama: new Set(["list", "ps", "show", "--version"]),
  llm: new Set(["--version", "models"]),
  defaults: new Set(["read", "find"]),
  sysctl: new Set(["-a", "-n", "-h"]),
  crontab: new Set(["-l"]),
  xattr: new Set(["-l", "-p", "-h"]),
  scutil: new Set(["--dns", "--nwi", "--proxy", "--nc list"]),
  dscacheutil: new Set(["-statistics", "-cachedump", "-q"]),
  mount: new Set([""]),
  fdisk: new Set(["-l"]),
  mountpoint: new Set([""]),
  "gh": new Set(["status", "repo view", "issue list", "pr list", "pr status", "release list", "--version", "auth status"]),
  ffmpeg: new Set(["-version", "-formats", "-codecs", "-devices", "-encoders", "-filters", "-h"]),
  ffprobe: new Set(["-version", "-v", "-show_format", "-show_streams", "-show_packets", "-show_entries", "-show_chapters", "-show_programs"]),
  vulkaninfo: new Set(["--summary", "-h"]),
  "nvidia-smi": new Set([""]),
  nproc: new Set([""]),
  groups: new Set([""]),
  locale: new Set([""]),
  getconf: new Set([""]),
};

const LINE_CRITICAL = [
  { re: /:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/, reason: "fork bomb" },
];

const LINE_HIGH = [
  { re: /\b(curl|wget)\b[^|;]*\|\s*(sudo\s+)?(sh|bash|zsh|fish|pwsh|powershell|python|python3|node)\b/i, reason: "remote script piped to interpreter" },
  { re: /\b(iwr|irm|Invoke-(WebRequest|RestMethod))\b[^|;]*\|\s*(iex|Invoke-Expression|powershell|pwsh)\b/i, reason: "remote script piped to interpreter" },
  { re: /\b(base64|openssl\s+enc|certutil)\b[^|;]*(-d|-decode|--decode)[^|;]*\|\s*(sh|bash|zsh|pwsh|powershell|iex)\b/i, reason: "encoded payload piped to interpreter" },
  { re: /\b(powershell|pwsh)\b[^|;]*-e(nc|nc|ncodedcommand)?\s+[a-zA-Z0-9+/=]{8,}/i, reason: "encoded PowerShell command" },
  { re: /\$\(\s*(curl|wget|iwr|irm)\b/i, reason: "command substitution over the network" },
  { re: /\beval\b/i, reason: "eval of dynamic input" },
];

const CRITICAL_PATTERNS = [
  { re: /\bRemove-Item\b[^|;]*-Recurse[^|;]*-Force[^|;]*\b(C:\\|$env:USERPROFILE|%USERPROFILE%|\*|~\\?$)/i, reason: "recursive forced delete of a drive root or profile" },
  { re: /\b(mkfs|sfdisk|parted|wipefs|diskutil\s+(eraseDisk|eraseVolume|apfs\s+deleteContainer|partitionDisk)|format\b[^|;]*\s+[a-z]:)/i, reason: "disk format/partition operation" },
  { re: /\bfdisk\b(?!\s+-l\b)/i, reason: "disk partition operation" },
  { re: /\bdd\b[^|;]*\bof=\s*\/dev\//i, reason: "raw write to a block device" },
  { re: /\bgit\s+push\b[^|;]*(--force|-f\b)[^|;]*\b(main|master|production|prod)\b/i, reason: "force push to a primary branch" },
  { re: /\b(shutdown|poweroff|halt|reboot|Stop-Computer|Restart-Computer)\b/i, reason: "system power operation" },
  { re: /\bkill(all)?\s+-9?\s+-?1\b|\bkill\s+-9\s+-1\b/i, reason: "kill all processes" },
  { re: /\bchmod\s+(-[a-zA-Z]*R[a-zA-Z]*\s+)?(777|666|a\+rwx)\b[^|;]*\s(\/|~|\$HOME|\*|\/(etc|usr|var|bin|sbin|System|Library|Users|home|root|boot|private)\b)/i, reason: "recursive world-writable permissions on a broad path" },
  { re: /\bcipher\s+\/w:/i, reason: "secure wipe of free space" },
  { re: /\breg\s+(add|delete)\b[^|;]*\\(Run|RunOnce)\b/i, reason: "persistence via registry Run key" },
  { re: /\brm\s+-[a-zA-Z]*[rf][a-zA-Z]*\s*["']?(\/|~|\$HOME|\*|\/tmp|\/(etc|usr|var|bin|sbin|System|Library|Users|home|root|boot|private))(?=["'\s;|$*\/]|$)/i, reason: "recursive delete of a protected path" },
  { re: /\bfind\s+["']?(\/|~|\$HOME|\/(etc|usr|var|bin|sbin|System|Library|Users|home|root|boot|private))(?=[\s"'\/])[^|;]*-exec(dir)?\s+rm\b/i, reason: "recursive delete of a protected path via find" },
];

const CRITICAL_RM_TARGETS = /^(\/|\/\*|~|~\/|~\/\*|\$HOME|\$HOME\/|\$HOME\/\*|\.\.?|\.\.\/|\*|\/(etc|usr|bin|sbin|var|System|Library|Applications|Users|opt|root|boot|home)\/?.*)$/;
const REMOVE_ITEM_CRITICAL = /^(C:\\?|C:\\Windows.*|\$env:SystemRoot.*|%USERPROFILE%\\?$|%USERPROFILE%\\?\*|~\\?$|~\\?\*|~\$)$/;
const RM_HEAD_RE = /^(rm|Remove-Item|rd|rmdir|del|erase)$/i;

function rmTargetRisk(segment) {
  const { head, args } = segmentHead(segment);
  if (!RM_HEAD_RE.test(head)) return null;
  const tokens = args.match(/("[^"]*"|'[^']*'|\S+)/g) || [];
  const targets = tokens.filter((t) => !t.startsWith("-") && !/^--/.test(t));
  const isRecurse = /-[a-zA-Z]*[rR]|--recursive|-Recurse|-rf?\b/i.test(args) || head === "rd" || head === "rmdir";
  const isForce = /-[a-zA-Z]*f|--force|-Force/i.test(args) || head === "del" || head === "erase";
  for (const raw of targets) {
    const t = raw.replace(/^["']|["']$/g, "");
    if (isRecurse && (CRITICAL_RM_TARGETS.test(t) || REMOVE_ITEM_CRITICAL.test(t))) {
      return { risk: "critical", reason: `recursive delete of ${t}` };
    }
    if (isRecurse && /^\/$/.test(t)) {
      return { risk: "critical", reason: "recursive delete of /" };
    }
  }
  if (isRecurse || isForce) return { risk: "high", reason: "recursive or forced deletion" };
  return { risk: "moderate", reason: "file deletion" };
}

const HIGH_PATTERNS = [
  { re: /\bgit\s+(reset\s+--hard|clean\s+-[a-zA-Z]*f|push\s+--force|push\s+-f\b|checkout\s+--\s+\.|restore\s+--staged)/i, reason: "destructive git operation" },
  { re: /\b(sudo|doas|runas|pkexec)\b/i, reason: "elevated privileges" },
  { re: /\b(killall|pkill|taskkill)\b/i, reason: "terminate processes by name" },
  { re: /\bkill\b[^|;]*-9/i, reason: "SIGKILL (uncatchable terminate)" },
  { re: /\b(systemctl|service|launchctl)\s+(stop|disable|mask|unload|remove|kill)\b/i, reason: "service stop/disable" },
  { re: /\b(chmod|chown|chgrp|attrib)\b[^|;]*-R/i, reason: "recursive permission/ownership change" },
  { re: /\breg\s+(add|delete|import)\b/i, reason: "registry modification" },
  { re: /\bmsiexec\b/i, reason: "Windows installer execution" },
  { re: /\bfind\b[^|;]*(-delete|-exec(dir)?\s+(rm|mv|chmod|chown)\b)/i, reason: "find deleting/mutating matched files" },
  { re: /\b(shred|srm|wipe|gshred)\b/i, reason: "secure file destruction" },
  { re: /\b(chmod|chown|chgrp)\b[^|;]*-R[^|;]*\s(\/|~|\$HOME|\*|\/(etc|usr|var|bin|sbin|System|Library|Users|home|root|boot|private)\/?)\s*$/i, reason: "recursive permission/ownership change on a protected path" },
  { re: /\b(crontab|at|schtasks)\b[^|;]*(-r|\/delete|\/create|\/change)/i, reason: "scheduled task modification" },
  { re: />\s*(~\/\.(bashrc|zshrc|profile|bash_profile|zprofile)|\/etc\/|\$PROFILE)/i, reason: "write to shell startup or system config" },
  { re: /\b(brew|apt|apt-get|dnf|yum|pacman|zypper|apk|winget|choco|scoop)\s+(uninstall|remove|purge|erase|autoremove)\b/i, reason: "package removal" },
  { re: /\bnpm\s+(uninstall|remove|rm)\s+(-g|--global)/i, reason: "global package removal" },
  { re: /\bmkfifo\b|\bln\s+-s\b[^|;]*\s\/(etc|usr|bin|sbin|System)/i, reason: "filesystem object in a system path" },
  { re: /\buseradd|userdel|usermod|passwd|visudo|adduser|deluser\b/i, reason: "user account modification" },
  { re: /\biptables|ufw|firewall-cmd|netsh\b[^|;]*(advfirewall|firewall)/i, reason: "firewall modification" },
];

const MODERATE_PATTERNS = [
  { re: /\bmv\b|\bcp\b|\bMove-Item\b|\bCopy-Item\b|\bren\b|\brename\b/i, reason: "file move/copy (can overwrite)" },
  { re: /\bgit\s+(commit|push|pull|merge|rebase|reset|checkout|switch|restore|stash\s+pop|am|apply|cherry-pick|revert|clean)\b/i, reason: "git state change" },
  { re: /\b(brew|apt|apt-get|dnf|yum|pacman|zypper|apk|winget|choco|scoop)\s+(install|add|upgrade|update)\b/i, reason: "package install/upgrade" },
  { re: /\b(npm|pnpm|yarn|bun|pip|pip3|gem|cargo|go)\s+(install|add|i\b|get\b|update|upgrade)\b/i, reason: "package install" },
  { re: /\bkill\b/i, reason: "process termination" },
  { re: /\bStop-Process\b/i, reason: "process termination" },
  { re: /\b(Start|Stop|Restart|Set|New|Remove|Clear|Enable|Disable)-[A-Z]/i, reason: "system object mutation (PowerShell verb)" },
  { re: /\bmkdir\b|\bNew-Item\b|\btouch\b/i, reason: "filesystem write" },
  { re: />\s*[^|&]/, reason: "output redirection (file write)" },
  { re: /\btar\b[^|;]*-[a-zA-Z]*x|\bunzip\b|\bExpand-Archive\b|\b7z\s+x/i, reason: "archive extraction (file writes)" },
  { re: /\bln\s+-s\b|\bNew-Item\b[^|;]*-ItemType\s+SymbolicLink/i, reason: "symlink creation" },
  { re: /\bchmod\b|\bchown\b|\bicacls\b|\bSet-Acl\b/i, reason: "permission/ownership change" },
  { re: /\bcurl\b[^|;]*(-o|-O|--output|--remote-name)|\bwget\b|\bInvoke-WebRequest\b[^|;]*-OutFile/i, reason: "file download (network + write)" },
  { re: /\bservice\b|\bsystemctl\b|\blaunchctl\s+(load|bootstrap|kickstart)/i, reason: "service control" },
  { re: /\bssh\b|\bscp\b|\bsftp\b|\brsync\b/i, reason: "remote session/transfer" },
  { re: /\btee\b/i, reason: "file write" },
  { re: /\b(brew\s+services\s+(start|stop|restart)|launchctl\s+(load|unload|bootstrap|bootout|kickstart))/i, reason: "service control" },
  { re: /\bdscacheutil\s+-flushcache\b/i, reason: "system cache flush" },
  { re: /\bhistory\s+-[a-zA-Z]*[cw]/i, reason: "shell history modification" },
  { re: /\|\s*crontab\b|\bcrontab\s+(-[re]\b|[^-\s])/i, reason: "scheduled task install" },
];

const ELEVATION_RE = /\b(sudo|doas|runas|pkexec|Start-Process\b[^|;]*-Verb\s+RunAs)\b/i;

export function splitCommandLine(line) {
  const segments = [];
  let current = "";
  let quote = null;
  const text = String(line || "");
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quote) {
      current += ch;
      if (ch === quote) quote = null;
      if (quote === '"' && ch === "\\" && i + 1 < text.length) current += text[++i];
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      current += ch;
      continue;
    }
    if (ch === "|" || ch === ";" || ch === "\n") {
      if (text[i + 1] === "|" && ch === "|") i += 1;
      if (current.trim()) segments.push(current.trim());
      current = "";
      continue;
    }
    if (ch === "&") {
      if (text[i + 1] === "&") i += 1;
      if (current.trim()) segments.push(current.trim());
      current = "";
      continue;
    }
    if (ch === ">" || ch === "<") {
      if (current.trim()) segments.push(current.trim());
      current = ch + "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) segments.push(current.trim());
  return segments;
}

function segmentHead(segment) {
  const cleaned = segment.replace(/^\s*(sudo|doas|runas|pkexec)\s+(-[a-zA-Z]+\s+)*/i, "").trim();
  const m = cleaned.match(/^([^\s]+)\s*(.*)$/s);
  if (!m) {
    return { head: "", args: "" };
  }
  let head = m[1];
  head = head.replace(/\.(exe|bat|cmd|ps1)$/i, "").replace(/^.*[\\/]/, "");
  return { head: head.toLowerCase(), args: m[2] || "" };
}

function innerCommandOf(head, args) {
  if (head === "command" && /^\s*-(v|V|p)\b/.test(args)) return null;
  if (head === "xargs") {
    const inner = args.replace(/-[a-zA-Z]+\s*("[^"]*"|'[^']*'|\S+)?/g, "").trim();
    return inner || null;
  }
  if (["sh", "bash", "zsh", "fish", "pwsh", "powershell", "cmd", "eval", "env", "command"].includes(head)) {
    const m = args.match(/(?:^|\s)-[cC]\s+("([^"]*)"|'([^']*)'|(\S+))/) || args.match(/^("([^"]*)"|'([^']*)'|(\S.*))$/s);
    const inner = m && (m[2] || m[3] || m[4] || m[5]);
    if (inner) return inner;
    return null;
  }
  if (head === "find") {
    const m = args.match(/-(exec|execdir)\s+(.+?)\s*(;|\+|$)/s);
    if (m) return m[2];
    return null;
  }
  if (head === "ssh" || head === "sudo" || head === "doas") {
    const m = args.match(/("[^"]+"|'[^']+'|\S+)\s*$/);
    return m ? m[1].replace(/^["']|["']$/g, "") : null;
  }
  return null;
}

const MUTATING_FLAGS = {
  find: /-(delete|fprint|exec(dir)?\s+(?!(ls|echo|printf|file|stat|wc|cat|head|tail|grep|sort|basename|dirname|md5sum|shasum|sha256sum|md5)\b))/,
  sed: /(?:^|\s)-i\b/,
  awk: /\bsystem\s*\(|print[^;|]*>\s*["'\w\/]/,
  tar: /-[a-zA-Z]*[xc]|-[a-zA-Z]*f/,
};

function isReadonlySegment(segment, shell, depth = 0) {
  const { head, args } = segmentHead(segment);
  if (!head) {
    return true;
  }

  if (depth < 2) {
    const inner = innerCommandOf(head, args);
    if (inner) {
      const innerReadonly = isReadonlySegment(inner, shell, depth + 1);
      const innerRisk = patternRisk(inner).risk;
      if (!innerReadonly || RISK_SCORE[innerRisk] > RISK_SCORE.low) {
        return false;
      }
    }
  }

  const flagDeny = MUTATING_FLAGS[head];
  if (flagDeny && flagDeny.test(" " + args)) {
    return false;
  }

  const table = shell === "powershell" || shell === "pwsh" || shell === "cmd"
    ? READONLY_HEADS_WINDOWS
    : READONLY_HEADS_UNIX;
  if (table.has(head)) {
    return true;
  }
  const sub = READONLY_SUBCOMMANDS[head];
  if (sub) {
    const firstArgs = args.trim().toLowerCase();
    if (!firstArgs) {
      return sub.has("");
    }
    for (const key of sub) {
      if (!key) continue;
      if (key.startsWith("=")) {
        if (firstArgs === key.slice(1)) return true;
        continue;
      }
      if (firstArgs === key || firstArgs.startsWith(key + " ") || firstArgs.startsWith(key + "=")) {
        return true;
      }
    }
    return false;
  }
  if (/^\s*(-{1,2}(version|v|help|h|V)|--dry-run|list\b|show\b|status\b)\s*$/.test(args)) {
    return true;
  }
  return false;
}

function patternRisk(segment) {
  const rm = rmTargetRisk(segment);
  if (rm) {
    return { risk: rm.risk, reason: rm.reason };
  }
  let risk = "low";
  let reason = "";
  for (const { re, reason: r } of CRITICAL_PATTERNS) {
    if (re.test(segment)) {
      return { risk: "critical", reason: r };
    }
  }
  for (const { re, reason: r } of HIGH_PATTERNS) {
    if (re.test(segment)) {
      return { risk: "high", reason: r };
    }
  }
  for (const { re, reason: r } of MODERATE_PATTERNS) {
    if (re.test(segment)) {
      risk = "moderate";
      reason = r;
    }
  }
  return { risk, reason };
}

export function analyzeCommand(command, { shell = "sh" } = {}) {
  const text = String(command || "").trim();
  if (!text) {
    return { risk: "low", readonly: true, tags: ["empty"], reasons: [] };
  }

  let risk = "low";
  const tags = new Set();
  const reasons = [];
  for (const { re, reason } of LINE_CRITICAL) {
    if (re.test(text)) return { risk: "critical", readonly: false, tags: ["critical"], reasons: [reason] };
  }
  for (const { re, reason } of LINE_HIGH) {
    if (re.test(text)) {
      risk = "high";
      reasons.push(reason);
      if (/remote script|encoded/i.test(reason)) tags.add("remote-or-encoded");
    }
  }

  const segments = splitCommandLine(text);
  let readonly = true;

  for (const segment of segments) {
    const segReadonly = isReadonlySegment(segment, shell);
    let { risk: segRisk, reason } = patternRisk(segment);
    const { head: segHead, args: segArgs } = segmentHead(segment);
    const inner = innerCommandOf(segHead, segArgs);
    if (inner) {
      const innerRes = patternRisk(inner);
      if (RISK_SCORE[innerRes.risk] > RISK_SCORE[segRisk]) {
        segRisk = innerRes.risk;
        reason = innerRes.reason;
      }
    }
    if (!segReadonly) {
      readonly = false;
      const { head } = segmentHead(segment);
      if (head && !reason) {
        tags.add("non-readonly:" + head);
      }
    }
    if (RISK_SCORE[segRisk] > RISK_SCORE[risk]) {
      risk = segRisk;
    }
    if (reason) reasons.push(reason);
    if (segRisk === "high" && /remote script|encoded/i.test(reason)) tags.add("remote-or-encoded");
  }

  if (/`[^`]+`|\$\(|<\(|>\(/.test(text)) {
    tags.add("substitution");
    if (RISK_SCORE[risk] < RISK_SCORE.moderate) risk = "moderate";
    readonly = false;
  }
  if (/\beval\b/i.test(text)) tags.add("eval");
  if (ELEVATION_RE.test(text)) {
    tags.add("elevated");
    if (RISK_SCORE[risk] < RISK_SCORE.high && !readonly) risk = "high";
  }
  if (segments.length > 1) tags.add("pipeline");

  if (readonly && risk !== "low") readonly = false;
  return { risk, readonly, tags: [...tags], reasons: [...new Set(reasons)] };
}

export function applyPolicyToPlan(plan, { shell = "sh" } = {}) {
  let allReadonly = true;
  let maxRisk = "low";
  const blockers = [];

  for (const step of plan.commands || []) {
    const analysis = analyzeCommand(step.command, { shell });
    step.policy = analysis;
    if (!analysis.readonly) {
      allReadonly = false;
      step.requires_confirmation = true;
    }
    if (RISK_SCORE[analysis.risk] > RISK_SCORE[step.risk]) {
      step.risk = analysis.risk;
    }
    if (analysis.tags.includes("remote-or-encoded")) {
      step.requires_confirmation = true;
    }
    if (analysis.risk === "critical") {
      step.requires_confirmation = true;
      blockers.push(`${step.command} — ${analysis.reasons[0] || "critical"}`);
    }
    if (RISK_SCORE[step.risk] > RISK_SCORE[maxRisk]) maxRisk = step.risk;
  }

  if (RISK_SCORE[maxRisk] > RISK_SCORE[plan.overall_risk]) {
    plan.overall_risk = maxRisk;
  }

  return {
    allReadonly,
    maxRisk,
    blockers,
    readonly: allReadonly && maxRisk === "low",
  };
}

const WRAPPER_HEADS = new Set(["sudo", "doas", "runas", "pkexec", "command", "env", "time", "nohup", "nice", "builtin", "exec", "xargs"]);
const FLAG_TAKES_VALUE = new Set(["-u", "--user", "-g", "--group", "-C", "--chdir", "-n", "-I"]);

const POSIX_BUILTINS = new Set([
  "cd", "echo", "printf", "test", "[", "export", "set", "unset", "alias", "unalias",
  "source", ".", "eval", "exec", "exit", "return", "read", "shift", "trap", "wait",
  "jobs", "fg", "bg", "ulimit", "umask", "pwd", "true", "false", ":", "history",
  "type", "command", "builtin", "let", "local", "declare", "typeset", "readonly",
  "getopts", "times", "hash", "dirs", "pushd", "popd", "disown", "suspend", "logout",
  "help", "fc", "enable", "break", "continue", "select", "caller", "shopt",
]);

const CMD_BUILTINS = new Set([
  "dir", "copy", "move", "del", "erase", "ren", "type", "cls", "echo", "set", "cd",
  "md", "mkdir", "rd", "rmdir", "help", "exit", "ver", "vol", "date", "time",
  "path", "prompt", "assoc", "ftype", "title", "color", "call", "start",
]);

export function isRefusalCommand(command) {
  return /^echo\s+["']?needs manual review["']?$/i.test(String(command || "").trim());
}

export function headBinary(command) {
  const tokens = (String(command || "").trim().match(/("[^"]*"|'[^']*'|\S+)/g) || [])
    .map((t) => t.replace(/^["']|["']$/g, ""));
  for (let i = 0; i < tokens.length; i += 1) {
    const t = tokens[i];
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(t)) continue;
    if (WRAPPER_HEADS.has(t.toLowerCase())) continue;
    if (t.startsWith("-")) {
      if (FLAG_TAKES_VALUE.has(t)) i += 1;
      continue;
    }
    return t.replace(/\.(exe|bat|cmd|ps1)$/i, "").replace(/^.*[\\/]/, "");
  }
  return "";
}

const TOOL_ALTERNATIVES = {
  ss: ["netstat", "lsof"], netstat: ["ss", "lsof"], lsof: ["netstat", "ss"],
  apt: ["brew", "dnf", "pacman"], "apt-get": ["brew", "dnf", "pacman"],
  dnf: ["brew", "apt", "pacman"], yum: ["dnf", "apt", "brew"], pacman: ["brew", "apt"],
  brew: ["apt", "dnf", "winget"], winget: ["brew", "choco"], choco: ["winget"],
  ip: ["ifconfig", "netstat"], ifconfig: ["ip"],
  fd: ["find"], rg: ["grep"], bat: ["cat"], eza: ["ls"], exa: ["ls"], tree: ["find"],
  xclip: ["pbcopy", "xsel"], xsel: ["xclip", "pbcopy"], "wl-copy": ["xclip", "pbcopy"],
  pbcopy: ["xclip", "xsel"], pbpaste: ["xclip -o"],
  systemctl: ["service"], free: ["vm_stat", "top"], lsblk: ["diskutil"], lscpu: ["sysctl"],
  nproc: ["sysctl -n hw.ncpu", "getconf"], md5sum: ["md5"], sha1sum: ["shasum"], sha256sum: ["shasum -a 256"],
  timeout: ["gtimeout"], gtimeout: ["timeout"], realpath: ["readlink -f"],
};

export function installedAlternative(name) {
  const base = String(name || "").replace(/\.(exe|bat|cmd|ps1)$/i, "").replace(/^.*[\\/]/, "").toLowerCase();
  const alts = (TOOL_ALTERNATIVES[base] || []).filter((a) => isInstalled(a.split(" ")[0]));
  return alts.length ? alts : null;
}

const PACKAGE_MANAGERS = ["brew", "apt", "dnf", "yum", "pacman", "zypper", "apk", "nix-env", "flatpak", "snap", "winget", "choco", "scoop"];

export function packageManager(name) {
  const base = String(name || "").replace(/\.(exe|bat|cmd|ps1)$/i, "").replace(/^.*[\\/]/, "").toLowerCase();
  if (PACKAGE_MANAGERS.includes(base)) return null;
  return PACKAGE_MANAGERS.find(isInstalled) || null;
}

export function isInstalled(name) {
  const base = String(name || "").replace(/\.(exe|bat|cmd|ps1)$/i, "").replace(/^.*[\\/]/, "");
  if (!base) return false;
  if (POSIX_BUILTINS.has(base)) return true;
  if (process.platform === "win32") {
    if (CMD_BUILTINS.has(base.toLowerCase())) return true;
    if (/^[A-Z][a-z]+-[A-Za-z]/.test(base)) return true;
  }
  const exts = process.platform === "win32" ? (process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM").split(";") : [""];
  for (const dir of (process.env.PATH || "").split(path.delimiter)) {
    if (!dir) continue;
    for (const ext of exts) {
      try {
        fsSync.accessSync(path.join(dir, base + ext), fsSync.constants.X_OK);
        return true;
      } catch {}
    }
  }
  return false;
}
