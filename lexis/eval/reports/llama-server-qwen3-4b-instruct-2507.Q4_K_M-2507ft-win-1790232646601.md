# eval: llama-server / qwen3-4b-instruct-2507.Q4_K_M.gguf (2507ft-win)
- mode: plain · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 14/24 (58%)
- cold p50 326ms p95 857ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| w01 | ✓ | 216 | - | node --version |
| w02 | ✓ | 145 | - | Get-ChildItem |
| w03 | ✗ | 474 | - | Test-NetConnection localhost -Port 3000 |
| w04 | ✗ | 212 | - | echo $PATH |
| w05 | ✓ | 228 | - | winget install git |
| w06 | ✗ | 857 | - | Get-Process | Sort-Object -Property WS -Descending | Select-Object ProcessName,  |
| w07 | ✓ | 202 | - | mkdir projects |
| w08 | ✗ | 326 | - | Get-PSDrive C | Select Used, Free |
| w09 | ✓ | 360 | - | Stop-Process -Name notepad |
| w10 | ✗ | 305 | - | Get-NetIPConfiguration |
| w11 | ✓ | 259 | - | Copy-Item file.txt backup.txt |
| w12 | ✓ | 178 | - | python --version |
| w13 | ✓ | 671 | - | Remove-Item -Path $env:USERPROFILE\RecycleBin -Recurse |
| w14 | ✗ | 416 | - | Get-ComputerInfo | Select-Object -ExpandProperty WindowsVersion |
| w15 | ✓ | 249 | - | Expand-Archive archive.zip |
| w16 | ✓ | 529 | - | Get-Content -Path "path/to/file.log" -Tail 20 |
| w17 | ✗ | 401 | - | Get-Content *.txt | Select-String error |
| w18 | ✓ | 214 | - | winget --version |
| w19 | ✗ | 476 | - | Get-AppxPackage | Select Name, PackageFullName | Format-Table |
| w20 | ✓ | 351 | - | Restart-Service -Name spooler |
| w21 | ✗ | 911 | - | Get-ChildItem -Recurse -File | Where-Object { $_.Length -gt 100MB } |
| w22 | ✓ | 832 | - | git log --pretty=format:'%h %ad | %s' --date=iso --reverse --max-count=5 |
| w23 | ✗ | 322 | - | Stop-Service -Name wuauserv |
| w24 | ✓ | 193 | - | explorer . |
