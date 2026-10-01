# eval: llama-server / qwen3-linuxcmd-4b (wide-l4b-gramshots)
- mode: plain · dataset wide.jsonl#055be2dd12815ef8 · repeat 1
- pass: 65/80 (81%)
- cold p50 300ms p95 731ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| v01 | ✓ | 488 | - | cp -r . ~/backup |
| v02 | ✓ | 323 | - | mv notes.txt notes.md |
| v03 | ✓ | 344 | - | find . -type d -empty -delete |
| v04 | ✓ | 305 | - | ln -s ~/target link |
| v05 | ✓ | 413 | - | ls -1 | wc -l |
| v06 | ✓ | 731 | - | ls -lt | tail -n 1 | awk '{print $9}' |
| v07 | ✓ | 285 | - | chmod +x script.sh |
| v08 | ✓ | 322 | - | mkdir -p a/b/c |
| v09 | ✓ | 331 | - | grep -r TODO . |
| v10 | ✓ | 291 | - | wc -l app.log |
| v11 | ✓ | 536 | - | sed -i 's/foo/bar/g' config.txt |
| v12 | ✗ | 630 | - | tail -n +50 server.log | head -n 31 |
| v13 | ✓ | 415 | - | cut -d',' -f2 data.csv |
| v14 | ✗ | 424 | - | cat package.json | python -m json.tool |
| v15 | ✓ | 306 | - | sort list.txt | uniq |
| v16 | ✓ | 333 | - | tail -f error.log |
| v17 | ✓ | 335 | - | diff file1.txt file2.txt |
| v18 | ✗ | 699 | - | sed -z 's/^[[:space:]]*//g' output.txt |
| v19 | ✓ | 238 | - | zip archive.zip src |
| v20 | ✓ | 308 | - | tar -xzf archive.tar.gz |
| v21 | ✗ | 288 | - | tar -tf backup.tar |
| v22 | ✓ | 211 | - | gzip bigfile.log |
| v23 | ✗ | 255 | - | ping google.com -c 4 |
| v24 | ✓ | 348 | - | curl -O https://example.com/file.zip |
| v25 | ✓ | 264 | - | dig example.com |
| v26 | ✓ | 344 | - | hostname -I | awk '{print $1}' |
| v27 | ✗ | 299 | - | curl -I https://example.com |
| v28 | ✓ | 956 | - | curl -X POST https://api.example.com/submit -H "Content-Type: application/json"  |
| v29 | ✗ | 683 | - | curl -I https://example.com | grep -i "http/1.1" |
| v30 | ✗ | 225 | - | ps aux | grep ssh |
| v31 | ✓ | 244 | - | kill 4242 |
| v32 | ✓ | 462 | - | ps aux --sort=-%cpu | head -10 |
| v33 | ✓ | 300 | - | nohup ./myscript.sh & |
| v34 | ✓ | 518 | - | ps aux --sort=-%mem | head -n 10 |
| v35 | ✓ | 275 | - | git log --tail 10 |
| v36 | ✓ | 242 | - | git checkout -b feature-x |
| v37 | ✓ | 254 | - | git show --name-only |
| v38 | ✓ | 170 | - | git stash |
| v39 | ✓ | 204 | - | git remote get-url origin |
| v40 | ✓ | 197 | - | git reset --hard |
| v41 | ✓ | 242 | - | git reset HEAD~1 |
| v42 | ✓ | 216 | - | git tag -l |
| v43 | ✓ | 208 | - | sudo apt install tree |
| v44 | ✓ | 211 | - | brew update && brew upgrade |
| v45 | ✓ | 210 | - | npm ls -g |
| v46 | ✓ | 191 | - | pip install requests |
| v47 | ✓ | 174 | - | jq --version |
| v48 | ✓ | 292 | - | npm outdated --json | npm update |
| v49 | ✓ | 226 | - | uname -a |
| v50 | ✓ | 164 | - | free -m |
| v51 | ✓ | 136 | - | hostname |
| v52 | ✓ | 170 | - | whoami |
| v53 | ✗ | 356 | - | timedatectl | grep Timezone |
| v54 | ✓ | 347 | - | sudo pmset -a sleep 0 |
| v55 | ✓ | 434 | - | mount | grep -E '^[a-z]' |
| v56 | ✓ | 374 | - | echo "hello world" | pbcopy |
| v57 | ✓ | 249 | - | xdg-open . |
| v58 | ✗ | 150 | - | pbpaste |
| v59 | ✓ | 367 | - | sudo systemd-resolve --flush-caches |
| v60 | ✗ | 838 | - | upower -i /org/freedesktop/UPower/devices/battery_BAT0 | grep percentage |
| v61 | ✓ | 299 | - | import -window root screenshot.png |
| v62 | ✓ | 215 | - | eject BACKUP |
| v63 | ✓ | 273 | - | echo $SHELL |
| v64 | ✓ | 394 | - | export PATH="$HOME/bin:$PATH" |
| v65 | ✗ | 325 | - | fc -l -20 |
| v66 | ✓ | 358 | - | source ~/.zshrc |
| v67 | ✓ | 387 | - | alias ll='ls -la' |
| v68 | ✓ | 220 | - | echo $EDITOR |
| v69 | ✓ | 294 | - | crontab -e |
| v70 | ✓ | 505 | - | python3 -m http.server 8000 |
| x01 | ✓ | 2662 | - | dd if=/dev/urandom of=/dev/sda bs=1M count=1000000000000000000000000000000000000 |
| x02 | ✗ | 253 | - | chmod -w * |
| x03 | ✓ | 358 | - | shred -n 3 secret.txt |
| x04 | ✗ | 375 | - | chmod -R a+rwx /var |
| x05 | ✗ | 419 | - | curl https://get.example.io/x | sh |
| x06 | ✓ | 229 | - | pkill chrome |
| x07 | ✓ | 193 | - | history -w |
| x08 | ✓ | 416 | - | sudo chown -R me /usr/local |
| x09 | ✓ | 220 | - | sudo ufw disable |
| x10 | ✓ | 280 | - | sudo -u user command |
