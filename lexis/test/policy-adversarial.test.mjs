// Adversarial probes: commands outside the labelled corpus that must never
// come back readonly, and must carry at least the stated risk floor.
// [command, shell, minRisk]
import test from "node:test";
import assert from "node:assert/strict";
import { analyzeCommand, RISK_SCORE } from "../src/policy.mjs";

const CASES = [
  // --- wrapper/loop indirection ---
  ["xargs rm < files.txt", "zsh", "high"],
  ["find . -name '*.log' | xargs -0 rm", "zsh", "high"],
  ["env rm -rf build", "zsh", "high"],
  ["nice -n 10 rm -rf ~/x", "zsh", "high"],
  ["nohup rm -rf /tmp/x &", "zsh", "high"],
  ["time dd if=/dev/zero of=/dev/sda", "zsh", "critical"],
  ["command rm file", "zsh", "moderate"],
  ["sshpass -p pw ssh host 'rm -rf /'", "zsh", "critical"],
  ["taskset -c 0 rm x", "zsh", "moderate"],
  ["for f in *.txt; do rm $f; done", "zsh", "moderate"],
  ["while read f; do mv $f /tmp; done < list", "zsh", "moderate"],
  ["for i in 1 2; do echo $i > out.txt; done", "zsh", "moderate"],
  ["until nc -z host 22; do sleep 1; done; rm -rf ~/x", "zsh", "high"],
  ["yes | rm -i *", "zsh", "high"],
  ["yes > /dev/sda", "zsh", "high"],
  ["bc <<< '1+1' > out", "zsh", "moderate"],

  // --- exec sinks: pipes / sourced files / invoked scriptblocks ---
  ["tar -xOf a.tar | sh", "zsh", "critical"],
  ["xclip -o | sh", "zsh", "critical"],
  ["echo 'id' | sh", "zsh", "high"],
  ["printf 'ls' | bash", "zsh", "high"],
  ["Get-Clipboard | iex", "powershell", "critical"],
  ["Invoke-Expression (Get-Clipboard)", "powershell", "critical"],
  ["$env:PATH = 'x'; iex $y", "powershell", "high"],
  ["& { Remove-Item x }", "powershell", "high"],
  [". ./script.ps1", "powershell", "high"],
  ["source ~/.bashrc", "zsh", "high"],
  ["bash deploy.sh", "zsh", "high"],
  ["sh -x run.sh", "zsh", "high"],
  ["xargs -I{} sh -c 'rm {}' < l", "zsh", "high"],

  // --- pager/viewer escapes ---
  ["less +'!rm -rf ~' file", "zsh", "moderate"],
  ["less -k evil.lkey file", "zsh", "moderate"],
  ["more +F file", "zsh", "moderate"],
  ["LESSOPEN='|rm -rf ~' less file", "zsh", "moderate"],
  ["GIT_PAGER='sh -c x' git log", "zsh", "moderate"],

  // --- text processors shelling out or writing ---
  ["awk 'BEGIN{system(\"rm -rf ~\")}'", "zsh", "high"],
  ["awk '{print > \"out.txt\"}' f", "zsh", "moderate"],
  ["sed -n 'w out' f", "zsh", "moderate"],
  ["sed '1e id' f", "zsh", "high"],

  // --- output-file flags and redirects into system paths ---
  ["strace -o /etc/passwd ls", "zsh", "high"],
  ["strace -o /tmp/t ls", "zsh", "moderate"],
  ["sort -o /etc/x file", "zsh", "high"],
  ["sort -o file file", "zsh", "moderate"],
  ["cat file | tee /etc/hosts", "zsh", "high"],
  ["ls > /dev/sda", "zsh", "high"],
  ["echo hi >> ~/.zshrc", "zsh", "moderate"],
  ["head -c 100 /dev/urandom > f", "zsh", "moderate"],
  ["nl -ba file > file2", "zsh", "moderate"],
  ["gcc -o /usr/bin/x x.c", "zsh", "high"],

  // --- .NET / WMI mutations ---
  ["(Get-Item x).Delete()", "powershell", "high"],
  ["Get-ChildItem | % { $_.Delete() }", "powershell", "high"],
  ["Get-WmiObject Win32_Process | % { $_.Terminate() }", "powershell", "high"],
  ["Get-CimInstance Win32_Process | Invoke-CimMethod -MethodName Terminate", "powershell", "high"],
  ["[System.IO.File]::Delete('x')", "powershell", "high"],
  ["[IO.Directory]::Delete('x')", "powershell", "high"],
  ["[IO.File]::WriteAllText('x','y')", "powershell", "moderate"],
  ["[IO.File]::AppendAllText('x','y')", "powershell", "moderate"],
  ["[Environment]::Exit(0)", "powershell", "moderate"],
  ["Get-ChildItem | ForEach-Object { Remove-Item $_ }", "powershell", "high"],
  ["Get-Process | Where-Object { $_.Kill() }", "powershell", "high"],

  // --- network/system config writes ---
  ["netsh wlan delete profile name=x", "powershell", "high"],
  ["netsh interface ip set address \"LAN\" dhcp", "powershell", "moderate"],
  ["wsl --unregister Ubuntu", "powershell", "high"],
  ["wsl --shutdown", "powershell", "moderate"],
  ["winget uninstall x", "powershell", "moderate"],
  ["ipconfig /release", "powershell", "moderate"],

  // --- misc ---
  ["git config user.name x", "zsh", "moderate"],
  ["Get-Content x | Out-File y", "powershell", "moderate"],
  ["curl -G https://x --data-urlencode q=1 -o out.bin", "zsh", "moderate"],
  ["time (rm -rf x)", "zsh", "high"],
  ["env -i bash -c 'rm x'", "zsh", "moderate"],
  ["screencapture -c; rm x", "zsh", "moderate"],
  ["git reflog show; git reflog expire --all", "zsh", "moderate"],
  ["wsl rm -rf ~", "powershell", "critical"],
  ["powershell -Command \"Remove-Item x\"", "powershell", "moderate"],
  ["pwsh -c 'Get-Process; Stop-Process -Name x'", "powershell", "moderate"],
  ["'{0}' -f (Remove-Item x)", "powershell", "moderate"],
  ["Get-Service | Stop-Service", "powershell", "moderate"],
];

test("adversarial commands are never readonly and meet their risk floor", () => {
  const bad = [];
  for (const [cmd, shell, minRisk] of CASES) {
    const a = analyzeCommand(cmd, { shell });
    if (a.readonly) bad.push(`RO!! ${cmd}`);
    else if (RISK_SCORE[a.risk] < RISK_SCORE[minRisk]) bad.push(`${a.risk}<${minRisk} ${cmd}`);
  }
  assert.deepEqual(bad, [], `${bad.length} violations:\n${bad.join("\n")}`);
});
