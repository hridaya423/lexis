# eval: apple-fm / qwen2.5-coder-1.5b
- pass: 3/6 (50%)
- latency p50 4415ms p95 8672ms

| case | pass | latency | commands |
| --- | --- | --- | --- |
| u01 | ✗ | 8672ms | brew outdated node && brew outdated npm |
| u02 | ✓ | 3309ms | ls -la |
| u03 | ✓ | 3599ms | curl -I ifconfig.com |
| u04 | ✓ | 4415ms | netstat -tulnp | grep :3000 |
| u05 | ✗ | 5289ms | df -h . |
| u06 | ✗ | 4000ms | find /Users/hridyaagrawal/Honey/React/smartterminal/lexis -name '*.log' -type f  |
