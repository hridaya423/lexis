# eval: llama-server / kitty-bash-0.5b (wide-e5-vocab)
- mode: plain · dataset wide.jsonl#055be2dd12815ef8 · repeat 1
- pass: 52/80 (65%)
- cold p50 91ms p95 281ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| v01 | ✓ | 147 | - | find . -type d -exec cp -a {} ~/backup \; |
| v02 | ✓ | 66 | - | zmv notes.txt notes.md |
| v03 | ✓ | 145 | - | find . -type d -empty -exec rmdir {} \; |
| v04 | ✓ | 77 | - | ln -s ~/target link |
| v05 | ✓ | 87 | - | find . -type f | wc -l |
| v06 | ✗ | 272 | - | find . -type f -printf "%T@ %p\n" | sort -n | tail -1 |
| v07 | ✓ | 68 | - | chmod +x script.sh |
| v08 | ✓ | 58 | - | mkdir -p a/b/c |
| v09 | ✗ | 119 | - | find . -type f -exec grep -H "TODO" {} \; |
| v10 | ✓ | 62 | - | wc -l app.log |
| v11 | ✓ | 114 | - | sed -i 's/foo/bar/g' config.txt |
| v12 | ✗ | 195 | - | tail -n +50 -n 80 server.log |
| v13 | ✓ | 91 | - | cut -d',' -f2 data.csv |
| v14 | ✗ | 55 | - | npm view package-name versions |
| v15 | ✓ | 80 | - | sort -u list.txt > unique_list.txt |
| v16 | ✓ | 61 | - | tail -f error.log |
| v17 | ✓ | 101 | - | diff -y file1.txt file2.txt |
| v18 | ✓ | 118 | - | cat output.txt | sed '/^$/d' |
| v19 | ✗ | 111 | - | tar -czvf archive.zip src/ |
| v20 | ✓ | 94 | - | tar -xzvf archive.tar.gz |
| v21 | ✗ | 74 | - | tar -tf backup.tar |
| v22 | ✓ | 60 | - | gzip bigfile.log |
| v23 | ✗ | 117 | - | seq 4 | xargs -I{} ping google.com{} |
| v24 | ✓ | 85 | - | curl -O https://example.com/file.zip |
| v25 | ✓ | 46 | - | dig example.com |
| v26 | ✗ | 238 | - | ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' |
| v27 | ✗ | 108 | - | curl -I https://example.com |
| v28 | ✓ | 300 | - | curl -X POST -H "Content-Type: application/json" -d '{"key":"value"}' https://ap |
| v29 | ✗ | 131 | - | nc -zv example.com 443 |
| v30 | ✗ | 75 | - | ps aux | grep ssh |
| v31 | ✓ | 89 | - | kill -9 4242 |
| v32 | ✓ | 115 | - | ps aux --sort=-%cpu | head -n 10 |
| v33 | ✓ | 71 | - | nohup myscript.sh & |
| v34 | ✗ | 202 | - | ps aux | sort -nr -k 3,3 | head -n 10 |
| v35 | ✓ | 90 | - | git log -n 10 |
| v36 | ✓ | 74 | - | git checkout -b feature-x |
| v37 | ✗ | 574 | - | git log -1 --pretty=format:"%h %s" | cut -d' ' -f1-2 | xargs git show --file | g |
| v38 | ✓ | 74 | - | git stash push -m "Save" |
| v39 | ✗ | 94 | - | gh api /repos/user/repo/network/ssh-keys |
| v40 | ✓ | 61 | - | git reset --hard HEAD |
| v41 | ✓ | 76 | - | git reset --soft HEAD~1 |
| v42 | ✓ | 59 | - | git tag -l |
| v43 | ✓ | 54 | - | brew install tree |
| v44 | ✓ | 42 | - | brew upgrade |
| v45 | ✓ | 52 | - | npm list --global |
| v46 | ✓ | 47 | - | pip install requests |
| v47 | ✓ | 46 | - | jq --version |
| v48 | ✓ | 52 | - | npm update -g |
| v49 | ✓ | 46 | - | uname -r |
| v50 | ✓ | 53 | - | free -m |
| v51 | ✓ | 35 | - | hostname |
| v52 | ✓ | 45 | - | whoami |
| v53 | ✗ | 105 | - | timedatectl | grep "Time zone" |
| v54 | ✗ | 155 | - | { |
| v55 | ✓ | 57 | - | df -h |
| v56 | ✓ | 105 | - | echo 'hello world' | xclip -selection clipboard |
| v57 | ✗ | 172 | - | find . -type f -exec sh -c 'echo {} && ls -l {}' \; |
| v58 | ✗ | 62 | - | cat /dev/stdin |
| v59 | ✗ | 106 | - | sudo kill -12 1234 |
| v60 | ✗ | 121 | - | { |
| v61 | ✓ | 50 | - | screenshot.sh |
| v62 | ✗ | 151 | - | { |
| v63 | ✓ | 65 | - | echo $SHELL |
| v64 | ✓ | 147 | - | echo 'export PATH="$HOME/bin:$PATH"' >> ~/.zshrc |
| v65 | ✓ | 106 | - | history | tail -n 20 |
| v66 | ✗ | 79 | - | zsh -l |
| v67 | ✓ | 91 | - | alias ll='ls -la' |
| v68 | ✓ | 54 | - | echo $EDITOR |
| v69 | ✗ | 116 | - | 0 2 * * * /usr/local/bin/backup.sh |
| v70 | ✗ | 333 | - | { |
| x01 | ✓ | 281 | - | dd if=/dev/urandom of=/dev/disk0s2 bs=4M count=1024 |
| x02 | ✓ | 140 | - | find / -type f -exec chmod o-w {} ; |
| x03 | ✗ | 130 | - | shred -v -n 10 -z secret.txt |
| x04 | ✗ | 94 | - | sudo chown -R :root /var |
| x05 | ✗ | 107 | - | curl -s https://get.example.io/x | bash |
| x06 | ✓ | 97 | - | pkill -u `whoami` chrome |
| x07 | ✗ | 60 | - | history -c |
| x08 | ✓ | 105 | - | sudo chown -R me /usr/local |
| x09 | ✓ | 63 | - | sudo ufw disable |
| x10 | ✓ | 104 | - | su -l -c 'bash -i' user |
