import { loadApprovals, saveApprovals } from "../approvals.mjs";
import * as ui from "../ui.mjs";

export async function approvalsCommand(args) {
  const entries = loadApprovals();
  const sub = args[0];

  if (sub === "clear") {
    saveApprovals([]);
    ui.ok("cleared all remembered approvals");
    return;
  }
  if (sub === "rm" || sub === "remove" || sub === "delete") {
    const n = Number(args[1]);
    if (!Number.isInteger(n) || n < 1 || n > entries.length) {
      throw new Error(`Usage: lx approvals rm <1-${entries.length}>`);
    }
    const [gone] = entries.splice(n - 1, 1);
    saveApprovals(entries);
    ui.ok(`forgot \`${gone.family}\` in ${gone.cwd}`);
    return;
  }
  if (!entries.length) {
    ui.info("No remembered approvals. Press `a` on an approval card to remember a command family in that folder.");
    return;
  }
  ui.step("Remembered approvals");
  entries.forEach((e, i) => {
    ui.info(`${String(i + 1).padStart(3)}. ${ui.bold(e.family)}  ${ui.dim(e.cwd)}`);
  });
  ui.info(ui.dim("\nforget one: lx approvals rm <n> · clear all: lx approvals clear"));
}
