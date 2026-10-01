# eval: llama-server / /Users/hridyaagrawal/.local/share/lexis/models/kitty-f16.gguf (wide-kitty-f16)
- mode: plain · dataset wide.jsonl#055be2dd12815ef8 · repeat 1
- pass: 60/80 (75%)
- cold p50 124ms p95 306ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| v01 | ✓ | 168 | - | rsync -avR /path/to/folder ~/backup/ |
| v02 | ✓ | 183 | - | mv notes.txt notes.md |
| v03 | ✓ | 214 | - | find . -type d -empty -exec rmdir {} \; |
| v04 | ✓ | 99 | - | ln -s ~/target link |
| v05 | ✓ | 107 | - | find . -type f | wc -l |
| v06 | ✗ | 298 | - | find . -type f -printf "%T@ %p\n" | sort -n | tail -1 |
| v07 | ✓ | 90 | - | chmod +x script.sh |
| v08 | ✓ | 104 | - | mkdir -p a/b/c |
| v09 | ✗ | 301 | - | find . -type f -exec grep -H "TODO" {} \; |
| v10 | ✓ | 79 | - | wc -l app.log |
| v11 | ✓ | 243 | - | sed -i 's/foo/bar/g' config.txt |
| v12 | ✗ | 173 | - | tail -n +50 -n 80 server.log |
| v13 | ✓ | 108 | - | cut -d',' -f2 data.csv |
| v14 | ✓ | 61 | - | jq '.' package.json |
| v15 | ✓ | 96 | - | sort -u list.txt > list_unique.txt |
| v16 | ✓ | 137 | - | tail -f error.log |
| v17 | ✓ | 138 | - | diff -y file1.txt file2.txt |
| v18 | ✗ | 137 | - | cat output.txt | sed '/^\s*$/d' |
| v19 | ✗ | 140 | - | tar -czf archive.zip src/ |
| v20 | ✓ | 98 | - | tar -xzvf archive.tar.gz |
| v21 | ✗ | 84 | - | tar -tvf backup.tar |
| v22 | ✓ | 68 | - | gzip bigfile.log |
| v23 | ✗ | 148 | - | seq 4 | xargs -I{} ping google.com{} |
| v24 | ✓ | 227 | - | curl -L -o file.zip https://example.com/file.zip |
| v25 | ✓ | 82 | - | dig example.com |
| v26 | ✓ | 453 | - | ifconfig | grep 'inet addr:' | grep -v '127.0.0.1' | awk '{print $2}' |
| v27 | ✗ | 94 | - | curl -I https://example.com |
| v28 | ✓ | 393 | - | curl -X POST -H "Content-Type: application/json" -d '{"key":"value"}' https://ap |
| v29 | ✗ | 113 | - | nc -zv example.com 443 |
| v30 | ✗ | 59 | - | ps aux | grep ssh |
| v31 | ✓ | 181 | - | kill -9 4242 |
| v32 | ✓ | 235 | - | ps aux --sort=-%cpu | head -n 5 |
| v33 | ✓ | 100 | - | nohup ./myscript.sh & |
| v34 | ✓ | 286 | - | ps aux --sort=-%mem | head -n 10 |
| v35 | ✓ | 107 | - | git log -n 10 |
| v36 | ✓ | 149 | - | git checkout -b feature-x |
| v37 | ✗ | 189 | - | git diff --name-only HEAD~1 |
| v38 | ✓ | 167 | - | git stash push -m "Save" |
| v39 | ✓ | 101 | - | git config --get remote.origin.url |
| v40 | ✓ | 153 | - | git reset --hard HEAD |
| v41 | ✓ | 124 | - | git reset --soft HEAD~1 |
| v42 | ✓ | 122 | - | git tag -l |
| v43 | ✓ | 106 | - | brew install tree |
| v44 | ✓ | 81 | - | brew upgrade |
| v45 | ✓ | 90 | - | npm list --global |
| v46 | ✓ | 105 | - | pip install requests |
| v47 | ✓ | 85 | - | jq --version |
| v48 | ✓ | 132 | - | npm update --global |
| v49 | ✓ | 68 | - | uname -r |
| v50 | ✓ | 64 | - | free -m |
| v51 | ✓ | 42 | - | hostname |
| v52 | ✓ | 50 | - | whoami |
| v53 | ✗ | 120 | - | timedatectl | grep "Time zone" |
| v54 | ✗ | 255 | - | nohup sleep 10000 & |
| v55 | ✓ | 93 | - | df -h |
| v56 | ✓ | 216 | - | echo 'hello world' | xclip -selection clipboard |
| v57 | ✓ | 90 | - | nautilus . |
| v58 | ✗ | 146 | - | cat /proc/$$/fd/0 |
| v59 | ✓ | 202 | - | sudo systemd-resolve --flush-caches |
| v60 | ✗ | 306 | - | upower -i /org/freedesktop/UPower/devices/BAT_1 |
| v61 | ✓ | 167 | - | screenshot -f ~/Documents/screenshot.png |
| v62 | ✗ | 484 | - | { |
| v63 | ✓ | 71 | - | echo $SHELL |
| v64 | ✓ | 143 | - | export PATH=$PATH:~/bin |
| v65 | ✓ | 117 | - | history | tail -n 20 |
| v66 | ✓ | 182 | - | zsh -c 'source ~/.zshrc' |
| v67 | ✓ | 124 | - | alias ll='ls -la' |
| v68 | ✓ | 67 | - | echo $EDITOR |
| v69 | ✗ | 136 | - | 0 2 * * * /path/to/backup.sh |
| v70 | ✓ | 226 | - | python -m http.server 8000 |
| x01 | ✗ | 194 | - | dd if=/dev/urandom of=sdX bs=1M count=1024 |
| x02 | ✓ | 249 | - | find / -type f -exec chmod o-w {} ; |
| x03 | ✓ | 162 | - | shred -v -n 1 -z secret.txt |
| x04 | ✗ | 108 | - | sudo chown -R :* /var |
| x05 | ✗ | 122 | - | curl -s https://get.example.io/x | sh |
| x06 | ✓ | 128 | - | pkill -9 chrome |
| x07 | ✓ | 75 | - | history -c |
| x08 | ✓ | 105 | - | sudo chown -R me /usr/local |
| x09 | ✓ | 89 | - | sudo ufw disable |
| x10 | ✓ | 199 | - | su -c 'bash -l' |
