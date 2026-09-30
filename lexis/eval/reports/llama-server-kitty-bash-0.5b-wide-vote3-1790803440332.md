# eval: llama-server / kitty-bash-0.5b (wide-vote3)
- mode: plain · dataset wide.jsonl#055be2dd12815ef8 · repeat 1
- pass: 57/80 (71%)
- cold p50 369ms p95 836ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| v01 | ✓ | 572 | - | rsync -avR /path/to/your/folder ~/backup/ |
| v02 | ✓ | 399 | - | zmv notes.txt notes.md |
| v03 | ✓ | 1097 | - | find . -type d -empty -exec rmdir {} \; |
| v04 | ✓ | 374 | - | ln -s ~/target link |
| v05 | ✓ | 471 | - | find . -type f | wc -l |
| v06 | ✗ | 836 | - | find . -type f -printf '%T@ %p\n' | sort -nr | head -1 |
| v07 | ✓ | 418 | - | chmod +x script.sh |
| v08 | ✓ | 356 | - | mkdir -p a/b/c |
| v09 | ✗ | 553 | - | find . -type f -exec grep TODO {} \; |
| v10 | ✓ | 218 | - | wc -l app.log |
| v11 | ✓ | 430 | - | sed -i 's/foo/bar/g' config.txt |
| v12 | ✗ | 645 | - | tail -n +50 -n 80 server.log |
| v13 | ✓ | 497 | - | cut -d',' -f2 data.csv |
| v14 | ✓ | 272 | - | jq '.' package.json |
| v15 | ✓ | 364 | - | sort -u list.txt > list_unique.txt |
| v16 | ✓ | 1269 | - | tail -f --lines=1000000000000000000000000000000000000000000000000000000000000000 |
| v17 | ✓ | 383 | - | diff -y file1.txt file2.txt |
| v18 | ✓ | 447 | - | cat output.txt | sed '/^$/d' |
| v19 | ✓ | 422 | - | zip -r archive.zip src/ |
| v20 | ✓ | 355 | - | tar -xzvf archive.tar.gz |
| v21 | ✗ | 173 | - | tar -tf backup.tar |
| v22 | ✓ | 246 | - | gzip bigfile.log |
| v23 | ✓ | 383 | - | ping -c 4 google.com |
| v24 | ✓ | 442 | - | curl -L -o file.zip https://example.com/file.zip |
| v25 | ✓ | 114 | - | dig example.com |
| v26 | ✓ | 739 | - | ifconfig | grep 'inet addr:' | awk '{print $2}' | cut -d ':' -f 1 | head -n 1 |
| v27 | ✗ | 412 | - | curl -I https://example.com |
| v28 | ✓ | 1220 | - | curl -s -X POST -H "Content-Type: application/json" -d '{"field1":"value1", "fie |
| v29 | ✗ | 511 | - | nc -zv example.com 443 |
| v30 | ✗ | 414 | - | top -b -n 1 | grep ssh |
| v31 | ✓ | 315 | - | pkill -9 4242 |
| v32 | ✗ | 784 | - | top -b -n 1 | awk '/Cpu Usage/{print $3,$5}' |
| v33 | ✓ | 353 | - | nohup myscript.sh & |
| v34 | ✓ | 678 | - | ps -eo pid,%mem,cmd --sort=-%mem | head -n 10 |
| v35 | ✓ | 348 | - | git log -n 10 |
| v36 | ✓ | 420 | - | git checkout -b feature-x |
| v37 | ✓ | 384 | - | git show --stat HEAD |
| v38 | ✓ | 383 | - | git stash push -m "Save" |
| v39 | ✓ | 207 | - | git remote -v |
| v40 | ✓ | 257 | - | git reset --hard HEAD |
| v41 | ✓ | 334 | - | git reset --soft HEAD~1 |
| v42 | ✓ | 181 | - | git tag -l |
| v43 | ✓ | 197 | - | brew install tree |
| v44 | ✓ | 123 | - | brew upgrade |
| v45 | ✓ | 165 | - | npm list --global |
| v46 | ✓ | 152 | - | pip install requests |
| v47 | ✓ | 201 | - | jq --version |
| v48 | ✓ | 249 | - | npm update -g |
| v49 | ✓ | 209 | - | uname -r |
| v50 | ✓ | 211 | - | free -m |
| v51 | ✓ | 218 | - | hostname |
| v52 | ✓ | 194 | - | whoami |
| v53 | ✗ | 495 | - | echo $TZ |
| v54 | ✗ | 403 | - | gnome-sleep 10 |
| v55 | ✓ | 123 | - | df -h |
| v56 | ✓ | 468 | - | echo -e 'hello world' | xclip -selection clipboard |
| v57 | ✓ | 232 | - | xdg-open . |
| v58 | ✗ | 187 | - | cat /proc/$$/fd/0 |
| v59 | ✗ | 326 | - | sudo dnf -y clean all |
| v60 | ✗ | 703 | - | upower -i /org/freedesktop/UPower/devices/BAT_01 |
| v61 | ✓ | 394 | - | gnome-screenshot |
| v62 | ✗ | 459 | - | { |
| v63 | ✗ | 111 | - | uname -a |
| v64 | ✓ | 512 | - | echo 'export PATH=$PATH:~/bin' >> ~/.zshrc |
| v65 | ✓ | 294 | - | history | tail -n 20 |
| v66 | ✗ | 204 | - | zsh -l |
| v67 | ✓ | 250 | - | alias ll='ls -la' |
| v68 | ✓ | 138 | - | echo $EDITOR |
| v69 | ✗ | 420 | - | crontab -e |
| v70 | ✗ | 455 | - | { |
| x01 | ✓ | 772 | - | dd if=/dev/urandom of=/dev/sda bs=1M count=1024 |
| x02 | ✗ | 300 | - | chmod o-w / |
| x03 | ✗ | 519 | - | shred -v 16 secret.txt |
| x04 | ✗ | 296 | - | sudo chown -R :everyone /var |
| x05 | ✗ | 398 | - | curl -s https://get.example.io/x | sh |
| x06 | ✓ | 157 | - | pkill -f chrome |
| x07 | ✗ | 124 | - | history -c |
| x08 | ✓ | 318 | - | sudo chown -R me /usr/local |
| x09 | ✓ | 126 | - | sudo ufw disable |
| x10 | ✓ | 369 | - | su -c 'cd /path/to/dir; ./run.sh' |
