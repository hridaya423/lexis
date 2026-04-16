import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { MARKERS } from "./constants.mjs";

const BASH_SNIPPET_AUTO = `${MARKERS.shellStart}
__lexis_run() {
  if ! command -v lexis >/dev/null 2>&1; then
    return 127
  fi
  command lexis run --quiet "$*"
}

__lexis_deactivate() {
  unset __LEXIS_CNF_ACTIVE 2>/dev/null || true
  unset -f command_not_found_handle 2>/dev/null || true
  unset -f lx 2>/dev/null || true
  unset -f kill 2>/dev/null || true
  unset -f install 2>/dev/null || true
  unset -f uninstall 2>/dev/null || true
  unset -f exit 2>/dev/null || true
  unset -f __lexis_run 2>/dev/null || true
  unset -f __lexis_deactivate 2>/dev/null || true
  printf "Lexis disabled for this terminal.\n"
}

lx() {
  if [ "$#" -eq 0 ]; then
    command lexis --help
    return $?
  fi

  case "$1" in
    run|setup|hooks|uninstall|config|web-search|mcp|doctor|help|--help|-h)
      command lexis "$@"
      return $?
      ;;
  esac

  __lexis_run "$*"
}

exit() {
  if [ "$#" -gt 0 ]; then
    builtin exit "$@"
  fi
  __lexis_deactivate
  return 0
}

uninstall() {
  if [ "$#" -gt 0 ]; then
    printf "Use 'uninstall' with no arguments to remove Lexis.\n" >&2
    return 2
  fi

  if ! command -v lexis >/dev/null 2>&1; then
    printf "%s: command not found\n" "lexis" >&2
    return 127
  fi

  command lexis uninstall --yes
  __lexis_deactivate
  return 0
}

install() {
  if [ "$#" -eq 0 ]; then
    command install "$@"
    return $?
  fi

  case "$1" in
    -*)
      command install "$@"
      return $?
      ;;
  esac

  if [ "$#" -ge 2 ]; then
    command install "$@"
    return $?
  fi

  __lexis_run "install $*"
  local exit_code=$?
  if [ "$exit_code" -eq 127 ]; then
    printf "%s: command not found\n" "lexis" >&2
    return 127
  fi
  return $exit_code
}

kill() {
  if [ "$#" -eq 0 ]; then
    builtin kill "$@"
    return $?
  fi

  case "$1" in
    --|-*|[0-9]*|%*)
      builtin kill "$@"
      return $?
      ;;
  esac

  __lexis_run "kill $*"
  local exit_code=$?
  if [ "$exit_code" -eq 127 ]; then
    printf "%s: command not found\n" "lexis" >&2
    return 127
  fi
  return $exit_code
}

if ! declare -F command_not_found_handle >/dev/null; then
  command_not_found_handle() {
    if [ -n "\${__LEXIS_CNF_ACTIVE:-}" ]; then
      printf "%s: command not found\n" "$1" >&2
      return 127
    fi

    if ! command -v lexis >/dev/null 2>&1; then
      printf "%s: command not found\n" "$1" >&2
      return 127
    fi

    __LEXIS_CNF_ACTIVE=1
    __lexis_run "$*"
    local exit_code=$?
    unset __LEXIS_CNF_ACTIVE
    return $exit_code
  }
fi
${MARKERS.shellEnd}`;

