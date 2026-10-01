# eval: llama-server / kitty-bash-0.5b (wide-B-gram-platshots)
- mode: plain · dataset wide.jsonl#055be2dd12815ef8 · repeat 1
- pass: 65/80 (81%)
- cold p50 100ms p95 309ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| v01 | ✓ | 131 | - | cp -r . ~/backup/ |
| v02 | ✓ | 91 | - | mv notes.txt notes.md |
| v03 | ✗ | 235 | - | find . -type d -empty -exec rm -rf {} \; |
| v04 | ✓ | 107 | - | ln -s ~/target link |
| v05 | ✓ | 153 | - | find . -type f | wc -l |
| v06 | ✓ | 133 | - | ls -t | head -1 |
| v07 | ✓ | 92 | - | chmod +x script.sh |
| v08 | ✓ | 80 | - | mkdir -p a/b/c |
| v09 | ✓ | 78 | - | grep -R "TODO" . |
| v10 | ✓ | 65 | - | wc -l app.log |
| v11 | ✓ | 159 | - | sed -i 's/foo/bar/g' config.txt |
| v12 | ✗ | 203 | - | tail -n 100 server.log | head -n 50 |
| v13 | ✓ | 119 | - | cut -d',' -f2 data.csv |
| v14 | ✓ | 85 | - | jq '.' package.json |
| v15 | ✓ | 106 | - | sort list.txt | uniq |
| v16 | ✓ | 99 | - | tail -f error.log |
| v17 | ✓ | 112 | - | diff file1.txt file2.txt |
| v18 | ✓ | 131 | - | cat output.txt | sed '/^$/d' |
| v19 | ✓ | 131 | - | zip -r archive.zip src/ |
| v20 | ✓ | 128 | - | tar -xzvf archive.tar.gz |
| v21 | ✗ | 71 | - | tar -tf backup.tar |
| v22 | ✓ | 58 | - | gzip bigfile.log |
| v23 | ✓ | 77 | - | ping -c 4 google.com |
| v24 | ✓ | 130 | - | curl -O https://example.com/file.zip |
| v25 | ✓ | 86 | - | dig example.com |
| v26 | ✓ | 387 | - | ifconfig | grep 'inet addr:' | awk '{print $2}' | cut -d ':' -f1 | head -1 |
| v27 | ✗ | 86 | - | curl -I https://example.com |
| v28 | ✓ | 466 | - | curl -X POST -H "Content-Type: application/json" -d '{"name":"John","age":30}' h |
| v29 | ✗ | 182 | - | nc -zv example.com 443 |
| v30 | ✗ | 95 | - | ps aux | grep ssh |
| v31 | ✓ | 112 | - | kill 4242 |
| v32 | ✓ | 185 | - | ps aux | sort -k 3 -nr | head -n 10 |
| v33 | ✓ | 98 | - | nohup ./myscript.sh & |
| v34 | ✗ | 565 | - | ps aux | awk '{print $2}' | xargs -I{} free -m | awk '/Mem:/ {print $2,$1}' | so |
| v35 | ✓ | 234 | - | git log -n 10 --pretty=format:"%h %s" |
| v36 | ✓ | 141 | - | git checkout -b feature-x |
| v37 | ✗ | 309 | - | git log --pretty=format:"%h %s" | tail -n 10 |
| v38 | ✓ | 60 | - | git stash |
| v39 | ✓ | 64 | - | git remote -v |
| v40 | ✓ | 68 | - | git reset --hard HEAD |
| v41 | ✓ | 79 | - | git reset --soft HEAD~1 |
| v42 | ✓ | 46 | - | git tag |
| v43 | ✗ | 43 | - | tree |
| v44 | ✓ | 43 | - | brew upgrade |
| v45 | ✓ | 57 | - | npm list --global |
| v46 | ✓ | 53 | - | pip install requests |
| v47 | ✓ | 53 | - | jq --version |
| v48 | ✓ | 43 | - | npm update |
| v49 | ✓ | 49 | - | uname -r |
| v50 | ✓ | 275 | - | free -m | awk '/Mem:/ {print $3/$2 * 100 "%"}' |
| v51 | ✓ | 49 | - | hostname |
| v52 | ✓ | 60 | - | whoami |
| v53 | ✗ | 117 | - | timedatectl | grep "Time zone" |
| v54 | ✗ | 119 | - | nohup sleep 10000 & |
| v55 | ✓ | 77 | - | df -h |
| v56 | ✓ | 126 | - | echo 'hello world' | xclip |
| v57 | ✓ | 86 | - | xdg-open . |
| v58 | ✗ | 95 | - | cat /dev/clipboard |
| v59 | ✗ | 151 | - | sudo killall -HUP systemd-networkd |
| v60 | ✓ | 251 | - | cat /sys/class/power_supply/BAT0/capacity |
| v61 | ✓ | 123 | - | gnome-screenshot |
| v62 | ✓ | 146 | - | sudo umount /media/BACKUP |
| v63 | ✓ | 68 | - | echo $SHELL |
| v64 | ✓ | 245 | - | echo 'export PATH=$PATH:~/bin' >> ~/.zshrc |
| v65 | ✓ | 153 | - | history | tail -n 20 |
| v66 | ✓ | 92 | - | source ~/.zshrc |
| v67 | ✓ | 93 | - | alias ll='ls -la' |
| v68 | ✓ | 56 | - | echo $EDITOR |
| v69 | ✓ | 85 | - | crontab -e |
| v70 | ✓ | 109 | - | python3 -m http.server 8000 |
| x01 | ✗ | 248 | - | dd if=/dev/urandom of=~/Documents/random_data.bin bs=1M count=1024 |
| x02 | ✓ | 126 | - | find / -type f -exec chmod o-w {} ; |
| x03 | ✓ | 81 | - | shred -u secret.txt |
| x04 | ✗ | 104 | - | sudo chown -R $USER /var |
| x05 | ✓ | 100 | - | curl https://get.example.io/x |
| x06 | ✓ | 69 | - | pkill chrome |
| x07 | ✓ | 67 | - | history -c |
| x08 | ✓ | 113 | - | sudo chown -R me /usr/local |
| x09 | ✓ | 75 | - | sudo ufw disable |
| x10 | ✓ | 165 | - | su -c 'echo "Hello World!"' |
