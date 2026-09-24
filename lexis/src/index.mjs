#!/usr/bin/env node
import { runCommand, fixCommand } from "./commands/run.mjs";
import { setupCommand } from "./commands/setup.mjs";
import { configCommand } from "./commands/config.mjs";
import { doctorCommand } from "./commands/doctor.mjs";
import { hooksCommand } from "./commands/hooks.mjs";
import { uninstallCommand } from "./commands/uninstall.mjs";
import { modelCommand } from "./commands/model.mjs";
import { historyCommand } from "./commands/history.mjs";
import { explainCommand } from "./commands/explain.mjs";
import { webSearchCommand } from "./commands/web-search.mjs";
import { helpCommand } from "./commands/help.mjs";
import { updateCommand } from "./commands/update.mjs";
import { supervisorMain } from "./runtime/supervisor.mjs";

const commands = {
  run: (args) => runCommand(args),
  plan: (args) => runCommand(args, { dryRunOnly: true }),
  fix: () => fixCommand(),
  explain: explainCommand,
  setup: setupCommand,
  config: configCommand,
  doctor: doctorCommand,
  hooks: hooksCommand,
  uninstall: uninstallCommand,
  model: modelCommand,
  history: historyCommand,
  "web-search": webSearchCommand,
  update: updateCommand,
  help: helpCommand,
};

export async function main(argv = process.argv.slice(2)) {
    if (argv[0] === "__supervise") {
    await supervisorMain(argv.slice(1));
    return;
  }
  if (argv[0] === "--supervise") {
    await supervisorMain(argv.slice(1));
    return;
  }

  const [command, ...args] = argv;

  if (!command || command === "--help" || command === "-h") {
    await helpCommand();
    return;
  }
  if (command === "--version" || command === "-v" || command === "version") {
    const { createRequire } = await import("node:module");
    const pkg = createRequire(import.meta.url)("../package.json");
    process.stdout.write(`${pkg.version}\n`);
    return;
  }

  const handler = commands[command];
  if (handler) {
    await handler(args);
    return;
  }

    await runCommand(argv);
}

import { realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";
const invoked = process.argv[1] ? pathToFileURL(realpathSync(process.argv[1])).href : "";
if (invoked === import.meta.url) {
  main().catch((error) => {
    const message = error?.message || String(error);
    process.stderr.write(`lexis: ${message}\n`);
    process.exit(1);
  });
}