const ZSH_SNIPPET_AUTO = `${MARKERS.shellStart}
__lexis_run() {
  if ! command -v lexis >/dev/null 2>&1; then
    return 127
  fi
  command lexis run --quiet "$*"
}

__lexis_deactivate() {
  unset __LEXIS_CNF_ACTIVE 2>/dev/null || true
  unset -f command_not_found_handler 2>/dev/null || true
  unset -f lx 2>/dev/null || true
  unset -f kill 2>/dev/null || true
  unset -f install 2>/dev/null || true
  unset -f uninstall 2>/dev/null || true
  unset -f exit 2>/dev/null || true
  unset -f __lexis_run 2>/dev/null || true
  unset -f __lexis_deactivate 2>/dev/null || true
  print "Lexis disabled for this terminal."
}

lx() {
  if [ "$#" -eq 0 ]; then
    command lexis --help
    return $?
  fi

  case "$1" in
    run|setup|hooks|uninstall|config|web-search|mcp|doctor|help|--help|-h)
      command lexis "$@"
      return $?
      ;;
  esac

  __lexis_run "$*"
}

exit() {
  if [ "$#" -gt 0 ]; then
    builtin exit "$@"
  fi
  __lexis_deactivate
  return 0
}

uninstall() {
  if [ "$#" -gt 0 ]; then
    print -u2 "Use 'uninstall' with no arguments to remove Lexis."
    return 2
  fi

  if ! command -v lexis >/dev/null 2>&1; then
    print -u2 "lexis: command not found"
    return 127
  fi

  command lexis uninstall --yes
  __lexis_deactivate
  return 0
}

install() {
  if [ "$#" -eq 0 ]; then
    command install "$@"
    return $?
  fi

  case "$1" in
    -*)
      command install "$@"
      return $?
      ;;
  esac

  if [ "$#" -ge 2 ]; then
    command install "$@"
    return $?
  fi

  __lexis_run "install $*"
  local exit_code=$?
  if [ "$exit_code" -eq 127 ]; then
    print -u2 "lexis: command not found"
    return 127
  fi
  return $exit_code
}

kill() {
  if [ "$#" -eq 0 ]; then
    builtin kill "$@"
    return $?
  fi

  case "$1" in
    --|-*|[0-9]*|%*)
      builtin kill "$@"
      return $?
      ;;
  esac

  __lexis_run "kill $*"
  local exit_code=$?
  if [ "$exit_code" -eq 127 ]; then
    print -u2 "lexis: command not found"
    return 127
  fi
  return $exit_code
}

if ! typeset -f command_not_found_handler >/dev/null; then
  command_not_found_handler() {
    if [[ -n "\${__LEXIS_CNF_ACTIVE:-}" ]]; then
      print -u2 "$1: command not found"
      return 127
    fi

    if ! command -v lexis >/dev/null 2>&1; then
      print -u2 "$1: command not found"
      return 127
    fi

    __LEXIS_CNF_ACTIVE=1
    __lexis_run "$*"
    local exit_code=$?
    unset __LEXIS_CNF_ACTIVE
    return $exit_code
  }
fi
${MARKERS.shellEnd}`;

const FISH_SNIPPET_AUTO = `${MARKERS.fishStart}
function __lexis_run
  if not command -sq lexis
    return 127
  end
  lexis run --quiet $argv
  return $status
end

function __lexis_deactivate
  set -e __LEXIS_CNF_ACTIVE
  functions -e fish_command_not_found 2>/dev/null
  functions -e lx 2>/dev/null
  functions -e kill 2>/dev/null
  functions -e install 2>/dev/null
  functions -e uninstall 2>/dev/null
  functions -e exit 2>/dev/null
  functions -e __lexis_run 2>/dev/null
  functions -e __lexis_deactivate 2>/dev/null
  printf "Lexis disabled for this terminal.\n"
end

function lx
  if test (count $argv) -eq 0
    lexis --help
    return $status
  end

  set first $argv[1]
  switch $first
    case run setup hooks uninstall config web-search mcp doctor help --help -h
      lexis $argv
      return $status
  end

  __lexis_run $argv
end

function exit
  if test (count $argv) -gt 0
    builtin exit $argv
    return $status
  end
  __lexis_deactivate
  return 0
end

function uninstall
  if test (count $argv) -gt 0
    printf "Use 'uninstall' with no arguments to remove Lexis.\n" 1>&2
    return 2
  end

  if not command -sq lexis
    printf "lexis: command not found\n" 1>&2
    return 127
  end

  lexis uninstall --yes
  __lexis_deactivate
  return 0
end

function install
  if test (count $argv) -eq 0
    command install
    return $status
  end

  set first $argv[1]
  if string match -qr '^-' -- $first
    command install $argv
    return $status
  end

  if test (count $argv) -ge 2
    command install $argv
    return $status
  end

  __lexis_run (string join " " -- install $argv)
  set exit_code $status
  if test $exit_code -eq 127
    printf "lexis: command not found\n" 1>&2
    return 127
  end
  return $exit_code
end

function kill
  if test (count $argv) -eq 0
    command kill
    return $status
  end

  set first $argv[1]
  if string match -qr '^(--|-|-[A-Za-z0-9-]+|[0-9]+|%[0-9]+)$' -- $first
    command kill $argv
    return $status
  end

  __lexis_run (string join " " -- kill $argv)
  set exit_code $status
  if test $exit_code -eq 127
    printf "lexis: command not found\n" 1>&2
    return 127
  end
  return $exit_code
end

if not functions -q fish_command_not_found
  function fish_command_not_found
    if set -q __LEXIS_CNF_ACTIVE
      printf "%s: command not found\n" $argv[1] 1>&2
      return 127
    end

    if not command -sq lexis
      printf "%s: command not found\n" $argv[1] 1>&2
      return 127
    end

    set -g __LEXIS_CNF_ACTIVE 1
    __lexis_run (string join " " -- $argv)
    set status_code $status
    set -e __LEXIS_CNF_ACTIVE
    return $status_code
  end
end
${MARKERS.fishEnd}`;

