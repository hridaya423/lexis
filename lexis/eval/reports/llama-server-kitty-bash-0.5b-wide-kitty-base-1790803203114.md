# eval: llama-server / kitty-bash-0.5b (wide-kitty-base)
- mode: plain · dataset wide.jsonl#055be2dd12815ef8 · repeat 1
- pass: 57/80 (71%)
- cold p50 104ms p95 350ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| v01 | ✓ | 135 | - | rsync -avR /path/to/your/folder ~/backup/ |
| v02 | ✓ | 55 | - | mv notes.txt notes.md |
| v03 | ✓ | 107 | - | find . -type d -empty -exec rmdir {} \; |
| v04 | ✓ | 66 | - | ln -s ~/target link |
| v05 | ✓ | 99 | - | find . -type f | wc -l |
| v06 | ✗ | 350 | - | find . -type f -printf "%T@ %p\n" | sort -n | tail -1 |
| v07 | ✓ | 102 | - | chmod +x script.sh |
| v08 | ✓ | 102 | - | mkdir -p a/b/c |
| v09 | ✗ | 184 | - | find . -type f -exec grep -H "TODO" {} \; |
| v10 | ✓ | 112 | - | wc -l app.log |
| v11 | ✓ | 169 | - | sed -i 's/foo/bar/g' config.txt |
| v12 | ✗ | 162 | - | tail -n +50 -n 80 server.log |
| v13 | ✓ | 104 | - | cut -d',' -f2 data.csv |
| v14 | ✓ | 69 | - | jq '.' package.json |
| v15 | ✓ | 109 | - | sort -u list.txt > unique_list.txt |
| v16 | ✓ | 227 | - | tail -f --pid 12345 error.log |
| v17 | ✓ | 181 | - | diff -y file1.txt file2.txt |
| v18 | ✓ | 184 | - | cat output.txt | sed '/^$/d' |
| v19 | ✗ | 129 | - | tar -czvf archive.zip src/ |
| v20 | ✓ | 104 | - | tar -xzvf archive.tar.gz |
| v21 | ✗ | 74 | - | tar -tf backup.tar |
| v22 | ✓ | 61 | - | gzip bigfile.log |
| v23 | ✓ | 80 | - | ping -c 4 google.com |
| v24 | ✓ | 134 | - | curl -L -o file.zip https://example.com/file.zip |
| v25 | ✓ | 76 | - | dig example.com |
| v26 | ✗ | 275 | - | ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' |
| v27 | ✗ | 146 | - | curl -I https://example.com |
| v28 | ✓ | 340 | - | curl -X POST -H "Content-Type: application/json" -d '{"key":"value"}' https://ap |
| v29 | ✗ | 94 | - | nc -zv example.com 443 |
| v30 | ✗ | 67 | - | ps aux | grep ssh |
| v31 | ✓ | 158 | - | pkill -9 4242 |
| v32 | ✓ | 258 | - | ps aux --sort=-%cpu | head -n 10 |
| v33 | ✓ | 109 | - | nohup ./myscript.sh & |
| v34 | ✗ | 167 | - | ps aux | sort -nr -k 3,3 | head -n 10 |
| v35 | ✓ | 78 | - | git log -n 10 |
| v36 | ✓ | 74 | - | git checkout -b feature-x |
| v37 | ✗ | 199 | - | git diff --name-only HEAD~1 |
| v38 | ✓ | 116 | - | git stash push -m "Save" |
| v39 | ✓ | 73 | - | git remote -v |
| v40 | ✓ | 75 | - | git reset --hard HEAD |
| v41 | ✓ | 88 | - | git reset --soft HEAD~1 |
| v42 | ✓ | 61 | - | git tag -l |
| v43 | ✓ | 52 | - | brew install tree |
| v44 | ✓ | 45 | - | brew upgrade |
| v45 | ✓ | 63 | - | npm list --global |
| v46 | ✓ | 80 | - | pip install requests |
| v47 | ✓ | 84 | - | jq --version |
| v48 | ✓ | 86 | - | npm update --all |
| v49 | ✓ | 74 | - | uname -r |
| v50 | ✓ | 87 | - | free -m |
| v51 | ✓ | 59 | - | hostname |
| v52 | ✓ | 53 | - | whoami |
| v53 | ✓ | 64 | - | date +%Z |
| v54 | ✗ | 1022 | - | { |
| v55 | ✓ | 101 | - | df -h |
| v56 | ✓ | 196 | - | echo 'hello world' | xclip -selection clipboard |
| v57 | ✓ | 97 | - | xdg-open . |
| v58 | ✗ | 109 | - | cat /proc/$$/fd/0 |
| v59 | ✗ | 109 | - | sudo dnf -y clean all |
| v60 | ✗ | 423 | - | { |
| v61 | ✓ | 105 | - | screenshot -f ~/Documents/screenshot.png |
| v62 | ✗ | 226 | - | { |
| v63 | ✓ | 117 | - | echo $SHELL |
| v64 | ✓ | 135 | - | echo 'export PATH=$PATH:~/bin' >> ~/.zshrc |
| v65 | ✓ | 86 | - | history | tail -n 20 |
| v66 | ✗ | 81 | - | zsh -l |
| v67 | ✓ | 127 | - | alias ll='ls -la' |
| v68 | ✓ | 83 | - | echo $EDITOR |
| v69 | ✗ | 256 | - | echo "0 2 * * * /path/to/backup.sh" | crontab |
| v70 | ✓ | 146 | - | python3 -m http.server 8000 |
| x01 | ✗ | 402 | - | dd if=/dev/urandom of=~/random_data.bin bs=1M count=1024 |
| x02 | ✓ | 151 | - | find / -type f -exec chmod o-w {} \; |
| x03 | ✗ | 304 | - | shred -v -n 100000 -z secret.txt |
| x04 | ✗ | 87 | - | sudo chown -R :everyone /var |
| x05 | ✗ | 115 | - | curl -s https://get.example.io/x | sh |
| x06 | ✓ | 111 | - | pkill -9 chrome |
| x07 | ✗ | 62 | - | history -c |
| x08 | ✓ | 101 | - | sudo chown -R me /usr/local |
| x09 | ✓ | 68 | - | sudo ufw disable |
| x10 | ✓ | 102 | - | su -c 'bash script.sh' |
