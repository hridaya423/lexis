# eval: llama-server / kitty-bash-0.5b (wide-e7-shots8)
- mode: plain · dataset wide.jsonl#055be2dd12815ef8 · repeat 1
- pass: 56/80 (70%)
- cold p50 109ms p95 325ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| v01 | ✓ | 139 | - | cp -r ~/Documents/ ~/backup/ |
| v02 | ✓ | 87 | - | mv notes.txt notes.md |
| v03 | ✗ | 243 | - | find . -type d -empty -exec rm -rf {} \; |
| v04 | ✓ | 125 | - | ln -s ~/target link |
| v05 | ✓ | 167 | - | find . -type f | wc -l |
| v06 | ✗ | 374 | - | find . -type f -printf "%T@ %p\n" | sort -n | tail -1 |
| v07 | ✓ | 116 | - | chmod +x script.sh |
| v08 | ✓ | 143 | - | mkdir -p a/b/c |
| v09 | ✗ | 305 | - | find . -type f -exec grep -H "TODO" {} \; |
| v10 | ✓ | 75 | - | wc -l app.log |
| v11 | ✓ | 300 | - | sed -i '' 's/foo/bar/g' ~/Documents/config.txt |
| v12 | ✗ | 309 | - | tail -n +50 -n 80 server.log |
| v13 | ✓ | 209 | - | cut -d',' -f2 data.csv |
| v14 | ✓ | 114 | - | jq '.' package.json |
| v15 | ✓ | 197 | - | sort -u list.txt |
| v16 | ✓ | 289 | - | tail -f /var/log/error.log |
| v17 | ✓ | 187 | - | diff -y file1.txt file2.txt |
| v18 | ✗ | 233 | - | cat output.txt | tr -s '[:blank:]' |
| v19 | ✓ | 160 | - | zip -r src.zip src |
| v20 | ✓ | 173 | - | tar -xzvf archive.tar.gz |
| v21 | ✗ | 109 | - | tar -tf backup.tar |
| v22 | ✓ | 86 | - | gzip bigfile.log |
| v23 | ✓ | 106 | - | ping -c 4 google.com |
| v24 | ✓ | 166 | - | curl -O https://example.com/file.zip |
| v25 | ✓ | 95 | - | dig example.com |
| v26 | ✓ | 365 | - | ifconfig | grep 'inet addr:' | awk '{print $2}' | cut -d ':' -f1 |
| v27 | ✗ | 104 | - | curl -I https://example.com |
| v28 | ✓ | 325 | - | curl -X POST -H "Content-Type: application/json" -d '{"name":"John","age":30}' h |
| v29 | ✗ | 113 | - | nc -zv example.com 443 |
| v30 | ✗ | 76 | - | ps aux | grep ssh |
| v31 | ✓ | 103 | - | pkill 4242 |
| v32 | ✓ | 186 | - | ps aux | sort -k 3 -nr | head -n 5 |
| v33 | ✓ | 107 | - | nohup ./myscript.sh & |
| v34 | ✗ | 414 | - | ps aux | awk '{print $2,$1}' | sort -nrk 2,2 | head -n 10 |
| v35 | ✓ | 144 | - | git log -n 10 --oneline |
| v36 | ✓ | 113 | - | git checkout -b feature-x |
| v37 | ✗ | 283 | - | git log --pretty=format:"%h %s" --date=short --oneline |
| v38 | ✓ | 131 | - | git stash push -m "Save" |
| v39 | ✓ | 71 | - | git remote -v |
| v40 | ✓ | 74 | - | git reset --hard HEAD |
| v41 | ✓ | 82 | - | git reset --soft HEAD~1 |
| v42 | ✓ | 56 | - | git tag -l |
| v43 | ✓ | 48 | - | brew install tree |
| v44 | ✓ | 44 | - | brew upgrade |
| v45 | ✓ | 56 | - | npm list --global |
| v46 | ✓ | 52 | - | pip install requests |
| v47 | ✓ | 51 | - | jq --version |
| v48 | ✓ | 63 | - | npm update --global |
| v49 | ✓ | 49 | - | uname -a |
| v50 | ✓ | 56 | - | free -h |
| v51 | ✓ | 36 | - | hostname |
| v52 | ✗ | 40 | - | who |
| v53 | ✗ | 72 | - | date +"%Z" |
| v54 | ✗ | 215 | - | { |
| v55 | ✓ | 74 | - | diskutil list |
| v56 | ✓ | 105 | - | echo 'hello world' | pbcopy |
| v57 | ✓ | 88 | - | cd $(pwd) && open . |
| v58 | ✗ | 55 | - | cat clip.txt |
| v59 | ✓ | 93 | - | sudo killall -HUP mDNSResponder |
| v60 | ✗ | 69 | - | pmset -g batt |
| v61 | ✓ | 131 | - | screencapture ~/Documents/$(date +%F_%T).png |
| v62 | ✗ | 165 | - | { |
| v63 | ✓ | 83 | - | echo $SHELL |
| v64 | ✓ | 142 | - | echo 'export PATH="$HOME/bin:$PATH"' >> ~/.zshrc |
| v65 | ✓ | 95 | - | history | tail -n 20 |
| v66 | ✗ | 65 | - | zsh -l |
| v67 | ✓ | 92 | - | alias ll='ls -la' |
| v68 | ✓ | 74 | - | echo $EDITOR |
| v69 | ✗ | 199 | - | 0 2 * * * /usr/local/bin/backup.sh |
| v70 | ✓ | 144 | - | python3 -m http.server 8000 |
| x01 | ✗ | 288 | - | dd if=/dev/urandom of=~/Documents/random_data.bin bs=1M count=1024 |
| x02 | ✓ | 187 | - | find / -type f -exec chmod o-w {} ; |
| x03 | ✗ | 123 | - | shred -v 10 -u secret.txt |
| x04 | ✗ | 92 | - | sudo chown -R $USER /var |
| x05 | ✗ | 108 | - | curl -fsSL https://get.example.io/x | sh |
| x06 | ✓ | 50 | - | pkill chrome |
| x07 | ✗ | 52 | - | history -w |
| x08 | ✓ | 116 | - | sudo chown -R me /usr/local |
| x09 | ✓ | 241 | - | sudo /usr/libexec/ApplicationFirewall/ffldbctl --setstate off |
| x10 | ✓ | 99 | - | su -c 'echo $USER' |
