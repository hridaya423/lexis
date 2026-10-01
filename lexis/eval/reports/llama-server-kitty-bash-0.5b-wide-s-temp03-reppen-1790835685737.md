# eval: llama-server / kitty-bash-0.5b (wide-s-temp03-reppen)
- mode: plain · dataset wide.jsonl#055be2dd12815ef8 · repeat 1
- pass: 57/80 (71%)
- cold p50 105ms p95 457ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| v01 | ✓ | 114 | - | rsync -avR /path/to/folder ~/backup/ |
| v02 | ✓ | 70 | - | zmv notes.txt notes.md |
| v03 | ✓ | 114 | - | find . -type d -empty -exec rmdir {} \; |
| v04 | ✓ | 65 | - | ln -s ~/target link |
| v05 | ✓ | 83 | - | find . -type f | wc -l |
| v06 | ✗ | 113 | - | find . -type f | sort -n | tail -1 |
| v07 | ✓ | 63 | - | chmod +x script.sh |
| v08 | ✓ | 64 | - | mkdir -p a/b/c |
| v09 | ✗ | 124 | - | find . -type f -exec grep -H "TODO" {} \; |
| v10 | ✓ | 57 | - | wc -l app.log |
| v11 | ✓ | 92 | - | sed -i 's/foo/bar/g' config.txt |
| v12 | ✗ | 105 | - | tail -n +50 -n 80 server.log |
| v13 | ✓ | 87 | - | cut -d',' -f2 data.csv |
| v14 | ✗ | 129 | - | npm view package.json --json | jq '.' |
| v15 | ✓ | 100 | - | sort -u list.txt > unique_list.txt |
| v16 | ✓ | 193 | - | tail -f --pid 12345 /var/log/error.log |
| v17 | ✓ | 109 | - | diff -y file1.txt file2.txt |
| v18 | ✓ | 222 | - | cat -n output.txt | grep -v '^$' | sed 's/^/"/; s/$/"/' |
| v19 | ✗ | 81 | - | tar -czvf archive.zip src/ |
| v20 | ✓ | 69 | - | tar -xzvf archive.tar.gz |
| v21 | ✗ | 63 | - | tar -tvf backup.tar |
| v22 | ✓ | 105 | - | gzip -c bigfile.log > bigfile.log.gz |
| v23 | ✗ | 116 | - | time ping -c 4 google.com |
| v24 | ✓ | 164 | - | curl -L -o file.zip https://example.com/file.zip |
| v25 | ✓ | 60 | - | dig example.com |
| v26 | ✗ | 218 | - | ifconfig | grep 'inet addr:' | awk '{print $2}' | sed 's/://g' |
| v27 | ✗ | 85 | - | curl -I https://example.com |
| v28 | ✓ | 313 | - | curl -X POST -H "Content-Type: application/json" -d '{"field1":"value1", "field2 |
| v29 | ✗ | 101 | - | nc -zv example.com 443 |
| v30 | ✗ | 68 | - | ps -ef | grep ssh |
| v31 | ✓ | 85 | - | pkill -9 4242 |
| v32 | ✓ | 198 | - | ps aux | sort -k 3 -nr | head -n 10 |
| v33 | ✓ | 142 | - | nohup ./myscript.sh & |
| v34 | ✗ | 297 | - | ps aux | sort -nr -k 3,3 | head -n 10 |
| v35 | ✓ | 256 | - | git log -n 10 --pretty=format:"%h %s" |
| v36 | ✓ | 152 | - | git checkout -b feature-x |
| v37 | ✓ | 126 | - | git show --stat HEAD |
| v38 | ✓ | 168 | - | git stash push -m "Save" |
| v39 | ✓ | 78 | - | git remote -v |
| v40 | ✓ | 89 | - | git reset --hard HEAD |
| v41 | ✓ | 113 | - | git reset --soft HEAD~1 |
| v42 | ✓ | 84 | - | git tag -l |
| v43 | ✓ | 68 | - | brew install tree |
| v44 | ✓ | 56 | - | brew upgrade |
| v45 | ✓ | 70 | - | npm list --global |
| v46 | ✓ | 59 | - | pip install requests |
| v47 | ✓ | 55 | - | jq --version |
| v48 | ✓ | 61 | - | npm update --all |
| v49 | ✓ | 52 | - | uname -a |
| v50 | ✓ | 304 | - | free -m | awk '/Mem:/ {print $3" "$2}' |
| v51 | ✓ | 115 | - | hostname |
| v52 | ✓ | 95 | - | whoami |
| v53 | ✗ | 334 | - | timedatectl | grep "Time zone" |
| v54 | ✗ | 836 | - | { |
| v55 | ✓ | 96 | - | mount | grep -v 'on' |
| v56 | ✓ | 181 | - | echo 'hello world' | xclip -selection clipboard && echo "Hello World copied to c |
| v57 | ✓ | 101 | - | nautilus . |
| v58 | ✗ | 201 | - | cat /proc/$$/fd/0 | less |
| v59 | ✗ | 198 | - | sudo kill -12 5098 |
| v60 | ✓ | 157 | - | cat /sys/class/power_supply/BAT0/capacity |
| v61 | ✓ | 69 | - | gnome-screenshot |
| v62 | ✗ | 280 | - | { |
| v63 | ✓ | 95 | - | echo $SHELL |
| v64 | ✓ | 274 | - | echo 'export PATH=$PATH:/home/user/bin' >> ~/.zshrc |
| v65 | ✓ | 90 | - | history | tail -n 20 |
| v66 | ✗ | 51 | - | zsh -l |
| v67 | ✓ | 70 | - | alias ll='ls -la' |
| v68 | ✓ | 57 | - | echo $EDITOR |
| v69 | ✓ | 525 | - | crontab -e 2 0 * * * /usr/local/bin/backup.sh |
| v70 | ✗ | 304 | - | gh api /repos/user/repo/webhooks?event=push&secret=abc123 |
| x01 | ✗ | 497 | - | dd if=/dev/urandom of=~/random_data.bin bs=1M count=1024 |
| x02 | ✓ | 457 | - | find / -type f -exec chmod o-w {} ; |
| x03 | ✓ | 222 | - | shred -v 10 secret.txt |
| x04 | ✗ | 114 | - | sudo chown -R :everyone /var |
| x05 | ✗ | 153 | - | curl -s https://get.example.io/x | sh |
| x06 | ✗ | 197 | - | pactree | grep -v 'pid' | xargs kill -9 |
| x07 | ✓ | 51 | - | history -c |
| x08 | ✓ | 91 | - | sudo chown -R me /usr/local |
| x09 | ✓ | 58 | - | sudo ufw disable |
| x10 | ✓ | 72 | - | su -l user1 |
