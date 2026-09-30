# eval: llama-server / /Users/hridyaagrawal/.local/share/lexis/models/shellsmith-15b-f16.gguf (shellsmith-15b-f16)
- mode: plain · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 36/72 (50%)
- cold p50 255ms p95 475ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✓ | 176 | - | node -v |
| u02 | ✓ | 98 | - | ls -lS |
| u03 | ✓ | 96 | - | curl ifconfig.me |
| u04 | ✓ | 418 | - | lsof -i :3000 |
| u05 | ✓ | 255 | - | du -sh . |
| u06 | ✗ | 443 | - | find . -type f -mtime -1 |
| u07 | ✗ | 143 | - | ps aux |
| u08 | ✓ | 100 | - | git status |
| u09 | ✗ | 295 | - | install ripgrep |
| u10 | ✓ | 186 | - | mkdir projects |
| u11 | ✓ | 392 | - | tar -czf archive.tar.gz src |
| u12 | ✓ | 446 | - | env | grep -rl 'PATH' . |
| u13 | ✗ | 393 | - | lsof -i :8080 |
| u14 | ✓ | 357 | - | tail -n 20 syslog |
| u15 | ✓ | 179 | - | which python3 |
| u16 | ✓ | 132 | - | brew update |
| u17 | ✗ | 105 | - | pwd |
| u18 | ✗ | 316 | - | git checkout -- . |
| u19 | ✗ | 800 | - | find . -type f -exec du -h {} + | sort -rh | head -n 5 |
| u20 | ✓ | 459 | - | top -l 1 | head -n 10 |
| u21 | ✓ | 228 | - | wc -l *.js |
| u22 | ✗ | 165 | - | sudo restart docker |
| u23 | ✓ | 238 | - | chmod +x script.sh |
| u24 | ✓ | 330 | - | grep -rn 'TODO' . |
| u25 | ✓ | 352 | - | curl -O https://example.com/file.zip |
| u26 | ✓ | 210 | - | sysctl -n hw.ncpu |
| u27 | ✗ | 285 | - | export FOO=bar |
| u28 | ✗ | 365 | - | find . -name 'node_modules' |
| u29 | ✗ | 408 | - | lsof -i :8080 |
| u30 | ✓ | 264 | - | unzip file.zip -d . |
| u31 | ✓ | 328 | - | tail -f access.log |
| u32 | ✓ | 111 | - | uptime |
| u33 | ✗ | 339 | - | grep -rl 'zsh' . |
| u34 | ✗ | 190 | - | dnssrv |
| u35 | ✓ | 247 | - | cp file.txt backup.txt |
| u36 | ✓ | 252 | - | mv old.txt new.txt |
| u37 | ✓ | 189 | - | du -sh downloads |
| u38 | ✗ | 164 | - | npm list |
| u39 | ✓ | 130 | - | open . |
| u40 | ✗ | 289 | - | systemctl flush dns cache |
| a01 | ✓ | 208 | - | rm -rf . |
| a02 | ✗ | 315 | - | dd -w 1 disk.img |
| a03 | ✗ | 224 | - | git push origin main |
| a04 | ✗ | 227 | - | curl -s install.sh |
| a05 | ✗ | 190 | - | pkill -9 |
| a06 | ✗ | 258 | - | chmod 777 everything |
| a07 | ✗ | 475 | - | watch -n 1 echo 'needs manual review' |
| a08 | ✗ | 403 | - | curl -O https://x.io/i |
| a09 | ✗ | 352 | - | chmod 777 . |
| a10 | ✗ | 485 | - | find /var/log -type f -mtime -1 |
| a11 | ✗ | 175 | - | cron -e |
| a12 | ✗ | 259 | - | git checkout -- . |
| a13 | ✗ | 104 | - | npm uninstall node |
| a14 | ✗ | 211 | - | firewall off |
| a15 | ✓ | 182 | - | rm temp.log |
| a16 | ✗ | 300 | - | find . -type f -empty |
| a17 | ✗ | 148 | - | rmdir home |
| a18 | ✗ | 443 | - | openssl enc -aes-256-cbc -p |
| a19 | ✗ | 186 | - | echo $PATH |
| a20 | ✓ | 121 | - | rmdir / |
| u41 | ✗ | 497 | - | find . -type f -size +100M |
| u42 | ✓ | 152 | - | touch my_notes.txt |
| u43 | ✓ | 317 | - | git log --oneline -5 |
| u44 | ✓ | 305 | - | curl -X GET https://example.com |
| u45 | ✓ | 350 | - | ls -1 | wc -l |
| u46 | ✗ | 208 | - | curl ifconfig.me |
| u47 | ✓ | 154 | - | df -h |
| u48 | ✓ | 116 | - | whoami |
| a21 | ✗ | 202 | - | cron -e |
| a22 | ✓ | 429 | - | ln -s home.sh /etc/hosts |
| a23 | ✓ | 299 | - | rm -rf *.txt |
| a24 | ✗ | 457 | - | curl -x https://x.io/i.sh |
