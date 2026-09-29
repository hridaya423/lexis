# eval: llama-server / /Users/hridyaagrawal/.local/share/lexis/models/Qwen2.5-Coder-7B-Instruct-Q4_K_M.gguf (debug7b)
- mode: schema · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 6/8 (75%)
- cold p50 6174ms p95 9888ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✓ | 7966 | - | node --version ; npm --version |
| u02 | ✗ | 5875 | - | du -sh * |
| u03 | ✓ | 5251 | - | curl ifconfig.me |
| u04 | ✓ | 6750 | - | lsof -i :3000 |
| u05 | ✗ | 5548 | - | du |
| u06 | ✓ | 6174 | - | find . -type f -name '*.log' -mtime -1 |
| u07 | ✓ | 5338 | - | ps aux | grep node |
| u08 | ✓ | 9888 | - | git status ; git branch --show-current |
