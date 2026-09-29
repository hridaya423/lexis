# eval: llama-server / kitty-bash-0.5b (kitty-catalog-smoke)
- mode: schema · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 2/3 (67%)
- cold p50 118ms p95 207ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✓ | 80 | - | node --version npm --version |
| u02 | ✗ | 118 | - | find . -type f -exec ls -s {} \; |
| u03 | ✓ | 207 | - | curl -s https://api.ipify.org |
