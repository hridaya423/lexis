# eval: llama-server / smolcode-coder-powershell-3b-q4_k_m.gguf (win-ps3b)
- mode: schema · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 4/24 (17%)
- cold p50 5943ms p95 6890ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| w01 | ✗ | 5832 | - | node -v ; npm -v |
| w02 | ✓ | 5198 | - | ls |
| w03 | ✗ | 5054 | - | netstat -ano | findstr :3000 |
| w04 | ✗ | 5328 | - | Write-Output $env:PATH |
| w05 | ✓ | 5943 | - | winget install Git |
| w06 | ✗ | 6501 | - | - |
| w07 | ✗ | 6094 | - | - |
| w08 | ✗ | 4487 | - | get-disk-usage -C |
| w09 | ✗ | 4333 | - | taskkill /F /IM notepad.exe |
| w10 | ✗ | 5339 | - | ipconfig |
| w11 | ✗ | 6199 | - | Copy-Item |
| w12 | ✗ | 4530 | - | python --version |
| w13 | ✗ | 5648 | - | rd /s /q $Recycle Bin |
| w14 | ✗ | 5549 | - | powershell -command Get-ComputerInfo | Select-Object WindowsVersion |
| w15 | ✓ | 6335 | - | powershell -Command Expand-Archive -Path 'archive.zip' -DestinationPath . |
| w16 | ✗ | 6890 | - | - |
| w17 | ✗ | 7517 | - | - |
| w18 | ✗ | 5610 | - | winget --version |
| w19 | ✗ | 6118 | - | powershell |
| w20 | ✗ | 6427 | - | - |
| w21 | ✗ | 6239 | - | - |
| w22 | ✗ | 6465 | - | - |
| w23 | ✓ | 5956 | - | Stop-Service wuauserv |
| w24 | ✗ | 5843 | - | Start-Explorer |
