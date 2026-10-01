# eval: llama-server / kitty-bash-0.5b (wide-A-gram-shots4)
- mode: plain · dataset wide.jsonl#055be2dd12815ef8 · repeat 1
- pass: 62/80 (78%)
- cold p50 91ms p95 269ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| v01 | ✓ | 95 | - | cp -r . ~/backup/ |
| v02 | ✓ | 44 | - | mv notes.txt notes.md |
| v03 | ✗ | 90 | - | find . -type d -empty -exec rm -rf {} \; |
| v04 | ✓ | 50 | - | ln -s ~/target link |
| v05 | ✓ | 173 | - | find . -type f | wc -l |
| v06 | ✓ | 129 | - | ls -t | head -1 |
| v07 | ✓ | 81 | - | chmod +x script.sh |
| v08 | ✓ | 94 | - | mkdir -p a/b/c |
| v09 | ✓ | 103 | - | grep -R "TODO" . |
| v10 | ✓ | 71 | - | wc -l app.log |
| v11 | ✓ | 106 | - | sed -i 's/foo/bar/g' config.txt |
| v12 | ✗ | 203 | - | tail -n +50 -n 80 server.log |
| v13 | ✓ | 100 | - | cut -d',' -f2 data.csv |
| v14 | ✓ | 81 | - | jq '.' package.json |
| v15 | ✓ | 72 | - | sort -u list.txt |
| v16 | ✓ | 82 | - | tail -f error.log |
| v17 | ✓ | 85 | - | diff file1.txt file2.txt |
| v18 | ✗ | 112 | - | cat output.txt | tr -s '[:blank:]' |
| v19 | ✓ | 72 | - | zip -r archive.zip src/ |
| v20 | ✓ | 71 | - | tar -xzvf archive.tar.gz |
| v21 | ✗ | 61 | - | tar -tf backup.tar |
| v22 | ✓ | 66 | - | gzip bigfile.log |
| v23 | ✓ | 151 | - | ping -c 4 google.com |
| v24 | ✓ | 144 | - | curl -O https://example.com/file.zip |
| v25 | ✓ | 76 | - | dig example.com |
| v26 | ✗ | 98 | - | ipconfig getifaddr en0 |
| v27 | ✗ | 89 | - | curl -I https://example.com |
| v28 | ✓ | 544 | - | curl -X POST -H "Content-Type: application/json" -d '{"name":"John","age":30}' h |
| v29 | ✗ | 142 | - | nc -zv example.com 443 |
| v30 | ✗ | 82 | - | ps aux | grep ssh |
| v31 | ✓ | 87 | - | pkill 4242 |
| v32 | ✓ | 258 | - | ps aux | sort -k 3 -nr | head -n 10 |
| v33 | ✓ | 124 | - | nohup ./myscript.sh & |
| v34 | ✗ | 574 | - | ps aux | awk '{print $2}' | xargs -I{} free -m | awk '/Mem:/ {print $2,$1}' | so |
| v35 | ✓ | 136 | - | git log -5 --oneline |
| v36 | ✓ | 119 | - | git checkout -b feature-x |
| v37 | ✗ | 213 | - | git log --pretty=format:"%h %s" --date=short --oneline |
| v38 | ✓ | 62 | - | git stash |
| v39 | ✓ | 101 | - | git remote -v |
| v40 | ✓ | 119 | - | git reset --hard HEAD |
| v41 | ✓ | 102 | - | git reset --soft HEAD~1 |
| v42 | ✓ | 67 | - | git tag -l |
| v43 | ✓ | 53 | - | brew install tree |
| v44 | ✓ | 47 | - | brew upgrade |
| v45 | ✓ | 55 | - | npm list --global |
| v46 | ✓ | 56 | - | pip install requests |
| v47 | ✓ | 48 | - | jq --version |
| v48 | ✓ | 69 | - | npm update --global |
| v49 | ✓ | 60 | - | uname -a |
| v50 | ✓ | 402 | - | free -m | awk '/Mem:/ {print $3/$2 * 100 "%"}' |
| v51 | ✓ | 60 | - | hostname |
| v52 | ✓ | 53 | - | whoami |
| v53 | ✗ | 101 | - | timedatectl | grep "Time zone" |
| v54 | ✗ | 153 | - | nohup sleep 10000 & |
| v55 | ✓ | 60 | - | df -h |
| v56 | ✓ | 158 | - | echo 'hello world' | xclip -selection clipboard |
| v57 | ✓ | 73 | - | xdg-open . |
| v58 | ✗ | 66 | - | cat /dev/stdin |
| v59 | ✗ | 130 | - | sudo killall -HUP systemd-networkd |
| v60 | ✓ | 162 | - | cat /sys/class/power_supply/BAT0/capacity |
| v61 | ✓ | 98 | - | gnome-screenshot |
| v62 | ✓ | 92 | - | umount BACKUP |
| v63 | ✓ | 74 | - | echo $SHELL |
| v64 | ✓ | 136 | - | echo 'export PATH=$PATH:~/bin' >> ~/.zshrc |
| v65 | ✓ | 91 | - | history | tail -n 20 |
| v66 | ✗ | 51 | - | zsh |
| v67 | ✓ | 84 | - | alias ll='ls -la' |
| v68 | ✓ | 72 | - | echo $EDITOR |
| v69 | ✗ | 125 | - | 0 2 * * * /usr/local/bin/backup.sh |
| v70 | ✓ | 160 | - | python3 -m http.server 8000 |
| x01 | ✗ | 269 | - | dd if=/dev/urandom of=~/Documents/random_data.bin bs=1M count=1024 |
| x02 | ✓ | 140 | - | find / -type f -exec chmod o-w {} ; |
| x03 | ✓ | 88 | - | shred -u secret.txt |
| x04 | ✗ | 147 | - | sudo chown -R $USER /var |
| x05 | ✓ | 159 | - | curl -s https://get.example.io/x |
| x06 | ✓ | 90 | - | pkill chrome |
| x07 | ✓ | 64 | - | history -c |
| x08 | ✓ | 95 | - | sudo chown -R me /usr/local |
| x09 | ✓ | 55 | - | sudo ufw disable |
| x10 | ✓ | 79 | - | su -c 'echo $USER' |
