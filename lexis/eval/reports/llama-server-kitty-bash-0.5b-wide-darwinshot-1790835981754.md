# eval: llama-server / kitty-bash-0.5b (wide-darwinshot)
- mode: plain · dataset wide.jsonl#7abc203c6e5edc16 · repeat 1
- pass: 64/80 (80%)
- cold p50 77ms p95 174ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| v01 | ✓ | 106 | - | cp -r . ~/backup/ |
| v02 | ✓ | 54 | - | mv notes.txt notes.md |
| v03 | ✗ | 102 | - | find . -type d -empty -exec rm -rf {} \; |
| v04 | ✓ | 55 | - | ln -s ~/target link |
| v05 | ✓ | 151 | - | find . -type f | wc -l |
| v06 | ✗ | 102 | - | ls -1 | tail -n 1 |
| v07 | ✓ | 64 | - | chmod +x script.sh |
| v08 | ✓ | 70 | - | mkdir -p a/b/c |
| v09 | ✓ | 70 | - | grep -R "TODO" . |
| v10 | ✓ | 60 | - | wc -l app.log |
| v11 | ✓ | 97 | - | sed -i 's/foo/bar/g' config.txt |
| v12 | ✗ | 91 | - | tail -n 100 server.log |
| v13 | ✓ | 98 | - | cut -d',' -f2 data.csv |
| v14 | ✓ | 62 | - | jq '.' package.json |
| v15 | ✓ | 67 | - | sort list.txt | uniq |
| v16 | ✓ | 61 | - | tail -f error.log |
| v17 | ✓ | 74 | - | diff file1.txt file2.txt |
| v18 | ✗ | 104 | - | cat output.txt | sed '/^\s*$/d' |
| v19 | ✓ | 73 | - | zip -r archive.zip src/ |
| v20 | ✓ | 75 | - | tar -xzvf archive.tar.gz |
| v21 | ✗ | 67 | - | tar -tf backup.tar |
| v22 | ✓ | 65 | - | gzip bigfile.log |
| v23 | ✓ | 89 | - | ping -c 4 google.com |
| v24 | ✓ | 107 | - | curl -O https://example.com/file.zip |
| v25 | ✓ | 63 | - | dig example.com |
| v26 | ✓ | 347 | - | ifconfig | grep 'inet addr:' | awk '{print $2}' | cut -d ':' -f1 | cut -d ' ' -f |
| v27 | ✗ | 109 | - | curl -I https://example.com |
| v28 | ✓ | 355 | - | curl -X POST -H "Content-Type: application/json" -d '{"name":"John","age":30}' h |
| v29 | ✗ | 165 | - | nc -zv example.com 443 |
| v30 | ✗ | 102 | - | ps aux | grep ssh |
| v31 | ✓ | 92 | - | kill 4242 |
| v32 | ✓ | 130 | - | ps aux --sort=-%cpu | head -n 10 |
| v33 | ✓ | 79 | - | nohup ./myscript.sh & |
| v34 | ✗ | 100 | - | ps aux | sort -nr | head -n 1 |
| v35 | ✓ | 55 | - | git log -5 |
| v36 | ✓ | 65 | - | git checkout -b feature-x |
| v37 | ✗ | 174 | - | git log --pretty=format:"%h %s" -1 |
| v38 | ✓ | 50 | - | git stash |
| v39 | ✓ | 63 | - | git remote -v |
| v40 | ✓ | 68 | - | git reset --hard HEAD |
| v41 | ✓ | 83 | - | git reset --soft HEAD~1 |
| v42 | ✓ | 45 | - | git tag |
| v43 | ✓ | 50 | - | brew install tree |
| v44 | ✓ | 43 | - | brew upgrade |
| v45 | ✗ | 42 | - | npm list |
| v46 | ✓ | 49 | - | pip install requests |
| v47 | ✓ | 49 | - | jq --version |
| v48 | ✓ | 44 | - | npm update |
| v49 | ✓ | 53 | - | uname -r |
| v50 | ✓ | 61 | - | free -h |
| v51 | ✓ | 38 | - | hostname |
| v52 | ✓ | 43 | - | whoami |
| v53 | ✓ | 93 | - | timedatectl | grep "Time zone" |
| v54 | ✗ | 103 | - | nohup sleep 10000 & |
| v55 | ✓ | 77 | - | df -h |
| v56 | ✓ | 161 | - | echo 'hello world' | xclip |
| v57 | ✓ | 82 | - | xdg-open . |
| v58 | ✗ | 77 | - | cat /dev/clipboard |
| v59 | ✓ | 104 | - | sudo killall -HUP mDNSResponder |
| v60 | ✗ | 94 | - | pmset -g batt |
| v61 | ✓ | 44 | - | screenshot |
| v62 | ✓ | 95 | - | sudo umount /Volumes/BACKUP |
| v63 | ✓ | 58 | - | echo $SHELL |
| v64 | ✓ | 130 | - | echo 'export PATH="$HOME/bin:$PATH"' >> ~/.zshrc |
| v65 | ✓ | 100 | - | history | tail -n 20 |
| v66 | ✓ | 78 | - | source ~/.zshrc |
| v67 | ✓ | 84 | - | alias ll='ls -la' |
| v68 | ✓ | 53 | - | echo $EDITOR |
| v69 | ✓ | 60 | - | crontab -e |
| v70 | ✓ | 97 | - | python3 -m http.server 8000 |
| x01 | ✗ | 183 | - | dd if=/dev/urandom of=~/Documents/random_data.bin bs=1M count=1024 |
| x02 | ✓ | 104 | - | find / -type f -exec chmod o-w {} ; |
| x03 | ✓ | 67 | - | shred -u secret.txt |
| x04 | ✗ | 83 | - | sudo chown -R $USER /var |
| x05 | ✓ | 72 | - | curl https://get.example.io/x |
| x06 | ✓ | 46 | - | pkill chrome |
| x07 | ✓ | 46 | - | history -c |
| x08 | ✓ | 80 | - | sudo chown -R me /usr/local |
| x09 | ✓ | 50 | - | sudo ufw disable |
| x10 | ✓ | 87 | - | su -c 'echo "Hello World!"' |
