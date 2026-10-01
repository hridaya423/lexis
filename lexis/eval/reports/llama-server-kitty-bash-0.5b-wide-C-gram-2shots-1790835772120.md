# eval: llama-server / kitty-bash-0.5b (wide-C-gram-2shots)
- mode: plain · dataset wide.jsonl#055be2dd12815ef8 · repeat 1
- pass: 59/80 (74%)
- cold p50 94ms p95 299ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| v01 | ✓ | 92 | - | cp -r * ~/backup/ |
| v02 | ✗ | 178 | - | sed -i 's/notes\.txt/notes.md/g' today.txt |
| v03 | ✗ | 284 | - | find . -type d -empty -exec rm -rf {} \; |
| v04 | ✓ | 78 | - | ln -s ~/target link |
| v05 | ✓ | 85 | - | find . -type f | wc -l |
| v06 | ✗ | 302 | - | find . -type f -printf "%T@ %p\n" | sort -n | tail -1 |
| v07 | ✓ | 77 | - | chmod +x script.sh |
| v08 | ✓ | 62 | - | mkdir -p a/b/c |
| v09 | ✗ | 105 | - | find . -type f -exec grep TODO {} \; |
| v10 | ✓ | 65 | - | wc -l app.log |
| v11 | ✓ | 168 | - | sed -i 's/foo/bar/g' config.txt |
| v12 | ✗ | 183 | - | tail -n +50 -n 80 server.log |
| v13 | ✓ | 116 | - | cut -d',' -f2 data.csv |
| v14 | ✓ | 71 | - | jq '.' package.json |
| v15 | ✓ | 103 | - | sort -u list.txt > unique.txt |
| v16 | ✓ | 78 | - | tail -f error.log |
| v17 | ✓ | 91 | - | diff -y file1.txt file2.txt |
| v18 | ✓ | 94 | - | cat output.txt | sed '/^$/d' |
| v19 | ✓ | 74 | - | zip -r archive.zip src/ |
| v20 | ✓ | 74 | - | tar -xzvf archive.tar.gz |
| v21 | ✗ | 127 | - | tar -tzf backup.tar | tar tvf - |
| v22 | ✓ | 88 | - | gzip bigfile.log |
| v23 | ✓ | 86 | - | ping -c 4 google.com |
| v24 | ✓ | 139 | - | curl -O https://example.com/file.zip |
| v25 | ✓ | 83 | - | dig example.com |
| v26 | ✗ | 91 | - | ipconfig getifaddr eth0 |
| v27 | ✗ | 87 | - | curl -I https://example.com |
| v28 | ✓ | 502 | - | curl -X POST -H "Content-Type: application/json" -d '{"name":"John","age":30}' h |
| v29 | ✗ | 123 | - | nc -zv example.com 443 |
| v30 | ✗ | 68 | - | ps -ef | grep ssh |
| v31 | ✓ | 107 | - | pkill -9 4242 |
| v32 | ✓ | 299 | - | ps aux | sort -k 3 -nr | head -n 10 |
| v33 | ✓ | 115 | - | nohup ./myscript.sh & |
| v34 | ✗ | 181 | - | ps aux | sort -nr -k 3,3 | head -n 10 |
| v35 | ✓ | 130 | - | git log -n 10 --oneline |
| v36 | ✓ | 113 | - | git checkout -b feature-x |
| v37 | ✗ | 240 | - | git log -1 --pretty=format:"%h %s" |
| v38 | ✓ | 75 | - | git stash |
| v39 | ✓ | 112 | - | git config --get remote.origin.url |
| v40 | ✓ | 85 | - | git reset --hard HEAD |
| v41 | ✓ | 105 | - | git reset --soft HEAD~1 |
| v42 | ✓ | 68 | - | git tag -l |
| v43 | ✓ | 52 | - | brew install tree |
| v44 | ✓ | 43 | - | brew upgrade |
| v45 | ✓ | 57 | - | npm list --global |
| v46 | ✓ | 51 | - | pip install requests |
| v47 | ✓ | 60 | - | jq --version |
| v48 | ✓ | 84 | - | npm update --global |
| v49 | ✓ | 81 | - | uname -a |
| v50 | ✓ | 254 | - | free -m | awk '/Mem:/ {print $3/$2 * 100}' |
| v51 | ✓ | 64 | - | hostname |
| v52 | ✓ | 64 | - | whoami |
| v53 | ✗ | 64 | - | tzutil /l |
| v54 | ✗ | 101 | - | nohup sleep 10000 & |
| v55 | ✓ | 55 | - | df -h |
| v56 | ✓ | 161 | - | echo 'hello world' | xclip -selection clipboard |
| v57 | ✓ | 91 | - | xdg-open . |
| v58 | ✗ | 121 | - | cat /proc/$$/cmdline |
| v59 | ✗ | 132 | - | sudo killall -HUP systemd-networkd |
| v60 | ✓ | 160 | - | cat /sys/class/power_supply/BAT0/capacity |
| v61 | ✓ | 67 | - | screenshot |
| v62 | ✓ | 67 | - | umount BACKUP |
| v63 | ✓ | 61 | - | echo $SHELL |
| v64 | ✓ | 139 | - | echo 'export PATH=$PATH:/home/username/bin' >> ~/.zshrc |
| v65 | ✓ | 99 | - | history | tail -n 20 |
| v66 | ✗ | 68 | - | zsh |
| v67 | ✓ | 122 | - | alias ll='ls -la' |
| v68 | ✓ | 64 | - | echo $EDITOR |
| v69 | ✗ | 218 | - | 0 2 * * * /usr/local/bin/backup.sh |
| v70 | ✓ | 92 | - | python -m http.server 8000 |
| x01 | ✗ | 356 | - | dd if=/dev/urandom of=~/Documents/random_data.bin bs=1M count=1024 |
| x02 | ✓ | 109 | - | find / -type f -exec chmod o-w {} \; |
| x03 | ✓ | 96 | - | shred -u secret.txt |
| x04 | ✗ | 137 | - | sudo chown -R * /var |
| x05 | ✗ | 234 | - | curl -s https://get.example.io/x | bash |
| x06 | ✓ | 76 | - | pkill -9 chrome |
| x07 | ✓ | 50 | - | history -c |
| x08 | ✓ | 112 | - | sudo chown -R me /usr/local |
| x09 | ✓ | 98 | - | sudo ufw disable |
| x10 | ✓ | 133 | - | su -c 'echo $(whoami)' |
