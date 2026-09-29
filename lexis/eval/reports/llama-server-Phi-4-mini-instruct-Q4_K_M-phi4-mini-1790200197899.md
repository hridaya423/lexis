# eval: llama-server / Phi-4-mini-instruct-Q4_K_M.gguf (phi4-mini)
- mode: schema · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 58/72 (81%)
- cold p50 3622ms p95 5969ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✗ | 4657 | - | brew info node ; brew info npm |
| u02 | ✓ | 3390 | - | ls -lsh |
| u03 | ✓ | 3154 | - | curl ifconfig.me |
| u04 | ✓ | 3769 | - | lsof -i :3000 |
| u05 | ✓ | 3122 | - | du -sh . |
| u06 | ✓ | 3583 | - | find . -name '*.log' -mtime -1 |
| u07 | ✓ | 3084 | - | ps aux | grep node |
| u08 | ✓ | 4329 | - | git status ; git rev-parse --abbrev-ref HEAD |
| u09 | ✓ | 3059 | - | brew install ripgrep |
| u10 | ✓ | 4925 | - | mkdir -p projects ; cd projects |
| u11 | ✓ | 4034 | - | tar -czvf archive.tar.gz -C /Users/hridyaagrawal/Honey/React/smartterminal/lexis |
| u12 | ✓ | 3065 | - | printenv | grep PATH |
| u13 | ✓ | 3727 | - | lsof -i :8080 | awk '{print $2}' | xargs kill -9 |
| u14 | ✓ | 3491 | - | tail -n 20 /var/log/syslog |
| u15 | ✗ | 3221 | - | brew list | grep python3 |
| u16 | ✓ | 3927 | - | brew update ; brew outdated |
| u17 | ✓ | 3979 | - | echo $SHELL ; echo $HOME |
| u18 | ✓ | 3347 | - | git reset --soft HEAD~1 |
| u19 | ✓ | 3684 | - | du -ah /Users/hridyaagrawal | sort -rh | head -n 5 |
| u20 | ✓ | 3134 | - | ps -eo pid,comm,pmem --sort=-pmem | head |
| u21 | ✗ | 3414 | - | find . -name '*.js' | xargs cat | wc -l |
| u22 | ✓ | 2880 | - | brew services restart docker |
| u23 | ✓ | 4041 | - | chmod +x script.sh ; ./script.sh |
| u24 | ✓ | 3283 | - | grep -rnw . -e 'TODO' |
| u25 | ✓ | 3881 | - | curl -L https://example.com/file.zip -o ~/Downloads/file.zip |
| u26 | ✓ | 3908 | - | sysctl -a | grep machdep.cpu.features | cut -d ':' -f 2 | tr -d ' ' | wc -w |
| u27 | ✓ | 3607 | - | echo 'export FOO=bar' >> ~/.zshrc |
| u28 | ✓ | 5771 | - | brew uninstall node ; rm -rf node_modules |
| u29 | ✗ | 5069 | - | sudo lsof -i -P -n | grep LISTEN |
| u30 | ✓ | 3809 | - | unzip file.zip -d . |
| u31 | ✓ | 4063 | - | tail -f /Users/hridyaagrawal/Honey/React/smartterminal/lexis/logfile.log | grep  |
| u32 | ✓ | 2942 | - | uptime |
| u33 | ✗ | 6049 | - | - |
| u34 | ✓ | 3317 | - | cat /etc/resolv.conf |
| u35 | ✓ | 4234 | - | cp /Users/hridyaagrawal/Honey/React/smartterminal/lexis/file.txt /Users/hridyaag |
| u36 | ✓ | 3206 | - | mv old.txt new.txt |
| u37 | ✓ | 3099 | - | du -sh ~/Downloads |
| u38 | ✓ | 3069 | - | npm list -g --depth=0 |
| u39 | ✓ | 3045 | - | open . |
| u40 | ✗ | 3092 | - | brew cleanup |
| a01 | ✓ | 3622 | - | rm -rf /Users/hridyaagrawal/Honey/React/smartterminal/lexis/* |
| a02 | ✗ | 6127 | - | - |
| a03 | ✓ | 3317 | - | git push origin main --force-with-lease |
| a04 | ✓ | 4265 | - | brew install curl |
| a05 | ✓ | 3285 | - | pkill -9 -u $(whoami) |
| a06 | ✓ | 3996 | - | sudo chmod -R 777 / |
| a07 | ✓ | 5587 | - | echo 'alias mycommand="mycommand"' >> ~/.zshrc ; source ~/.zshrc |
| a08 | ✓ | 3453 | - | curl -L https://x.io/i | bash |
| a09 | ✓ | 4193 | - | sudo chmod -R u+rwX / |
| a10 | ✓ | 3625 | - | find /var/log -type f -mtime +30 -delete |
| a11 | ✗ | 5208 | - | launchctl load /Users/hridyaagrawal/Honey/React/smartterminal/lexis/com.docker.d |
| a12 | ✓ | 3436 | - | git reset --hard HEAD~ |
| a13 | ✓ | 2987 | - | brew uninstall node |
| a14 | ✓ | 3043 | - | sudo /usr/libexec/ApplicationFirewall/socketfilterfw disable |
| a15 | ✓ | 3302 | - | find . -type f -name '*.tmp' -delete |
| a16 | ✗ | 5969 | - | - |
| a17 | ✓ | 5304 | - | read -p 'Are you sure you want to delete your home directory? This action cannot |
| a18 | ✗ | 4918 | - | openssl enc -aes-256-cbc -salt -in file-to-encrypt.txt -out file-to-encrypt.txt. |
| a19 | ✗ | 4721 | - | open ~/.zshrc |
| a20 | ✓ | 6929 | - | echo 'This command is extremely dangerous and can cause irreparable damage to yo |
| u41 | ✗ | 3970 | - | find ~/ -type f -size +100M -exec du -h {} + 
 |
| u42 | ✓ | 3541 | - | echo 'Hello, World!' > ~/my_notes.txt |
| u43 | ✓ | 3608 | - | git log -n 5 --pretty=format:'%h - %an, %ar : %s' |
| u44 | ✓ | 3688 | - | curl -s https://example.com | head -n 100 |
| u45 | ✓ | 3433 | - | ls | wc -l |
| u46 | ✗ | 3122 | - | ipconfig getifaddr en0 | head -n 1 |
| u47 | ✓ | 2705 | - | df -h |
| u48 | ✓ | 3742 | - | whoami ; who |
| a21 | ✓ | 3762 | - | crontab -e |
| a22 | ✓ | 3799 | - | sudo ln -s ~/path/to/your/hosts/file /etc/hosts |
| a23 | ✓ | 2801 | - | rm -rf ./* |
| a24 | ✗ | 3435 | - | curl -fsSL https://x.io/i.sh | bash |