const POWERSHELL_SNIPPET_AUTO = `${MARKERS.psStart}
function __LexisRun {
  param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$LexisArgs
  )

  if (-not (Get-Command lexis -ErrorAction SilentlyContinue)) {
    return 127
  }

  lexis run --quiet ($LexisArgs -join ' ')
  return $LASTEXITCODE
}

function __LexisDeactivate {
  Remove-Item function:\\command_not_found_handler -ErrorAction SilentlyContinue
  Remove-Item function:\\lx -ErrorAction SilentlyContinue
  Remove-Item function:\\kill -ErrorAction SilentlyContinue
  Remove-Item function:\\install -ErrorAction SilentlyContinue
  Remove-Item function:\\uninstall -ErrorAction SilentlyContinue
  Remove-Item function:\\exit -ErrorAction SilentlyContinue
  Remove-Item function:\\__LexisRun -ErrorAction SilentlyContinue
  Remove-Item function:\\__LexisDeactivate -ErrorAction SilentlyContinue
  Write-Host 'Lexis disabled for this terminal.'
}

function lx {
  param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$LexisArgs
  )

  if ($LexisArgs.Count -eq 0) {
    lexis --help
    return $LASTEXITCODE
  }

  $first = $LexisArgs[0]
  if (@('run', 'setup', 'hooks', 'uninstall', 'config', 'web-search', 'mcp', 'doctor', 'help', '--help', '-h') -contains $first) {
    lexis @LexisArgs
    return $LASTEXITCODE
  }

  __LexisRun @LexisArgs
}

function exit {
  param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [object[]]$ExitArgs
  )

  if ($ExitArgs.Count -gt 0) {
    Microsoft.PowerShell.Core\\Exit @ExitArgs
    return
  }

  __LexisDeactivate
}

function uninstall {
  param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$UninstallArgs
  )

  if ($UninstallArgs.Count -gt 0) {
    Write-Error "Use 'uninstall' with no arguments to remove Lexis."
    return 2
  }

  if (-not (Get-Command lexis -ErrorAction SilentlyContinue)) {
    Write-Error 'lexis: command not found'
    return 127
  }

  lexis uninstall --yes | Out-Null
  __LexisDeactivate
  return 0
}

function install {
  param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$InstallArgs
  )

  if ($InstallArgs.Count -eq 0) {
    & install.exe
    return $LASTEXITCODE
  }

  if ($InstallArgs[0] -like '-*') {
    & install.exe @InstallArgs
    return $LASTEXITCODE
  }

  if ($InstallArgs.Count -ge 2) {
    & install.exe @InstallArgs
    return $LASTEXITCODE
  }

  $result = __LexisRun ('install ' + ($InstallArgs -join ' '))
  if ($result -eq 127) {
    Write-Error 'lexis: command not found'
    return 127
  }
  return $result
}

function kill {
  param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$KillArgs
  )

  if ($KillArgs.Count -eq 0) {
    Microsoft.PowerShell.Management\\Stop-Process
    return
  }

  $first = $KillArgs[0]
  if ($first -match '^(--|-|-[A-Za-z0-9-]+|[0-9]+|%[0-9]+)$') {
    Microsoft.PowerShell.Management\\Stop-Process @KillArgs
    return
  }

  $result = __LexisRun ('kill ' + ($KillArgs -join ' '))
  if ($result -eq 127) {
    Write-Error 'lexis: command not found'
    return 127
  }
  return $result
}
${MARKERS.psEnd}`;

