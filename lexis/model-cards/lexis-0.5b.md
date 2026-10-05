---
license: apache-2.0
base_model: Qwen/Qwen2.5-Coder-0.5B-Instruct
language:
- en
pipeline_tag: text-generation
library_name: gguf
tags:
- gguf
- llama.cpp
- shell
- bash
- powershell
- terminal
- nl2bash
---

# lexis-0.5b

Plain English in, one shell command out, for macOS, Linux and Windows. This is the small local model for [Lexis](https://github.com/hridaya423/lexis), a terminal assistant that shows every command on an approval card before it runs. Lexis picks it on machines with less than 8 GB of memory.

It is a full fine-tune of Qwen2.5-Coder-0.5B-Instruct on 147,065 requests whose commands were each checked on their target OS. The file is Q4_K_M, 398 MB, and answers in about 100 ms on an Apple M4 Pro.

| | macOS | Linux | Windows | All |
|---|---|---|---|---|
| Final held-out set, first try | 246 / 337 | 261 / 332 | 207 / 250 | **714 / 919 (77.7%)** |

The untrained base model scores 188 / 919 on the same set. [lexis-1.5b](https://huggingface.co/hridya423/lexis-1.5b-GGUF) scores 757 / 919 at 986 MB and about 250 ms; use it if you have the memory. [METHODOLOGY.md](METHODOLOGY.md) covers the data, the checks, the evaluation, and the experiments that didn't help.

## Use it through Lexis

```bash
curl -fsSL https://lexis.hridya.tech/install.sh | bash   # macOS, Linux
irm https://lexis.hridya.tech/win.ps1 | iex              # Windows
lx "biggest 10 files in my Downloads"
```

## Use it directly

The model expects exactly the prompt it was trained on: a fixed system prompt, then the request with a platform line appended.

```bash
llama-server -m lexis-0.5b-q4_k_m.gguf --jinja -c 4096 --port 8080
```

```bash
curl -s localhost:8080/v1/chat/completions -d '{
  "temperature": 0,
  "messages": [
    {"role": "system", "content": "You are a bash command generator. Given a natural language request, output only the bash command that accomplishes it. No explanation, no markdown fences."},
    {"role": "user", "content": "find all pdfs on my desktop\n(Platform: macOS (BSD), shell: zsh)"}
  ]}' | jq -r '.choices[0].message.content'
```

Platform lines used in training:

- `(Platform: macOS (BSD), shell: zsh)`
- `(Platform: Linux (GNU), shell: bash)`
- `(Platform: windows, shell: powershell)`, with this system prompt instead: `You are a PowerShell command generator. Given a natural language request, output only the PowerShell command that accomplishes it. No explanation, no markdown fences.`

To fix a failed command, use `You fix broken bash commands. Given a failed command and its error output, output only the corrected command. No explanation.` as the system prompt. The user message is the command after `$ `, then the error output on the following lines, with no platform line.

## Limits

- **One command per answer, no explanation.** Multi-step tasks come back joined with `&&` or `;`.
- **About one first-try answer in four or five is wrong.** It knows fewer rare tools than the 1.5B and is more likely to use a Linux-only flag on macOS.
- **It does what it's asked, including destructive things.** It has no safety judgment of its own. Don't execute its output without a review step; Lexis provides one.
