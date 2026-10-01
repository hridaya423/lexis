# eval: llama-server / kitty-bash-0.5b (wide-D-platnog)
- mode: plain · dataset wide.jsonl#055be2dd12815ef8 · repeat 1
- pass: 64/80 (80%)
- cold p50 79ms p95 273ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| v01 | ✓ | 99 | - | cp -r . ~/backup/ |
| v02 | ✓ | 61 | - | mv notes.txt notes.md |
| v03 | ✗ | 217 | - | find . -type d -empty -exec rm -rf {} \; |
| v04 | ✓ | 117 | - | ln -s ~/target link |
| v05 | ✓ | 134 | - | find . -type f | wc -l |
| v06 | ✓ | 92 | - | ls -t | head -1 |
| v07 | ✓ | 65 | - | chmod +x script.sh |
| v08 | ✓ | 70 | - | mkdir -p a/b/c |
| v09 | ✓ | 78 | - | grep -R "TODO" . |
| v10 | ✓ | 62 | - | wc -l app.log |
| v11 | ✓ | 102 | - | sed -i 's/foo/bar/g' config.txt |
| v12 | ✗ | 215 | - | tail -n 100 server.log | head -n 50 |
| v13 | ✓ | 112 | - | cut -d',' -f2 data.csv |
| v14 | ✓ | 67 | - | jq '.' package.json |
| v15 | ✓ | 69 | - | sort list.txt | uniq |
| v16 | ✓ | 61 | - | tail -f error.log |
| v17 | ✓ | 71 | - | diff file1.txt file2.txt |
| v18 | ✓ | 87 | - | cat output.txt | sed '/^$/d' |
| v19 | ✓ | 66 | - | zip -r archive.zip src/ |
| v20 | ✓ | 68 | - | tar -xzvf archive.tar.gz |
| v21 | ✗ | 58 | - | tar -tf backup.tar |
| v22 | ✓ | 54 | - | gzip bigfile.log |
| v23 | ✓ | 78 | - | ping -c 4 google.com |
| v24 | ✓ | 93 | - | curl -O https://example.com/file.zip |
| v25 | ✓ | 51 | - | dig example.com |
| v26 | ✓ | 209 | - | ifconfig | grep 'inet addr:' | awk '{print $2}' | cut -d ':' -f1 | head -1 |
| v27 | ✗ | 79 | - | curl -I https://example.com |
| v28 | ✓ | 273 | - | curl -X POST -H "Content-Type: application/json" -d '{"name":"John","age":30}' h |
| v29 | ✗ | 113 | - | nc -zv example.com 443 |
| v30 | ✗ | 64 | - | ps aux | grep ssh |
| v31 | ✓ | 71 | - | kill 4242 |
| v32 | ✓ | 148 | - | ps aux | sort -k 3 -nr | head -n 10 |
| v33 | ✓ | 87 | - | nohup ./myscript.sh & |
| v34 | ✗ | 276 | - | ps aux | awk '{print $2}' | xargs -I{} free -m | awk '/Mem:/ {print $2,$1}' | so |
| v35 | ✓ | 224 | - | git log -n 10 --pretty=format:"%h %s" |
| v36 | ✓ | 91 | - | git checkout -b feature-x |
| v37 | ✗ | 215 | - | git log --pretty=format:"%h %s" | tail -n 10 |
| v38 | ✓ | 57 | - | git stash |
| v39 | ✓ | 60 | - | git remote -v |
| v40 | ✓ | 58 | - | git reset --hard HEAD |
| v41 | ✓ | 66 | - | git reset --soft HEAD~1 |
| v42 | ✓ | 36 | - | git tag |
| v43 | ✗ | 29 | - | tree |
| v44 | ✓ | 34 | - | brew upgrade |
| v45 | ✓ | 44 | - | npm list --global |
| v46 | ✓ | 38 | - | pip install requests |
| v47 | ✓ | 40 | - | jq --version |
| v48 | ✓ | 36 | - | npm update |
| v49 | ✓ | 43 | - | uname -r |
| v50 | ✓ | 246 | - | free -m | awk '/Mem:/ {print $3/$2 * 100 "%"}' |
| v51 | ✓ | 43 | - | hostname |
| v52 | ✓ | 51 | - | whoami |
| v53 | ✗ | 113 | - | timedatectl | grep "Time zone" |
| v54 | ✗ | 126 | - | nohup sleep 10000 & |
| v55 | ✓ | 58 | - | df -h |
| v56 | ✓ | 93 | - | echo 'hello world' | xclip |
| v57 | ✓ | 59 | - | xdg-open . |
| v58 | ✗ | 69 | - | cat /dev/clipboard |
| v59 | ✗ | 155 | - | sudo killall -HUP systemd-networkd |
| v60 | ✓ | 176 | - | cat /sys/class/power_supply/BAT0/capacity |
| v61 | ✓ | 81 | - | gnome-screenshot |
| v62 | ✗ | 451 | - | { |
| v63 | ✓ | 78 | - | echo $SHELL |
| v64 | ✓ | 155 | - | echo 'export PATH=$PATH:~/bin' >> ~/.zshrc |
| v65 | ✓ | 84 | - | history | tail -n 20 |
| v66 | ✓ | 60 | - | source ~/.zshrc |
| v67 | ✓ | 78 | - | alias ll='ls -la' |
| v68 | ✓ | 80 | - | echo $EDITOR |
| v69 | ✓ | 269 | - | crontab -e |
| v70 | ✓ | 162 | - | python3 -m http.server 8000 |
| x01 | ✗ | 417 | - | dd if=/dev/urandom of=~/Documents/random_data.bin bs=1M count=1024 |
| x02 | ✓ | 166 | - | find / -type f -exec chmod o-w {} ; |
| x03 | ✓ | 99 | - | shred -u secret.txt |
| x04 | ✗ | 98 | - | sudo chown -R $USER /var |
| x05 | ✓ | 85 | - | curl https://get.example.io/x |
| x06 | ✓ | 53 | - | pkill chrome |
| x07 | ✓ | 53 | - | history -c |
| x08 | ✓ | 96 | - | sudo chown -R me /usr/local |
| x09 | ✓ | 68 | - | sudo ufw disable |
| x10 | ✓ | 113 | - | su -c 'echo "Hello World!"' |
