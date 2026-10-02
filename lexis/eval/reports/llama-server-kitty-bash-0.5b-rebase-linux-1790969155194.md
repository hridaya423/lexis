# eval: llama-server / kitty-bash-0.5b (rebase-linux)
- mode: plain · dataset holdout.jsonl#f0c25df4a12b6d3d · repeat 1
- pass: 266/713 (37%)
- cold p50 108ms p95 285ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| h-l1-001 | ✗ | 93 | - | cp nginx.conf nginx.conf.bak |
| h-l1-002 | ✗ | 119 | - | mv draft-post.md published-post.md |
| h-l1-003 | ✓ | 159 | - | mkdir -p ~/work/2024/q4/reports |
| h-l1-004 | ✗ | 166 | - | rm -rf ~/projects/api/node_modules |
| h-l1-005 | ✗ | 118 | - | yes | rm -i ~/logs/*.log |
| h-l1-006 | ✗ | 70 | - | touch api/.env |
| h-l1-007 | ✗ | 88 | - | touch cache/last-run.stamp |
| h-l1-008 | ✗ | 137 | - | cp -r assets/ ~/backups/ |
| h-l1-009 | ✗ | 112 | - | mv ~/Downloads/trip.mp4 ~/Videos/ |
| h-l1-010 | ✗ | 143 | - | rsync -av --exclude=.git ~/Documents /mnt/usb/docs |
| h-l1-011 | ✗ | 113 | - | rsync --dry-run ./site/ /srv/www |
| h-l1-012 | ✗ | 283 | - | rsync -a --files-from=<(find ./dist -type f) dist/ /srv/app/ |
| h-l1-013 | ✗ | 193 | - | mkdir -p reports && make > reports/$(date +%F).html |
| h-l1-014 | ✗ | 127 | - | rm -rf ./tmp-scratch |
| h-l1-015 | ✓ | 155 | - | cp -a /etc/app-config /etc/app-config_backup/ |
| h-l1-016 | ✗ | 101 | - | tar -czf site-backup.tar.gz site/ |
| h-l1-017 | ✓ | 75 | - | tar -xzvf project.tar.gz |
| h-l1-018 | ✗ | 99 | - | tar tzvf backup.tar.gz | grep -v / |
| h-l1-019 | ✗ | 126 | - | tar xjvf logs.tar.bz2 -C /tmp/logs |
| h-l1-020 | ✓ | 98 | - | tar -xvf linux-6.9.tar.xz |
| h-l1-021 | ✗ | 223 | - | tar -czf ~/backup/app_$(date +%F).tar.gz ~/code/app --exclude=.git |
| h-l1-022 | ✗ | 84 | - | zip -r deploy.zip deploy/ |
| h-l1-023 | ✓ | 99 | - | unzip release.zip -d /opt/release |
| h-l1-024 | ✗ | 66 | - | unzip release.zip |
| h-l1-025 | ✗ | 107 | - | gzip -c big.csv > big.csv.gz |
| h-l1-026 | ✓ | 139 | - | zcat access.log.gz | head -n 10 |
| h-l1-027 | ✗ | 83 | - | tar xvf README.7z |
| h-l1-028 | ✗ | 236 | - | tar -xzvf backup.tar.gz etc/nginx.conf |
| h-l1-029 | ✓ | 78 | - | chmod +x script.sh |
| h-l1-030 | ✗ | 89 | - | chmod 755 deploy.sh |
| h-l1-031 | ✗ | 150 | - | find ./bin -type f -exec chmod +x {} \; |
| h-l1-032 | ✗ | 98 | - | chmod -R go-w secret.txt |
| h-l1-033 | ✗ | 78 | - | chmod 400 ~/.ssh/id_rsa |
| h-l1-034 | ✓ | 87 | - | chown -R alex:www-data /var/www/site |
| h-l1-035 | ✗ | 76 | - | chown alex report.pdf |
| h-l1-036 | ✗ | 68 | - | chgrp engineering shared |
| h-l1-037 | ✗ | 108 | - | chown -R alex:alex /srv/data |
| h-l1-038 | ✗ | 93 | - | ls -lA /srv/data |
| h-l1-039 | ✗ | 160 | - | sudo chgrp -R qa /srv/shared |
| h-l1-040 | ✗ | 194 | - | find /srv/old -type f -exec chmod o-r {} \; |
| h-l1-041 | ✗ | 129 | - | cp --preserve=timestamps deploy.sh cleanup.sh |
| h-l1-042 | ✗ | 154 | - | ln -s /opt/toolkit/4.2 /opt/toolkit/4.3 |
| h-l1-043 | ✗ | 114 | - | ln -sf v3.1 /usr/local/bin |
| h-l1-044 | ✓ | 148 | - | ln -s /opt/firefox/firefox ~/bin/ff |
| h-l1-045 | ✗ | 51 | - | which python |
| h-l1-046 | ✓ | 108 | - | readlink -f ./conf/app.yaml |
| h-l1-047 | ✗ | 300 | - | find ~/projects -type l -exec readlink {} \; | xargs -I{} basename {} |
| h-l1-048 | ✗ | 129 | - | ln -s photos.db photos.db.hard |
| h-l1-049 | ✓ | 95 | - | readlink /etc/localtime |
| h-l1-050 | ✗ | 90 | - | rm ~/bin/stale-sim |
| h-l1-051 | ✗ | 182 | - | sed -i 's|draft|/srv/docs/draft-v2.pdf|' ~/links |
| h-l1-052 | ✓ | 89 | - | find /usr/local/bin -type l |
| h-l1-053 | ✗ | 92 | - | find /var/log -name "*.log" |
| h-l1-054 | ✓ | 75 | - | find ~/code -iname readme |
| h-l1-055 | ✓ | 74 | - | find ./src -type d |
| h-l1-056 | ✗ | 202 | - | find ~/cache -type f -mtime +30 -exec rm {} \; |
| h-l1-057 | ✓ | 122 | - | find /srv/uploads -type f -size +500M |
| h-l1-058 | ✓ | 133 | - | find ./scratch -type f -empty |
| h-l1-059 | ✗ | 222 | - | find ./fw -type f -exec file {} \; |
| h-l1-060 | ✗ | 261 | - | find ./src -type f -name "*.py" | xargs grep -E "TODO|todo" |
| h-l1-061 | ✓ | 104 | - | find /tmp/work -mmin -15 |
| h-l1-062 | ✓ | 154 | - | find /srv/data -user alex -type f |
| h-l1-063 | ✓ | 179 | - | find /srv/share -maxdepth 2 -type f -perm -o+w |
| h-l1-064 | ✗ | 130 | - | find ./staging -type d -empty -delete |
| h-l1-065 | ✗ | 128 | - | find /data -type f -size +1G | xargs du -h |
| h-l1-066 | ✗ | 254 | - | find ./public -type f -exec chmod 644 {} \; |
| h-l1-067 | ✓ | 52 | - | df -h |
| h-l1-068 | ✗ | 65 | - | df | grep /dev/disk0s2 |
| h-l1-069 | ✗ | 52 | - | du -h ~/Videos |
| h-l1-070 | ✓ | 317 | - | du -h --max-depth=1 | sort -hr |
| h-l1-071 | ✗ | 253 | - | find . -type d | sort -rn | head -n 10 |
| h-l1-072 | ✗ | 89 | - | xdg-open ~ |
| h-l1-073 | ✗ | 281 | - | find /srv -type f -exec du -h {} + | sort -rh | head -n 15 |
| h-l1-074 | ✗ | 214 | - | find . -type f -name '*.[ch]' | xargs wc -l |
| h-l1-075 | ✗ | 129 | - | find / -depth -name README.md |
| h-l1-076 | ✓ | 91 | - | df -h /srv/data |
| h-l1-077 | ✗ | 55 | - | lsblk |
| h-l1-078 | ✗ | 242 | - | find ~/media -type f -name "*.mp4" | xargs wc -c | tail -1 |
| h-l1-079 | ✗ | 105 | - | find / -name authorized_keys |
| h-l1-080 | ✓ | 66 | - | updatedb |
| h-l1-081 | ✗ | 71 | - | locate *JOURNAL* |
| h-l1-082 | ✗ | 63 | - | locate --count *.conf |
| h-l1-083 | ✗ | 66 | - | locate foo | grep bar |
| h-l1-084 | ✗ | 50 | - | updatedb |
| h-l1-085 | ✗ | 146 | - | mv old-report.pdf ~/old_report.pdf |
| h-l1-086 | ✗ | 109 | - | ls -l /var/spool |
| h-l1-087 | ✗ | 64 | - | rm report.pdf |
| h-l1-088 | ✗ | 219 | - | find /tmp -type d -mtime +10 -exec rm -rf {} \; |
| h-l1-089 | ✗ | 153 | - | find / -type d -empty -delete |
| h-l1-090 | ✗ | 529 | - | find . -type f -size +10M | xargs ls -l | awk '{print $9}' | xargs ls -l | awk ' |
| h-l1-091 | ✗ | 169 | - | lsof -i:5432 | grep postgres |
| h-l1-092 | ✗ | 149 | - | lsof -c firefox -i:8080 |
| h-l1-093 | ✗ | 441 | - | lsof -p 2153 | grep -v 'PID' | awk '{print $2}' | xargs -I{} ls -l /var/log/big. |
| h-l1-094 | ✗ | 722 | - | find /var/log -type f -name "*.log" -exec ls -l {} \; | awk '{print $9}' | xargs |
| h-l1-095 | ✗ | 135 | - | stat -c %a ~/.ssh/config |
| h-l1-096 | ✓ | 82 | - | du -b dump.sql |
| h-l1-097 | ✓ | 151 | - | stat -c %y app.log | cut -d'/' -f1 |
| h-l1-098 | ✗ | 104 | - | date -d "45 days ago" +%s |
| h-l1-099 | ✓ | 179 | - | date -d @1700000000 |
| h-l1-100 | ✗ | 164 | - | sed -i 's/http:\/\/https:\/\/g' urls.txt |
| h-l1-101 | ✗ | 282 | - | cp app.conf app.conf.bak && sed -i 's/PORT=80/PORT=8080/g' app.conf |
| h-l1-102 | ✗ | 119 | - | sed -i '/^$/d' notes.md |
| h-l1-103 | ✗ | 283 | - | find . -mindepth 1 -maxdepth 1 -type d | xargs wc -l |
| h-l1-104 | ✗ | 99 | - | ls -lS |
| h-l1-105 | ✗ | 150 | - | find . -name "*.o" | xargs rm -f |
| h-l1-106 | ✗ | 412 | - | grep -oP 'api\.log(?:\s|$)' api.log | perl -pe 's/(\d+ms)\s//g' | sort -n | uniq |
| h-l1-107 | ✗ | 143 | - | grep -iR "error|fatal" /var/log/syslog |
| h-l1-108 | ✗ | 180 | - | tail -f /var/log/auth.log | grep user=xxx |
| h-l1-109 | ✓ | 155 | - | du -h --max-depth=2 /srv | sort -hr |
| h-l1-110 | ✗ | 118 | - | stat -c %U /etc/passwd |
| h-l2-001 | ✗ | 305 | - | find . -type f -name "*.c" -exec grep -nH "TODO" {} \; |
| h-l2-002 | ✗ | 128 | - | tail -n +3 app.log | head -n 10 |
| h-l2-003 | ✗ | 126 | - | tail -n +6 server.log | head -n 10 |
| h-l2-004 | ✗ | 209 | - | tail -n +6 cron.log | head -n 5 |
| h-l2-005 | ✓ | 578 | - | grep -oE '\b([0-9]{1,3}\.){3}[0-9]{1,3}\b' access.log | sort | uniq -c | sort -n |
| h-l2-006 | ✗ | 1030 | - | perl -pe 's/(\d{4})-(\d{2})-(\d{2})/\1-\2-\3/g' events.txt > events_YYYY-MM-DD.t |
| h-l2-007 | ✓ | 275 | - | grep -vE 'DEBUG|INFO' app.log |
| h-l2-008 | ✗ | 253 | - | find . -type f -exec grep -H SECRET_KEY {} \; |
| h-l2-009 | ✗ | 230 | - | grep -i "error" /var/log/syslog |
| h-l2-010 | ✓ | 237 | - | grep -E "error|fail" build.log |
| h-l2-011 | ✗ | 292 | - | sed -i 's/localhost:8080/api.internal:9090/g' settings.conf |
| h-l2-012 | ✗ | 112 | - | sed -i '12d' notes.txt |
| h-l2-013 | ✗ | 166 | - | sed -i 's/DEBUG/#DEBUG/g' app.conf |
| h-l2-014 | ✗ | 163 | - | tail -n +20 dump.sql | head -n 40 |
| h-l2-015 | ✗ | 116 | - | cut -d: -f1 /etc/passwd |
| h-l2-016 | ✗ | 220 | - | tail -n 1 app.log | head -n 50 |
| h-l2-017 | ✗ | 105 | - | cat q1.csv | head -n 1 |
| h-l2-018 | ✗ | 141 | - | cat sizes.txt | awk '{s+=$3} END {print s}' |
| h-l2-019 | ✗ | 317 | - | awk '{print $2}' scores.txt | sort -n | uniq -c | sort -nr | head -n 1 |
| h-l2-020 | ✗ | 146 | - | cut -d'/' -f1 paths.txt |
| h-l2-021 | ✓ | 180 | - | du -h */ | sort -hr | head -n 1 |
| h-l2-022 | ✓ | 78 | - | sort -V versions.txt |
| h-l2-023 | ✓ | 69 | - | sort -u emails.txt |
| h-l2-024 | ✗ | 111 | - | sort -t, -k2,2n results.txt |
| h-l2-025 | ✗ | 171 | - | sort -t ':' -k2,2n requests.txt | head -n 10 |
| h-l2-026 | ✗ | 119 | - | sort names.txt | uniq -c |
| h-l2-028 | ✗ | 226 | - | tr '[:upper:]' '[:lower:]' < README.md |
| h-l2-029 | ✗ | 153 | - | tr -d '0-9' < data.txt |
| h-l2-030 | ✗ | 199 | - | tr -s '\t' ',' < data.tsv > data.csv |
| h-l2-031 | ✗ | 190 | - | find /tmp/build -type f -name "*.tmp" -exec rm {} \; |
| h-l2-032 | ✗ | 98 | - | mkdir -p ~/backups/teams/ |
| h-l2-033 | ✗ | 142 | - | gzip -c biglogs.txt | split -l 8 - biglogs_ |
| h-l2-034 | ✗ | 101 | - | tail -n 20 error.log |
| h-l2-035 | ✓ | 103 | - | tail -n +100 long.txt |
| h-l2-036 | ✓ | 89 | - | tail -f /var/log/nginx/access.log |
| h-l2-037 | ✓ | 77 | - | wc -l dump.sql |
| h-l2-038 | ✗ | 227 | - | paste -sd',' - < names.txt > emails.txt |
| h-l2-039 | ✗ | 328 | - | join -t, -1 1 -2 1 <(sort users.txt) <(sort roles.txt) |
| h-l2-040 | ✗ | 89 | - | comm -12 old_allow.txt new_allow.txt |
| h-l2-041 | ✗ | 76 | - | mounts.txt | column -t |
| h-l2-042 | ✓ | 146 | - | jq -r '.[] | .username' users.json |
| h-l2-043 | ✗ | 206 | - | jq -r '.[] | select(.age>30)' people.json |
| h-l2-044 | ✗ | 115 | - | jq . data.json | wc -l |
| h-l2-045 | ✓ | 155 | - | ps aux --sort=-%mem | head -n 5 |
| h-l2-046 | ✓ | 98 | - | git status --porcelain | wc -l |
| h-l2-047 | ✓ | 69 | - | git log --oneline |
| h-l2-048 | ✓ | 107 | - | git log -1000 -- auth.py |
| h-l2-049 | ✗ | 260 | - | git log --since="2 weeks ago" --pretty=format:"%h %s" |
| h-l2-050 | ✗ | 279 | - | gh search repo "repo-name" --json branches,name |
| h-l2-051 | ✓ | 205 | - | git diff --name-only HEAD..main | wc -l |
| h-l2-052 | ✓ | 132 | - | git diff --staged |
| h-l2-053 | ✓ | 182 | - | git diff main..my-feature/login |
| h-l2-054 | ✗ | 74 | - | git log --stat |
| h-l2-055 | ✗ | 60 | - | sleep 10 |
| h-l2-056 | ✓ | 52 | - | git stash pop |
| h-l2-057 | ✓ | 56 | - | git stash list |
| h-l2-058 | ✓ | 73 | - | git branch -a |
| h-l2-059 | ✗ | 362 | - | gh api /repos/user/repo/branches --method POST -d '{"ref":"refs/heads/feat/payme |
| h-l2-060 | ✗ | 102 | - | git reset --soft HEAD~1 |
| h-l2-061 | ✗ | 136 | - | git checkout --orphan old-ui && git reset --hard HEAD |
| h-l2-062 | ✗ | 74 | - | git rm --cached index.html |
| h-l2-063 | ✓ | 136 | - | git add README.md && git commit -m "Add rate limiting" |
| h-l2-064 | ✗ | 146 | - | git commit -m "Update" |
| h-l2-065 | ✗ | 108 | - | git log --oneline -1 |
| h-l2-066 | ✓ | 110 | - | git tag v2.4.0 |
| h-l2-067 | ✓ | 84 | - | git push --tags |
| h-l2-068 | ✓ | 190 | - | git blame -L 80-90 server.js |
| h-l2-069 | ✗ | 87 | - | git config --get remote.origin.url |
| h-l2-070 | ✗ | 93 | - | gh repo add --upstream user/repo |
| h-l2-071 | ✗ | 59 | - | git rebase main |
| h-l2-072 | ✓ | 87 | - | git rebase main |
| h-l2-073 | ✓ | 116 | - | git reset --hard HEAD |
| h-l2-074 | ✓ | 96 | - | git reset --soft HEAD~1 |
| h-l2-075 | ✗ | 91 | - | git log --graph --oneline |
| h-l2-076 | ✗ | 116 | - | git pull origin a1b2c3d |
| h-l2-077 | ✓ | 74 | - | git clean -fd |
| h-l2-078 | ✓ | 129 | - | git bisect good abc123 |
| h-l2-079 | ✓ | 106 | - | git bisect bad |
| h-l2-080 | ✗ | 258 | - | git log -9f8e7d6 | head -n 1 |
| h-l2-081 | ✗ | 75 | - | dig up |
| h-l2-082 | ✗ | 121 | - | history | grep 152 | head -1 |
| h-l2-083 | ✗ | 37 | - | ll |
| h-l2-084 | ✗ | 76 | - | alias rm='rm -i' |
| h-l2-085 | ✓ | 71 | - | export PATH=$HOME/bin:$PATH |
| h-l2-086 | ✓ | 62 | - | export EDITOR=vim |
| h-l2-087 | ✓ | 52 | - | which python3 |
| h-l2-088 | ✗ | 225 | - | which ls | xargs -I{} locate {} 2>/dev/null | head -1 |
| h-l2-089 | ✓ | 46 | - | type cd |
| h-l2-090 | ✗ | 102 | - | ls > files.txt |
| h-l2-091 | ✗ | 78 | - | echo "$(date)" >> log.txt |
| h-l2-092 | ✗ | 89 | - | make > err.log 2>&1 |
| h-l2-093 | ✗ | 121 | - | nohup ./run.sh > out.log 2>&1 & |
| h-l2-094 | ✓ | 120 | - | mysql -u alex -p mydb < queries.sql |
| h-l2-095 | ✓ | 69 | - | ps aux | grep nginx |
| h-l2-096 | ✗ | 111 | - | watch -n 1 npm test > build.log |
| h-l2-097 | ✗ | 235 | - | nohup ./deploy.sh > deploy.log 2>&1 & |
| h-l2-098 | ✗ | 107 | - | find . -type f | wc -l |
| h-l2-099 | ✗ | 105 | - | find . -name "*.log" | xargs rm |
| h-l2-100 | ✗ | 128 | - | cat data1.csv | cut -d',' -f1 |
| h-l2-101 | ✗ | 243 | - | mkdir -p ~/projects/my_project && cd ~/projects/my_project |
| h-l2-102 | ✗ | 58 | - | cd `pwd` |
| h-l2-103 | ✗ | 32 | - | cd /etc |
| h-l2-104 | ✗ | 33 | - | cd ~/Documents |
| h-l2-105 | ✓ | 40 | - | pwd |
| h-l2-106 | ✗ | 41 | - | echo $BASH_SOURCE |
| h-l2-107 | ✓ | 66 | - | echo $PATH | tr ':' '\n' |
| h-l2-108 | ✗ | 185 | - | sudo $ |
| h-l2-109 | ✗ | 101 | - | scan.sh | tee /dev/null |
| h-l2-110 | ✗ | 102 | - | yes | head -n 1 |
| h-l3-001 | ✗ | 102 | - | systemctl is-active --quiet nginx |
| h-l3-002 | ✓ | 80 | - | sudo systemctl start postgresql |
| h-l3-003 | ✗ | 59 | - | redis-cli shutdown |
| h-l3-004 | ✗ | 188 | - | docker service update --bouncetime 3600 daemon-name |
| h-l3-005 | ✓ | 101 | - | sudo systemctl enable sshd |
| h-l3-006 | ✗ | 61 | - | sudo systemctl stop bluetooth |
| h-l3-007 | ✓ | 81 | - | systemctl daemon-reload |
| h-l3-008 | ✗ | 112 | - | systemctl list-units --failed |
| h-l3-009 | ✗ | 141 | - | tail -f /var/log/nginx/access.log |
| h-l3-010 | ✗ | 147 | - | grep --color=always "error" myapp/unit/ |
| h-l3-011 | ✗ | 364 | - | tail -n 100 /var/log/nginx/access.log | grep '2023-04-01' |
| h-l3-012 | ✗ | 147 | - | sudo apt-get update && sudo apt-get install web-browser |
| h-l3-013 | ✗ | 135 | - | timedatectl | grep "Time zone" |
| h-l3-014 | ✓ | 89 | - | who | wc -l |
| h-l3-015 | ✗ | 99 | - | top -bn1 | grep init |
| h-l3-016 | ✓ | 85 | - | nginx -s reload --force |
| h-l3-017 | ✗ | 105 | - | systemctl is-active --quiet postgresql |
| h-l3-018 | ✗ | 65 | - | docker ps -a |
| h-l3-019 | ✗ | 94 | - | cat /etc/systemd/system/myapp.service |
| h-l3-020 | ✗ | 96 | - | systemctl list-units --type=service |
| h-l3-021 | ✗ | 88 | - | journalctl --vacuum-old=7 |
| h-l3-022 | ✗ | 44 | - | sudo reboot |
| h-l3-023 | ✗ | 57 | - | journalctl -b |
| h-l3-024 | ✗ | 146 | - | git log --oneline --graph --all --decorate --max-count=10 |
| h-l3-025 | ✗ | 142 | - | systemctl show sshd --property=ActiveScope,DefaultEnvironment |
| h-l3-026 | ✗ | 70 | - | which systemd |
| h-l3-027 | ✗ | 112 | - | find /usr/lib -type f | xargs ls -l |
| h-l3-028 | ✗ | 54 | - | journalctl -f |
| h-l3-029 | ✗ | 133 | - | docker run --privileged -it ubuntu:18.04 /bin/bash |
| h-l3-030 | ✓ | 64 | - | sudo systemctl mask cups |
| h-l3-031 | ✓ | 58 | - | ps aux |
| h-l3-032 | ✗ | 195 | - | ps aux | awk '{print $2,$1}' |
| h-l3-033 | ✓ | 117 | - | ps aux | grep node | awk '{print $2}' |
| h-l3-034 | ✓ | 66 | - | kill 4321 |
| h-l3-035 | ✗ | 70 | - | kill 4321 |
| h-l3-036 | ✓ | 76 | - | pkill -f train.py |
| h-l3-037 | ✓ | 148 | - | top -b -n 1 -s 0.1 |
| h-l3-038 | ✗ | 91 | - | time ./render.sh |
| h-l3-039 | ✗ | 129 | - | kill -15 2201 |
| h-l3-040 | ✗ | 78 | - | jobs | wc -l |
| h-l3-041 | ✓ | 55 | - | fg 2 |
| h-l3-042 | ✗ | 53 | - | fg job1 |
| h-l3-043 | ✗ | 67 | - | export.sh | tee export.log |
| h-l3-044 | ✗ | 74 | - | jobs | xargs kill -9 |
| h-l3-045 | ✓ | 82 | - | ps aux | grep alex |
| h-l3-046 | ✗ | 381 | - | top -bn1 | awk 'NR>1{print $2}' | sort | uniq -c | sort -nr | head -n 10 |
| h-l3-047 | ✓ | 183 | - | lsof -i :8080 |
| h-l3-048 | ✓ | 146 | - | fuser -k 3000/tcp |
| h-l3-049 | ✓ | 96 | - | ps aux | wc -l |
| h-l3-050 | ✗ | 326 | - | ps -p 1234 | grep -v PID | awk '{print $0}' |
| h-l3-051 | ✗ | 135 | - | git clone --fork-point HEAD https://github.com/user/repo.git |
| h-l3-052 | ✓ | 99 | - | ps aux | grep chrome | wc -l |
| h-l3-053 | ✓ | 253 | - | kill -HUP `cat /var/run/mydaemon.pid` |
| h-l3-054 | ✓ | 98 | - | nohup ./backup.sh & |
| h-l3-055 | ✗ | 58 | - | pstree -p |
| h-l3-056 | ✓ | 49 | - | free -h |
| h-l3-057 | ✓ | 269 | - | free -m | awk '/Mem:/ {print $3/$2*1024}' |
| h-l3-058 | ✗ | 115 | - | vmstat 1 5 |
| h-l3-059 | ✓ | 93 | - | cat /proc/meminfo |
| h-l3-060 | ✗ | 183 | - | free -m | awk '/Mem:/ {print $3/$2 * 100 "%"}' |
| h-l3-061 | ✗ | 99 | - | dmesg | grep 'swap' |
| h-l3-062 | ✗ | 124 | - | ps aux | grep oom |
| h-l3-063 | ✗ | 102 | - | top -bn1 | grep 'procs' |
| h-l3-064 | ✗ | 170 | - | watch -n 2 'cat /proc/meminfo' |
| h-l3-065 | ✗ | 91 | - | sysctl vm.kmem_size |
| h-l3-066 | ✗ | 248 | - | vmstat 1 1 | awk '{print $2,$4}' |
| h-l3-067 | ✗ | 178 | - | free -m | awk '/Mem:/ {print $3/$2 * 100 "%"}' |
| h-l3-068 | ✓ | 52 | - | uname -r |
| h-l3-069 | ✓ | 55 | - | uname -a |
| h-l3-070 | ✓ | 106 | - | cat /etc/os-release | grep ^ID= |
| h-l3-071 | ✓ | 111 | - | cat /etc/os-release |
| h-l3-072 | ✓ | 118 | - | dmesg | tail -n 20 |
| h-l3-073 | ✗ | 167 | - | dmesg | grep -v '^[^S]' |
| h-l3-074 | ✗ | 68 | - | lsmod |
| h-l3-075 | ✗ | 111 | - | sysctl net.netfilter.nf_conntrack |
| h-l3-076 | ✗ | 88 | - | modinfo e1000e |
| h-l3-077 | ✓ | 49 | - | modprobe loop |
| h-l3-078 | ✗ | 97 | - | sudo apt-get remove snd_pcsp |
| h-l3-079 | ✓ | 37 | - | uptime |
| h-l3-080 | ✓ | 54 | - | uname -m |
| h-l3-081 | ✓ | 50 | - | hostname |
| h-l3-082 | ✗ | 192 | - | lscpu | grep 'CPU\(s\):' |
| h-l3-083 | ✓ | 51 | - | who |
| h-l3-084 | ✗ | 232 | - | who | awk '{print $1}' | sort | uniq -c | sort -nr |
| h-l3-085 | ✓ | 116 | - | last | head -n 10 |
| h-l3-086 | ✗ | 52 | - | groups alex |
| h-l3-087 | ✓ | 130 | - | sudo useradd -m -s /bin/bash priya |
| h-l3-088 | ✓ | 92 | - | sudo usermod -aG docker alex |
| h-l3-089 | ✓ | 47 | - | whoami |
| h-l3-090 | ✗ | 166 | - | grep 'Failed password' /var/log/auth.log | tail -n 10 |
| h-l3-091 | ✗ | 51 | - | who |
| h-l3-092 | ✓ | 109 | - | chsh -s /bin/zsh alex |
| h-l3-093 | ✓ | 79 | - | crontab -l |
| h-l3-094 | ✓ | 96 | - | crontab -e |
| h-l3-095 | ✗ | 83 | - | crontab -l |
| h-l3-096 | ✓ | 99 | - | crontab -e |
| h-l3-097 | ✗ | 191 | - | systemctl list-timers --type=timer | tail -n +3 |
| h-l3-098 | ✗ | 109 | - | fstrim.timer |
| h-l3-099 | ✗ | 116 | - | crontab -l | crontab - |
| h-l3-100 | ✗ | 309 | - | crontab -l | grep "0 2 * * * /usr/local/bin/cleanup.sh" |
| h-l3-101 | ✗ | 149 | - | cat /proc/sys/kernel/rlimit_nofile |
| h-l3-102 | ✗ | 75 | - | ulimit -n |
| h-l3-103 | ✗ | 71 | - | stty -o |
| h-l3-104 | ✗ | 124 | - | ps -p 2231 -o pid,cmd |
| h-l3-105 | ✗ | 112 | - | sudo setcap +e 2231 |
| h-l3-106 | ✓ | 118 | - | env | grep ^PATH= |
| h-l3-107 | ✓ | 72 | - | echo $PATH |
| h-l3-108 | ✓ | 81 | - | export EDITOR=vim |
| h-l3-109 | ✓ | 59 | - | echo $HOME |
| h-l3-110 | ✗ | 127 | - | env | grep pid=1801 |
| h-l4-001 | ✗ | 245 | - | ipconfig | grep 'IPv4 Address:' | awk '{print $2}' |
| h-l4-002 | ✓ | 64 | - | ip route show | grep default |
| h-l4-003 | ✗ | 121 | - | ifconfig wlan0 | grep HW | awk '{print $2}' |
| h-l4-004 | ✗ | 112 | - | sudo systemctl start eth2 |
| h-l4-005 | ✓ | 164 | - | ip link set ens192 mtu 9000 |
| h-l4-006 | ✓ | 205 | - | ip addr add 10.0.0.5/24 dev enp1s0 |
| h-l4-007 | ✓ | 464 | - | sudo ip route add 10.99.0.0/16 via 192.168.5.1 |
| h-l4-008 | ✓ | 130 | - | netstat -tlnp | grep ':8080' |
| h-l4-009 | ✓ | 65 | - | ss -tuln |
| h-l4-010 | ✓ | 208 | - | ss -tlnp | grep ':5432' |
| h-l4-011 | ✗ | 206 | - | netstat | grep ':8080' | wc -l |
| h-l4-012 | ✗ | 132 | - | nmcli dev wifi |
| h-l4-013 | ✗ | 400 | - | cat ~/Documents/wifi.txt | grep 'Home Net 5G' | awk '{print $1}' | xargs -I{} gr |
| h-l4-014 | ✗ | 103 | - | lspci | grep VGA |
| h-l4-015 | ✓ | 100 | - | sudo rfkill block wifi |
| h-l4-016 | ✗ | 66 | - | ping google.com |
| h-l4-017 | ✓ | 186 | - | ping 192.168.1.1 |
| h-l4-018 | ✗ | 137 | - | curl -I https://example.com |
| h-l4-019 | ✓ | 210 | - | curl -L -o backup-old.tar.gz https://files.example.com/backup.tar.gz |
| h-l4-020 | ✗ | 219 | - | curl https://example.com/install.sh | sh |
| h-l4-021 | ✗ | 299 | - | curl -I https://status.example.com | awk '{print $1}' |
| h-l4-022 | ✗ | 74 | - | curl ifconfig.me |
| h-l4-023 | ✗ | 391 | - | curl -L https://mirror.webtatic.com/yum/el6/latest.list > /etc/yum.repos.d/webta |
| h-l4-024 | ✗ | 111 | - | curl -O https://example.com/file.iso |
| h-l4-025 | ✗ | 125 | - | rsync -avz --progress docs/ /path/to/directory |
| h-l4-026 | ✓ | 348 | - | dig api.stripe.com | head -n 1 |
| h-l4-027 | ✗ | 235 | - | dig +short @example.org mail.example.org |
| h-l4-028 | ✓ | 328 | - | nslookup 203.0.113.10 | head -n 1 |
| h-l4-029 | ✗ | 496 | - | ping -c 10 10.0.0.53 | grep -q 'bytes from' && echo 'resolved' || echo 'not reso |
| h-l4-030 | ✗ | 111 | - | dig @example.com example.com |
| h-l4-031 | ✗ | 207 | - | ping filesvr | grep -i 'name or service not known' |
| h-l4-032 | ✗ | 334 | - | ping -c 10.20.0.5 | tail -n 1 |
| h-l4-033 | ✗ | 118 | - | traceroute example.com |
| h-l4-034 | ✓ | 98 | - | arp -a |
| h-l4-035 | ✓ | 365 | - | arp -d 192.168.1.50 |
| h-l4-036 | ✗ | 159 | - | ifconfig eth0 | grep 'Gigabit Ethernet' |
| h-l4-037 | ✗ | 118 | - | ifconfig ens33 | grep 'errors' |
| h-l4-038 | ✗ | 207 | - | ip link show enp3s0 | grep ether |
| h-l4-039 | ✗ | 125 | - | ethtool ens33 | grep 'Speed:' |
| h-l4-040 | ✗ | 130 | - | cat /etc/iptables/rules.v4 | grep INPUT | wc -l |
| h-l4-041 | ✗ | 260 | - | ssh -L 443:localhost:8080 |
| h-l4-042 | ✓ | 256 | - | sudo iptables -A INPUT -s 203.0.113.0/24 -j ACCEPT |
| h-l4-043 | ✗ | 95 | - | firewall-cmd --get-active-port --permanent |
| h-l4-044 | ✓ | 635 | - | firewall-cmd --permanent --zone=public --add-port=80/tcp --permanent --zone=publ |
| h-l4-045 | ✗ | 83 | - | iptables-save > /tmp/iptables.rules |
| h-l4-046 | ✗ | 57 | - | netstat -an |
| h-l4-047 | ✗ | 132 | - | ssh -t alex 'cd ~/projects/myapp && git pull' |
| h-l4-048 | ✓ | 135 | - | ssh -p 2222 deploy |
| h-l4-049 | ✓ | 337 | - | rsync -avz ./release-1.4.2.tar.gz alex@files.example.com:/srv/releases/ |
| h-l4-050 | ✓ | 265 | - | scp deploy@10.0.4.15:/backups/prod-2024-06-01.sql.gz |
| h-l4-051 | ✓ | 262 | - | rsync -avz --progress ./site/ alex@web1:/var/www/site/ |
| h-l4-052 | ✗ | 104 | - | rsync --dry-run src/ dest/ |
| h-l4-053 | ✗ | 154 | - | rsync -avz --delete dist/ app2:/opt/app/dist |
| h-l4-054 | ✗ | 89 | - | ping db.internal |
| h-l4-055 | ✗ | 133 | - | ping -c 3 -W 3 vpn.example.com |
| h-l4-056 | ✗ | 242 | - | nc -zv 127.0.0.1 9999 |
| h-l4-057 | ✗ | 131 | - | sudo ipconfig /flushdns |
| h-l4-058 | ✗ | 160 | - | systemctl show --type=service systemd-resolved |
| h-l4-059 | ✗ | 173 | - | tcpdump -i any -w capture.pcap |
| h-l4-060 | ✓ | 204 | - | tcpdump -i any -w /tmp/https.pcap udp port 80 |
| h-l4-061 | ✓ | 46 | - | apt update |
| h-l4-063 | ✓ | 80 | - | dpkg -l | grep python |
| h-l4-064 | ✓ | 71 | - | apt-cache search ripgrep |
| h-l4-065 | ✗ | 125 | - | git ls-remote https://github.com/nginx/nginx.git |
| h-l4-066 | ✗ | 64 | - | apt-get update |
| h-l4-067 | ✓ | 85 | - | sudo apt update && sudo apt upgrade |
| h-l4-068 | ✗ | 174 | - | find . -name "apache2" -exec rm {} \; |
| h-l4-069 | ✗ | 55 | - | cargo clean |
| h-l4-070 | ✗ | 68 | - | docker images | grep repo |
| h-l4-071 | ✓ | 57 | - | apt-cache depends ffmpeg |
| h-l4-072 | ✗ | 85 | - | sudo apt-get install --fix-broken |
| h-l4-073 | ✗ | 92 | - | command -v docker.io &>/dev/null |
| h-l4-074 | ✓ | 68 | - | dpkg -L nginx |
| h-l4-075 | ✗ | 100 | - | which -a /usr/bin/ss |
| h-l4-076 | ✗ | 329 | - | sudo dpkg -i datadog-agent_7.52.1-1_amd64.deb |
| h-l4-077 | ✗ | 48 | - | openssl version |
| h-l4-078 | ✓ | 65 | - | sudo yum install vim |
| h-l4-079 | ✗ | 89 | - | yum list | grep -i centos |
| h-l4-080 | ✗ | 87 | - | dnf repolist | grep htop |
| h-l4-081 | ✗ | 75 | - | which package |
| h-l4-082 | ✗ | 108 | - | yum patchlevel |
| h-l4-083 | ✗ | 169 | - | cat /var/log/dnf.log | grep 'yesterday' |
| h-l4-084 | ✗ | 120 | - | sudo apt-get remove --purge mariadb-server -y |
| h-l4-085 | ✗ | 102 | - | rpm -qf /etc/ssh/sshd_config |
| h-l4-086 | ✗ | 125 | - | yum list epel-release | grep epel |
| h-l4-087 | ✓ | 92 | - | sudo pacman -S git |
| h-l4-088 | ✗ | 98 | - | pacman --query | grep ^i |
| h-l4-089 | ✗ | 164 | - | git ls-remote https://github.com/zathura/zathura.git |
| h-l4-090 | ✗ | 66 | - | which node |
| h-l4-091 | ✗ | 87 | - | sudo pacman --sync --upgrade |
| h-l4-092 | ✗ | 94 | - | pacman --query | grep python |
| h-l4-093 | ✗ | 56 | - | brew uninstall steam |
| h-l4-094 | ✓ | 64 | - | sudo snap install vlc |
| h-l4-095 | ✓ | 41 | - | snap list |
| h-l4-096 | ✓ | 52 | - | snap find typora |
| h-l4-097 | ✓ | 46 | - | snap remove spotify |
| h-l4-098 | ✓ | 101 | - | flatpak install --default-path /usr/bin obs-studio |
| h-l4-099 | ✓ | 47 | - | flatpak list |
| h-l4-100 | ✓ | 50 | - | flatpak update |
| h-l5-001 | ✗ | 169 | - | git branch --merged main | grep -v HEAD | wc -l |
| h-l5-002 | ✗ | 72 | - | git stash pop |
| h-l5-003 | ✗ | 82 | - | git log --grep="retryWithBackoff" |
| h-l5-004 | ✗ | 87 | - | git checkout -b rel2 --orphan && git reset --hard HEAD |
| h-l5-005 | ✗ | 50 | - | git reset --hard HEAD |
| h-l5-006 | ✗ | 40 | - | git clean -fd |
| h-l5-007 | ✗ | 56 | - | git bisect start |
| h-l5-008 | ✓ | 113 | - | git blame -L 30,45 utils/parser.py |
| h-l5-009 | ✗ | 116 | - | git clone --recurse-submodules https://github.com/user/repo.git |
| h-l5-010 | ✗ | 95 | - | git branch -d --all main |
| h-l5-011 | ✓ | 63 | - | git stash show -p HEAD |
| h-l5-012 | ✗ | 36 | - | git worktree list |
| h-l5-013 | ✗ | 48 | - | git config --get-regexp ENABLE_ |
| h-l5-014 | ✗ | 59 | - | git bisect bad abc123 |
| h-l5-015 | ✓ | 43 | - | git blame README.md |
| h-l5-016 | ✓ | 61 | - | git submodule update --remote --recursive |
| h-l5-017 | ✗ | 75 | - | git stash apply stash@{2} |
| h-l5-018 | ✗ | 89 | - | git worktree remove ../hotfix-dir |
| h-l5-019 | ✗ | 145 | - | git log --graph --oneline --all --decorate --color-words |
| h-l5-020 | ✗ | 285 | - | git log --reflog --pretty=format:"%h %s" --date=short --grep="feature/payments" |
| h-l5-021 | ✗ | 81 | - | git clean -fd |
| h-l5-022 | ✓ | 110 | - | git bisect run ./scripts/test_login.sh |
| h-l5-023 | ✗ | 107 | - | git log --grep='api_secret ==' |
| h-l5-024 | ✗ | 237 | - | git blame --ignore-space-at-eol src/app.py | head -n 5 |
| h-l5-025 | ✓ | 60 | - | docker ps -a |
| h-l5-026 | ✓ | 60 | - | docker logs api --follow |
| h-l5-027 | ✗ | 76 | - | docker exec -it postgres /bin/bash |
| h-l5-028 | ✗ | 55 | - | docker system prune -a |
| h-l5-029 | ✗ | 112 | - | docker stats --no-stream | awk '/avg/{print $2}' |
| h-l5-030 | ✓ | 105 | - | docker-compose up -d |
| h-l5-031 | ✓ | 231 | - | docker ps -a --filter "status=exited" |
| h-l5-032 | ✗ | 189 | - | docker logs --tail 100 worker | tail -n 100 |
| h-l5-033 | ✗ | 82 | - | docker exec -it db bash |
| h-l5-034 | ✗ | 130 | - | docker images --filter dangling=true -q | xargs -r rm |
| h-l5-035 | ✗ | 153 | - | docker images --format "{{.Repository}} {{.Size}}" | sort -k2 -hr |
| h-l5-036 | ✗ | 186 | - | docker-compose build && docker-compose up --remove-orphans -d |
| h-l5-037 | ✓ | 74 | - | docker logs -f nginx |
| h-l5-038 | ✓ | 72 | - | docker exec -it redis sh |
| h-l5-039 | ✗ | 58 | - | docker-compose up -d |
| h-l5-040 | ✓ | 73 | - | kubectl get pods --all-namespaces |
| h-l5-041 | ✗ | 126 | - | kubectl logs -f pod/web-7d9f --namespace=prod |
| h-l5-042 | ✓ | 185 | - | kubectl describe pod api-6c8 --format=json | jq . |
| h-l5-043 | ✗ | 146 | - | nc -zv localhost 8080 |
| h-l5-044 | ✗ | 468 | - | gh api /repos/user/repo/deployments/123 --jq '.status' | grep -q 'success' && ec |
| h-l5-045 | ✗ | 108 | - | kubectl rollout restart deployment/api --revision=3 |
| h-l5-046 | ✓ | 94 | - | kubectl get pods --all-namespaces -o wide |
| h-l5-047 | ✗ | 86 | - | kubectl logs -f batch/my-migrate-job |
| h-l5-048 | ✗ | 106 | - | node --inspect worker-3 |
| h-l5-049 | ✗ | 166 | - | kubectl port-forward pod/data 5433:5432 |
| h-l5-050 | ✗ | 109 | - | git status --porcelain | wc -l |
| h-l5-051 | ✗ | 175 | - | kubectl exec -it pod-name -- /bin/bash |
| h-l5-052 | ✗ | 604 | - | kubectl get pods --field-selector labelSelector='app=payments' --all-namespaces  |
| h-l5-053 | ✗ | 108 | - | tmux new-session -d -s build |
| h-l5-054 | ✗ | 52 | - | tmux ls |
| h-l5-055 | ✓ | 68 | - | tmux attach -t build |
| h-l5-056 | ✓ | 70 | - | tmux kill-session -t experiment |
| h-l5-057 | ✓ | 79 | - | screen -S logs -d -m |
| h-l5-058 | ✗ | 49 | - | screen -ls |
| h-l5-059 | ✓ | 50 | - | screen -R |
| h-l5-060 | ✓ | 107 | - | tmux new-session -d -s deploy |
| h-l5-061 | ✗ | 97 | - | tmux kill-session -t |
| h-l5-062 | ✗ | 172 | - | cat ~/.ssh/id_ed25519 | pbcopy |
| h-l5-063 | ✗ | 181 | - | echo deploy-prod-42 | xclip -selection clipboard |
| h-l5-064 | ✗ | 73 | - | xsel -p |
| h-l5-065 | ✗ | 118 | - | cat -n ~/clipboard.txt | head -n 10 |
| h-l5-066 | ✓ | 117 | - | ./gen_token.sh | xclip -selection clipboard |
| h-l5-067 | ✓ | 161 | - | make check && notify-send "Tests Passed" |
| h-l5-068 | ✗ | 226 | - | zenity --warning --title "Disk Alert" --text "Disk almost full." |
| h-l5-069 | ✗ | 245 | - | echo "Build and success" | mail -s "Build Success" admin@example.com |
| h-l5-070 | ✗ | 188 | - | mount | awk '{print $1}' | xargs -I{} ls -ld {} |
| h-l5-071 | ✓ | 127 | - | blkid /dev/sdb1 | grep UUID |
| h-l5-072 | ✓ | 88 | - | mount /dev/sdb1 /mnt/backup |
| h-l5-073 | ✓ | 48 | - | mount -a |
| h-l5-074 | ✓ | 62 | - | umount /mnt/usb |
| h-l5-075 | ✓ | 57 | - | mount | grep /data |
| h-l5-076 | ✗ | 142 | - | df -h | awk '{print $6, $2}' |
| h-l5-077 | ✗ | 143 | - | time /usr/bin/time -v ls |
| h-l5-078 | ✗ | 57 | - | which unit |
| h-l5-079 | ✗ | 90 | - | cat /proc/1/cmdline |
| h-l5-080 | ✗ | 157 | - | cat /etc/systemd/system/myapp.service | grep ^[[:space:]]*$ |
| h-l5-081 | ✗ | 110 | - | gh auth setup-git --github-email user@example.com |
| h-l5-082 | ✗ | 129 | - | echo 'Host prod' >> ~/.ssh/config |
| h-l5-083 | ✗ | 94 | - | chmod 400 ~/.ssh/config |
| h-l5-084 | ✗ | 88 | - | ssh-keygen -l -f ~/.ssh/id_rsa.pub |
| h-l5-085 | ✗ | 35 | - | ssh -v prod |
| h-l5-086 | ✗ | 80 | - | tar -czf secrets.tar.gz --passphrase=secret secrets |
| h-l5-087 | ✗ | 406 | - | cat notes.txt | openssl enc -aes-256-cbc -salt -out notes.txt.enc -pass pass:$EN |
| h-l5-088 | ✓ | 168 | - | gpg --decrypt backup.tar.gz.gpg | tar xvf - |
| h-l5-089 | ✗ | 153 | - | openssl rand -base64 12 | head -c 32 |
| h-l5-090 | ✗ | 94 | - | openssl rand -base64 12 |
| h-x1-001 | ✗ | 87 | - | ls -lR | tee listing.txt |
| h-x1-002 | ✓ | 88 | - | echo "deploy finished" >> release.log |
| h-x1-003 | ✗ | 84 | - | nohup ./backup.sh & |
| h-x1-004 | ✗ | 116 | - | ./test-runner.sh 2>&1 | tee results.log |
| h-x1-005 | ✗ | 48 | - | top |
| h-x1-006 | ✓ | 154 | - | grep -A 10 "ERROR" app.log | tee -a errors-archive.log |
| h-x1-007 | ✓ | 179 | - | grep -c '500' access.log | wc -l |
| h-x1-008 | ✗ | 170 | - | sort -t' ' -k2,2 raw-names.txt |
| h-x1-009 | ✓ | 132 | - | tail -f app.log | grep --line-buffered WARN |
| h-x1-010 | ✗ | 199 | - | find src/ -type f -name "*.c" -exec grep -H "TODO" {} \; |
| h-x1-011 | ✓ | 172 | - | grep -i "error" app.log |
| h-x1-012 | ✓ | 131 | - | grep -n "password" config.yml |
| h-x1-013 | ✓ | 128 | - | grep GET access.log | wc -l |
| h-x1-014 | ✗ | 123 | - | find ~/project -name '*api_key*' |
| h-x1-015 | ✗ | 121 | - | cat styles.css | grep -v '^\s*!' |
| h-x1-016 | ✗ | 103 | - | grep -R "deprecated" ~/code | nl |
| h-x1-017 | ✗ | 125 | - | sed -i 's/http:\/\/https:\/\/g' links.txt |
| h-x1-018 | ✗ | 132 | - | sed -i 's/debug/verbose/g' config.txt |
| h-x1-019 | ✗ | 154 | - | cat notes.txt | grep -v '^$' |
| h-x1-020 | ✓ | 135 | - | cut -d' ' -f1 scores.txt |
| h-x1-021 | ✗ | 136 | - | cut -d: -f1 /etc/passwd |
| h-x1-022 | ✗ | 202 | - | cut -d',' -f2 sales.tsv | paste -sd+ | bc |
| h-x1-023 | ✓ | 91 | - | wc -l access.log |
| h-x1-024 | ✓ | 70 | - | wc -w essay.md |
| h-x1-027 | ✓ | 71 | - | sort ips.txt | uniq -c |
| h-x1-028 | ✓ | 166 | - | grep -oE '([0-9]{3})' access.log | sort | uniq -c | sort -nr |
| h-x1-029 | ✗ | 147 | - | sort emails.txt | uniq -c |
| h-x1-030 | ✗ | 101 | - | tail -n 15 report.txt |
| h-x1-031 | ✓ | 137 | - | tail -n 250 server.log |
| h-x1-032 | ✓ | 85 | - | tail -f app.log |
| h-x1-033 | ✗ | 253 | - | find . -type f | xargs wc -l | sort -nr | head -n 5 |
| h-x1-034 | ✓ | 94 | - | tail -1 results.csv |
| h-x1-035 | ✓ | 115 | - | find /var/log -name "*.log" |
| h-x1-036 | ✓ | 78 | - | find ~/project -type d |
| h-x1-037 | ✗ | 194 | - | find ~/Downloads -type f -mtime +90 | xargs ls -l |
| h-x1-038 | ✗ | 160 | - | find ~/work -type f -ctime -1 |
| h-x1-039 | ✓ | 82 | - | find $HOME -name config.yml |
| h-x1-040 | ✓ | 142 | - | find /tmp -type f -name "*.tmp" -mtime +7 |
| h-x1-041 | ✗ | 226 | - | find ~/project -name "*.pyc" | xargs rm |
| h-x1-042 | ✓ | 98 | - | tar -czf project.tar.gz project/ |
| h-x1-043 | ✓ | 68 | - | tar -xzvf backup.tar.gz |
| h-x1-044 | ✗ | 65 | - | tar -tf archive.tar.gz |
| h-x1-045 | ✓ | 122 | - | tar -xzvf site.tar.gz -C /var/www/site |
| h-x1-046 | ✓ | 94 | - | gzip bigdump.sql |
| h-x1-048 | ✓ | 139 | - | gzip -c old-report.csv > old-report.csv.gz |
| h-x1-049 | ✗ | 51 | - | ssh alex |
| h-x1-050 | ✓ | 148 | - | ssh -p 2222 10.0.0.5 |
| h-x1-051 | ✗ | 109 | - | uptime -p | tee /dev/tty |
| h-x1-052 | ✗ | 208 | - | git push --force-with-lease dev.internal reports/ |
| h-x1-053 | ✗ | 180 | - | git pull --error-on-fail --no-ff production master |
| h-x1-054 | ✓ | 349 | - | curl -L --output ~/Downloads/releases_$(date +%Y-%m-%d).tar.gz https://releases. |
| h-x1-055 | ✗ | 165 | - | curl -s https://api.example.com | head -1 |
| h-x1-056 | ✗ | 80 | - | curl -I example.com |
| h-x1-057 | ✗ | 147 | - | curl -s http://localhost:8080/api/health | jq . |
| h-x1-058 | ✓ | 78 | - | wget https://example.com/setup.sh |
| h-x1-059 | ✗ | 189 | - | wget --progress=bar https://example.com/big.iso |
| h-x1-061 | ✗ | 100 | - | chmod 777 script.py |
| h-x1-062 | ✓ | 104 | - | chmod 644 notes.txt |
| h-x1-063 | ✗ | 202 | - | find ~/scripts -type f -exec chmod +x {} \; |
| h-x1-064 | ✗ | 125 | - | sed -i 's/;.*//g' data.csv |
| h-x1-065 | ✗ | 285 | - | rsync -avz uploads/ alex@192.168.1.100:/var/www/ |
| h-x1-066 | ✓ | 63 | - | ps aux |
| h-x1-067 | ✗ | 158 | - | find /usr/local/ssl -name "nginx.pid" |
| h-x1-068 | ✓ | 67 | - | pgrep postgres |
| h-x1-069 | ✓ | 90 | - | ps aux | grep worker.py |
| h-x1-070 | ✓ | 64 | - | pkill worker.py |
| h-x1-071 | ✗ | 80 | - | kill -9 4242 |
| h-x1-072 | ✗ | 66 | - | kill 9137 |
| h-x1-073 | ✗ | 49 | - | sudo systemctl reload nginx |
| h-x1-074 | ✓ | 96 | - | history | tail -n 10 |
| h-x1-075 | ✗ | 97 | - | history | grep ssh |
| h-x1-076 | ✗ | 56 | - | ll | expand |
| h-x1-077 | ✓ | 71 | - | echo $EDITOR |
| h-x1-078 | ✓ | 139 | - | echo 'export PATH=$PATH:~/bin' >> ~/.zshrc |
| h-x1-079 | ✓ | 80 | - | env | grep ^PATH= |
| h-x1-080 | ✓ | 123 | - | export API_KEY=sk-live-abc123 |
| h-x1-081 | ✓ | 96 | - | which python3 |
| h-x1-082 | ✗ | 71 | - | git --version |
| h-x1-083 | ✗ | 60 | - | man rsync |
| h-x1-084 | ✓ | 63 | - | apropos checksums |
| h-x1-086 | ✓ | 92 | - | ls -laR | head -n 5 |
| h-x1-087 | ✗ | 47 | - | cd ~/Documents |
| h-x1-088 | ✓ | 128 | - | mkdir -p ~/code/2024/q3/reports |
| h-x1-089 | ✓ | 138 | - | cp -r assets/ ~/backup/ |
| h-x1-090 | ✓ | 99 | - | mv draft-notes.txt meeting-notes.txt |
| h-x1-091 | ✗ | 191 | - | mv ~/Downloads/photo.jpg ~/Pictures/ && ls ~/Pictures/photo.jpg |
| h-x1-092 | ✓ | 96 | - | rm -i cache.db |
| h-x1-093 | ✓ | 70 | - | rm -rf scratch |
| h-x1-094 | ✓ | 57 | - | date |
| h-x1-095 | ✓ | 92 | - | date +"%Y-%m-%d" |
| h-x1-096 | ✓ | 47 | - | date -u |
| h-x1-097 | ✓ | 72 | - | diff -u config.old config.new |
| h-x1-098 | ✓ | 80 | - | diff -y users-old.csv users-new.csv |
| h-x1-099 | ✓ | 95 | - | ln -s release-2.4.1 latest |
| h-x1-100 | ✓ | 158 | - | ln -s ~/.dotfiles/vimrc ~/.vimrc |
| h-x2-001 | ✓ | 52 | - | git status |
| h-x2-002 | ✗ | 52 | - | ls | xargs |
| h-x2-003 | ✗ | 76 | - | git grep TODO app.py |
| h-x2-004 | ✓ | 42 | - | ping google.com |
| h-x2-005 | ✓ | 42 | - | mkdir projects/api |
| h-x2-006 | ✓ | 44 | - | cat notes.txt |
| h-x2-007 | ✓ | 45 | - | which python3 |
| h-x2-008 | ✓ | 91 | - | chmod +x deploy.sh && ./deploy.sh |
| h-x2-009 | ✓ | 71 | - | sudo nano /etc/hosts |
| h-x2-010 | ✓ | 85 | - | sudo mkdir /opt/ingest |
| h-x2-011 | ✗ | 89 | - | nohup python3 app.py & |
| h-x2-012 | ✓ | 120 | - | sudo rm /var/log/app/2023.log |
| h-x2-013 | ✓ | 81 | - | sudo cp mycli /usr/local/bin |
| h-x2-014 | ✗ | 65 | - | cat /etc/sudoers |
| h-x2-015 | ✓ | 57 | - | cd ~/Documents && pwd |
| h-x2-016 | ✓ | 59 | - | mkdir -p src/components/header |
| h-x2-017 | ✓ | 114 | - | cd $(pwd)/$(dirname $0) && ./run.sh |
| h-x2-018 | ✗ | 115 | - | unzip -l ~/Downloads/README.md.zip |
| h-x2-019 | ✗ | 82 | - | tail -f app.log |
| h-x2-020 | ✗ | 72 | - | find . -name orders.csv |
| h-x2-021 | ✓ | 63 | - | rm -rf website_backup/ |
| h-x2-022 | ✓ | 64 | - | cp -r assets dist/ |
| h-x2-023 | ✗ | 86 | - | scp public_html alex@web1:~/ |
| h-x2-024 | ✗ | 103 | - | grep TODO README.md | head -n 5 |
| h-x2-025 | ✓ | 62 | - | tar xvf backup.tar.gz |
| h-x2-026 | ✗ | 133 | - | ssh -i ~/.ssh/id_ed25519 user@host |
| h-x2-027 | ✗ | 249 | - | top -b -n 1 | grep -i 'PID' | awk '{print $1}' | xargs kill -9 |
| h-x2-028 | ✗ | 125 | - | tail -n 10 app.log | cat |
| h-x2-029 | ✗ | 94 | - | cat secrets.env | base64 |
| h-x2-030 | ✗ | 109 | - | jq -r '.payload' payload.b64 |
| h-x2-031 | ✗ | 211 | - | sha256sum release-2.4.tar.gz > release-2.4.tar.gz.sha256 |
| h-x2-032 | ✓ | 62 | - | md5sum dump.sql |
| h-x2-033 | ✗ | 117 | - | od -An -N 128 -t x1 firmware.bin |
| h-x2-034 | ✓ | 45 | - | file mystery.dat |
| h-x2-035 | ✗ | 111 | - | readelf -s libcore.a | grep core |
| h-x2-036 | ✓ | 70 | - | wc -l access.log |
| h-x2-037 | ✓ | 79 | - | stat -c %s photo.raw |
| h-x2-038 | ✓ | 201 | - | iconv -f ISO-8859-1 -t UTF-8 legacy.txt > legacy_utf8.txt |
| h-x2-039 | ✗ | 153 | - | iconv -f UTF-8 README.md > README.md.utf8 |
| h-x2-040 | ✗ | 164 | - | od -t x1 -N 16 packet.bin |
| h-x2-041 | ✓ | 124 | - | tar -czf client.tar.gz client/ |
| h-x2-042 | ✓ | 115 | - | tar -xzvf client.tar.gz -C /tmp |
| h-x2-043 | ✗ | 64 | - | tar -tf backup.tar.gz |
| h-x2-044 | ✓ | 66 | - | zip -r reports.zip reports/ |
| h-x2-045 | ✓ | 94 | - | unzip invoices-2024.zip -d invoices |
| h-x2-046 | ✗ | 59 | - | unzip -l firmware.zip |
| h-x2-047 | ✓ | 87 | - | unzip -d ~/restore/ old_site.zip |
| h-x2-048 | ✗ | 131 | - | gzip -c access.log > access.log.gz |
| h-x2-049 | ✗ | 114 | - | zcat access.log.gz | grep "123" |
| h-x2-050 | ✗ | 115 | - | tar -czf photos.tar.gz -C photos/ . |
| h-x2-051 | ✓ | 67 | - | ps aux | grep nginx |
| h-x2-052 | ✗ | 262 | - | top -bn1 | awk 'NR>1{print $2,$1}' | sort -nr | head -n 5 |
| h-x2-053 | ✗ | 113 | - | kill -9 4217 |
| h-x2-054 | ✗ | 75 | - | jobs | wc -l |
| h-x2-055 | ✓ | 54 | - | fg 1 |
| h-x2-056 | ✗ | 81 | - | nohup python script.py & |
| h-x2-057 | ✓ | 78 | - | nohup ./train.sh & |
| h-x2-058 | ✓ | 86 | - | nohup python3 cleanup.py & |
| h-x2-059 | ✗ | 76 | - | jobs -p | xargs kill |
| h-x2-060 | ✗ | 249 | - | tail -n 1000000 server.log | head -n 1000010 |
| h-x2-061 | ✓ | 102 | - | grep -c "ERROR" app.log |
| h-x2-062 | ✗ | 132 | - | tail -n +10 app.log | grep -v DEBUG |
| h-x2-063 | ✗ | 99 | - | grep -i "denied" auth.log |
| h-x2-064 | ✗ | 147 | - | find src/ -type f -exec grep -H "FIXME" {} \; |
| h-x2-065 | ✗ | 199 | - | cut -d: -f1 /etc/passwd |
| h-x2-066 | ✗ | 254 | - | tail -n +40 notes.md | head -n 60 |
| h-x2-067 | ✗ | 86 | - | sed '/^$/d' draft.txt |
| h-x2-068 | ✓ | 113 | - | sed -i 's/color/colour/g' essay.md |
| h-x2-069 | ✗ | 163 | - | cut -d',' -f3 sales.tsv | paste -sd+ - | bc |
| h-x2-070 | ✓ | 155 | - | df -h | awk '{print $5}' |
| h-x2-071 | ✗ | 320 | - | tail -n +100000 app.log | head -n 100010 |
| h-x2-072 | ✗ | 71 | - | ssh web1 alex |
| h-x2-073 | ✗ | 91 | - | ssh -i ~/Documents/my_deploy_key.pem web1 |
| h-x2-074 | ✗ | 166 | - | ssh -L 2222:localhost:22 alex@10.0.0.14 |
| h-x2-075 | ✗ | 290 | - | ssh -f -L 8080:db1:5432:postgres |
| h-x2-076 | ✗ | 62 | - | ssh-copy-id web1 |
| h-x2-077 | ✗ | 108 | - | scp build.tar.gz web1:/home/web1/ |
| h-x2-078 | ✓ | 119 | - | scp -r dist/ web1:/var/www |
| h-x2-079 | ✓ | 165 | - | scp -P 2200 server.log web1:/var/www/ |
| h-x2-080 | ✗ | 127 | - | rsync -avz --progress --delete-after site/ backup1/ |
| h-x2-081 | ✗ | 129 | - | curl -L -o toolkit.zip https://example.com/files/toolkit.zip |
| h-x2-082 | ✗ | 144 | - | curl -s https://api.example.com/data | jq '.' > data.json |
| h-x2-083 | ✗ | 135 | - | curl -L https://example.com/file.zip |
| h-x2-084 | ✗ | 137 | - | mount -o loop /path/to/big.iso /mnt/bigiso |
| h-x2-085 | ✗ | 143 | - | wget --progress=bar https://example.com/sdk-9.1.tar.gz |
| h-x2-086 | ✓ | 117 | - | wget --quiet --no-check-certificate https://www.robots.txt |
| h-x2-087 | ✗ | 191 | - | curl -sL https://example.com/urls.txt | xargs curl -o |
| h-x2-088 | ✓ | 62 | - | echo $EDITOR |
| h-x2-089 | ✓ | 76 | - | env | grep ^PATH= |
| h-x2-090 | ✓ | 101 | - | export API_KEY=sk-test-123 |
| h-x2-091 | ✓ | 186 | - | echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc |
| h-x2-092 | ✗ | 145 | - | python3 worker.py --debug --no-export |
| h-x2-093 | ✓ | 97 | - | source ~/.zshrc & |
| h-x2-094 | ✓ | 161 | - | find src/ -type f -name "*.py" | wc -l |
| h-x2-095 | ✗ | 228 | - | if [ -z "$(git ls-files | wc -l)" ]; then echo "No changes to test" && exit 0; f |
| h-x2-096 | ✗ | 54 | - | date > activity.log |
| h-x2-097 | ✗ | 57 | - | history | grep ssh |
| h-x2-098 | ✗ | 80 | - | make > build.log 2>&1 |
| h-x2-099 | ✗ | 140 | - | find . -name "*.conf" -exec chmod 644 {} \; |
| h-x2-100 | ✗ | 134 | - | make release && cp -r dist/ ./cli/ && cd ./cli |
