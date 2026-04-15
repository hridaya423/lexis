export const runtime = "nodejs";

const INSTALL_PS1 = String.raw`param(
  [string]$Profile = "",
  [string]$HookMode = "",
  [string]$InstallSource = ""
)

$ErrorActionPreference = "Stop"

try {
  [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
}
catch {
}

function Log([string]$Message) {
  Write-Host "[lexis-install] $Message"
}

function Require-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Missing required command: $Name"
  }
}

function Add-PathCandidate([string]$Candidate) {
  if (-not $Candidate) {
    return
  }

  if (-not (Test-Path $Candidate)) {
    return
  }

  $entries = @($env:Path -split ';' | Where-Object { $_ })
  if ($entries -contains $Candidate) {
    return
  }

  $env:Path = "$Candidate;$env:Path"
}

function Add-CommonNodePaths {
  $candidates = @()

  if ($env:ProgramFiles) {
    $candidates += (Join-Path $env:ProgramFiles "nodejs")
  }
  if ($env:"ProgramFiles(x86)") {
    $candidates += (Join-Path $env:"ProgramFiles(x86)" "nodejs")
  }
  if ($env:LOCALAPPDATA) {
    $candidates += (Join-Path $env:LOCALAPPDATA "Programs\nodejs")
  }
  if ($env:APPDATA) {
    $candidates += (Join-Path $env:APPDATA "npm")
  }

  foreach ($candidate in $candidates) {
    Add-PathCandidate $candidate
  }
}

function Get-NpmGlobalPrefix {
  if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    return ""
  }

  try {
    $prefixLine = (& npm prefix -g 2>$null | Select-Object -First 1)
    if ($prefixLine) {
      return $prefixLine.Trim()
    }
  }
  catch {
  }

  return ""
}

function Add-NpmGlobalBinPath {
  Add-CommonNodePaths

  $prefix = Get-NpmGlobalPrefix
  if ($prefix) {
    Add-PathCandidate $prefix
  }
}

function Ensure-Npm {
  if (Get-Command npm -ErrorAction SilentlyContinue) {
    return
  }

  Log "npm not found. Attempting to install Node.js LTS..."

  if (Get-Command winget -ErrorAction SilentlyContinue) {
    $wingetArgs = @(
      "install",
      "--id",
      "OpenJS.NodeJS.LTS",
      "-e",
      "--accept-source-agreements",
      "--accept-package-agreements",
      "--silent",
      "--disable-interactivity"
    )

    & winget @wingetArgs 1>$null
    if ($LASTEXITCODE -ne 0) {
      throw "winget failed to install Node.js LTS"
    }
  }
  elseif (Get-Command choco -ErrorAction SilentlyContinue) {
    choco install nodejs-lts -y | Out-Host
  }
  elseif (Get-Command scoop -ErrorAction SilentlyContinue) {
    scoop install nodejs-lts | Out-Host
  }
  else {
    throw "npm is missing and no package manager was found. Install Node.js LTS, then rerun installer."
  }

  Add-NpmGlobalBinPath

  if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw "npm is still unavailable after auto-install attempt"
  }
}

function Resolve-LexisCommand {
  $direct = Get-Command lexis -ErrorAction SilentlyContinue
  if ($direct) {
    return $direct.Source
  }

  $candidates = @(
    (Join-Path (Get-NpmGlobalPrefix) "lexis.cmd"),
    (Join-Path (Get-NpmGlobalPrefix) "lexis"),
    (Join-Path $env:APPDATA "npm\lexis.cmd"),
    (Join-Path $env:APPDATA "npm\lexis")
  )

  foreach ($candidate in ($candidates | Where-Object { $_ } | Select-Object -Unique)) {
    if (Test-Path $candidate) {
      return $candidate
    }
  }

  return ""
}

function Resolve-InstallSource {
  if ($InstallSource) {
    return $InstallSource
  }

  if ($env:LEXIS_INSTALL_SOURCE) {
    return $env:LEXIS_INSTALL_SOURCE
  }

  return "@hridyacodes/lexis"
}

function Choose-Profile {
  if ($Profile -in @("light", "balanced", "heavy")) {
    return $Profile
  }

  if ($env:LEXIS_PROFILE -in @("light", "balanced", "heavy")) {
    return $env:LEXIS_PROFILE
  }

  $answer = Read-Host "Model profile [light/balanced/heavy] (default: balanced)"
  if ([string]::IsNullOrWhiteSpace($answer)) {
    return "balanced"
  }

  $value = $answer.Trim().ToLowerInvariant()
  if ($value -in @("light", "balanced", "heavy")) {
    return $value
  }

  Log "Invalid profile '$value'. Using balanced."
  return "balanced"
}

function Choose-HookMode {
  if ($HookMode -in @("auto", "lx")) {
    return $HookMode
  }

  if ($env:LEXIS_HOOK_MODE -in @("auto", "lx")) {
    return $env:LEXIS_HOOK_MODE
  }

  $answer = Read-Host "Hook mode [auto/lx] (default: auto)"
  if ([string]::IsNullOrWhiteSpace($answer)) {
    return "auto"
  }

  $value = $answer.Trim().ToLowerInvariant()
  if ($value -in @("auto", "lx")) {
    return $value
  }

  Log "Invalid hook mode '$value'. Using auto."
  return "auto"
}

Ensure-Npm
Add-NpmGlobalBinPath
Require-Command node
Require-Command npm

$source = Resolve-InstallSource
Log "Installing Lexis from: $source"
npm install -g $source | Out-Host
if ($LASTEXITCODE -ne 0) {
  throw "npm install -g failed"
}

Add-NpmGlobalBinPath

$lexisCommand = Resolve-LexisCommand
if (-not $lexisCommand) {
  $prefix = Get-NpmGlobalPrefix
  throw "'lexis' command not found after install (npm prefix: $prefix)"
}

$selectedProfile = Choose-Profile
$selectedHookMode = Choose-HookMode

Log "Running setup (profile=$selectedProfile, hook-mode=$selectedHookMode)"
& $lexisCommand setup --profile $selectedProfile --hook-mode $selectedHookMode --enable-web-search --web-provider mcp | Out-Host
if ($LASTEXITCODE -ne 0) {
  throw "lexis setup failed"
}

Log "Done. Open a new terminal and run: lx doctor"
`;

export async function GET() {
  return new Response(INSTALL_PS1, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
