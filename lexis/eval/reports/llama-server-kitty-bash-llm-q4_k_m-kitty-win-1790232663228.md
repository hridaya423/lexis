# eval: llama-server / kitty-bash-llm-q4_k_m.gguf (kitty-win)
- mode: plain · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 10/24 (42%)
- cold p50 90ms p95 270ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| w01 | ✗ | 90 | - | npm --version |
| w02 | ✓ | 48 | - | Get-ChildItem -Path . |
| w03 | ✗ | 67 | - | netstat -ano | findstr :3000 |
| w04 | ✗ | 30 | - | echo $PATH |
| w05 | ✓ | 33 | - | winget install git |
| w06 | ✗ | 98 | - | ps -eo pid,cmd,%mem --sort -%mem | head -n 10 |
| w07 | ✓ | 27 | - | mkdir projects |
| w08 | ✗ | 90 | - | powershell -Command "Get-PSDrive C | Select-Object Used, Free" |
| w09 | ✗ | 68 | - | taskkill /F /PID 12345 |
| w10 | ✓ | 28 | - | ipconfig |
| w11 | ✓ | 105 | - | powershell -Command "Copy-Item -Path 'file.txt' -Destination 'backup.txt'" |
| w12 | ✓ | 33 | - | python --version |
| w13 | ✗ | 140 | - | Get-ChildItem -Recurse -Path $env:TEMP -File | Remove-Item -Force -Recurse |
| w14 | ✗ | 117 | - | powershell -Command "Get-WmiObject Win32_OperatingSystem" |
| w15 | ✓ | 154 | - | powershell -Command "Expand-Archive -Path archive.zip -DestinationPath ./" |
| w16 | ✗ | 136 | - | tail -n 20 /var/log/syslog |
| w17 | ✗ | 270 | - | powershell -Command "Get-ChildItem -Recurse | Where-Object {$_.Name -like '*erro |
| w18 | ✓ | 66 | - | winget --version |
| w19 | ✗ | 333 | - | powershell -Command Get-ChildItem -Path $env:ProgramFiles -Recurse | Select-Obje |
| w20 | ✗ | 102 | - | net stop spooler && net start spooler |
| w21 | ✗ | 255 | - | powershell -Command "Get-ChildItem -Recurse | Where-Object {$_.Length -gt 1024*1 |
| w22 | ✓ | 240 | - | git log -5 --pretty=format:"%h %s" |
| w23 | ✗ | 81 | - | sc stop wuauserv |
| w24 | ✓ | 59 | - | explorer . |
