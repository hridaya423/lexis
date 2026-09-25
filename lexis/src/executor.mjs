import { spawn } from "node:child_process";

function shellInvocation(command, shell) {
  const isWin = process.platform === "win32";
  const resolved = (shell || "").toLowerCase();

  if (isWin) {
    if (resolved === "cmd") {
      return { command: "cmd", args: ["/d", "/s", "/c", command] };
    }
    const ps = resolved === "powershell" || resolved === "pwsh" ? resolved : "powershell";
    return { command: ps === "pwsh" ? "pwsh" : "powershell", args: ["-NoProfile", "-NonInteractive", "-Command", command] };
  }

  const shellCmd = { zsh: "zsh", bash: "bash", fish: "fish" }[resolved] || "sh";
  return { command: shellCmd, args: ["-c", command] };
}

export async function executePlan(plan, { dryRun = false, platform, shell, onEvent, timeoutMs = 0 } = {}) {
  const results = [];

  for (const step of plan.commands) {
    if (!isCommandForPlatform(step.platform, platform)) {
      results.push({ command: step.command, skipped: true, reason: `Skipped for platform ${platform}` });
      continue;
    }
    if (dryRun) {
      results.push({ command: step.command, skipped: true, reason: "Dry run" });
      continue;
    }

    const startedAt = Date.now();
    const outcome = await runShellCommand(step.command, shell, timeoutMs);
    const result = { command: step.command, durationMs: Date.now() - startedAt, ...outcome };
    results.push(result);
    onEvent?.(result);

    if (outcome.exitCode !== 0) break;
  }

  return results;
}

function isCommandForPlatform(commandPlatform = "all", runtimePlatform) {
  if (commandPlatform === "all") return true;
  if (runtimePlatform === "win32" || runtimePlatform === "windows") return commandPlatform === "windows";
  return commandPlatform === "unix";
}

async function runShellCommand(command, shell, timeoutMs = 0) {
  const { command: bin, args } = shellInvocation(command, shell);
  return new Promise((resolve) => {
    let child;
    try {
      child = spawn(bin, args, {
        stdio: ["inherit", "pipe", "pipe"],
        env: process.env,
        windowsHide: false,
      });
    } catch (error) {
      resolve({ exitCode: 1, signal: null, stdoutBytes: 0, stderrBytes: 0, error: error.message });
      return;
    }

    let stdoutBytes = 0;
    let stderrBytes = 0;
    let stderrTail = "";

    const onSigint = () => {
      if (child.exitCode === null && !child.killed) child.kill("SIGINT");
    };
    process.on("SIGINT", onSigint);

    let timer;
    if (timeoutMs > 0) {
      timer = setTimeout(() => {
        if (child.exitCode === null && !child.killed) {
          child.kill("SIGTERM");
          setTimeout(() => { if (child.exitCode === null) child.kill("SIGKILL"); }, 2000).unref();
        }
      }, timeoutMs);
      timer.unref();
    }

    child.stdout?.on("data", (chunk) => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
      stdoutBytes += buffer.length;
      process.stdout.write(buffer);
    });
    child.stderr?.on("data", (chunk) => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
      stderrBytes += buffer.length;
      stderrTail = (stderrTail + buffer.toString("utf8")).slice(-2000);
      process.stderr.write(buffer);
    });

    child.on("error", (error) => {
      process.off("SIGINT", onSigint);
      clearTimeout(timer);
      resolve({ exitCode: 1, signal: null, stdoutBytes, stderrBytes, error: error.message });
    });

    child.on("exit", (exitCode, signal) => {
      process.off("SIGINT", onSigint);
      clearTimeout(timer);
      resolve({ exitCode: exitCode ?? 1, signal: signal ?? null, stdoutBytes, stderrBytes, stderrTail });
    });
  });
}
