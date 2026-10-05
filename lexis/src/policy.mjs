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
  "command", "history", "fc", "man", "apropos", "tldr", "whatis", "where", "help", "wc", "grep",
  "egrep", "fgrep", "rg", "fd", "find", "tree", "awk", "gawk",
  "readlink", "realpath", "dirname", "basename", "locate", "strings",
  "zcat", "dmesg", "lastlog",
  "sort", "cut", "tr", "diff", "cmp", "md5", "md5sum", "shasum", "sed", "xargs",
  "sha256sum", "sha1sum", "sha512sum", "b2sum", "b3sum", "cksum", "sum", "base64",
  "od", "hexdump", "jq", "yq", "pbcopy", "paste", "join", "nm",
  "xclip", "xsel", "wl-copy", "wl-paste",
  "pbpaste", "mdls", "ioreg", "iostat", "vm_stat", "memory_pressure",
  "locale", "kextstat",
  "nproc", "arch", "getconf", "lsb_release", "os-release",
  "ping", "fping", "traceroute", "nslookup", "dig", "host",
  "lsblk", "lsusb", "lspci", "blkid",
  "lscpu", "lsmem", "lsmod", "vmstat", "mpstat", "findmnt", "comm", "jobs", "pidof", "pstree", "getent",
  "otool", "xzless", "zless", "pg_isready", "mountpoint", "lastb", "gzcat",
  "pmap", "ipcs", "jstack", "wdctl", "systemd-cgtop", "sensors", "nettop",
  "xrandr", "shuf", "yes", "fold", "column", "rev", "zrun", "bzcat", "zmore",
  "funzip", "bzgrep", "isutf8", "dircolors", "ppmhist", "xmllint", "osv-scanner",
  "networkctl", "say", "getfacl", "groups", "xclip", "wl-copy", "wl-paste", "xsel",
  "pushd", "popd", "dirs", "cd", "read", "sleep", "wait", "bg", "fg", "disown",
  "umask", "unset", "export", "declare", "local", "typeset", "let", "bind", "shopt",
  "alias", "test", "[", "[[", "rbash", "pr", "seq", "numfmt", "factor",
  "jot", "base32", "fmt", "expand", "unexpand", "lsattr",
  // loop/control keywords carry no risk themselves; inner segments still gate
  "while", "until", "for", "do", "done", "if", "then", "else", "elif", "fi",
  "in", "case", "esac", "select", "set", "clear", "uuidgen", "afinfo", "bc",
  "dir", "vdir", "sample", "getenforce",
  "whois", "modinfo", "trash-list", "iconv",
]);

const READONLY_HEADS_WINDOWS = new Set([
  "get-childitem", "gci", "dir", "ls", "get-content", "gc", "type", "cat",
  "get-process", "gps", "ps", "get-command", "gcm", "get-item", "gi",
  "get-location", "gl", "pwd", "get-host", "get-date", "get-history",
  "get-service", "gsv", "get-psdrive", "get-volume", "get-disk", "get-windowsoptionalfeature",
  "get-netipaddress", "get-netadapter", "test-connection", "resolve-dnsname",
  "get-computerinfo", "get-ciminstance", "get-wmiobject", "get-localuser",
  "get-localgroup", "get-childitem env:", "echo", "write-output",
  "whoami", "hostname", "systeminfo", "tasklist", "where",
  "ver", "set", "driverquery", "get-executionpolicy", "measure-command",
  "netstat", "ping", "nslookup", "findstr", "tracert", "pathping", "getmac",
  "out-host", "out-string", "out-null", "out-default", "out-lineoutput",
  "format-table", "format-list", "format-wide", "format-custom", "format-hex",
  "import-csv", "import-clixml", "find-netroute", "read-host", "clip",
  "set-location", "sl", "cd", "chdir", "write-host", "write-verbose",
  "write-debug", "write-information", "get-clipboard", "get-filehash",
  "sort", "sls", "sleep",
  "get-itemproperty", "get-itempropertyvalue", "get-psbreakpoint",
  "enable-psbreakpoint", "disable-psbreakpoint", "get-alias", "get-variable",
  "get-verb", "get-module", "get-psprovider", "new-scheduledtasktrigger",
  "start-sleep", "while", "for", "if", "else", "elseif", "switch",
  "do", "until", "in", "traceroute",
  "quser",
]);

