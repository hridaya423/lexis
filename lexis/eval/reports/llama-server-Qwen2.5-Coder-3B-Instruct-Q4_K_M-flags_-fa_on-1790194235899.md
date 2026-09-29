# eval: llama-server / Qwen2.5-Coder-3B-Instruct-Q4_K_M.gguf (flags_-fa_on)
- mode: schema · dataset core.jsonl#83828218eadbc7f7 · repeat 2
- pass: 26/30 (87%)
- cold p50 2665ms p95 4482ms · warm p50 2541ms p95 3461ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✓ | 2869 | 2920 | node -v ; npm -v |
| u02 | ✓ | 2332 | 2166 | ls -lh |
| u03 | ✓ | 2219 | 2148 | curl ifconfig.me |
| u04 | ✓ | 2624 | 2499 | lsof -i :3000 |
| u05 | ✓ | 2303 | 2181 | du -sh . |
| u06 | ✓ | 3009 | 2876 | find /Users/hridyaagrawal/Honey/React/smartterminal/lexis -type f -name '*.log'  |
| u07 | ✓ | 2188 | 2095 | ps aux | grep node |
| u08 | ✓ | 2924 | 2842 | git status ; git branch |
| u09 | ✓ | 2670 | 3461 | brew install ripgrep |
| u10 | ✓ | 5210 | 3149 | mkdir projects ; cd projects |
| u11 | ✓ | 2777 | 2630 | tar -czvf archive.tar.gz /Users/hridyaagrawal/Honey/React/smartterminal/lexis |
| u12 | ✓ | 2189 | 2125 | echo $PATH |
| u13 | ✗ | 3554 | 3415 | lsof -i :8080 ; kill -9 <PID> |
| u14 | ✓ | 2536 | 2434 | tail -n 20 /var/log/syslog |
| u15 | ✗ | 2251 | 2185 | brew list python3 |
| u16 | ✓ | 2968 | 2841 | brew update ; brew outdated |
| u17 | ✓ | 3019 | 2881 | echo $SHELL ; echo $HOME |
| u18 | ✓ | 2439 | 2282 | git reset --soft HEAD~1 |
| u19 | ✓ | 2646 | 2541 | du -sh ~/* | sort -rh | head -n 5 |
| u20 | ✗ | 2008 | 1939 | top |
| u21 | ✓ | 2615 | 2472 | find . -name '*.js' -type f -exec wc -l {} + |
| u22 | ✓ | 2116 | 2024 | brew services restart docker |
| u23 | ✓ | 3125 | 2940 | chmod +x script.sh ; ./script.sh |
| u24 | ✓ | 2719 | 2613 | grep -r TODO /Users/hridyaagrawal/Honey/React/smartterminal/lexis |
| u25 | ✓ | 4482 | 4338 | mkdir -p ~/Downloads ; curl -O https://example.com/file.zip ; mv file.zip ~/Down |
| u26 | ✓ | 3242 | 3105 | sysctl -n hw.ncpu ; sysctl -n hw.model |
| u27 | ✓ | 2665 | 2527 | echo 'export FOO=bar' >> ~/.zshrc |
| u28 | ✓ | 2812 | 2658 | find . -type d -name 'node_modules' -exec rm -rf {} + |
| u29 | ✗ | 2360 | 2212 | sudo lsof -i -P -n | grep LISTEN |
| u30 | ✓ | 2350 | 2251 | unzip file.zip |
