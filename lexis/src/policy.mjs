import fsSync from "node:fs";
import path from "node:path";

export const RISK_LEVELS = ["low", "moderate", "high", "critical"];
export const RISK_SCORE = { low: 0, moderate: 1, high: 2, critical: 3 };

const READONLY_HEADS_UNIX = new Set([
  "ls", "ll", "cat", "head", "tail", "less", "more", "pwd", "whoami", "id",
  "which", "whereis", "type", "file", "stat", "echo", "printf", "true", "uname",
  "env", "printenv", "cal", "uptime", "w", "last", "who",
  "df", "du", "free", "lsof", "netstat", "ss", "ps", "pgrep", "top", "htop",
  "sw_vers", "system_profiler", "sysctlbyname", "mdfind", "plutil",
  "command", "history", "man", "apropos", "tldr", "wc", "grep",
  "egrep", "fgrep", "rg", "fd", "find", "tree", "awk", "gawk",
  "readlink", "realpath", "dirname", "basename", "locate", "strings",
  "zcat", "dmesg", "lastlog",
  "sort", "cut", "tr", "diff", "cmp", "md5", "md5sum", "shasum", "sed", "xargs",
  "sha256sum", "base64", "od", "hexdump", "jq", "yq", "pbcopy",
  "pbpaste", "mdls", "ioreg", "iostat", "vm_stat", "memory_pressure",
  "locale", "kextstat",
  "nproc", "arch", "getconf", "lsb_release", "os-release",
  "ping", "traceroute", "nslookup", "dig", "host",
  "lsblk", "lsusb", "lspci", "blkid",
  "lscpu", "lsmem", "lsmod", "vmstat", "mpstat", "findmnt", "comm", "jobs", "pidof", "pstree", "getent",
  "otool", "xzless", "zless", "pg_isready", "mountpoint", "lastb", "zcat", "gzcat",
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
  "netstat", "ping", "nslookup", "findstr", "tracert", "pathping", "getmac",
]);

