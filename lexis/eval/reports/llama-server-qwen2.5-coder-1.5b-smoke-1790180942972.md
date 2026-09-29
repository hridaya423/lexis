# eval: llama-server / qwen2.5-coder-1.5b (smoke)
- mode: schema · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 7/8 (88%)
- cold p50 2723ms p95 3048ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✓ | 2943 | - | node -v ; npm -v |
| u02 | ✓ | 2073 | - | ls -lh |
| u03 | ✓ | 2636 | - | curl ifconfig.me |
| u04 | ✓ | 2919 | - | lsof -i :3000 |
| u05 | ✓ | 1930 | - | du -sh . |
| u06 | ✗ | 2723 | - | find /Users/hridyaagrawal/Honey/React/smartterminal/lexis -type f -name '*.log'  |
| u07 | ✓ | 2244 | - | ps aux | grep node |
| u08 | ✓ | 3048 | - | git status ; git branch |
