# @hridyacodes/lexis

Lexis is a local-first terminal assistant.

Install once, then talk to your terminal in plain English.

## Install

```bash
npm install -g @hridyacodes/lexis
```

## Quick Start

```bash
lexis setup
lx doctor
```

In `auto` hook mode, type natural language directly in your shell.

In `lx` mode, prefix commands with `lx`.

Examples:

```bash
lx install pnpm
lx check if brew is installed
lx show node and npm versions
```

## Common Commands

```bash
lx doctor
lx config show
lx config set-model qwen2.5-coder:14b
lx config set-hook-mode auto
lx config set-hook-mode lx
lx hooks uninstall
```

## Uninstall

```bash
lx uninstall --yes
```
