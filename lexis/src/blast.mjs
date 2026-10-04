// Blast-radius preview: for delete/write commands, estimate what they'd touch.
// Bounded scan (time + entry caps) — returns a short string or null.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { splitCommandLine, segmentHead } from "./policy.mjs";

const RM_HEADS = new Set(["rm", "rmdir", "rd", "del", "erase", "remove-item", "ri"]);
const WRITE_HEADS = new Set(["mv", "cp", "move", "copy", "ren", "rename", "move-item", "copy-item", "new-item", "set-content", "add-content", "out-file", "tee", "touch", "mkdir", "md", "expand-archive", "compress-archive"]);

const tokens = (s) => (s.match(/("[^"]*"|'[^']*'|\S+)/g) || []).map((t) => t.replace(/^["']|["']$/g, ""));

function resolveTarget(t, cwd) {
  if (!t || t.startsWith("-")) return null;
  const p = t.replace(/^~(?=$|[/\\])/, os.homedir());
  return path.resolve(cwd, p);
}

function fmtSize(b) {
  if (b >= 1 << 30) return `${(b / (1 << 30)).toFixed(1)} GB`;
  if (b >= 1 << 20) return `${(b / (1 << 20)).toFixed(1)} MB`;
  if (b >= 1 << 10) return `${(b / (1 << 10)).toFixed(0)} KB`;
  return `${b} B`;
}

// bounded recursive count — caps at 4000 entries / 80 ms
function scan(root, deadline) {
  let entries = 0, bytes = 0, capped = false;
  const stack = [root];
  while (stack.length) {
    if (entries > 4000 || Date.now() > deadline) { capped = true; break; }
    const p = stack.pop();
    let st;
    try { st = fs.lstatSync(p); } catch { continue; }
    if (st.isSymbolicLink() || st.isFile()) { entries += 1; bytes += st.size; continue; }
    if (!st.isDirectory()) continue;
    entries += 1;
    let kids;
    try { kids = fs.readdirSync(p); } catch { continue; }
    for (const k of kids) stack.push(path.join(p, k));
  }
  return { entries, bytes, capped };
}

function rel(p, cwd) {
  const r = path.relative(cwd, p);
  if (!r) return ".";
  return r.startsWith("..") ? p : `./${r}`;
}

export function blastRadius(command, { shell = "sh", cwd = process.cwd() } = {}) {
  const deletes = [];
  const writes = [];
  for (const seg of splitCommandLine(command)) {
    const { head, args } = segmentHead(seg);
    const toks = tokens(args);
    if (RM_HEADS.has(head)) {
      for (const t of toks.filter((x) => !x.startsWith("-"))) {
        deletes.push(resolveTarget(t, cwd));
      }
      continue;
    }
    if (head === "find" && /-(delete|exec(dir)?\s+rm\b)/.test(args)) {
      const base = toks.find((t) => !t.startsWith("-")) || ".";
      deletes.push(resolveTarget(base, cwd));
      continue;
    }
    const red = seg.match(/(?:^|\s)>>?\s*([^\s|;&]+)/);
    if (red) writes.push(resolveTarget(red[1], cwd));
    if (head === "tee") {
      const t = toks.find((x) => !x.startsWith("-"));
      if (t) writes.push(resolveTarget(t, cwd));
    } else if (WRITE_HEADS.has(head)) {
      const plain = toks.filter((x) => !x.startsWith("-"));
      const dest = head === "mv" || head === "cp" || head === "move" || head === "copy" || head === "ren" || head === "rename" || head === "move-item" || head === "copy-item"
        ? plain[plain.length - 1] : plain[0];
      if (dest) writes.push(resolveTarget(dest, cwd));
    }
    const outArg = args.match(/(?:^|\s)-{1,2}(?:o|output|out-file|output-document)[=\s]+(?!-)(\S+)/i);
    if (outArg && head !== "echo") writes.push(resolveTarget(outArg[1], cwd));
  }

  const deadline = Date.now() + 80;
  const out = [];
  for (const t of [...new Set(deletes.filter(Boolean))].slice(0, 3)) {
    const { entries, bytes, capped } = scan(t, deadline);
    out.push(entries
      ? `removes ${capped ? "4000+" : entries} item${entries === 1 ? "" : "s"} (${fmtSize(bytes)}) under ${rel(t, cwd)}`
      : `removes ${rel(t, cwd)} (missing or empty)`);
  }
  for (const t of [...new Set(writes.filter(Boolean))].slice(0, 3)) {
    let exists = false;
    try { exists = fs.existsSync(t); } catch {}
    out.push(`${exists ? "overwrites" : "creates"} ${rel(t, cwd)}`);
  }
  return out;
}
