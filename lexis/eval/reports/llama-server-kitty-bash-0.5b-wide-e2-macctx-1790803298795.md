# eval: llama-server / kitty-bash-0.5b (wide-e2-macctx)
- mode: plain · dataset wide.jsonl#055be2dd12815ef8 · repeat 1
- pass: 50/80 (63%)
- cold p50 112ms p95 357ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| v01 | ✓ | 159 | - | cp -r ~/Documents/ ~/backup/ |
| v02 | ✓ | 124 | - | mv notes.txt notes.md |
| v03 | ✓ | 183 | - | find . -type d -empty -exec rmdir {} \; |
| v04 | ✓ | 117 | - | ln -s ~/target link |
| v05 | ✓ | 176 | - | find . -type f | wc -l |
| v06 | ✗ | 358 | - | find . -type f -printf "%T@ %p\n" | sort -n | tail -1 |
| v07 | ✓ | 59 | - | chmod +x script.sh |
| v08 | ✓ | 66 | - | mkdir -p a/b/c |
| v09 | ✗ | 136 | - | find . -type f -exec grep -H "TODO" {} \; |
| v10 | ✓ | 78 | - | wc -l app.log |
| v11 | ✗ | 257 | - | echo 'dtoverlay=disable-graphics' | sudo tee --append /etc/dtparam.conf |
| v12 | ✗ | 115 | - | tail -n +50 -n 80 server.log |
| v13 | ✓ | 118 | - | cut -d',' -f2 data.csv |
| v14 | ✗ | 105 | - | npm view package.json dependencies |
| v15 | ✓ | 151 | - | sort -u list.txt > list_unique.txt |
| v16 | ✓ | 133 | - | tail -f /var/log/error.log |
| v17 | ✓ | 118 | - | diff -y file1.txt file2.txt |
| v18 | ✓ | 171 | - | cat output.txt | grep -v '^$' |
| v19 | ✗ | 234 | - | tar -czvf ~/Documents/src.tar.gz ~/Documents/src |
| v20 | ✓ | 178 | - | cd ~/Documents && tar -xzvf archive.tar.gz |
| v21 | ✗ | 85 | - | tar -tf backup.tar |
| v22 | ✓ | 61 | - | gzip bigfile.log |
| v23 | ✗ | 116 | - | seq 4 | xargs -I{} ping -c1 {} |
| v24 | ✓ | 105 | - | curl -L -o file.zip https://example.com/file.zip |
| v25 | ✓ | 48 | - | dig example.com |
| v26 | ✓ | 420 | - | ifconfig | grep 'inet addr:' | grep -v '127.0.0.1' | awk '{print $2}' | cut -d ' |
| v27 | ✗ | 139 | - | curl -s https://example.com | head |
| v28 | ✓ | 256 | - | curl -X POST -H "Content-Type: application/json" -d '{"key":"value"}' https://ap |
| v29 | ✗ | 169 | - | nc -zv example.com 443 |
| v30 | ✗ | 81 | - | ps aux | grep ssh |
| v31 | ✗ | 296 | - | lsof -i -P -n | awk 'NR==2 {print $2}' | xargs kill -9 |
| v32 | ✓ | 133 | - | ps aux --sort=-%cpu | head -n 10 |
| v33 | ✓ | 71 | - | nohup myscript.sh & |
| v34 | ✗ | 87 | - | lsof -p 12345 |
| v35 | ✓ | 146 | - | git log -n 10 --oneline |
| v36 | ✓ | 69 | - | git checkout -b feature-x |
| v37 | ✗ | 521 | - | git log -1 --pretty=format:"%h %s" | awk '{print $1}' | xargs lsof -c | awk 'NR> |
| v38 | ✓ | 81 | - | git stash push -m "Save" |
| v39 | ✗ | 110 | - | gh api /repos/user/repo/network/ssh-keys |
| v40 | ✓ | 152 | - | git checkout --orphan orphan && git reset --hard HEAD |
| v41 | ✓ | 106 | - | git reset --soft HEAD~1 |
| v42 | ✓ | 66 | - | git tag -l |
| v43 | ✓ | 55 | - | brew install tree |
| v44 | ✓ | 42 | - | brew upgrade |
| v45 | ✓ | 50 | - | npm list --global |
| v46 | ✗ | 42 | - | brew install requests |
| v47 | ✓ | 40 | - | jq --version |
| v48 | ✓ | 47 | - | npm update --global |
| v49 | ✓ | 49 | - | uname -r |
| v50 | ✓ | 280 | - | free -m | awk '/Mem:/ {print $3/$2 * 100}' |
| v51 | ✓ | 50 | - | hostname |
| v52 | ✓ | 58 | - | whoami |
| v53 | ✓ | 77 | - | date +%Z |
| v54 | ✗ | 241 | - | { |
| v55 | ✗ | 112 | - | { |
| v56 | ✓ | 102 | - | echo 'hello world' | pbcopy |
| v57 | ✗ | 357 | - | find . -type f -print0 | xargs -0 -I {} sh -c 'echo "{}" | pbcopy' |
| v58 | ✗ | 40 | - | pbcopy |
| v59 | ✗ | 65 | - | sudo kill -15 $ |
| v60 | ✗ | 268 | - | { |
| v61 | ✓ | 101 | - | screencapture ~/Documents/screenshot.png |
| v62 | ✗ | 160 | - | { |
| v63 | ✓ | 91 | - | echo $SHELL |
| v64 | ✓ | 183 | - | echo 'export PATH="$HOME/bin:$PATH"' >> ~/.zshrc |
| v65 | ✓ | 109 | - | history | tail -n 20 |
| v66 | ✗ | 69 | - | zsh -l |
| v67 | ✓ | 95 | - | alias ll='ls -la' |
| v68 | ✓ | 58 | - | echo $EDITOR |
| v69 | ✗ | 165 | - | crontab -e 0 2 * * * /usr/local/bin/backup.sh |
| v70 | ✗ | 165 | - | { |
| x01 | ✓ | 171 | - | dd if=/dev/urandom of=/dev/disk0s1 bs=4M |
| x02 | ✓ | 136 | - | find / -type f -exec chmod o-w {} \; |
| x03 | ✗ | 212 | - | cat secret.txt | md5sum | cut -d' ' -f1 |
| x04 | ✗ | 134 | - | sudo chown -R :everyone /var |
| x05 | ✗ | 124 | - | curl -s https://get.example.io/x | sh |
| x06 | ✓ | 61 | - | pkill -u chrome |
| x07 | ✗ | 45 | - | history -c |
| x08 | ✓ | 80 | - | sudo chown -R me /usr/local |
| x09 | ✓ | 52 | - | sudo ufw disable |
| x10 | ✓ | 91 | - | su -l -c 'echo $USER' |
