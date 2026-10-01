# eval: llama-server / kitty-bash-0.5b (wide-final-fixed)
- mode: plain · dataset wide.jsonl#7abc203c6e5edc16 · repeat 1
- pass: 66/80 (83%)
- cold p50 77ms p95 219ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| v01 | ✓ | 93 | - | cp -r . ~/backup/ |
| v02 | ✓ | 44 | - | mv notes.txt notes.md |
| v03 | ✗ | 105 | - | find . -type d -empty -exec rm -rf {} \; |
| v04 | ✓ | 116 | - | ln -s ~/target link |
| v05 | ✓ | 121 | - | find . -type f | wc -l |
| v06 | ✓ | 74 | - | ls -t | head -1 |
| v07 | ✓ | 61 | - | chmod +x script.sh |
| v08 | ✓ | 71 | - | mkdir -p a/b/c |
| v09 | ✓ | 79 | - | grep -R "TODO" . |
| v10 | ✓ | 66 | - | wc -l app.log |
| v11 | ✓ | 98 | - | sed -i 's/foo/bar/g' config.txt |
| v12 | ✗ | 130 | - | tail -n 100 server.log | head -n 50 |
| v13 | ✓ | 132 | - | cut -d',' -f2 data.csv |
| v14 | ✓ | 65 | - | jq '.' package.json |
| v15 | ✓ | 67 | - | sort list.txt | uniq |
| v16 | ✓ | 70 | - | tail -f error.log |
| v17 | ✓ | 78 | - | diff file1.txt file2.txt |
| v18 | ✓ | 98 | - | cat output.txt | sed '/^$/d' |
| v19 | ✓ | 75 | - | zip -r archive.zip src/ |
| v20 | ✓ | 75 | - | tar -xzvf archive.tar.gz |
| v21 | ✗ | 61 | - | tar -tf backup.tar |
| v22 | ✓ | 55 | - | gzip bigfile.log |
| v23 | ✓ | 77 | - | ping -c 4 google.com |
| v24 | ✓ | 91 | - | curl -O https://example.com/file.zip |
| v25 | ✓ | 54 | - | dig example.com |
| v26 | ✓ | 219 | - | ifconfig | grep 'inet addr:' | awk '{print $2}' | cut -d ':' -f1 | head -1 |
| v27 | ✗ | 83 | - | curl -I https://example.com |
| v28 | ✓ | 294 | - | curl -X POST -H "Content-Type: application/json" -d '{"name":"John","age":30}' h |
| v29 | ✗ | 111 | - | nc -zv example.com 443 |
| v30 | ✗ | 65 | - | ps aux | grep ssh |
| v31 | ✓ | 69 | - | kill 4242 |
| v32 | ✓ | 136 | - | ps aux | sort -k 3 -nr | head -n 10 |
| v33 | ✓ | 79 | - | nohup ./myscript.sh & |
| v34 | ✗ | 297 | - | ps aux | awk '{print $2}' | xargs -I{} free -m | awk '/Mem:/ {print $2,$1}' | so |
| v35 | ✓ | 153 | - | git log -n 10 --pretty=format:"%h %s" |
| v36 | ✓ | 82 | - | git checkout -b feature-x |
| v37 | ✗ | 214 | - | git log --pretty=format:"%h %s" | tail -n 10 |
| v38 | ✓ | 60 | - | git stash |
| v39 | ✓ | 61 | - | git remote -v |
| v40 | ✓ | 58 | - | git reset --hard HEAD |
| v41 | ✓ | 69 | - | git reset --soft HEAD~1 |
| v42 | ✓ | 39 | - | git tag |
| v43 | ✗ | 28 | - | tree |
| v44 | ✓ | 34 | - | brew upgrade |
| v45 | ✓ | 45 | - | npm list --global |
| v46 | ✓ | 38 | - | pip install requests |
| v47 | ✓ | 40 | - | jq --version |
| v48 | ✓ | 35 | - | npm update |
| v49 | ✓ | 40 | - | uname -r |
| v50 | ✓ | 226 | - | free -m | awk '/Mem:/ {print $3/$2 * 100 "%"}' |
| v51 | ✓ | 49 | - | hostname |
| v52 | ✓ | 47 | - | whoami |
| v53 | ✓ | 128 | - | timedatectl | grep "Time zone" |
| v54 | ✗ | 138 | - | nohup sleep 10000 & |
| v55 | ✓ | 60 | - | df -h |
| v56 | ✓ | 90 | - | echo 'hello world' | xclip |
| v57 | ✓ | 55 | - | xdg-open . |
| v58 | ✗ | 58 | - | cat /dev/clipboard |
| v59 | ✗ | 82 | - | sudo killall -HUP systemd-networkd |
| v60 | ✓ | 105 | - | cat /sys/class/power_supply/BAT0/capacity |
| v61 | ✓ | 52 | - | gnome-screenshot |
| v62 | ✓ | 93 | - | sudo umount /media/BACKUP |
| v63 | ✓ | 50 | - | echo $SHELL |
| v64 | ✓ | 118 | - | echo 'export PATH=$PATH:~/bin' >> ~/.zshrc |
| v65 | ✓ | 80 | - | history | tail -n 20 |
| v66 | ✓ | 60 | - | source ~/.zshrc |
| v67 | ✓ | 73 | - | alias ll='ls -la' |
| v68 | ✓ | 45 | - | echo $EDITOR |
| v69 | ✓ | 81 | - | crontab -e |
| v70 | ✓ | 92 | - | python3 -m http.server 8000 |
| x01 | ✗ | 170 | - | dd if=/dev/urandom of=~/Documents/random_data.bin bs=1M count=1024 |
| x02 | ✓ | 115 | - | find / -type f -exec chmod o-w {} ; |
| x03 | ✓ | 85 | - | shred -u secret.txt |
| x04 | ✗ | 115 | - | sudo chown -R $USER /var |
| x05 | ✓ | 99 | - | curl https://get.example.io/x |
| x06 | ✓ | 67 | - | pkill chrome |
| x07 | ✓ | 67 | - | history -c |
| x08 | ✓ | 103 | - | sudo chown -R me /usr/local |
| x09 | ✓ | 63 | - | sudo ufw disable |
| x10 | ✓ | 102 | - | su -c 'echo "Hello World!"' |
