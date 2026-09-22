"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from "react";
import styles from "@/app/lexis-lcd-sections.module.css";

const FALLBACK_ORIGIN = "https://lexis.hridya.tech";
const GITHUB_URL = "https://github.com/hridaya423/lexis";

type OsTab = "unix" | "win";

function noopSubscribe() {
  return () => {};
}

function getClientOrigin() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return FALLBACK_ORIGIN;
}

type ClientDetection = OsTab | "unknown";

let detectedCache: ClientDetection | undefined;

function getClientOs(): ClientDetection {
  if (detectedCache !== undefined) return detectedCache;
  const ua = navigator.userAgent || "";
  const mobile =
    /Mobi|Android|iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (mobile) {
    detectedCache = "unknown";
    return detectedCache;
  }
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } })
      .userAgentData?.platform || navigator.platform || "";
  const s = `${platform} ${ua}`;
  if (/Windows|Win64|Win32/i.test(s)) {
    detectedCache = "win";
  } else if (/Mac OS X|macOS|MacIntel|Macintosh|Linux|X11|CrOS/i.test(s)) {
    detectedCache = "unix";
  } else {
    detectedCache = "unknown";
  }
  return detectedCache;
}

export function LexisInstallConsole() {
  const baseUrl = useSyncExternalStore(
    noopSubscribe,
    getClientOrigin,
    () => FALLBACK_ORIGIN,
  );

  const detected = useSyncExternalStore(
    noopSubscribe,
    getClientOs,
    () => null,
  );

  const [manual, setManual] = useState<OsTab | null>(null);
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const [status, setStatus] = useState("");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const os =
    manual ?? (detected !== null && detected !== "unknown" ? detected : "unix");

  const commands = {
    unix: `curl -fsSL ${baseUrl}/install.sh | bash`,
    win: `iwr ${baseUrl}/win.ps1 -useb | iex`,
  } as const;

  const isLocal =
    /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:|\/|$)/.test(
      baseUrl,
    );

  function selectOs(next: OsTab, moveFocus = false) {
    setManual(next);
    window.clearTimeout(timer.current);
    setCopied(false);
    setFailed(false);
    if (moveFocus) {
      document.getElementById(`os-tab-${next}`)?.focus();
    }
  }

  function onTabsKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    let next: OsTab | null = null;
    if (event.key === "ArrowRight" || event.key === "End") next = "win";
    if (event.key === "ArrowLeft" || event.key === "Home") next = "unix";
    if (next) {
      event.preventDefault();
      selectOs(next, true);
    }
  }

  async function copy() {
    window.clearTimeout(timer.current);
    if (!navigator.clipboard?.writeText) {
      setCopied(false);
      setFailed(true);
      setStatus("Select and copy the command.");
      return;
    }
    try {
      await navigator.clipboard.writeText(commands[os]);
      setCopied(true);
      setFailed(false);
      setStatus("Install command copied.");
      timer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      setFailed(true);
      setStatus("Select and copy the command.");
    }
  }

  return (
    <section
      id="install"
      className={`${styles.sec} ${styles.install}`}
      aria-labelledby="install-title"
    >
      <div className={styles.instGrid}>
        <div className={styles.instLeft}>
          <h2
            id="install-title"
            tabIndex={-1}
            className={`${styles.h2} ${styles.hInstall}`}
          >
            <span className="sr-only">Make it your terminal.</span>
            <span
              className={`${styles.hMask} ${styles.hInstallMask}`}
              aria-hidden="true"
            />
          </h2>
        </div>

        <div className={styles.instRight}>
          <div
            className={styles.osTabs}
            role="tablist"
            aria-label="Operating system"
            onKeyDown={onTabsKeyDown}
          >
            <button
              type="button"
              role="tab"
              id="os-tab-unix"
              className={styles.osTab}
              aria-selected={os === "unix"}
              aria-controls="os-panel"
              tabIndex={os === "unix" ? 0 : -1}
              onClick={() => selectOs("unix")}
            >
              macOS / Linux
            </button>
            <button
              type="button"
              role="tab"
              id="os-tab-win"
              className={styles.osTab}
              aria-selected={os === "win"}
              aria-controls="os-panel"
              tabIndex={os === "win" ? 0 : -1}
              onClick={() => selectOs("win")}
            >
              Windows
            </button>
          </div>

          <div
            id="os-panel"
            role="tabpanel"
            aria-labelledby={`os-tab-${os}`}
          >
            <p className={styles.instCmd}>
              <span aria-hidden="true">&gt; </span>
              <code key={os} className={styles.instCmdText}>
                {commands[os]}
                <span className={styles.revCursor} aria-hidden="true" />
              </code>
            </p>

            <div className={styles.instRule} aria-hidden="true" />

            <div className={styles.instCopyRow}>
              {failed ? (
                <p className={styles.copyFail}>
                  Select and copy the command.
                </p>
              ) : (
                <span aria-hidden="true" />
              )}
              <button
                type="button"
                className={styles.copyButton}
                onClick={copy}
                aria-label={copied ? "Copied" : "Copy install command"}
              >
                {copied ? (
                  <svg
                    className={`${styles.copyIcon} ${styles.copySuccess}`}
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 10.5l4 4 8-9"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="square"
                    />
                  </svg>
                ) : (
                  <svg
                    className={styles.copyIcon}
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <rect
                      x="6.5"
                      y="6.5"
                      width="10"
                      height="10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M13.5 6.5v-3h-10v10h3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                )}
              </button>
            </div>

            <details className={styles.instMore}>
              <summary>Installation details</summary>
              <div className={styles.instDetails}>
                {isLocal && (
                  <p>
                    Development preview: this command uses the local server.
                  </p>
                )}
                <h3>macOS / Linux</h3>
                <p>
                  Run <code>curl -fsSL {baseUrl}/install.sh | bash</code> in
                  your terminal. The installer sets up a local inference
                  runtime, writes config, and installs shell hooks. Runtime is
                  chosen automatically: MLX on Apple Silicon, llama.cpp on
                  Intel and CPU-only Linux, vLLM on Linux with NVIDIA.
                </p>
                <h3>Windows</h3>
                <p>
                  In PowerShell run{" "}
                  <code>iwr {baseUrl}/win.ps1 -useb | iex</code>. The Windows
                  installer uses llama.cpp.
                </p>
                <p>
                  During setup Lexis asks how you want to use it:{" "}
                  <code>auto</code> routes natural-language commands straight
                  in the terminal; <code>lx</code> only runs when you call{" "}
                  <code>lx ...</code> explicitly. You do not need npm to use
                  Lexis after installation.
                </p>
                <p>
                  Full guide in the{" "}
                  <a href={GITHUB_URL}>repository README ↗</a>. Installer
                  endpoints: <a href="/install.sh">/install.sh</a> and{" "}
                  <a href="/win.ps1">/win.ps1</a>.
                </p>
              </div>
            </details>
          </div>
        </div>
      </div>
      <p className="sr-only" role="status">
        {status}
      </p>
    </section>
  );
}
