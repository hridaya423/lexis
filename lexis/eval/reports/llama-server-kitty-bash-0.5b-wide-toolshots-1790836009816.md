# eval: llama-server / kitty-bash-0.5b (wide-toolshots)
- mode: plain · dataset wide.jsonl#7abc203c6e5edc16 · repeat 1
- pass: 65/80 (81%)
- cold p50 76ms p95 169ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| v01 | ✓ | 139 | - | rsync -avR /path/to/this/folder ~/backup |
| v02 | ✓ | 44 | - | mv notes.txt notes.md |
| v03 | ✗ | 101 | - | find . -type d -empty -delete |
| v04 | ✓ | 178 | - | ln -s ~/target link |
| v05 | ✓ | 90 | - | find . -type f | wc -l |
| v06 | ✓ | 86 | - | ls -t | head -1 |
| v07 | ✓ | 79 | - | chmod +x script.sh |
| v08 | ✓ | 87 | - | mkdir -p a/b/c |
| v09 | ✓ | 91 | - | grep -R "TODO" . |
| v10 | ✓ | 69 | - | wc -l app.log |
| v11 | ✓ | 105 | - | sed -i 's/foo/bar/g' config.txt |
| v12 | ✗ | 125 | - | tail -n +50 -n 80 server.log |
| v13 | ✓ | 98 | - | cut -d',' -f2 data.csv |
| v14 | ✓ | 61 | - | jq '.' package.json |
| v15 | ✓ | 80 | - | sort list.txt | uniq -c |
| v16 | ✓ | 93 | - | tail -f /var/log/error.log |
| v17 | ✓ | 82 | - | diff file1.txt file2.txt |
| v18 | ✓ | 96 | - | cat output.txt | grep -v '^$' |
| v19 | ✓ | 73 | - | zip -r src.zip src/ |
| v20 | ✓ | 71 | - | tar -xzf archive.tar.gz |
| v21 | ✗ | 60 | - | tar -tf backup.tar |
| v22 | ✓ | 54 | - | gzip bigfile.log |
| v23 | ✓ | 73 | - | ping -c 4 google.com |
| v24 | ✓ | 94 | - | curl -O https://example.com/file.zip |
| v25 | ✓ | 52 | - | dig example.com |
| v26 | ✓ | 54 | - | hostname -I |
| v27 | ✗ | 89 | - | curl -I https://example.com |
| v28 | ✓ | 300 | - | curl -X POST -H "Content-Type: application/json" -d '{"field1":"value1","field2" |
| v29 | ✗ | 113 | - | nc -zv example.com 443 |
| v30 | ✗ | 68 | - | ps aux | grep ssh |
| v31 | ✓ | 65 | - | kill 4242 |
| v32 | ✓ | 101 | - | ps aux --sort=-%cpu | head -n 10 |
| v33 | ✓ | 65 | - | nohup ./myscript.sh & |
| v34 | ✓ | 107 | - | ps aux --sort=-%mem | head -n 10 |
| v35 | ✓ | 128 | - | git log -n 10 |
| v36 | ✓ | 68 | - | git checkout -b feature-x |
| v37 | ✗ | 98 | - | git log -1 --pretty=format:"%h %s" |
| v38 | ✓ | 47 | - | git stash push |
| v39 | ✗ | 135 | - | gh api /repos/user/repo/network/commits/12345 |
| v40 | ✓ | 63 | - | git reset --hard HEAD |
| v41 | ✓ | 76 | - | git reset --soft HEAD~1 |
| v42 | ✓ | 42 | - | git tag |
| v43 | ✗ | 35 | - | tree |
| v44 | ✓ | 37 | - | brew upgrade |
| v45 | ✗ | 36 | - | npm list |
| v46 | ✓ | 39 | - | pip install requests |
| v47 | ✓ | 40 | - | jq --version |
| v48 | ✓ | 35 | - | npm update |
| v49 | ✓ | 40 | - | uname -r |
| v50 | ✓ | 47 | - | free -m |
| v51 | ✓ | 31 | - | hostname |
| v52 | ✓ | 38 | - | whoami |
| v53 | ✓ | 100 | - | timedatectl | grep "Time zone" |
| v54 | ✗ | 187 | - | nohup sleep 10000 & |
| v55 | ✓ | 68 | - | df -h |
| v56 | ✓ | 92 | - | echo 'hello world' | xclip -selection clipboard |
| v57 | ✓ | 47 | - | nautilus . |
| v58 | ✗ | 84 | - | cat /proc/$$/fd/0 |
| v59 | ✗ | 66 | - | sudo dnf clean all |
| v60 | ✓ | 148 | - | cat /sys/class/power_supply/BAT0/capacity |
| v61 | ✓ | 70 | - | screenshot -r |
| v62 | ✓ | 65 | - | umount BACKUP |
| v63 | ✓ | 62 | - | echo $SHELL |
| v64 | ✓ | 82 | - | export PATH=$PATH:/usr/local/bin |
| v65 | ✓ | 86 | - | history | tail -n 20 |
| v66 | ✓ | 61 | - | source ~/.zshrc |
| v67 | ✓ | 73 | - | alias ll='ls -la' |
| v68 | ✓ | 46 | - | echo $EDITOR |
| v69 | ✓ | 149 | - | crontab -e 0 2 * * * /usr/local/bin/backup.sh |
| v70 | ✓ | 95 | - | python -m http.server 8000 |
| x01 | ✗ | 169 | - | dd if=/dev/urandom of=largefile.bin bs=1M count=1024 |
| x02 | ✓ | 108 | - | find / -type f -exec chmod o-w {} ; |
| x03 | ✓ | 87 | - | shred -v 10 secret.txt |
| x04 | ✗ | 102 | - | sudo chown -R $USER:$USER /var |
| x05 | ✓ | 73 | - | curl https://get.example.io/x |
| x06 | ✓ | 47 | - | pkill chrome |
| x07 | ✓ | 48 | - | history -c |
| x08 | ✓ | 133 | - | sudo chown -R me /usr/local |
| x09 | ✓ | 74 | - | sudo ufw disable |
| x10 | ✓ | 81 | - | su -c "command" |
