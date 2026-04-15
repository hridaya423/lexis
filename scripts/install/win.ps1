param(
  [string]$Profile = "",
  [string]$HookMode = "",
  [string]$InstallSource = ""
)

$ErrorActionPreference = "Stop"

function Log([string]$Message) {
  Write-Host "[lexis-install] $Message"
}

function Require-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Missing required command: $Name"
  }
}

function Add-CommonNodePaths {
  $candidates = @(
    (Join-Path $env:ProgramFiles "nodejs"),
    (Join-Path ${env:ProgramFiles(x86)} "nodejs"),
    (Join-Path $env:LOCALAPPDATA "Programs\nodejs")
  )

  foreach ($path in $candidates) {
    if ($path -and (Test-Path $path) -and -not ($env:Path.Split(';') -contains $path)) {
      $env:Path = "$path;$env:Path"
    }
  }
}

function Ensure-Npm {
  if (Get-Command npm -ErrorAction SilentlyContinue) {
    return
  }

  Log "npm not found. Attempting to install Node.js LTS..."

  if (Get-Command winget -ErrorAction SilentlyContinue) {
    winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements --silent | Out-Host
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

  Add-CommonNodePaths

  if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw "npm is still unavailable after auto-install attempt"
  }
}

function Resolve-InstallSource {
  if ($InstallSource) {
    return $InstallSource
  }

  if ($env:LEXIS_INSTALL_SOURCE) {
    return $env:LEXIS_INSTALL_SOURCE
  }

  $localPackage = Join-Path $PSScriptRoot "..\..\lexis"
  if (Test-Path (Join-Path $localPackage "package.json")) {
    return (Resolve-Path $localPackage).Path
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
Require-Command node
Require-Command npm

$source = Resolve-InstallSource
Log "Installing Lexis from: $source"
npm install -g $source | Out-Host

if (-not (Get-Command lexis -ErrorAction SilentlyContinue)) {
  throw "'lexis' command not found after install"
}

$selectedProfile = Choose-Profile
$selectedHookMode = Choose-HookMode

Log "Running setup (profile=$selectedProfile, hook-mode=$selectedHookMode)"
lexis setup --profile $selectedProfile --hook-mode $selectedHookMode --enable-web-search --web-provider mcp | Out-Host

Log "Done. Open a new terminal and run: lx doctor"
