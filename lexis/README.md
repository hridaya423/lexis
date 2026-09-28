# Lexis

Ask in plain language. See exactly what will happen. Run it without giving up control of your terminal.

Lexis plans shell commands from natural language, shows you the plan with a deterministic risk assessment, and executes only what you approve. It runs fully on-device by default — no cloud account, no Python, no permanent background services.

## Install

```bash
# macOS / Linux
curl -fsSL https://lexis.app/install.sh | bash

# Windows (PowerShell)
irm https://lexis.app/win.ps1 | iex
```

Or from source / npm:

```bash
npm install -g @hridyacodes/lexis
lexis setup
```

## Providers

| Provider | Where it runs | Download | Best for |
| --- | --- | --- | --- |
| `llama-server` | prebuilt llama.cpp, on-device | ~1–4 GB model | default — Metal, Vulkan, CUDA, CPU |
| `apple-fm` | Apple Foundation Models, on-device | 0 MB | macOS 26+ with Apple Intelligence (experimental — weaker on command planning) |
| `ollama` | your existing Ollama | reuses Ollama models | if you already run Ollama |
| `openai-compat` | any OpenAI-compatible endpoint | none | LM Studio, remote servers, BYOK |

`provider.active = "auto"` (default) resolves: an already-installed llama-server runtime → apple-fm if available → ollama if installed → managed llama-server (installs on demand).

```bash
lx model status          # what's available and what's running
lx model list            # model catalog
lx model use <provider>  # switch provider (auto|apple-fm|llama-server|ollama|openai-compat)
lx model use openai-compat --base-url http://localhost:1234/v1 --model <id> --api-key-env LEXIS_API_KEY
lx model download <id>   # fetch a GGUF (lexis-owned, removed on uninstall)
lx model stop            # stop the local server (it also self-stops when idle)
```

**Model choice is measured, not guessed** (`eval/` harness, 96-case set on identical prompts):

| Model | Pass | Warm p50 | Role |
| --- | --- | --- | --- |
| kitty-bash-0.5b | 72% | ~0.1s | **default** — 0.4 GB, unix only |
| qwen3-linuxcmd-4b | 81% | ~0.4s | opt-in upgrade (`lx model use`) — unix **and** windows, best measured |

Both emit one bare command (`format: plain`); multi-step intents come back
as `a && b` chains, which policy inspects as a whole. The ~46-model bake-off
(`eval/reports/`) retired the old schema catalog — kitty owns the speed/RAM
floor, linuxcmd owns accuracy.

## Shell integration

`lexis setup` installs hooks for **your active shell only** (bash, zsh, fish, or PowerShell profile).

- **auto** (default): type natural language directly; anything that isn't a real command is routed to Lexis.
- **lx**: only `lx <intent>` invokes Lexis.

```bash
lx hooks diff          # preview the exact snippet before it touches your rc file
lx hooks install --shell zsh
lx hooks uninstall
lx off                 # pause for this terminal session
lx on                  # resume
```

Auto mode deliberately does **not** override `exit`, and `kill`/`install` only route to Lexis when the arguments are clearly natural language.

## Daily use

Routing rules in auto mode:

- Real commands, flags, and paths pass straight to the shell — `gh --version` missing stays `gh: command not found`, never rewritten.
- Everything else (plain English, including inputs zsh can't parse like `hi?` or `what's on port 3000`) is planned by the model.
- Read-only commands run immediately; anything else shows a one-key card (`enter` run · `e` edit · `esc` cancel). Critical risk needs the word `yes`.
- Hooks only engage on a real TTY — agent-spawned `zsh -ic` / piped shells get plain `command not found`.

```bash
LEXIS_TIMING=1 lx list files   # per-phase timing on stderr
```

## Safety model

Every command goes through a deterministic policy engine after the model plans it:

- read-only allowlist → may auto-run
- destructive patterns → risk floor the model cannot lower (`rm -rf` of home/root/wildcards is `critical` and needs the word `yes` typed)
- remote-script-to-shell and encoded commands → always confirm
- `sudo`, service stops, package removal → elevated floors

```bash
lx explain 'rm -rf ~'    # see the verdict without running anything
lx plan <intent>         # plan only, never executes
lx history               # redacted local audit log
```

## Runtime

llama-server is downloaded as a pinned prebuilt binary (no Python, no pip, no venv):

```bash
lx model runtime install                 # auto backend: metal / vulkan / cpu
lx model runtime install --backend cpu   # force
lx config set runtime.idleTimeoutSec 0   # never auto-stop (default 1800s)
lx doctor --fix                          # repair common problems
lx update                                # self-update via npm (skips if local is newer)
```

## Config

`~/.config/lexis/config.json` (`%APPDATA%\lexis` on Windows). See `lx config` for keys; web search is `builtin` (in-process DuckDuckGo) or `mcp` for an external server.

## Development

```bash
npm --prefix lexis test                 # node:test suite
node lexis/eval/run.mjs --provider llama-server --model qwen3-linuxcmd-4b   # model bake-off
cd platform/apple-fm-helper && swift build -c release                    # rebuild the macOS helper
```
