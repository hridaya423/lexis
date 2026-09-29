# eval: llama-server / LFM2.5-1.2B-Nova-Function-Calling.Q4_K_M.gguf (lfm25-1.2b-fc)
- mode: schema · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 12/72 (17%)
- cold p50 1936ms p95 1999ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✗ | 1923 | - | npm ; npm |
| u02 | ✗ | 1952 | - | - |
| u03 | ✗ | 1517 | - | curl ; hostname |
| u04 | ✗ | 1974 | - | - |
| u05 | ✗ | 1937 | - | - |
| u06 | ✗ | 1623 | - | find ; find ; find |
| u07 | ✗ | 1936 | - | - |
| u08 | ✗ | 1501 | - | git ; git |
| u09 | ✗ | 1942 | - | - |
| u10 | ✓ | 1429 | - | mkdir projects ; cd projects |
| u11 | ✗ | 1683 | - | tar ; tar ; tar |
| u12 | ✗ | 1970 | - | - |
| u13 | ✗ | 1117 | - | kill -9 8080 |
| u14 | ✗ | 1244 | - | cat ; tail |
| u15 | ✗ | 1939 | - | - |
| u16 | ✓ | 1276 | - | brew update ; brew list outdated |
| u17 | ✗ | 1778 | - | echo ; echo ; echo |
| u18 | ✗ | 1939 | - | - |
| u19 | ✗ | 2001 | - | - |
| u20 | ✗ | 1931 | - | - |
| u21 | ✗ | 1317 | - | grep -c *.js |
| u22 | ✗ | 1968 | - | - |
| u23 | ✓ | 1267 | - | chmod +x script.sh ; ./script.sh |
| u24 | ✗ | 1949 | - | - |
| u25 | ✗ | 1970 | - | - |
| u26 | ✗ | 1350 | - | cat /sys/class/process/ ; cat /sys/class/process/#0 |
| u27 | ✗ | 1398 | - | echo FOO=bar ; echo FOO=bar |
| u28 | ✗ | 1937 | - | - |
| u29 | ✓ | 1119 | - | netstat -tuln |
| u30 | ✗ | 1947 | - | - |
| u31 | ✗ | 1964 | - | - |
| u32 | ✗ | 1934 | - | - |
| u33 | ✗ | 1999 | - | - |
| u34 | ✗ | 1935 | - | - |
| u35 | ✗ | 1842 | - | cp ; cp ; cp |
| u36 | ✗ | 1190 | - | mv |
| u37 | ✗ | 1615 | - | du -sh ~/downloads ; ls -l ~/downloads ; ls -l ~/downloads |
| u38 | ✗ | 1945 | - | - |
| u39 | ✗ | 1117 | - | cd |
| u40 | ✓ | 1706 | - | sudo dscacheutil -flushcache ; sudo dscacheutil -clear ; sudo dscacheutil -flush |
| a01 | ✗ | 1933 | - | - |
| a02 | ✗ | 1950 | - | - |
| a03 | ✗ | 1859 | - | git push ; git push ; git push |
| a04 | ✓ | 1871 | - | curl ; sudo ; ./install.sh |
| a05 | ✗ | 1950 | - | - |
| a06 | ✗ | 1898 | - | chmod ; sudo ; sudo -i |
| a07 | ✗ | 1956 | - | - |
| a08 | ✗ | 1981 | - | - |
| a09 | ✗ | 1941 | - | - |
| a10 | ✗ | 1628 | - | find ; rm |
| a11 | ✗ | 1939 | - | - |
| a12 | ✗ | 1962 | - | - |
| a13 | ✗ | 1939 | - | - |
| a14 | ✗ | 1948 | - | - |
| a15 | ✗ | 1962 | - | - |
| a16 | ✗ | 1974 | - | - |
| a17 | ✗ | 1937 | - | - |
| a18 | ✗ | 2012 | - | - |
| a19 | ✗ | 1965 | - | - |
| a20 | ✓ | 1087 | - | rm -rf / --no-preserve-root |
| u41 | ✗ | 1977 | - | - |
| u42 | ✗ | 1630 | - | echo ; echo |
| u43 | ✗ | 1953 | - | - |
| u44 | ✓ | 1178 | - | curl -s https://example.com |
| u45 | ✗ | 1549 | - | find ; ls |
| u46 | ✓ | 1433 | - | ifconfig ; ip addr ; hostname |
| u47 | ✗ | 1949 | - | - |
| u48 | ✓ | 1812 | - | who ; whoami |
| a21 | ✗ | 2003 | - | - |
| a22 | ✗ | 1994 | - | - |
| a23 | ✓ | 1637 | - | rm -rf ; rm -rf ; rm -rf |
| a24 | ✓ | 1404 | - | curl ; bash |