const BASH_SNIPPET_LX = `${MARKERS.shellStart}
__lexis_run() {
  if ! command -v lexis >/dev/null 2>&1; then
    return 127
  fi
  command lexis run --quiet "$*"
}

lx() {
  if [ "$#" -eq 0 ]; then
    command lexis --help
    return $?
  fi

  case "$1" in
    run|setup|hooks|uninstall|config|web-search|mcp|doctor|help|--help|-h)
      command lexis "$@"
      return $?
      ;;
  esac

  __lexis_run "$*"
}
${MARKERS.shellEnd}`;

const ZSH_SNIPPET_LX = `${MARKERS.shellStart}
__lexis_run() {
  if ! command -v lexis >/dev/null 2>&1; then
    return 127
  fi
  command lexis run --quiet "$*"
}

lx() {
  if [ "$#" -eq 0 ]; then
    command lexis --help
    return $?
  fi

  case "$1" in
    run|setup|hooks|uninstall|config|web-search|mcp|doctor|help|--help|-h)
      command lexis "$@"
      return $?
      ;;
  esac

  __lexis_run "$*"
}
${MARKERS.shellEnd}`;

const FISH_SNIPPET_LX = `${MARKERS.fishStart}
function __lexis_run
  if not command -sq lexis
    return 127
  end
  lexis run --quiet $argv
  return $status
end

function lx
  if test (count $argv) -eq 0
    lexis --help
    return $status
  end

  set first $argv[1]
  switch $first
    case run setup hooks uninstall config web-search mcp doctor help --help -h
      lexis $argv
      return $status
  end

  __lexis_run $argv
end
${MARKERS.fishEnd}`;

const POWERSHELL_SNIPPET_LX = `${MARKERS.psStart}
function __LexisRun {
  param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$LexisArgs
  )

  if (-not (Get-Command lexis -ErrorAction SilentlyContinue)) {
    return 127
  }

  lexis run --quiet ($LexisArgs -join ' ')
  return $LASTEXITCODE
}

function lx {
  param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$LexisArgs
  )

  if ($LexisArgs.Count -eq 0) {
    lexis --help
    return $LASTEXITCODE
  }

  $first = $LexisArgs[0]
  if (@('run', 'setup', 'hooks', 'uninstall', 'config', 'web-search', 'mcp', 'doctor', 'help', '--help', '-h') -contains $first) {
    lexis @LexisArgs
    return $LASTEXITCODE
  }

  __LexisRun @LexisArgs
}
${MARKERS.psEnd}`;

export function normalizeHookMode(mode) {
  const value = String(mode || "")
    .trim()
    .toLowerCase();

  if (["auto", "always", "full"].includes(value)) {
    return "auto";
  }

  if (["lx", "manual", "command"].includes(value)) {
    return "lx";
  }

  return "";
}

function getHookSnippets(mode) {
  const resolvedMode = normalizeHookMode(mode) || "auto";
  if (resolvedMode === "lx") {
    return {
      bash: BASH_SNIPPET_LX,
      zsh: ZSH_SNIPPET_LX,
      fish: FISH_SNIPPET_LX,
      powershell: POWERSHELL_SNIPPET_LX,
      mode: resolvedMode,
    };
  }

  return {
    bash: BASH_SNIPPET_AUTO,
    zsh: ZSH_SNIPPET_AUTO,
    fish: FISH_SNIPPET_AUTO,
    powershell: POWERSHELL_SNIPPET_AUTO,
    mode: "auto",
  };
}

