import { analyzeCommand, CAP_LABELS } from "../policy.mjs";
import { blastRadius } from "../blast.mjs";
import { detectShell } from "../machine.mjs";

export async function explainCommand(args) {
  const command = args.filter((a) => !a.startsWith("--")).join(" ").trim();
  if (!command) {
    throw new Error("Usage: lx explain <command>");
  }
  const shell = detectShell();
  const analysis = analyzeCommand(command, { shell });
  process.stdout.write(`command   : ${command}\n`);
  process.stdout.write(`risk      : ${analysis.risk}\n`);
  process.stdout.write(`read-only : ${analysis.readonly ? "yes" : "no"}\n`);
  if (analysis.tags.length) process.stdout.write(`signals   : ${analysis.tags.join(", ")}\n`);
  if (analysis.caps.length) process.stdout.write(`does      : ${analysis.caps.map((k) => CAP_LABELS[k] || k).join(" · ")}\n`);
  for (const b of blastRadius(command, { shell })) process.stdout.write(`blast     : ${b}\n`);
  if (analysis.reasons.length) process.stdout.write(`why       : ${analysis.reasons.join("; ")}\n`);
}
