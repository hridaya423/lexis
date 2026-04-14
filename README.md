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

The installer sets up Ollama-backed local runtime, writes config, and installs shell hooks.
If Ollama is missing, setup attempts to install it automatically.

You do not need `npm` to use Lexis after installation.


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
lx config set-model qwen2.5-coder:14b
lx config set-hook-mode auto
lx config set-hook-mode lx
lx hooks uninstall
```

## Safety

- Risk is model-driven.
- Low-confidence plans require confirmation.
- Critical plans get a second-pass review by a larger model.
- If still critical, Lexis asks for double confirmation before execution.
- Planning always includes detected platform/shell context, so Windows and Unix commands can differ.

## Web Retrieval (No API Key Required)

Lexis uses MCP web search by default and can pull page content into model context when needed.

## Session Controls

In a hooked shell:

- `exit` disables Lexis for the current terminal session (instead of closing your shell).
- `uninstall` (no args) removes Lexis hooks + package.
- You can also run `lx uninstall --yes`.

For full command options, run:

```bash
lx --help
```
