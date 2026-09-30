# eval: llama-server / kitty-bash-0.5b (wide-e4-multiturn)
- mode: plain · dataset wide.jsonl#055be2dd12815ef8 · repeat 1
- pass: 59/80 (74%)
- cold p50 85ms p95 235ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| v01 | ✓ | 90 | - | cp -r . ~/backup/ |
| v02 | ✓ | 46 | - | mv notes.txt notes.md |
| v03 | ✗ | 218 | - | find . -type d -empty -exec rm -rf {} \; |
| v04 | ✓ | 70 | - | ln -s ~/target link |
| v05 | ✓ | 91 | - | find . -type f | wc -l |
| v06 | ✓ | 95 | - | ls -t | head -1 |
| v07 | ✓ | 100 | - | chmod +x script.sh |
| v08 | ✓ | 94 | - | mkdir -p a/b/c |
| v09 | ✓ | 85 | - | grep -R "TODO" . |
| v10 | ✓ | 62 | - | wc -l app.log |
| v11 | ✓ | 95 | - | sed -i 's/foo/bar/g' config.txt |
| v12 | ✗ | 141 | - | tail -n +50 -n 80 server.log |
| v13 | ✓ | 145 | - | cut -d',' -f2 data.csv |
| v14 | ✓ | 62 | - | jq '.' package.json |
| v15 | ✓ | 70 | - | sort -u list.txt |
| v16 | ✓ | 77 | - | tail -f error.log |
| v17 | ✓ | 91 | - | diff file1.txt file2.txt |
| v18 | ✗ | 129 | - | cat output.txt | tr -s '[:blank:]' |
| v19 | ✓ | 86 | - | zip -r archive.zip src/ |
| v20 | ✓ | 127 | - | tar -xzvf archive.tar.gz |
| v21 | ✗ | 83 | - | tar -tf backup.tar |
| v22 | ✓ | 80 | - | gzip bigfile.log |
| v23 | ✓ | 97 | - | ping -c 4 google.com |
| v24 | ✓ | 98 | - | curl -O https://example.com/file.zip |
| v25 | ✓ | 51 | - | dig example.com |
| v26 | ✗ | 71 | - | ipconfig getifaddr en0 |
| v27 | ✗ | 73 | - | curl -I https://example.com |
| v28 | ✓ | 344 | - | curl -X POST -H "Content-Type: application/json" -d '{"name":"John","age":30}' h |
| v29 | ✗ | 160 | - | nc -zv example.com 443 |
| v30 | ✗ | 59 | - | ps aux | grep ssh |
| v31 | ✓ | 70 | - | pkill 4242 |
| v32 | ✓ | 140 | - | ps aux | sort -k 3 -nr | head -n 10 |
| v33 | ✓ | 88 | - | nohup ./myscript.sh & |
| v34 | ✗ | 453 | - | ps aux | awk '{print $2}' | xargs -I{} free -m | awk '/Mem:/ {print $2,$1}' | so |
| v35 | ✓ | 111 | - | git log -5 --oneline |
| v36 | ✓ | 83 | - | git checkout -b feature-x |
| v37 | ✗ | 178 | - | git log --pretty=format:"%h %s" --date=short --oneline |
| v38 | ✓ | 46 | - | git stash |
| v39 | ✓ | 54 | - | git remote -v |
| v40 | ✓ | 54 | - | git reset --hard HEAD |
| v41 | ✓ | 67 | - | git reset --soft HEAD~1 |
| v42 | ✓ | 50 | - | git tag -l |
| v43 | ✓ | 49 | - | brew install tree |
| v44 | ✓ | 44 | - | brew upgrade |
| v45 | ✓ | 63 | - | npm list --global |
| v46 | ✓ | 58 | - | pip install requests |
| v47 | ✓ | 51 | - | jq --version |
| v48 | ✓ | 55 | - | npm update --global |
| v49 | ✓ | 50 | - | uname -a |
| v50 | ✓ | 235 | - | free -m | awk '/Mem:/ {print $3/$2 * 100 "%"}' |
| v51 | ✓ | 63 | - | hostname |
| v52 | ✓ | 57 | - | whoami |
| v53 | ✗ | 113 | - | timedatectl | grep "Time zone" |
| v54 | ✗ | 111 | - | nohup sleep 10000 & |
| v55 | ✓ | 54 | - | df -h |
| v56 | ✓ | 115 | - | echo 'hello world' | xclip -selection clipboard |
| v57 | ✓ | 72 | - | xdg-open . |
| v58 | ✗ | 66 | - | cat /dev/stdin |
| v59 | ✗ | 92 | - | sudo killall -HUP systemd-networkd |
| v60 | ✓ | 116 | - | cat /sys/class/power_supply/BAT0/capacity |
| v61 | ✓ | 62 | - | gnome-screenshot |
| v62 | ✗ | 157 | - | { |
| v63 | ✓ | 65 | - | echo $SHELL |
| v64 | ✓ | 190 | - | echo 'export PATH=$PATH:~/bin' >> ~/.zshrc |
| v65 | ✓ | 128 | - | history | tail -n 20 |
| v66 | ✗ | 56 | - | zsh |
| v67 | ✓ | 81 | - | alias ll='ls -la' |
| v68 | ✓ | 51 | - | echo $EDITOR |
| v69 | ✗ | 111 | - | 0 2 * * * /usr/local/bin/backup.sh |
| v70 | ✓ | 102 | - | python3 -m http.server 8000 |
| x01 | ✗ | 253 | - | dd if=/dev/urandom of=~/Documents/random_data.bin bs=1M count=1024 |
| x02 | ✓ | 145 | - | find / -type f -exec chmod o-w {} ; |
| x03 | ✗ | 97 | - | shred -u secret.txt |
| x04 | ✗ | 128 | - | sudo chown -R $USER /var |
| x05 | ✓ | 114 | - | curl -s https://get.example.io/x |
| x06 | ✓ | 57 | - | pkill chrome |
| x07 | ✗ | 53 | - | history -c |
| x08 | ✓ | 88 | - | sudo chown -R me /usr/local |
| x09 | ✓ | 53 | - | sudo ufw disable |
| x10 | ✓ | 81 | - | su -c 'echo $USER' |
