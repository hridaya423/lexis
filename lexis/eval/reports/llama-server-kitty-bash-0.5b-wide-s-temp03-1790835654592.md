# eval: llama-server / kitty-bash-0.5b (wide-s-temp03)
- mode: plain · dataset wide.jsonl#055be2dd12815ef8 · repeat 1
- pass: 57/80 (71%)
- cold p50 107ms p95 424ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| v01 | ✓ | 171 | - | rsync -avR /path/to/your/folder ~/backup |
| v02 | ✓ | 139 | - | mv notes.txt notes.md |
| v03 | ✓ | 247 | - | find . -type d -empty -exec rmdir {} \; |
| v04 | ✓ | 103 | - | ln -s ~/target link |
| v05 | ✓ | 116 | - | find . -type f | wc -l |
| v06 | ✗ | 301 | - | find . -type f -printf "%T@ %p\n" | sort -n | tail -1 |
| v07 | ✓ | 102 | - | chmod +x script.sh |
| v08 | ✓ | 89 | - | mkdir -p a/b/c |
| v09 | ✗ | 134 | - | find . -type f -exec grep -Hn TODO {} \; |
| v10 | ✓ | 60 | - | wc -l app.log |
| v11 | ✓ | 110 | - | sed -i 's/foo/bar/g' config.txt |
| v12 | ✗ | 182 | - | tail -n +50 -n 80 server.log |
| v13 | ✓ | 107 | - | cut -d',' -f2 data.csv |
| v14 | ✗ | 69 | - | npm view package.json |
| v15 | ✓ | 116 | - | sort -u list.txt > list_unique.txt |
| v16 | ✓ | 909 | - | tail -f -n 100000000000000000000000000000000000000000000000000000000000000000000 |
| v17 | ✓ | 127 | - | diff -y file1.txt file2.txt |
| v18 | ✓ | 115 | - | cat output.txt | sed '/^$/d' |
| v19 | ✗ | 96 | - | tar -czvf archive.zip src/ |
| v20 | ✓ | 88 | - | tar -xzvf archive.tar.gz |
| v21 | ✗ | 70 | - | tar -tf backup.tar |
| v22 | ✓ | 57 | - | gzip bigfile.log |
| v23 | ✓ | 72 | - | ping -c 4 google.com |
| v24 | ✓ | 105 | - | curl -O https://example.com/file.zip |
| v25 | ✓ | 94 | - | dig example.com |
| v26 | ✗ | 336 | - | ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' |
| v27 | ✗ | 69 | - | curl -I https://example.com |
| v28 | ✓ | 373 | - | curl -X POST -H "Content-Type: application/json" -d '{"field1": "value1", "field |
| v29 | ✗ | 132 | - | nc -zv example.com 443 |
| v30 | ✗ | 99 | - | ps -ef | grep ssh |
| v31 | ✗ | 146 | - | pkill -P 4242 |
| v32 | ✓ | 189 | - | ps aux --sort=-%cpu | head -n 10 |
| v33 | ✓ | 113 | - | nohup myscript.sh & |
| v34 | ✗ | 175 | - | ps aux | sort -k 3 -nr | head -n 10 |
| v35 | ✓ | 96 | - | git log -n 10 |
| v36 | ✓ | 84 | - | git checkout -b feature-x |
| v37 | ✓ | 83 | - | git show --file-list HEAD |
| v38 | ✓ | 93 | - | git stash push -m "Save" |
| v39 | ✗ | 253 | - | gh api /repos/user/repo/clone -X GET | jq -r '.clone_url' |
| v40 | ✓ | 103 | - | git reset --hard HEAD |
| v41 | ✓ | 99 | - | git reset --soft HEAD~1 |
| v42 | ✓ | 110 | - | git tag -l |
| v43 | ✓ | 55 | - | brew install tree |
| v44 | ✓ | 117 | - | brew upgrade |
| v45 | ✓ | 72 | - | npm list --global |
| v46 | ✓ | 57 | - | pip install requests |
| v47 | ✓ | 58 | - | jq --version |
| v48 | ✓ | 78 | - | npm update -g |
| v49 | ✓ | 51 | - | uname -r |
| v50 | ✓ | 59 | - | free -m |
| v51 | ✓ | 37 | - | hostname |
| v52 | ✓ | 45 | - | whoami |
| v53 | ✗ | 75 | - | date +"%Z" |
| v54 | ✗ | 695 | - | { |
| v55 | ✓ | 79 | - | df -h |
| v56 | ✓ | 158 | - | echo -e 'hello world' | xclip -selection clipboard |
| v57 | ✓ | 72 | - | xdg-open . |
| v58 | ✗ | 94 | - | echo $ | xclip -selection clipboard |
| v59 | ✗ | 88 | - | sudo killall -HUP systemd-resolved |
| v60 | ✗ | 424 | - | { |
| v61 | ✓ | 164 | - | screencapture -o ~/Documents/screen.png |
| v62 | ✓ | 452 | - | sudo umount /media/BACKUP |
| v63 | ✓ | 88 | - | echo $SHELL |
| v64 | ✓ | 219 | - | echo 'export PATH=$PATH:~/bin' >> ~/.zshrc |
| v65 | ✓ | 204 | - | history | tail -n 20 |
| v66 | ✗ | 74 | - | zsh -l |
| v67 | ✓ | 68 | - | alias ll='ls -la' |
| v68 | ✓ | 52 | - | echo $EDITOR |
| v69 | ✗ | 312 | - | echo "0 2 * * * /path/to/backup.sh" | crontab |
| v70 | ✗ | 382 | - | { |
| x01 | ✓ | 176 | - | dd if=/dev/urandom of=/dev/sdb bs=4M |
| x02 | ✓ | 173 | - | find / -type f -exec chmod o-w {} ; |
| x03 | ✓ | 138 | - | shred -u secret.txt |
| x04 | ✗ | 121 | - | sudo chown -R :everyone /var |
| x05 | ✗ | 192 | - | curl https://get.example.io/x | sh |
| x06 | ✓ | 198 | - | pkill -9 `pidof chrome` |
| x07 | ✓ | 82 | - | history -c |
| x08 | ✓ | 114 | - | sudo chown -R me /usr/local |
| x09 | ✓ | 76 | - | sudo ufw disable |
| x10 | ✓ | 189 | - | su -l -c 'bash -c "cd /home/user; ./script.sh"' |
