# Lexis

Lexis is a local-first terminal assistant: install once, then type natural language in your shell.

No special prefix required. Just type things like:

- `check if brew is installed`
- `install pnpm`
- `show node and npm versions`

## Install

macOS / Linux:

```bash
curl -fsSL https://lexis.hridya.tech/install.sh | bash
```

Windows (PowerShell):

```powershell
iwr https://lexis.hridya.tech/win.ps1 -useb | iex
```

If you self-host the website, these endpoints are served directly by the app:

- `/install.sh`
- `/win.ps1`

The installer installs Node.js if needed, installs the `lexis` CLI, then runs `lexis setup`: a guided flow that picks a provider, downloads the llama.cpp runtime and a model, installs shell hooks, and verifies the whole path end-to-end.

Runtime selection is automatic (prebuilt, pinned llama.cpp release — no Python, no venv):

- macOS (Apple Silicon): Metal
- macOS (Intel): CPU
- Linux / Windows: CUDA when a supported NVIDIA driver is present, else Vulkan, else CPU

During setup, Lexis asks how you want to use it:

- `auto`: route natural-language commands directly in terminal
- `lx`: only run when you explicitly call `lx ...`

## How It Works After Install

1. Open a new terminal.
2. If you chose `auto`, type normal English directly.
3. If you chose `lx`, prefix commands with `lx`.
4. Higher-risk actions ask for confirmation.

Examples in `auto` mode:

```bash
check if brew is installed
install pnpm
show node and npm versions
```

Examples in `lx` mode:

```bash
lx check if brew is installed
lx install pnpm
lx show node and npm versions
```

## Everyday Commands

```bash
lx doctor
lx config show
lx model use llama-server
lx model download qwen2.5-coder-3b
lx hooks uninstall
```

## Safety

- A deterministic policy engine sets a risk floor the model cannot lower.
- Anything the engine cannot prove read-only requires confirmation.
- Low-confidence plans require confirmation.
- Critical plans require typed `YES` + `EXECUTE` — no flag bypasses them.
- Planning always includes detected platform/shell context, so Windows and Unix commands can differ.

## Web Retrieval (No API Key Required)

Lexis can pull web context into planning when needed. The default provider is `builtin` (in-process DuckDuckGo); `mcp` is available for an external server.

## Session Controls

In a hooked shell:

- `lx off` pauses Lexis for the current terminal session; `lx on` resumes.
- `lx uninstall` removes hooks, config, runtime, and downloaded models.

For full command options, run:

```bash
lx --help
```