const READONLY_ARGS = {
  ip: /^(?!.*\b(link\s+set|addr\s+(add|del|delete|change|replace)|route\s+(add|del|delete|change|replace)|neigh\s+(add|del|delete|change|replace)|rule\s+(add|del|delete|flush)|maddress\s+(add|del)|netns\s+(add|delete|exec)|batch|save|restore|flush|exec|attach|detach|monitor)\b)/,
  ifconfig: /^(-[a-zA-Z]+\s*)*(\w+(\s+-?v)?)?\s*$/,
  route: /^(?!.*\b(add|delete|del|change|flush|replace)\b)/,
  arp: /^(?!.*(^|\s)-[dsSf]\b)/,
  hostname: /^(-[a-zA-Z]+\s*)*$/,
  date: /^(?![A-Za-z0-9_])(?!.*(?:^|\s)-[a-zA-Z]*[sS]\b)(?!.*--set\b)/,
  nvram: /^(?!.*(=|(^|\s)-[dcf]\b))/,
  uniq: /^(-\S+(\s+\d+)?\s*)*("[^"]*"|'[^']*'|[^\s-]\S*)?\s*$/,
  xxd: /^(?!.*(^|\s)-r\b)(-\S+(\s+\d+)?\s*)*("[^"]*"|'[^']*'|[^\s-]\S*)?\s*$/,
  tar: /^(?:-?[a-z]*t[a-z]*|-?[a-z]*c[a-z]*f\s*-|-?[a-z]*x[a-z]*O[a-z]*\b)(?:\s|$)/i,
  strace: /^(?![^|;]*(?:^|\s)-[a-zA-Z]*[op])/,
  zip: /^\s*-(l|sf|version|h)\b/,
  "new-object": /^(?![^|;]*(FileStream|StreamWriter|StreamReader|Process\b|ServiceController|ComObject|WebClient|Sockets|Net\.Web|IO\.File\b|IO\.Directory|IO\.Stream|EventLog\b|ServiceProcess|Registry))/i,
  journalctl: /^(?!.*--(vacuum|rotate|flush|setup-keys|relinquish|sync|update-catalog))/,
  networksetup: /^-(get|list|print|show)\w*/i,
  attrib: /^(?!.*(^|\s)[+-][rahsiv]\b)/i,
  icacls: /^(?!.*\/(grant|deny|remove|reset|setowner|restore|save|setintegritylevel|inheritance|substitute))/i,
  powercfg: /^\/(a|availablesleepstates|l|list|lastwake|q|query|getactivescheme|devicequery|requests)\b/i,
  schtasks: /^\/(query|g|tn|xml)\b/i,
  tzutil: /^\/(g|l)\b/i,
  timedatectl: /^(\s*(status|show|list-timezones|timesync-status|show-timesync)\b.*|\s*)$/,
  loginctl: /^(list-\w+|show-\w+|session-status|user-status|seat-status)?(\s|$)/,
  hostnamectl: /^(status)?\s*$/,
  ulimit: /^(-[a-zA-Z]+\s*)*$/,
  nl: /^(-\S+\s*)*("[^"]*"|'[^']*'|\S+)?\s*$/,
  hdiutil: /^(verify|imageinfo|info|pmap|isencrypted)\b/,
  "xcode-select": /^(-p|--print-path|-v|--version)\s*$/,
  xcrun: /^(--find|-f|--show-sdk-\w+|simctl\s+list)\b/,
  kill: /^\s*(-0|-[lL]\b|--list\b|--signal\s+(0|EXIT|HUP)\b)/,
  // clipboard capture only; any file target or capture flag writes a file
  screencapture: /^(?=[^|;]*-c\b)(?:\s*-?[a-zA-Z]+\s*)*$/,
  codesign: /^(?![^|;]*\s-[a-zA-Z]*[sroafA]\w*)(?![^|;]*--(sign|remove-signature|options|force))(?=\s*-(d\w*|v+|V\b)|\s*--(verify|display|detailed|entitlements|extract-entitlements|predicate|deep|strict|verbose|requirements|timestamp|identifier|keychain|all-architectures))/i,
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
  dism: /^\/online\s+\/(get-\w+|cleanup-image\s+\/(scanhealth|checkhealth|get-\w+)|english)\b/i,
  netsh: /^(?!.*\b(set|add|delete|exec|import|dump)\b)(?=[^|;]*\bshow\b)/i,
  curl: /^(?![^|;]*(?:^|\s)-[a-zA-Z]*[cdDFKT](?=[\s=]|$))(?![^|;]*(?:^|\s)-[a-zA-Z]*O\b)(?![^|;]*(?:^|\s)-[a-zA-Z]*o\s+(?!-(?:\s|$)|\/dev\/null\b|NUL\b|nul\b))(?![^|;]*--output(?:=|\s+)(?!-(?:\s|$)|\/dev\/null\b|NUL\b|nul\b))(?![^|;]*(?:^|\s)-[a-zA-Z]*u\s+)(?![^|;]*(?:^|\s)-[a-zA-Z]*X\s+(?!GET\b|HEAD\b|OPTIONS\b))(?!(?=[^|;]*--data-urlencode\b)(?![^|;]*(?:^|\s)-G\b))(?![^|;]*--(data(?!-\w)|data-raw|data-binary|json|form|form-string|upload-file|config|remote-name|remote-name-all|cookie-jar|dump-header|trace|trace-ascii|stderr|user|request\s+(?!GET\b|HEAD\b|OPTIONS\b))\b)/,
  wget: /^(?=[^|;]*(?:--spider\b|(?:^|\s)-[\w-]*O(?=\s*-|-)|--output-document[\s=]+\s*-(?=\s|$)))(?![^|;]*(?:^|\s)-[\w-]*O\s+(?!\s*-))(?![^|;]*--output-document[\s=]+\s*(?![-|/]))/,
  nc: /^(?![^|;]*(?:^|\s)-[a-zA-Z]*[lkLeEo])(?=[^|;]*(?:^|\s)-[a-zA-Z]*z[a-zA-Z]*\b)/,
  "ssh-add": /^\s*-[lL]+\s*$/,
  ssh: /(?:^|\s)-[a-zA-Z]*G\b/,
  // -p/--power with no value is a query; -p 0|1 toggles Bluetooth power
  blueutil: /^\s*(-p|--power)?\s*$/,
  // -g/--getProperty queries; -s/--out/--resample*/--crop* write the image
  sips: /^(?:(?=(?:^|\s)-g\s+\S)|(?=^\s*-(?:h|H)\s*$)|(?=^\s*--help\s*$))(?![^|;]*(?:^|\s)--?(?!g\b|h\b|H\b|getProperty\b|help\b)[\w-])/,
  afconvert: /^\s*(-h[a-zA-Z]*|--help)?\s*$/,
  // -p previews; -t renders thumbnails and -o writes — deny any other flag
  qlmanage: /^(?=[^|;]*(?:^|\s)-p\b)\s*(-p\b\s*)*((?!-)\S+\s*)*$/,
  textutil: /^\s*-(info|help)\b(\s+(?!-)\S+)*\s*$/,
  // ncdu can delete files interactively; -r/--read-only disables that —
  // -o/-f still write/import files even under -r
  ncdu: /^(?=[^|;]*(?:^|\s)(?:-r\b|--read-only\b))(?![^|;]*(?:^|\s)-(?:o|f)\b)[^|;]*$/,
  mtr: /^(?=[^|;]*(?:^|\s)(?:--report(?:-wide)?\b|-\w*r\w*\b))[^|;]*$/,
  query: /^\s*(user|session|process|termserver|winsta|qappsrv|qprocess|quser|qwinsta)(\s|$)/i,
  sntp: /^(?![^|;]*(?:^|\s)-[sS]\b)/,
  certutil: /^-hashfile\b/i,
  ipconfig: /^(\s*\/(all|displaydns|allcompartments|showclassid)\b.*)?$/i,
  sfc: /^\/(verifyonly|scanfile=|\?)/i,
  wevtutil: /^(?![^|;]*\/o[:=\s])qe\b/i,
  robocopy: /\/L(?=[\s/]|$)/i,
  fsutil: /^(volume\s+diskfree|fsinfo|reparsepoint\s+query)\b/i,
  prlimit: /^(?![^|;]*[a-zA-Z]=)/,
  sysctl: /^(?!.*(?:^|\s)-[wWp]\b)(?!.*(?:^|\s)--load\b)(?!.*=)/,
  net: /^(user|accounts|view|share|config|statistics|localgroup|group|session|file|time|use|print|help|start|stop|pause|continue)(\s+\S+)?\s*$/i,
  wmic: /^(?![^|;]*\b(call|create|delete|set)\b)(?=[^|;]*\b(get|list)\b)/i,
  pandoc: /^(?![^|;]*\s(-o|--output|--extract-media|--data-dir|--template|--standalone\b[^|;]*-o))/i,
  "yt-dlp": /^\s*(-F\b|--(list-|dump|print|simulate|skip-download|get-))/,
  "youtube-dl": /^\s*(-F\b|--(list-|dump|print|simulate|skip-download|get-))/,
  ffmpeg: /^(?![^|;]*-i\s+("[^"]+"|'[^']+'|\S+)\s+("[^"]+"|'[^']+'|\S+))/,
  az: /^(?![^|;]*\b(delete|create|set|update|remove|add|assign|deallocate|stop|start|restart|apply|import|export|deploy|invoke|run|exec|attach|reset|revoke|rotate|renew|regenerate|upload|copy|move|rename|patch|extension)\b)(?=[^|;]*\b(list|show|generate-sas|version|account)\b)/i,
  gcloud: /^(?![^|;]*\b(delete|create|set|update|remove|add|deploy|apply|import|export|stop|start|reset|revoke|rotate|upload|copy|move|rename|patch|enable|disable|deploy|submit|build|push|install)\b)(?=[^|;]*\b(list|describe|info|version|read|get|config)\b)/i,
  kubectl: /\bset\s+env\b[^|;]*--list\b/i,
  "iwr": /^(?![^|;]*\()(?![^|;]*-(OutFile|Method\s+(?!GET|HEAD|OPTIONS)|Body|InFile|Form|UploadFile))/i,
  irm: /^(?![^|;]*\()(?![^|;]*-(OutFile|Method\s+(?!GET|HEAD|OPTIONS)|Body|InFile|Form|UploadFile))/i,
  "invoke-webrequest": /^(?![^|;]*\()(?![^|;]*-(OutFile|Method\s+(?!GET|HEAD|OPTIONS)|Body|InFile|Form|UploadFile))/i,
  "invoke-restmethod": /^(?![^|;]*\()(?![^|;]*-(OutFile|Method\s+(?!GET|HEAD|OPTIONS)|Body|InFile|Form|UploadFile))/i,
  logrotate: /(^|\s)-[a-zA-Z]*d[a-zA-Z]*\b/,
  mdutil: /^\s*-[psLV]\b/i,
  psql: /^(?![^|;]*\b(insert|update|delete|drop|alter|create|truncate|grant|revoke|call|copy|vacuum|analyze\s+\w|comment|reindex|cluster|refresh|notify|unlisten|begin|commit|rollback|prepare\s+\w+\s|execute|deallocate|declare|fetch|close|lock|security|do\b|discard|merge|set\s)\b)(?=[^|;]*-c\b)/i,
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
    "reflog", "reflog show", "cat-file", "count-objects", "for-each-ref", "name-rev", "merge-base",
    "verify-tag", "verify-commit", "ls-remote", "show-ref", "diff-files", "whatchanged",
    "range-diff", "rev-list", "cliff", "hash-object", "config --get", "config -l",
    "config --get-regexp", "config --show-origin", "changelog",
  ]),
  wsl: new Set(["--status", "--list", "-l", "--verbose", "--version", "--help", "--list --online", "--list --verbose", "--list --all", "--list --running", "--export --help", "--cd", "-d", "--distribution"]),
  tmux: new Set(["ls", "list-sessions", "list-windows", "list-panes", "list-clients", "show-options", "-V",
    "select-pane", "split-window", "display-message", "rename-window", "select-window", "show"]),
  screen: new Set(["-ls", "-list", "-v"]),
  rpm: new Set(["-qa", "-q", "-qi", "-ql", "-qf", "--query", "-V", "--verify"]),
  "firewall-cmd": new Set(["--list-all", "--list-ports", "--list-services", "--state", "--get-active-zones",
    "--get-default-zone", "--list-all-zones", "--list-protocols", "--list-source-ports", "--list-icmp-blocks",
    "--list-forward-ports", "--list-interfaces", "--list-sources", "--get-zones", "--get-services",
    "--get-icmptypes", "--get-zone-of-interface", "--get-active-port", "--get-active-services",
    "--query-service", "--query-port", "--query-masquerade", "--query-forward-port", "--query-interface",
    "--query-source", "--info-service", "--info-zone", "--info-icmptype", "--get-log-denied", "--get-target",
    "--permanent --list-all", "--permanent --list-ports", "--permanent --list-services",
    "--permanent --get-default-zone", "--permanent --get-zones", "--permanent --get-services"]),
  iptables: new Set(["-L", "-S", "--list", "-nL", "-nvL", "-vnL", "-L -n", "-L -v -n", "-L -n -v", "-l", "-s", "-nl", "-nvl", "-vnl", "-l -n", "-l -v -n", "-l -n -v", "-nxl", "-lvnx"]),
  cargo: new Set(["install --list", "--version", "tree", "metadata", "audit", "audit --version", "audit db"]),
  unzip: new Set(["-l", "-v", "-t", "-Z", "-p"]),
  "apt-mark": new Set(["showmanual", "showauto", "showinstall", "showremove", "showpurge", "showhold"]),
  "xdg-open": new Set([""]),
    node: new Set(["--version", "-v", "--help"]),
  npm: new Set(["--version", "-v", "list", "ls", "view", "info", "search", "outdated", "audit", "audit signatures", "config get", "prefix", "root", "whoami", "doctor", "help", "explain", "why", "=version", "find-dupes", "profile get", "ping", "cache ls", "token list", "-g ls", "-g list", "-g outdated", "--global ls", "--global list", "--global outdated"]),
  npx: new Set(["--version", "-v"]),
  pnpm: new Set(["--version", "-v", "list", "ls", "outdated", "why", "info", "doctor"]),
  yarn: new Set(["--version", "-v", "list", "info", "why"]),
  bun: new Set(["--version", "-v", "why", "info", "pm version", "pm ls", "audit", "list", "outdated"]),
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
  scutil: new Set(["--dns", "--proxy", "--nc list", "--nc status", "--nwi", "--rni", "--get", "get ", "show "]),
  zoxide: new Set(["query", "init", "--version", "-V", "import --list"]),
  diskutil: new Set(["list", "info", "apfs list", "apfs listusers", "apfs listsnapshots", "cs list", "corestorage list", "listfilesystems", "activity", "verifydisk", "verifyvolume", "verifypermissions", "verifyroot"]),
  launchctl: new Set(["list", "print", "print-cache", "print-disabled", "procinfo", "hostinfo", "getenv", "version"]),
  log: new Set(["show", "stream", "stats", "config --status", "config --property", "erase --status"]),
  crontab: new Set(["-l"]),
  softwareupdate: new Set(["-l", "--list", "--history", "--dump-state"]),
  dscl: new Set([". -read", ". -readall", ". -list", ". -cat", ". -search", "-read", "-readall", "-list", "-cat", "-search"]),
  sysctl: new Set(["-n", "-a", "-h"]),
  apt: new Set(["list", "show", "search", "policy", "depends", "rdepends", "--version"]),
  "apt-get": new Set(["--version", "satisfy"]),
  "apt-cache": new Set(["policy", "show", "search", "depends", "stats"]),
  dpkg: new Set(["-l", "--list", "-s", "--status", "-L", "--listfiles", "--version", "-v", "--verify"]),
  go: new Set(["env", "version", "--version", "list", "doc", "help", "tool", "fmt -n"]),
  dnf: new Set(["list", "info", "search", "--version", "history", "history info", "history list", "repoquery", "check-update", "repolist", "grouplist", "group list", "module list", "module info", "installed", "provides", "deplist", "repos", "repos -l"]),
  yum: new Set(["list", "info", "search", "--version", "history", "history info", "check-update", "repolist", "provides", "deplist"]),
  pacman: new Set(["-Q", "-Qi", "-Ql", "-Qs", "-Qu", "-Si", "-Ss", "--version", "-q", "-qi", "-ql", "-qs", "-qu", "-si", "-ss", "-qe", "-qn", "-qm", "-qg"]),
  zypper: new Set(["se", "search", "info", "if", "lr", "--version"]),
  apk: new Set(["info", "list", "search", "--version"]),
  snap: new Set(["list", "info", "find", "--version", "services", "--help", "-h", "help", "version", "changes"]),
  flatpak: new Set(["list", "info", "search", "--version"]),
  winget: new Set(["list", "search", "show", "--version", "source list", "=upgrade", "=upgrade --include-unknown", "features"]),
  choco: new Set(["list", "search", "info", "--version", "outdated"]),
  scoop: new Set(["list", "search", "info", "status", "--version"]),
  docker: new Set(["ps", "images", "inspect", "logs", "version", "info", "stats --no-stream", "compose ls", "compose ps", "compose logs", "compose config", "compose top", "compose images", "top", "port", "diff", "system df", "system info", "network ls", "volume ls", "context ls", "manifest inspect", "buildx ls", "scout cves"]),
  "docker-compose": new Set(["logs", "ps", "config", "top", "images", "version", "ls"]),
  kubectl: new Set(["get", "describe", "logs", "version", "config view", "config current-context", "config get-contexts", "api-resources", "explain", "top", "rollout status", "rollout history", "cluster-info", "api-versions", "auth can-i", "alpha events", "events"]),
  systemctl: new Set(["status", "list-units", "list-unit-files", "is-active", "is-enabled", "is-failed", "show", "show-environment", "cat", "--version", "list-timers", "list-jobs", "list-sockets", "list-paths", "list-dependencies", "=--failed"]),
  "systemd-analyze": new Set(["", "blame", "time", "critical-chain", "verify", "cat-config", "unit-paths", "dot", "dump", "plot", "calendar", "timespan", "timestamp", "capability", "syscall-filter", "filesystems", "pcrs", "srpm"]),
  resolvectl: new Set(["status", "query", "statistics", "domain", "legend", "default-route", "dns", "dnssec", "nta", "llmnr", "mdns", "tlsa", "openpgp", "reset-statistics?"]),
  ollama: new Set(["list", "ps", "show", "--version"]),
  llm: new Set(["--version", "models"]),
  sc: new Set(["query", "qc", "queryex", "qfailure", "qdescription", "qconfig", "enumdepend", "qtriggerinfo", "interrogate", "getdisplayname", "getkeyname", "showsid", "querytype", "qprivs", "qmanagedby", "sdshow"]),
  slmgr: new Set(["/xpr", "/dli", "/dlv", "/div"]),
  wevtutil: new Set(["el", "gl", "gli", "ep", "um"]),
  security: new Set(["find-certificate", "find-identity", "list-keychains", "verify-cert", "show-keychain-info", "get-keychain-settings", "list-smartcards", "cms -d", "cms -e"]),
  spctl: new Set(["-a", "--assess", "-v", "--status", "--version", "status"]),
  bluetoothctl: new Set(["paired-devices", "devices", "show", "list", "info", "--version"]),
  "nix-env": new Set(["-q", "--query", "-qa", "--query --available"]),
  "dns-sd": new Set(["-b", "-z", "-q", "-l", "-g", "-e", "-v"]),
  // reg add/delete/import are covered by risk patterns; only query reads
  reg: new Set(["query", "/?"]),
  tailscale: new Set(["ip", "status", "version", "whois", "ping", "netcheck"]),
  nmcli: new Set(["device wifi list", "dev wifi list", "device wifi", "dev wifi", "d wifi", "device status", "dev status", "device show", "dev show", "d s", "d status", "connection show", "general status", "general", "radio wifi", "-t"]),
  swapon: new Set(["--show", "-s", "--bytes"]),
  "dpkg-query": new Set(["-l", "-w", "-s", "--status", "--listfiles", "-L", "-p", "--print-avail", "--version", "--list", "-W", "--show"]),
  pkgutil: new Set(["--check-signature", "--files", "--pkg-info", "--file-info", "--bom", "--lsbom", "--file-info-plist"]),
  tmutil: new Set(["listlocalsnapshotdates", "listlocalsnapshots", "listbackups", "destinationinfo", "status", "latestbackup"]),
  lpoptions: new Set(["-l", "-d"]),
  sharing: new Set(["-l"]),
  fdesetup: new Set(["isactive", "status", "hastrgd", "haspersonalrecoverykey", "hasinstitutionalrecoverykey", "list", "showdeferralinfo", "supportsfilevault"]),
  csrutil: new Set(["status", "authenticated-root status", "netboot list"]),
  pyenv: new Set(["versions", "version", "--version", "root", "prefix", "latest", "whence", "which"]),
  rustup: new Set(["component list", "show", "--version", "target list", "toolchain list", "check", "which"]),
  uv: new Set(["python dir", "export", "pip list", "pip show", "pip freeze", "tool list", "--version", "python list", "python find", "cache dir"]),
  pants: new Set(["list", "--version", "roots", "targets"]),
  swift: new Set(["format --check", "--version", "package describe", "package dump-package"]),
  xattr: new Set(["-l", "-p", "-h"]),
  mount: new Set([""]),
  fdisk: new Set(["-l"]),
  mountpoint: new Set([""]),
  "gh": new Set(["status", "repo view", "repo list", "issue list", "issue view", "issue status", "pr list", "pr status", "pr view", "pr diff", "pr checks", "release list", "release view", "--version", "auth status", "search code", "search repos", "search issues", "search prs", "search commits", "org view", "org list", "workflow list", "workflow view", "run list", "run view", "gist list", "api"]),
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
  { re: /\b(pbpaste|xclip\b[^|;]*-o\b|xsel\b[^|;]*-o\b|wl-paste|Get-Clipboard)\b[^|;]*\|\s*(sudo\s+)?(sh|bash|zsh|dash|ksh|fish|pwsh|powershell|cmd|iex|Invoke-Expression|python\d*|node|perl|ruby)\b|\b(iex|Invoke-Expression)\s*\(?\s*Get-Clipboard\b/i, reason: "clipboard content executed by an interpreter" },
  { re: /\b(base64\b[^|;]*-d\b|base32\b[^|;]*-d\b|openssl\b[^|;]*-d\b|certutil\b[^|;]*-decode\b|tar\b[^|;]*(?:-[a-zA-Z]*O\b|-[a-zA-Z]*O[a-zA-Z]|--to-stdout\b)|unzip\b[^|;]*\s-p\b|zcat\b|gzcat\b|xzcat\b|lzcat\b|bzcat\b|gunzip\b[^|;]*-c\b|bunzip2\b[^|;]*-c\b|unxz\b[^|;]*-c\b)\b[^|;]*\|\s*(sudo\s+)?(sh|bash|zsh|dash|ksh|fish|pwsh|powershell|cmd|iex|Invoke-Expression|python\d*|node|perl|ruby)\b/i, reason: "decoded or archived content piped to an interpreter" },
  { re: /\b(curl|wget|iwr|irm|Invoke-(WebRequest|RestMethod))\b[^|;]*-[a-zA-Z]*o\b[^|;]*(&&|;|\|\|)\s*[^|;]*\b(bash|sh|zsh|fish|pwsh|powershell|python\d*|node|perl|ruby|cmd|\.\/)/i, reason: "download followed by immediate execution" },
  { re: /\bGet-Process\b[^|;]*\|[^|;]*\bForEach-Object\b[^|;]*\$_\s*\.Kill\s*\(/i, reason: "terminate every process" },
  { re: /\bGet-ChildItem\b[^;]*\|\s*(ForEach-Object|%)\b[^;]*\$_\s*\.(Delete|Kill|Remove)\s*\(/i, reason: "mass destruction via enumeration" },
  { re: /\b(echo|printf)\b[^|;]*?\b(rm|mv|dd|mkfs|chmod|chown|shutdown|reboot)\b[^|;]*\|\s*(sudo\s+)?(sh|bash|zsh|fish|pwsh|powershell|cmd)\b/i, reason: "generated destructive command piped to interpreter" },
];

const LINE_HIGH = [
  { re: /\|\s*(sudo\s+)?(sh|bash|zsh|dash|ksh|fish|pwsh|powershell|cmd|iex|Invoke-Expression)\b/i, reason: "pipeline feeds a shell interpreter", mask: true },
  { re: /\bxargs\b[^|;]*\b(sh|bash|zsh|dash|ksh|fish|pwsh|powershell|cmd|eval)\b/i, reason: "xargs invoking a shell", mask: true },
  { re: /\b(?:Get-ChildItem|gci|dir|ls|Get-Process|Get-Item|Get-CimInstance|Get-WmiObject|Get-Service|Get-Content)\b[^|;]*\|\s*(?:ForEach-Object|%|Where-Object|\?|Select-Object)\b[^;|]*\{[^}]*\b(?:Remove-Item|ri|rd|rmdir|del|erase|rm|Stop-Process|Stop-Service)\b/i, reason: "enumerated deletion via pipeline scriptblock", mask: true },
  { re: /(?:^|[;|&]\s*|\bsudo\s+|\bdo\s+|\bthen\s+)(\.|source)\s+[^\s|;&"'`]+/, reason: "sources a script file", mask: true },
  { re: /(?:^|[;|&]\s*|\bsudo\s+|\bdo\s+|\bthen\s+)(sh|bash|zsh|dash|ksh|fish|pwsh|powershell)\s+(?:(?!-[a-zA-Z]*[ceE]\b)-[\w-]+\s+)*(?:\.{0,2}[\/~]|[A-Za-z]:[\/\\]|[^\s|;&-]+\.(sh|bash|zsh|fish|ps1|bat|cmd|py|rb|pl)\b)/i, reason: "interpreter running a script file" },
  { re: /(?:^|[;|&]\s*)&\s*(?:\{[^{}]*\b(?:Remove|Stop|Start|Set|New|Add|Clear|Disable|Enable|Rename|Move|Copy|Invoke|Kill|Delete|Format|Unregister|Register|Restart|Mount|Dismount)-|\{[^{}]*\b(?:rm|del|erase|kill|chmod|chown|dd|mkfs|shutdown|reboot|mount|umount|mv|cp|touch|mkdir|ln|curl|wget|iex|Invoke-Expression|bash|sh|pwsh|powershell)\b|\$[\w.:]|["']?[~/.\w\\:][^\s|;&]*\.(?:ps1|bat|cmd|sh|exe)\b)/i, reason: "invocation operator running a mutation or script" },
  { re: /\b(iex|Invoke-Expression)\b/i, reason: "expression evaluation of dynamic input", mask: true },
  { re: /(Get-ChildItem|gci|dir|ls)\b[^|;]*\|\s*Remove-Item\b(?![^|;]*-WhatIf)/i, reason: "bulk deletion via pipeline", mask: true },
  { re: /\|\s*(Remove-Item|ri|rd|rmdir|del|erase)\b(?![^|;]*-WhatIf)/i, reason: "pipeline-fed deletion", mask: true },
  { re: /\b(base64|openssl\s+enc|certutil)\b[^|;]*(-d|-decode|--decode)[^|;]*\|\s*(sh|bash|zsh|pwsh|powershell|iex)\b/i, reason: "encoded payload piped to interpreter", mask: true },
  { re: /\b(powershell|pwsh)\b[^|;]*-e(nc|nc|ncodedcommand)?\s+[a-zA-Z0-9+/=]{8,}/i, reason: "encoded PowerShell command", mask: true },
  { re: /\$\(\s*(curl|wget|iwr|irm)\b/i, reason: "command substitution over the network", mask: true },
  { re: /\beval\b/i, reason: "eval of dynamic input", mask: true },
];

const CRITICAL_PATTERNS = [
  { re: /\bRemove-Item\b[^|;]*-Recurse[^|;]*-Force[^|;]*\b(C:\\|$env:USERPROFILE|%USERPROFILE%|\*|~\\?$)/i, reason: "recursive forced delete of a drive root or profile" },
  { re: /\b(mkfs|sfdisk|parted|wipefs|diskutil\s+(eraseDisk|eraseVolume|apfs\s+deleteContainer|partitionDisk)|format\b[^|;]*\s+[a-z]:)/i, reason: "disk format/partition operation" },
  { re: /\bfdisk\b(?!\s+-l\b)/i, reason: "disk partition operation" },
  { re: /\bdd\b[^|;]*\bof=\s*\/dev\/(sd|hd|vd|xvd|nvme|mmcblk|rdisk|disk)[\w.-]*/i, reason: "raw write to a block device" },
  { re: /\b(?:shred|srm|gshred|wipe)\b[^|;]*\/dev\/(sd|hd|vd|xvd|nvme|mmcblk|rdisk|disk)[\w.-]*/i, reason: "secure wipe of a block device" },
  { re: />\s*["']?\/dev\/(sd|hd|vd|xvd|nvme|mmcblk|rdisk|disk)[\w.-]*/i, reason: "redirect write to a block device" },
  { re: /\btee\b[^|;]*\/dev\/(sd|hd|vd|xvd|nvme|mmcblk|rdisk|disk)[\w.-]*/i, reason: "write to a block device via tee" },
  { re: /\bgit\s+push\b[^|;]*(--force|-f\b)[^|;]*\b(main|master|production|prod)\b/i, reason: "force push to a primary branch" },
  { re: /(^|[;&|(]\s*|\bsudo\s+|\bsystemctl\s+)(shutdown|poweroff|halt|reboot)\b|\b(Stop-Computer|Restart-Computer)\b|(^|[;&|(]\s*|\bsudo\s+)(init|telinit)\s+[06]\b/i, reason: "system power operation" },
  { re: /\b(Format-Volume|Clear-Disk|Remove-Partition|Resize-Partition|Initialize-Disk)\b/i, reason: "disk format/partition operation" },
  { re: /\bRename-Computer\b[^|;]*-Restart\b/i, reason: "rename with automatic reboot" },
  { re: /\bvssadmin\b[^|;]*\b(delete|resize|revert)\b/i, reason: "shadow copy deletion" },
  { re: /\bbcdedit\b[^|;]*\/(set|deletevalue|delete|create|copy|import|default|timeout|bootsequence|displayorder|dbgsettings|debug|ems|emssettings|inherit)\b/i, reason: "boot configuration change" },
  { re: /\bmshta\b/i, reason: "script execution host (mshta)" },
  { re: /\b(nc|ncat|netcat)\b[^|;]*(--exec\b|--sh-exec\b|-[a-zA-Z]*[eEcC]\s)/i, reason: "listener piping to a shell" },
  { re: /\bpython\d*\b[^|;]*-[a-zA-Z]*c\s+["'][^"']*\b(exec|eval)\b[^"']*\b(base64|b64decode|fromhex|unhex|atob|binascii|marshal|pickle|zlib)|\bperl\b[^|;]*-[a-zA-Z]*e\s+["'][^"']*\b(eval|exec|system)\b[^"']*\b(decode_base64|base64|hex|unpack)/i, reason: "interpreter exec of a decoded payload" },
  { re: /\bat\b[^|;]*\b(shutdown|reboot|poweroff|halt|init\s+[06]|rm\s+-[a-zA-Z]*[rf][a-zA-Z]*\s+\/)/i, reason: "scheduled destructive command" },
  { re: /\bdocker\s+system\s+prune\b[^|;]*--volumes\b/i, reason: "prune including named volumes" },
  { re: /\btar\b[^|;]*-[a-zA-Z]*[xj][^|;]*-C\s+["']?(\/|\/(etc|usr|bin|sbin|var|root|boot|System|Library|opt)\b)/i, reason: "archive extraction into a system path" },
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
  { re: /\brm\s+-[a-zA-Z]*[rf][a-zA-Z]*\s*["']?(\/|~|\$HOME|\*|\/tmp|\/(etc|usr|var|bin|sbin|System|Library|Users|home|root|boot|private))(?=["'\s;|$*\/]|$)/i, reason: "recursive delete of a protected path", rmHead: true },
  { re: /\bfind\s+["']?(\/|~|\$HOME|\/(etc|usr|var|bin|sbin|System|Library|Users|home|root|boot|private))(?=[\s"'\/])[^|;]*-exec(dir)?\s+rm\b/i, reason: "recursive delete of a protected path via find", rmHead: true },
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
  { re: /\bgit\s+(reset\s+--hard|clean\s+-[a-zA-Z]*f(?!.*(--dry-run|-\w*n\w*\b))|push\s+--force|push\s+-f\b|checkout\s+--\s+\.|restore\s+--staged)/i, reason: "destructive git operation" },
  { re: /\b(Add-Content|Set-Content|Out-File|Set-Item|New-Item)\b[^|;]*(C:\\Windows|\\(System32|drivers\\etc)\b|\$env:SystemRoot|%SystemRoot%)/i, reason: "write to a system path" },
  { re: />\s*["']?(C:\\Windows|[^|;\s]*\\(System32|drivers\\etc)\b|\$env:SystemRoot|%SystemRoot%)/i, reason: "redirect into a system path" },
  { re: /\bClear-EventLog\b|\bwevtutil\s+cl\b|\bRemove-EventLog\b|\bLimit-EventLog\b/i, reason: "event log deletion" },
  { re: /\brobocopy\b[^|;]*\/(MIR|PURGE)\b/i, reason: "mirror sync (deletes at destination)" },
  { re: /^\s*(?:(?:sudo|doas|runas|pkexec|env|xargs|nice|nohup)\s+(?:[\w=.%:,/+-]+\s+)*)*rsync\b[^|;]*--delete\b/i, reason: "sync that deletes at destination" },
  { re: /\bdocker\s+(system|image|builder|volume|container|network)\s+prune\b/i, reason: "bulk docker resource prune" },
  { re: /\bkubectl\s+(delete|drain|cordon|replace)\b/i, reason: "destructive kubernetes operation" },
  { re: /\bRename-Computer\b/i, reason: "machine rename" },
  { re: /\b(sudo|doas|runas|pkexec)\b/i, reason: "elevated privileges" },
  { re: /\b(killall|pkill|taskkill)\b/i, reason: "terminate processes by name" },
  { re: /\bkill\b[^|;]*-9/i, reason: "SIGKILL (uncatchable terminate)" },
  { re: /\b(systemctl|service|launchctl)\s+(stop|disable|mask|unload|remove|kill)\b/i, reason: "service stop/disable" },
  { re: /\b(chmod|chown|chgrp|attrib)\b[^|;]*-R/i, reason: "recursive permission/ownership change" },
  { re: /\breg\s+(add|delete|import)\b/i, reason: "registry modification" },
  { re: /\bmsiexec\b/i, reason: "Windows installer execution" },
  { re: /\bfind\b[^|;]*(-delete|-exec(dir)?\s+(rm|mv|chmod|chown)\b)/i, reason: "find deleting/mutating matched files" },
  { re: /\bxargs\b[^|;]*\brm\b/i, reason: "bulk deletion via xargs", mask: true },
  { re: /\bgit\s+push\b[^|;]*(--force\b|-f\b|\s\+\S)/i, reason: "force push" },
  { re: /\bcrontab\b(?![^|;]*\s-l\b)\s+(-(?!l\b)\S*|[^-\s|]\S*)/i, reason: "scheduled task install", mask: true },
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
  { re: /\biptables\b(?![^|;]*\s-[a-zA-Z]*[LS]\S*)(?![^|;]*--list)|\bufw\b|\bfirewall-cmd\b(?!\s+--(list-|get-|query-|info-|state\b|check-|panic|version|help|reload\b))|\bnetsh\b[^|;]*(advfirewall|firewall)[^|;]*\b(set|add|delete|import|reset|restore|dump)\b/i, reason: "firewall modification" },
  { re: /\.(Delete|Terminate|Kill|Remove)\s*\(/i, reason: "destructive .NET/WMI method call", mask: true },
  { re: /\[[\w.]+\]::(Delete|Remove\w*|Terminate|Kill|Empty|Recycle|Format|Truncate)\w*\s*\(/i, reason: "destructive .NET static call", mask: true },
  { re: /\bInvoke-(Cim|Wmi)Method\b[^|;]*(-MethodName\s+["']?(Terminate|Delete|Kill|Remove|Stop|Start|Format|Create)|\b(?:-Query|-Class)\b[^|;]*\b(Delete|Terminate)\b)/i, reason: "destructive WMI method invocation" },
  { re: /\bRemove-WmiObject\b|\bRemove-CimInstance\b/i, reason: "destructive WMI operation" },
  { re: /\bnetsh\b[^|;]*\b(delete|exec|reset)\b/i, reason: "network configuration removal or script exec" },
  { re: /\b(iex|Invoke-Expression)\b/i, reason: "expression evaluation of dynamic input", mask: true },
  { re: /\bwsl\b[^|;]*--unregister\b/i, reason: "unregister a WSL distribution" },
  { re: />\s*["']?\/dev\/(?!null|stdout|stderr|tty|fd|shm|zero|random|urandom|console)/, reason: "write to a device node" },
  { re: /\btee\b[^|;]*(?:\/(etc|usr|bin|sbin|var|boot|dev|lib|private|opt)\/|C:\\Windows|%SystemRoot%|\$env:SystemRoot|\$PROFILE)/i, reason: "write to a system path via tee" },
  { re: /\b(?:strace|ltrace|sort|tree|perf|base64|openssl|gcc|g\+\+|clang|cc|ld|javac|go|plutil|iconv|qlmanage)\b[^|;]*(?:\s-(?:o|out|output)[=\s]|--output(?:document)?[=\s])\s*["']?\/(etc|usr|bin|sbin|var|boot|dev|sys|proc|lib|private|root)\b|\bsips\b[^|;]*\s--out\s*["']?\/(etc|usr|bin|sbin|var|boot|dev|sys|proc|lib|private|root)\b/i, reason: "output file written into a system path" },
  { re: /\b(?:tcpdump|tshark|dumpcap|ngrep)\b[^|;]*\s-w\s*["']?\/(etc|usr|bin|sbin|var|boot|dev|sys|proc|lib|private|root)\b/i, reason: "capture file written into a system path" },
  { re: /\bsed\b[^|;]*(?:["';}]\s*e|\d+e)\s+[^\s'"|]/, reason: "sed executing a shell command" },
  { re: /\b(?:awk|gawk|mawk|nawk)\b[\s\S]*?\bsystem\s*\([^)]*\b(?:rm|del|erase|mkfs|dd|shutdown|reboot|halt|poweroff|kill|nc|ncat|curl|wget|chmod|chown|chgrp|shred|mv|cp|ln|tar|python|perl|sh|bash|exec|touch|mkdir)\b/, reason: "awk invoking a shell command" },
];

// reading or printing credential material — never readonly, always at least a prompt
const SECRET_CTX_RE = /(key=clear|\.ssh[\/\\]id_\w+\b(?!\.pub)|\.aws[\/\\]credentials|\.netrc\b|\.pgpass\b|find-\w*-password\b|authorization\s*[:=]\s*"?(basic|bearer|digest)\s+(?!\$)|\s-(?:u|user)\s+[\w.-]+:[^\s|;]+|wifi[^\s|;]*\.(txt|conf|cfg)|BEGIN\s+[\w-]*\s*PRIVATE\s+KEY)/i;
const SECRET_TERM_RE = /\b(password|passwd|secret|apikey|api_key|credentials?|token)s?\b/i;
const SECRET_FILE_RE = /[\w.~-]*(?:secret|credentials?)[\w.~-]*\.[\w]+/i;
const SECRET_VAR_RE = /\$env?:?\w*(?:password|secret|apikey|api_key|credentials?|token|_key)\w*/i;
const SECRET_FILEISH_RE = /-Path\b|-File\b|\.(config|conf|cfg|ini|env|pem|key|xml|properties|csv|log|txt|json|ya?ml|docx?|xlsx?|zip|tar|gz|enc|bin|dat|sqlite|db)\b/i;
const SECRET_READ_HEADS = new Set([
  "cat", "less", "more", "head", "tail", "type", "gc", "get-content", "bat",
  "base64", "base32", "strings", "xxd", "hexdump", "od", "zcat", "gzcat",
  "zless", "xzless", "nl", "openssl",
]);
const SECRET_GREP_HEADS = new Set(["grep", "egrep", "fgrep", "rg", "findstr", "ack", "ag", "ug", "ugrep"]);
const SECRET_SELECT_HEADS = new Set(["select-string", "sls"]);
// terms that always imply credential hunting even without a file target
const SECRET_TERM_STRONG = /\b(password|passwd|secrets?|apikey|api_key|credentials?)\b/i;
const SECRET_VAR_HEADS = new Set([
  "echo", "printf", "cat", "clip", "pbcopy", "xclip", "xsel", "wl-copy", "tee",
  "write-output", "write-host", "out-host", "setx",
]);

function readsSecrets(segment, head) {
  if (SECRET_CTX_RE.test(segment)) return true;
  const trimmed = segment.trim();
  if (SECRET_VAR_RE.test(trimmed) && (/^\$[\w.:]+\s*$/.test(trimmed) || SECRET_VAR_HEADS.has(head))) return true;
  if (SECRET_READ_HEADS.has(head) && SECRET_FILE_RE.test(segment)) return true;
  if (SECRET_SELECT_HEADS.has(head)
    && (SECRET_TERM_STRONG.test(segment) || (SECRET_TERM_RE.test(segment) && /-Path\b/i.test(segment)))) return true;
  if (SECRET_GREP_HEADS.has(head) && SECRET_TERM_RE.test(segment)
    && SECRET_FILEISH_RE.test(segment.replace(/--?(include|exclude|exclude-dir|glob|iglob)[=\s]\S*/g, " "))) return true;
  return false;
}

const MODERATE_PATTERNS = [
  { re: /\bmv\b|\bcp\b|\bMove-Item\b|\bCopy-Item\b|\bren\b(?![-\w])|\brename\b(?![-\w])/i, reason: "file move/copy (can overwrite)" },
  { re: /\bgit\s+(commit|push|pull|merge|rebase|reset|checkout|switch|restore|stash\s+pop|am|apply|cherry-pick|revert|clean\b(?![^|;]*(--dry-run|-\w*n\w*\b))|worktree\s+(remove|prune)|reflog\s+(delete|expire)|gc\b|prune\b)/i, reason: "git state change" },
  { re: /\bkubectl\s+rollout\s+(restart|undo|pause|resume)\b|\bkubectl\s+(scale|patch|taint|cordon|uncordon|edit|annotate|label|apply)\b|\bkubectl\s+set\b(?![^|;]*\s--list\b)/i, reason: "kubernetes resource change" },
  { re: /\bUnregister-ScheduledTask\b|\bDisable-ScheduledTask\b|\bSet-ScheduledTask\b/i, reason: "scheduled task change" },
  { re: /\bSetEnvironmentVariable\s*\(|\bsetx\b|\bsetx\.exe\b/i, reason: "environment variable change" },
  { re: /\bpowercfg\b[^|;]*\/(hibernate|change|setactive|setacvalueindex|setdcvalueindex|deletescheme|duplicatescheme|import|export|h|s|x)\b/i, reason: "power configuration change" },
  { re: /\bipconfig\b[^|;]*\/(release|renew|flushdns|registerdns|setclassid|flushroutingtable|release6|renew6)\b/i, reason: "network configuration change" },
  { re: /\bmount\b(?=\s+[^|;])/i, reason: "mount filesystem change" },
  { re: /\b(brew|apt|apt-get|dnf|yum|pacman|zypper|apk|choco|scoop)\s+(install|add|upgrade|update)\b|\bwinget\s+(install|add|update)\b|\bwinget\s+upgrade\b(?!\s*$|\s+--?include-unknown\s*$)/i, reason: "package install/upgrade" },
  { re: /\b(npm|pnpm|yarn|bun|pip|pip3|gem|go)\s+(install|add|i\b|get\b|update|upgrade)\b|\bcargo\s+(install\b(?![^|;]*--list\b)|add\b|update\b|upgrade\b)/i, reason: "package install" },
  { re: /\bkill\b(?!\s+-0\b)(?!\s+-[lL]\b)(?!\s+--list\b)/i, reason: "process termination" },
  { re: /\bStop-Process\b/i, reason: "process termination" },
  { re: /(?<![-\w])(Start|Stop|Restart|Set|Remove|Clear|Enable|Disable|Add)-(?!Sleep\b|Job\b|ThreadJob\b|Transcript\b|Location\b|Variable\b|StrictMode\b|PSBreakpoint\b|PSReadLineOption\b|PSReadLineKeyHandler\b)[A-Z]|(?<![-\w])New-(?!TimeSpan\b|Guid\b|DateTimeOffset\b|Object\b|ScheduledTaskTrigger\b|Variable\b|Alias\b|Session\b)[A-Z]/i, reason: "system object mutation (PowerShell verb)", mask: true },
  { re: /\bmkdir\b|\bNew-Item\b|\btouch\b/i, reason: "filesystem write" },
  { re: /(?:^|[|;&(]\s*)\s*(tar\b(?![^|;]*-[a-zA-Z]*O[a-zA-Z]*\b)(?![^|;]*-[a-zA-Z]*f\s*-(?:\s|$))(?![^|;]*--to-stdout\b)[^|;]*-[a-zA-Z]*x|unzip\b(?![^|;]*\s-[lvZtp]+\b)|Expand-Archive\b|7z\s+x)/i, reason: "archive extraction (file writes)" },
  { re: /\bln\s+-s\b|\bNew-Item\b[^|;]*-ItemType\s+SymbolicLink/i, reason: "symlink creation" },
  { re: /\bchmod\b|\bchown\b|\bicacls\b(?=[^|;]*\/(grant|deny|remove|reset|setowner|save|restore|setintegritylevel|substitute|inheritance))|\bSet-Acl\b/i, reason: "permission/ownership change" },
  { re: /(?:^|[|;&(]\s*|\bsudo\s+)curl\b[^|;]*(?:-[a-zA-Z]*o\s+(?!-(?:\s|$)|\/dev\/null\b|NUL\b|nul\b)|-[a-zA-Z]*O\b|--remote-name\b|--remote-name-all\b|--output(?:=|\s+)(?!-(?:\s|$)|\/dev\/null\b|NUL\b|nul\b))/, reason: "file download (network + write)" },
  { re: /(?:^|[|;&(]\s*|\bsudo\s+)wget\b(?![^|;]*(?:-[\w-]*O\s*-|--spider\b|--output-document[\s=]+\s*-(?=\s|$)))|\bInvoke-WebRequest\b[^|;]*-OutFile/i, reason: "file download (network + write)" },
  { re: /(^|[;&|]\s*|\bsudo\s+)service\s+\S+\s+(start|stop|restart|reload|force-reload)\b|\bsystemctl\s+(--?\S+\s+)*(start|stop|restart|reload|try-restart|reload-or-restart|enable|disable|mask|unmask|kill|daemon-reload|daemon-reexec|isolate|set-default|edit|reset-failed|preset|link|revert|set-property|suspend|hibernate)\b|\blaunchctl\s+(load|bootstrap|kickstart)/i, reason: "service control" },
  { re: /^\s*(?:(?:sudo|doas|runas|pkexec|env|xargs|nice|ionice|time|nohup|setsid|watch|exec|stdbuf|sshpass|chroot)\s+(?:[\w=.%:,/+-]+\s+)*)*(?:ssh\b(?!-)(?![^|;]*\s-[a-zA-Z]*G\b)|scp\b|sftp\b|sshfs\b)/i, reason: "remote session" },
  { re: /^\s*(?:(?:sudo|doas|runas|pkexec|env|xargs|nice|ionice|time|nohup|setsid|watch|exec|stdbuf|sshpass|chroot)\s+(?:[\w=.%:,/+-]+\s+)*)*rsync\b(?![^|;]*--dry-run)(?![^|;]*\s-[a-zA-Z]*n[a-zA-Z]*\b)/i, reason: "remote sync" },
  { re: /\btee\b/i, reason: "file write" },
  { re: /\b(brew\s+services\s+(start|stop|restart)|launchctl\s+(load|unload|bootstrap|bootout|kickstart))/i, reason: "service control" },
  { re: /\bdscacheutil\s+-flushcache\b/i, reason: "system cache flush" },
  { re: /\bhistory\s+-[a-zA-Z]*[cw]/i, reason: "shell history modification" },
  { re: /\|\s*crontab\b|\bcrontab\s+(-[re]\b|[^-\s])/i, reason: "scheduled task install", mask: true },
  { re: /\s--password=\S+|\b(mysql|mysqldump|mysqladmin|mariadb)\b[^|;]*\s-p[^\s|;]+|\s\/P:[^\s|;]+|-pass\s+pass:[^\s|;]+/i, reason: "secret on the command line" },
  { re: /\bfuser\b[^|;]*-[a-zA-Z]*k\b/i, reason: "kill processes using a resource" },
  { re: /\b(?:less|more|most|pg)\b[^|;]*(?:\s\+(?![0-9]|\/|&|@|\s*$)\S*|\s-[a-zA-Z]*[kK]\b|--lesskey)/i, reason: "pager command argument" },
  { re: /\b(?:awk|gawk|mawk|nawk)\b[^|;]*(?:\bsystem\s*\(|print(?:f)?\b[^;|}]*>>?\s*[^\s|;&}]|\|\s*["'][^"']*["']\s*\||["'][^"']*["']\s*\|\s*getline)/i, reason: "awk shelling out or writing a file" },
  { re: /\bsed\b[^|;]*["';}]\s*[wW]\s+[^\s'"|]/, reason: "sed writing a file" },
  { re: /\bgit\s+config\s+[^|;]*--(unset|unset-all|add|replace-all|remove-section|rename-section|edit)\b|\bgit\s+config\s+(?:--?\w[\w-]*(?:=\S+)?\s+)*[\w.][\w.-]*\s+\S/i, reason: "git configuration write" },
  { re: /\.(?:Write|Append|Move|Copy|Rename|Create|Save|Commit|Set|Insert|Update|Clear|Dispose|Close|Download|Upload|Send|Post|Put|Exit|FailFast|Stop|Start|Open|Execute|Invoke|Run)\w*\s*\(|\.Add(?!(?:Days|Months|Years|Hours|Minutes|Seconds|Ticks|Milliseconds)\s*\()\w*\s*\(/i, reason: "mutating .NET method call", mask: true },
  { re: /\[[\w.]+\]::(?:Write|Append|Set|Exit|FailFast|Encrypt|Decrypt|OpenWrite|Save|Commit|Insert|Update|Clear|Post|Put|Send|Upload|Download|Execute|Invoke|Run|Exec|Add|Move|Copy|Create|Rename)\w*\s*\(|\[[\w.]*IO\.(?:File|Directory|DriveInfo)\]::(?:Replace|Open|Delete)\w*\s*\(/i, reason: "mutating .NET static call", mask: true },
  { re: /\bInvoke-(Cim|Wmi)Method\b/i, reason: "WMI method invocation" },
  { re: /\bnetsh\b[^|;]*\b(add|set|import|connect|disconnect|dump)\b/i, reason: "network configuration change" },
  { re: /\bwsl\b[^|;]*--(shutdown|terminate|import|install|update|set-default|set-version|export|manage|mount|unmount)\b/i, reason: "WSL state change" },
  { re: /\b(?:strace|ltrace|sort|tree|perf|base64|openssl|gcc|g\+\+|clang|cc|ld|javac|go|plutil|iconv|qlmanage)\b[^|;]*(?:\s-(?:o|out|output)[=\s]|--output(?:document)?[=\s])\s*["']?(?!-[\s|&]|\/dev\/null\b)[^\s|;&]|\bsips\b[^|;]*\s--out\s*["']?[^\s|;&]/i, reason: "output file flag (file write)" },
  { re: /\b(?:tcpdump|tshark|dumpcap|ngrep)\b[^|;]*\s-w\s*["']?[^\s|;&]/i, reason: "packet capture file write" },
  { re: /\b(?:Out-File|Out-Printer|Tee-Object|Export-Csv|Export-Clixml|Set-Clipboard)\b/i, reason: "file or clipboard write" },
  { re: /^\s*(?:[A-Za-z_][A-Za-z0-9_]*=\S+\s+)*(?:LD_PRELOAD|LD_LIBRARY_PATH|LD_AUDIT|LD_BIND_NOW|DYLD_[A-Z_]+|BASH_ENV|NODE_OPTIONS|PYTHONSTARTUP|PYTHONINSPECT|PERL5OPT|PERL5DB|RUBYOPT|GIT_SSH_COMMAND|GIT_EXEC_PATH|GIT_PAGER|SYSTEMD_PAGER|SSH_ASKPASS|SUDO_ASKPASS|PROMPT_COMMAND|ZDOTDIR|INPUTRC|GCONV_PATH|JAVA_TOOL_OPTIONS|JDK_JAVA_OPTIONS|_JAVA_OPTIONS|OPENSSL_CONF|OPENSSL_ENGINES|OPENSSL_MODULES|TERMINFO|HOSTALIASES|RES_OPTIONS|NETRC|KRB5_CONFIG|GNUPGHOME|XAUTHORITY|R_PROFILE|R_LIBS|LESSOPEN|LESSCLOSE|PAGER|MANPAGER)=\S/i, reason: "environment variable controlling code loading or a pager" },
  { re: /(^|[;&|(]\s*)(su|runuser|chroot)\b(?![^|;]*\s--?(help|version)\b)/i, reason: "user/root context switch" },
  { re: /\bpmset\b(?!\s+-g\b)/i, reason: "power management change" },
  { re: /\bhdiutil\s+(attach|detach|eject|create|compact|convert|resize)\b/i, reason: "disk image mount or modification" },
  { re: /\blaunchctl\s+(?:--\w+\s+)*(load|unload|start|stop|kickstart|bootstrap|bootout|enable|disable|kill)\b/i, reason: "service control" },
  { re: /\bbrew\s+(cleanup|uninstall|rm|autoremove)\b/i, reason: "package removal or cleanup" },
  { re: /\bln\b[^|;]*\s(?:--force\b|-[a-zA-Z]*f[a-zA-Z]*\b)/i, reason: "forced link overwrite" },
];

const ELEVATION_RE = /\b(sudo|doas|runas|pkexec|Start-Process\b[^|;]*-Verb\s+RunAs)\b/i;

// capability labels shown to the user ("does:" on the approval card)
export const CAP_LABELS = {
  "delete": "deletes files",
  "write": "writes/changes files",
  "network": "network access",
  "upload": "sends data out",
  "remote-exec": "runs downloaded code",
  "elevated": "elevated privileges",
  "process": "stops/starts processes or services",
  "persist": "installs startup/scheduled items",
  "system-config": "changes system settings",
  "secrets": "reads secrets",
  "package": "installs/removes packages",
  "read": "read-only",
};

const REASON_CAPS = [
  [/delet|destruction|wipe|erase|clean/i, "delete"],
  [/writ|move\/copy|extraction|symlink|download|redirect|move|rename/i, "write"],
  [/remote sync|upload/i, "upload"],
  [/network|download|remote/i, "network"],
  [/remote script|encoded|substitution over the network/i, "remote-exec"],
  [/process|service|kill/i, "process"],
  [/persist|scheduled|startup|login item|Run key/i, "persist"],
  [/permission|ownership|firewall|\bsystem\b|registry|account|partition|disk|power|cache flush|settings|config|execution ?policy|history|link in a system path/i, "system-config"],
  [/secret/i, "secrets"],
  [/package|install|upgrade/i, "package"],
];

const CAP_NETWORK_HEADS = new Set([
  "curl", "wget", "ssh", "scp", "sftp", "rsync", "nc", "ncat", "ftp", "tftp", "telnet",
  "invoke-webrequest", "invoke-restmethod", "iwr", "irm", "bitsadmin", "aria2c", "mosh",
  "socat", "rclone", "sshfs", "mshta", "ping", "traceroute", "tracert", "pathping",
]);
const CAP_PACKAGE_HEADS = new Set([
  "brew", "apt", "apt-get", "dnf", "yum", "pacman", "zypper", "apk", "winget", "choco",
  "scoop", "snap", "flatpak", "msiexec", "nix-env", "mas",
]);
const CAP_DELETE_HEADS = new Set([
  "rm", "rmdir", "rd", "del", "erase", "remove-item", "ri", "unlink", "shred", "srm",
  "gshred", "wipe", "clear-recyclebin", "cipher",
]);
const CAP_WRITE_HEADS = new Set([
  "mv", "cp", "touch", "mkdir", "md", "ln", "tee", "dd", "unzip", "move-item", "copy-item",
  "new-item", "set-content", "add-content", "out-file", "move", "copy", "ren", "rename",
  "expand-archive", "compress-archive", "xcopy", "robocopy", "truncate", "patch",
]);
const CAP_PROCESS_HEADS = new Set([
  "kill", "pkill", "killall", "taskkill", "stop-process", "fuser", "xkill", "renice",
]);
const CAP_CONFIG_HEADS = new Set([
  "chmod", "chown", "chgrp", "chflags", "setfacl", "attrib", "icacls", "takeown", "set-acl",
  "ufw", "iptables", "ip6tables", "pfctl", "netsh", "new-netfirewallrule", "set-netfirewallrule",
  "disable-netfirewall", "enable-netfirewall", "reg", "bcdedit", "dscl", "passwd", "useradd",
  "userdel", "usermod", "adduser", "deluser", "chpasswd", "hostnamectl", "timedatectl",
  "set-timezone", "route", "set-netipaddress", "nvram", "visudo", "vssadmin", "fdisk", "parted",
  "mkfs", "wipefs", "losetup", "cryptsetup", "swapon", "swapoff", "set-executionpolicy",
  "enable-psremoting", "disable-psremoting", "winrm", "powercfg", "shutdown", "reboot",
  "halt", "poweroff", "stop-computer", "restart-computer", "diskutil", "sfdisk",
]);
const CAP_SECRET_FILE = /(\.ssh\/[^/]*id|\.aws\/credentials|\.netrc|\.pgpass|key=clear)/i;

function capsForSegment(head, args, reason) {
  const caps = new Set();
  if (CAP_DELETE_HEADS.has(head) && !/^(-[a-zA-Z]+\s*)*$/.test(args)) caps.add("delete");
  if (CAP_WRITE_HEADS.has(head)) caps.add("write");
  if (CAP_NETWORK_HEADS.has(head)) caps.add("network");
  if (CAP_PACKAGE_HEADS.has(head) && /\b(install|add|uninstall|remove|purge|erase|autoremove|upgrade|update)\b/i.test(args)) caps.add("package");
  if (CAP_PROCESS_HEADS.has(head) && !/^\s*(-0|-[lL]\b|--list\b)/.test(args)) caps.add("process");
  if (CAP_CONFIG_HEADS.has(head)) caps.add("system-config");
  if (/^(defaults\s+(write|delete|import|rename)\b|(networksetup|systemsetup)\s+-set|scutil\s+--set\b|pmset\s+(?!-g)\S|sysctl\s+(-w\b|\S+=)|gsettings\s+(set|reset)\b|set-itemproperty\b|new-itemproperty\b)/i.test(`${head} ${args}`)) caps.add("system-config");
  if (["scp", "sftp", "rsync"].includes(head) && /\S+:[^\s]/.test(args)) caps.add("upload");
  if (["curl", "wget", "invoke-webrequest", "invoke-restmethod", "iwr", "irm"].includes(head) &&
      /-{1,2}[a-zA-Z-]*(d|F|T)\s|--(data|form|upload-file|json|method\s+(post|put|patch|delete))|(-Method|-Body)\s/i.test(args)) caps.add("upload");
  if (["systemctl", "service", "launchctl", "brew"].includes(head) && /\b(start|stop|restart|reload|kill|services)\b/i.test(args)) caps.add("process");
  if (["systemctl", "launchctl", "update-rc.d", "chkconfig"].includes(head) && /\b(enable|disable|mask|load|bootstrap|link)\b/i.test(args)) caps.add("persist");
  if (["crontab", "schtasks", "at", "register-scheduledtask", "new-scheduledtask", "update-rc.d", "chkconfig"].includes(head)) caps.add("persist");
  if (CAP_SECRET_FILE.test(args) || (head === "security" && /-\w*w\b/.test(args))) caps.add("secrets");
  for (const [re, cap] of REASON_CAPS) if (reason && re.test(reason)) caps.add(cap);
  return caps;
}

const DOC_LOOKUP_HEADS = new Set(["man", "tldr", "whatis", "apropos", "which", "type", "whereis", "help", "where"]);

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

export function segmentHead(segment) {
  const cleaned = segment
    .replace(/^\s*(sudo|doas|runas|pkexec)\s+(-[a-zA-Z]+\s+)*/i, "")
    .replace(/^\s*[A-Za-z_][A-Za-z0-9_]*=\S*\s+/, "")
    .trim();
  const m = cleaned.match(/^([^\s]+)\s*(.*)$/s);
  if (!m) {
    return { head: "", args: "" };
  }
  let head = m[1];
  head = head.replace(/\.(exe|bat|cmd|ps1)$/i, "").replace(/^.*[\\/]/, "").replace(/^\(+/, "");
  return { head: head.toLowerCase(), args: m[2] || "" };
}

const WRAP_TOKEN_RE = /("[^"]*"|'[^']*'|\S+)/g;
const STOP_C = new Set(["-c"]);

// walk leading wrapper options: VAL flags consume the next token, a bare
// "--" or a token in STOP is consumed and ends the walk; returns the index
// of the first operand/command token
function skipOpts(toks, VAL, i = 0, STOP = null) {
  for (; i < toks.length; i += 1) {
    const t = toks[i];
    if (t === "--" || (STOP && STOP.has(t))) { i += 1; break; }
    if (t.startsWith("--")) { if (!t.includes("=") && VAL.has(t)) i += 1; continue; }
    if (t.startsWith("-")) { if (VAL.has(t)) i += 1; continue; }
    break;
  }
  return i;
}

function innerCommandOf(head, args) {
  if (head === "command" && /^\s*-(v|V)\b/.test(args)) return null;
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
    const m = args.match(/(?:^|\s)-(c|command)\s+("([^"]*)"|'([^']*)'|(\S+))/i) || args.match(/^("([^"]*)"|'([^']*)'|(\S.*))$/s);
    const inner = m && (m[3] || m[4] || m[5] || m[2]);
    if (inner) return inner;
    return null;
  }
  if (head === "sshpass") {
    const toks = args.match(/("[^"]*"|'[^']*'|\S+)/g) || [];
    let i = 0;
    for (; i < toks.length; i += 1) {
      const t = toks[i];
      if (t.startsWith("-")) {
        if (/^-(p|f|d)$/.test(t) || /^--(password|file|fd)$/.test(t)) i += 1;
        continue;
      }
      break;
    }
    const rest = toks.slice(i).join(" ");
    return rest || null;
  }
  if (head === "find") {
    const m = args.match(/-(exec|execdir)\s+(.+?)\s*(;|\+|$)/s);
    if (m) return m[2];
    return null;
  }
  if (head === "wsl") {
    const rest = args
      .replace(/^\s*(?:-d\s+\S+|-u\s+\S+|--cd\s+\S+|--distribution\s+\S+|--user\s+\S+|--system\b|--shell-type\s+\S+|-e\b|--exec\b|--\s+|\s+)+/, "")
      .trim();
    // a leftover wsl flag (e.g. --list, --unregister) is not an inner command
    return rest && !rest.startsWith("-") ? rest : null;
  }
  if (head === "chroot") {
    // chroot [opts] NEWROOT [cmd...] — getopt permutes, so lone flags can sit
    // between NEWROOT and the command
    const toks = args.match(WRAP_TOKEN_RE) || [];
    let i = skipOpts(toks, new Set(["-u", "-g", "--userspec", "--groups"]));
    i += 1; // NEWROOT
    for (; i < toks.length; i += 1) if (!toks[i].startsWith("-")) break;
    const rest = toks.slice(i).join(" ");
    return rest || null;
  }
  if (head === "su") {
    const m = args.match(/(?:^|\s)-{1,2}(?:[a-z]*c|command|session-command)\s+("([^"]*)"|'([^']*)'|(\S+))/i);
    return m ? (m[2] || m[3] || m[4]) : null;
  }
  if (head === "runuser") {
    const VAL = new Set(["-u", "-g", "-G", "-s", "--user", "--group", "--supp-group", "--shell"]);
    const toks = args.match(WRAP_TOKEN_RE) || [];
    let i = skipOpts(toks, VAL, 0, STOP_C);
    if (toks[i - 1] !== "--" && toks[i - 1] !== "-c") {
      // stopped on a positional — it's the target user unless -u/--user
      // already supplied it; more options may follow the user
      const userGiven = toks.slice(0, i).some((t) => t === "-u" || t.startsWith("--user"));
      if (!userGiven) i = skipOpts(toks, VAL, i + 1, STOP_C);
    }
    const rest = toks.slice(i).join(" ").replace(/^(['"])(.*)\1$/s, "$2");
    return rest || null;
  }
  if (head === "timeout" || head === "gtimeout") {
    const toks = args.match(WRAP_TOKEN_RE) || [];
    const i = skipOpts(toks, new Set(["-k", "-s", "--kill-after", "--signal"]));
    const rest = toks.slice(i + 1).join(" "); // +1 skips the duration
    return rest || null;
  }
  if (head === "chrt") {
    // -p/--pid operates on an existing process — no inner command
    if (/(?:^|\s)-[a-zA-Z]*p\b|\s--pid\b/.test(args)) return null;
    const toks = args.match(WRAP_TOKEN_RE) || [];
    const i = skipOpts(toks, new Set(["-T", "-P", "-D", "--sched-timeout", "--sched-period", "--sched-deadline", "--sched-runtime"]));
    const rest = toks.slice(i + 1).join(" "); // +1 skips the priority
    return rest || null;
  }
  if (head === "unshare") {
    const toks = args.match(WRAP_TOKEN_RE) || [];
    const i = skipOpts(toks, new Set(["-S", "-G", "--setuid", "--setgid", "--root", "--wd", "--monotonic", "--boottime", "--setgroups", "--map-user", "--map-group", "--map-users", "--map-groups", "--map-auto"]));
    const rest = toks.slice(i).join(" ");
    return rest || null;
  }
  if (head === "flock") {
    // flock [opts] FILE [-c] cmd — -c takes the whole remainder
    const toks = args.match(WRAP_TOKEN_RE) || [];
    const i = skipOpts(toks, new Set(["-w", "-E", "--timeout", "--conflict-exit-code", "--wait"]), 0, STOP_C);
    let j = toks[i - 1] === "-c" ? i : i + 1; // -c cmd, or FILE then cmd
    if (toks[j] === "-c") j += 1;
    const rest = toks.slice(j).join(" ").replace(/^(['"])(.*)\1$/s, "$2");
    return rest || null;
  }
  if (head === "setsid") {
    // setsid's flags (-f -w -c --fork --wait --ctty) all take no value
    const toks = args.match(WRAP_TOKEN_RE) || [];
    const i = skipOpts(toks, new Set());
    const rest = toks.slice(i).join(" ").replace(/^(['"])(.*)\1$/s, "$2");
    return rest || null;
  }
  const FLAG_VALUE = new Set(["-n", "--interval", "--adjustment", "-i", "-o", "-e", "-c", "--cpu-list"]);
  if (["time", "nice", "nohup", "stdbuf", "watch", "ionice", "taskset", "unbuffer"].includes(head)) {
    const toks = args.match(/("[^"]*"|'[^']*'|\S+)/g) || [];
    let i = 0;
    for (; i < toks.length; i += 1) {
      const t = toks[i].replace(/^["']|["']$/g, "");
      if (!t.startsWith("-")) break;
      if (FLAG_VALUE.has(t)) i += 1; // flag takes the NEXT token as its value
      // attached-value flags (-n5, -c3) are single tokens: just continue
    }
    const rest = toks.slice(i).join(" ");
    return rest || null;
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
  // loop/branch keywords are followed by a real command to evaluate
  if (["do", "then", "else", "elif"].includes(head)) {
    return args || null;
  }
  if (["while", "until", "if"].includes(head)) {
    // PowerShell `if (cond) { ... }` starts with a parenthesised expression
    return /^\s*\(/.test(args) ? null : (args || null);
  }
  return null;
}

const MUTATING_FLAGS = {
  find: /-(delete|fprint|fprint0|fprintf|ok|okdir)\b/,
  sed: /(?:^|\s)(?:--in-place\b|-\w*[iI]\S*)|(?:^|[;{}\s\/'"!])[wW]\s+\S|(?:^|[;{}\s\/'"!0-9$,+^~])e(?:\s+\S|\s*['"]?\s*$)/,
  awk: /(?:^|\s)-i\b|\bsystem\s*\(|\bprint(?:f)?\b[^;|}]*>>?\s*["'\w\/-]|\|\s*["'][^'"]*["']|["'][^'"]*["']\s*\|\s*getline/,
  tar: /^(?![^|;]*-[a-zA-Z]*f\s*-(?:\s|$))(?![^|;]*-[a-zA-Z]*x[a-zA-Z]*O)(?:^\s*-?[a-zA-Z]*[xcruA]|\s-[a-zA-Z]*[xcruA]|--(extract|create|append|update|delete|get|to-command|use-compress-program|checkpoint-action|info-script|rmt-command|rsh-command)\b|\s-[IF]\s)/,
  git: /\s(-O|--open-files-in-pager)|\s-c\s|--output\b|--ext-diff|\breflog\s+(delete|expire)\b|\bhash-object\b[^|;]*\s-w\b|\bconfig\s+[^|;]*--(unset|unset-all|add|replace-all|remove-section|rename-section|edit)\b|\bconfig\s+(?:--?\w[\w-]*\s+)*[\w.][\w.-]*\s+\S/,
  npm: /\baudit\b[^|;]*\bfix\b/,
  pnpm: /\baudit\b[^|;]*\bfix\b/,
  yarn: /\baudit\b[^|;]*\bfix\b/,
  bun: /\baudit\b[^|;]*\bfix\b/,
  cargo: /\baudit\b[^|;]*\bfix\b/,
  sort: /\s(-o|--output)\b/,
  yq: /\s(-i|--inplace)\b/,
  dmesg: /\s(-[a-zA-Z]*[cCDEn]|--clear|--read-clear|--console-\w+)\b/,
  tree: /\s-o\b/,
  // -convert/-extract print only when targeting stdout (-o -, -stdin -stdout);
  // -extract additionally prints when the format is raw. Anything else writes.
  plutil: /\s-(replace|insert|remove)\b|\s-o\s+(?!-(?:\s|$))\S|\s-convert\b(?![^|;]*(?:-o\s+-(?:\s|$)|-stdin\b[^|;]*-stdout\b|-stdout\b))|\s-extract\b(?![^|;]*(?:-o\s+-(?:\s|$)|-stdin\b[^|;]*-stdout\b|-stdout\b))(?![^|;]*\braw\b)/,
  // iconv writes only through -o/--output; output otherwise goes to stdout
  iconv: /\s-(o|--output)\b/,
  base64: /\s(-o|--output)\b/,
  ss: /\s(-[a-zA-Z]*K|--kill)\b/,
  history: /\s-[cdwranps]\b/,
  fc: /^(?!\s*-[a-zA-Z]*l)|\s-[a-zA-Z]*[es]\b/,
  go: /\benv\b[^|;]*\s-[wu]\b/,
  man: /(^|\s)-[a-zA-Z]*P\b|\s--(pager|prompt|preprocessor)\b/,
  // +<cmd> runs a less command (+! shells out, +s logs, +F follows); -k loads
  // a lesskey file that can bind shell commands
  less: /(?:^|\s)\+(?![0-9]|\/|&|@|\s*$)|(?:^|\s)-[a-zA-Z]*[kK]\b|--lesskey/,
  more: /(?:^|\s)\+(?![0-9]|\/|&|@|\s*$)|(?:^|\s)-[a-zA-Z]*[kK]\b|--lesskey/,
  dnf: /\bhistory\s+(undo|rollback|redo)\b|\b(group|module)\s+(install|remove|enable|disable|reset)\b/,
  yum: /\bhistory\s+(undo|rollback|redo)\b|\b(group|module)\s+(install|remove|enable|disable|reset)\b/,
  pytest: /./,
  "py.test": /./,
  tox: /./,
  networkctl: /\b(reload|up|down|delete|renew|persist|reconfigure|label|set-|edit|forcerenew)\w*/i,
};

const PWSH_SAFE_VERB = /^(get|test|measure|select|sort|where|format|group|compare|resolve|convertto|convertfrom|read)$/i;
const PWSH_PURE_BLOCK = /^\{(\s|\$[\w.]+|-[a-z]+|'[^']*'|"[^"$]*"|\d+(\.\d+)?(kb|mb|gb|tb|pb|ns|us|ms|s)?|[()!])*\}$/i;

const PWSH_PURE_METHOD = /\.(Add\w*|To\w+|Total\w+|Get\w+|Trim\w*|Split|Substring|Contains|StartsWith|EndsWith|IndexOf|LastIndexOf|Equals|CompareTo|Parse|TryParse|Format|Round|Floor|Ceiling|Abs|Max|Min|FirstDayOfWeek|IsNullOr\w+|Join|Concat|Clone|Pad\w+|Normalize)\s*\([^()]*\)/gi;
const PWSH_PURE_STATIC = /\[(Environment|System\.Environment|DateTime|DateTimeOffset|TimeSpan|Math|System\.Math|Regex|System\.Text\.RegularExpressions\.Regex|Convert|System\.Convert|Text\.Encoding|System\.Text\.Encoding|IO\.Path|System\.IO\.Path|IO\.File|System\.IO\.File|Version|System\.Version|Guid|Char|String|Int32|Int64|Double|Single|Net\.IPAddress|System\.Net\.IPAddress|BitConverter|Base64FormattingOptions|DayOfWeek|ConsoleColor)\]::(?!Write|Delete|Create|Move|Copy|Kill|Stop|Start|Run|Exec|Download|Upload|Send|Post|Put|Request|Invoke|Exit|FailFast|Set|Append|Remove|Clear|Save|Open)[\w]*\s*(\([^()]*\))?/gi;
// IO file/directory statics are stricter: Replace/Encrypt/Decrypt also write
const PWSH_PURE_STATIC_IO = /\[(System\.)?IO\.(File|Directory|DriveInfo)\]::(?!Write|Create|Delete|Move|Copy|Append|Open|Replace|Encrypt|Decrypt|Set|Kill|Stop|Start|Run|Exec|Exit|Download|Upload|Send|Post|Put|Request|Invoke|Remove|Clear|Save)[\w]*\s*(\([^()]*\))?/gi;
const PWSH_ENUM_MEMBER = /\[[\w.]+\]::\w+\b(?!\s*\()/g;
// mutating method names never allowed even in "pure" expression contexts
const PWSH_BAD_CALL = /\.(Delete|Remove|Kill|Stop|Start|Create|Write\w*|Append\w*|Move|Copy|Rename|Set\w*|Insert|Update|Clear|Save|Commit|Execute|Invoke|Run|Close|Dispose|Open|Download\w*|Upload\w*|Send|Post|Put|Request|Exit|FailFast|Add(?!(ays|Months|Years|Hours|Minutes|Seconds|Ticks|Milliseconds)))\s*\(/i;

const PWSH_BLOCK_OPS = /^(join|split|replace|match|notmatch|eq|ne|gt|lt|ge|le|like|notlike|contains|notcontains|in|notin|is|isnot|as|and|or|xor|band|bor|bxor|shl|shr|f|not)$/i;
// filter/projection cmdlets — readonly only when their tail is a pure
// expression (script blocks are validated, not blindly trusted)
const PWSH_FILTER_HEADS = new Set([
  "select", "select-object", "where", "where-object", "group", "group-object",
  "measure", "measure-object", "compare", "compare-object", "sort-object",
]);

const PWSH_PURE_CALL = /\.(Add\w*|To\w*|Trim\w*|Split|Substring|Contains|StartsWith|EndsWith|IndexOf|Equals|CompareTo|GetType)\s*\([^()]*\)/gi;

// read-only command words allowed to head a block expression (their bare
// words are arguments, not code)
const PWSH_READ_WORDS = /^(sls|select|where|sort|group|measure|compare|cat|gc|type|echo|write|read|get|gci|dir|ls|wc|out-host|out-null)$/i;

// split on a separator at bracket depth 0 (quotes are already stripped)
function pwshSplitTop(s, ch) {
  const parts = [];
  let depth = 0;
  let cur = "";
  for (const c of s) {
    if (c === "(" || c === "{" || c === "[") depth += 1;
    else if (c === ")" || c === "}" || c === "]") depth -= 1;
    if (c === ch && depth <= 0) {
      parts.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  parts.push(cur);
  return parts;
}

function pwshBlockReadonly(inner, allowPipes = true) {
  let s = inner
    .replace(/"[^"]*"|'[^']*'/g, "")
    .replace(PWSH_PURE_CALL, " ")
    .replace(PWSH_PURE_STATIC_IO, " ")
    .replace(PWSH_PURE_STATIC, " ")
    .replace(PWSH_ENUM_MEMBER, " ");
  if (PWSH_BAD_CALL.test(s)) return false;
  // pure variable assignments ($p = $_ -split ' ') are allowed inside blocks
  const assigns = [...s.matchAll(/\$(?:(?:global|script|local|private|env|using):)?[\w]+\s*=(?![=>])\s*[^;]*/g)];
  for (const a of assigns) {
    if (!pwshBlockReadonly(a[0].replace(/^[\s\S]*?=(?!=)/, ""), false)) return false;
    s = s.replace(a[0], " ");
  }
  const semi = pwshSplitTop(s, ";");
  if (semi.length > 1) {
    return semi.every((p) => pwshBlockReadonly(p, allowPipes));
  }
  if (allowPipes && s.includes("|")) {
    const parts = pwshSplitTop(s, "|");
    if (parts.length > 1) return parts.every((p) => pwshBlockReadonly(p, false));
  }
  // parenthesised groups may contain a pipe: ($_ | sls "x" -Quiet) -and (...)
  const groupRe = /\([^()]*\|[^()]*\)/g;
  let gm;
  while ((gm = groupRe.exec(s))) {
    const parts = gm[0].slice(1, -1).split("|");
    if (!parts.every((p) => pwshBlockReadonly(p, false))) return false;
    s = s.slice(0, gm.index) + " " + s.slice(gm.index + gm[0].length);
    groupRe.lastIndex = 0;
  }
  if (/(^|[^<>=!])=(?![=>])|[>;&`]|\$\(|@\{|\[[\w.]+\]::|\.\w+\s*\(|\|/.test(s)) return false;
  const verbs = [...s.matchAll(/(?:^|[\s|({])([a-z]+)-[a-z]\w*/gi)].map((m) => m[1]);
  if (verbs.some((v) => !PWSH_SAFE_VERB.test(v) && !PWSH_BLOCK_OPS.test(v))) return false;
  const cleaned = s
    .replace(/\d+(\.\d+)?(KB|MB|GB|TB)\b/gi, " ")
    .replace(/\$[\w:]+(\.[\w.]+|\[[\w'".\s-]*\])*(\s*\([^()]*\))?/g, " ")
    .replace(/\[[\w.]+\]/g, " ")
    .replace(/\b[\w]+-[\w-]+\b/g, " ")
    .replace(/(^|\s)-[\w?]+\b/g, " ")
    .replace(/\.[\w]+\b/g, " ");
  if (verbs.length) {
    // with a safe verb (or operator) head, leftover bare words are its
    // arguments — data, not code
    return !/[^\s\w.$'"()-]/.test(cleaned);
  }
  const hm = s.trim().match(/^([a-z][\w.-]*)\b/i);
  if (hm && PWSH_READ_WORDS.test(hm[1])) {
    return !/[^\s\w.$'"(),-]/.test(cleaned);
  }
  return !/[A-Za-z_]\w*/.test(cleaned);
}

function pwshHashInnerOk(inner) {
  let i = 0;
  const n = inner.length;
  while (i < n) {
    while (i < n && /[;\s]/.test(inner[i])) i += 1;
    if (i >= n) return true;
    const km = inner.slice(i).match(/^(\w+)\s*=/);
    if (!km) return false;
    i += km[0].length;
    let j = i;
    let q = null;
    let bd = 0;
    for (; j < n; j += 1) {
      const c = inner[j];
      if (q) {
        if (c === q) q = null;
        continue;
      }
      if (c === "'" || c === '"') { q = c; continue; }
      if (c === "{") bd += 1;
      else if (c === "}") bd -= 1;
      else if (c === ";" && bd === 0) break;
    }
    const v = inner.slice(i, j).trim();
    if (v.startsWith("{") && v.endsWith("}")) {
      if (!pwshBlockReadonly(v.slice(1, -1))) return false;
    } else if (!pwshBlockReadonly(v)) return false;
    i = j + 1;
  }
  return true;
}

function pwshStripHashLiterals(s) {
  let out = "";
  let i = 0;
  while (i < s.length) {
    const at = s.indexOf("@{", i);
    if (at === -1) {
      out += s.slice(i);
      break;
    }
    out += s.slice(i, at);
    let depth = 1;
    let q = null;
    let j = at + 2;
    for (; j < s.length; j += 1) {
      const c = s[j];
      if (q) {
        if (c === q) q = null;
        continue;
      }
      if (c === "'" || c === '"') { q = c; continue; }
      if (c === "{") depth += 1;
      else if (c === "}") {
        depth -= 1;
        if (!depth) break;
      }
    }
    if (depth !== 0 || !pwshHashInnerOk(s.slice(at + 2, j))) return null;
    out += " ";
    i = j + 1;
  }
  return out;
}

// tail of a `?`/Where-style segment: a filter expression, not a command —
// reject anything that could execute a mutation
function pwshTailPure(t) {
  const s = t
    .replace(/"[^"]*"|'[^']*'/g, "")
    .replace(PWSH_PURE_CALL, " ")
    .replace(PWSH_PURE_STATIC_IO, " ")
    .replace(PWSH_PURE_STATIC, " ")
    .replace(PWSH_ENUM_MEMBER, " ");
  if (PWSH_BAD_CALL.test(s)) return false;
  const blocks = s.match(/\{[^{}]*\}/g) || [];
  if (!blocks.every((b) => pwshBlockReadonly(b.slice(1, -1)))) return false;
  const rest = s.replace(/\{[^{}]*\}/g, " ");
  if (/[{}]/.test(rest)) return false;
  if (/[>|;&`]|\$\(|@\{|\[[\w.]+\]::|\.\w+\s*\(|(^|[^<>=!])=(?![=>])/.test(rest)) return false;
  const verbs = [...rest.matchAll(/(?:^|[\s|({])([a-z]+)-[a-z]\w*/gi)].map((m) => m[1]);
  return verbs.every((v) => PWSH_SAFE_VERB.test(v) || PWSH_BLOCK_OPS.test(v));
}

// expression-only segment (casts, static calls, member access, operators)
function pwshExprOnly(s) {
  let t = s;
  for (let i = 0; i < 8; i += 1) {
    const p = t;
    t = t
      .replace(/"[^"]*"|'[^']*'/g, " ")
      .replace(PWSH_PURE_STATIC_IO, " ")
      .replace(PWSH_PURE_STATIC, " ")
      .replace(PWSH_PURE_METHOD, " ")
      .replace(PWSH_ENUM_MEMBER, " ")
      .replace(/(^|[^\w)])\(([^()]*)\)/g, (m, pre, inner) => (pwshBlockReadonly(inner, true) ? `${pre} ` : m));
    if (t === p) break;
  }
  if (PWSH_BAD_CALL.test(t)) return false;
  if (/[>|;&`]|\$\(|@\{|\[[\w.]+\]::|\.\w+\s*\(|(^|[^<>=!])=(?![=>])|\b\w+-[\w-]+\b/.test(t)) return false;
  t = t
    .replace(/\$[\w:]+(\.[\w.]+|\[[^\]]*\])*/g, " ")
    .replace(/\[[\w.]+\]/g, " ")
    .replace(/(^|\s)-[\w?]+\b/g, " ")
    .replace(/\d+(\.\d+)?(kb|mb|gb|tb|pb|ns|us|ms|s)?\b/gi, " ")
    .replace(/\.[\w.]+\b/g, " ");
  return !/[A-Za-z_]\w*/.test(t);
}

function pwshReadonly(segment) {
  const raw = segment.trim();
  // read-sounding verbs that actually write: Get-WindowsUpdateLog emits a file
  if (/^\(*\s*Get-WindowsUpdateLog\b/i.test(raw)) return false;
  if (/^\$[\w:]+(\.\w+)*(\s+-(split|join|replace|match|notmatch|contains|notcontains|eq|ne|gt|lt|ge|le|like|notlike)\s+('[^']*'|"[^"]*"|\$[\w:.]+|\d+(\.\d+)?))*$/i.test(raw)) return true;
  // pure variable assignment: $x = <pure expression> (member/index writes
  // like $_.Name = 'x' mutate objects, not just the session)
  const am = raw.match(/^\$(?:(?:global|script|local|private|env|using):)?[\w]+\s*=(?![=>~])([\s\S]+)$/);
  if (am) return pwshBlockReadonly(am[1]);
  // collapse innermost parens holding pure content so nested calls like
  // .TotalMinutes((Get-Date x).TotalMinutes) become strippable; parens right
  // after a word char belong to a method call (x.Delete()) and must survive
  let stripped = raw;
  for (let i = 0; i < 8; i++) {
    const p = stripped;
    stripped = stripped
      .replace(/(^|[^\w)])\(([^()]*)\)/g, (m, pre, inner) => (pwshBlockReadonly(inner, true) ? `${pre} ` : m))
      .replace(PWSH_PURE_STATIC_IO, " ")
      .replace(PWSH_PURE_METHOD, " ")
      .replace(PWSH_PURE_STATIC, " ")
      .replace(PWSH_ENUM_MEMBER, " ")
      .replace(/\bNew-(TimeSpan|Guid|DateTimeOffset|Object|ScheduledTaskTrigger)\b/gi, "Get-Date");
    if (stripped === p) break;
  }
  const s = pwshStripHashLiterals(stripped);
  if (s === null) return false;
  // quote-masked copy for structural checks so ';', '@{}' and friends
  // inside string literals don't count
  const sq = s.replace(/"[^"]*"|'[^']*'/g, " ");
  if (/(?:^|\s)-WhatIf\b/i.test(raw)) return true;
  const headName = segmentHead(raw).head;
  if (headName === "?" || PWSH_FILTER_HEADS.has(headName)) {
    return pwshTailPure(s.replace(/^\s*\S+/, ""));
  }
  if (headName === "foreach-object" || headName === "%") {
    const blocks = sq.match(/\{[^{}]*\}/g);
    if (!blocks || !blocks.length) return false;
    const left = sq.replace(/\{[^{}]*\}/g, " ");
    if (/[>;&`]|\$\(|@\{|\[[\w.]+\]::|\.\w+\s*\(/.test(left)) return false;
    const leftVerbs = [...left.matchAll(/(?:^|[\s|({])([a-z]+)-[a-z]\w*/gi)].map((m) => m[1].toLowerCase());
    if (leftVerbs.some((v) => v !== "foreach" && !PWSH_SAFE_VERB.test(v) && !PWSH_BLOCK_OPS.test(v))) return false;
    return blocks.every((b) => pwshBlockReadonly(b.slice(1, -1)));
  }
  if (/[>;&`]|\$\(|@\{|\[[\w.]+\]::|\.\w+\s*\(/.test(sq)) return false;
  const verbs = [...sq.matchAll(/(?:^|[\s|({])([a-z]+)-[a-z]\w*/gi)].map((m) => m[1]);
  if (!verbs.length) {
    return pwshExprOnly(s) || (raw !== s && /^[\s(),.\d-]*$/.test(sq));
  }
  const segHeadName = segmentHead(s.replace(/^\(+/, "")).head;
  if (/^[a-z]+-[a-z]/i.test(segHeadName) && !PWSH_SAFE_VERB.test(segHeadName.split("-")[0])) return false;
  if (!verbs.every((v) => PWSH_SAFE_VERB.test(v))) return false;
  return (sq.match(/\{[^{}]*\}/g) || []).every((b) => PWSH_PURE_BLOCK.test(b) || pwshBlockReadonly(b.slice(1, -1))) && !/[{}]/.test(sq.replace(/\{[^{}]*\}/g, ""));
}

// piped-arg runners may only invoke filter-style commands: anything else can
// mutate the system even when its bare form looks read-only (xargs mount)
const PIPED_INNER_OK = new Set([
  "grep", "egrep", "fgrep", "rg", "wc", "sort", "awk", "gawk", "sed", "echo",
  "printf", "tr", "cut", "file", "stat", "ls", "du", "df", "basename",
  "dirname", "realpath", "readlink", "md5", "md5sum", "shasum", "sha1sum",
  "sha256sum", "sha512sum", "b2sum", "cksum", "sum", "uniq", "numfmt",
  "column", "nl", "pr", "fold", "rev", "getfattr", "lsattr", "date",
  "find", "shuf", "less", "more",
  // shells are just runners — the inner command was already vetted above
  "sh", "bash", "zsh", "fish", "dash", "pwsh", "powershell", "cmd",
]);

function isReadonlySegment(segment, shell, depth = 0) {
  const trimmed = segment.trim();
  // function definitions only declare; the body is risk-checked later anyway
  if (/^[\w.-]+\s*\(\s*\)\s*\{/s.test(trimmed)) {
    return true;
  }
  // bare shell assignments (X=1) mutate only session state
  if (!/^["'`]/.test(trimmed) && /^[A-Za-z_][A-Za-z0-9_]*=\S*(\s+[A-Za-z_][A-Za-z0-9_]*=\S*)*$/.test(trimmed)) {
    return true;
  }
  // a segment that is only a quoted literal cannot execute — require the
  // content to start like a word, so e.g. a markdown "# h1" fragment stays
  // unparseable; text after the quote (e.g. "... -f <expr>") is a real command
  if (/^["'][^"']*["']\s*$/.test(trimmed)) {
    return /^["'][A-Za-z]/.test(trimmed);
  }
  const { head, args } = segmentHead(segment);
  const windows = shell === "powershell" || shell === "pwsh" || shell === "cmd";
  if (!head) {
    // token-less or expression-only text ("[Env]::SetX(...", "C:\tmp\") is not
    // a recognised read-only command; let the PowerShell checks decide there
    return windows ? pwshReadonly(segment) : false;
  }
  // a leftover flag fragment after a split ("cmd | --flag") cannot execute;
  // only applies to real segments, not wrapper inner commands
  if (head.startsWith("-") && depth === 0) {
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
      if ((head === "xargs" || head === "find") && !PIPED_INNER_OK.has(segmentHead(inner).head)) {
        return false;
      }
      return true;
    }
  }

  const flagDeny = MUTATING_FLAGS[head === "gawk" ? "awk" : head];
  if (flagDeny && flagDeny.test(" " + args)) {
    return false;
  }

  // a head with a curated args rule (and no subcommand table) may not be
  // rescued by the looser PowerShell expression checks below
  const argsRule = READONLY_ARGS[head];
  if (argsRule && !READONLY_SUBCOMMANDS[head] && !argsRule.test(args.trim())) {
    return false;
  }

  const table = windows ? READONLY_HEADS_WINDOWS : READONLY_HEADS_UNIX;
  if (windows && pwshReadonly(segment)) {
    return true;
  }
  // a leading '(' wraps an expression (e.g. (Get-Item x).Delete()) — the
  // head table would see only the inner command name, not the method tail
  if ((!trimmed.startsWith("(") && table.has(head)) || argsRule?.test(args.trim())) {
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
  const { head: segHeadEarly, args: segArgsEarly } = segmentHead(segment);
  if ((DOC_LOOKUP_HEADS.has(segHeadEarly) && !(segHeadEarly === "man" && MUTATING_FLAGS.man.test(" " + segArgsEarly))) || (segHeadEarly === "command" && /^\s*-[vV]\b/.test(segArgsEarly))) {
    return { risk: "low", reason: "documentation lookup" };
  }
  const rm = rmTargetRisk(segment);
  if (rm) {
    return { risk: rm.risk, reason: rm.reason };
  }
  const masked = segment.replace(/"(?:[^"\\]|\\.)*"|'[^']*'/g, '""');
  // rmHead patterns: the rm token must sit outside quotes, but the target
  // check runs on the raw text so rm -rf "~" still resolves
  const rmOutsideQuotes = /\b(rm|ri|rd|rmdir|del|erase|Remove-Item)\b/i.test(masked);
  let risk = "low";
  let reason = "";
  for (const { re, reason: r, mask, rmHead } of CRITICAL_PATTERNS) {
    if (rmHead && !rmOutsideQuotes) continue;
    if (re.test(mask ? masked : segment)) {
      return { risk: "critical", reason: r };
    }
  }
  for (const { re, reason: r, mask } of HIGH_PATTERNS) {
    if (re.test(mask ? masked : segment)) {
      return { risk: "high", reason: r };
    }
  }
  for (const { re, reason: r, mask } of MODERATE_PATTERNS) {
    if (re.test(mask ? masked : segment)) {
      risk = "moderate";
      reason = r;
    }
  }
  if (risk === "low" && readsSecrets(segment, segHeadEarly)) {
    risk = "moderate";
    reason = "reads or prints secrets";
  }
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
        if (end < 0) { bodies.push(text.slice(i + 1)); break; }
        bodies.push(text.slice(i + 1, end));
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
      if (end < 0) { bodies.push(text.slice(i + 1)); break; }
      bodies.push(text.slice(i + 1, end));
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
    return { risk: "low", readonly: true, tags: ["empty"], caps: ["read"], reasons: [] };
  }

  let risk = "low";
  const tags = new Set();
  const reasons = [];
  for (const { re, reason } of LINE_CRITICAL) {
    if (re.test(text)) {
      const tags = ["critical"];
      const caps = [];
      if (/remote script|encoded/i.test(reason)) {
        tags.push("remote-or-encoded");
        caps.push("remote-exec");
      }
      if (/process/i.test(reason)) caps.push("process");
      return { risk: "critical", readonly: false, tags, caps, reasons: [reason] };
    }
  }
  const lineMasked = text.replace(/"[^"]*"|'[^']*'/g, '""');
  for (const { re, reason, mask } of LINE_HIGH) {
    if (re.test(mask ? lineMasked : text)) {
      risk = "high";
      reasons.push(reason);
      if (/remote script|encoded/i.test(reason)) tags.add("remote-or-encoded");
    }
  }

  const segments = splitCommandLine(text);
  let readonly = true;
  const caps = new Set();

  for (const segment of segments) {
    const segReadonly = isReadonlySegment(segment, shell);
    let { risk: segRisk, reason } = patternRisk(segment);
    const { head: segHead, args: segArgs } = segmentHead(segment);
    let inner = innerCommandOf(segHead, segArgs);
    // walk wrappers recursively (xargs → sh -c → rm {}) so nested risk surfaces
    for (let guard = 0; inner && guard < 4; guard += 1) {
      const innerRes = patternRisk(inner);
      if (RISK_SCORE[innerRes.risk] > RISK_SCORE[segRisk]) {
        segRisk = innerRes.risk;
        reason = innerRes.reason;
      }
      const { head: ih, args: ia } = segmentHead(inner);
      const deeper = innerCommandOf(ih, ia);
      if (!deeper || deeper === inner) break;
      inner = deeper;
    }
    for (const c of capsForSegment(segHead, segArgs, reason)) caps.add(c);
    if (!segReadonly) {
      readonly = false;
      if (segHead && !reason) {
        tags.add("non-readonly:" + segHead);
      }
    }
    if (RISK_SCORE[segRisk] > RISK_SCORE[risk]) {
      risk = segRisk;
    }
    if (reason) reasons.push(reason);
    if (segRisk === "high" && /remote script|encoded/i.test(reason)) tags.add("remote-or-encoded");
  }

  // "yes" is only read-only when a downstream segment terminates the stream
  const segHeads = segments.map((s) => segmentHead(s).head);
  if (segHeads.includes("yes") && segments.length > 1
    && !segHeads.some((h) => ["head", "tail", "less", "more", "shuf", "grep", "egrep", "fgrep", "rg", "awk", "gawk", "sed", "dd", "timeout", "gtimeout", "jq"].includes(h))) {
    readonly = false;
  }

  const subs = substitutionBodies(text, shell);
  if (subs.length) {
    tags.add("substitution");
    let allClean = true;
    for (const body of subs) {
      // arithmetic expansion $(( expr )) evaluates, never executes
      const arith = body
        .replace(/\$\([^()]*\)/g, "0")
        .replace(/\$\{[^}]*\}/g, "0")
        .replace(/\$[\w]+/g, "0")
        .replace(/'[^']*'|"[^"]*"/g, "0");
      if (/^[\s()\d+\-*/%<>=!&|^~?:.,]*$/.test(arith)) continue;
      const res = _depth >= 3 ? { readonly: false, risk: "moderate" } : analyzeCommand(body, { shell, _depth: _depth + 1 });
      if (!res.readonly || res.risk !== "low") allClean = false;
      if (RISK_SCORE[res.risk] > RISK_SCORE[risk]) risk = res.risk;
      if (res.reasons?.length) reasons.push(...res.reasons);
    }
    if (!allClean) {
      if (RISK_SCORE[risk] < RISK_SCORE.moderate) risk = "moderate";
      readonly = false;
    }
  } else if (/`[^`]+`|\$\(|<\(|>\(/.test(shell === "powershell" || shell === "pwsh" ? text : text.replace(/'[^']*'/g, "''"))) {
    tags.add("substitution");
    if (RISK_SCORE[risk] < RISK_SCORE.moderate) risk = "moderate";
    readonly = false;
  }
  if (/\beval\b/i.test(text)) tags.add("eval");
  if (ELEVATION_RE.test(text)) {
    tags.add("elevated");
    caps.add("elevated");
    if (RISK_SCORE[risk] < RISK_SCORE.high && !readonly) risk = "high";
  }
  if (segments.length > 1) tags.add("pipeline");
  if (tags.has("remote-or-encoded")) caps.add("remote-exec");

  if (readonly && risk !== "low") readonly = false;
  if (readonly && !caps.size) caps.add("read");
  return { risk, readonly, tags: [...tags], caps: [...caps], reasons: [...new Set(reasons)] };
}

export function applyPolicyToPlan(plan, { shell = "sh" } = {}) {
  let allReadonly = true;
  let maxRisk = "low";
  const blockers = [];
  const caps = new Set();

  for (const step of plan.commands || []) {
    const analysis = analyzeCommand(step.command, { shell });
    step.policy = analysis;
    for (const c of analysis.caps || []) caps.add(c);
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
    caps: [...caps],
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