const READONLY_ARGS = {
  ip: /^(?!.*\b(add|del|delete|change|replace|set|flush|append|prepend|up|down|save|restore|exec|attach|detach)\b)/,
  ifconfig: /^(-[a-zA-Z]+\s*)*(\w+(\s+-?v)?)?\s*$/,
  route: /^(?!.*\b(add|delete|del|change|flush|replace)\b)/,
  arp: /^(?!.*(^|\s)-[dsSf]\b)/,
  hostname: /^(-[a-zA-Z]+\s*)*$/,
  date: /^(?!.*(^|\s)(-s|--set)\b)(?![^-\s+])/,
  nvram: /^(?!.*(=|(^|\s)-[dcf]\b))/,
  uniq: /^(-\S+(\s+\d+)?\s*)*("[^"]*"|'[^']*'|[^\s-]\S*)?\s*$/,
  xxd: /^(?!.*(^|\s)-r\b)(-\S+(\s+\d+)?\s*)*("[^"]*"|'[^']*'|[^\s-]\S*)?\s*$/,
  tar: /^-?[a-z]*t[a-z]*\s/i,
  journalctl: /^(?!.*--(vacuum|rotate|flush|setup-keys|relinquish|sync|update-catalog))/,
  networksetup: /^-(get|list|print|show)\w*/i,
  attrib: /^(?!.*(^|\s)[+-][rahsiv]\b)/i,
  icacls: /^(?!.*\/(grant|deny|remove|reset|setowner|restore|save|setintegritylevel|inheritance|substitute))/i,
  powercfg: /^\/(a|availablesleepstates|l|list|lastwake|q|query|getactivescheme|devicequery|requests)\b/i,
  schtasks: /^\/query\b/i,
  tzutil: /^\/(g|l)\b/i,
  timedatectl: /^(status|show|list-timezones|timesync-status|show-timesync)?\s*$/,
  loginctl: /^(list-\w+|show-\w+|session-status|user-status|seat-status)?(\s|$)/,
  hostnamectl: /^(status)?\s*$/,
  ulimit: /^(-[a-zA-Z]+\s*)*$/,
  hdiutil: /^(verify|imageinfo|info|pmap|isencrypted)\b/,
  "xcode-select": /^(-p|--print-path|-v|--version)\s*$/,
  xcrun: /^(--find|-f|--show-sdk-\w+|simctl\s+list)\b/,
  kill: /^\s*(-0|-[lL]\b|--list\b|--signal\s+(0|EXIT|HUP)\b)/,
  xclip: /^(?=[^|;]*(?:^|\s)-o\b)/,
  codesign: /^(?![^|;]*\s-[a-zA-Z]*[sroafA]\w*)(?![^|;]*--(sign|remove-signature|options|requirements|force|deep|timestamp|identifier|prefix|keychain|detached))(?=\s*-(d\w*|v+|V\b)|\s*--(verify|display|detailed|entitlements|extract-entitlements))/i,
  openssl: /^(?![^|;]*\s-out\b)(?![^|;]*\b(genrsa|genpkey|req|x509\s+-req|pkcs12\b[^|;]*-export|enc\b|pkeyutl|dgst\s+-sign|ca\b|crl\b))/i,
  "ssh-keygen": /^(?![^|;]*(?:^|\s)-[a-zA-Z]*[tTiDcRB]\b)(?=[^|;]*(?:^|\s)-[a-zA-Z]*l[a-zA-Z]*\b)/,
  gunzip: /^\s*-[a-zA-Z]*[lc][a-zA-Z]*\s/,
  gzip: /^\s*-[a-zA-Z]*[lc][a-zA-Z]*\s/,
  xz: /^\s*-[a-zA-Z]*[lc][a-zA-Z]*\s/,
  plistbuddy: /^-c\s+["']?\s*Print\b/i,
  ethtool: /^(?!.*(?:^|\s)-[sKAGLNrEPTXu]\b)/,
  rsync: /^(?=[^|;]*--dry-run|[^|;]*(?:^|\s)-[a-zA-Z]*n[a-zA-Z]*\b)/,
  git: /^(?:branch(?:\s+(?:-[vral]+\b.*|--show-current|--list\b.*|--contains\b.*|--merged\b.*|--no-merged\b.*|--points-at\b.*))?|clean\s+(?:-[a-zA-Z]*n[a-zA-Z]*\b.*|--dry-run\b.*)|annotate\b.*|check-ignore\b.*|fsck\b(?![^|;]*--lost-found).*)$/,
  crontab: /^\s*(?:-u\s+\S+\s+)?-l\b(?:\s+-u\s+\S+)?\s*$/,
  dism: /^\/online\s+\/cleanup-image\s+\/(scanhealth|checkhealth)\b/i,
  netsh: /^(?!.*\b(set|add|delete|exec|import|dump)\b)(?=[^|;]*\bshow\b)/i,
  fsutil: /^(volume\s+diskfree|fsinfo)\b/i,
};

const READONLY_SUBCOMMANDS = {
  git: new Set([
    "status", "log", "diff", "show", "rev-parse",
    "ls-files", "ls-tree", "blame", "describe", "shortlog", "grep",
    "config --get", "config --list", "version", "help",
    "=tag", "tag -l", "tag --list", "tag --points-at",
    "=branch", "branch -l", "branch --list", "branch -a", "branch -v", "branch -r", "branch --show-current",
    "=remote", "remote -v", "remote get-url", "remote show",
    "stash list", "stash show", "stash diff",
    "branch --merged", "branch --no-merged", "branch --contains", "worktree list", "bisect log",
    "reflog", "cat-file", "count-objects", "for-each-ref", "name-rev", "merge-base",
  ]),
  tmux: new Set(["ls", "list-sessions", "list-windows", "list-panes", "list-clients", "show-options", "-V"]),
  screen: new Set(["-ls", "-list", "-v"]),
  rpm: new Set(["-qa", "-q", "-qi", "-ql", "-qf", "--query", "-V", "--verify"]),
  "firewall-cmd": new Set(["--list-all", "--list-ports", "--list-services", "--state", "--get-active-zones", "--get-default-zone", "--list-all-zones"]),
  iptables: new Set(["-L", "-S", "--list", "-nL", "-nvL", "-vnL", "-L -n", "-L -v -n", "-L -n -v", "-l", "-s", "-nl", "-nvl", "-vnl", "-l -n", "-l -v -n", "-l -n -v", "-nxl", "-lvnx"]),
  cargo: new Set(["install --list", "--version", "tree", "metadata"]),
  unzip: new Set(["-l", "-v", "-t", "-Z"]),
    node: new Set(["--version", "-v", "--help"]),
  npm: new Set(["--version", "-v", "list", "ls", "view", "info", "search", "outdated", "=audit", "audit signatures", "config get", "prefix", "root", "whoami", "doctor", "help", "explain", "why", "=version"]),
  npx: new Set(["--version", "-v"]),
  pnpm: new Set(["--version", "-v", "list", "ls", "outdated", "why", "info", "doctor"]),
  yarn: new Set(["--version", "-v", "list", "info", "why"]),
  bun: new Set(["--version", "-v"]),
  deno: new Set(["--version", "-V", "info", "doc"]),
  python: new Set(["--version", "-V", "-m pip list", "-m pip show", "--help"]),
  python3: new Set(["--version", "-V", "-m pip list", "-m pip show", "--help"]),
  pip: new Set(["--version", "-V", "list", "show", "freeze", "check"]),
  pip3: new Set(["--version", "-V", "list", "show", "freeze", "check"]),
  brew: new Set(["list", "info", "search", "doctor", "--version", "leaves", "deps", "uses", "config", "services list", "outdated", "desc", "cat", "cleanup --dry-run", "cleanup -n", "--prefix", "--cellar", "--repository", "--cache", "--env", "shellenv"]),
  pmset: new Set(["-g"]),
  systemsetup: new Set(["-gettimezone", "-listtimezones", "-getcomputersleep", "-getdisplaysleep", "-getharddisksleep", "-getremotelogin", "-getremoteappleevents", "-getrestartfreeze", "-getwaitforstartupafterpowerfailure", "-getwakeonmodem", "-getwakeonnetworkaccess", "-getlocalsubnetname", "-getcomputername", "-getusingnetworktime", "-getnetworktimeserver"]),
  dscacheutil: new Set(["-q", "-statistics", "-configuration", "-cachedump"]),
  defaults: new Set(["read", "read-type", "find", "export", "domains", "help"]),
  ipconfig: new Set(["getifaddr", "getsummary", "getpacket", "getv6packet", "getoption", "getiflist", "waitall"]),
  scutil: new Set(["--dns", "--proxy", "--nc list", "--nwi", "--rni", "--get", "get ", "show "]),
  diskutil: new Set(["list", "info", "apfs list", "apfs listusers", "apfs listsnapshots", "cs list", "corestorage list", "listfilesystems", "activity"]),
  launchctl: new Set(["list", "print", "print-cache", "print-disabled", "procinfo", "hostinfo", "getenv", "version"]),
  log: new Set(["show", "stream", "stats", "config --status", "config --property", "erase --status"]),
  crontab: new Set(["-l"]),
  softwareupdate: new Set(["-l", "--list", "--history", "--dump-state"]),
  dscl: new Set([". -read", ". -readall", ". -list", ". -cat", ". -search", "-read", "-readall", "-list", "-cat", "-search"]),
  sysctl: new Set(["-n", "-a", "-h"]),
  apt: new Set(["list", "show", "search", "policy", "depends", "rdepends", "--version"]),
  "apt-get": new Set(["--version", "satisfy"]),
  "apt-cache": new Set(["policy", "show", "search", "depends", "stats"]),
  dpkg: new Set(["-l", "--list", "-s", "--status", "-L", "--listfiles", "--version"]),
  "dpkg-query": new Set(["-l", "-w", "-s", "--status", "--listfiles", "-L", "-p", "--print-avail", "--version"]),
  go: new Set(["env", "version", "--version", "list", "doc", "help", "tool"]),
  dnf: new Set(["list", "info", "search", "--version", "history"]),
  yum: new Set(["list", "info", "search", "--version", "history"]),
  pacman: new Set(["-Q", "-Qi", "-Ql", "-Qs", "-Qu", "-Si", "-Ss", "--version", "-q", "-qi", "-ql", "-qs", "-qu", "-si", "-ss", "-qe", "-qn", "-qm", "-qg"]),
  zypper: new Set(["se", "search", "info", "if", "lr", "--version"]),
  apk: new Set(["info", "list", "search", "--version"]),
  snap: new Set(["list", "info", "find", "--version", "services"]),
  flatpak: new Set(["list", "info", "search", "--version"]),
  winget: new Set(["list", "search", "show", "--version", "source list"]),
  choco: new Set(["list", "search", "info", "--version", "outdated"]),
  scoop: new Set(["list", "search", "info", "status", "--version"]),
  docker: new Set(["ps", "images", "inspect", "logs", "version", "info", "stats --no-stream", "compose ls", "compose ps", "top", "port", "diff", "system df", "system info", "network ls", "volume ls", "context ls", "manifest inspect"]),
  kubectl: new Set(["get", "describe", "logs", "version", "config view", "config current-context", "api-resources", "explain", "top", "rollout status", "rollout history", "cluster-info", "api-versions", "auth can-i"]),
  systemctl: new Set(["status", "list-units", "list-unit-files", "is-active", "is-enabled", "is-failed", "show", "show-environment", "cat", "--version", "list-timers", "list-jobs", "list-sockets", "list-paths", "list-dependencies"]),
  "systemd-analyze": new Set(["blame", "time", "critical-chain", "verify", "cat-config", "unit-paths", "dot", "dump", "plot", "calendar", "timespan", "timestamp", "capability", "syscall-filter", "filesystems", "pcrs", "srpm"]),
  resolvectl: new Set(["status", "query", "statistics", "domain", "legend", "default-route", "dns", "dnssec", "nta", "llmnr", "mdns", "tlsa", "openpgp", "reset-statistics?"]),
  ollama: new Set(["list", "ps", "show", "--version"]),
  llm: new Set(["--version", "models"]),
  xattr: new Set(["-l", "-p", "-h"]),
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
  { re: /\b(curl|wget)\b[^|;]*\|\s*(sudo\s+)?(sh|bash|zsh|fish|pwsh|powershell|python|python3|node)\b/i, reason: "remote script piped to interpreter" },
  { re: /\b(iwr|irm|Invoke-(WebRequest|RestMethod))\b[^|;]*\|\s*(iex|Invoke-Expression|powershell|pwsh)\b/i, reason: "remote script piped to interpreter" },
  { re: /(\b(source|bash|sh|zsh)\s+|(^|\s)\.\s+)<\(\s*(curl|wget|iwr|irm|Invoke-(WebRequest|RestMethod))\b/i, reason: "remote script via process substitution" },
  { re: /\b(bash|sh|zsh|fish|powershell|pwsh)\b[^|;]*-[cC]\s+[^|;]*\$\(\s*(curl|wget|iwr|irm|Invoke-(WebRequest|RestMethod))\b/i, reason: "remote script via command substitution" },
  { re: /\b(iex|Invoke-Expression|Start-Process)\b[^|;]*\b(DownloadString|Invoke-WebRequest|Invoke-RestMethod|iwr|irm|Net\.WebClient)\b|-(Command|File)\b[^|;]*\bDownloadString\b|\b(DownloadString|Net\.WebClient)\b[^|;]*\|\s*(iex|Invoke-Expression|powershell|pwsh)\b/i, reason: "remote script executed via DownloadString" },
  { re: /(^|\||;)\s*Get-Process\s*\|\s*Stop-Process\b/i, reason: "terminate every process" },
];

const LINE_HIGH = [
  { re: /(Get-ChildItem|gci|dir|ls)\b[^|;]*\|\s*Remove-Item\b(?![^|;]*-WhatIf)/i, reason: "bulk deletion via pipeline" },
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
  { re: /(^|[;&|(]\s*|\bsudo\s+|\bsystemctl\s+)(shutdown|poweroff|halt|reboot)\b|\b(Stop-Computer|Restart-Computer)\b/i, reason: "system power operation" },
  { re: /\bkillall5\b|\bkill(all)?\s+(-\w+\s+)*-1\s*$/i, reason: "kill all processes" },
  { re: /\bpkill\s+(-9|-KILL|-SIGKILL)\s*$/i, reason: "kill all processes" },
  { re: /\btaskkill\b(?![^|;]*\/(im|pid)\b)[^|;]*\/f\b/i, reason: "force kill all processes" },
  { re: /\bStop-Process\b[^|;]*-Name\s+["']?\*["']?/i, reason: "kill all processes" },
  { re: /\b(chmod|chown|chgrp|chflags)\b[^|;]*-[a-zA-Z]*R[^|;]*\s["']?(\/(?=[\s"'*]|$)|~|\$HOME|\/(etc|usr|var|bin|sbin|System|Library|Users|home|root|boot|private)\b|C:\\|\$env:SystemRoot|%SystemRoot%)/i, reason: "recursive permission/ownership change on a protected path" },
  { re: /\bfind\s+["']?(\/(?=[\s"'*]|$)|~|\$HOME|\/(etc|usr|var|bin|sbin|System|Library|Users|home|root|boot|private)\b)[^|;]*-exec(dir)?\s+(chmod|chown|chgrp)\b/i, reason: "recursive permission/ownership change on a protected path via find" },
  { re: /\b(icacls|takeown)\b(?=[^|;]*\/(t|r)\b)(?=[^|;]*(C:\\|\$env:SystemRoot|%SystemRoot%))/i, reason: "recursive permission/ownership change on system directories" },
  { re: /\bchmod\s+(-[a-zA-Z]*R[a-zA-Z]*\s+)?(777|666|a\+rwx)\b[^|;]*\s(\/|~|\$HOME|\*|\/(etc|usr|var|bin|sbin|System|Library|Users|home|root|boot|private)\b)/i, reason: "recursive world-writable permissions on a broad path" },
  { re: /\bcipher\s+\/w:/i, reason: "secure wipe of free space" },
  { re: /\breg\s+(add|delete)\b[^|;]*\\(Run|RunOnce)\b/i, reason: "persistence via registry Run key" },
  { re: /\brm\s+-[a-zA-Z]*[rf][a-zA-Z]*\s*["']?(\/|~|\$HOME|\*|\/tmp|\/(etc|usr|var|bin|sbin|System|Library|Users|home|root|boot|private))(?=["'\s;|$*\/]|$)/i, reason: "recursive delete of a protected path" },
  { re: /\bfind\s+["']?(\/|~|\$HOME|\/(etc|usr|var|bin|sbin|System|Library|Users|home|root|boot|private))(?=[\s"'\/])[^|;]*-exec(dir)?\s+rm\b/i, reason: "recursive delete of a protected path via find" },
];

const CRITICAL_RM_TARGETS = /^(\/|\/\*|~|~\/|~\/\*|\$HOME|\$HOME\/|\$HOME\/\*|\.\.?|\.\.\/|\*|\/(etc|usr|bin|sbin|var|System|Library|Applications|Users|opt|root|boot|home)\/?.*)$/;
const REMOVE_ITEM_CRITICAL = /^(C:\\?|C:\\Windows.*|\$env:SystemRoot.*|%USERPROFILE%\\?$|%USERPROFILE%\\?\*|\$env:USERPROFILE.*|\$HOME.*|C:\\Users(\\[^\\;|"'*]+)?|~\\?$|~\\?\*|~\$)$/;
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
  if (targets.some((t) => /^(\.\.?[\\/]?)?\*(\.\*)?$/.test(t.replace(/^["']|["']$/g, "")))) {
    return { risk: "high", reason: "wildcard bulk deletion" };
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
  { re: /\bxargs\b[^|;]*\brm\b/i, reason: "bulk deletion via xargs" },
  { re: /\bgit\s+push\b[^|;]*(--force\b|-f\b|\s\+\S)/i, reason: "force push" },
  { re: /\bcrontab\b(?![^|;]*\s-l\b)\s+(-(?!l\b)\S*|[^-\s|]\S*)/i, reason: "scheduled task install" },
  { re: /\bsystemctl\b[^|;]*\senable\b/i, reason: "service persistence" },
  { re: /\blaunchctl\s+(--\w+\s+)*(load|bootstrap|enable)\b/i, reason: "service persistence" },
  { re: /\btee\b[^|;]*(\$PROFILE|(\/etc\/|~[\/\\]?\.|\$HOME\/\.)(bashrc|zshrc|profile|bash_profile|zprofile|Microsoft\.PowerShell))/i, reason: "write to shell startup file" },
  { re: /\bsed\b[^|;]*-i\b[^|;]*(\/etc\/|~\/\.|\$HOME\/\.)(bashrc|zshrc|profile|bash_profile|zprofile)/i, reason: "edit shell startup file in place" },
  { re: /\b(Set-Content|Add-Content|Out-File)\b[^|;]*\$PROFILE/i, reason: "write to shell startup file" },
  { re: /\b(New|Set|Remove)-ItemProperty\b[^|;]*CurrentVersion\\Run/i, reason: "persistence via registry Run key" },
  { re: /\b(Register|New)-ScheduledTask\b/i, reason: "scheduled task install" },
  { re: /\bosascript\b[^|;]*\blogin\s+item\b/i, reason: "login item persistence" },
  { re: /\bpfctl\s+-\w*d\b/i, reason: "firewall disable" },
  { re: /\bsocketfilterfw\b[^|;]*--setglobalstate\s+off/i, reason: "firewall disable" },
  { re: /\bSet-NetFirewall\w*\b[^|;]*(-Enabled\s+(False|\$false|0)\b|-Disabl\w*)|\bDisable-NetFirewall\w*/i, reason: "firewall disable" },
  { re: /\bchmod\b[^|;]*\s(\/|"\/"|'\/')\s*$/i, reason: "permission change on filesystem root" },
  { re: /\b(shred|srm|wipe|gshred)\b/i, reason: "secure file destruction" },
  { re: /\b(chmod|chown|chgrp)\b[^|;]*-R[^|;]*\s(\/|~|\$HOME|\*|\/(etc|usr|var|bin|sbin|System|Library|Users|home|root|boot|private)\/?)\s*$/i, reason: "recursive permission/ownership change on a protected path" },
  { re: /\b(crontab|at|schtasks)\b[^|;]*(-r|\/delete|\/create|\/change)/i, reason: "scheduled task modification" },
  { re: />\s*(~\/\.(bashrc|zshrc|profile|bash_profile|zprofile)|\/etc\/|\$PROFILE)/i, reason: "write to shell startup or system config" },
  { re: /\b(brew|apt|apt-get|dnf|yum|pacman|zypper|apk|winget|choco|scoop)\s+(uninstall|remove|purge|erase|autoremove)\b/i, reason: "package removal" },
  { re: /\bnpm\s+(uninstall|remove|rm)\s+(-g|--global)/i, reason: "global package removal" },
  { re: /\bmkfifo\b|\bln\s+-s\b[^|;]*\s\/(etc|usr|bin|sbin|System|Library)|\bNew-Item\b[^|;]*SymbolicLink[^|;]*(C:\\Windows|\$env:SystemRoot)/i, reason: "filesystem object in a system path" },
  { re: /(^|[|;&(]\s*|\bsudo\s+)(useradd|userdel|usermod|passwd|visudo|adduser|deluser|chpasswd)\b/i, reason: "user account modification" },
  { re: /\biptables\b(?![^|;]*\s-[a-zA-Z]*[LS]\S*)(?![^|;]*--list)|\bufw\b|\bfirewall-cmd\b|\bnetsh\b[^|;]*(advfirewall|firewall)/i, reason: "firewall modification" },
];

const MODERATE_PATTERNS = [
  { re: /\bmv\b|\bcp\b|\bMove-Item\b|\bCopy-Item\b|\bren\b|\brename\b/i, reason: "file move/copy (can overwrite)" },
  { re: /\bgit\s+(commit|push|pull|merge|rebase|reset|checkout|switch|restore|stash\s+pop|am|apply|cherry-pick|revert|clean\b(?!\s+--dry-run)(?!\s+-[a-zA-Z]*n[a-zA-Z]*\b))/i, reason: "git state change" },
  { re: /\b(brew|apt|apt-get|dnf|yum|pacman|zypper|apk|winget|choco|scoop)\s+(install|add|upgrade|update)\b/i, reason: "package install/upgrade" },
  { re: /\b(npm|pnpm|yarn|bun|pip|pip3|gem|cargo|go)\s+(install|add|i\b|get\b|update|upgrade)\b/i, reason: "package install" },
  { re: /\bkill\b(?!\s+-0\b)(?!\s+-[lL]\b)(?!\s+--list\b)/i, reason: "process termination" },
  { re: /\bStop-Process\b/i, reason: "process termination" },
  { re: /\b(Start|Stop|Restart|Set|New|Remove|Clear|Enable|Disable)-[A-Z]/i, reason: "system object mutation (PowerShell verb)" },
  { re: /\bmkdir\b|\bNew-Item\b|\btouch\b/i, reason: "filesystem write" },
  { re: /\btar\b[^|;]*-[a-zA-Z]*x|\bunzip\b(?![^|;]*\s-[lvZt]+\b)|\bExpand-Archive\b|\b7z\s+x/i, reason: "archive extraction (file writes)" },
  { re: /\bln\s+-s\b|\bNew-Item\b[^|;]*-ItemType\s+SymbolicLink/i, reason: "symlink creation" },
  { re: /\bchmod\b|\bchown\b|\bicacls\b|\bSet-Acl\b/i, reason: "permission/ownership change" },
  { re: /(?:^|[|;&(]\s*|\bsudo\s+)(?:curl\b[^|;]*(-o|-O|--output|--remote-name)|wget\b)|\bInvoke-WebRequest\b[^|;]*-OutFile/i, reason: "file download (network + write)" },
  { re: /(^|[;&|]\s*|\bsudo\s+)service\s+\S+\s+(start|stop|restart|reload|force-reload)\b|\bsystemctl\s+(--?\S+\s+)*(start|stop|restart|reload|try-restart|reload-or-restart|enable|disable|mask|unmask|kill|daemon-reload|daemon-reexec|isolate|set-default|edit|reset-failed|preset|link|revert|set-property|suspend|hibernate)\b|\blaunchctl\s+(load|bootstrap|kickstart)/i, reason: "service control" },
  { re: /\bssh\b(?!-)|\bscp\b|\bsftp\b|\brsync\b(?![^|;]*--dry-run)(?![^|;]*\s-[a-zA-Z]*n[a-zA-Z]*\b)/i, reason: "remote session/transfer" },
  { re: /\btee\b/i, reason: "file write" },
  { re: /\b(brew\s+services\s+(start|stop|restart)|launchctl\s+(load|unload|bootstrap|bootout|kickstart))/i, reason: "service control" },
  { re: /\bdscacheutil\s+-flushcache\b/i, reason: "system cache flush" },
  { re: /\bhistory\s+-[a-zA-Z]*[cw]/i, reason: "shell history modification" },
  { re: /\|\s*crontab\b|\bcrontab\s+(-[re]\b|[^-\s])/i, reason: "scheduled task install" },
  { re: /\s--password=\S+|\b(mysql|mysqldump|mysqladmin|mariadb)\b[^|;]*\s-p[^\s|;]+|\s\/P:[^\s|;]+|-pass\s+pass:[^\s|;]+/i, reason: "secret on the command line" },
  { re: /\bfuser\b[^|;]*-[a-zA-Z]*k\b/i, reason: "kill processes using a resource" },
];

const ELEVATION_RE = /\b(sudo|doas|runas|pkexec|Start-Process\b[^|;]*-Verb\s+RunAs)\b/i;

function splitScan(text, useDepth) {
  const segments = [];
  let current = "";
  let quote = null;
  let depth = 0;
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
    if (useDepth && (ch === "(" || ch === "{" || ch === "[")) depth += 1;
    else if (useDepth && (ch === ")" || ch === "}" || ch === "]")) depth = Math.max(0, depth - 1);
    const atTop = !useDepth || depth === 0;
    if (atTop && (ch === "|" || ch === ";" || ch === "\n")) {
      if (text[i + 1] === "|" && ch === "|") i += 1;
      if (current.trim()) segments.push(current.trim());
      current = "";
      continue;
    }
    if (atTop && ch === "&") {
      if (text[i + 1] === "&") i += 1;
      if (current.trim()) segments.push(current.trim());
      current = "";
      continue;
    }
    if (atTop && ch === ">") {
      if (current.trim()) segments.push(current.trim());
      current = ch + "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) segments.push(current.trim());
  return { segments, depth };
}

// discarding output (2>/dev/null, >$null, 2>&1, | Out-Null) writes nothing the user owns
const NULL_REDIRECT = /\s*(?:[12&]?>>?\s*(?:\/dev\/null|\$null)\b|[12]>&[12]\b|\|\s*Out-Null\b)/gi;

export function splitCommandLine(line) {
  const text = String(line || "").replace(NULL_REDIRECT, "");
  const first = splitScan(text, true);
  if (first.depth > 0) return splitScan(text, false).segments;
  return first.segments;
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
    const VALUE_LONG = new Set(["--arg-file", "--delimiter", "--eof", "--replace", "--max-args", "--max-procs", "--max-lines", "--max-chars"]);
    const toks = args.match(/("[^"]*"|'[^']*'|\S+)/g) || [];
    let i = 0;
    for (; i < toks.length; i += 1) {
      const t = toks[i];
      if (t === "--") {
        i += 1;
        break;
      }
      if (t.startsWith("--")) {
        if (!t.includes("=") && VALUE_LONG.has(t)) i += 1;
        continue;
      }
      if (/^-/.test(t)) {
        if (t.length === 2 && /[adEIJLnPs]/.test(t[1])) i += 1;
        continue;
      }
      break;
    }
    const inner = toks.slice(i).join(" ");
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
  if (head === "start-process") {
    const am = args.match(/-ArgumentList\s+("([^"]*)"|'([^']*)'|(\S+))/i);
    const rest = args
      .replace(/-ArgumentList\s+("([^"]*)"|'([^']*)'|(\S+))/i, " ")
      .replace(/-\w+\s+("[^"]*"|'[^']*')|-\w+/g, " ");
    const prog = (rest.match(/\S+/) || [])[0];
    if (am && prog) return `${prog} ${am[2] || am[3] || am[4] || ""}`;
    if (am) return am[2] || am[3] || am[4] || null;
    return prog || null;
  }
  if (head === "ssh" || head === "sudo" || head === "doas") {
    const m = args.match(/("[^"]+"|'[^']+'|\S+)\s*$/);
    return m ? m[1].replace(/^["']|["']$/g, "") : null;
  }
  return null;
}

const MUTATING_FLAGS = {
  find: /-(delete|fprint|exec(dir)?\s+(?!(ls|echo|printf|file|stat|wc|cat|head|tail|grep|sort|basename|dirname|md5sum|shasum|sha256sum|md5)\b))/,
  sed: /(?:^|\s)(?:--in-place\b|-\w*[iI]\S*)|(?:^|[;{}\s\/'"!])[wW]\s+\S|(?:^|[;{}\s\/'"!0-9$,+^~])e(?:\s+\S|\s*['"]?\s*$)/,
  awk: /(?:^|\s)-i\b|\bsystem\s*\(|\bprint(?:f)?\b[^;|}]*>>?\s*["'\w\/-]|\|\s*["'][^'"]*["']|["'][^'"]*["']\s*\|\s*getline/,
  tar: /^\s+-?[a-zA-Z]*[xcruA]|\s-[a-zA-Z]*[xcruA]|--(extract|create|append|update|delete|get|to-command|use-compress-program|checkpoint-action|info-script|rmt-command|rsh-command)\b|\s-[IF]\s/,
  git: /\s(-O|--open-files-in-pager)|\s-c\s|--output\b|--ext-diff/,
  sort: /\s(-o|--output)\b/,
  yq: /\s(-i|--inplace)\b/,
  dmesg: /\s(-[a-zA-Z]*[cCDEn]|--clear|--read-clear|--console-\w+)\b/,
  tree: /\s-o\b/,
  plutil: /\s-(convert|replace|insert|remove|extract)\b(?![^|;]*-o\s+-(\s|$))/,
  base64: /\s(-o|--output)\b/,
  ss: /\s(-[a-zA-Z]*K|--kill)\b/,
  history: /\s-[cdwranps]\b/,
  go: /\benv\b[^|;]*\s-[wu]\b/,
};

const PWSH_SAFE_VERB = /^(get|test|measure|select|sort|where|format|group|compare|resolve|convertto|convertfrom)$/i;
const PWSH_PURE_BLOCK = /^\{(\s|\$[\w.]+|-[a-z]+|'[^']*'|"[^"$]*"|\d+(\.\d+)?(kb|mb|gb|tb)?|[()!])*\}$/i;

const PWSH_PURE_METHOD = /\.(Add\w*|To\w+|Trim\w*|Split|Substring|Contains|StartsWith|EndsWith|IndexOf|Equals|CompareTo|GetType)\s*\(/gi;
const PWSH_PURE_STATIC = /\[(Environment|DateTime|DateTimeOffset|Math|System\.Environment|IO\.Path|System\.IO\.Path)\]::(Get\w*|Now|UtcNow|Today|Round|Floor|Ceiling|Abs|Max|Min|Combine|GetFileName\w*|GetExtension|GetDirectoryName|MachineName|UserName|OSVersion)\b/gi;
const PWSH_LITERAL_HASH = /@\{(\s*\w+\s*=\s*('[^']*'|"[^"$]*"|\d+)\s*;?)*\s*\}/g;

const PWSH_BLOCK_OPS = /^(join|split|replace|match|notmatch|eq|ne|gt|lt|ge|le|like|notlike|contains|notcontains|in|notin|is|isnot|as|and|or|xor|band|bor|bxor|shl|shr|f|not)$/i;

const PWSH_PURE_CALL = /\.(Add\w*|To\w*|Trim\w*|Split|Substring|Contains|StartsWith|EndsWith|IndexOf|Equals|CompareTo|GetType)\s*\([^()]*\)/gi;

function pwshBlockReadonly(inner) {
  const s = inner.replace(/"[^"]*"|'[^']*'/g, "").replace(PWSH_PURE_CALL, "");
  if (/(^|[^<>=!])=(?![=>])|[>|;&`]|\$\(|@\{|\[[\w.]+\]::|\.\w+\s*\(/.test(s)) return false;
  const verbs = [...s.matchAll(/(?:^|[\s|({])([a-z]+)-[a-z]\w*/gi)].map((m) => m[1]);
  if (verbs.some((v) => !PWSH_SAFE_VERB.test(v) && !PWSH_BLOCK_OPS.test(v))) return false;
  const cleaned = s
    .replace(/\$[\w:]+(\.[\w.]+)*(\s*\([^()]*\))?/g, " ")
    .replace(/\b[\w]+-[\w-]+\b/g, " ")
    .replace(/(^|\s)-[\w?]+\b/g, " ");
  return !/[A-Za-z_]\w*/.test(cleaned);
}

function pwshReadonly(segment) {
  const raw = segment.trim();
  if (/^\$[\w:]+(\.\w+)*(\s+-(split|join|replace|match|notmatch|contains|notcontains|eq|ne|gt|lt|ge|le|like|notlike)\s+('[^']*'|"[^"]*"|\$[\w:.]+|\d+(\.\d+)?))*$/i.test(raw)) return true;
  const s = raw.replace(PWSH_PURE_METHOD, "(").replace(PWSH_PURE_STATIC, "").replace(PWSH_LITERAL_HASH, "");
  if (/(?:^|\s)-WhatIf\b/i.test(raw)) return true;
  const headName = segmentHead(raw).head;
  if (headName === "foreach-object" || headName === "%") {
    const blocks = raw.match(/\{[^{}]*\}/g);
    if (!blocks || !blocks.length) return false;
    const left = s.replace(/\{[^{}]*\}/g, " ");
    if (/[>;&`]|\$\(|@\{|\[[\w.]+\]::|\.\w+\s*\(/.test(left)) return false;
    const leftVerbs = [...left.matchAll(/(?:^|[\s|({])([a-z]+)-[a-z]\w*/gi)].map((m) => m[1].toLowerCase());
    if (leftVerbs.some((v) => v !== "foreach" && !PWSH_SAFE_VERB.test(v) && !PWSH_BLOCK_OPS.test(v))) return false;
    return blocks.every((b) => pwshBlockReadonly(b.slice(1, -1)));
  }
  if (/[>;&`]|\$\(|@\{|\[[\w.]+\]::|\.\w+\s*\(/.test(s)) return false;
  const verbs = [...s.matchAll(/(?:^|[\s|({])([a-z]+)-[a-z]\w*/gi)].map((m) => m[1]);
  if (!verbs.length) return raw !== s && /^[\s(),.\d-]*$/.test(s.replace(/'[^']*'|"[^"$]*"/g, ""));
  if (!PWSH_SAFE_VERB.test(segmentHead(s.replace(/^\(+/, "")).head.split("-")[0])) return false;
  if (!verbs.every((v) => PWSH_SAFE_VERB.test(v))) return false;
  return (s.match(/\{[^{}]*\}/g) || []).every((b) => PWSH_PURE_BLOCK.test(b)) && !/[{}]/.test(s.replace(/\{[^{}]*\}/g, ""));
}

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

  const flagDeny = MUTATING_FLAGS[head === "gawk" ? "awk" : head];
  if (flagDeny && flagDeny.test(" " + args)) {
    return false;
  }

  const windows = shell === "powershell" || shell === "pwsh" || shell === "cmd";
  const table = windows ? READONLY_HEADS_WINDOWS : READONLY_HEADS_UNIX;
  if (windows && pwshReadonly(segment)) {
    return true;
  }
  if (table.has(head) || READONLY_ARGS[head]?.test(args.trim())) {
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
  if (/(?:^|\s)-WhatIf\b/i.test(segment)) {
    return { risk: "low", reason: "dry run (-WhatIf)" };
  }
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
  const masked = segment.replace(/"(?:[^"\\]|\\.)*"|'[^']*'/g, '""');
  if (risk === "low" && />\s*[^|&]/.test(masked)) {
    risk = "moderate";
    reason = "output redirection (file write)";
  }
  return { risk, reason };
}

function substitutionBodies(text, shell) {
  const bodies = [];
  const posix = shell !== "powershell" && shell !== "pwsh" && shell !== "cmd";
  function captureParen(start) {
    let depth = 1;
    let iq = null;
    let inner = "";
    for (let j = start; j < text.length; j += 1) {
      const c = text[j];
      if (iq) {
        inner += c;
        if (c === iq) iq = null;
        continue;
      }
      if (c === "'" || c === '"') {
        iq = c;
        inner += c;
        continue;
      }
      if (c === "(") depth += 1;
      if (c === ")") {
        depth -= 1;
        if (depth === 0) return { inner, end: j };
      }
      inner += c;
    }
    return { inner, end: text.length };
  }
  let quote = null;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quote) {
      if (ch === "\\" && quote === '"') i += 1;
      else if (ch === quote) quote = null;
      else if (posix && quote === '"' && ch === "`") {
        const end = text.indexOf("`", i + 1);
        if (end > i) bodies.push(text.slice(i + 1, end));
        i = end;
      } else if (quote === '"' && ch === "$" && text[i + 1] === "(") {
        const { inner, end } = captureParen(i + 2);
        if (inner.trim()) bodies.push(inner);
        i = end;
      }
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      continue;
    }
    if (posix && ch === "`") {
      const end = text.indexOf("`", i + 1);
      if (end > i) bodies.push(text.slice(i + 1, end));
      i = end;
      continue;
    }
    if ((ch === "$" || ch === "<" || ch === ">") && text[i + 1] === "(") {
      const { inner, end } = captureParen(i + 2);
      if (inner.trim()) bodies.push(inner);
      i = end;
    }
  }
  return bodies;
}

export function analyzeCommand(command, { shell = "sh", _depth = 0 } = {}) {
  const text = String(command || "").trim();
  if (!text) {
    return { risk: "low", readonly: true, tags: ["empty"], reasons: [] };
  }

  let risk = "low";
  const tags = new Set();
  const reasons = [];
  for (const { re, reason } of LINE_CRITICAL) {
    if (re.test(text)) {
      const tags = ["critical"];
      if (/remote script|encoded/i.test(reason)) tags.push("remote-or-encoded");
      return { risk: "critical", readonly: false, tags, reasons: [reason] };
    }
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

  const subs = substitutionBodies(text, shell);
  if (subs.length) {
    tags.add("substitution");
    let allClean = true;
    for (const body of subs) {
      const res = _depth >= 3 ? { readonly: false, risk: "moderate" } : analyzeCommand(body, { shell, _depth: _depth + 1 });
      if (!res.readonly || res.risk !== "low") allClean = false;
      if (RISK_SCORE[res.risk] > RISK_SCORE[risk]) risk = res.risk;
      if (res.reasons?.length) reasons.push(...res.reasons);
    }
    if (!allClean) {
      if (RISK_SCORE[risk] < RISK_SCORE.moderate) risk = "moderate";
      readonly = false;
    }
  } else if (/`[^`]+`|\$\(|<\(|>\(/.test(text)) {
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
