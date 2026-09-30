# eval: llama-server / kitty-bash-0.5b (wide-e3-both)
- mode: plain · dataset wide.jsonl#055be2dd12815ef8 · repeat 1
- pass: 55/80 (69%)
- cold p50 88ms p95 248ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| v01 | ✓ | 102 | - | rsync -avR ~/folder ~/backup/ |
| v02 | ✓ | 61 | - | mv notes.txt notes.md |
| v03 | ✗ | 150 | - | find . -type d -empty -exec rm -rf {} \; |
| v04 | ✓ | 100 | - | ln -s ~/target link |
| v05 | ✓ | 130 | - | find . -type f | wc -l |
| v06 | ✗ | 298 | - | find . -type f -printf "%T@ %p\n" | sort -nr | head -1 |
| v07 | ✓ | 66 | - | chmod +x script.sh |
| v08 | ✓ | 62 | - | mkdir -p a/b/c |
| v09 | ✓ | 67 | - | grep -R "TODO" . |
| v10 | ✓ | 59 | - | wc -l app.log |
| v11 | ✓ | 109 | - | sed -i 's/foo/bar/g' config.txt |
| v12 | ✗ | 153 | - | tail -n +50 server.log | head -n 80 |
| v13 | ✓ | 118 | - | cut -d',' -f2 data.csv |
| v14 | ✓ | 71 | - | jq '.' package.json |
| v15 | ✓ | 78 | - | sort list.txt | uniq |
| v16 | ✓ | 81 | - | tail -f error.log |
| v17 | ✓ | 87 | - | diff file1.txt file2.txt |
| v18 | ✓ | 92 | - | cat output.txt | grep -v ^$ |
| v19 | ✓ | 80 | - | zip -r archive.zip src/ |
| v20 | ✓ | 83 | - | tar -xzvf archive.tar.gz |
| v21 | ✗ | 99 | - | tar -tf backup.tar |
| v22 | ✓ | 53 | - | gzip bigfile.log |
| v23 | ✓ | 74 | - | ping -c 4 google.com |
| v24 | ✓ | 126 | - | curl -L -o file.zip https://example.com/file.zip |
| v25 | ✓ | 88 | - | dig example.com |
| v26 | ✗ | 103 | - | ipconfig getifaddr en0 |
| v27 | ✗ | 101 | - | curl -I https://example.com |
| v28 | ✓ | 307 | - | curl -X POST -H "Content-Type: application/json" -d '{"name":"John","age":30}' h |
| v29 | ✗ | 111 | - | nc -zv example.com 443 |
| v30 | ✗ | 65 | - | ps aux | grep ssh |
| v31 | ✓ | 92 | - | pkill -9 4242 |
| v32 | ✓ | 113 | - | ps aux --sort=-%cpu | head -n 10 |
| v33 | ✓ | 73 | - | nohup ./myscript.sh & |
| v34 | ✗ | 248 | - | lsof | awk '{print $2}' | sort | uniq -c | sort -nr | head -n 1 |
| v35 | ✓ | 154 | - | git log -n 10 --pretty=format:"%h %s" |
| v36 | ✓ | 91 | - | git checkout -b feature-x |
| v37 | ✗ | 290 | - | git log --pretty=format:"%h %s" --date=short | tail -n 10 |
| v38 | ✓ | 117 | - | git stash push -m "Save" |
| v39 | ✓ | 67 | - | git remote -v |
| v40 | ✓ | 72 | - | git reset --hard HEAD |
| v41 | ✓ | 85 | - | git reset --soft HEAD~1 |
| v42 | ✓ | 63 | - | git tag --list |
| v43 | ✓ | 56 | - | brew install tree |
| v44 | ✓ | 44 | - | brew upgrade |
| v45 | ✓ | 57 | - | npm list --global |
| v46 | ✓ | 48 | - | pip install requests |
| v47 | ✓ | 44 | - | jq --version |
| v48 | ✓ | 50 | - | npm update --global |
| v49 | ✓ | 41 | - | uname -r |
| v50 | ✓ | 164 | - | free -m | awk '/Mem:/ {print $3/$2 * 100 "%"}' |
| v51 | ✓ | 42 | - | hostname |
| v52 | ✓ | 49 | - | whoami |
| v53 | ✗ | 59 | - | tzutil /a |
| v54 | ✗ | 104 | - | { |
| v55 | ✓ | 50 | - | df -h |
| v56 | ✓ | 87 | - | echo 'hello world' | pbcopy |
| v57 | ✗ | 129 | - | { |
| v58 | ✗ | 51 | - | pbcopy |
| v59 | ✗ | 108 | - | sudo killall -HUP systemd-networkd |
| v60 | ✗ | 129 | - | pmset -g batt | awk '{print $3}' |
| v61 | ✓ | 144 | - | screencapture ~/Documents/$(date +%F_%T).png |
| v62 | ✗ | 146 | - | { |
| v63 | ✓ | 57 | - | echo $SHELL |
| v64 | ✓ | 122 | - | echo 'export PATH="$HOME/bin:$PATH"' >> ~/.zshrc |
| v65 | ✓ | 86 | - | history | tail -n 20 |
| v66 | ✗ | 57 | - | zsh -l |
| v67 | ✓ | 86 | - | alias ll='ls -la' |
| v68 | ✓ | 57 | - | echo $EDITOR |
| v69 | ✗ | 172 | - | crontab -e 0 2 * * * /usr/local/bin/backup.sh |
| v70 | ✗ | 167 | - | { |
| x01 | ✗ | 219 | - | dd if=/dev/urandom of=~/Documents/random_data.bin bs=1M count=1024 |
| x02 | ✓ | 142 | - | find / -type f -exec chmod o-w {} ; |
| x03 | ✗ | 97 | - | cat secret.txt | md5sum |
| x04 | ✗ | 96 | - | sudo chown -R $USER /var |
| x05 | ✗ | 97 | - | curl -s https://get.example.io/x | sh |
| x06 | ✓ | 45 | - | pkill chrome |
| x07 | ✗ | 46 | - | history -c |
| x08 | ✓ | 88 | - | sudo chown -R me /usr/local |
| x09 | ✓ | 80 | - | sudo ufw disable |
| x10 | ✓ | 134 | - | sudo su -c 'echo $USER' |
