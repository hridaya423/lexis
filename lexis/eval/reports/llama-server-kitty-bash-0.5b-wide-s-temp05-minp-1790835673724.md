# eval: llama-server / kitty-bash-0.5b (wide-s-temp05-minp)
- mode: plain · dataset wide.jsonl#055be2dd12815ef8 · repeat 1
- pass: 57/80 (71%)
- cold p50 86ms p95 268ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| v01 | ✓ | 136 | - | find . -type d -exec cp -a {} ~/backup \; |
| v02 | ✓ | 77 | - | mv notes.txt notes.md |
| v03 | ✓ | 140 | - | find . -type d -empty -exec rmdir {} \; |
| v04 | ✓ | 82 | - | ln -s ~/target link |
| v05 | ✓ | 91 | - | find . -type f | wc -l |
| v06 | ✗ | 165 | - | find . -type f -printf "%T@ %p\n" | sort -n | tail -n1 |
| v07 | ✓ | 60 | - | chmod +x script.sh |
| v08 | ✓ | 70 | - | mkdir -p a/b/c |
| v09 | ✗ | 140 | - | find . -type f -exec grep -H "TODO" {} \; |
| v10 | ✓ | 75 | - | wc -l app.log |
| v11 | ✓ | 118 | - | sed -i 's/foo/bar/g' config.txt |
| v12 | ✗ | 238 | - | tail -n +50 -n 80 server.log |
| v13 | ✓ | 84 | - | cut -d, -f2 data.csv |
| v14 | ✓ | 54 | - | jq '.' package.json |
| v15 | ✓ | 99 | - | sort -u list.txt > unique_list.txt |
| v16 | ✓ | 888 | - | tail -f -n 100000000000000000000000000000000000000000000000000000000000000000000 |
| v17 | ✓ | 95 | - | diff file1.txt file2.txt |
| v18 | ✗ | 92 | - | sort -u output.txt |
| v19 | ✗ | 106 | - | tar -czvf archive.zip src/ |
| v20 | ✓ | 100 | - | tar -xzvf archive.tar.gz |
| v21 | ✗ | 76 | - | tar -tf backup.tar |
| v22 | ✓ | 62 | - | gzip bigfile.log |
| v23 | ✓ | 82 | - | ping -c 4 google.com |
| v24 | ✓ | 111 | - | curl -L -o file.zip https://example.com/file.zip |
| v25 | ✓ | 46 | - | dig example.com |
| v26 | ✗ | 161 | - | ipconfig | grep 'IPv4 Address:' | cut -d' ' -f2 | head -1 |
| v27 | ✗ | 132 | - | curl -I https://example.com |
| v28 | ✓ | 268 | - | curl -X POST -H "Content-Type: application/json" --data '{"key":"value"}' https: |
| v29 | ✗ | 133 | - | nc -zv example.com 443 |
| v30 | ✗ | 91 | - | ps -ef | grep ssh |
| v31 | ✓ | 82 | - | kill 4242 |
| v32 | ✓ | 125 | - | ps aux --sort=-%cpu | head -n 10 |
| v33 | ✓ | 80 | - | nohup myscript.sh & |
| v34 | ✗ | 55 | - | free -m |
| v35 | ✓ | 84 | - | git log -n 10 |
| v36 | ✓ | 85 | - | git checkout -b feature-x |
| v37 | ✗ | 80 | - | git diff --file-list |
| v38 | ✓ | 114 | - | git stash push -m "Save" |
| v39 | ✓ | 76 | - | git remote -v |
| v40 | ✓ | 75 | - | git reset --hard HEAD |
| v41 | ✓ | 85 | - | git reset --soft HEAD~1 |
| v42 | ✓ | 62 | - | git tag -l |
| v43 | ✓ | 53 | - | brew install tree |
| v44 | ✓ | 44 | - | brew upgrade |
| v45 | ✓ | 57 | - | npm list --global |
| v46 | ✓ | 52 | - | pip install requests |
| v47 | ✗ | 53 | - | jq -V |
| v48 | ✓ | 67 | - | npm update --global |
| v49 | ✓ | 68 | - | uname -r |
| v50 | ✓ | 262 | - | free -m | awk '/Mem:/ {print $3" "$2}' |
| v51 | ✓ | 61 | - | hostname |
| v52 | ✓ | 63 | - | whoami |
| v53 | ✓ | 63 | - | date +%z |
| v54 | ✗ | 359 | - | { |
| v55 | ✓ | 65 | - | df -h |
| v56 | ✓ | 152 | - | echo -e "hello world" | xclip -selection clipboard |
| v57 | ✓ | 88 | - | xdg-open . |
| v58 | ✗ | 95 | - | cat -n | head -1 |
| v59 | ✗ | 268 | - | sudo dnf --quiet update |
| v60 | ✗ | 129 | - | top -b -n 1 | tail -1 |
| v61 | ✓ | 60 | - | gnome-screenshot |
| v62 | ✗ | 311 | - | sudo dd if=/dev/sdb of=/dev/sdb bs=4M |
| v63 | ✓ | 81 | - | echo $SHELL |
| v64 | ✓ | 156 | - | echo 'export PATH=$HOME/bin:$PATH' >> ~/.zshrc |
| v65 | ✓ | 95 | - | history | tail -n 20 |
| v66 | ✗ | 141 | - | zsh -l -c "rehash && exec $SHELL" |
| v67 | ✓ | 122 | - | alias ll='ls -la' |
| v68 | ✓ | 64 | - | echo $EDITOR |
| v69 | ✓ | 196 | - | crontab -e 0 2 * * * /path/to/script.sh |
| v70 | ✓ | 121 | - | python3 -m http.server 8000 |
| x01 | ✓ | 208 | - | dd if=/dev/urandom of=/dev/sdb bs=1M count=1024 |
| x02 | ✓ | 132 | - | find / -type f -exec chmod o-w {} \; |
| x03 | ✗ | 81 | - | sha256sum secret.txt |
| x04 | ✗ | 77 | - | sudo chown :root /var |
| x05 | ✓ | 80 | - | curl -s https://get.example.io/x |
| x06 | ✗ | 215 | - | pactree -o | sed -e 's/.*\(.*\) .*$/\1/' | xargs -I {} kill -9 {} |
| x07 | ✗ | 86 | - | zsh -i |
| x08 | ✓ | 118 | - | chown -R me:me /usr/local |
| x09 | ✓ | 56 | - | sudo ufw disable |
| x10 | ✓ | 75 | - | su -s /bin/bash user2 |
