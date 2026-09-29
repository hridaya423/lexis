# eval: llama-server / Qwen2.5-Coder-3B-Instruct-Q4_K_M.gguf (flags_-fa_on_-c_4096_--cache-reuse_256)
- mode: schema · dataset core.jsonl#83828218eadbc7f7 · repeat 2
- pass: 26/30 (87%)
- cold p50 2664ms p95 3572ms · warm p50 2559ms p95 3658ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✓ | 2866 | 2931 | node -v ; npm -v |
| u02 | ✓ | 2304 | 2192 | ls -lh |
| u03 | ✓ | 2180 | 2091 | curl ifconfig.me |
| u04 | ✓ | 2600 | 2473 | lsof -i :3000 |
| u05 | ✓ | 2289 | 2163 | du -sh . |
| u06 | ✓ | 3000 | 2874 | find /Users/hridyaagrawal/Honey/React/smartterminal/lexis -type f -name '*.log'  |
| u07 | ✓ | 2177 | 2145 | ps aux | grep node |
| u08 | ✓ | 2863 | 3489 | git status ; git branch |
| u09 | ✓ | 3439 | 3658 | brew install ripgrep |
| u10 | ✓ | 3572 | 3214 | mkdir projects ; cd projects |
| u11 | ✓ | 2816 | 2659 | tar -czvf archive.tar.gz /Users/hridyaagrawal/Honey/React/smartterminal/lexis |
| u12 | ✓ | 2182 | 2100 | echo $PATH |
| u13 | ✗ | 3519 | 3398 | lsof -i :8080 ; kill -9 <PID> |
| u14 | ✓ | 2573 | 2454 | tail -n 20 /var/log/syslog |
| u15 | ✗ | 2247 | 2182 | brew list python3 |
| u16 | ✓ | 2970 | 2871 | brew update ; brew outdated |
| u17 | ✓ | 3011 | 2876 | echo $SHELL ; echo $HOME |
| u18 | ✓ | 2449 | 2286 | git reset --soft HEAD~1 |
| u19 | ✓ | 2664 | 2559 | du -sh ~/* | sort -rh | head -n 5 |
| u20 | ✗ | 2037 | 1905 | top |
| u21 | ✓ | 2578 | 2509 | find . -name '*.js' -type f -exec wc -l {} + |
| u22 | ✓ | 2138 | 2010 | brew services restart docker |
| u23 | ✓ | 3047 | 2924 | chmod +x script.sh ; ./script.sh |
| u24 | ✓ | 2734 | 2565 | grep -r TODO /Users/hridyaagrawal/Honey/React/smartterminal/lexis |
| u25 | ✓ | 4493 | 4351 | mkdir -p ~/Downloads ; curl -O https://example.com/file.zip ; mv file.zip ~/Down |
| u26 | ✓ | 3241 | 3167 | sysctl -n hw.ncpu ; sysctl -n hw.model |
| u27 | ✓ | 2657 | 2505 | echo 'export FOO=bar' >> ~/.zshrc |
| u28 | ✓ | 2824 | 2693 | find . -type d -name 'node_modules' -exec rm -rf {} + |
| u29 | ✗ | 2349 | 2217 | sudo lsof -i -P -n | grep LISTEN |
| u30 | ✓ | 2378 | 2283 | unzip file.zip |
