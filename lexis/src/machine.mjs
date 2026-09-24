import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

let cachedMachine = null;

function probe(command, args, timeoutMs = 4000) {
  try {
    const result = spawnSync(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
      encoding: "utf8",
      timeout: timeoutMs,
      windowsHide: true,
    });
    return { ok: result.status === 0, stdout: result.stdout || "", stderr: result.stderr || "" };
  } catch {
    return { ok: false, stdout: "", stderr: "" };
  }
}

function detectGpu() {
  const platform = process.platform;
  const arch = process.arch;

  if (platform === "darwin") {
    return arch === "arm64"
      ? { vendor: "apple", backend: "metal", vramGb: null }
      : { vendor: "none", backend: "cpu", vramGb: null };
  }

  if (platform === "linux") {
    const smi = probe("nvidia-smi", ["--query-gpu=memory.total", "--format=csv,noheader,nounits"]);
    if (smi.ok && smi.stdout.trim()) {
      const mb = Number.parseInt(smi.stdout.trim().split("\n")[0], 10);
      const vramGb = Number.isFinite(mb) ? Math.round(mb / 1024) : null;
      const ver = probe("nvidia-smi", []);
      const cudaMatch = (ver.stdout || "").match(/CUDA Version:\s*(\d+)\.(\d+)/i);
      const cudaMajor = cudaMatch ? Number(cudaMatch[1]) : 0;
      const cudaMinor = cudaMatch ? Number(cudaMatch[2]) : 0;
      const cudaOk = cudaMajor > 13 || (cudaMajor === 13 && cudaMinor >= 3);
      return { vendor: "nvidia", backend: cudaOk ? "cuda" : "vulkan", vramGb, cudaVersion: cudaMatch ? `${cudaMajor}.${cudaMinor}` : null };
    }
    try {
      const dri = spawnSync("sh", ["-c", "ls /dev/dri/renderD* 2>/dev/null | head -1"], {
        encoding: "utf8",
        windowsHide: true,
      });
      if (dri.status === 0 && dri.stdout.trim()) {
        return { vendor: "other", backend: "vulkan", vramGb: null };
      }
    } catch {}
    return { vendor: "none", backend: "cpu", vramGb: null };
  }

  if (platform === "win32") {
            const smi = probe("nvidia-smi", ["--query-gpu=memory.total", "--format=csv,noheader,nounits"]);
    if (smi.ok && smi.stdout.trim()) {
      const mb = Number.parseInt(smi.stdout.trim().split("\n")[0], 10);
      const vramGb = Number.isFinite(mb) ? Math.round(mb / 1024) : null;
      const ver = probe("nvidia-smi", []);
      const cudaMatch = (ver.stdout || "").match(/CUDA Version:\s*(\d+)\.(\d+)/i);
      const cudaMajor = cudaMatch ? Number(cudaMatch[1]) : 0;
      const cudaMinor = cudaMatch ? Number(cudaMatch[2]) : 0;
      const cudaOk = cudaMajor > 13 || (cudaMajor === 13 && cudaMinor >= 4);
      return { vendor: "nvidia", backend: cudaOk ? "cuda" : "vulkan", vramGb, cudaVersion: cudaMatch ? `${cudaMajor}.${cudaMinor}` : null };
    }
    const ps = probe(
      "powershell",
      [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        "Get-CimInstance Win32_VideoController | ForEach-Object { \"$($_.Name)|$($_.AdapterRAM)\" }",
      ],
      8000
    );
    if (ps.ok && ps.stdout.trim()) {
      const lines = ps.stdout.trim().split(/\r?\n/);
      let best = { vendor: "none", backend: "cpu", vramGb: null };
      for (const line of lines) {
        const [name, ram] = line.split("|");
        const lower = (name || "").toLowerCase();
        const vramBytes = Number(ram);
        const vramGb = Number.isFinite(vramBytes) && vramBytes > 0 ? Math.round(vramBytes / 1073741824) : null;
        if (lower.includes("nvidia") || lower.includes("radeon") || lower.includes("amd") || lower.includes("intel")) {
          best = { vendor: lower.includes("nvidia") ? "nvidia" : lower.includes("radeon") || lower.includes("amd") ? "amd" : "intel", backend: "vulkan", vramGb };
          if (lower.includes("nvidia")) break;
        }
      }
      return best;
    }
    return { vendor: "none", backend: "cpu", vramGb: null };
  }

  return { vendor: "none", backend: "cpu", vramGb: null };
}

export function getMachine() {
  if (cachedMachine) {
    return cachedMachine;
  }
  cachedMachine = {
    platform: process.platform,
    platformName: process.platform === "win32" ? "windows" : process.platform === "darwin" ? "macos" : "linux",
    arch: process.arch,
    osRelease: os.release(),
    totalMemoryGb: Math.round((os.totalmem() / 1024 / 1024 / 1024) * 10) / 10,
    gpu: detectGpu(),
    shell: detectShell(),
  };
  return cachedMachine;
}

export function detectShell() {
  if (typeof process.env.LEXIS_SHELL === "string" && process.env.LEXIS_SHELL.trim()) {
    return process.env.LEXIS_SHELL.trim().toLowerCase();
  }
  if (process.platform === "win32") {
    const psModulePath = String(process.env.PSModulePath || "");
    if (psModulePath.includes("PowerShell")) {
      return "powershell";
    }
    const comSpec = String(process.env.ComSpec || "").trim();
    const base = comSpec ? path.win32.basename(comSpec).toLowerCase() : "";
    return base === "powershell.exe" || base === "pwsh.exe" ? "powershell" : "cmd";
  }
  const shell = process.env.SHELL || "";
  const base = path.basename(shell).toLowerCase();
  if (["zsh", "bash", "fish", "sh"].includes(base)) {
    return base;
  }
  return base || "sh";
}

export function detectPackageManagers() {
  const unix = ["brew", "apt-get", "dnf", "yum", "pacman", "zypper", "apk", "flatpak", "snap"];
  const win = ["winget", "choco", "scoop"];
  const candidates = process.platform === "win32" ? win : unix;
  const found = [];
  for (const cmd of candidates) {
    const result = probe(process.platform === "win32" ? "where" : "sh", process.platform === "win32" ? ["/q", cmd] : ["-c", `command -v ${cmd}`], 1500);
    if (result.ok) {
      found.push(cmd);
    }
  }
  return found;
}

let pkgCache = null;
export function getPackageManagers() {
  if (!pkgCache) {
    pkgCache = detectPackageManagers();
  }
  return pkgCache;
}
