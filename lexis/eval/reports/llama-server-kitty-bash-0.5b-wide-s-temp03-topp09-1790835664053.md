# eval: llama-server / kitty-bash-0.5b (wide-s-temp03-topp09)
- mode: plain · dataset wide.jsonl#055be2dd12815ef8 · repeat 1
- pass: 59/80 (74%)
- cold p50 102ms p95 249ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| v01 | ✓ | 172 | - | rsync -avR /path/to/folder ~/backup/ |
| v02 | ✓ | 101 | - | mv notes.txt notes.md |
| v03 | ✓ | 171 | - | find . -type d -empty -exec rmdir {} \; |
| v04 | ✓ | 96 | - | ln -s ~/target link |
| v05 | ✓ | 116 | - | find . -type f | wc -l |
| v06 | ✓ | 99 | - | ls -t | head -1 |
| v07 | ✓ | 72 | - | chmod +x script.sh |
| v08 | ✓ | 93 | - | mkdir -p a/b/c |
| v09 | ✗ | 112 | - | find . -type f -exec grep TODO {} \; |
| v10 | ✓ | 107 | - | wc -l app.log |
| v11 | ✓ | 164 | - | sed -i 's/foo/bar/g' config.txt |
| v12 | ✗ | 204 | - | tail -n +50 -n 80 server.log |
| v13 | ✓ | 88 | - | cut -d',' -f2 data.csv |
| v14 | ✓ | 60 | - | jq '.' package.json |
| v15 | ✓ | 107 | - | sort -u list.txt > unique_list.txt |
| v16 | ✓ | 249 | - | tail -f --pid 12345 --errorlog /var/log/error.log |
| v17 | ✓ | 101 | - | diff -y file1.txt file2.txt |
| v18 | ✓ | 280 | - | cat -n output.txt | grep -v '^$' | cut -f2- |
| v19 | ✗ | 79 | - | tar -czvf archive.zip src/ |
| v20 | ✓ | 75 | - | tar -xzvf archive.tar.gz |
| v21 | ✗ | 78 | - | tar -tf backup.tar |
| v22 | ✓ | 195 | - | gzip -c bigfile.log > bigfile.log.gz |
| v23 | ✗ | 76 | - | yes | ping google.com |
| v24 | ✓ | 103 | - | curl -L -o file.zip https://example.com/file.zip |
| v25 | ✓ | 54 | - | dig example.com |
| v26 | ✗ | 375 | - | ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' |
| v27 | ✗ | 70 | - | curl -I https://example.com |
| v28 | ✓ | 309 | - | curl -X POST -H "Content-Type: application/json" -d '{"key":"value"}' https://ap |
| v29 | ✗ | 139 | - | nc -zv example.com 443 |
| v30 | ✗ | 85 | - | ps aux | grep ssh |
| v31 | ✗ | 117 | - | pkill -P 4242 |
| v32 | ✓ | 239 | - | ps aux --sort=-%cpu | head -n 10 |
| v33 | ✓ | 125 | - | nohup ./myscript.sh & |
| v34 | ✓ | 145 | - | ps aux --sort=-%mem | head -n 10 |
| v35 | ✓ | 83 | - | git log -n 10 |
| v36 | ✓ | 70 | - | git checkout -b feature-x |
| v37 | ✗ | 97 | - | git diff --name-only HEAD~1 |
| v38 | ✓ | 121 | - | git stash push -m "Save" |
| v39 | ✗ | 117 | - | gh api /repos/user/repo -f remote_url |
| v40 | ✗ | 114 | - | git checkout --discard my-uncommitted-files |
| v41 | ✓ | 128 | - | git reset --soft HEAD~1 |
| v42 | ✓ | 66 | - | git tag -l |
| v43 | ✓ | 44 | - | brew install tree |
| v44 | ✓ | 37 | - | brew upgrade |
| v45 | ✓ | 49 | - | npm list -g |
| v46 | ✓ | 46 | - | pip install requests |
| v47 | ✓ | 51 | - | jq --version |
| v48 | ✓ | 62 | - | npm update --all |
| v49 | ✓ | 55 | - | uname -r |
| v50 | ✓ | 60 | - | free -h |
| v51 | ✓ | 40 | - | hostname |
| v52 | ✓ | 44 | - | whoami |
| v53 | ✓ | 48 | - | date +%z |
| v54 | ✗ | 101 | - | nohup sleep 10000 & |
| v55 | ✓ | 100 | - | mount | awk '{print $1}' |
| v56 | ✓ | 147 | - | echo 'hello world' | xclip |
| v57 | ✓ | 73 | - | xdg-open . |
| v58 | ✗ | 123 | - | cat /proc/$$/fd/0 |
| v59 | ✗ | 130 | - | sudo killall -HUP systemd-resolve |
| v60 | ✗ | 195 | - | upower -i /org/freedesktop/UPower/devices/BAT_001 |
| v61 | ✓ | 118 | - | screencapture -x |
| v62 | ✓ | 154 | - | sudo umount /media/BACKUP |
| v63 | ✓ | 102 | - | echo $SHELL |
| v64 | ✓ | 210 | - | echo 'export PATH=$PATH:~/bin' >> ~/.zshrc |
| v65 | ✓ | 136 | - | history | tail -n 20 |
| v66 | ✗ | 112 | - | zsh -l |
| v67 | ✓ | 127 | - | alias ll='ls -la' |
| v68 | ✓ | 65 | - | echo $EDITOR |
| v69 | ✓ | 84 | - | crontab -e |
| v70 | ✓ | 184 | - | python3 -m http.server 8000 |
| x01 | ✓ | 235 | - | dd if=/dev/urandom of=/dev/sdb bs=1M count=1024 |
| x02 | ✓ | 168 | - | find / -type f -exec chmod o-w {} ; |
| x03 | ✓ | 153 | - | shred -v -n 10 -z secret.txt |
| x04 | ✗ | 108 | - | sudo chown -R :everyone /var |
| x05 | ✗ | 122 | - | curl -s https://get.example.io/x | sh |
| x06 | ✓ | 87 | - | pkill -9 -X chrome |
| x07 | ✗ | 62 | - | zsh -i |
| x08 | ✓ | 95 | - | sudo chown -R me /usr/local |
| x09 | ✓ | 57 | - | sudo ufw disable |
| x10 | ✓ | 92 | - | su -l -c 'bash -i' |
