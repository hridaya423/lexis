# eval: llama-server / kitty-bash-0.5b (wide-v2)
- mode: plain · dataset wide.jsonl#055be2dd12815ef8 · repeat 1
- pass: 60/80 (75%)
- cold p50 97ms p95 241ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| v01 | ✓ | 120 | - | rsync -avR /path/to/your/folder ~/backup/ |
| v02 | ✓ | 58 | - | mv notes.txt notes.md |
| v03 | ✓ | 123 | - | find . -type d -empty -exec rmdir {} \; |
| v04 | ✓ | 76 | - | ln -s ~/target link |
| v05 | ✓ | 96 | - | find . -type f | wc -l |
| v06 | ✗ | 183 | - | find . -type f -printf "%T@ %p\n" | sort -n | tail -1 |
| v07 | ✓ | 79 | - | chmod +x script.sh |
| v08 | ✓ | 84 | - | mkdir -p a/b/c |
| v09 | ✗ | 168 | - | find . -type f -exec grep -H "TODO" {} \; |
| v10 | ✓ | 74 | - | wc -l app.log |
| v11 | ✓ | 122 | - | sed -i 's/foo/bar/g' config.txt |
| v12 | ✗ | 184 | - | tail -n +50 -n 80 server.log |
| v13 | ✓ | 118 | - | cut -d',' -f2 data.csv |
| v14 | ✓ | 66 | - | jq '.' package.json |
| v15 | ✓ | 102 | - | sort -u list.txt > unique_list.txt |
| v16 | ✓ | 132 | - | tail -f --pid 12345 error.log |
| v17 | ✓ | 97 | - | diff -y file1.txt file2.txt |
| v18 | ✓ | 103 | - | cat output.txt | sed '/^$/d' |
| v19 | ✗ | 93 | - | tar -czvf archive.zip src/ |
| v20 | ✓ | 90 | - | tar -xzvf archive.tar.gz |
| v21 | ✗ | 77 | - | tar -tf backup.tar |
| v22 | ✓ | 76 | - | gzip bigfile.log |
| v23 | ✓ | 93 | - | ping -c 4 google.com |
| v24 | ✓ | 133 | - | curl -L -o file.zip https://example.com/file.zip |
| v25 | ✓ | 54 | - | dig example.com |
| v26 | ✗ | 214 | - | ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' |
| v27 | ✗ | 88 | - | curl -I https://example.com |
| v28 | ✓ | 236 | - | curl -X POST -H "Content-Type: application/json" -d '{"key":"value"}' https://ap |
| v29 | ✗ | 261 | - | nc -zv example.com 443 |
| v30 | ✗ | 119 | - | ps aux | grep ssh |
| v31 | ✓ | 141 | - | pkill -9 4242 |
| v32 | ✓ | 161 | - | ps aux --sort=-%cpu | head -n 10 |
| v33 | ✓ | 97 | - | nohup ./myscript.sh & |
| v34 | ✗ | 198 | - | ps aux | sort -nr -k 3,3 | head -n 10 |
| v35 | ✓ | 124 | - | git log -n 10 |
| v36 | ✓ | 105 | - | git checkout -b feature-x |
| v37 | ✗ | 116 | - | git diff --name-only HEAD~1 |
| v38 | ✓ | 103 | - | git stash push -m "Save" |
| v39 | ✓ | 67 | - | git remote -v |
| v40 | ✓ | 65 | - | git reset --hard HEAD |
| v41 | ✓ | 80 | - | git reset --soft HEAD~1 |
| v42 | ✓ | 59 | - | git tag -l |
| v43 | ✓ | 53 | - | brew install tree |
| v44 | ✓ | 40 | - | brew upgrade |
| v45 | ✓ | 57 | - | npm list --global |
| v46 | ✓ | 59 | - | pip install requests |
| v47 | ✓ | 59 | - | jq --version |
| v48 | ✓ | 67 | - | npm update --all |
| v49 | ✓ | 66 | - | uname -r |
| v50 | ✓ | 65 | - | free -m |
| v51 | ✓ | 47 | - | hostname |
| v52 | ✓ | 51 | - | whoami |
| v53 | ✓ | 53 | - | date +%Z |
| v54 | ✗ | 603 | - | nohup sleep 10000 & |
| v55 | ✓ | 62 | - | df -h |
| v56 | ✓ | 93 | - | echo 'hello world' | xclip -selection clipboard |
| v57 | ✓ | 56 | - | xdg-open . |
| v58 | ✗ | 101 | - | cat /proc/$$/fd/0 |
| v59 | ✗ | 139 | - | sudo dnf -y clean all |
| v60 | ✗ | 513 | - | { |
| v61 | ✓ | 224 | - | screenshot -f ~/Documents/screenshot.png |
| v62 | ✓ | 171 | - | sudo umount /media/BACKUP |
| v63 | ✓ | 75 | - | echo $SHELL |
| v64 | ✓ | 165 | - | echo 'export PATH=$PATH:~/bin' >> ~/.zshrc |
| v65 | ✓ | 118 | - | history | tail -n 20 |
| v66 | ✗ | 72 | - | zsh -l |
| v67 | ✓ | 81 | - | alias ll='ls -la' |
| v68 | ✓ | 46 | - | echo $EDITOR |
| v69 | ✗ | 138 | - | echo "0 2 * * * /path/to/backup.sh" | crontab |
| v70 | ✓ | 94 | - | python3 -m http.server 8000 |
| x01 | ✗ | 241 | - | dd if=/dev/urandom of=~/random_data.bin bs=1M count=1024 |
| x02 | ✓ | 127 | - | find / -type f -exec chmod o-w {} \; |
| x03 | ✓ | 157 | - | shred -v -n 100000 -z secret.txt |
| x04 | ✗ | 100 | - | sudo chown -R :everyone /var |
| x05 | ✗ | 103 | - | curl -s https://get.example.io/x | sh |
| x06 | ✓ | 70 | - | pkill -9 chrome |
| x07 | ✓ | 60 | - | history -c |
| x08 | ✓ | 118 | - | sudo chown -R me /usr/local |
| x09 | ✓ | 92 | - | sudo ufw disable |
| x10 | ✓ | 121 | - | su -c 'bash script.sh' |
