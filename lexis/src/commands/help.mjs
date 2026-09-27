export async function helpCommand() {
  process.stdout.write(`Lexis — plan and run terminal commands from plain language.

Usage
  lx <intent>               plan + run a command (auto mode in shell hooks does this too)
  lx run <intent>           same as lx <intent>
  lx plan <intent>          show the plan without executing
  lx explain <command>      show policy analysis for a command
  lx fix                    replan the last failed command with its error
  lx web-search <query>     debug: show fetched web context
  lx history [--limit n]    recent plans and results (redacted)
  lx doctor [--fix|--json]  health checks
  lx setup                  interactive setup; flags: --provider <id> --model <id>
                            --backend cpu|metal|vulkan|cuda --hook-mode auto|lx
                            (openai-compat: --base-url <url> [--model-id <m>] [--api-key-env VAR])
  lx hooks <status|install|uninstall|diff> [--mode auto|lx] [--shell ...]
  lx model <status|list|use|download|remove|start|stop|runtime install|runtime build-apple>
  lx config <show|reset|set <key> <value>>
  lx update                 update lexis itself via npm
  lx uninstall [--yes] [--keep-npm]
  lx help

Providers
  apple-fm       Apple Foundation Models (macOS 26+, Apple Silicon) — experimental, much slower
  llama-server   prebuilt llama.cpp llama-server + a downloaded GGUF model
  ollama         your existing Ollama install
  openai-compat  any OpenAI-compatible server (LM Studio, remote) via --base-url

Run flags
  --yes           auto-approve reviews up to moderate risk
  --force         auto-approve reviews up to high risk (never critical)
  --dry-run       print the plan only, never executes
  --json          machine-readable plan, never executes
  --quiet         minimal output (used by shell hooks)
  --model <id>    override the configured model for this run
  --allow-web     fetch web context even if webSearch.enabled is false
  --web-mode      off | auto | always

Env
  LEXIS_SHELL             force shell detection (set automatically by hooks)
  LEXIS_APPLE_FM_BIN      override the Apple helper binary path
  LEXIS_SERVER_ARGS       extra llama-server flags (tuning escape hatch)
  <apiKeyEnv>             env var holding an openai-compat API key
`);
}
