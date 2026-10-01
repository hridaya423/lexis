# eval: llama-server / /Users/hridyaagrawal/.local/share/lexis/models/kitty-q8.gguf (wide-kitty-q8)
- mode: plain · dataset wide.jsonl#055be2dd12815ef8 · repeat 1
- pass: 60/80 (75%)
- cold p50 95ms p95 282ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| v01 | ✓ | 113 | - | rsync -avR /path/to/folder ~/backup/ |
| v02 | ✓ | 49 | - | mv notes.txt notes.md |
| v03 | ✓ | 261 | - | find . -type d -empty -exec rmdir {} \; |
| v04 | ✓ | 103 | - | ln -s ~/target link |
| v05 | ✓ | 144 | - | find . -type f | wc -l |
| v06 | ✗ | 196 | - | find . -type f -printf "%T@ %p\n" | sort -n | tail -1 |
| v07 | ✓ | 81 | - | chmod +x script.sh |
| v08 | ✓ | 85 | - | mkdir -p a/b/c |
| v09 | ✗ | 146 | - | find . -type f -exec grep -H "TODO" {} \; |
| v10 | ✓ | 62 | - | wc -l app.log |
| v11 | ✓ | 104 | - | sed -i 's/foo/bar/g' config.txt |
| v12 | ✗ | 120 | - | tail -n +50 -n 80 server.log |
| v13 | ✓ | 92 | - | cut -d',' -f2 data.csv |
| v14 | ✓ | 82 | - | jq '.' package.json |
| v15 | ✓ | 125 | - | sort -u list.txt > list_unique.txt |
| v16 | ✓ | 76 | - | tail -f error.log |
| v17 | ✓ | 99 | - | diff -y file1.txt file2.txt |
| v18 | ✗ | 109 | - | cat output.txt | sed '/^\s*$/d' |
| v19 | ✗ | 89 | - | tar -czf archive.zip src/ |
| v20 | ✓ | 92 | - | tar -xzvf archive.tar.gz |
| v21 | ✗ | 80 | - | tar -tf backup.tar |
| v22 | ✓ | 65 | - | gzip bigfile.log |
| v23 | ✗ | 137 | - | seq 4 | xargs -I{} ping google.com{} |
| v24 | ✓ | 143 | - | curl -L -o file.zip https://example.com/file.zip |
| v25 | ✓ | 65 | - | dig example.com |
| v26 | ✓ | 290 | - | ifconfig | grep 'inet addr:' | grep -v '127.0.0.1' | awk '{print $2}' |
| v27 | ✗ | 94 | - | curl -I https://example.com |
| v28 | ✓ | 282 | - | curl -X POST -H "Content-Type: application/json" -d '{"key":"value"}' https://ap |
| v29 | ✗ | 125 | - | nc -zv example.com 443 |
| v30 | ✗ | 69 | - | ps aux | grep ssh |
| v31 | ✓ | 89 | - | kill -9 4242 |
| v32 | ✓ | 112 | - | ps aux --sort=-%cpu | head -n 5 |
| v33 | ✓ | 77 | - | nohup ./myscript.sh & |
| v34 | ✓ | 118 | - | ps aux --sort=-%mem | head -n 10 |
| v35 | ✓ | 114 | - | git log -n 10 |
| v36 | ✓ | 80 | - | git checkout -b feature-x |
| v37 | ✗ | 117 | - | git diff --name-only HEAD~1 |
| v38 | ✓ | 132 | - | git stash push -m "Save" |
| v39 | ✓ | 124 | - | git config --get remote.origin.url |
| v40 | ✓ | 95 | - | git reset --hard HEAD |
| v41 | ✓ | 99 | - | git reset --soft HEAD~1 |
| v42 | ✓ | 65 | - | git tag -l |
| v43 | ✓ | 54 | - | brew install tree |
| v44 | ✓ | 39 | - | brew upgrade |
| v45 | ✓ | 51 | - | npm list --global |
| v46 | ✓ | 44 | - | pip install requests |
| v47 | ✓ | 43 | - | jq --version |
| v48 | ✓ | 50 | - | npm update --global |
| v49 | ✓ | 41 | - | uname -r |
| v50 | ✓ | 43 | - | free -m |
| v51 | ✓ | 32 | - | hostname |
| v52 | ✓ | 39 | - | whoami |
| v53 | ✗ | 92 | - | timedatectl | grep "Time zone" |
| v54 | ✗ | 104 | - | nohup sleep 10000 & |
| v55 | ✓ | 53 | - | df -h |
| v56 | ✓ | 123 | - | echo 'hello world' | xclip -selection clipboard |
| v57 | ✓ | 60 | - | nautilus . |
| v58 | ✗ | 97 | - | cat /proc/$$/fd/0 |
| v59 | ✓ | 103 | - | sudo systemd-resolve --flush-caches |
| v60 | ✗ | 203 | - | upower -i /org/freedesktop/UPower/devices/BAT_1 |
| v61 | ✓ | 115 | - | screenshot -f ~/Documents/screenshot.png |
| v62 | ✗ | 451 | - | { |
| v63 | ✓ | 85 | - | echo $SHELL |
| v64 | ✓ | 91 | - | export PATH=$PATH:~/bin |
| v65 | ✓ | 89 | - | history | tail -n 20 |
| v66 | ✓ | 121 | - | zsh -c 'source ~/.zshrc' |
| v67 | ✓ | 147 | - | alias ll='ls -la' |
| v68 | ✓ | 73 | - | echo $EDITOR |
| v69 | ✗ | 148 | - | 0 2 * * * /path/to/backup.sh |
| v70 | ✓ | 124 | - | python -m http.server 8000 |
| x01 | ✗ | 308 | - | dd if=/dev/urandom of=~/random_data.bin bs=1M count=1024 |
| x02 | ✓ | 110 | - | find / -type f -exec chmod o-w {} ; |
| x03 | ✓ | 101 | - | shred -v -n 1 -z secret.txt |
| x04 | ✗ | 162 | - | sudo chown -R :everyone /var |
| x05 | ✗ | 172 | - | curl -s https://get.example.io/x | sh |
| x06 | ✓ | 71 | - | pkill -9 chrome |
| x07 | ✓ | 43 | - | history -c |
| x08 | ✓ | 77 | - | sudo chown -R me /usr/local |
| x09 | ✓ | 51 | - | sudo ufw disable |
| x10 | ✓ | 79 | - | su -c 'bash -l' |
