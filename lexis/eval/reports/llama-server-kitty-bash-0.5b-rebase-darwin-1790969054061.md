# eval: llama-server / kitty-bash-0.5b (rebase-darwin)
- mode: plain · dataset holdout.jsonl#f0c25df4a12b6d3d · repeat 1
- pass: 217/715 (30%)
- cold p50 116ms p95 350ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| h-d1-001 | ✗ | 122 | - | ls ~ | xargs -I{} echo {} |
| h-d1-002 | ✓ | 264 | - | find ~/Downloads -type f -name "*.png" |
| h-d1-003 | ✗ | 273 | - | find ~/project -cmin -1 |
| h-d1-004 | ✓ | 503 | - | find ~ -size +100000000c |
| h-d1-005 | ✗ | 218 | - | file mystery.bin |
| h-d1-006 | ✗ | 102 | - | touch report.docx |
| h-d1-007 | ✗ | 83 | - | du -h ~/Library |
| h-d1-008 | ✗ | 60 | - | du -h Movies |
| h-d1-009 | ✓ | 162 | - | find ~/src -type f | wc -l |
| h-d1-010 | ✗ | 92 | - | qlscan invoice.pdf |
| h-d1-011 | ✓ | 110 | - | find . -name notes.txt |
| h-d1-012 | ✗ | 198 | - | find ~/Desktop -type f | xargs ls -lS | head -n 10 |
| h-d1-013 | ✗ | 114 | - | top -b -n 10 ~/Documents |
| h-d1-014 | ✓ | 137 | - | cp resume.pdf resume-backup.pdf |
| h-d1-015 | ✓ | 100 | - | cp -r assets/ ~/backups/ |
| h-d1-016 | ✓ | 141 | - | cp -a ~/Pictures ~/backup/ |
| h-d1-017 | ✗ | 228 | - | cp ~/Downloads/PhotoEdit.app /Volumes/USBstick/PhotoEdit.app |
| h-d1-018 | ✗ | 149 | - | git clone --recurse-submodules https://github.com/user/repo.git |
| h-d1-019 | ✓ | 90 | - | mv draft-final.txt draft-v2.txt |
| h-d1-020 | ✗ | 245 | - | find ~/project -name "*.log" | xargs -I {} mv {} ~/project/logs/{} |
| h-d1-021 | ✗ | 321 | - | find ~/Downloads -type f -iname '*.jpg' | while read f; do mv "$f" ~/album; done |
| h-d1-022 | ✓ | 407 | - | mkdir -p ~/work/2024/q4/reports && cat *.md > ~/work/2024/q4/reports/*.md |
| h-d1-023 | ✓ | 118 | - | mkdir -p ~/app/src ~/app/tests ~/app/docs |
| h-d1-024 | ✓ | 65 | - | touch NOTES.md |
| h-d1-025 | ✓ | 77 | - | touch cache.manifest |
| h-d1-026 | ✓ | 87 | - | rm ~/Downloads/output.tmp |
| h-d1-027 | ✓ | 86 | - | rm -rf ~/app/node_modules |
| h-d1-028 | ✓ | 79 | - | rm -rf ~/old-stuff |
| h-d1-029 | ✓ | 124 | - | find ~/code -name .DS_Store -exec rm {} \; |
| h-d1-030 | ✗ | 82 | - | cp config.yaml backup/ |
| h-d1-031 | ✓ | 90 | - | yes | cp -i index.html |
| h-d1-032 | ✗ | 83 | - | git rm --cached locked.txt |
| h-d1-033 | ✗ | 169 | - | rsync -av --progress fonts/ user@NAS:/home/user/fonts/ |
| h-d1-034 | ✗ | 292 | - | find ~/Downloads -type f -name "*.mov" | xargs -I{} mv {} ~/Videos/ |
| h-d1-035 | ✗ | 186 | - | find ~/scratch -name "*.tmp" -exec rm {} \; |
| h-d1-036 | ✓ | 124 | - | mv Screenshots Screenshots-2023 |
| h-d1-037 | ✓ | 216 | - | mkdir ~/paperwork/2024 && mv ~/Desktop/*.pdf ~/paperwork/2024/ |
| h-d1-038 | ✗ | 134 | - | git diff --diff-filter=AM HEAD..backup |
| h-d1-039 | ✓ | 115 | - | tar -czf ~/Desktop/project.tar.gz project/ |
| h-d1-040 | ✗ | 136 | - | tar -xzvf ~/incoming/archive.tar.gz |
| h-d1-041 | ✗ | 99 | - | tar -tf backup.tar.gz |
| h-d1-042 | ✗ | 82 | - | unzip fonts.zip |
| h-d1-043 | ✗ | 323 | - | sha256sum backup.zip | grep -q "abc123" && echo "Backup is good" || echo "Backup |
| h-d1-044 | ✗ | 105 | - | mount | grep /media |
| h-d1-045 | ✗ | 233 | - | grep -q "wp-config\.php" site-backup.tar |
| h-d1-046 | ✗ | 229 | - | du -b app.log.gz | cut -f1 |
| h-d1-047 | ✓ | 335 | - | tar -cjf logs.tar.bz2 logs/ |
| h-d1-048 | ✗ | 418 | - | tar -czf app.tar.gz -C ~/app . |
| h-d1-049 | ✓ | 273 | - | tar -xzf bundle.tar.gz README.md |
| h-d1-050 | ✓ | 104 | - | zip -r site.zip site/ |
| h-d1-051 | ✓ | 124 | - | zip -e taxes.zip taxes/ |
| h-d1-052 | ✓ | 209 | - | unzip release.zip -d ~/apps/release |
| h-d1-053 | ✓ | 190 | - | zip -r ~/Downloads/Fonts.zip ~/Downloads/Fonts |
| h-d1-054 | ✗ | 110 | - | ditto bundle.zip /tmp/ |
| h-d1-055 | ✓ | 391 | - | hdiutil create -format UDBZ -volname "Installer" -reflate 10 -reflate-lev 2 inst |
| h-d1-056 | ✗ | 315 | - | hdiutil create -o ~/Downloads/MyApp.dmg ~/Downloads/MyApp.dmg |
| h-d1-057 | ✗ | 68 | - | zcat dump.sql.gz |
| h-d1-058 | ✓ | 417 | - | hdiutil create -format UDBZ -volname "Client Files" -reflate 10 -stdinpass clien |
| h-d1-059 | ✗ | 181 | - | stat -c %A photo.jpg |
| h-d1-060 | ✗ | 249 | - | find /shared -type f -exec ls -l {} \; |
| h-d1-061 | ✗ | 76 | - | xattr installer.pkg |
| h-d1-062 | ✗ | 327 | - | defaults read /Applications/Google\ Chrome.app/Contents/SharedSupport/GoogleAppS |
| h-d1-063 | ✗ | 123 | - | stat -c %a setup.sh |
| h-d1-064 | ✗ | 64 | - | whoami |
| h-d1-065 | ✓ | 76 | - | chmod +x deploy.sh |
| h-d1-066 | ✗ | 123 | - | sudo chown -R $USER: $HOME/.ssh |
| h-d1-067 | ✗ | 83 | - | chmod 400 ~/.ssh/ |
| h-d1-068 | ✗ | 75 | - | chmod 755 ~/site |
| h-d1-069 | ✗ | 253 | - | find ~/Public -type f -exec chmod o-r {} \; |
| h-d1-070 | ✗ | 186 | - | chmod 644 ~/reports/ |
| h-d1-071 | ✗ | 198 | - | git update-index --index-file README.md --add contract.pdf |
| h-d1-072 | ✗ | 350 | - | rsync -a ~/shared alex@192.168.1.100:/home/alex/ |
| h-d1-073 | ✓ | 165 | - | sudo chown root:wheel /usr/local/bin/tool |
| h-d1-074 | ✓ | 81 | - | chgrp staff report.csv |
| h-d1-075 | ✗ | 106 | - | sudo strip --strip-all ~/Downloads/Foo.app |
| h-d1-076 | ✗ | 513 | - | find . -type f -name movie.mov -exec sh -c 'find "$1" -type f -iname ".*" -exec  |
| h-d1-077 | ✗ | 89 | - | touch -o README.md |
| h-d1-078 | ✗ | 137 | - | sudo chmod o+w /etc/hosts |
| h-d1-079 | ✗ | 59 | - | which python3 |
| h-d1-080 | ✓ | 76 | - | readlink ~/bin/node |
| h-d1-081 | ✓ | 76 | - | find ~/bin -type l |
| h-d1-082 | ✗ | 451 | - | find ~/tools -type l -exec test -e {} \; -print | xargs -I{} sh -c 'echo "{}" |  |
| h-d1-083 | ✗ | 146 | - | readlink -f $(dirname $(which java)) |
| h-d1-084 | ✗ | 180 | - | ln -s ~/dotfiles/.vimrc ~/ && echo "Vimrc symlinked" |
| h-d1-085 | ✓ | 84 | - | ln -s /opt/data ~/data |
| h-d1-086 | ✗ | 140 | - | ln -s release-2.3 release |
| h-d1-087 | ✗ | 171 | - | ln -sf $(readlink ~/bin/latest) latest |
| h-d1-088 | ✓ | 130 | - | ln -s bigfile.iso backups/bigfile.iso |
| h-d1-089 | ✓ | 81 | - | rm -f tool-beta |
| h-d1-090 | ✗ | 96 | - | rm -rf ~/public/www |
| h-d1-091 | ✗ | 212 | - | find ~/Documents -type f | xargs file | grep 'BSD' |
| h-d1-092 | ✗ | 138 | - | find ~/Documents -type f -perm -111 |
| h-d1-093 | ✗ | 192 | - | find . -iname "secret.txt" -exec sh -c 'echo {} && ls -l {}' \; |
| h-d1-094 | ✗ | 95 | - | sudo chown -R $USER ~/Library |
| h-d1-095 | ✗ | 88 | - | touch important.doc.lock |
| h-d1-096 | ✗ | 67 | - | touch -r todo.txt |
| h-d1-097 | ✗ | 346 | - | find . -type d -name .secrets -exec sh -c 'echo {} && find {} -type f' \; |
| h-d1-098 | ✗ | 135 | - | readlink -f README.md | sed 's|[^/]*/||' |
| h-d1-099 | ✗ | 270 | - | find ~/frozen -type d -exec chmod 700 {} ; |
| h-d1-100 | ✗ | 92 | - | set +f |
| h-d1-101 | ✗ | 85 | - | find /Trash -ls |
| h-d1-102 | ✗ | 76 | - | du -sh ~/Trash |
| h-d1-103 | ✗ | 88 | - | mv old-report.pdf ~/Documents/ |
| h-d1-104 | ✗ | 67 | - | rm -rf drafts/ |
| h-d1-105 | ✗ | 108 | - | mv client.dmg ~/Documents/Trash/ |
| h-d1-106 | ✗ | 164 | - | find / -type d -empty -delete |
| h-d1-107 | ✗ | 103 | - | cp ~/Desktop/report.pdf ~/Documents/ |
| h-d1-108 | ✗ | 121 | - | shred -u tax-2019.pdf |
| h-d1-109 | ✓ | 108 | - | rm -rf ~/Downloads/tmp-build |
| h-d1-110 | ✗ | 128 | - | find ~/junk -exec trash {} \; |
| h-d2-001 | ✓ | 106 | - | wc -l server.log |
| h-d2-002 | ✗ | 173 | - | grep -o ERROR app.log | wc -l |
| h-d2-003 | ✓ | 97 | - | tail -f install.log |
| h-d2-004 | ✗ | 109 | - | tail -n 20 notes.txt |
| h-d2-005 | ✓ | 96 | - | tail -n 50 build.log |
| h-d2-006 | ✓ | 53 | - | sort names.txt |
| h-d2-007 | ✓ | 66 | - | sort -nr scores.csv |
| h-d2-008 | ✗ | 110 | - | cat tags.txt | sort | uniq |
| h-d2-009 | ✓ | 239 | - | sort ips.txt | uniq -c | sort -nr | head -n 1 |
| h-d2-010 | ✗ | 113 | - | sort attendees.txt | uniq -c |
| h-d2-011 | ✗ | 239 | - | tr '[:upper:]' '[:lower:]' < uppercase.txt > all_lowercase.txt |
| h-d2-012 | ✗ | 110 | - | sed 's/\r$//' legacy.txt |
| h-d2-013 | ✗ | 88 | - | tr -s '[:space:]' |
| h-d2-014 | ✗ | 2203 | - | pandoc --smart --color=colour --color=colour --color=colour --color=colour --col |
| h-d2-015 | ✗ | 255 | - | cat stats.txt | sed 's/[^0-9]/*/g' |
| h-d2-016 | ✗ | 131 | - | sed -i 's/http:https:/https:/g' links.txt |
| h-d2-017 | ✗ | 97 | - | cat nginx.conf | grep -vE '^#' |
| h-d2-018 | ✗ | 433 | - | grep -oE '([0-9]{1,3}\.){3}[0-9]{1,3}' /var/log/access.log | sort -u > /tmp/ips. |
| h-d2-019 | ✗ | 222 | - | tail -f app.log | grep --color=always -i DEBUG |
| h-d2-020 | ✗ | 124 | - | git grep -l "TODO" main.swift |
| h-d2-021 | ✗ | 107 | - | grep -R "log" notes.txt |
| h-d2-022 | ✗ | 208 | - | tail -n +6 harvest.log | grep --line-buffered 'warning' |
| h-d2-023 | ✗ | 239 | - | tail -n +100000 crash.log | head -n 3 |
| h-d2-024 | ✗ | 168 | - | grep -i "timeout" net.log | grep -i "refused" |
| h-d2-025 | ✗ | 225 | - | grep -R "C:\temp\file.txt" /var/log/requests.log |
| h-d2-026 | ✗ | 301 | - | find . -type f -name "*.md" | xargs wc -l |
| h-d2-027 | ✗ | 85 | - | wc -l Quarterly Report.txt |
| h-d2-028 | ✓ | 126 | - | sort -t, -k2,2n scores.csv |
| h-d2-029 | ✗ | 464 | - | tr -s '[:space:]' '\n' < paths.txt | sort | uniq -c | sort -nr | head -n 1 |
| h-d2-030 | ✗ | 192 | - | cut -d',' -f2 sales.tsv | tr -d ' ' | paste -sd+ - | bc |
| h-d2-031 | ✗ | 194 | - | cut -d',' -f1,3 users.csv |
| h-d2-032 | ✗ | 99 | - | sort dupes.txt | uniq -d |
| h-d2-033 | ✓ | 77 | - | tail -r results.txt |
| h-d2-034 | ✗ | 61 | - | nl recipe.txt |
| h-d2-035 | ✗ | 119 | - | sed 's/^ *//g' indented.txt |
| h-d2-036 | ✗ | 275 | - | echo $(cat ids.txt | tr '\n' ',' | sed 's/,$/\n/') |
| h-d2-037 | ✗ | 117 | - | find . -name "invoice2024" |
| h-d2-038 | ✗ | 133 | - | sed -e 's/^/{/; s/$/}/' block.txt |
| h-d2-039 | ✓ | 146 | - | find ~/projects -name "*.log" |
| h-d2-040 | ✗ | 166 | - | git log --since="7 days ago" --oneline |
| h-d2-041 | ✓ | 171 | - | find ~ -type f -size +500M |
| h-d2-042 | ✓ | 147 | - | find ~/code -type d -name 'node_modules' |
| h-d2-043 | ✗ | 238 | - | find ~/Sites -type d -name ".DS_Store" -exec rm -rf {} \; |
| h-d2-044 | ✗ | 94 | - | find . -type f -empty |
| h-d2-045 | ✗ | 251 | - | find ~/Documents -type f -name '*.txt' -maxdepth 1 |
| h-d2-046 | ✗ | 167 | - | find ~/projects/api-server -type f -exec grep -H "API_KEY" {} \; |
| h-d2-047 | ✗ | 316 | - | find ~/projects/app -name "*.swift" | xargs grep -nH "TODO" |
| h-d2-048 | ✗ | 193 | - | find ~ -type f -exec grep -l "confidential" {} \; |
| h-d2-049 | ✗ | 255 | - | find ./logs -type f -name "*.log" | xargs wc -l |
| h-d2-050 | ✗ | 130 | - | grep -Rin smtp_host ~/config |
| h-d2-051 | ✗ | 91 | - | git config --get user.name |
| h-d2-052 | ✗ | 134 | - | git diff --name-only > lastbuild.txt |
| h-d2-053 | ✗ | 162 | - | find . -name Vacation Plan.pdf |
| h-d2-054 | ✗ | 251 | - | find /usr/local/ -name docs -type d |
| h-d2-055 | ✗ | 441 | - | find . -name "budget" | xargs -I {} sh -c 'echo {} && ls -l {}' |
| h-d2-056 | ✗ | 125 | - | mdls -m ~/Pictures/MyPhoto.jpg |
| h-d2-057 | ✗ | 173 | - | identify -format "%[pixel_height]" hero-banner.png |
| h-d2-058 | ✗ | 250 | - | find ~/Documents -type f -exec grep -l "contract" {} \; |
| h-d2-059 | ✗ | 149 | - | find . -type f | xargs grep itinerary |
| h-d2-060 | ✗ | 246 | - | find . -type f -name "*.jpg" -exec ls -l {} \; |
| h-d2-061 | ✗ | 157 | - | find . -iname '*.JPG' -o -iname '*.jpg' |
| h-d2-062 | ✗ | 420 | - | git log --since="2 weeks ago" --pretty=format:"%h %s" | sort | uniq -c | sort -n |
| h-d2-063 | ✗ | 66 | - | ssh-copy-id user@host |
| h-d2-064 | ✗ | 78 | - | echo build-42 | xclip |
| h-d2-065 | ✗ | 112 | - | pwd | xargs -I{} echo "cd {}" |
| h-d2-066 | ✗ | 142 | - | cat /proc/$$/fd/0 |
| h-d2-067 | ✗ | 168 | - | cat -n > pasted-notes.txt |
| h-d2-068 | ✗ | 124 | - | cat /dev/clipboard | sort |
| h-d2-069 | ✗ | 138 | - | cat /proc/$$/fd/0 | wc -l |
| h-d2-070 | ✗ | 170 | - | echo $(echo $ | tr '[:upper:]' '[:lower:]') |
| h-d2-071 | ✗ | 89 | - | uuidgen | xclip -selection clipboard |
| h-d2-072 | ✗ | 162 | - | grep -q prod <(cat /dev/clipboard) |
| h-d2-073 | ✗ | 92 | - | plutil -info README.plist |
| h-d2-074 | ✓ | 92 | - | plutil -p Settings.plist |
| h-d2-075 | ✗ | 173 | - | defaults read /Library/Preferences/com.apple.cfprefs.plist CFBundleShortVersionS |
| h-d2-076 | ✗ | 183 | - | plutil -dump ~/Desktop/config.plist | sed 's/"/\\"/g' |
| h-d2-077 | ✗ | 141 | - | bunzip2 -c cache.bplist | xmluncompress |
| h-d2-078 | ✗ | 328 | - | plutil -extract CFBundleExecutable /Applications/MyApp.app/Contents/Info.plist | |
| h-d2-079 | ✗ | 111 | - | defaults read com.apple.internetsearch on |
| h-d2-080 | ✗ | 73 | - | dconf dump / |
| h-d2-081 | ✗ | 137 | - | cat ~/.config/dockconf/dock.conf | grep autohide |
| h-d2-082 | ✗ | 116 | - | find . -type f -name '.*' |
| h-d2-083 | ✗ | 68 | - | echo $AppleInterfaceStyle |
| h-d2-084 | ✗ | 84 | - | defaults read com.apple.Preview Version |
| h-d2-085 | ✗ | 114 | - | system_profiler SPPreferencesDataType |
| h-d2-086 | ✗ | 67 | - | defaults search screenshot |
| h-d2-087 | ✗ | 198 | - | plutil -jsonpath -o -s -d /Library/Developer/XcodeHelpFiles/Info.plist | jq . |
| h-d2-088 | ✗ | 170 | - | plists -l ~/Library/Preferences/com.myapp.plist |
| h-d2-089 | ✓ | 138 | - | diff -u draft-v1.txt draft-v2.txt |
| h-d2-090 | ✓ | 99 | - | diff -u config.yml.orig config.yml |
| h-d2-091 | ✗ | 121 | - | diff -qr ~/backup/site-a ~/backup/site-b |
| h-d2-092 | ✓ | 81 | - | diff -y before.txt after.txt |
| h-d2-093 | ✗ | 93 | - | diff -y main.c main.c.bak |
| h-d2-094 | ✓ | 81 | - | diff -rq dir1 dir2 |
| h-d2-095 | ✗ | 117 | - | git diff --notes-file=notes.patch -o notes.new |
| h-d2-096 | ✓ | 60 | - | git apply fixes.patch |
| h-d2-097 | ✗ | 94 | - | cut -d',' -f2 sales.csv |
| h-d2-098 | ✗ | 110 | - | cut -d: -f1 /etc/passwd |
| h-d2-099 | ✗ | 188 | - | ps aux | awk '{print $2}' | sort | uniq -c |
| h-d2-100 | ✗ | 189 | - | cut -d',' -f1-5 report.tsv |
| h-d2-101 | ✗ | 127 | - | cut -d' ' -f2 ports.txt |
| h-d2-102 | ✗ | 205 | - | cat fixedwidth.dat | tr ' ' '\n' | head -c 8 | tail -n 1 |
| h-d2-103 | ✗ | 176 | - | tail -n +10 manual.txt | head -n 10 |
| h-d2-104 | ✗ | 194 | - | tail -n +150 dump.sql | head -n 200 |
| h-d2-105 | ✗ | 193 | - | tail -n +42 answers.txt |
| h-d2-106 | ✓ | 103 | - | tail -n +300 log.txt |
| h-d2-107 | ✓ | 94 | - | grep -i "panic" error.log |
| h-d2-108 | ✗ | 298 | - | find ~/projects/webapp -type f -iname "todo" |
| h-d2-109 | ✗ | 249 | - | find ~/Pictures -type f -iname '*.JPG' -o -iname '*.jpg' |
| h-d2-110 | ✗ | 152 | - | sort roster.txt | uniq -c |
| h-d3-001 | ✗ | 72 | - | uname -r |
| h-d3-002 | ✗ | 252 | - | git describe --match v[0-9]\.[0-9]\.[0-9]\.0 |
| h-d3-003 | ✓ | 78 | - | uname -r |
| h-d3-004 | ✓ | 61 | - | uname -m |
| h-d3-005 | ✗ | 259 | - | free -m | awk '/Mem:/ {print $3/$2 * 100 "%"}' |
| h-d3-006 | ✗ | 143 | - | sysctl machdep.cpu.model |
| h-d3-007 | ✗ | 83 | - | dmesg | more |
| h-d3-008 | ✗ | 130 | - | cat /sys/class/power_supply/BAT0/capacity |
| h-d3-009 | ✗ | 56 | - | ip link show |
| h-d3-010 | ✗ | 69 | - | sysctl vm.page_size |
| h-d3-011 | ✗ | 106 | - | system_profiler SPSoftwareDataType | grep Serial Number |
| h-d3-012 | ✓ | 39 | - | uptime |
| h-d3-013 | ✓ | 80 | - | sysctl -a | grep cpu |
| h-d3-014 | ✓ | 108 | - | who -b | awk '{print $1}' |
| h-d3-015 | ✗ | 259 | - | top -b -n 1 | tail -n 1 |
| h-d3-016 | ✗ | 257 | - | cat /sys/class/power_supply/BAT0/capacity | bc -l |
| h-d3-017 | ✗ | 125 | - | watch -n 10 'npm test' |
| h-d3-018 | ✗ | 68 | - | ./render.sh & |
| h-d3-019 | ✗ | 65 | - | sleep 10 |
| h-d3-020 | ✗ | 116 | - | top -b -n 1 | grep sleep |
| h-d3-021 | ✗ | 400 | - | watch -n 60 'echo "Battery charge: $(cat /sys/class/power_supply/BAT0/capacity)% |
| h-d3-022 | ✓ | 92 | - | pmset -g powerstate |
| h-d3-023 | ✗ | 73 | - | crontab -e |
| h-d3-024 | ✗ | 87 | - | pmset -a snooze 10 |
| h-d3-025 | ✓ | 62 | - | pmset -g |
| h-d3-026 | ✗ | 93 | - | sleep 120 |
| h-d3-027 | ✓ | 199 | - | ps aux --sort=-%mem | head -n 10 |
| h-d3-028 | ✗ | 330 | - | top -bn1 | awk 'NR>1{print $2}' | xargs -I{} ps aux | grep {} |
| h-d3-029 | ✗ | 107 | - | pkill -9 -pid 4100 |
| h-d3-030 | ✗ | 82 | - | kill 8821 |
| h-d3-031 | ✓ | 70 | - | pkill chrome |
| h-d3-032 | ✓ | 66 | - | pgrep node |
| h-d3-033 | ✓ | 135 | - | lsof -i :3000 |
| h-d3-034 | ✓ | 314 | - | sudo kill -9 `lsof -i:8080 | awk '{print $2}'` |
| h-d3-035 | ✓ | 83 | - | ps aux | grep alex |
| h-d3-036 | ✗ | 219 | - | pstree -p | awk '{print $1}' | tail -1 |
| h-d3-037 | ✗ | 581 | - | ps aux | grep -v grep | awk '{print $2}' | xargs -I{} ps aux | grep -v grep | aw |
| h-d3-038 | ✓ | 89 | - | ps aux | grep postgres |
| h-d3-039 | ✓ | 103 | - | ps aux | grep python | wc -l |
| h-d3-040 | ✗ | 113 | - | kill -s HUP 12345 |
| h-d3-041 | ✗ | 75 | - | ps aux | grep zombie |
| h-d3-042 | ✓ | 76 | - | pkill -f backup sync |
| h-d3-043 | ✓ | 57 | - | launchctl list |
| h-d3-044 | ✗ | 73 | - | pgrep -a backup-agent |
| h-d3-045 | ✓ | 65 | - | brew services start postgresql |
| h-d3-046 | ✗ | 49 | - | sync --unload |
| h-d3-047 | ✗ | 103 | - | kill -9 `cat /tmp/agent.pid` |
| h-d3-048 | ✗ | 209 | - | sudo yum install -y epel-release && sudo yum install -y python3-pip |
| h-d3-049 | ✗ | 96 | - | launchctl list | grep com.example |
| h-d3-050 | ✗ | 154 | - | jobs -l | tail -1 | awk '{print $2}' |
| h-d3-051 | ✗ | 124 | - | jobs -p | xargs kill -9 |
| h-d3-052 | ✗ | 81 | - | sudo systemctl restart docker |
| h-d3-053 | ✗ | 90 | - | ps aux | grep -v grep |
| h-d3-054 | ✗ | 101 | - | launchctl list | grep com.alex.slowjob |
| h-d3-055 | ✗ | 63 | - | sudo systemctl stop firewalld |
| h-d3-056 | ✗ | 158 | - | launchctl unload ~/Library/LaunchAgents/com.example.myapp.plist |
| h-d3-057 | ✗ | 279 | - | free -m | awk '/Mem:/ {print $3/$2 * 100 "%"}' |
| h-d3-058 | ✗ | 97 | - | sleep 10000 |
| h-d3-059 | ✓ | 68 | - | df -h |
| h-d3-060 | ✓ | 71 | - | df -h / |
| h-d3-061 | ✓ | 56 | - | df -i |
| h-d3-062 | ✓ | 143 | - | sudo hdiutil attach ~/Downloads/Firefox.dmg |
| h-d3-063 | ✗ | 137 | - | hdiutil eject ~/Documents/MyDiskImage.dmg |
| h-d3-064 | ✓ | 146 | - | shasum -c README.dmg.sha256 |
| h-d3-065 | ✗ | 96 | - | mount | grep /media |
| h-d3-066 | ✗ | 152 | - | hdiutil info ~/Downloads/MyMac.dmg |
| h-d3-067 | ✗ | 310 | - | hdiutil create -encryption AES256 -file ~/Documents/mySecrets.dmg ~/Documents/my |
| h-d3-068 | ✗ | 96 | - | zfs compact sparseimage |
| h-d3-069 | ✓ | 64 | - | whoami |
| h-d3-070 | ✓ | 47 | - | groups |
| h-d3-071 | ✓ | 53 | - | id alex |
| h-d3-072 | ✗ | 116 | - | getent passwd | awk '{print $1}' |
| h-d3-073 | ✗ | 149 | - | curl https://api.github.com/users/alex/statuses | jq . |
| h-d3-074 | ✗ | 52 | - | whoami |
| h-d3-075 | ✗ | 101 | - | chsh -s /bin/zsh |
| h-d3-076 | ✗ | 255 | - | groups alex | grep -q admin && echo "yes" || echo "no" |
| h-d3-077 | ✗ | 114 | - | groups alex | wc -l |
| h-d3-078 | ✓ | 47 | - | who |
| h-d3-079 | ✓ | 63 | - | date |
| h-d3-080 | ✓ | 51 | - | date +%s |
| h-d3-081 | ✓ | 82 | - | date +%Y-%m-%d |
| h-d3-082 | ✗ | 91 | - | date -d "3 hours" +%s |
| h-d3-083 | ✗ | 190 | - | date -d "1 week" +%s |
| h-d3-084 | ✗ | 140 | - | date -d yesterday +%s |
| h-d3-085 | ✗ | 362 | - | curl -s 'https://www.timeapi.org/timezone/UTC' | grep 'current-utc' |
| h-d3-086 | ✗ | 239 | - | date -s "2023-10-01 12:00:00" |
| h-d3-087 | ✗ | 282 | - | date -d @1700000000 |
| h-d3-088 | ✗ | 177 | - | watch -n 1 'echo "Build finished"' |
| h-d3-089 | ✗ | 69 | - | yes | true |
| h-d3-090 | ✗ | 109 | - | echo -e "\a" |
| h-d3-091 | ✗ | 145 | - | notify-send "File Updated" "File has been updated" |
| h-d3-092 | ✗ | 294 | - | ps aux | awk '{print $1}' | xargs -I {} pgrep {} |
| h-d3-093 | ✗ | 168 | - | amixer set Master 10% |
| h-d3-094 | ✗ | 93 | - | set -x |
| h-d3-095 | ✗ | 90 | - | cat <(echo $) |
| h-d3-096 | ✗ | 214 | - | osascript -e 'tell application "Finder" to display dialog "Backup complete"' |
| h-d3-097 | ✗ | 91 | - | last -1h |
| h-d3-098 | ✗ | 266 | - | tail -n 100 /var/log/syslog | grep --line-buffered "ERROR" |
| h-d3-099 | ✗ | 140 | - | dmesg | tail |
| h-d3-100 | ✗ | 394 | - | who | awk '{print $1}' | xargs -I{} who -b {} |
| h-d3-101 | ✓ | 64 | - | last |
| h-d3-102 | ✗ | 669 | - | tail -f /var/log/auth.log | grep --line-buffered 'sshd' | awk '{print $1}' | sor |
| h-d3-103 | ✗ | 280 | - | safari --debug --log /var/log/safari.log |
| h-d3-104 | ✗ | 251 | - | grep -i "Failed password" /var/log/auth.log | tail -n 10 |
| h-d3-105 | ✗ | 137 | - | git archive --format=zip HEAD > archive.zip |
| h-d3-106 | ✗ | 146 | - | dmesg | tail -n 10 |
| h-d3-107 | ✗ | 76 | - | sensors |
| h-d3-108 | ✗ | 166 | - | top -bn1 | grep 'Cpu(s)' |
| h-d3-109 | ✗ | 101 | - | glxgears & |
| h-d3-110 | ✗ | 183 | - | time cat /proc/cpuinfo | head -n 10 > cpu.txt |
| h-d4-001 | ✗ | 422 | - | ifconfig wlan0 | grep 'inet addr:' | awk '{print $2}' | cut -d ':' -f1 | cut -d  |
| h-d4-002 | ✗ | 228 | - | ifconfig eth0 | grep 'inet addr:' | awk '{print $2}' | cut -d ':' -f1 |
| h-d4-003 | ✗ | 51 | - | ip link show |
| h-d4-004 | ✗ | 99 | - | lspci | grep -i ethernet |
| h-d4-005 | ✓ | 123 | - | cat /etc/resolv.conf | grep 'nameserver' |
| h-d4-006 | ✗ | 274 | - | dig @8.8.8.8 google.com | head -n 1 |
| h-d4-007 | ✓ | 92 | - | dig api.github.com |
| h-d4-008 | ✓ | 122 | - | dig mx fastmail.com | head -n 1 |
| h-d4-009 | ✗ | 85 | - | dig @ns1.google.com google.com |
| h-d4-010 | ✗ | 105 | - | dig @8.8.8.8 weirdsite.io |
| h-d4-011 | ✗ | 197 | - | dig +short 9.9.9.9 |
| h-d4-012 | ✗ | 105 | - | whois cloudywithachanceof.dev |
| h-d4-013 | ✗ | 177 | - | whois 203.0.113.7 |
| h-d4-014 | ✓ | 143 | - | lsof -i :3000 |
| h-d4-015 | ✗ | 100 | - | sudo kill 8080 |
| h-d4-016 | ✗ | 73 | - | ss -tlnp |
| h-d4-017 | ✗ | 115 | - | ss -tulpn | grep :8080 |
| h-d4-018 | ✓ | 110 | - | netstat -an | grep :5432 |
| h-d4-019 | ✗ | 123 | - | netstat -tuln |
| h-d4-020 | ✗ | 137 | - | ps aux | grep :22 |
| h-d4-021 | ✓ | 181 | - | ping 1.1.1.1 |
| h-d4-022 | ✗ | 89 | - | gh api /user/starred/github.com |
| h-d4-023 | ✗ | 59 | - | ping google.com |
| h-d4-024 | ✗ | 113 | - | curl -s https://example.com | head |
| h-d4-025 | ✗ | 278 | - | curl -L https://github.com/user/repo/releases/download/v2.3.0/README.tar.gz |
| h-d4-026 | ✗ | 348 | - | curl -X POST -H "Content-Type: application/json" -d '{"message":"ping"}' https:/ |
| h-d4-027 | ✗ | 111 | - | time curl http://example.com |
| h-d4-028 | ✗ | 170 | - | curl -I https://bit.ly/1234567890 |
| h-d4-029 | ✗ | 143 | - | cd ~/projects/myapp/staging && git pull origin main |
| h-d4-030 | ✗ | 225 | - | rsync -avz --progress old.tar.gz deploy:/var/www/ |
| h-d4-031 | ✗ | 355 | - | git log --all --since="2014-01-01" --until="2014-12-31" |
| h-d4-032 | ✗ | 150 | - | docker run --rm -it ubuntu bash |
| h-d4-033 | ✗ | 105 | - | ssh -i ~/Documents/mykey.pem prod |
| h-d4-034 | ✗ | 46 | - | whoami |
| h-d4-035 | ✗ | 130 | - | ssh -L 5432:localhost:5432 prod |
| h-d4-036 | ✗ | 94 | - | traceroute 8.8.8.8 |
| h-d4-037 | ✗ | 85 | - | ip route show |
| h-d4-038 | ✗ | 87 | - | ip route show | grep default |
| h-d4-039 | ✗ | 331 | - | netstat -rn | grep -v '127.0.0.1' | awk '{print $5}' |
| h-d4-040 | ✗ | 79 | - | arp -a |
| h-d4-041 | ✗ | 349 | - | arp -a | grep -v '192.168.1.1' | awk '{print $4}' | xargs -I{} arp -d {} |
| h-d4-042 | ✗ | 89 | - | ip route show | grep default |
| h-d4-043 | ✗ | 78 | - | pfctl -s info |
| h-d4-044 | ✗ | 109 | - | sysctl net.ipv4.ip_forward |
| h-d4-045 | ✗ | 115 | - | pfctl -s state |
| h-d4-046 | ✗ | 73 | - | pfctl -s nat |
| h-d4-047 | ✗ | 91 | - | netstat -an | grep LISTEN |
| h-d4-048 | ✗ | 132 | - | cat /etc/resolv.conf | grep 'nameserver' |
| h-d4-049 | ✗ | 330 | - | sudo apt-get install -y dnsutils && dig TXT google.com | grep -o 'value=' | cut  |
| h-d4-050 | ✗ | 134 | - | sudo systemctl set-default resolv.conf=resolv.conf |
| h-d4-051 | ✗ | 100 | - | curl -I https://example.com |
| h-d4-052 | ✗ | 156 | - | sudo ip link set en0 mtu 1500 |
| h-d4-053 | ✗ | 72 | - | sudo dhclient -r |
| h-d4-054 | ✗ | 171 | - | cat /proc/dhcp6/params | grep ^dns |
| h-d4-055 | ✗ | 166 | - | tcpdump -vvv -i any eth0 |
| h-d4-056 | ✗ | 74 | - | curl ifconfig.me |
| h-d4-057 | ✗ | 66 | - | traceroute google.com |
| h-d4-058 | ✗ | 87 | - | sudo tcpdump -i en0 |
| h-d4-059 | ✗ | 78 | - | iwlist wlan0 essid |
| h-d4-060 | ✗ | 205 | - | sudo ip link set wlan0 down && sleep 60 && sudo ip link set wlan0 up |
| h-d4-061 | ✗ | 83 | - | sudo systemctl start NetworkManager |
| h-d4-062 | ✗ | 81 | - | sudo systemctl poweroff |
| h-d4-063 | ✗ | 310 | - | join -t $'\0' <(sort -u CoffeeNet-5G) <(sort -u password hunter2) |
| h-d4-064 | ✗ | 81 | - | nmcli dev wifi |
| h-d4-065 | ✗ | 85 | - | git rm --cached LoungeNet |
| h-d4-066 | ✗ | 758 | - | ifconfig | grep 'inet addr:' | awk '{print $2}' | grep -Eo '[0-9]{1,3}\.[0-9]{1, |
| h-d4-067 | ✗ | 97 | - | nmcli dev wifi |
| h-d4-068 | ✓ | 129 | - | system_profiler SPBluetoothDataType | grep -i 'powered' |
| h-d4-069 | ✗ | 63 | - | sudo pkill bluez |
| h-d4-070 | ✗ | 56 | - | systemctl start bluetooth |
| h-d4-071 | ✗ | 85 | - | bluetoothctl paired-devices |
| h-d4-072 | ✗ | 89 | - | whoami | grep -q '^$' |
| h-d4-073 | ✗ | 157 | - | ssh -t user@192.168.1.10 |
| h-d4-074 | ✗ | 206 | - | ssh-add -d ~/.ssh/id_ed25519 |
| h-d4-075 | ✗ | 113 | - | systemctl is-active --quiet sshd |
| h-d4-076 | ✗ | 171 | - | screen -S | grep -q 'screen' && echo on || echo off |
| h-d4-077 | ✗ | 129 | - | screen -S mysession -X screen /path/to/program |
| h-d4-078 | ✗ | 173 | - | smbclient //192.168.1.100/ |
| h-d4-079 | ✗ | 113 | - | ps aux | grep -i "daemon" |
| h-d4-080 | ✗ | 78 | - | arp -a |
| h-d4-081 | ✗ | 87 | - | who | grep -q vnc |
| h-d4-082 | ✗ | 154 | - | ssh -L 2222:localhost:22 |
| h-d4-083 | ✗ | 156 | - | system_profiler SPDisplaysDataType | grep -i 'printer' |
| h-d4-084 | ✗ | 126 | - | find / -type f -iname "*.mp3" |
| h-d4-085 | ✗ | 87 | - | system_profiler SPNetworkDataType |
| h-d4-086 | ✓ | 54 | - | dig nas.local |
| h-d4-087 | ✗ | 57 | - | ssh box.example.com |
| h-d4-088 | ✗ | 81 | - | who | grep -i 'http' |
| h-d4-089 | ✗ | 62 | - | dig @localhost web-service |
| h-d4-090 | ✗ | 96 | - | dig +short printer-2.local |
| h-d5-001 | ✗ | 108 | - | git branch --merged main | grep -v HEAD |
| h-d5-002 | ✗ | 243 | - | git branch --merged | cut -d/ -f2- |
| h-d5-003 | ✗ | 62 | - | git branch -d main |
| h-d5-004 | ✓ | 43 | - | git stash |
| h-d5-005 | ✓ | 46 | - | git stash list |
| h-d5-006 | ✓ | 48 | - | git stash pop |
| h-d5-007 | ✓ | 73 | - | git stash --include-untracked |
| h-d5-008 | ✗ | 122 | - | git log --first-parent --grep=STRIPE_SECRET |
| h-d5-009 | ✗ | 136 | - | git log --grep="user_1234_id" |
| h-d5-010 | ✗ | 137 | - | git checkout -b fix-123 --hotfix |
| h-d5-011 | ✗ | 75 | - | git worktree list |
| h-d5-012 | ✓ | 92 | - | git worktree remove ../wip-review |
| h-d5-013 | ✗ | 74 | - | git worktree add ../experiment . |
| h-d5-014 | ✓ | 53 | - | git worktree prune |
| h-d5-015 | ✗ | 86 | - | git lock --worktree path/to/worktree |
| h-d5-016 | ✗ | 99 | - | git bisect run python script.py |
| h-d5-017 | ✓ | 68 | - | git bisect bad |
| h-d5-018 | ✓ | 121 | - | git bisect good v1.4.2 |
| h-d5-019 | ✓ | 79 | - | git bisect skip |
| h-d5-020 | ✗ | 86 | - | git checkout abc123 |
| h-d5-021 | ✗ | 71 | - | git bisect log |
| h-d5-022 | ✗ | 107 | - | ./check.sh |& grep -v 'ok' |
| h-d5-023 | ✗ | 57 | - | git clean -fd |
| h-d5-024 | ✓ | 57 | - | git clean -fd |
| h-d5-025 | ✗ | 134 | - | find . -type f -name "*.o" -exec rm {} \; |
| h-d5-026 | ✗ | 99 | - | git rm -r --cached dist/ |
| h-d5-027 | ✓ | 74 | - | brew list |
| h-d5-028 | ✗ | 168 | - | cask list | awk '{print $1}' |
| h-d5-029 | ✗ | 64 | - | apt-cache show wget |
| h-d5-030 | ✓ | 41 | - | brew outdated |
| h-d5-031 | ✓ | 41 | - | brew upgrade |
| h-d5-032 | ✓ | 56 | - | brew upgrade ripgrep |
| h-d5-033 | ✗ | 43 | - | brew cleanup |
| h-d5-034 | ✗ | 47 | - | brew cleanup |
| h-d5-035 | ✓ | 67 | - | brew install htop |
| h-d5-036 | ✗ | 86 | - | brew cask list rectangle |
| h-d5-037 | ✗ | 137 | - | git ls-files | grep -v 'README.md' |
| h-d5-038 | ✗ | 76 | - | brew list | grep python |
| h-d5-039 | ✓ | 58 | - | npm list --global |
| h-d5-040 | ✓ | 83 | - | npm list --global | grep typescript |
| h-d5-041 | ✗ | 42 | - | npm audit |
| h-d5-042 | ✓ | 42 | - | pip list |
| h-d5-043 | ✓ | 65 | - | pip list --outdated |
| h-d5-044 | ✗ | 102 | - | pip freeze > requirements.txt |
| h-d5-045 | ✓ | 74 | - | cargo install ripgrep |
| h-d5-046 | ✗ | 71 | - | cargo install --list |
| h-d5-047 | ✗ | 148 | - | cargo install --bin bat --version 0.24.0 |
| h-d5-048 | ✗ | 81 | - | xcode-select --print-path |
| h-d5-049 | ✗ | 615 | - | export PATH=$PATH:/Applications/Xcode-beta.app/Contents/Developer/Toolchains/Xco |
| h-d5-050 | ✓ | 76 | - | which clang |
| h-d5-051 | ✗ | 59 | - | sdk path |
| h-d5-052 | ✗ | 134 | - | otool -h ~/Documents/my_program_with_dynamic_lib |
| h-d5-053 | ✗ | 85 | - | xcode-select -p |
| h-d5-054 | ✗ | 106 | - | xcrun simctl list |
| h-d5-055 | ✓ | 129 | - | ./simctl boot ~/Documents/iphone15.simui |
| h-d5-056 | ✗ | 244 | - | ./build.sh | cpio -o --format=ustar /dev/disk0s2 |
| h-d5-057 | ✗ | 91 | - | simctl launch com.example.myapp |
| h-d5-058 | ✗ | 79 | - | pkill -f simulator |
| h-d5-059 | ✗ | 64 | - | screenshot -s |
| h-d5-060 | ✗ | 181 | - | convert hero.png -resize 800x800 hero.jpg |
| h-d5-061 | ✗ | 237 | - | convert banner.png -resize 800x600 banner_resized.png |
| h-d5-062 | ✗ | 100 | - | convert input.png output.jpg |
| h-d5-063 | ✗ | 738 | - | convert -resize 800x600 iPhone_2019-04-17_13.12.00.jpg iPhone_2019-04-17_13.12.0 |
| h-d5-064 | ✗ | 126 | - | convert icon.png -format "%w %h" |
| h-d5-065 | ✗ | 804 | - | find ./scans -type f -name "*.tiff" | xargs convert -density 300 -quality 85 -co |
| h-d5-066 | ✗ | 294 | - | ffmpeg -i voice.wav -vn -acodec libmp3lame -ab 128k output.m4a |
| h-d5-067 | ✗ | 319 | - | ffmpeg -i lecture.aiff -acodec pcm_s16le -ar 44100 lecture.wav |
| h-d5-068 | ✗ | 384 | - | ffmpeg -i big.wav -b:a 128k -qscale:a 5 output.mp4 |
| h-d5-069 | ✗ | 65 | - | afconvert --formats |
| h-d5-070 | ✓ | 298 | - | ffmpeg -i input.mov -c:v libx264 -c:a aac output.mp4 |
| h-d5-071 | ✓ | 419 | - | ffmpeg -i lecture.mp4 -vn -acodec libmp3lame -ab 128k lecture.mp3 |
| h-d5-072 | ✗ | 487 | - | ffmpeg -i input.mp4 -ss 00:00:030 -t 00:00:100 output.mp4 |
| h-d5-073 | ✓ | 462 | - | ffmpeg -i big.mov -c:v libx264 -crf 28 -vtag vbr -f segment output%03d.mkv |
| h-d5-074 | ✓ | 215 | - | ffmpeg -i screencap.mov -f image2pipe output.gif |
| h-d5-075 | ✗ | 77 | - | yank 5 |
| h-d5-076 | ✗ | 143 | - | screenshot -f ~/Desktop/$(date +%F_%T).png |
| h-d5-077 | ✗ | 90 | - | xdg-screensaver-command --fullscreen |
| h-d5-078 | ✗ | 146 | - | screencapture -o today.png |
| h-d5-079 | ✗ | 422 | - | sleep 5 | sleep 1 | sleep 2 | sleep 3 | sleep 4 | sleep 5 | cat /dev/null |
| h-d5-080 | ✗ | 125 | - | open -a ~/Documents/report.pdf |
| h-d5-081 | ✗ | 68 | - | gedit README.md |
| h-d5-082 | ✓ | 80 | - | cd ~/Documents && open . |
| h-d5-083 | ✗ | 83 | - | safari http://github.com |
| h-d5-084 | ✗ | 76 | - | xcode-select --install |
| h-d5-085 | ✗ | 120 | - | xdg-open "https://www.example.com" |
| h-d5-086 | ✗ | 226 | - | pwd | xargs dirname | xargs basename | xargs ls -l |
| h-d5-087 | ✗ | 143 | - | open ~/Downloads/MyApp.dmg |
| h-d5-088 | ✗ | 90 | - | qlview mockup.psd |
| h-d5-089 | ✗ | 156 | - | convert photo.png -thumbnail 512x512 photo_thumbnail.png |
| h-d5-090 | ✗ | 77 | - | qlc reset |
| h-d5-091 | ✗ | 103 | - | pandoc report.docx -o report.txt |
| h-d5-092 | ✗ | 95 | - | pandoc notes.txt -o notes.html |
| h-d5-093 | ✗ | 196 | - | docx2rtf --format=plain --no-graphics README.rtf |
| h-d5-094 | ✓ | 75 | - | swiftlint . |
| h-d5-095 | ✗ | 54 | - | cargo fix |
| h-d5-096 | ✗ | 100 | - | security find-generic-password -u CoffeeShopGuest |
| h-d5-097 | ✗ | 70 | - | gh api /user/login |
| h-d5-098 | ✗ | 111 | - | keychain -l | grep my-api-key |
| h-d5-099 | ✗ | 257 | - | curl -s https://slack.com/api/apps/verify_signature | jq . |
| h-d5-100 | ✗ | 168 | - | git log -1 --pretty=format:"%h %s" |
| h-x1-001 | ✗ | 98 | - | ls -lR | tee listing.txt |
| h-x1-002 | ✓ | 86 | - | echo "deploy finished" >> release.log |
| h-x1-003 | ✗ | 82 | - | nohup ./backup.sh & |
| h-x1-004 | ✗ | 174 | - | ./test-runner.sh 2>&1 | tee results.log |
| h-x1-005 | ✗ | 58 | - | top |
| h-x1-006 | ✓ | 215 | - | grep -A 10 "ERROR" app.log | tee -a errors-archive.log |
| h-x1-007 | ✓ | 219 | - | grep -c '500' access.log | wc -l |
| h-x1-008 | ✗ | 143 | - | sort -t' ' -k2,2 raw-names.txt |
| h-x1-009 | ✓ | 207 | - | tail -f app.log | grep --line-buffered WARN |
| h-x1-010 | ✗ | 352 | - | find src/ -type f -name "*.c" -exec grep -H "TODO" {} \; |
| h-x1-011 | ✓ | 190 | - | grep -i "error" app.log |
| h-x1-012 | ✓ | 164 | - | grep -n "password" config.yml |
| h-x1-013 | ✓ | 79 | - | grep GET access.log | wc -l |
| h-x1-014 | ✗ | 98 | - | find ~/project -name '*api_key*' |
| h-x1-015 | ✗ | 211 | - | cat styles.css | grep -v '^\s*!' |
| h-x1-016 | ✗ | 133 | - | grep -R "deprecated" ~/code | nl |
| h-x1-017 | ✗ | 187 | - | sed -i 's/http:\/\/https:\/\/g' links.txt |
| h-x1-018 | ✗ | 195 | - | sed -i 's/debug/verbose/g' config.txt |
| h-x1-019 | ✗ | 157 | - | cat notes.txt | grep -v '^$' |
| h-x1-020 | ✓ | 123 | - | cut -d' ' -f1 scores.txt |
| h-x1-021 | ✗ | 112 | - | cut -d: -f1 /etc/passwd |
| h-x1-022 | ✗ | 142 | - | cut -d',' -f2 sales.tsv | paste -sd+ | bc |
| h-x1-023 | ✓ | 74 | - | wc -l access.log |
| h-x1-024 | ✓ | 61 | - | wc -w essay.md |
| h-x1-027 | ✓ | 135 | - | sort ips.txt | uniq -c |
| h-x1-028 | ✓ | 213 | - | grep -oE '([0-9]{3})' access.log | sort | uniq -c | sort -nr |
| h-x1-029 | ✗ | 92 | - | sort emails.txt | uniq -c |
| h-x1-030 | ✗ | 119 | - | tail -n 15 report.txt |
| h-x1-031 | ✓ | 143 | - | tail -n 250 server.log |
| h-x1-032 | ✓ | 97 | - | tail -f app.log |
| h-x1-033 | ✗ | 214 | - | find . -type f | xargs wc -l | sort -nr | head -n 5 |
| h-x1-034 | ✓ | 79 | - | tail -1 results.csv |
| h-x1-035 | ✓ | 111 | - | find /var/log -name "*.log" |
| h-x1-036 | ✓ | 80 | - | find ~/project -type d |
| h-x1-037 | ✗ | 202 | - | find ~/Downloads -type f -mtime +90 | xargs ls -l |
| h-x1-038 | ✗ | 135 | - | find ~/work -type f -ctime -1 |
| h-x1-039 | ✓ | 101 | - | find $HOME -name config.yml |
| h-x1-040 | ✓ | 145 | - | find /tmp -type f -name "*.tmp" -mtime +7 |
| h-x1-041 | ✗ | 119 | - | find ~/project -name "*.pyc" | xargs rm |
| h-x1-042 | ✓ | 167 | - | tar -czf project.tar.gz project/ |
| h-x1-043 | ✓ | 92 | - | tar -xzvf backup.tar.gz |
| h-x1-044 | ✗ | 84 | - | tar -tf archive.tar.gz |
| h-x1-045 | ✓ | 232 | - | tar -xzvf site.tar.gz -C /var/www/site |
| h-x1-046 | ✓ | 106 | - | gzip bigdump.sql |
| h-x1-048 | ✓ | 117 | - | gzip -c old-report.csv > old-report.csv.gz |
| h-x1-049 | ✗ | 49 | - | ssh alex |
| h-x1-050 | ✓ | 159 | - | ssh -p 2222 10.0.0.5 |
| h-x1-051 | ✗ | 153 | - | uptime -p | tee /dev/tty |
| h-x1-052 | ✗ | 136 | - | git push --force-with-lease dev.internal reports/ |
| h-x1-053 | ✗ | 147 | - | git pull --error-on-fail --no-ff production master |
| h-x1-054 | ✓ | 276 | - | curl -L --output ~/Downloads/releases_$(date +%Y-%m-%d).tar.gz https://releases. |
| h-x1-055 | ✗ | 149 | - | curl -s https://api.example.com | head -1 |
| h-x1-056 | ✗ | 81 | - | curl -I example.com |
| h-x1-057 | ✗ | 154 | - | curl -s http://localhost:8080/api/health | jq . |
| h-x1-058 | ✓ | 78 | - | wget https://example.com/setup.sh |
| h-x1-059 | ✗ | 174 | - | wget --progress=bar https://example.com/big.iso |
| h-x1-061 | ✗ | 85 | - | chmod 777 script.py |
| h-x1-062 | ✓ | 81 | - | chmod 644 notes.txt |
| h-x1-063 | ✗ | 174 | - | find ~/scripts -type f -exec chmod +x {} \; |
| h-x1-064 | ✗ | 180 | - | sed -i 's/;.*//g' data.csv |
| h-x1-065 | ✗ | 331 | - | rsync -avz uploads/ alex@192.168.1.100:/var/www/ |
| h-x1-066 | ✓ | 66 | - | ps aux |
| h-x1-067 | ✗ | 157 | - | find /usr/local/ssl -name "nginx.pid" |
| h-x1-068 | ✓ | 74 | - | pgrep postgres |
| h-x1-069 | ✓ | 96 | - | ps aux | grep worker.py |
| h-x1-070 | ✓ | 73 | - | pkill worker.py |
| h-x1-071 | ✗ | 94 | - | kill -9 4242 |
| h-x1-072 | ✗ | 71 | - | kill 9137 |
| h-x1-073 | ✗ | 53 | - | sudo systemctl reload nginx |
| h-x1-074 | ✓ | 78 | - | history | tail -n 10 |
| h-x1-075 | ✗ | 52 | - | history | grep ssh |
| h-x1-076 | ✗ | 103 | - | ll | expand |
| h-x1-077 | ✓ | 180 | - | echo $EDITOR |
| h-x1-078 | ✓ | 286 | - | echo 'export PATH=$PATH:~/bin' >> ~/.zshrc |
| h-x1-079 | ✓ | 130 | - | env | grep ^PATH= |
| h-x1-080 | ✓ | 242 | - | export API_KEY=sk-live-abc123 |
| h-x1-081 | ✓ | 79 | - | which python3 |
| h-x1-082 | ✗ | 54 | - | git --version |
| h-x1-083 | ✗ | 54 | - | man rsync |
| h-x1-084 | ✓ | 183 | - | apropos checksums |
| h-x1-086 | ✓ | 225 | - | ls -laR | head -n 5 |
| h-x1-087 | ✗ | 65 | - | cd ~/Documents |
| h-x1-088 | ✓ | 121 | - | mkdir -p ~/code/2024/q3/reports |
| h-x1-089 | ✓ | 86 | - | cp -r assets/ ~/backup/ |
| h-x1-090 | ✓ | 79 | - | mv draft-notes.txt meeting-notes.txt |
| h-x1-091 | ✗ | 164 | - | mv ~/Downloads/photo.jpg ~/Pictures/ && ls ~/Pictures/photo.jpg |
| h-x1-092 | ✓ | 83 | - | rm -i cache.db |
| h-x1-093 | ✓ | 67 | - | rm -rf scratch |
| h-x1-094 | ✓ | 66 | - | date |
| h-x1-095 | ✓ | 101 | - | date +"%Y-%m-%d" |
| h-x1-096 | ✓ | 58 | - | date -u |
| h-x1-097 | ✓ | 89 | - | diff -u config.old config.new |
| h-x1-098 | ✓ | 105 | - | diff -y users-old.csv users-new.csv |
| h-x1-099 | ✓ | 119 | - | ln -s release-2.4.1 latest |
| h-x1-100 | ✓ | 117 | - | ln -s ~/.dotfiles/vimrc ~/.vimrc |
| h-x2-001 | ✓ | 52 | - | git status |
| h-x2-002 | ✗ | 66 | - | ls | xargs |
| h-x2-003 | ✗ | 90 | - | git grep TODO app.py |
| h-x2-004 | ✓ | 52 | - | ping google.com |
| h-x2-005 | ✓ | 54 | - | mkdir projects/api |
| h-x2-006 | ✓ | 52 | - | cat notes.txt |
| h-x2-007 | ✓ | 50 | - | which python3 |
| h-x2-008 | ✓ | 100 | - | chmod +x deploy.sh && ./deploy.sh |
| h-x2-009 | ✓ | 78 | - | sudo nano /etc/hosts |
| h-x2-010 | ✓ | 91 | - | sudo mkdir /opt/ingest |
| h-x2-011 | ✗ | 87 | - | nohup python3 app.py & |
| h-x2-012 | ✓ | 126 | - | sudo rm /var/log/app/2023.log |
| h-x2-013 | ✓ | 145 | - | sudo cp mycli /usr/local/bin |
| h-x2-014 | ✗ | 85 | - | cat /etc/sudoers |
| h-x2-015 | ✓ | 70 | - | cd ~/Documents && pwd |
| h-x2-016 | ✓ | 64 | - | mkdir -p src/components/header |
| h-x2-017 | ✓ | 140 | - | cd $(pwd)/$(dirname $0) && ./run.sh |
| h-x2-018 | ✗ | 188 | - | unzip -l ~/Downloads/README.md.zip |
| h-x2-019 | ✗ | 73 | - | tail -f app.log |
| h-x2-020 | ✗ | 69 | - | find . -name orders.csv |
| h-x2-021 | ✓ | 68 | - | rm -rf website_backup/ |
| h-x2-022 | ✓ | 74 | - | cp -r assets dist/ |
| h-x2-023 | ✗ | 105 | - | scp public_html alex@web1:~/ |
| h-x2-024 | ✗ | 126 | - | grep TODO README.md | head -n 5 |
| h-x2-025 | ✓ | 96 | - | tar xvf backup.tar.gz |
| h-x2-026 | ✗ | 169 | - | ssh -i ~/.ssh/id_ed25519 user@host |
| h-x2-027 | ✗ | 217 | - | top -b -n 1 | grep -i 'PID' | awk '{print $1}' | xargs kill -9 |
| h-x2-028 | ✗ | 185 | - | tail -n 10 app.log | cat |
| h-x2-029 | ✗ | 139 | - | cat secrets.env | base64 |
| h-x2-030 | ✗ | 119 | - | jq -r '.payload' payload.b64 |
| h-x2-031 | ✗ | 256 | - | sha256sum release-2.4.tar.gz > release-2.4.tar.gz.sha256 |
| h-x2-032 | ✓ | 96 | - | md5sum dump.sql |
| h-x2-033 | ✗ | 150 | - | od -An -N 128 -t x1 firmware.bin |
| h-x2-034 | ✓ | 58 | - | file mystery.dat |
| h-x2-035 | ✗ | 156 | - | readelf -s libcore.a | grep core |
| h-x2-036 | ✓ | 86 | - | wc -l access.log |
| h-x2-037 | ✓ | 85 | - | stat -c %s photo.raw |
| h-x2-038 | ✓ | 263 | - | iconv -f ISO-8859-1 -t UTF-8 legacy.txt > legacy_utf8.txt |
| h-x2-039 | ✗ | 208 | - | iconv -f UTF-8 README.md > README.md.utf8 |
| h-x2-040 | ✗ | 144 | - | od -t x1 -N 16 packet.bin |
| h-x2-041 | ✓ | 95 | - | tar -czf client.tar.gz client/ |
| h-x2-042 | ✓ | 170 | - | tar -xzvf client.tar.gz -C /tmp |
| h-x2-043 | ✗ | 112 | - | tar -tf backup.tar.gz |
| h-x2-044 | ✓ | 165 | - | zip -r reports.zip reports/ |
| h-x2-045 | ✓ | 209 | - | unzip invoices-2024.zip -d invoices |
| h-x2-046 | ✗ | 92 | - | unzip -l firmware.zip |
| h-x2-047 | ✓ | 121 | - | unzip -d ~/restore/ old_site.zip |
| h-x2-048 | ✗ | 99 | - | gzip -c access.log > access.log.gz |
| h-x2-049 | ✗ | 114 | - | zcat access.log.gz | grep "123" |
| h-x2-050 | ✗ | 183 | - | tar -czf photos.tar.gz -C photos/ . |
| h-x2-051 | ✓ | 76 | - | ps aux | grep nginx |
| h-x2-052 | ✗ | 358 | - | top -bn1 | awk 'NR>1{print $2,$1}' | sort -nr | head -n 5 |
| h-x2-053 | ✗ | 99 | - | kill -9 4217 |
| h-x2-054 | ✗ | 65 | - | jobs | wc -l |
| h-x2-055 | ✓ | 46 | - | fg 1 |
| h-x2-056 | ✗ | 76 | - | nohup python script.py & |
| h-x2-057 | ✓ | 114 | - | nohup ./train.sh & |
| h-x2-058 | ✓ | 108 | - | nohup python3 cleanup.py & |
| h-x2-059 | ✗ | 99 | - | jobs -p | xargs kill |
| h-x2-060 | ✗ | 320 | - | tail -n 1000000 server.log | head -n 1000010 |
| h-x2-061 | ✓ | 123 | - | grep -c "ERROR" app.log |
| h-x2-062 | ✗ | 140 | - | tail -n +10 app.log | grep -v DEBUG |
| h-x2-063 | ✗ | 95 | - | grep -i "denied" auth.log |
| h-x2-064 | ✗ | 154 | - | find src/ -type f -exec grep -H "FIXME" {} \; |
| h-x2-065 | ✗ | 218 | - | cut -d: -f1 /etc/passwd |
| h-x2-066 | ✗ | 240 | - | tail -n +40 notes.md | head -n 60 |
| h-x2-067 | ✗ | 112 | - | sed '/^$/d' draft.txt |
| h-x2-068 | ✓ | 138 | - | sed -i 's/color/colour/g' essay.md |
| h-x2-069 | ✗ | 341 | - | cut -d',' -f3 sales.tsv | paste -sd+ - | bc |
| h-x2-070 | ✓ | 223 | - | df -h | awk '{print $5}' |
| h-x2-071 | ✗ | 478 | - | tail -n +100000 app.log | head -n 100010 |
| h-x2-072 | ✗ | 241 | - | ssh web1 alex |
| h-x2-073 | ✗ | 275 | - | ssh -i ~/Documents/my_deploy_key.pem web1 |
| h-x2-074 | ✗ | 1073 | - | ssh -L 2222:localhost:22 alex@10.0.0.14 |
| h-x2-075 | ✗ | 280 | - | ssh -f -L 8080:db1:5432:postgres |
| h-x2-076 | ✗ | 112 | - | ssh-copy-id web1 |
| h-x2-077 | ✗ | 162 | - | scp build.tar.gz web1:/home/web1/ |
| h-x2-078 | ✓ | 158 | - | scp -r dist/ web1:/var/www |
| h-x2-079 | ✓ | 192 | - | scp -P 2200 server.log web1:/var/www/ |
| h-x2-080 | ✗ | 221 | - | rsync -avz --progress --delete-after site/ backup1/ |
| h-x2-081 | ✗ | 213 | - | curl -L -o toolkit.zip https://example.com/files/toolkit.zip |
| h-x2-082 | ✗ | 279 | - | curl -s https://api.example.com/data | jq '.' > data.json |
| h-x2-083 | ✗ | 102 | - | curl -L https://example.com/file.zip |
| h-x2-084 | ✗ | 211 | - | mount -o loop /path/to/big.iso /mnt/bigiso |
| h-x2-085 | ✗ | 294 | - | wget --progress=bar https://example.com/sdk-9.1.tar.gz |
| h-x2-086 | ✓ | 134 | - | wget --quiet --no-check-certificate https://www.robots.txt |
| h-x2-087 | ✗ | 277 | - | curl -sL https://example.com/urls.txt | xargs curl -o |
| h-x2-088 | ✓ | 67 | - | echo $EDITOR |
| h-x2-089 | ✓ | 66 | - | env | grep ^PATH= |
| h-x2-090 | ✓ | 112 | - | export API_KEY=sk-test-123 |
| h-x2-091 | ✓ | 362 | - | echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc |
| h-x2-092 | ✗ | 275 | - | python3 worker.py --debug --no-export |
| h-x2-093 | ✓ | 270 | - | source ~/.zshrc & |
| h-x2-094 | ✓ | 578 | - | find src/ -type f -name "*.py" | wc -l |
| h-x2-095 | ✗ | 539 | - | if [ -z "$(git ls-files | wc -l)" ]; then echo "No changes to test" && exit 0; f |
| h-x2-096 | ✗ | 67 | - | date > activity.log |
| h-x2-097 | ✗ | 69 | - | history | grep ssh |
| h-x2-098 | ✗ | 94 | - | make > build.log 2>&1 |
| h-x2-099 | ✗ | 289 | - | find . -name "*.conf" -exec chmod 644 {} \; |
| h-x2-100 | ✗ | 136 | - | make release && cp -r dist/ ./cli/ && cd ./cli |
