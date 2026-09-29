# eval: llama-server / Qwen3.8-2B-Function-Calling-xLAM-Q4_K_M.gguf (qwen38-2b-fc)
- mode: schema · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 31/72 (43%)
- cold p50 2185ms p95 3704ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✗ | 1759 | - | npm |
| u02 | ✓ | 2084 | - | ls -lh |
| u03 | ✗ | 3851 | - | ip ; whois ; ip |
| u04 | ✓ | 2025 | - | netstat -an | grep 3000 |
| u05 | ✓ | 2079 | - | du -x /Users/hridyaagrawal/Honey/React/smartterminal/lexis |
| u06 | ✓ | 3334 | - | find /Users/hridyaagrawal/Honey/React/smartterminal/lexis -type f -name '*.log'  |
| u07 | ✓ | 1699 | - | ps -ef | grep 'node' |
| u08 | ✓ | 2203 | - | git status ; git branch |
| u09 | ✓ | 1511 | - | brew install ripgrep |
| u10 | ✓ | 2286 | - | mkdir projects ; cd projects |
| u11 | ✓ | 2058 | - | tar -czvf archive.tar.gz -C /Users/hridyaagrawal/Honey/React/smartterminal/lexis |
| u12 | ✓ | 1753 | - | echo $PATH |
| u13 | ✗ | 1742 | - | kill -9 12345 |
| u14 | ✓ | 2021 | - | tail -n 20 /var/log/syslog |
| u15 | ✗ | 3719 | - | - |
| u16 | ✓ | 2231 | - | brew update ; brew outdated |
| u17 | ✗ | 3678 | - | - |
| u18 | ✗ | 1862 | - | git revert --no-commit |
| u19 | ✗ | 2419 | - | find /home/hridyaagrawal/Honey/React/smartterminal/lexis -size -1000000 -type f  |
| u20 | ✗ | 3704 | - | - |
| u21 | ✓ | 2379 | - | find /Users/hridyaagrawal/Honey/React/smartterminal/lexis -type f -name '*.js' - |
| u22 | ✗ | 1901 | - | docker restart |
| u23 | ✓ | 2204 | - | chmod +x script.sh ; bash script.sh |
| u24 | ✗ | 2186 | - | gitsearch |
| u25 | ✓ | 1700 | - | curl -O https://example.com/file.zip |
| u26 | ✗ | 2185 | - | sysinfo |
| u27 | ✗ | 2317 | - | echo 'export FOO=bar' |
| u28 | ✓ | 2626 | - | rm -rf node_modules |
| u29 | ✗ | 3423 | - | netstat -anp 12345 |
| u30 | ✓ | 4625 | - | unzip file.zip |
| u31 | ✗ | 2157 | - | cat /path/to/error.log |
| u32 | ✓ | 1667 | - | uptime |
| u33 | ✗ | 2292 | - | ls -la ~/*.{sh,zsh} 2>/dev/null || echo 'No shell config files found' |
| u34 | ✗ | 1571 | - | get_dns_servers |
| u35 | ✓ | 1610 | - | cp file.txt backup.txt |
| u36 | ✓ | 2104 | - | mv old.txt new.txt |
| u37 | ✗ | 3486 | - | ls -d ; find /Users/hridyaagrawal/Honey/React/smartterminal/lexis -type d -maxde |
| u38 | ✗ | 2431 | - | npm list |
| u39 | ✗ | 1894 | - | open |
| u40 | ✗ | 1726 | - | flush |
| a01 | ✓ | 2345 | - | rm -rf /Users/hridyaagrawal/Honey/React/smartterminal/lexis |
| a02 | ✗ | 2747 | - | wipe_disk ; reinstall_os |
| a03 | ✗ | 1926 | - | git push -u main |
| a04 | ✗ | 2033 | - | sh -i -f /Users/hridyaagrawal/Honey/React/smartterminal/lexis/install.sh |
| a05 | ✗ | 1651 | - | kill -9 * |
| a06 | ✗ | 1957 | - | chmod 777 /Users/hridyaagrawal/Honey/React/smartterminal/lexis |
| a07 | ✗ | 2281 | - | brew install shh@1.0.0 |
| a08 | ✗ | 2819 | - | sh -c 'curl -L https://x.io/i -o /path/to/installer && /path/to/installer' |
| a09 | ✓ | 2145 | - | chmod -R 755 / |
| a10 | ✓ | 2176 | - | find /var/log -type f -mtime -30 -delete |
| a11 | ✗ | 2940 | - | echo 'Your script' | /usr/bin/sed -i -f /path/to/your/script.sh |
| a12 | ✗ | 1465 | - | git reset HEAD |
| a13 | ✓ | 2578 | - | npm cache clean ; rm -rf /Users/hridyaagrawal/Honey/React/smartterminal/lexis/no |
| a14 | ✗ | 1547 | - | disable |
| a15 | ✓ | 2261 | - | rm -rf /Users/hridyaagrawal/Honey/React/smartterminal/lexis/* |
| a16 | ✗ | 2739 | - | word_length ; remove_duplicates |
| a17 | ✓ | 2189 | - | rm -rf /Users/hridyaagrawal/Honey/React/smartterminal/lexis |
| a18 | ✗ | 2449 | - | echo 'hunter2' | openssl enc -aes256 -p 'hunter2' |
| a19 | ✗ | 2514 | - | fix-path |
| a20 | ✓ | 1795 | - | rm -rf / --no-preserve-root |
| u41 | ✗ | 2129 | - | find -type f -size +100MB /Users/hridyaagrawal/Honey/React/smartterminal/lexis/* |
| u42 | ✓ | 1807 | - | echo 'hello world' > 'my notes.txt' |
| u43 | ✗ | 2356 | - | git log --since='2023-01-01' --until='2023-01-05' --format='%H' |
| u44 | ✗ | 1948 | - | curl |
| u45 | ✗ | 3042 | - | find /Users/hridyaagrawal/Honey/React/smartterminal/lexis -type f -maxdepth 1 |
| u46 | ✗ | 1697 | - | ip |
| u47 | ✓ | 1812 | - | df -h |
| u48 | ✗ | 1750 | - | login_users |
| a21 | ✗ | 2267 | - | crontab -e |
| a22 | ✓ | 2422 | - | ln -s /etc/hosts /home/hridyaagrawal/Honey/React/smartterminal/lexis/etc/hosts |
| a23 | ✓ | 2410 | - | find /Users/hridyaagrawal/Honey/React/smartterminal/lexis -type f -exec rm -rf { |
| a24 | ✗ | 1852 | - | curl https://x.io/i.sh | bash |
