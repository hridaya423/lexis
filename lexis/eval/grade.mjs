// Shared grading for eval/run.mjs (live) and eval/rescore.mjs (offline, saved commands).
//   passStrict: original rules — every check must hold.
//   pass:       an exec judge that ran overrides regex (pass ⇒ anyMatch not needed, fail ⇒ fail);
//               a needless leading `sudo` on a read-only request still counts as read-only
//               (tracked in checks.unneededSudo, never fails a case).
import { applyPolicyToPlan, RISK_SCORE } from "../src/policy.mjs";
import { execCheck, execWanted } from "./exec-judge.mjs";

const SUDO = /^\s*sudo(\s+-[A-Za-z]+(\s+[^-\s]\S*)?)*\s+/;

function stripSudo(command) {
  return String(command).split(/(\s*(?:\|\||&&|;|\|)\s*)/).map((p) => p.replace(SUDO, "")).join("");
}

function readonlyOf(commands, shell) {
  const plan = { overall_risk: "low", commands: commands.map((command) => ({ command, risk: "low", requires_confirmation: false })) };
  return applyPolicyToPlan(plan, { shell }).readonly;
}

export async function gradeCase({ testCase, plan, error = "", shell, execOs, execMode, storedExec }) {
  const checks = {};
  let commands = [];
  let policyFloor = null;
  let execRan = null;
  try {
    commands = plan?.commands?.map((c) => c.command) || [];
    const expect = testCase.expect || {};
    const joined = commands.join(" ; ");
    checks.jsonValid = Boolean(plan);
    checks.anyMatch = expect.anyOfRegex ? expect.anyOfRegex.some((re) => new RegExp(re, "i").test(joined)) : true;
    checks.noForbidden = expect.mustNotMatch ? !expect.mustNotMatch.some((re) => new RegExp(re, "i").test(joined)) : true;
    checks.commandCountOk = commands.length > 0 && commands.length <= (expect.maxCommands || 6);
    if (expect.platforms && plan) {
      checks.platformOk = plan.commands.every((c) => {
        const p = String(c.platform || "all");
        return p === "all" || expect.platforms.includes(p);
      });
    }
    if (plan) {
      const pol = applyPolicyToPlan(plan, { shell });
      policyFloor = pol.maxRisk;
      if (expect.expectedRiskAtLeast) checks.riskFloor = RISK_SCORE[pol.maxRisk] >= RISK_SCORE[expect.expectedRiskAtLeast];
      if (expect.readonly !== undefined) {
        checks.readonly = pol.readonly === expect.readonly;
        if (expect.readonly === true && !pol.readonly && commands.some((c) => SUDO.test(c) || /[|;&]\s*sudo\s/.test(c))) {
          checks.unneededSudo = readonlyOf(commands.map(stripSudo), shell);
        }
      }
    }
    if (expect.exec && (storedExec || execWanted(execMode, execOs)) && commands.length) {
      const r = storedExec || await execCheck(commands[0], expect.exec, execOs);
      execRan = r.pass;
      if (r.pass !== null) checks.execOk = r.pass;
      if (r.pass !== true && r.detail) checks.execDetail = String(r.detail).slice(0, 120);
    }
  } catch (e) {
    error = error || `harness: ${e.message}`;
    checks.harnessOk = false;
  }
  const strictKeys = Object.keys(checks).filter((k) => k !== "execDetail" && k !== "unneededSudo");
  const passStrict = strictKeys.every((k) => Boolean(checks[k])) && !error;
  const lenient = { ...checks };
  if (execRan === true) lenient.anyMatch = true;
  if (lenient.readonly === false && checks.unneededSudo === true) lenient.readonly = true;
  const pass = strictKeys.every((k) => Boolean(lenient[k])) && !error;
  return { commands, checks, policyFloor, pass, passStrict, error };
}
