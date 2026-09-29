# eval: llama-server / howdo-4b-v4-Q4_K_M.gguf (howdo-win)
- mode: plain · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 14/24 (58%)
- cold p50 394ms p95 800ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| w01 | ✓ | 411 | - | node --version; npm --version |
| w02 | ✓ | 133 | - | ls |
| w03 | ✗ | 308 | - | netstat -ano | findstr :3000 |
| w04 | ✓ | 195 | - | echo $env:PATH |
| w05 | ✓ | 192 | - | winget install git |
| w06 | ✗ | 400 | - | tasklist /order:-mem |
| w07 | ✓ | 423 | - | New-Item -ItemType Directory -Name projects |
| w08 | ✗ | 507 | - | wmic logicaldisk get size,free,device |
| w09 | ✓ | 498 | - | Get-Process -Name notepad | Stop-Process |
| w10 | ✓ | 340 | - | ipconfig /all |
| w11 | ✓ | 297 | - | copy file.txt backup.txt |
| w12 | ✓ | 249 | - | python --version |
| w13 | ✗ | 556 | - | Remove-Item -Recurse -Force $env:TEMP |
| w14 | ✗ | 394 | - | wmic os get version |
| w15 | ✓ | 277 | - | tar -xf archive.zip |
| w16 | ✗ | 331 | - | tail -20 app.log |
| w17 | ✗ | 800 | - | find . -type f -exec grep -l "error" {} + |
| w18 | ✓ | 336 | - | winget --version |
| w19 | ✗ | 1281 | - | Get-ChildItem 'C:\Program Files' | Select-Object -Property Name,Version,Descript |
| w20 | ✓ | 410 | - | Restart-Service -Name spooler |
| w21 | ✗ | 495 | - | find . -size +100MB |
| w22 | ✓ | 438 | - | git log -n 5 --oneline |
| w23 | ✗ | 375 | - | net stop wuauserv |
| w24 | ✓ | 276 | - | explorer . |