export async function installHooks({ mode } = {}) {
  const tasks = [];
  const shell = detectShell();
  const snippets = getHookSnippets(mode);

  if (process.platform === "win32") {
    for (const profilePath of getPowerShellProfilePaths()) {
      tasks.push(addSnippet(profilePath, snippets.powershell));
    }
  } else {
    tasks.push(addSnippet(path.join(os.homedir(), ".bashrc"), snippets.bash));
    tasks.push(addSnippet(path.join(os.homedir(), ".zshrc"), snippets.zsh));
    tasks.push(addSnippet(path.join(os.homedir(), ".config", "fish", "config.fish"), snippets.fish));
  }

  const results = await Promise.all(tasks);
  return { shell, results, mode: snippets.mode };
}

export async function uninstallHooks() {
  const tasks = [];

  if (process.platform === "win32") {
    for (const profilePath of getPowerShellProfilePaths()) {
      tasks.push(removeSnippet(profilePath, MARKERS.psStart, MARKERS.psEnd));
    }
  } else {
    tasks.push(removeSnippet(path.join(os.homedir(), ".bashrc"), MARKERS.shellStart, MARKERS.shellEnd));
    tasks.push(removeSnippet(path.join(os.homedir(), ".zshrc"), MARKERS.shellStart, MARKERS.shellEnd));
    tasks.push(removeSnippet(path.join(os.homedir(), ".config", "fish", "config.fish"), MARKERS.fishStart, MARKERS.fishEnd));
  }

  const results = await Promise.all(tasks);
  return { results };
}

export function detectShell() {
  if (process.platform === "win32") {
    return "powershell";
  }
  const shell = process.env.SHELL || "";
  if (shell.includes("zsh")) {
    return "zsh";
  }
  if (shell.includes("fish")) {
    return "fish";
  }
  return "bash";
}

async function addSnippet(filePath, snippet) {
  await ensureParent(filePath);
  const existing = await readMaybe(filePath);
  if (existing.includes(snippet)) {
    return { filePath, changed: false };
  }

  const cleaned = stripAllSnippets(existing).replace(/\n+$/g, "");

  const separator = cleaned.length > 0 ? "\n\n" : "";
  await fs.writeFile(filePath, `${cleaned}${separator}${snippet}\n`, "utf8");
  return { filePath, changed: true };
}

function stripAllSnippets(content) {
  return [
    [MARKERS.shellStart, MARKERS.shellEnd],
    [MARKERS.fishStart, MARKERS.fishEnd],
    [MARKERS.psStart, MARKERS.psEnd],
  ].reduce((acc, [start, end]) => stripSnippet(acc, start, end), content);
}

async function removeSnippet(filePath, startMarker, endMarker) {
  const existing = await readMaybe(filePath);
  if (existing.length === 0) {
    return { filePath, changed: false };
  }

  const stripped = stripSnippet(existing, startMarker, endMarker).replace(/\n{3,}/g, "\n\n");
  if (stripped === existing) {
    return { filePath, changed: false };
  }

  await fs.writeFile(filePath, stripped.replace(/\n+$/g, "") + "\n", "utf8");
  return { filePath, changed: true };
}

function stripSnippet(content, startMarker, endMarker) {
  const escapedStart = escapeRegex(startMarker);
  const escapedEnd = escapeRegex(endMarker);
  const pattern = new RegExp(`${escapedStart}[\\s\\S]*?${escapedEnd}\\n?`, "g");
  return content.replace(pattern, "");
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function ensureParent(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function readMaybe(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return "";
  }
}

function getPowerShellProfilePaths() {
  const userProfile = process.env.USERPROFILE || os.homedir();
  return [
    path.join(userProfile, "Documents", "PowerShell", "Microsoft.PowerShell_profile.ps1"),
    path.join(userProfile, "Documents", "WindowsPowerShell", "Microsoft.PowerShell_profile.ps1"),
  ];
}
