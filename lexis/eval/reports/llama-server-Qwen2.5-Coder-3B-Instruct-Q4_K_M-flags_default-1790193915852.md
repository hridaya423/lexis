# eval: llama-server / Qwen2.5-Coder-3B-Instruct-Q4_K_M.gguf (flags_default)
- mode: schema · dataset core.jsonl#83828218eadbc7f7 · repeat 2
- pass: 26/30 (87%)
- cold p50 2732ms p95 4643ms · warm p50 2607ms p95 4334ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✓ | 5741 | 3394 | node -v ; npm -v |
| u02 | ✓ | 2408 | 2329 | ls -lh |
| u03 | ✓ | 2252 | 2036 | curl ifconfig.me |
| u04 | ✓ | 2834 | 2809 | lsof -i :3000 |
| u05 | ✓ | 2732 | 2607 | du -sh . |
| u06 | ✓ | 3112 | 2883 | find /Users/hridyaagrawal/Honey/React/smartterminal/lexis -type f -name '*.log'  |
| u07 | ✓ | 2123 | 2060 | ps aux | grep node |
| u08 | ✓ | 2954 | 2972 | git status ; git branch |
| u09 | ✓ | 2289 | 2111 | brew install ripgrep |
| u10 | ✓ | 3161 | 3048 | mkdir projects ; cd projects |
| u11 | ✓ | 2736 | 2665 | tar -czvf archive.tar.gz /Users/hridyaagrawal/Honey/React/smartterminal/lexis |
| u12 | ✓ | 2200 | 2034 | echo $PATH |
| u13 | ✗ | 3581 | 3384 | lsof -i :8080 ; kill -9 <PID> |
| u14 | ✓ | 2594 | 2427 | tail -n 20 /var/log/syslog |
| u15 | ✗ | 2260 | 2197 | brew list python3 |
| u16 | ✓ | 3037 | 2775 | brew update ; brew outdated |
| u17 | ✓ | 3045 | 2862 | echo $SHELL ; echo $HOME |
| u18 | ✓ | 2363 | 2305 | git reset --soft HEAD~1 |
| u19 | ✓ | 2672 | 2545 | du -sh ~/* | sort -rh | head -n 5 |
| u20 | ✗ | 2037 | 1907 | top |
| u21 | ✓ | 2559 | 2499 | find . -name '*.js' -type f -exec wc -l {} + |
| u22 | ✓ | 2095 | 2034 | brew services restart docker |
| u23 | ✓ | 3096 | 4439 | chmod +x script.sh ; ./script.sh |
| u24 | ✓ | 4077 | 3589 | grep -r TODO /Users/hridyaagrawal/Honey/React/smartterminal/lexis |
| u25 | ✓ | 4643 | 4334 | mkdir -p ~/Downloads ; curl -O https://example.com/file.zip ; mv file.zip ~/Down |
| u26 | ✓ | 3367 | 3149 | sysctl -n hw.ncpu ; sysctl -n hw.model |
| u27 | ✓ | 2673 | 2556 | echo 'export FOO=bar' >> ~/.zshrc |
| u28 | ✓ | 2834 | 2730 | find . -type d -name 'node_modules' -exec rm -rf {} + |
| u29 | ✗ | 2313 | 2258 | sudo lsof -i -P -n | grep LISTEN |
| u30 | ✓ | 2396 | 2287 | unzip file.zip |
