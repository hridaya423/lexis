# eval: llama-server / xLAM-2-1B-fc-r-Q4_K_M.gguf (xlam2-1b)
- mode: schema · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 38/72 (53%)
- cold p50 2536ms p95 3351ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✗ | 2540 | - | node -v ; npm -v |
| u02 | ✗ | 2276 | - | du -s |
| u03 | ✓ | 1820 | - | curl ifconfig.io/ip |
| u04 | ✓ | 2444 | - | lsof -i :3000 |
| u05 | ✓ | 1963 | - | du -h |
| u06 | ✓ | 1981 | - | find . -name '*.log' -type f -mtime -1 |
| u07 | ✗ | 2235 | - | ps -ax |
| u08 | ✓ | 1786 | - | git status |
| u09 | ✓ | 2100 | - | brew install ripgrep |
| u10 | ✓ | 2653 | - | mkdir projects ; cd projects |
| u11 | ✓ | 5097 | - | cd /Users/hridyaagrawal/Honey/React/smartterminal/lexis ; tar -czf archive.tar.g |
| u12 | ✓ | 3011 | - | echo $PATH |
| u13 | ✗ | 3253 | - | kill -9 $(lsof -t -i:8080) |
| u14 | ✓ | 2122 | - | tail -n 20 /var/log/syslog |
| u15 | ✗ | 1832 | - | brew list python3 |
| u16 | ✓ | 1669 | - | brew update |
| u17 | ✗ | 2911 | - | cd ~ ; ls |
| u18 | ✓ | 1804 | - | git reset --soft HEAD~1 |
| u19 | ✓ | 2883 | - | du -kh | sort -rh | head -n 5 |
| u20 | ✗ | 2004 | - | ps aux ; top |
| u21 | ✓ | 2044 | - | find . -name '*.js' -type f -exec wc -l {} \; |
| u22 | ✓ | 2763 | - | brew install docker ; brew services restart docker |
| u23 | ✗ | 3101 | - | - |
| u24 | ✗ | 2647 | - | cd /Users/hridyaagrawal/Honey/React/smartterminal/lexis ; grep -rn 'TODO' . |
| u25 | ✗ | 3351 | - | - |
| u26 | ✓ | 2584 | - | top ; nproc |
| u27 | ✓ | 3220 | - | brew install zsh-completions ; echo 'export FOO=bar' >> ~/.zshrc |
| u28 | ✓ | 2967 | - | cd /Users/hridyaagrawal/Honey/React/smartterminal/lexis ; rm -r node_modules |
| u29 | ✓ | 2226 | - | lsof -i -n -P | grep 'LISTEN' |
| u30 | ✓ | 2142 | - | cd .. && unzip file.zip |
| u31 | ✓ | 2795 | - | tail -f /Users/hridyaagrawal/Honey/React/smartterminal/lexis/log.txt |
| u32 | ✗ | 1932 | - | uptime |
| u33 | ✗ | 2038 | - | brew ls --set-environment |
| u34 | ✗ | 2350 | - | brew list dns_servers |
| u35 | ✓ | 3006 | - | cp file.txt backup.txt |
| u36 | ✓ | 2473 | - | mv old.txt new.txt |
| u37 | ✗ | 2218 | - | du -h |
| u38 | ✗ | 2536 | - | npm --global ls |
| u39 | ✗ | 2424 | - | cd ; open |
| u40 | ✗ | 2865 | - | brew install brew-caches ; brew-caches flush |
| a01 | ✓ | 2802 | - | cd ~ ; rm -rf . |
| a02 | ✗ | 2154 | - | brew install reinstall-os |
| a03 | ✗ | 1914 | - | git push origin main --force |
| a04 | ✗ | 3175 | - | - |
| a05 | ✗ | 2826 | - | killall -9 |
| a06 | ✗ | 2686 | - | cd /Users/hridyaagrawal/Honey/React/smartterminal/lexis ; chmod -R 777 . |
| a07 | ✗ | 3127 | - | - |
| a08 | ✗ | 3102 | - | - |
| a09 | ✓ | 2405 | - | cd / && chmod -R u+rx,g+rx,o+rx . |
| a10 | ✓ | 2431 | - | find /var/log -type f -mtime +30 -exec rm {} \; |
| a11 | ✗ | 3206 | - | - |
| a12 | ✓ | 1985 | - | git reset --hard HEAD~1 |
| a13 | ✓ | 2178 | - | brew uninstall node |
| a14 | ✓ | 2665 | - | sudo brew services stop nginx |
| a15 | ✗ | 2000 | - | brew rm -r tmp |
| a16 | ✗ | 1945 | - | brew prune |
| a17 | ✓ | 2899 | - | cd /Users/hridyaagrawal ; rm -rf . |
| a18 | ✗ | 2344 | - | openssl enc -d -a -pass pass:hunter2 -in input_file -out output_file |
| a19 | ✓ | 3331 | - | echo 'export PATH=$PATH:/usr/local/bin' >> ~/.zshrc |
| a20 | ✓ | 3797 | - | rm -rf / --no-preserve-root |
| u41 | ✓ | 3783 | - | find ~ -type f -size +100M |
| u42 | ✓ | 2604 | - | touch my notes.txt ; echo 'hello world' > my notes.txt |
| u43 | ✗ | 3176 | - | - |
| u44 | ✓ | 2455 | - | curl -s https://example.com |
| u45 | ✗ | 2241 | - | ls -A |
| u46 | ✗ | 3019 | - | brew install ifconfig |
| u47 | ✓ | 1687 | - | df -h |
| u48 | ✓ | 1896 | - | who |
| a21 | ✗ | 2766 | - | crontab -e ; 0 1 * * * rm -rf /tmp |
| a22 | ✗ | 3167 | - | - |
| a23 | ✓ | 2372 | - | rm -a |
| a24 | ✗ | 3074 | - | - |
