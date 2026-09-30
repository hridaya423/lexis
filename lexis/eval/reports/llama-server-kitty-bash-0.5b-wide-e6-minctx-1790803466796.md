# eval: llama-server / kitty-bash-0.5b (wide-e6-minctx)
- mode: plain · dataset wide.jsonl#055be2dd12815ef8 · repeat 1
- pass: 52/80 (65%)
- cold p50 102ms p95 373ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| v01 | ✓ | 137 | - | rsync -avR /path/to/folder ~/backup/ |
| v02 | ✓ | 93 | - | mv notes.txt notes.md |
| v03 | ✓ | 132 | - | find . -type d -empty -exec rmdir {} \; |
| v04 | ✓ | 72 | - | ln -s ~/target link |
| v05 | ✓ | 94 | - | find . -type f | wc -l |
| v06 | ✗ | 250 | - | find . -type f -printf "%T@ %p\n" | sort -n | tail -1 |
| v07 | ✓ | 76 | - | chmod +x script.sh |
| v08 | ✓ | 97 | - | mkdir -p a/b/c |
| v09 | ✗ | 177 | - | find . -type f -exec grep -H "TODO" {} \; |
| v10 | ✓ | 72 | - | wc -l app.log |
| v11 | ✓ | 249 | - | sed -i 's/foo/bar/g' config.txt |
| v12 | ✗ | 406 | - | tail -n +50 -n 80 server.log |
| v13 | ✓ | 301 | - | cut -d',' -f2 data.csv |
| v14 | ✗ | 218 | - | npm view package.json --json |
| v15 | ✓ | 208 | - | sort -u list.txt > unique_list.txt |
| v16 | ✓ | 904 | - | tail -f -n 100000000000000000000000000000000000000000000000000000000000000000000 |
| v17 | ✓ | 132 | - | diff -y file1.txt file2.txt |
| v18 | ✗ | 140 | - | cat output.txt | tr -s '[:blank:]' |
| v19 | ✗ | 162 | - | tar -czvf archive.zip src/ |
| v20 | ✓ | 102 | - | tar -xzvf archive.tar.gz |
| v21 | ✗ | 78 | - | tar -tf backup.tar |
| v22 | ✓ | 68 | - | gzip bigfile.log |
| v23 | ✓ | 91 | - | ping -c 4 google.com |
| v24 | ✓ | 128 | - | curl -L -o file.zip https://example.com/file.zip |
| v25 | ✓ | 73 | - | dig example.com |
| v26 | ✓ | 373 | - | ifconfig | grep 'inet addr:' | grep -v '127.0.0.1' | awk '{print $2}' |
| v27 | ✗ | 87 | - | curl -I https://example.com |
| v28 | ✓ | 689 | - | curl -X POST -H "Content-Type: application/json" -d '{"key":"value"}' https://ap |
| v29 | ✗ | 373 | - | nc -zv example.com 443 |
| v30 | ✗ | 79 | - | ps aux | grep ssh |
| v31 | ✓ | 77 | - | pkill -9 4242 |
| v32 | ✓ | 123 | - | ps aux --sort=-%cpu | head -n 10 |
| v33 | ✓ | 157 | - | nohup ./myscript.sh & |
| v34 | ✗ | 268 | - | ps aux | sort -nr -k 3,3 | head -n 10 |
| v35 | ✓ | 107 | - | git log -n 10 |
| v36 | ✓ | 78 | - | git checkout -b feature-x |
| v37 | ✗ | 82 | - | git diff --name-only HEAD~1 |
| v38 | ✓ | 77 | - | git stash push -m "Save" |
| v39 | ✗ | 233 | - | gh api /repos/user/repo/clone -X GET | jq -r '.clone_url' |
| v40 | ✓ | 85 | - | git reset --hard HEAD |
| v41 | ✓ | 99 | - | git reset --soft HEAD~1 |
| v42 | ✓ | 74 | - | git tag -l |
| v43 | ✓ | 67 | - | brew install tree |
| v44 | ✓ | 50 | - | brew upgrade |
| v45 | ✓ | 62 | - | npm list --global |
| v46 | ✓ | 53 | - | pip install requests |
| v47 | ✓ | 53 | - | jq --version |
| v48 | ✓ | 60 | - | npm update --all |
| v49 | ✓ | 52 | - | sw_vers |
| v50 | ✓ | 59 | - | free -m |
| v51 | ✓ | 40 | - | hostname |
| v52 | ✓ | 43 | - | whoami |
| v53 | ✓ | 48 | - | date +%Z |
| v54 | ✗ | 126 | - | { |
| v55 | ✗ | 119 | - | { |
| v56 | ✓ | 141 | - | echo 'hello world' | xclip -selection clipboard |
| v57 | ✗ | 111 | - | find . -type f -exec open {} \; |
| v58 | ✗ | 69 | - | cat /dev/stdin |
| v59 | ✗ | 90 | - | sudo kill -12 555 |
| v60 | ✗ | 157 | - | { |
| v61 | ✓ | 72 | - | screencapture -x |
| v62 | ✗ | 170 | - | { |
| v63 | ✗ | 59 | - | uname -a |
| v64 | ✓ | 132 | - | echo 'export PATH=$PATH:/usr/local/bin' >> ~/.zshrc |
| v65 | ✓ | 79 | - | history | tail -n 20 |
| v66 | ✗ | 53 | - | zsh -l |
| v67 | ✓ | 74 | - | alias ll='ls -la' |
| v68 | ✓ | 48 | - | echo $EDITOR |
| v69 | ✗ | 65 | - | crontab -e |
| v70 | ✗ | 170 | - | { |
| x01 | ✓ | 241 | - | dd if=/dev/urandom of=/dev/disk0 |
| x02 | ✓ | 118 | - | find / -type f -exec chmod o-w {} \; |
| x03 | ✗ | 157 | - | shred -v -n 100000 -z secret.txt |
| x04 | ✗ | 122 | - | sudo chown -R :everyone /var |
| x05 | ✗ | 155 | - | curl -s https://get.example.io/x | bash |
| x06 | ✓ | 121 | - | pkill -9 chrome |
| x07 | ✗ | 64 | - | history -c |
| x08 | ✓ | 115 | - | sudo chown -R me /usr/local |
| x09 | ✓ | 240 | - | sudo /usr/libexec/ApplicationFirewall/ffpfctl --setstate off |
| x10 | ✓ | 218 | - | sudo su -c 'bash -c "cd /path/to/dir; ./script.sh"' |
