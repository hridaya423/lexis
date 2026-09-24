import { emitKeypressEvents } from "node:readline";

const ANSI = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code, s) => (ANSI ? `\x1b[${code}m${s}\x1b[0m` : s);
export const bold = (s) => c("1", s);
export const dim = (s) => c("2", s);
export const green = (s) => c("32", s);
export const red = (s) => c("31", s);
export const cyan = (s) => c("36", s);

const SPIN = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export function line(text = "") {
  process.stdout.write(`${text}\n`);
}

export function step(title) {
  line(`\n${bold("◆")} ${bold(title)}`);
}

export function ok(text) {
  line(`  ${green("✓")} ${text}`);
}

export function warn(text) {
  line(`  ${ANSI ? "\x1b[33m" : ""}!${ANSI ? "\x1b[0m" : ""} ${text}`);
}

export function fail(text) {
  line(`  ${red("✗")} ${text}`);
}

export function info(text) {
  line(`  ${text}`);
}

export function spin(text) {
  if (!ANSI) return { update() {}, succeed: (t) => ok(t ?? text), fail: (t) => fail(t ?? text) };
  let i = 0;
  let current = text;
  const draw = () => process.stdout.write(`\r\x1b[2K  ${cyan(SPIN[i++ % SPIN.length])} ${current}`);
  draw();
  const timer = setInterval(draw, 80);
  timer.unref?.();
  const finish = (mark, t) => {
    clearInterval(timer);
    process.stdout.write(`\r\x1b[2K  ${mark} ${t ?? current}\n`);
  };
  return {
    update(t) { current = t; },
    succeed(t) { finish(green("✓"), t); },
    fail(t) { finish(red("✗"), t); },
  };
}

export function select(title, options, { initial } = {}) {
  const first = initial ?? options.find((o) => !o.disabled)?.id;
  if (!ANSI || !process.stdin.isTTY) {
    step(title);
    for (const o of options) {
      info(`${o.id === first ? green("❯") : " "} ${o.label}${o.hint ? dim(` — ${o.hint}`) : ""}${o.disabled ? dim(" (unavailable)") : ""}`);
    }
    return Promise.resolve(first);
  }
  return new Promise((resolve) => {
    let idx = Math.max(0, options.findIndex((o) => o.id === first && !o.disabled));
    const rows = options.length + 1;
    const render = () => {
      process.stdout.write(`\x1b[${rows}A`);
      for (let i = 0; i < options.length; i++) {
        const o = options[i];
        const on = i === idx;
        const label = o.disabled ? dim(o.label) : on ? bold(o.label) : o.label;
        const hint = o.disabled ? dim(` — ${o.hint || "unavailable"}`) : o.hint ? dim(` — ${o.hint}`) : "";
        process.stdout.write(`\x1b[2K  ${on ? cyan("❯") : " "} ${label}${o.tag ? ` ${green(o.tag)}` : ""}${hint}\n`);
      }
      process.stdout.write(`\x1b[2K  ${dim("↑/↓ move · enter select")}`);
    };
    step(title);
    for (let i = 0; i < options.length; i++) process.stdout.write("\n");
    process.stdout.write("\n");
    render();
    const move = (d) => {
      for (let n = 0; n < options.length; n++) {
        idx = (idx + d + options.length) % options.length;
        if (!options[idx].disabled) break;
      }
      render();
    };
    const onKey = (str, key = {}) => {
      if (key.name === "up" || str === "k") return move(-1);
      if (key.name === "down" || str === "j") return move(1);
      if (key.name === "return") return done(options[idx].id);
      if (str >= "1" && str <= String(options.length)) {
        const i = Number(str) - 1;
        if (!options[i].disabled) return done(options[i].id);
      }
      if (key.name === "escape") return done(first);
      if (key.ctrl && key.name === "c") {
        process.stdin.setRawMode?.(false);
        process.stdout.write("\x1b[0J\n");
        process.exit(130);
      }
    };
    const done = (id) => {
      process.stdin.off("keypress", onKey);
      process.stdin.setRawMode?.(false);
      process.stdout.write("\x1b[0J\n");
      resolve(id);
    };
    emitKeypressEvents(process.stdin);
    process.stdin.setRawMode?.(true);
    process.stdin.resume();
    process.stdin.on("keypress", onKey);
  });
}

export function commandCard({ commands, reason, reasonColor = "dim", meta, keys, danger = false }) {
  const multi = commands.length > 1;
  for (const [i, cmd] of commands.entries()) {
    line(`  ${danger ? red(multi ? `${i + 1}.` : "›") : cyan(multi ? `${i + 1}.` : "›")} ${cmd}`);
  }
  if (danger && reason) {
    line(`    ${red(reason)}`);
  } else if (reason) {
    line(`    ${reasonColor === "warn" ? (ANSI ? `\x1b[33m${reason}\x1b[0m` : reason) : dim(reason)}`);
  }
  if (meta) line(`    ${dim(meta)}`);
  if (keys) line(`    ${keys}`);
}

export function confirmCard({ commands, reason, risk }) {
  const warn = risk === "moderate" || risk === "high";
  const tty = process.stdin.isTTY && process.stdout.isTTY;
  commandCard({
    commands,
    reason: `needs approval${reason ? ` · ${reason}` : ""}`,
    reasonColor: warn ? "warn" : "dim",
    keys: tty ? dim("enter run · e edit · esc cancel") : dim("non-interactive — pass --yes or --force to run"),
  });
  if (!tty) return Promise.resolve("cancel");
  return new Promise((resolve) => {
    const done = (v) => {
      process.stdin.off("keypress", onKey);
      process.stdin.setRawMode?.(false);
      resolve(v);
    };
    const onKey = (str, key = {}) => {
      if (key.ctrl && key.name === "c") {
        process.stdin.setRawMode?.(false);
        line(`    ${dim("cancelled")}`);
        process.exit(130);
      }
      if (key.name === "return" || str === "y") return done("run");
      if (str === "e") return done("edit");
      if (key.name === "escape" || str === "n" || str === "q") return done("cancel");
    };
    emitKeypressEvents(process.stdin);
    process.stdin.setRawMode?.(true);
    process.stdin.resume();
    process.stdin.on("keypress", onKey);
  });
}

export function progress(label) {
  let lastLine = 0;
  let lastPct = -1;
  return (message, detail = {}) => {
    const { received = 0, total = 0 } = detail;
    if (ANSI && total > 0) {
      const pct = Math.min(100, Math.round((received / total) * 100));
      const width = 28;
      const fill = Math.round((pct / 100) * width);
      const bar = "█".repeat(fill) + "░".repeat(width - fill);
      const mb = `${(received / 1048576).toFixed(0)}/${(total / 1048576).toFixed(0)} MB`;
      process.stdout.write(`\r\x1b[2K  ${bar} ${String(pct).padStart(3)}%  ${dim(mb)}  ${dim(label)}`);
      if (pct >= 100) process.stdout.write("\n");
      return;
    }
    const now = Date.now();
    if (now - lastLine > 1000 || !lastLine) {
      lastLine = now;
      const pct = total > 0 ? Math.round((received / total) * 100) : null;
      if (pct !== lastPct) {
        lastPct = pct;
        line(`  ${message}${pct !== null ? ` — ${pct}%` : ""}`);
      }
    }
  };
}
