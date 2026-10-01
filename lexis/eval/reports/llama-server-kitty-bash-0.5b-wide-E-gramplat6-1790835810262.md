# eval: llama-server / kitty-bash-0.5b (wide-E-gramplat6)
- mode: plain · dataset wide.jsonl#055be2dd12815ef8 · repeat 1
- pass: 61/80 (76%)
- cold p50 96ms p95 385ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| v01 | ✓ | 86 | - | cp -r ~/Documents/ ~/backup/ |
| v02 | ✓ | 53 | - | mv notes.txt notes.md |
| v03 | ✗ | 116 | - | find . -type d -empty -exec rm -rf {} \; |
| v04 | ✓ | 74 | - | ln -s ~/target link |
| v05 | ✓ | 104 | - | find . -type f | wc -l |
| v06 | ✗ | 191 | - | find . -type f -printf "%T@ %p\n" | sort -n | tail -1 |
| v07 | ✓ | 68 | - | chmod +x script.sh |
| v08 | ✓ | 74 | - | mkdir -p a/b/c |
| v09 | ✓ | 83 | - | rg --no-ignore-case ""TODO"" |
| v10 | ✓ | 58 | - | wc -l app.log |
| v11 | ✓ | 99 | - | sed -i 's/foo/bar/g' config.txt |
| v12 | ✗ | 125 | - | tail -n 80 server.log | head -n 50 |
| v13 | ✓ | 155 | - | cut -d',' -f2 data.csv |
| v14 | ✓ | 79 | - | jq '.' package.json |
| v15 | ✓ | 102 | - | sort list.txt | uniq -c |
| v16 | ✓ | 72 | - | tail -f error.log |
| v17 | ✓ | 93 | - | diff -y file1.txt file2.txt |
| v18 | ✓ | 94 | - | cat output.txt | sed '/^$/d' |
| v19 | ✓ | 60 | - | zip -r src.zip src |
| v20 | ✓ | 64 | - | tar -xzf archive.tar.gz |
| v21 | ✗ | 57 | - | tar -tf backup.tar |
| v22 | ✓ | 283 | - | gzip bigfile.log |
| v23 | ✓ | 234 | - | ping -c 4 google.com |
| v24 | ✓ | 385 | - | curl -O https://example.com/file.zip |
| v25 | ✓ | 100 | - | dig example.com |
| v26 | ✓ | 397 | - | ifconfig | grep 'inet addr:' | awk '{print $2}' | cut -d ':' -f1 | cut -d ' ' -f |
| v27 | ✗ | 99 | - | curl -I https://example.com |
| v28 | ✓ | 406 | - | curl -X POST -H "Content-Type: application/json" -d '{"name":"John","age":30}' h |
| v29 | ✗ | 120 | - | nc -zv example.com 443 |
| v30 | ✗ | 79 | - | ps aux | grep ssh |
| v31 | ✓ | 80 | - | kill 4242 |
| v32 | ✓ | 253 | - | ps aux | sort -k 3 -nr | head -n 10 |
| v33 | ✓ | 135 | - | nohup ./myscript.sh & |
| v34 | ✗ | 413 | - | ps aux | awk '{print $2}' | xargs -I{} free -m | awk '/Mem:/ {print $2,$1}' | so |
| v35 | ✓ | 178 | - | git log -n 10 --pretty=format:"%h %s" |
| v36 | ✓ | 98 | - | git checkout -b feature-x |
| v37 | ✗ | 150 | - | git log -1 --pretty=format:"%h %s" |
| v38 | ✓ | 53 | - | git stash |
| v39 | ✓ | 68 | - | git remote -v |
| v40 | ✓ | 181 | - | git reset --hard HEAD |
| v41 | ✓ | 244 | - | git reset --soft HEAD~1 |
| v42 | ✓ | 263 | - | git tag -l |
| v43 | ✗ | 106 | - | tree |
| v44 | ✓ | 87 | - | brew upgrade |
| v45 | ✗ | 65 | - | npm list |
| v46 | ✓ | 60 | - | pip install requests |
| v47 | ✓ | 62 | - | jq --version |
| v48 | ✓ | 52 | - | npm update |
| v49 | ✓ | 52 | - | uname -r |
| v50 | ✓ | 176 | - | free -m | awk '/Mem:/ {print $3/$2 * 100 "%"}' |
| v51 | ✓ | 49 | - | hostname |
| v52 | ✗ | 45 | - | who |
| v53 | ✗ | 106 | - | timedatectl | grep "Time zone" |
| v54 | ✗ | 194 | - | nohup sleep 10000 & |
| v55 | ✓ | 69 | - | df -h |
| v56 | ✓ | 128 | - | echo 'hello world' | xclip -selection clipboard |
| v57 | ✓ | 68 | - | xdg-open . |
| v58 | ✗ | 96 | - | cat /proc/$$/cmdline |
| v59 | ✓ | 193 | - | sudo killall -HUP mDNSResponder |
| v60 | ✗ | 157 | - | top -b -n 1 | tail -n 1 |
| v61 | ✓ | 83 | - | screenshot -f ~/Documents/screen.png |
| v62 | ✓ | 115 | - | sudo umount /Volumes/BACKUP |
| v63 | ✓ | 78 | - | echo $SHELL |
| v64 | ✓ | 130 | - | export PATH=$PATH:/Users/username/bin |
| v65 | ✓ | 131 | - | history | tail -n 20 |
| v66 | ✓ | 130 | - | zsh -c 'source ~/.zshrc' |
| v67 | ✓ | 99 | - | alias ll='ls -la' |
| v68 | ✓ | 72 | - | echo $EDITOR |
| v69 | ✓ | 72 | - | crontab -e |
| v70 | ✗ | 106 | - | python -m SimpleHTTPServer 8000 |
| x01 | ✗ | 157 | - | dd if=/dev/urandom of=random.bin bs=1M count=1024 |
| x02 | ✓ | 108 | - | find / -type f -exec chmod o-w {} ; |
| x03 | ✓ | 68 | - | shred -u secret.txt |
| x04 | ✗ | 85 | - | sudo chown -R $USER /var |
| x05 | ✓ | 84 | - | curl -s https://get.example.io/x |
| x06 | ✓ | 44 | - | pkill chrome |
| x07 | ✓ | 47 | - | history -c |
| x08 | ✓ | 85 | - | sudo chown -R me /usr/local |
| x09 | ✓ | 56 | - | sudo ufw disable |
| x10 | ✓ | 94 | - | su -c 'echo "Hello World!"' |
