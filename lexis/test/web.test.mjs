import test from "node:test";
import assert from "node:assert/strict";
import { shouldSearchWeb, parseLiteHtml } from "../src/web-context.mjs";

test("shouldSearchWeb: install/update verbs trigger", () => {
  for (const p of ["install jq", "set up docker", "update homebrew", "uninstall redis", "download ffmpeg", "get terraform"]) {
    assert.equal(shouldSearchWeb(p, { commands: [] }), true, p);
  }
});

test("shouldSearchWeb: greetings and plain lookups don't trigger", () => {
  for (const p of ["hi", "list files", "show disk usage", "what's on port 3000"]) {
    assert.equal(shouldSearchWeb(p, { commands: [{ command: "ls" }] }), false, p);
  }
});

test("shouldSearchWeb: missing head binary triggers", () => {
  assert.equal(shouldSearchWeb("run it", { commands: [{ command: "definitely-not-a-bin-xyz123 --flag" }] }), true);
  assert.equal(shouldSearchWeb("run it", { commands: [{ command: "ls -la" }] }), false);
});

test("parseLiteHtml extracts links and snippets from lite markup", () => {
  const html = `
    <table><tr><td>
      <a rel="nofollow" class='result-link' href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fbrew.sh%2F&rut=x">Homebrew</a>
    </td></tr>
    <tr><td class='result-snippet'>The Missing Package Manager for macOS</td></tr>
    <tr><td>
      <a rel="nofollow" class='result-link' href="https://formulae.brew.sh/formula/jq">jq formula</a>
    </td></tr></table>`;
  const results = parseLiteHtml(html, 5);
  assert.equal(results.length, 2);
  assert.equal(results[0].title, "Homebrew");
  assert.equal(results[0].url, "https://brew.sh/");
  assert.equal(results[0].content, "The Missing Package Manager for macOS");
  assert.equal(results[1].url, "https://formulae.brew.sh/formula/jq");
  assert.equal(parseLiteHtml("<html>no results</html>", 5).length, 0);
});
