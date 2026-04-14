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
    <div className="w-full flex flex-col border-t border-[#333333] lg:border-t-0 pt-12 lg:pt-0">
      <form onSubmit={handleSubmit} className="flex flex-col gap-8 pb-12 border-b border-[#333333]">
        <div className="flex flex-col gap-6">
          <span className="font-mono text-[10px] text-[#666666] uppercase tracking-[0.2em]">Choose Intent</span>
          <div className="flex items-center gap-4 md:gap-6">
            <span className="text-4xl md:text-6xl text-[#666666] font-light">→</span>
            <p className="w-full text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-tighter">{selected.label}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {PRESETS.map((item) => {
            const active = item.id === selectedId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => applyPreset(item.id)}
                className={`border px-4 py-2 text-[10px] uppercase font-mono tracking-[0.1em] transition-colors ${
                  active
                    ? "border-white bg-white text-black"
                    : "border-[#333333] text-[#888888] hover:text-black hover:bg-white hover:border-white"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <button
          type="submit"
          className="mt-8 h-20 w-full bg-white text-black font-mono text-[14px] md:text-[16px] uppercase tracking-[0.2em] font-bold px-8 md:px-12 transition-all hover:bg-[#CCCCCC] active:bg-[#999999] flex items-center justify-between group"
        >
          <span>{phase === "loading" ? "Compiling..." : "Press Enter"}</span>
          <span className="text-2xl group-hover:translate-x-2 transition-transform">↵</span>
        </button>
      </form>

      <div className="pt-12 min-h-[300px]" aria-live="polite">
        {phase === "idle" && (
          <div className="flex flex-col h-full opacity-50">
            <p className="font-mono text-[10px] text-[#666666] uppercase tracking-[0.2em] mb-4">Output / Standby</p>
            <p className="font-mono text-xl md:text-2xl text-[#666666] tracking-tight">_</p>
          </div>
        )}

        {phase === "loading" && (
          <div className="flex flex-col h-full">
            <p className="font-mono text-[10px] text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
              Output / Generating <span className="w-2 h-4 bg-white cursor-blink inline-block" />
            </p>
            <div className="space-y-4 w-full">
              <div className="h-12 bg-[#111111] w-[60%]" />
              <div className="h-12 bg-[#111111] w-[90%]" />
            </div>
          </div>
        )}

        {phase === "ready" && result && (
          <div className="flex flex-col h-full animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <p className="font-mono text-[10px] text-[#00FF00] uppercase tracking-[0.2em]">Output / Success</p>
              <p
                className={`font-mono text-[10px] uppercase tracking-widest border px-3 py-1 ${
                  result.risk === "moderate" ? "text-[#FF3333] border-[#FF3333]" : "text-[#00FF00] border-[#00FF00]"
                }`}
              >
                {result.risk === "moderate" ? "Review Req." : "Low Risk"}
              </p>
            </div>

            <div className="mb-12 overflow-x-auto">
              <pre className="font-mono text-2xl sm:text-3xl md:text-5xl text-[#00FF00] tracking-tight leading-tight whitespace-pre-wrap break-all">
                <span className="text-[#333333] select-none mr-4">$</span>
                {result.command}
              </pre>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-t border-[#333333] pt-8">
              <div className="md:col-span-8">
                <p className="font-mono text-[10px] text-[#666666] uppercase tracking-[0.2em] mb-3">Explanation</p>
                <p className="text-xl md:text-2xl text-[#CCCCCC] leading-snug tracking-tight max-w-[45ch]">{result.explanation}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
