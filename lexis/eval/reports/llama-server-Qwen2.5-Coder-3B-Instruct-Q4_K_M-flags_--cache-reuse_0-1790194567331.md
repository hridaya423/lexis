# eval: llama-server / Qwen2.5-Coder-3B-Instruct-Q4_K_M.gguf (flags_--cache-reuse_0)
- mode: schema · dataset core.jsonl#83828218eadbc7f7 · repeat 2
- pass: 26/30 (87%)
- cold p50 2684ms p95 4427ms · warm p50 2541ms p95 4316ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✓ | 2943 | 2852 | node -v ; npm -v |
| u02 | ✓ | 2293 | 2188 | ls -lh |
| u03 | ✓ | 2195 | 2085 | curl ifconfig.me |
| u04 | ✓ | 2684 | 2574 | lsof -i :3000 |
| u05 | ✓ | 2326 | 2205 | du -sh . |
| u06 | ✓ | 3002 | 2888 | find /Users/hridyaagrawal/Honey/React/smartterminal/lexis -type f -name '*.log'  |
| u07 | ✓ | 2181 | 2145 | ps aux | grep node |
| u08 | ✓ | 2951 | 2853 | git status ; git branch |
| u09 | ✓ | 2180 | 2056 | brew install ripgrep |
| u10 | ✓ | 3203 | 3075 | mkdir projects ; cd projects |
| u11 | ✓ | 2770 | 2637 | tar -czvf archive.tar.gz /Users/hridyaagrawal/Honey/React/smartterminal/lexis |
| u12 | ✓ | 2188 | 2079 | echo $PATH |
| u13 | ✗ | 3551 | 3406 | lsof -i :8080 ; kill -9 <PID> |
| u14 | ✓ | 2561 | 2424 | tail -n 20 /var/log/syslog |
| u15 | ✗ | 2245 | 2098 | brew list python3 |
| u16 | ✓ | 3088 | 4771 | brew update ; brew outdated |
| u17 | ✓ | 4853 | 2914 | echo $SHELL ; echo $HOME |
| u18 | ✓ | 2497 | 2335 | git reset --soft HEAD~1 |
| u19 | ✓ | 2659 | 2541 | du -sh ~/* | sort -rh | head -n 5 |
| u20 | ✗ | 2048 | 1892 | top |
| u21 | ✓ | 2634 | 2469 | find . -name '*.js' -type f -exec wc -l {} + |
| u22 | ✓ | 2117 | 2068 | brew services restart docker |
| u23 | ✓ | 3062 | 2916 | chmod +x script.sh ; ./script.sh |
| u24 | ✓ | 2727 | 2604 | grep -r TODO /Users/hridyaagrawal/Honey/React/smartterminal/lexis |
| u25 | ✓ | 4427 | 4316 | mkdir -p ~/Downloads ; curl -O https://example.com/file.zip ; mv file.zip ~/Down |
| u26 | ✓ | 3238 | 3504 | sysctl -n hw.ncpu ; sysctl -n hw.model |
| u27 | ✓ | 2684 | 2539 | echo 'export FOO=bar' >> ~/.zshrc |
| u28 | ✓ | 2797 | 2711 | find . -type d -name 'node_modules' -exec rm -rf {} + |
| u29 | ✗ | 2330 | 2226 | sudo lsof -i -P -n | grep LISTEN |
| u30 | ✓ | 2368 | 2234 | unzip file.zip |
