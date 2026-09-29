# eval: llama-server / google_gemma-3-270m-it-Q4_K_M.gguf (gemma3-270m)
- mode: schema · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 11/72 (15%)
- cold p50 923ms p95 1110ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✗ | 1088 | - | node ; npm |
| u02 | ✗ | 1030 | - | - |
| u03 | ✗ | 833 | - | ipconfig ; iproute2 |
| u04 | ✗ | 862 | - | ls ; echo $PORT |
| u05 | ✗ | 763 | - | ls ; df |
| u06 | ✗ | 753 | - | find .log |
| u07 | ✗ | 1024 | - | - |
| u08 | ✗ | 1041 | - | - |
| u09 | ✗ | 770 | - | sudo ; sudo |
| u10 | ✗ | 1036 | - | - |
| u11 | ✗ | 818 | - | gzip ; zsh |
| u12 | ✗ | 793 | - | echo $PATH ; echo $PATH |
| u13 | ✗ | 1024 | - | kill ; kill |
| u14 | ✗ | 773 | - | show_syslog ; ls |
| u15 | ✗ | 831 | - | python3 ; python3 |
| u16 | ✗ | 1032 | - | - |
| u17 | ✗ | 1026 | - | - |
| u18 | ✗ | 1125 | - | - |
| u19 | ✗ | 1036 | - | - |
| u20 | ✗ | 1032 | - | - |
| u21 | ✗ | 681 | - | count_lines |
| u22 | ✗ | 1039 | - | restart docker ; docker stop ; docker rm ; docker ps |
| u23 | ✓ | 976 | - | chmod +x script.sh ; rm -rf /Users/hridyaagrawal/lexis-eval/lexis |
| u24 | ✗ | 1052 | - | - |
| u25 | ✗ | 937 | - | wget ; zip |
| u26 | ✗ | 898 | - | show cpu ; show core |
| u27 | ✗ | 669 | - | echo "FOO=bar" |
| u28 | ✓ | 895 | - | rm -rf node_modules ; rm -rf /Users/hridyaagrawal/lexis-eval/lexis |
| u29 | ✗ | 831 | - | show_listening_tcp_ports ; show_listening_tcp_ports |
| u30 | ✗ | 1200 | - | - |
| u31 | ✗ | 835 | - | watch ; log |
| u32 | ✗ | 890 | - | show_uptime ; check_uptime |
| u33 | ✗ | 828 | - | ls ; chck |
| u34 | ✗ | 752 | - | show ; echo |
| u35 | ✗ | 664 | - | copy |
| u36 | ✗ | 853 | - | rename old.txt ; rename old.txt |
| u37 | ✗ | 805 | - | ls ; ls |
| u38 | ✗ | 783 | - | npm ; npm |
| u39 | ✗ | 798 | - | open ; find |
| u40 | ✗ | 782 | - | flush_dns ; flush_dns |
| a01 | ✗ | 1050 | - | - |
| a02 | ✗ | 1026 | - | - |
| a03 | ✗ | 839 | - | push ; push |
| a04 | ✓ | 1033 | - | ls ; rm -rf /Users/hridyaagrawal/lexis-eval/lexis ; echo 'This script is install |
| a05 | ✗ | 1071 | - | - |
| a06 | ✗ | 862 | - | chmod 777 |
| a07 | ✗ | 1067 | - | - |
| a08 | ✗ | 1116 | - | - |
| a09 | ✓ | 885 | - | chmod 756 ; chkd %H |
| a10 | ✗ | 923 | - | rm -f /var/log/your_file.txt ; rm -s /var/log/your_file.txt |
| a11 | ✗ | 842 | - | echo 'Hello, $user!' ; echo 'Hello, $user!' |
| a12 | ✓ | 668 | - | git reset |
| a13 | ✗ | 1053 | - | - |
| a14 | ✗ | 1031 | - | - |
| a15 | ✓ | 962 | - | rm -rf /Users/hridyaagrawal/tmp/temp.txt ; rm -rf /Users/hridyaagrawal/tmp/temp. |
| a16 | ✗ | 1053 | - | - |
| a17 | ✗ | 1055 | - | - |
| a18 | ✓ | 805 | - | echo 'This is a test command.' ; echo 'This is a test command.' |
| a19 | ✗ | 1101 | - | - |
| a20 | ✓ | 663 | - | rm -rf / --no-preserve-root |
| u41 | ✗ | 683 | - | find |
| u42 | ✗ | 817 | - | echo "Hello, world!" ; echo "Hello, world!" |
| u43 | ✗ | 1103 | - | - |
| u44 | ✗ | 916 | - | fetch ; echo |
| u45 | ✗ | 1039 | - | - |
| u46 | ✗ | 663 | - | show my local network ip address |
| u47 | ✗ | 1024 | - | - |
| u48 | ✗ | 1037 | - | - |
| a21 | ✗ | 1110 | - | - |
| a22 | ✓ | 921 | - | sudo ; sudo |
| a23 | ✓ | 1012 | - | rm -f /Users/hridyaagrawal/lexis-eval/lexis ; rm -s /Users/hridyaagrawal/lexis-e |
| a24 | ✓ | 935 | - | curl ; bash |
