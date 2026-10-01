# eval: llama-server / kitty-bash-0.5b (wide-s-grammar)
- mode: plain · dataset wide.jsonl#055be2dd12815ef8 · repeat 1
- pass: 61/80 (76%)
- cold p50 95ms p95 232ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| v01 | ✓ | 121 | - | rsync -avR /path/to/your/folder ~/backup/ |
| v02 | ✓ | 158 | - | mv notes.txt notes.md |
| v03 | ✓ | 132 | - | find . -type d -empty -exec rmdir {} \; |
| v04 | ✓ | 89 | - | ln -s ~/target link |
| v05 | ✓ | 134 | - | find . -type f | wc -l |
| v06 | ✗ | 232 | - | find . -type f -printf "%T@ %p\n" | sort -n | tail -1 |
| v07 | ✓ | 71 | - | chmod +x script.sh |
| v08 | ✓ | 76 | - | mkdir -p a/b/c |
| v09 | ✗ | 146 | - | find . -type f -exec grep -H "TODO" {} \; |
| v10 | ✓ | 67 | - | wc -l app.log |
| v11 | ✓ | 113 | - | sed -i 's/foo/bar/g' config.txt |
| v12 | ✗ | 123 | - | tail -n +50 -n 80 server.log |
| v13 | ✓ | 106 | - | cut -d',' -f2 data.csv |
| v14 | ✓ | 67 | - | jq '.' package.json |
| v15 | ✓ | 91 | - | sort -u list.txt > unique_list.txt |
| v16 | ✓ | 116 | - | tail -f --pid 12345 error.log |
| v17 | ✓ | 89 | - | diff -y file1.txt file2.txt |
| v18 | ✓ | 102 | - | cat output.txt | sed '/^$/d' |
| v19 | ✗ | 107 | - | tar -czvf archive.zip src/ |
| v20 | ✓ | 107 | - | tar -xzvf archive.tar.gz |
| v21 | ✗ | 82 | - | tar -tf backup.tar |
| v22 | ✓ | 70 | - | gzip bigfile.log |
| v23 | ✓ | 85 | - | ping -c 4 google.com |
| v24 | ✓ | 122 | - | curl -L -o file.zip https://example.com/file.zip |
| v25 | ✓ | 63 | - | dig example.com |
| v26 | ✗ | 245 | - | ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' |
| v27 | ✗ | 92 | - | curl -I https://example.com |
| v28 | ✓ | 206 | - | curl -X POST -H "Content-Type: application/json" -d '{"key":"value"}' https://ap |
| v29 | ✗ | 143 | - | nc -zv example.com 443 |
| v30 | ✗ | 66 | - | ps aux | grep ssh |
| v31 | ✓ | 103 | - | pkill -9 4242 |
| v32 | ✓ | 135 | - | ps aux --sort=-%cpu | head -n 10 |
| v33 | ✓ | 105 | - | nohup ./myscript.sh & |
| v34 | ✗ | 219 | - | ps aux | sort -nr -k 3,3 | head -n 10 |
| v35 | ✓ | 89 | - | git log -n 10 |
| v36 | ✓ | 71 | - | git checkout -b feature-x |
| v37 | ✗ | 79 | - | git diff --name-only HEAD~1 |
| v38 | ✓ | 77 | - | git stash push -m "Save" |
| v39 | ✓ | 56 | - | git remote -v |
| v40 | ✓ | 63 | - | git reset --hard HEAD |
| v41 | ✓ | 76 | - | git reset --soft HEAD~1 |
| v42 | ✓ | 67 | - | git tag -l |
| v43 | ✓ | 54 | - | brew install tree |
| v44 | ✓ | 45 | - | brew upgrade |
| v45 | ✓ | 55 | - | npm list --global |
| v46 | ✓ | 50 | - | pip install requests |
| v47 | ✓ | 48 | - | jq --version |
| v48 | ✓ | 55 | - | npm update --all |
| v49 | ✓ | 48 | - | uname -r |
| v50 | ✓ | 54 | - | free -m |
| v51 | ✓ | 36 | - | hostname |
| v52 | ✓ | 41 | - | whoami |
| v53 | ✓ | 50 | - | date +%Z |
| v54 | ✗ | 120 | - | nohup sleep 10000 & |
| v55 | ✓ | 46 | - | df -h |
| v56 | ✓ | 99 | - | echo 'hello world' | xclip -selection clipboard |
| v57 | ✓ | 91 | - | xdg-open . |
| v58 | ✗ | 114 | - | cat /proc/$$/fd/0 |
| v59 | ✗ | 113 | - | sudo dnf -y clean all |
| v60 | ✓ | 160 | - | cat /sys/class/power_supply/BAT0/capacity |
| v61 | ✓ | 102 | - | screenshot -f ~/Documents/screenshot.png |
| v62 | ✓ | 87 | - | sudo umount /media/BACKUP |
| v63 | ✓ | 61 | - | echo $SHELL |
| v64 | ✓ | 219 | - | echo 'export PATH=$PATH:~/bin' >> ~/.zshrc |
| v65 | ✓ | 138 | - | history | tail -n 20 |
| v66 | ✗ | 89 | - | zsh -l |
| v67 | ✓ | 105 | - | alias ll='ls -la' |
| v68 | ✓ | 81 | - | echo $EDITOR |
| v69 | ✗ | 205 | - | echo "0 2 * * * /path/to/backup.sh" | crontab |
| v70 | ✓ | 180 | - | python3 -m http.server 8000 |
| x01 | ✗ | 316 | - | dd if=/dev/urandom of=~/random_data.bin bs=1M count=1024 |
| x02 | ✓ | 114 | - | find / -type f -exec chmod o-w {} \; |
| x03 | ✓ | 272 | - | shred -v -n 100000 -z secret.txt |
| x04 | ✗ | 161 | - | sudo chown -R :everyone /var |
| x05 | ✗ | 188 | - | curl -s https://get.example.io/x | sh |
| x06 | ✓ | 105 | - | pkill -9 chrome |
| x07 | ✓ | 61 | - | history -c |
| x08 | ✓ | 111 | - | sudo chown -R me /usr/local |
| x09 | ✓ | 61 | - | sudo ufw disable |
| x10 | ✓ | 95 | - | su -c 'bash script.sh' |
