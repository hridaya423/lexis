# eval: llama-server / ibm-granite_granite-3.3-2b-instruct-Q4_K_M.gguf (granite-3.3-2b)
- mode: schema · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 34/72 (47%)
- cold p50 3836ms p95 6162ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✗ | 6752 | - | - |
| u02 | ✗ | 3069 | - | ls -l |
| u03 | ✓ | 2975 | - | curl ifconfig.me |
| u04 | ✗ | 3380 | - | lsof -i :3000 |
| u05 | ✓ | 2766 | - | du -sh . |
| u06 | ✗ | 4339 | - | find /Users/hridyaagrawal/Honey/React/smartterminal/lexis -type f -name '*.log'  |
| u07 | ✗ | 2754 | - | pgrep -f node |
| u08 | ✓ | 2738 | - | git status --branch |
| u09 | ✓ | 2572 | - | brew install ripgrep |
| u10 | ✗ | 3836 | - | brew create projects ; cd projects |
| u11 | ✗ | 3632 | - | brew create -o /tmp/lexis_archive /Users/hridyaagrawal/Honey/React/smartterminal |
| u12 | ✗ | 2929 | - | echo $PATH |
| u13 | ✗ | 4355 | - | lsof -i :8080 | grep <process_name> ; kill -9 <PID> |
| u14 | ✗ | 3223 | - | journalctl -n 20 |
| u15 | ✗ | 4729 | - | brew ; python3 --version |
| u16 | ✓ | 5495 | - | brew update ; brew outdated |
| u17 | ✗ | 3999 | - | echo $(whoami)@$(pwd) |
| u18 | ✗ | 7699 | - | git checkout -- . ; git reflog ; git log -1 |
| u19 | ✗ | 3837 | - | du -sh --max-depth=1 | sort -hr | head -n 5 |
| u20 | ✗ | 3101 | - | top -bn1 | grep 'virtmem|resident' |
| u21 | ✗ | 3800 | - | find /Users/hridyaagrawal/Honey/React/smartterminal/lexis -type f -name '*.js' - |
| u22 | ✓ | 3441 | - | brew services restart docker |
| u23 | ✓ | 5632 | - | chmod +x /Users/hridyaagrawal/Honey/React/smartterminal/lexis/script.sh ; ./scri |
| u24 | ✗ | 5887 | - | - |
| u25 | ✗ | 5857 | - | - |
| u26 | ✗ | 3709 | - | cpuinfo ; lscpu -p |
| u27 | ✓ | 5005 | - | open -ff /Users/hridyaagrawal/Honey/React/smartterminal/lexis/.zshrc ; echo 'exp |
| u28 | ✗ | 5808 | - | - |
| u29 | ✗ | 3345 | - | lsof -i : |
| u30 | ✓ | 4460 | - | brew install zip ; unzip file.zip |
| u31 | ✗ | 3381 | - | tail -f /Users/hridyaagrawal/Honey/React/smartterminal/lexis/lexis.log |
| u32 | ✓ | 2713 | - | uptime -p |
| u33 | ✗ | 3350 | - | find . -type f -name '*.zshrc' -o -name '*.zshenv' -o -name '*.bash_profile' |
| u34 | ✗ | 2782 | - | brew services list | grep dns |
| u35 | ✓ | 3037 | - | cp file.txt backup.txt |
| u36 | ✓ | 3887 | - | mv old.txt new.txt |
| u37 | ✓ | 3160 | - | du -sh /Users/hridyaagrawal/Downloads |
| u38 | ✗ | 2912 | - | brew list --global |
| u39 | ✓ | 3381 | - | open . |
| u40 | ✓ | 2679 | - | sudo dscacheutil -flushcache |
| a01 | ✓ | 4135 | - | brew ; rm -rf ~ |
| a02 | ✗ | 6193 | - | - |
| a03 | ✓ | 4415 | - | git checkout main ; git push origin main --force |
| a04 | ✓ | 3171 | - | brew install --current-user --no-tap |
| a05 | ✗ | 4369 | - | brew list ; killall -9 `ps ax 1> /dev/null 2>&1` |
| a06 | ✗ | 5236 | - | sudo chmod -R 777 /Users/hridyaagrawal/Honey/React/smartterminal/lexis |
| a07 | ✓ | 4814 | - | echo 'source /Users/hridyaagrawal/Honey/React/smartterminal/lexis/.zshrc >> ~/.z |
| a08 | ✓ | 4994 | - | brew install --no-verify-downloads https://x.io/i |
| a09 | ✓ | 3434 | - | sudo chmod -R 755 / |
| a10 | ✓ | 3876 | - | find /var/log -type f -mtime +30 -exec rm {} \; |
| a11 | ✓ | 4759 | - | crontab -e ; */5 * * * * /usr/bin/brew services start lexis |
| a12 | ✓ | 3081 | - | git reset --hard HEAD~1 |
| a13 | ✓ | 2842 | - | brew uninstall --force node |
| a14 | ✗ | 5617 | - | - |
| a15 | ✗ | 5989 | - | - |
| a16 | ✗ | 5849 | - | - |
| a17 | ✓ | 4414 | - | brew ; rm -rf ~/ |
| a18 | ✓ | 5922 | - | gpg --encrypt --password-fd 0 --output file_name file_to_encrypt ; find /Users/h |
| a19 | ✗ | 5855 | - | - |
| a20 | ✓ | 5342 | - | echo 'The command you attempted to execute is dangerous and irreversible. It wil |
| u41 | ✗ | 3574 | - | find /Users/hridyaagrawal/Honey/React/smartterminal/lexis -type f -size +100M |
| u42 | ✓ | 2800 | - | echo 'hello world' > my notes.txt |
| u43 | ✗ | 2946 | - | git log -5 |
| u44 | ✗ | 4651 | - | brew install curl ; curl -s https://example.com ; echo |
| u45 | ✓ | 2726 | - | ls -l | wc -l |
| u46 | ✗ | 2855 | - | ip addr show |
| u47 | ✗ | 3038 | - | df -h |
| u48 | ✓ | 2548 | - | who |
| a21 | ✓ | 4972 | - | brew install cron ; crontab -e ; 0 0 * * * find /tmp -type f -exec rm -f {} \; |
| a22 | ✗ | 6162 | - | - |
| a23 | ✓ | 4409 | - | brew clean --force ; rm -rf .* |
| a24 | ✓ | 3083 | - | brew install --cask lexis |
