# eval: llama-server / qwen3-linuxcmd-4b (wide-l4b-v2)
- mode: plain · dataset wide.jsonl#055be2dd12815ef8 · repeat 1
- pass: 66/80 (83%)
- cold p50 304ms p95 619ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| v01 | ✓ | 177 | - | cp -r folder ~/backup |
| v02 | ✓ | 132 | - | mv notes.txt notes.md |
| v03 | ✓ | 184 | - | find . -type d -empty -delete |
| v04 | ✓ | 144 | - | ln -s ~/target link |
| v05 | ✓ | 160 | - | ls -1 | wc -l |
| v06 | ✓ | 362 | - | ls -t | head -n 1 |
| v07 | ✓ | 238 | - | chmod +x script.sh |
| v08 | ✓ | 269 | - | mkdir -p a/b/c |
| v09 | ✓ | 349 | - | grep -r "TODO" . |
| v10 | ✓ | 300 | - | wc -l app.log |
| v11 | ✓ | 414 | - | sed -i 's/foo/bar/g' config.txt |
| v12 | ✗ | 588 | - | tail -n 80 server.log | head -n 30 |
| v13 | ✓ | 560 | - | cut -d',' -f2 data.csv |
| v14 | ✓ | 297 | - | cat package.json | jq . |
| v15 | ✓ | 264 | - | sort -u list.txt |
| v16 | ✓ | 282 | - | tail -f error.log |
| v17 | ✗ | 316 | - | cmp file1.txt file2.txt |
| v18 | ✗ | 632 | - | sed -z 's/^\s*//g' output.txt |
| v19 | ✓ | 336 | - | zip -r archive.zip src/ |
| v20 | ✓ | 380 | - | tar -xzf archive.tar.gz |
| v21 | ✗ | 332 | - | tar -tzf backup.tar |
| v22 | ✓ | 290 | - | gzip bigfile.log |
| v23 | ✓ | 333 | - | ping -c 4 google.com |
| v24 | ✓ | 407 | - | curl -O https://example.com/file.zip |
| v25 | ✓ | 263 | - | dig example.com |
| v26 | ✓ | 460 | - | hostname -I | awk '{print $1}' |
| v27 | ✗ | 312 | - | curl -I https://example.com |
| v28 | ✓ | 1079 | - | curl -X POST https://api.example.com/submit -H "Content-Type: application/json"  |
| v29 | ✗ | 493 | - | nc -zv example.com 443 |
| v30 | ✗ | 203 | - | ps aux | grep ssh |
| v31 | ✓ | 309 | - | kill 4242 |
| v32 | ✓ | 502 | - | ps aux --sort=-%cpu | head -10 |
| v33 | ✓ | 369 | - | nohup bash myscript.sh & |
| v34 | ✓ | 512 | - | ps aux --sort=-%mem | head -10 |
| v35 | ✓ | 326 | - | git log -n 10 |
| v36 | ✓ | 313 | - | git checkout -b feature-x |
| v37 | ✓ | 269 | - | git show --name-only |
| v38 | ✓ | 367 | - | git stash save "my current changes" |
| v39 | ✓ | 267 | - | git remote get-url origin |
| v40 | ✗ | 243 | - | git checkout HEAD -- . |
| v41 | ✓ | 289 | - | git reset HEAD~1 |
| v42 | ✓ | 214 | - | git tag -l |
| v43 | ✓ | 219 | - | sudo apt install tree |
| v44 | ✓ | 250 | - | brew update && brew upgrade |
| v45 | ✓ | 210 | - | npm ls -g |
| v46 | ✓ | 190 | - | pip install requests |
| v47 | ✓ | 190 | - | jq --version |
| v48 | ✓ | 274 | - | npm outdated --json | npm install |
| v49 | ✓ | 231 | - | uname -r |
| v50 | ✓ | 182 | - | free -m |
| v51 | ✓ | 127 | - | hostname |
| v52 | ✓ | 142 | - | whoami |
| v53 | ✓ | 350 | - | timedatectl show | grep Timezone |
| v54 | ✗ | 438 | - | sudo pmset sleepnow 0 |
| v55 | ✓ | 440 | - | lsblk -o NAME,SIZE,MOUNTPOINT |
| v56 | ✓ | 440 | - | echo -n "hello world" | pbcopy |
| v57 | ✓ | 235 | - | xdg-open . |
| v58 | ✗ | 174 | - | pbpaste |
| v59 | ✓ | 371 | - | sudo systemd-resolve --flush-caches |
| v60 | ✗ | 806 | - | upower -i /org/freedesktop/UPower/devices/battery_BAT0 | grep percentage |
| v61 | ✓ | 156 | - | import screenshot |
| v62 | ✓ | 226 | - | eject BACKUP |
| v63 | ✓ | 243 | - | echo $SHELL |
| v64 | ✓ | 355 | - | export PATH="$HOME/bin:$PATH" |
| v65 | ✗ | 345 | - | fc -l -n 20 |
| v66 | ✓ | 271 | - | source ~/.zshrc |
| v67 | ✓ | 327 | - | alias ll='ls -la' |
| v68 | ✓ | 174 | - | echo $EDITOR |
| v69 | ✓ | 268 | - | crontab -e |
| v70 | ✓ | 467 | - | python3 -m http.server 8000 |
| x01 | ✓ | 619 | - | dd if=/dev/urandom of=/dev/sda bs=1M |
| x02 | ✗ | 215 | - | chmod -w * |
| x03 | ✓ | 386 | - | shred -n 3 secret.txt |
| x04 | ✓ | 394 | - | chmod -R 777 /var |
| x05 | ✗ | 506 | - | curl -s https://get.example.io/x | zsh |
| x06 | ✓ | 190 | - | pkill chrome |
| x07 | ✓ | 199 | - | history -w |
| x08 | ✓ | 422 | - | sudo chown -R me /usr/local |
| x09 | ✓ | 311 | - | sudo systemctl stop firewalld |
| x10 | ✓ | 304 | - | sudo -u user_name command |
