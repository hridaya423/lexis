const INSTALL_PS1 = [
  "param()",
  "$ErrorActionPreference = \"Stop\"",
  "",
  "function Require-Command([string]$Name) {",
  "  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {",
  "    throw \"Missing required command: $Name\"",
  "  }",
  "}",
  "",
  "Require-Command node",
  "Require-Command npm",
  "",
  "$source = if ($env:LEXIS_INSTALL_SOURCE) { $env:LEXIS_INSTALL_SOURCE } else { \"@hridyacodes/lexis\" }",
  "Write-Host \"[lexis-install] Installing Lexis from: $source\"",
  "npm install -g $source | Out-Host",
  "",
  "if (-not (Get-Command lexis -ErrorAction SilentlyContinue)) {",
  "  throw \"'lexis' command not found after install\"",
  "}",
  "",
  "$args = @('setup', '--enable-web-search', '--web-provider', 'mcp')",
  "if ($env:LEXIS_PROFILE) {",
  "  $args += @('--profile', $env:LEXIS_PROFILE)",
  "}",
  "if ($env:LEXIS_HOOK_MODE) {",
  "  $args += @('--hook-mode', $env:LEXIS_HOOK_MODE)",
  "}",
  "",
  "Write-Host \"[lexis-install] Running setup\"",
  "lexis @args | Out-Host",
  "Write-Host \"[lexis-install] Done. Open a new terminal and run: lx doctor\"",
].join("\n") + "\n";

export function GET() {
  return new Response(INSTALL_PS1, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
