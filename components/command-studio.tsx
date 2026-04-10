"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type Phase = "idle" | "loading" | "ready" | "error";

type Result = {
  command: string;
  explanation: string;
  risk: "low" | "moderate";
};

const EXAMPLES = [
  {
    pattern: /(list|show).*(python|\.py)/i,
    result: {
      command: 'find . -name "*.py"',
      explanation: "Recursively lists Python files in the current directory.",
      risk: "low",
    },
  },
  {
    pattern: /(kill).*(port\s*3000|3000)/i,
    result: {
      command: "lsof -t -i:3000 | xargs kill",
      explanation: "Finds processes bound to port 3000 and sends terminate signals.",
      risk: "moderate",
    },
  },
  {
    pattern: /(count).*(lines).*(main\.go|file)/i,
    result: {
      command: "wc -l main.go",
      explanation: "Returns the line count for main.go.",
      risk: "low",
    },
  },
  {
    pattern: /(git).*(commit).*(message|msg|with)/i,
    result: {
      command: 'git commit -m "fix bug"',
      explanation: "Creates a commit with a direct message.",
      risk: "low",
    },
  },
] as const;

const BLOCKED = /(rm\s+-rf|mkfs|dd\s+if=|shutdown|reboot|:\(\)\{|chmod\s+777\s+-R)/i;

const QUICK = [
  "list all python files",
  "kill port 3000",
  "count lines in main.go",
];

function resolve(input: string): Result | null {
  for (const item of EXAMPLES) {
    if (item.pattern.test(input)) {
      return item.result;
    }
  }
  return null;
}

export function CommandStudio() {
  const [prompt, setPrompt] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  function applyPrompt(value: string) {
    setPrompt(value);
    setPhase("idle");
    setError("");
    setResult(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = prompt.trim();

    if (!input) {
      setPhase("idle");
      setError("");
      setResult(null);
      return;
    }

    if (BLOCKED.test(input)) {
      setPhase("error");
      setError("Destructive request blocked. Shift to read-only mode.");
      setResult(null);
      return;
    }

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }

    setPhase("loading");
    setError("");
    setResult(null);

    timerRef.current = window.setTimeout(() => {
      const match = resolve(input);

      if (!match) {
        setPhase("error");
        setError("Invalid match. Add path, filename, or port target.");
        return;
      }

      setResult(match);
      setPhase("ready");
    }, 600);
  }

  const disabled = prompt.trim().length < 3 || phase === "loading";

  return (
    <div className="w-full flex flex-col border-t border-[#333333] lg:border-t-0 pt-12 lg:pt-0">
      <form onSubmit={handleSubmit} className="flex flex-col gap-8 pb-12 border-b border-[#333333]">
        <label htmlFor="prompt" className="flex flex-col gap-6">
          <span className="font-mono text-[10px] text-[#666666] uppercase tracking-[0.2em]">Input Intent</span>
          <div className="flex items-center gap-4 md:gap-6">
            <span className="text-4xl md:text-6xl text-[#666666] font-light">→</span>
            <input
              id="prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="e.g. kill port 3000"
              autoComplete="off"
              className="w-full bg-transparent text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white placeholder:text-[#222222] focus:outline-none tracking-tighter rounded-none"
            />
          </div>
        </label>

        <div className="flex flex-wrap gap-2 mt-4">
          {QUICK.map((item) => (
            <button 
              key={item} 
              type="button" 
              onClick={() => applyPrompt(item)}
              className="border border-[#333333] px-4 py-2 text-[10px] uppercase font-mono tracking-[0.1em] text-[#888888] hover:text-black hover:bg-white hover:border-white transition-colors"
            >
              {item}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={disabled}
          className="mt-8 h-20 w-full bg-white text-black font-mono text-[14px] md:text-[16px] uppercase tracking-[0.2em] font-bold px-8 md:px-12 transition-all disabled:opacity-20 disabled:cursor-not-allowed hover:bg-[#CCCCCC] active:bg-[#999999] flex items-center justify-between group"
        >
          <span>{phase === "loading" ? "Compiling..." : "Execute Compilation"}</span>
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

        {phase === "error" && (
           <div className="flex flex-col h-full">
            <p className="font-mono text-[10px] text-[#FF3333] uppercase tracking-[0.2em] mb-4">Output / Error</p>
            <p className="font-mono text-2xl md:text-4xl text-[#FF3333] tracking-tight uppercase break-words">{error}</p>
          </div>
        )}

        {phase === "ready" && result && (
          <div className="flex flex-col h-full animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <p className="font-mono text-[10px] text-[#00FF00] uppercase tracking-[0.2em]">Output / Success</p>
              <p className={`font-mono text-[10px] uppercase tracking-widest border px-3 py-1 ${result.risk === 'moderate' ? 'text-[#FF3333] border-[#FF3333]' : 'text-[#00FF00] border-[#00FF00]'}`}>
                {result.risk === "moderate" ? "Review Req." : "Low Risk"}
              </p>
            </div>
            
            <div className="mb-12 overflow-x-auto">
              <pre className="font-mono text-2xl sm:text-3xl md:text-5xl text-[#00FF00] tracking-tight leading-tight whitespace-pre-wrap break-all">
                <span className="text-[#333333] select-none mr-4">$</span>{result.command}
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
