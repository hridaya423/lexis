import * as appleFm from "./apple-fm.mjs";
import * as llamaServer from "./llama-server.mjs";
import * as ollama from "./ollama.mjs";
import * as openaiCompat from "./openai-compat.mjs";

export const PROVIDERS = {
  "apple-fm": appleFm,
  "llama-server": llamaServer,
  ollama,
  "openai-compat": openaiCompat,
};

export const PROVIDER_IDS = Object.keys(PROVIDERS);

export async function resolveProvider(config, machine) {
  const requested = String(config?.provider?.active || "auto").toLowerCase();

  if (requested !== "auto") {
    const impl = PROVIDERS[requested];
    if (!impl) {
      throw new Error(`Unknown provider '${requested}'. Choices: ${["auto", ...PROVIDER_IDS].join(", ")}`);
    }
    return { id: requested, impl, auto: false };
  }

  const llama = await llamaServer.availability(machine, config).catch(() => ({ ok: false }));
  if (llama.ok) {
    return { id: "llama-server", impl: llamaServer, auto: true };
  }

  const apple = await appleFm.availability(machine, config).catch(() => ({ ok: false }));
  if (apple.ok) {
    return { id: "apple-fm", impl: appleFm, auto: true };
  }

  const ol = await ollama.availability(machine, config).catch(() => ({ ok: false }));
  if (ol.ok) {
    return { id: "ollama", impl: ollama, auto: true };
  }

  return { id: "llama-server", impl: llamaServer, auto: true };
}

export async function describeProviders(config, machine) {
  const rows = [];
  for (const id of PROVIDER_IDS) {
    const impl = PROVIDERS[id];
    const avail = await impl.availability(machine, config).catch((e) => ({ ok: false, reason: "error", detail: e.message }));
    rows.push({ id, ...avail, capabilities: impl.capabilities });
  }
  return rows;
}
