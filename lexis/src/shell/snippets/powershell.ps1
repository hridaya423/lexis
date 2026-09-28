# >>> lexis >>>
# Lexis auto mode: Enter key interception routes natural language to lx.
$env:LEXIS_SHELL = 'powershell'

function __LexisInvoke {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$LexisArgs)
  lexis @LexisArgs
  return $LASTEXITCODE
}

function __LexisRun {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$LexisArgs)
  if (-not (Get-Command lexis -ErrorAction SilentlyContinue)) { return 127 }
  return (__LexisInvoke run --quiet ($LexisArgs -join ' '))
}

function __LexisShouldAutoRun {
  param([string]$Line)
  if ($env:LEXIS_DISABLED -eq '1') { return $false }
  $trimmed = ($Line | Out-String).Trim()
  if ([string]::IsNullOrWhiteSpace($trimmed)) { return $false }
  if ($trimmed.StartsWith('#')) { return $false }
  if ($trimmed -match '[|><;&`]') { return $false }
  if ($trimmed.Contains('$(')) { return $false }
  $first = ($trimmed -split '\s+', 2)[0]
  if (-not $first) { return $false }
  # keywords/builtins that must never route to Lexis
  if ($first -in @('exit','break','continue','return','cd','pwd','cls','clear','echo','set','copy','move','del','erase','rd','rmdir','md','mkdir','type','ren','pushd','popd','dir','kill','start','help','history')) { return $false }
  if ($first -match '^[./\\]') { return $false }
  if ($first -match '^[A-Za-z]:[\\/]') { return $false }
  if ($first -match '\.(exe|cmd|bat|ps1|psm1|sh)$') { return $false }
  if ($first.Contains('=')) { return $false }
  if (Get-Command $first -ErrorAction SilentlyContinue) { return $false }
  if (@($trimmed -split '\s+' | Select-Object -Skip 1 | Where-Object { $_ -match '^-' }).Count -gt 0) { return $false }
  try { if ([Console]::IsInputRedirected -or [Console]::IsOutputRedirected) { return $false } } catch {}
  return $true
}

function __LexisHandleEnter {
  param($Key, $Arg)
  $line = ''
  $cursor = 0
  [Microsoft.PowerShell.PSConsoleReadLine]::GetBufferState([ref]$line, [ref]$cursor)
  $shouldAutoRun = $false
  try { $shouldAutoRun = __LexisShouldAutoRun $line } catch { [Microsoft.PowerShell.PSConsoleReadLine]::AcceptLine(); return }
  if (-not $shouldAutoRun) { [Microsoft.PowerShell.PSConsoleReadLine]::AcceptLine(); return }
  [Microsoft.PowerShell.PSConsoleReadLine]::AddToHistory($line)
  [Microsoft.PowerShell.PSConsoleReadLine]::RevertLine()
  try { __LexisRun $line | Out-Null } finally { [Microsoft.PowerShell.PSConsoleReadLine]::InvokePrompt() }
}

function lx {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$LexisArgs)
  if ($LexisArgs.Count -eq 0) { return (__LexisInvoke --help) }
  $first = $LexisArgs[0]
  if (@('run','plan','explain','fix','setup','hooks','uninstall','config','web-search','doctor','model','history','update','help','--help','-h') -contains $first) {
    return (__LexisInvoke @LexisArgs)
  }
  if ($first -eq 'off') { $env:LEXIS_DISABLED = '1'; Write-Host "Lexis paused for this terminal ('lx on' to resume)."; return 0 }
  if ($first -eq 'on') { $env:LEXIS_DISABLED = ''; Write-Host 'Lexis active.'; return 0 }
  __LexisRun @LexisArgs
}

if (-not (Get-Command Set-PSReadLineKeyHandler -ErrorAction SilentlyContinue)) {
  Import-Module PSReadLine -ErrorAction SilentlyContinue | Out-Null
}
if (Get-Command Set-PSReadLineKeyHandler -ErrorAction SilentlyContinue) {
  Set-PSReadLineKeyHandler -Key Enter -BriefDescription LexisEnter -LongDescription 'Lexis auto mode' -ScriptBlock {
    param($key, $arg)
    __LexisHandleEnter $key $arg
  }
}
# <<< lexis <<<
