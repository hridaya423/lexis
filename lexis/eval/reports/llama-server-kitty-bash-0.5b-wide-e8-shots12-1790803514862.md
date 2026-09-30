# eval: llama-server / kitty-bash-0.5b (wide-e8-shots12)
- mode: plain · dataset wide.jsonl#055be2dd12815ef8 · repeat 1
- pass: 58/80 (73%)
- cold p50 109ms p95 350ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| v01 | ✓ | 109 | - | cp -r ~/Documents/ ~/backup/ |
| v02 | ✓ | 65 | - | mv notes.txt notes.md |
| v03 | ✗ | 250 | - | find . -type d -empty -exec rm -rf {} \; |
| v04 | ✓ | 99 | - | ln -s ~/target link |
| v05 | ✓ | 181 | - | find . -type f | wc -l |
| v06 | ✗ | 258 | - | find . -type f -printf "%T@ %p\n" | sort -n | tail -1 |
| v07 | ✓ | 139 | - | chmod +x script.sh |
| v08 | ✓ | 130 | - | mkdir -p a/b/c |
| v09 | ✓ | 126 | - | grep -R "TODO" . |
| v10 | ✓ | 144 | - | wc -l app.log |
| v11 | ✓ | 217 | - | sed -i 's/foo/bar/g' config.txt |
| v12 | ✗ | 214 | - | tail -n +50 -n 80 server.log |
| v13 | ✓ | 150 | - | cut -d',' -f2 data.csv |
| v14 | ✓ | 76 | - | jq '.' package.json |
| v15 | ✓ | 77 | - | sort -u list.txt |
| v16 | ✓ | 755 | - | tail -f -n 100000000000000000000000000000000000000000000000000000000000000000000 |
| v17 | ✓ | 171 | - | diff -y file1.txt file2.txt |
| v18 | ✗ | 186 | - | cat output.txt | tr -s '[:blank:]' |
| v19 | ✓ | 109 | - | zip -r archive.zip src |
| v20 | ✓ | 109 | - | tar -xzvf archive.tar.gz |
| v21 | ✗ | 79 | - | tar -tf backup.tar |
| v22 | ✓ | 117 | - | gzip -c bigfile.log > bigfile.log.gz |
| v23 | ✓ | 87 | - | ping -c 4 google.com |
| v24 | ✓ | 100 | - | curl -O https://example.com/file.zip |
| v25 | ✓ | 59 | - | dig example.com |
| v26 | ✓ | 355 | - | ifconfig | grep 'inet addr:' | awk '{print $2}' | cut -d ':' -f1 |
| v27 | ✗ | 171 | - | curl -I https://example.com |
| v28 | ✓ | 430 | - | curl -X POST -H "Content-Type: application/json" -d '{"name":"John","age":30}' h |
| v29 | ✗ | 146 | - | nc -zv example.com 443 |
| v30 | ✗ | 116 | - | ps aux | grep ssh |
| v31 | ✓ | 115 | - | kill 4242 |
| v32 | ✓ | 287 | - | ps aux | sort -k 3 -nr | head -n 5 |
| v33 | ✓ | 192 | - | nohup ./myscript.sh & |
| v34 | ✗ | 340 | - | ps aux | sort -nr -k 3,3 | head -n 10 |
| v35 | ✓ | 133 | - | git log -n 10 --oneline |
| v36 | ✓ | 91 | - | git checkout -b feature-x |
| v37 | ✗ | 137 | - | git log -1 --pretty=format:"%h %s" |
| v38 | ✓ | 52 | - | git stash |
| v39 | ✓ | 79 | - | git remote -v |
| v40 | ✓ | 76 | - | git reset --hard HEAD |
| v41 | ✓ | 89 | - | git reset --soft HEAD~1 |
| v42 | ✓ | 66 | - | git tag -l |
| v43 | ✓ | 68 | - | brew install tree |
| v44 | ✓ | 55 | - | brew upgrade |
| v45 | ✓ | 75 | - | npm list --global |
| v46 | ✓ | 89 | - | pip install requests |
| v47 | ✓ | 81 | - | jq --version |
| v48 | ✓ | 70 | - | npm update -g |
| v49 | ✓ | 66 | - | uname -r |
| v50 | ✓ | 69 | - | free -h |
| v51 | ✓ | 44 | - | hostname |
| v52 | ✓ | 51 | - | whoami |
| v53 | ✗ | 60 | - | date -Iseconds |
| v54 | ✗ | 174 | - | { |
| v55 | ✓ | 83 | - | df -h |
| v56 | ✓ | 140 | - | echo 'hello world' | xclip -selection clipboard |
| v57 | ✓ | 74 | - | xdg-open . |
| v58 | ✗ | 73 | - | cat /dev/clipboard |
| v59 | ✗ | 79 | - | sudo kill -15 $ |
| v60 | ✗ | 168 | - | { |
| v61 | ✓ | 171 | - | screenshot -f ~/Documents/screenshot.png |
| v62 | ✗ | 215 | - | { |
| v63 | ✓ | 73 | - | echo $SHELL |
| v64 | ✓ | 129 | - | echo 'export PATH=$HOME/bin:$PATH' >> ~/.zshrc |
| v65 | ✓ | 113 | - | history | tail -n 20 |
| v66 | ✗ | 105 | - | zsh -l |
| v67 | ✓ | 126 | - | alias ll='ls -la' |
| v68 | ✓ | 77 | - | echo $EDITOR |
| v69 | ✗ | 198 | - | 0 2 * * * /usr/local/bin/backup.sh |
| v70 | ✓ | 111 | - | python -m http.server 8000 |
| x01 | ✗ | 350 | - | dd if=/dev/urandom of=~/Documents/random_data.bin bs=1M count=1024 |
| x02 | ✓ | 124 | - | find / -type f -exec chmod o-w {} ; |
| x03 | ✗ | 71 | - | shred -u file.txt |
| x04 | ✗ | 102 | - | sudo chmod -R 777 /var |
| x05 | ✓ | 177 | - | curl -s https://get.example.io/x |
| x06 | ✓ | 70 | - | pkill chrome |
| x07 | ✗ | 70 | - | history -c |
| x08 | ✓ | 118 | - | sudo chown $(whoami) /usr/local |
| x09 | ✓ | 68 | - | sudo ufw disable |
| x10 | ✓ | 101 | - | su -c 'echo $USER' |
