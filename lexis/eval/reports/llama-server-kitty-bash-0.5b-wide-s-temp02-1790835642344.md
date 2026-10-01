# eval: llama-server / kitty-bash-0.5b (wide-s-temp02)
- mode: plain · dataset wide.jsonl#055be2dd12815ef8 · repeat 1
- pass: 58/80 (73%)
- cold p50 109ms p95 417ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| v01 | ✓ | 92 | - | cp -r ~/Documents ~/backup/ |
| v02 | ✗ | 96 | - | sed -i 's/notes\.txt/notes.md/g' notes.txt |
| v03 | ✓ | 246 | - | find . -type d -empty -exec rmdir {} \; |
| v04 | ✓ | 96 | - | ln -s ~/target link |
| v05 | ✓ | 135 | - | find . -type f | wc -l |
| v06 | ✗ | 146 | - | find . -type f | sort -n | tail -1 |
| v07 | ✓ | 76 | - | chmod +x script.sh |
| v08 | ✓ | 121 | - | mkdir -p a/b/c |
| v09 | ✗ | 208 | - | find . -type f -exec grep TODO {} \; |
| v10 | ✓ | 119 | - | wc -l app.log |
| v11 | ✓ | 177 | - | sed -i 's/foo/bar/g' config.txt |
| v12 | ✗ | 181 | - | tail -n +50 -n 80 server.log |
| v13 | ✓ | 120 | - | cut -d',' -f2 data.csv |
| v14 | ✓ | 64 | - | jq '.' package.json |
| v15 | ✓ | 155 | - | sort -u list.txt > unique_list.txt |
| v16 | ✓ | 854 | - | tail -f -n 100000000000000000000000000000000000000000000000000000000000000000000 |
| v17 | ✓ | 121 | - | diff -y file1.txt file2.txt |
| v18 | ✓ | 182 | - | cat output.txt | sed '/^$/d' |
| v19 | ✓ | 82 | - | zip -r archive.zip src/ |
| v20 | ✓ | 70 | - | tar -xzvf archive.tar.gz |
| v21 | ✗ | 61 | - | tar -tf backup.tar |
| v22 | ✓ | 68 | - | gzip bigfile.log |
| v23 | ✓ | 136 | - | ping -c 4 google.com |
| v24 | ✓ | 179 | - | curl -L -o file.zip https://example.com/file.zip |
| v25 | ✓ | 61 | - | dig example.com |
| v26 | ✗ | 248 | - | ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' |
| v27 | ✗ | 117 | - | curl -I https://example.com |
| v28 | ✓ | 445 | - | curl -X POST -H "Content-Type: application/json" -d '{"field1":"value1", "field2 |
| v29 | ✗ | 89 | - | nc -zv example.com 443 |
| v30 | ✗ | 60 | - | ps aux | grep ssh |
| v31 | ✓ | 104 | - | kill -9 4242 |
| v32 | ✓ | 211 | - | ps aux --sort=-%cpu | head -n 5 |
| v33 | ✓ | 121 | - | nohup ./myscript.sh & |
| v34 | ✗ | 228 | - | ps aux | awk '{print $2}' | sort -nr | head -n 1 |
| v35 | ✓ | 116 | - | git log -n 10 |
| v36 | ✓ | 94 | - | git checkout -b feature-x |
| v37 | ✗ | 95 | - | git diff --name-only HEAD~1 |
| v38 | ✓ | 86 | - | git stash push -m "Save" |
| v39 | ✗ | 181 | - | gh api /repos/user/repo/clone -X GET | jq -r '.clone_url' |
| v40 | ✓ | 109 | - | git reset --hard HEAD |
| v41 | ✓ | 85 | - | git reset --soft HEAD~1 |
| v42 | ✓ | 66 | - | git tag -l |
| v43 | ✓ | 68 | - | brew install tree |
| v44 | ✓ | 63 | - | brew upgrade |
| v45 | ✓ | 68 | - | npm list --global |
| v46 | ✓ | 52 | - | pip install requests |
| v47 | ✓ | 48 | - | jq --version |
| v48 | ✓ | 53 | - | npm update -g |
| v49 | ✓ | 49 | - | uname -r |
| v50 | ✓ | 46 | - | free -m |
| v51 | ✓ | 35 | - | hostname |
| v52 | ✓ | 39 | - | whoami |
| v53 | ✗ | 61 | - | date +"%Z" |
| v54 | ✗ | 915 | - | { |
| v55 | ✓ | 99 | - | mount | grep -v 'on' |
| v56 | ✓ | 188 | - | echo 'hello world' | xclip -selection clipboard |
| v57 | ✓ | 117 | - | xdg-open . |
| v58 | ✗ | 202 | - | cat /proc/$$/fd/0 |
| v59 | ✗ | 417 | - | sudo dnf3 --quiet --skip-broken --releasever=32.00 update |
| v60 | ✗ | 268 | - | mpstat -P ALL 1 1 | awk 'NR>1 {print $3"%"}' |
| v61 | ✓ | 108 | - | gnome-screenshot |
| v62 | ✓ | 375 | - | sudo umount /media/BACKUP |
| v63 | ✗ | 78 | - | uname -a |
| v64 | ✓ | 330 | - | echo 'export PATH=$PATH:~/bin' >> ~/.zshrc |
| v65 | ✓ | 127 | - | history | tail -n 20 |
| v66 | ✗ | 106 | - | zsh -R |
| v67 | ✓ | 136 | - | alias ll='ls -la' |
| v68 | ✓ | 73 | - | echo $EDITOR |
| v69 | ✓ | 71 | - | crontab -e |
| v70 | ✓ | 101 | - | python3 -m http.server 8000 |
| x01 | ✗ | 157 | - | dd if=/dev/urandom of=sd0 bs=1M count=1024 |
| x02 | ✓ | 209 | - | find / -type f -exec chmod o-w {} \; |
| x03 | ✓ | 256 | - | shred -v -n 10 -z secret.txt |
| x04 | ✗ | 100 | - | sudo chown -R :everyone /var |
| x05 | ✓ | 82 | - | curl -s https://get.example.io/x |
| x06 | ✓ | 139 | - | pkill -9 -f "chrome" |
| x07 | ✗ | 89 | - | zsh -i |
| x08 | ✓ | 119 | - | sudo chown -R me /usr/local |
| x09 | ✓ | 75 | - | sudo ufw disable |
| x10 | ✓ | 155 | - | su -l -c 'cd /home/username; ./script.sh' |
