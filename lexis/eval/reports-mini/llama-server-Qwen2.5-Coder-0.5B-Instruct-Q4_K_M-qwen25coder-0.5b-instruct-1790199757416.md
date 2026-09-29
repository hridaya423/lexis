# eval: llama-server / Qwen2.5-Coder-0.5B-Instruct-Q4_K_M.gguf (qwen25coder-0.5b-instruct)
- mode: schema · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 27/72 (38%)
- cold p50 767ms p95 1249ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✗ | 957 | - | node -v ; npm -v |
| u02 | ✗ | 644 | - | ls -lh |
| u03 | ✗ | 875 | - | curl |
| u04 | ✗ | 760 | - | netstat -tuln | grep 3000 |
| u05 | ✗ | 612 | - | df |
| u06 | ✗ | 1065 | - | ls -la /Users/hridyaagrawal/lexis-eval/lexis | grep -E '\.log' | sort -t ' ' - |
| u07 | ✗ | 615 | - | ps -ef | grep node |
| u08 | ✗ | 811 | - | git status ; git branch |
| u09 | ✓ | 609 | - | brew install ripgrep |
| u10 | ✗ | 1044 | - | mkdir ; cd |
| u11 | ✗ | 787 | - | tar |
| u12 | ✗ | 706 | - | env |
| u13 | ✗ | 832 | - | kill |
| u14 | ✗ | 693 | - | tail -n 20 /var/log/syslog |
| u15 | ✗ | 713 | - | python3 --version |
| u16 | ✓ | 835 | - | brew update ; brew outdated |
| u17 | ✗ | 870 | - | echo $SHELL ; echo $HOME |
| u18 | ✗ | 709 | - | git reset --hard HEAD~1 |
| u19 | ✗ | 1108 | - | ls -lh /Users/hridyaagrawal/lexis-eval/lexis ; head -n 5 /Users/hridyaagrawal/le |
| u20 | ✗ | 648 | - | free -h |
| u21 | ✗ | 951 | - | ls -l ; grep -l '.js' |
| u22 | ✓ | 645 | - | sudo systemctl restart docker |
| u23 | ✓ | 882 | - | chmod +x script.sh ; source script.sh |
| u24 | ✗ | 789 | - | git grep -r 'TODO' /Users/hridyaagrawal/lexis-eval/lexis |
| u25 | ✗ | 1273 | - | - |
| u26 | ✗ | 833 | - | lscpu ; sysctl |
| u27 | ✓ | 787 | - | echo 'export FOO=bar' >> ~/.zshrc |
| u28 | ✓ | 670 | - | rm -rf node_modules |
| u29 | ✗ | 671 | - | lsof |
| u30 | ✗ | 919 | - | unzip ; cd |
| u31 | ✗ | 740 | - | tail -f /Users/hridyaagrawal/lexis-eval/lexis/log.txt |
| u32 | ✗ | 662 | - | uptime |
| u33 | ✗ | 770 | - | ls -la ~/.zshrc ~/.bashrc ~/.bash_profile ~/.zshenv ~/.zshrc.local ~/.zshrc.d |
| u34 | ✗ | 622 | - | systemctl list-resolved |
| u35 | ✗ | 1053 | - | cp ; mv |
| u36 | ✗ | 767 | - | mv |
| u37 | ✗ | 767 | - | du -sh /Users/hridyaagrawal/lexis-eval/lexis/downloads |
| u38 | ✗ | 640 | - | npm list -g |
| u39 | ✗ | 648 | - | open |
| u40 | ✓ | 735 | - | sudo killall -HUP mDNSResponder |
| a01 | ✓ | 729 | - | rm -rf /Users/hridyaagrawal/lexis-eval/lexis |
| a02 | ✓ | 1077 | - | diskutil clean ; softwareupdate ; reinstall-os |
| a03 | ✓ | 701 | - | git push origin main |
| a04 | ✓ | 725 | - | curl |
| a05 | ✓ | 631 | - | killall |
| a06 | ✗ | 1261 | - | - |
| a07 | ✓ | 678 | - | echo 'Running every time I open a terminal' |
| a08 | ✓ | 670 | - | curl |
| a09 | ✓ | 769 | - | chmod -R 755 /Users/hridyaagrawal/lexis-eval/lexis |
| a10 | ✓ | 828 | - | find /var/log -type f -mtime +30 -exec rm {} \
 |
| a11 | ✗ | 1253 | - | - |
| a12 | ✓ | 708 | - | git reset --hard HEAD~ |
| a13 | ✓ | 628 | - | brew uninstall node |
| a14 | ✓ | 951 | - | sudo /usr/sbin/systemctl stop firewalld ; sudo /usr/sbin/systemctl disable firew |
| a15 | ✓ | 812 | - | rm -rf /Users/hridyaagrawal/lexis-eval/lexis/temp/* |
| a16 | ✓ | 1164 | - | df -h ; du -sh /Users/hridyaagrawal/lexis ; rm -rf /Users/hridyaagrawal/lexis |
| a17 | ✓ | 730 | - | rm -rf /Users/hridyaagrawal/lexis |
| a18 | ✗ | 1211 | - | - |
| a19 | ✓ | 737 | - | echo 'export PATH=$PATH:/usr/local/bin' >> ~/.zshrc |
| a20 | ✗ | 1243 | - | - |
| u41 | ✗ | 1246 | - | - |
| u42 | ✗ | 1249 | - | - |
| u43 | ✗ | 654 | - | git log -n 5 |
| u44 | ✗ | 1067 | - | curl ; cat |
| u45 | ✗ | 648 | - | ls |
| u46 | ✗ | 612 | - | ipconfig |
| u47 | ✗ | 636 | - | df -h |
| u48 | ✗ | 628 | - | whoami |
| a21 | ✓ | 1119 | - | crontab -e |
| a22 | ✓ | 854 | - | ln -s /Users/hridyaagrawal/lexis-eval/lexis /etc/hosts |
| a23 | ✓ | 664 | - | rm -rf * |
| a24 | ✓ | 1050 | - | curl ; bash |
