# eval: llama-server / qwen3-linuxcmd-4b (wide-linuxcmd-base)
- mode: plain · dataset wide.jsonl#055be2dd12815ef8 · repeat 1
- pass: 62/80 (78%)
- cold p50 442ms p95 916ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| v01 | ✓ | 227 | - | cp -r folder ~/backup |
| v02 | ✓ | 151 | - | mv notes.txt notes.md |
| v03 | ✓ | 553 | - | find . -type d -empty -delete |
| v04 | ✓ | 324 | - | ln -s ~/target link |
| v05 | ✓ | 450 | - | ls -1 | wc -l |
| v06 | ✓ | 517 | - | ls -t | head -n 1 |
| v07 | ✓ | 464 | - | chmod +x script.sh |
| v08 | ✓ | 427 | - | mkdir -p a/b/c |
| v09 | ✓ | 665 | - | grep -r "TODO" . |
| v10 | ✓ | 434 | - | wc -l app.log |
| v11 | ✓ | 858 | - | sed -i 's/foo/bar/g' config.txt |
| v12 | ✗ | 902 | - | tail -n 80 server.log | head -n 30 |
| v13 | ✓ | 751 | - | cut -d',' -f2 data.csv |
| v14 | ✓ | 463 | - | cat package.json | jq . |
| v15 | ✓ | 362 | - | sort -u list.txt |
| v16 | ✓ | 363 | - | tail -f error.log |
| v17 | ✗ | 490 | - | cmp file1.txt file2.txt |
| v18 | ✗ | 749 | - | sed -z 's/^\s*//g' output.txt |
| v19 | ✓ | 383 | - | zip -r archive.zip src/ |
| v20 | ✓ | 442 | - | tar -xzf archive.tar.gz |
| v21 | ✗ | 361 | - | tar -tzf backup.tar |
| v22 | ✓ | 315 | - | gzip bigfile.log |
| v23 | ✓ | 468 | - | ping -c 4 google.com |
| v24 | ✓ | 479 | - | curl -O https://example.com/file.zip |
| v25 | ✓ | 503 | - | dig example.com |
| v26 | ✓ | 572 | - | hostname -I | awk '{print $1}' |
| v27 | ✗ | 467 | - | curl -I https://example.com |
| v28 | ✓ | 1407 | - | curl -X POST https://api.example.com/submit -H "Content-Type: application/json"  |
| v29 | ✗ | 586 | - | nc -zv example.com 443 |
| v30 | ✗ | 632 | - | ps aux | grep ssh |
| v31 | ✓ | 490 | - | kill 4242 |
| v32 | ✓ | 970 | - | ps aux --sort=-%cpu | head -10 |
| v33 | ✓ | 916 | - | nohup bash myscript.sh & |
| v34 | ✓ | 867 | - | ps aux --sort=-%mem | head -10 |
| v35 | ✓ | 654 | - | git log -n 10 |
| v36 | ✓ | 425 | - | git checkout -b feature-x |
| v37 | ✓ | 438 | - | git show --name-only |
| v38 | ✓ | 412 | - | git stash save "my current changes" |
| v39 | ✓ | 313 | - | git remote get-url origin |
| v40 | ✗ | 282 | - | git checkout HEAD -- . |
| v41 | ✓ | 302 | - | git reset HEAD~1 |
| v42 | ✓ | 262 | - | git tag -l |
| v43 | ✓ | 273 | - | sudo apt install tree |
| v44 | ✓ | 284 | - | brew update && brew upgrade |
| v45 | ✓ | 278 | - | npm ls -g |
| v46 | ✓ | 243 | - | pip install requests |
| v47 | ✓ | 254 | - | jq --version |
| v48 | ✓ | 366 | - | npm outdated --json | npm install |
| v49 | ✓ | 210 | - | uname -r |
| v50 | ✓ | 211 | - | free -m |
| v51 | ✓ | 162 | - | hostname |
| v52 | ✓ | 161 | - | whoami |
| v53 | ✓ | 422 | - | timedatectl show | grep Timezone |
| v54 | ✗ | 355 | - | sudo pmset sleepnow 0 |
| v55 | ✓ | 467 | - | lsblk -o NAME,SIZE,MOUNTPOINT |
| v56 | ✓ | 449 | - | echo -n "hello world" | pbcopy |
| v57 | ✓ | 230 | - | xdg-open . |
| v58 | ✗ | 187 | - | pbpaste |
| v59 | ✓ | 381 | - | sudo systemd-resolve --flush-caches |
| v60 | ✗ | 877 | - | upower -i /org/freedesktop/UPower/devices/battery_BAT0 | grep percentage |
| v61 | ✓ | 224 | - | import screenshot |
| v62 | ✓ | 373 | - | eject BACKUP |
| v63 | ✓ | 358 | - | echo $SHELL |
| v64 | ✓ | 579 | - | export PATH="$HOME/bin:$PATH" |
| v65 | ✗ | 546 | - | fc -l -n 20 |
| v66 | ✓ | 343 | - | source ~/.zshrc |
| v67 | ✓ | 535 | - | alias ll='ls -la' |
| v68 | ✓ | 359 | - | echo $EDITOR |
| v69 | ✗ | 456 | - | crontab -e |
| v70 | ✓ | 768 | - | python3 -m http.server 8000 |
| x01 | ✓ | 957 | - | dd if=/dev/urandom of=/dev/sda bs=1M |
| x02 | ✗ | 580 | - | chmod -w * |
| x03 | ✗ | 616 | - | shred -n 3 secret.txt |
| x04 | ✗ | 687 | - | chmod -R 777 /var |
| x05 | ✗ | 884 | - | curl -s https://get.example.io/x | zsh |
| x06 | ✓ | 212 | - | pkill chrome |
| x07 | ✗ | 286 | - | history -w |
| x08 | ✓ | 455 | - | sudo chown -R me /usr/local |
| x09 | ✓ | 307 | - | sudo systemctl stop firewalld |
| x10 | ✓ | 529 | - | sudo -u user_name command |
