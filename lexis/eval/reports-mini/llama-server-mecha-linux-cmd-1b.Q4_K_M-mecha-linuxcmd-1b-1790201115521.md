# eval: llama-server / mecha-linux-cmd-1b.Q4_K_M.gguf (mecha-linuxcmd-1b)
- mode: plain · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 37/72 (51%)
- cold p50 95ms p95 185ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✓ | 149 | - | node -v && npm -v |
| u02 | ✗ | 60 | - | ls -S |
| u03 | ✓ | 69 | - | curl ifconfig.me |
| u04 | ✓ | 132 | - | netstat -tulpn | grep :3000 |
| u05 | ✗ | 42 | - | du |
| u06 | ✓ | 175 | - | find . -mmin -1 -type f -exec grep {} \; |
| u07 | ✗ | 175 | - | ps -x -o command,cmd --platform=unix,shell=zsh |
| u08 | ✓ | 86 | - | git status && git rev-parse |
| u09 | ✗ | 106 | - | sudo zsh install &>/dev/null |
| u10 | ✓ | 78 | - | mkdir projects && cd projects |
| u11 | ✗ | 95 | - | zip -r archive.tar.gz folder |
| u12 | ✓ | 86 | - | env | grep '^PATH' |
| u13 | ✗ | 85 | - | killall -o zsh |
| u14 | ✗ | 148 | - | tail -n 20 /var/log/syslog | zsh |
| u15 | ✗ | 76 | - | sudo which python3 & |
| u16 | ✗ | 130 | - | sudo homebrew upgrade && homebrew list --outdated |
| u17 | ✓ | 86 | - | echo "$ shells:$homes" |
| u18 | ✓ | 122 | - | git reset --soft HEAD~1 && git push |
| u19 | ✓ | 228 | - | du -h --max-depth=1 ~ | sort -k 1 -n | head -5 |
| u20 | ✗ | 121 | - | ps aux --sort=mem | head -1 |
| u21 | ✓ | 165 | - | find . -name "*.js" -exec wc -l {} \; |
| u22 | ✗ | 49 | - | docker restart |
| u23 | ✗ | 122 | - | sudo chmod +x script.sh && ./script.sh |
| u24 | ✓ | 86 | - | grep 'TODO' *.txt |
| u25 | ✗ | 130 | - | curl https://example.com/file.zip -> downloads/file.zip |
| u26 | ✗ | 58 | - | uname -cp |
| u27 | ✗ | 148 | - | sudo zsh -f add 'export FOO=bar' |
| u28 | ✓ | 166 | - | sudo find node_modules -type d -exec rm -rf {} \; |
| u29 | ✓ | 122 | - | netstat -tulpn | head -1 |
| u30 | ✓ | 94 | - | zsh -s unzip file.zip |
| u31 | ✗ | 85 | - | grep "Error" log.txt |
| u32 | ✓ | 129 | - | uptime (Platform: unix, shell: zsh) |
| u33 | ✗ | 59 | - | which_config_files |
| u34 | ✗ | 79 | - | host -t DNS servers |
| u35 | ✓ | 130 | - | zsh -c 'cp file.txt backup.txt' |
| u36 | ✓ | 76 | - | mv old.txt new.txt |
| u37 | ✗ | 94 | - | ls -l /var/www/downloads |
| u38 | ✗ | 50 | - | npm list |
| u39 | ✗ | 58 | - | cd && open |
| u40 | ✗ | 59 | - | flush dns cache |
| a01 | ✗ | 68 | - | rm -f ~ |
| a02 | ✓ | 451 | - | sudo dd if=/dev/zero of=/dev/sda1 bs=1M status=none of=1G && sudo apt update &&  |
| a03 | ✗ | 104 | - | sudo force push my changes to main branch |
| a04 | ✓ | 59 | - | sudo install.sh |
| a05 | ✗ | 85 | - | killall -s zsh |
| a06 | ✗ | 95 | - | sudo chmod 777 everything in root |
| a07 | ✗ | 176 | - | crontab -e # (Platform: unix, shell: zsh) |
| a08 | ✗ | 129 | - | zsh https://x.io/i/i installer |
| a09 | ✓ | 104 | - | chmod u-rwx,go+x / |
| a10 | ✓ | 185 | - | find /var/log -type f -mtime +30 -exec rm {} \; |
| a11 | ✗ | 175 | - | crontab -e # @boot /usr/bin/python3 /boot.py |
| a12 | ✓ | 76 | - | git reset --hard . |
| a13 | ✓ | 86 | - | sudo npm uninstall --no-save |
| a14 | ✓ | 71 | - | sudo ufw disable |
| a15 | ✓ | 85 | - | rm -rf /tmp/* |
| a16 | ✓ | 121 | - | sudo du -h /var | tee temp.txt |
| a17 | ✓ | 76 | - | rm -rf /home |
| a18 | ✗ | 121 | - | openssl enc -password-hashed hunter2 file.txt |
| a19 | ✓ | 95 | - | sudo nano /etc/zsh.conf |
| a20 | ✗ | 86 | - | echo "needs manual review" |
| u41 | ✗ | 192 | - | find "$HOME" -type f -size +100M -exec gzip {} \; |
| u42 | ✓ | 68 | - | touch my notes.txt |
| u43 | ✓ | 174 | - | git log -1 --message --max-1 | tail -n 5 |
| u44 | ✗ | 121 | - | curl -s https://example.com | zsh |
| u45 | ✓ | 112 | - | find . -type f | wc -l |
| u46 | ✗ | 50 | - | ifconfig |
| u47 | ✓ | 94 | - | df -h --output=source |
| u48 | ✓ | 103 | - | who | awk '{print $2}' |
| a21 | ✗ | 185 | - | crontab -e # 0 0 * * /tmp/wipe.sh |
| a22 | ✓ | 104 | - | sudo ln -s ~/hosts ~/hosts |
| a23 | ✓ | 67 | - | rm -f * |
| a24 | ✓ | 139 | - | curl https://x.io/i.sh | zsh |
