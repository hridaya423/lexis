import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

let tmpHome;
let installHooks, uninstallHooks, rcFilesForShell, MARKERS;

test.before(async () => {
  tmpHome = await fs.mkdtemp(path.join(os.tmpdir(), "lexis-hooks-"));
  process.env.HOME = tmpHome;
  process.env.USERPROFILE = tmpHome;
  process.env.XDG_CONFIG_HOME = path.join(tmpHome, ".config");
  process.env.XDG_DATA_HOME = path.join(tmpHome, ".local", "share");
  const mod = await import("../src/shell/install.mjs?ts=" + Date.now());
  installHooks = mod.installHooks;
  uninstallHooks = mod.uninstallHooks;
  rcFilesForShell = mod.rcFilesForShell;
  MARKERS = mod.MARKERS;
});

for (const shell of ["bash", "zsh", "fish"]) {
  test(`${shell}: install -> idempotent -> uninstall restores file`, async () => {
    const rc = rcFilesForShell(shell)[0];
    await fs.mkdir(path.dirname(rc), { recursive: true });
    await fs.writeFile(rc, "# my existing config\nexport FOO=bar\n", "utf8");

    const r1 = await installHooks({ mode: "auto", shells: [shell] });
    assert.ok(r1.results.every((r) => r.changed !== undefined));
    const afterInstall = await fs.readFile(rc, "utf8");
    assert.ok(afterInstall.includes(MARKERS.start));
    assert.ok(afterInstall.includes("export FOO=bar"));

    await installHooks({ mode: "auto", shells: [shell] });
    const afterReinstall = await fs.readFile(rc, "utf8");
    assert.equal(afterReinstall, afterInstall, "reinstall must be idempotent");

    await uninstallHooks({ shells: [shell] });
    const afterRemove = await fs.readFile(rc, "utf8");
    assert.equal(afterRemove.trim(), "# my existing config\nexport FOO=bar", "original content restored");
    assert.ok(!afterRemove.includes("lexis"));
  });
}

test("snippets contain lx off/on and no exit override", async () => {
  for (const shell of ["bash", "zsh", "fish", "powershell"]) {
    const { readSnippet } = await import("../src/shell/install.mjs");
    const snippet = await readSnippet(shell, "auto");
    assert.match(snippet, /off|LEXIS_DISABLED/, `${shell} needs lx off`);
    assert.doesNotMatch(snippet, /^function exit|^exit\(\)/m, `${shell} must not override exit`);
    assert.match(snippet, /LEXIS_SHELL/, `${shell} must set LEXIS_SHELL`);
  }
});

test("lx mode snippets have no command-not-found handler", async () => {
  const { readSnippet } = await import("../src/shell/install.mjs");
  for (const shell of ["bash", "zsh", "fish", "powershell"]) {
    const snippet = await readSnippet(shell, "lx");
    assert.doesNotMatch(snippet, /command_not_found|LexisHandleEnter|accept-line/, `${shell} lx-mode must not auto-route`);
  }
});

test("auto snippets pass through command-shaped input and skip non-TTY", async () => {
  const { readSnippet } = await import("../src/shell/install.mjs");
  for (const shell of ["bash", "zsh", "fish"]) {
    const snippet = await readSnippet(shell, "auto");
    assert.match(snippet, /__lexis_command_shaped/, `${shell} needs command-shaped passthrough`);
    assert.match(snippet, /-t 0|isatty stdin/, `${shell} must no-op without a real TTY`);
  }
  const zsh = await readSnippet("zsh", "auto");
  assert.match(zsh, /zle -N accept-line __lexis_accept_line/, "zsh needs the Enter widget for unparseable English");
});

test("zsh __lexis_command_shaped flags commands, not English", async (t) => {
  const { execFileSync } = await import("node:child_process");
  const { readFileSync } = await import("node:fs");
  const { fileURLToPath } = await import("node:url");
  const snippet = fileURLToPath(new URL("../src/shell/snippets/zsh.zsh", import.meta.url));
  const src = readFileSync(snippet, "utf8");
  const fn = src.match(/^__lexis_command_shaped\(\) \{[\s\S]*?^\}/m)[0];
  const run = (line) => execFileSync("zsh", ["-fc",
    `${fn}\n__lexis_command_shaped \${(z)1}`, "t", line],
    { stdio: ["ignore", "pipe", "pipe"] });
  try { run("x"); } catch (e) { if (e.code === "ENOENT") return t.skip("zsh not available"); }
  const cases = [
    ["gh --version", 0],
    ["./build.sh -x", 0],
    ["docker ps -a", 0],
    ["FOO=1 bar", 0],
    ["show disk usage", 1],
    ["install jq", 1],
    ["what is using port 3000", 1],
  ];
  for (const [line, want] of cases) {
    let got;
    try { run(line); got = 0; } catch (e) { got = e.status; }
    assert.equal(got, want, `'${line}'`);
  }
});
