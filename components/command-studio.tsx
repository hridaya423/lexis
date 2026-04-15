"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";

type Phase = "idle" | "loading" | "ready";

type Result = {
  command: string;
  explanation: string;
  risk: "low" | "moderate";
};

const PRESETS = [
  {
    id: "python-files",
    label: "list all python files",
    result: {
      command: 'find . -name "*.py"',
      explanation: "Recursively lists Python files in the current directory.",
      risk: "low",
    },
  },
  {
    id: "kill-3000",
    label: "kill port 3000",
    result: {
      command: "lsof -t -i:3000 | xargs kill",
      explanation: "Finds processes on port 3000 and sends terminate signals.",
      risk: "moderate",
    },
  },
  {
    id: "count-main-go",
    label: "count lines in main.go",
    result: {
      command: "wc -l main.go",
      explanation: "Returns the line count for main.go.",
      risk: "low",
    },
  },
] as const;

export function CommandStudio() {
  const [selectedId, setSelectedId] = useState<(typeof PRESETS)[number]["id"]>(PRESETS[0].id);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<Result | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    },
    []
  );

  const selected = useMemo(() => PRESETS.find((item) => item.id === selectedId) || PRESETS[0], [selectedId]);

  function applyPreset(id: (typeof PRESETS)[number]["id"]) {
    setSelectedId(id);
    setPhase("idle");
    setResult(null);
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    triggerCompile();
  }

  const triggerCompile = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }

    setPhase("loading");
    setResult(null);

    timerRef.current = window.setTimeout(() => {
      setResult(selected.result);
      setPhase("ready");
    }, 500);
  }, [selected]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter") {
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.repeat || event.isComposing) {
        return;
      }

      const active = document.activeElement as HTMLElement | null;
      if (active) {
        const tag = active.tagName;
        const isEditable =
          tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || active.isContentEditable;
        if (isEditable) {
          return;
        }
      }

      event.preventDefault();
      triggerCompile();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [triggerCompile]);

  return (
    <div className="w-full pt-2">
      <form onSubmit={handleSubmit} className="border-b border-[var(--line)] pb-9">
        <div className="flex flex-col gap-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--quiet)]">Choose Intent</span>
          <div className="flex items-center gap-4 md:gap-5">
            <span className="text-3xl font-light text-[var(--quiet)] md:text-5xl">→</span>
            <p className="w-full text-2xl tracking-[-0.03em] text-[var(--text)] sm:text-4xl md:text-5xl lg:text-6xl">
              {selected.label}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 md:gap-x-8">
          {PRESETS.map((item) => {
            const active = item.id === selectedId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => applyPreset(item.id)}
                className={`border-b pb-1 font-mono text-[10px] uppercase tracking-[0.14em] ${
                  active
                    ? "border-[var(--text)] text-[var(--text)]"
                    : "border-transparent text-[var(--quiet)] hover:border-[var(--quiet)] hover:text-[var(--muted)]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <button
          type="submit"
          className="mt-10 inline-flex h-14 items-center justify-between border border-[var(--line-strong)] px-6 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text)] hover:border-[var(--text)] active:translate-y-[1px] md:h-16 md:px-8"
        >
          <span>{phase === "loading" ? "Compiling command" : "Compile command"}</span>
          <span className="text-xl md:text-2xl">↵</span>
        </button>
      </form>

      <div className="min-h-[280px] pt-9 md:min-h-[320px]" aria-live="polite">
        {phase === "idle" && (
          <div className="flex h-full flex-col opacity-70">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--quiet)]">Output / Standby</p>
            <p className="font-mono text-xl tracking-tight text-[var(--quiet)] md:text-2xl">_</p>
          </div>
        )}

        {phase === "loading" && (
          <div className="flex h-full flex-col">
            <p className="mb-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
              Output / Generating <span className="cursor-blink inline-block h-4 w-2 bg-[var(--muted)]" />
            </p>
            <div className="space-y-4 w-full">
              <div className="h-11 w-[62%] bg-[var(--bg-elevated)]" />
              <div className="h-11 w-[88%] bg-[var(--bg-elevated)]" />
            </div>
          </div>
        )}

        {phase === "ready" && result && (
          <div className="flex h-full flex-col">
            <div className="mb-7 flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Output / Ready</p>
              <p
                className={`border px-3 py-1 font-mono text-[10px] uppercase tracking-widest ${
                  result.risk === "moderate"
                    ? "border-[var(--line-strong)] text-[var(--muted)]"
                    : "border-[var(--line)] text-[var(--quiet)]"
                }`}
              >
                {result.risk === "moderate" ? "Review Required" : "Low Risk"}
              </p>
            </div>

            <div className="mb-10 overflow-x-auto border-b border-[var(--line)] pb-6">
              <pre className="whitespace-pre-wrap break-all font-mono text-2xl leading-tight tracking-tight text-[var(--text)] sm:text-3xl md:text-4xl">
                <span className="mr-4 select-none text-[var(--quiet)]">$</span>
                {result.command}
              </pre>
            </div>

            <div className="grid grid-cols-1 gap-6 pt-1 md:grid-cols-12">
              <div className="md:col-span-8">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--quiet)]">Explanation</p>
                <p className="max-w-[45ch] text-lg leading-snug tracking-tight text-[var(--muted)] md:text-xl">
                  {result.explanation}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
