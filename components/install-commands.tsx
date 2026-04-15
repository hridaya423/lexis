"use client";

import { useMemo, useSyncExternalStore } from "react";

const FALLBACK_ORIGIN = "https://lexis.hridya.tech";

function noopSubscribe() {
  return () => {};
}

function getClientOrigin() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return FALLBACK_ORIGIN;
}

type InstallCommand = {
  label: string;
  command: string;
};

export function InstallCommands() {
  const baseUrl = useSyncExternalStore(noopSubscribe, getClientOrigin, () => FALLBACK_ORIGIN);

  const commands = useMemo<InstallCommand[]>(
    () => [
      {
        label: "macOS / Linux",
        command: `curl -fsSL ${baseUrl}/install.sh | bash`,
      },
      {
        label: "Windows (PowerShell)",
        command: `iwr ${baseUrl}/win.ps1 -useb | iex`,
      },
    ],
    [baseUrl]
  );

  return (
    <div className="w-full text-left border-t border-[var(--line)]">
      {commands.map((item) => {
        return (
          <article
            key={item.label}
            className="grid grid-cols-1 gap-4 border-b border-[var(--line)] py-6 md:grid-cols-[220px_1fr] md:gap-8 md:py-7"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--quiet)]">{item.label}</p>
            <pre className="overflow-x-auto font-mono text-sm leading-relaxed text-[var(--text)] md:text-base">
              {item.command}
            </pre>
          </article>
        );
      })}

      <article className="grid grid-cols-1 gap-4 py-6 md:grid-cols-[220px_1fr] md:gap-8 md:py-7">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--quiet)]">Session Controls</p>
        <ul className="space-y-3 text-sm leading-relaxed text-[var(--muted)] md:text-base">
          <li>
            Uninstall Lexis: <code className="font-mono text-[var(--text)]">lx uninstall --yes</code>
          </li>
          <li>
            In a hooked shell, you can also type <code className="font-mono text-[var(--text)]">uninstall</code>.
          </li>
          <li>
            Disable Lexis only for this terminal session: <code className="font-mono text-[var(--text)]">exit</code>
          </li>
        </ul>
      </article>
    </div>
  );
}
