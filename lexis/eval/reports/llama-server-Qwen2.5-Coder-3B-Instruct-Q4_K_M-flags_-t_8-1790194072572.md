# eval: llama-server / Qwen2.5-Coder-3B-Instruct-Q4_K_M.gguf (flags_-t_8)
- mode: schema · dataset core.jsonl#83828218eadbc7f7 · repeat 2
- pass: 26/30 (87%)
- cold p50 2498ms p95 4303ms · warm p50 2403ms p95 4091ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✓ | 2768 | 2774 | node -v ; npm -v |
| u02 | ✓ | 2168 | 2059 | ls -lh |
| u03 | ✓ | 2088 | 1956 | curl ifconfig.me |
| u04 | ✓ | 2418 | 2269 | lsof -i :3000 |
| u05 | ✓ | 2167 | 2053 | du -sh . |
| u06 | ✓ | 2895 | 3104 | find /Users/hridyaagrawal/Honey/React/smartterminal/lexis -type f -name '*.log'  |
| u07 | ✓ | 2084 | 1993 | ps aux | grep node |
| u08 | ✓ | 2869 | 2789 | git status ; git branch |
| u09 | ✓ | 2139 | 1966 | brew install ripgrep |
| u10 | ✓ | 3077 | 3004 | mkdir projects ; cd projects |
| u11 | ✓ | 2617 | 2473 | tar -czvf archive.tar.gz /Users/hridyaagrawal/Honey/React/smartterminal/lexis |
| u12 | ✓ | 2085 | 2040 | echo $PATH |
| u13 | ✗ | 3434 | 3202 | lsof -i :8080 ; kill -9 <PID> |
| u14 | ✓ | 2465 | 2319 | tail -n 20 /var/log/syslog |
| u15 | ✗ | 2259 | 1985 | brew list python3 |
| u16 | ✓ | 3508 | 4409 | brew update ; brew outdated |
| u17 | ✓ | 4303 | 2864 | echo $SHELL ; echo $HOME |
| u18 | ✓ | 2404 | 2264 | git reset --soft HEAD~1 |
| u19 | ✓ | 2498 | 2375 | du -sh ~/* | sort -rh | head -n 5 |
| u20 | ✗ | 1929 | 1882 | top |
| u21 | ✓ | 2485 | 2517 | find . -name '*.js' -type f -exec wc -l {} + |
| u22 | ✓ | 2013 | 1987 | brew services restart docker |
| u23 | ✓ | 2949 | 2881 | chmod +x script.sh ; ./script.sh |
| u24 | ✓ | 2540 | 2427 | grep -r TODO /Users/hridyaagrawal/Honey/React/smartterminal/lexis |
| u25 | ✓ | 4316 | 4091 | mkdir -p ~/Downloads ; curl -O https://example.com/file.zip ; mv file.zip ~/Down |
| u26 | ✓ | 3146 | 2948 | sysctl -n hw.ncpu ; sysctl -n hw.model |
| u27 | ✓ | 2519 | 2403 | echo 'export FOO=bar' >> ~/.zshrc |
| u28 | ✓ | 2676 | 2642 | find . -type d -name 'node_modules' -exec rm -rf {} + |
| u29 | ✗ | 2308 | 2111 | sudo lsof -i -P -n | grep LISTEN |
| u30 | ✓ | 2298 | 2157 | unzip file.zip |
