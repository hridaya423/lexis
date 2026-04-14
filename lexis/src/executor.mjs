import { spawn } from "node:child_process";

export async function executePlan(plan, { dryRun = false, platform }) {
  const results = [];

  for (const step of plan.commands) {
    if (!isCommandForPlatform(step.platform, platform)) {
      results.push({
        command: step.command,
        skipped: true,
        reason: `Skipped for platform ${platform}`,
        stdoutBytes: 0,
        stderrBytes: 0,
      });
      continue;
    }

    if (dryRun) {
      results.push({
        command: step.command,
        skipped: true,
        reason: "Dry run",
        stdoutBytes: 0,
        stderrBytes: 0,
      });
      continue;
    }

    const outcome = await runShellCommand(step.command);
    results.push({
      command: step.command,
      ...outcome,
    });

    if (outcome.exitCode !== 0) {
      break;
    }
  }

  return results;
}

function isCommandForPlatform(commandPlatform = "all", runtimePlatform) {
  if (commandPlatform === "all") {
    return true;
  }
  if (runtimePlatform === "win32") {
    return commandPlatform === "windows";
  }
  return commandPlatform === "unix";
}

async function runShellCommand(command) {
  return new Promise((resolve) => {
    const child = spawn(command, {
      shell: true,
      stdio: ["inherit", "pipe", "pipe"],
      env: process.env,
    });

    let stdoutBytes = 0;
    let stderrBytes = 0;

    child.stdout?.on("data", (chunk) => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
      stdoutBytes += buffer.length;
      process.stdout.write(buffer);
    });

    child.stderr?.on("data", (chunk) => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
      stderrBytes += buffer.length;
      process.stderr.write(buffer);
    });

    child.on("exit", (exitCode, signal) => {
      resolve({
        exitCode: exitCode ?? 1,
        signal: signal ?? null,
        stdoutBytes,
        stderrBytes,
      });
    });
  });
}
