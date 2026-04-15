"use client";

import { useState, useSyncExternalStore } from "react";

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

function getClientOs(): "mac" | "win" | "linux" {
  if (typeof navigator === "undefined") {
    return "mac";
  }

  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes("win")) {
    return "win";
  }
  if (userAgent.includes("linux")) {
    return "linux";
  }
  return "mac";
}

export function QuickInstall() {
  const os = useSyncExternalStore<"mac" | "win" | "linux">(noopSubscribe, getClientOs, () => "mac");
  const [copied, setCopied] = useState(false);
  const baseUrl = useSyncExternalStore(noopSubscribe, getClientOrigin, () => FALLBACK_ORIGIN);

  const commands = {
    mac: `curl -fsSL ${baseUrl}/install.sh | bash`,
    linux: `curl -fsSL ${baseUrl}/install.sh | bash`,
    win: `iwr ${baseUrl}/win.ps1 -useb | iex`,
  };

  const labels = {
    mac: "macOS",
    linux: "Linux",
    win: "Windows",
  };

  const handleCopy = () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }

    navigator.clipboard.writeText(commands[os]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--quiet)]">
          Install / {labels[os]}
        </p>
        <button
          onClick={handleCopy}
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[var(--text)]"
        >
          [{copied ? "COPIED" : "COPY"}]
        </button>
      </div>

      <div className="mt-4 border border-[var(--line)] bg-[rgb(16_16_16/70%)] px-4 py-4 md:px-5 md:py-5">
        <pre className="overflow-x-auto font-mono text-[13px] leading-relaxed text-[var(--text)] md:text-[14px]">
          {commands[os]}
        </pre>
      </div>
    </div>
  );
}
