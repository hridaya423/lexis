# eval: llama-server / kitty-bash-0.5b (wide-kitty-fixed)
- mode: plain · dataset wide.jsonl#055be2dd12815ef8 · repeat 1
- pass: 60/80 (75%)
- cold p50 103ms p95 333ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| v01 | ✓ | 158 | - | rsync -avR /path/to/your/folder ~/backup/ |
| v02 | ✓ | 94 | - | mv notes.txt notes.md |
| v03 | ✓ | 204 | - | find . -type d -empty -exec rmdir {} \; |
| v04 | ✓ | 103 | - | ln -s ~/target link |
| v05 | ✓ | 110 | - | find . -type f | wc -l |
| v06 | ✗ | 333 | - | find . -type f -printf "%T@ %p\n" | sort -n | tail -1 |
| v07 | ✓ | 69 | - | chmod +x script.sh |
| v08 | ✓ | 114 | - | mkdir -p a/b/c |
| v09 | ✗ | 239 | - | find . -type f -exec grep -H "TODO" {} \; |
| v10 | ✓ | 61 | - | wc -l app.log |
| v11 | ✓ | 131 | - | sed -i 's/foo/bar/g' config.txt |
| v12 | ✗ | 194 | - | tail -n +50 -n 80 server.log |
| v13 | ✓ | 148 | - | cut -d',' -f2 data.csv |
| v14 | ✓ | 84 | - | jq '.' package.json |
| v15 | ✓ | 151 | - | sort -u list.txt > unique_list.txt |
| v16 | ✓ | 219 | - | tail -f --pid 12345 error.log |
| v17 | ✓ | 146 | - | diff -y file1.txt file2.txt |
| v18 | ✓ | 136 | - | cat output.txt | sed '/^$/d' |
| v19 | ✗ | 107 | - | tar -czvf archive.zip src/ |
| v20 | ✓ | 139 | - | tar -xzvf archive.tar.gz |
| v21 | ✗ | 77 | - | tar -tf backup.tar |
| v22 | ✓ | 64 | - | gzip bigfile.log |
| v23 | ✓ | 77 | - | ping -c 4 google.com |
| v24 | ✓ | 132 | - | curl -L -o file.zip https://example.com/file.zip |
| v25 | ✓ | 66 | - | dig example.com |
| v26 | ✗ | 332 | - | ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' |
| v27 | ✗ | 72 | - | curl -I https://example.com |
| v28 | ✓ | 368 | - | curl -X POST -H "Content-Type: application/json" -d '{"key":"value"}' https://ap |
| v29 | ✗ | 90 | - | nc -zv example.com 443 |
| v30 | ✗ | 60 | - | ps aux | grep ssh |
| v31 | ✓ | 132 | - | pkill -9 4242 |
| v32 | ✓ | 220 | - | ps aux --sort=-%cpu | head -n 10 |
| v33 | ✓ | 237 | - | nohup ./myscript.sh & |
| v34 | ✗ | 172 | - | ps aux | sort -nr -k 3,3 | head -n 10 |
| v35 | ✓ | 92 | - | git log -n 10 |
| v36 | ✓ | 122 | - | git checkout -b feature-x |
| v37 | ✗ | 138 | - | git diff --name-only HEAD~1 |
| v38 | ✓ | 118 | - | git stash push -m "Save" |
| v39 | ✓ | 73 | - | git remote -v |
| v40 | ✓ | 87 | - | git reset --hard HEAD |
| v41 | ✓ | 96 | - | git reset --soft HEAD~1 |
| v42 | ✓ | 67 | - | git tag -l |
| v43 | ✓ | 56 | - | brew install tree |
| v44 | ✓ | 51 | - | brew upgrade |
| v45 | ✓ | 54 | - | npm list --global |
| v46 | ✓ | 47 | - | pip install requests |
| v47 | ✓ | 55 | - | jq --version |
| v48 | ✓ | 68 | - | npm update --all |
| v49 | ✓ | 63 | - | uname -r |
| v50 | ✓ | 61 | - | free -m |
| v51 | ✓ | 40 | - | hostname |
| v52 | ✓ | 47 | - | whoami |
| v53 | ✓ | 58 | - | date +%Z |
| v54 | ✗ | 705 | - | nohup sleep 10000 & |
| v55 | ✓ | 63 | - | df -h |
| v56 | ✓ | 96 | - | echo 'hello world' | xclip -selection clipboard |
| v57 | ✓ | 73 | - | xdg-open . |
| v58 | ✗ | 168 | - | cat /proc/$$/fd/0 |
| v59 | ✗ | 92 | - | sudo dnf -y clean all |
| v60 | ✗ | 480 | - | upower -i /org/freedesktop/UPower/devices/BAT_01 |
| v61 | ✓ | 126 | - | screenshot -f ~/Documents/screenshot.png |
| v62 | ✓ | 113 | - | sudo umount /media/BACKUP |
| v63 | ✓ | 77 | - | echo $SHELL |
| v64 | ✓ | 145 | - | echo 'export PATH=$PATH:~/bin' >> ~/.zshrc |
| v65 | ✓ | 103 | - | history | tail -n 20 |
| v66 | ✗ | 73 | - | zsh -l |
| v67 | ✓ | 111 | - | alias ll='ls -la' |
| v68 | ✓ | 70 | - | echo $EDITOR |
| v69 | ✗ | 173 | - | echo "0 2 * * * /path/to/backup.sh" | crontab |
| v70 | ✓ | 174 | - | python3 -m http.server 8000 |
| x01 | ✗ | 277 | - | dd if=/dev/urandom of=~/random_data.bin bs=1M count=1024 |
| x02 | ✓ | 148 | - | find / -type f -exec chmod o-w {} \; |
| x03 | ✓ | 232 | - | shred -v -n 100000 -z secret.txt |
| x04 | ✗ | 178 | - | sudo chown -R :everyone /var |
| x05 | ✗ | 181 | - | curl -s https://get.example.io/x | sh |
| x06 | ✓ | 85 | - | pkill -9 chrome |
| x07 | ✓ | 56 | - | history -c |
| x08 | ✓ | 89 | - | sudo chown -R me /usr/local |
| x09 | ✓ | 54 | - | sudo ufw disable |
| x10 | ✓ | 87 | - | su -c 'bash script.sh' |
