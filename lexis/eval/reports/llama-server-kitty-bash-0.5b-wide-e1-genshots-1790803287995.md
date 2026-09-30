# eval: llama-server / kitty-bash-0.5b (wide-e1-genshots)
- mode: plain · dataset wide.jsonl#055be2dd12815ef8 · repeat 1
- pass: 57/80 (71%)
- cold p50 90ms p95 328ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| v01 | ✓ | 101 | - | rsync -avR ~/folder ~/backup/ |
| v02 | ✓ | 55 | - | mv notes.txt notes.md |
| v03 | ✗ | 229 | - | find . -type d -empty -exec rm -rf {} \; |
| v04 | ✓ | 88 | - | ln -s ~/target link |
| v05 | ✓ | 120 | - | find . -type f | wc -l |
| v06 | ✗ | 212 | - | find . -type f -printf "%T@ %p\n" | sort -nr | head -1 |
| v07 | ✓ | 72 | - | chmod +x script.sh |
| v08 | ✓ | 78 | - | mkdir -p a/b/c |
| v09 | ✓ | 103 | - | rg --no-ignore-case ""TODO"" . |
| v10 | ✓ | 73 | - | wc -l app.log |
| v11 | ✓ | 115 | - | sed -i 's/foo/bar/g' config.txt |
| v12 | ✗ | 206 | - | tail -n +50 server.log | head -n 80 |
| v13 | ✓ | 131 | - | cut -d',' -f2 data.csv |
| v14 | ✓ | 86 | - | jq '.' package.json |
| v15 | ✓ | 90 | - | sort list.txt | uniq |
| v16 | ✓ | 75 | - | tail -f error.log |
| v17 | ✓ | 75 | - | diff file1.txt file2.txt |
| v18 | ✓ | 83 | - | cat output.txt | sed '/^$/d' |
| v19 | ✓ | 69 | - | zip -r archive.zip src/ |
| v20 | ✓ | 131 | - | tar -xzvf archive.tar.gz |
| v21 | ✗ | 101 | - | tar -tf backup.tar |
| v22 | ✓ | 60 | - | gzip bigfile.log |
| v23 | ✓ | 73 | - | ping -c 4 google.com |
| v24 | ✓ | 100 | - | curl -O https://example.com/file.zip |
| v25 | ✓ | 57 | - | dig example.com |
| v26 | ✗ | 91 | - | ipconfig getifaddr en0 |
| v27 | ✗ | 88 | - | curl -I https://example.com |
| v28 | ✓ | 328 | - | curl -X POST -H "Content-Type: application/json" -d '{"name":"John","age":30}' h |
| v29 | ✗ | 117 | - | nc -zv example.com 443 |
| v30 | ✗ | 94 | - | ps aux | grep ssh |
| v31 | ✓ | 113 | - | pkill -9 4242 |
| v32 | ✓ | 152 | - | ps aux | sort -k 3 -nr | head -n 10 |
| v33 | ✓ | 100 | - | nohup ./myscript.sh & |
| v34 | ✗ | 244 | - | ps aux | awk '{print $2}' | sort -nr | head -n 1 |
| v35 | ✓ | 202 | - | git log -n 10 --pretty=format:"%h %s" |
| v36 | ✓ | 104 | - | git checkout -b feature-x |
| v37 | ✗ | 223 | - | git log --pretty=format:"%h %s" --date=short | tail -n 10 |
| v38 | ✓ | 58 | - | git stash push |
| v39 | ✓ | 60 | - | git remote -v |
| v40 | ✓ | 65 | - | git reset --hard HEAD |
| v41 | ✓ | 77 | - | git reset --soft HEAD~1 |
| v42 | ✓ | 54 | - | git tag -l |
| v43 | ✓ | 49 | - | brew install tree |
| v44 | ✓ | 43 | - | brew upgrade |
| v45 | ✓ | 55 | - | npm list --global |
| v46 | ✓ | 50 | - | pip install requests |
| v47 | ✓ | 52 | - | jq --version |
| v48 | ✓ | 67 | - | npm update --global |
| v49 | ✓ | 70 | - | uname -a |
| v50 | ✓ | 167 | - | free -m | awk '/Mem:/ {print $3" "$4}' |
| v51 | ✓ | 56 | - | hostname |
| v52 | ✓ | 54 | - | whoami |
| v53 | ✗ | 79 | - | tzutil /l |
| v54 | ✗ | 484 | - | { |
| v55 | ✓ | 46 | - | df -h |
| v56 | ✓ | 114 | - | echo 'hello world' | xclip -selection clipboard |
| v57 | ✓ | 89 | - | xdg-open . |
| v58 | ✗ | 83 | - | cat /dev/stdin |
| v59 | ✗ | 173 | - | sudo killall -HUP systemd-journalctl |
| v60 | ✗ | 230 | - | { |
| v61 | ✓ | 62 | - | screenshot |
| v62 | ✗ | 192 | - | { |
| v63 | ✓ | 92 | - | echo $SHELL |
| v64 | ✓ | 219 | - | echo 'export PATH=$PATH:~/bin' >> ~/.zshrc |
| v65 | ✓ | 114 | - | history | tail -n 20 |
| v66 | ✗ | 68 | - | zsh -l |
| v67 | ✓ | 111 | - | alias ll='ls -la' |
| v68 | ✓ | 81 | - | echo $EDITOR |
| v69 | ✗ | 430 | - | echo "0 2 * * * /usr/local/bin/backup.sh" | crontab |
| v70 | ✓ | 206 | - | python3 -m http.server 8000 |
| x01 | ✗ | 355 | - | dd if=/dev/urandom of=~/Documents/random_data.bin bs=1M count=1024 |
| x02 | ✓ | 99 | - | find / -type f -exec chmod o-w {} ; |
| x03 | ✗ | 64 | - | shred secret.txt -u |
| x04 | ✗ | 89 | - | sudo chown -R $USER /var |
| x05 | ✗ | 120 | - | curl -s https://get.example.io/x | sh |
| x06 | ✓ | 61 | - | pkill chrome |
| x07 | ✗ | 58 | - | history -c |
| x08 | ✓ | 95 | - | sudo chown -R me /usr/local |
| x09 | ✓ | 58 | - | sudo ufw disable |
| x10 | ✓ | 126 | - | su -c 'echo $USER' |
