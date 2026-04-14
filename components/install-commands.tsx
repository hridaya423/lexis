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
    <div className="w-full max-w-4xl flex flex-col border border-[#333333] text-left">
      {commands.map((item) => {
        const bordered = "border-b border-[#333333]";
        return (
          <article key={item.label} className={`${bordered} p-6 md:p-10 hover:bg-[#111111] transition-colors`}>
            <p className="font-mono text-[10px] text-[#666666] uppercase tracking-[0.2em] mb-4">{item.label}</p>
            <pre className="font-mono text-base md:text-xl text-white overflow-x-auto whitespace-nowrap break-normal">
              {item.command}
            </pre>
          </article>
        );
      })}

      <article className="p-6 md:p-10 hover:bg-[#111111] transition-colors">
        <p className="font-mono text-[10px] text-[#666666] uppercase tracking-[0.2em] mb-4">Session Controls</p>
        <div className="space-y-3 text-sm md:text-base text-[#CCCCCC]">
          <p>
            Uninstall Lexis: <code className="font-mono text-white">lx uninstall --yes</code>
          </p>
          <p>
            In a hooked shell you can also type <code className="font-mono text-white">uninstall</code>.
          </p>
          <p>
            Disable Lexis only for this terminal session: <code className="font-mono text-white">exit</code>
          </p>
        </div>
      </article>
    </div>
  );
}
