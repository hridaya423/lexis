# eval: llama-server / smolcode-coder-powershell-1.5b-q4_k_m.gguf (ps-win)
- mode: plain · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 8/24 (33%)
- cold p50 246ms p95 778ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| w01 | ✗ | 201 | - | powershell "node -v; npm -v" |
| w02 | ✓ | 167 | - | dir |
| w03 | ✗ | 632 | - | powershell -Command "Get-NetTCPConnection -LocalPort 3000 | Where-Object {$_.Sta |
| w04 | ✗ | 177 | - | powershell -command "Write-Output $env:PATH" |
| w05 | ✓ | 1367 | - | winget install git —s —f —y —c —n —v —i —u —t —p —d —o —r —g —a —b —c —d —e —f — |
| w06 | ✗ | 244 | - | powershell Get-Process | Sort-Object -Property WorkingSet -Descending |
| w07 | ✓ | 98 | - | mkdir projects |
| w08 | ✗ | 342 | - | powershell Get-PSDrive C: | Select-Object Name, FreeSpace, Size |
| w09 | ✓ | 259 | - | powershell -Command "Stop-Process -Name notepad" |
| w10 | ✗ | 171 | - | powershell "Get-NetIPAddress" |
| w11 | ✗ | 144 | - | copy "file.txt" "backup.txt" |
| w12 | ✗ | 778 | - | powershell -Command "if (Test-Path -Path "C:\Python39\python.exe") {Write-Output |
| w13 | ✗ | 609 | - | powershell Remove-Item -Path "C:\$env:USERPROFILE\AppData\Local\Microsoft\Window |
| w14 | ✗ | 322 | - | powershell -Command "Write-Output (Get-ComputerInfo).OSVersion" |
| w15 | ✓ | 147 | - | Expand-Archive archive.zip -DestinationPath . |
| w16 | ✗ | 360 | - | powershell Get-Content "path_to_log_file.log" -Tail 20 |
| w17 | ✗ | 479 | - | powershell -Command "Get-ChildItem -Recurse | Select-String -Pattern 'error'" |
| w18 | ✗ | 126 | - | powershell winget --version |
| w19 | ✗ | 105 | - | powershell Get-InstalledSoftware |
| w20 | ✓ | 246 | - | powershell Restart-Service -Name Spooler |
| w21 | ✗ | 586 | - | powershell Get-ChildItem -Recurse -Filter *.txt -File | Where-Object { $_.Length |
| w22 | ✓ | 136 | - | git log -n 5 |
| w23 | ✗ | 266 | - | powershell -Command "Stop-Service -Name wuauserv" |
| w24 | ✓ | 97 | - | explorer . |
