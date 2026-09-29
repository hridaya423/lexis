# eval: llama-server / Qwen2.5-Coder-3B-Instruct-Q4_K_M.gguf (flags_-c_2048)
- mode: schema · dataset core.jsonl#83828218eadbc7f7 · repeat 2
- pass: 26/30 (87%)
- cold p50 2706ms p95 3770ms · warm p50 2525ms p95 4466ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✓ | 3377 | 4746 | node -v ; npm -v |
| u02 | ✓ | 3770 | 2424 | ls -lh |
| u03 | ✓ | 2220 | 2096 | curl ifconfig.me |
| u04 | ✓ | 2593 | 2469 | lsof -i :3000 |
| u05 | ✓ | 2356 | 2159 | du -sh . |
| u06 | ✓ | 2979 | 2872 | find /Users/hridyaagrawal/Honey/React/smartterminal/lexis -type f -name '*.log'  |
| u07 | ✓ | 2190 | 2050 | ps aux | grep node |
| u08 | ✓ | 2962 | 2828 | git status ; git branch |
| u09 | ✓ | 2153 | 2050 | brew install ripgrep |
| u10 | ✓ | 3230 | 3066 | mkdir projects ; cd projects |
| u11 | ✓ | 2765 | 2659 | tar -czvf archive.tar.gz /Users/hridyaagrawal/Honey/React/smartterminal/lexis |
| u12 | ✓ | 2174 | 2060 | echo $PATH |
| u13 | ✗ | 3600 | 3382 | lsof -i :8080 ; kill -9 <PID> |
| u14 | ✓ | 2648 | 2461 | tail -n 20 /var/log/syslog |
| u15 | ✗ | 2232 | 2156 | brew list python3 |
| u16 | ✓ | 3013 | 2870 | brew update ; brew outdated |
| u17 | ✓ | 2978 | 2890 | echo $SHELL ; echo $HOME |
| u18 | ✓ | 2447 | 2344 | git reset --soft HEAD~1 |
| u19 | ✓ | 2651 | 2525 | du -sh ~/* | sort -rh | head -n 5 |
| u20 | ✗ | 2035 | 1924 | top |
| u21 | ✓ | 2575 | 2509 | find . -name '*.js' -type f -exec wc -l {} + |
| u22 | ✓ | 2134 | 1995 | brew services restart docker |
| u23 | ✓ | 3078 | 2910 | chmod +x script.sh ; ./script.sh |
| u24 | ✓ | 2706 | 4442 | grep -r TODO /Users/hridyaagrawal/Honey/React/smartterminal/lexis |
| u25 | ✓ | 6544 | 4466 | mkdir -p ~/Downloads ; curl -O https://example.com/file.zip ; mv file.zip ~/Down |
| u26 | ✓ | 3277 | 3170 | sysctl -n hw.ncpu ; sysctl -n hw.model |
| u27 | ✓ | 2781 | 2624 | echo 'export FOO=bar' >> ~/.zshrc |
| u28 | ✓ | 2818 | 2703 | find . -type d -name 'node_modules' -exec rm -rf {} + |
| u29 | ✗ | 2349 | 2245 | sudo lsof -i -P -n | grep LISTEN |
| u30 | ✓ | 2344 | 2245 | unzip file.zip |
