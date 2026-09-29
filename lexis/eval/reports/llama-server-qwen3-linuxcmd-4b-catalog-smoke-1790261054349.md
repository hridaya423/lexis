# eval: llama-server / qwen3-linuxcmd-4b (catalog-smoke)
- mode: schema · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 3/3 (100%)
- cold p50 398ms p95 421ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✓ | 398 | - | node -v && npm -v |
| u02 | ✓ | 287 | - | ls -lh |
| u03 | ✓ | 421 | - | curl -s ifconfig.me/ip |
