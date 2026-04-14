import { CommandStudio } from "@/components/command-studio";
import { InstallCommands } from "@/components/install-commands";
import { QuickInstall } from "@/components/quick-install";

const PIPELINE = [
  {
    step: "01",
    title: "Say It Naturally",
    copy: "Describe what you want done in plain language.",
  },
  {
    step: "02",
    title: "Plan By OS",
    copy: "Lexis maps intent to commands for your current platform.",
  },
  {
    step: "03",
    title: "Review Risk",
    copy: "Sensitive actions trigger confirmations and critical checks.",
  },
  {
    step: "04",
    title: "Run",
    copy: "Execute in your terminal with clear output and control.",
  },
];

export default function Home() {
  return (
    <>
      <main id="main-content" className="w-full flex-1 pt-6 px-6 md:px-12 xl:px-16 mx-auto">
        
        <header className="grid grid-cols-12 gap-6 border-b border-white pb-6 mb-12 lg:mb-24 items-end">
          <div className="col-span-6 md:col-span-4">
            <h1 className="font-mono text-[10px] sm:text-xs tracking-[0.2em] uppercase text-white">Lexis</h1>
          </div>
          <nav className="col-span-6 md:col-span-8 flex justify-end gap-6 md:gap-16 font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em]">
            <a href="#studio" className="hover:opacity-40 transition-opacity">Studio</a>
            <a href="#workflow" className="hover:opacity-40 transition-opacity hidden sm:inline">Workflow</a>
            <a href="#install" className="hover:opacity-40 transition-opacity">Install</a>
          </nav>
        </header>

        <section className="pb-16 lg:pb-32 border-b border-white mb-16 lg:mb-32" aria-labelledby="hero-title">
          <h2 
            id="hero-title" 
            className="text-[12vw] leading-[0.85] tracking-[-0.05em] uppercase font-medium break-words text-white"
          >
            Talk To<br />
            <span className="text-[#666666]">Your Terminal.</span>
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 mt-16 lg:mt-32 items-start">
            <div className="lg:col-span-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#666666] pt-2">
              / 01 — Mission
            </div>
            <div className="lg:col-span-5 text-[26px] md:text-[32px] leading-[1.2] font-medium tracking-tight max-w-[440px]">
              Ask in plain language. Lexis plans and executes terminal commands with OS-aware behavior and confirmation for risky actions.
            </div>
            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <QuickInstall />
            </div>
          </div>
        </section>

        <section id="studio" className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start pb-16 lg:pb-32 border-b border-white mb-16 lg:mb-32">
          <div className="lg:col-span-4 sticky top-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#666666] mb-8">/ 02 — Studio</p>
            <h2 className="text-5xl md:text-6xl tracking-tighter leading-[0.9] uppercase font-medium mb-8">
              Terminal<br />Dialogue
            </h2>
            <p className="text-lg md:text-xl text-[#A3A3A3] leading-[1.4] tracking-tight max-w-[25ch]">
              See how natural-language requests move from intent to command planning and safe execution.
            </p>
          </div>
          
          <div className="lg:col-span-8 w-full relative">
            <CommandStudio />
          </div>
        </section>

        <section id="workflow" className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 lg:pb-32 border-b border-white mb-16 lg:mb-32">
          <div className="lg:col-span-4 sticky top-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#666666] mb-8">/ 03 — System</p>
            <h2 className="text-5xl md:text-6xl tracking-tighter leading-[0.9] uppercase font-medium">
              Eliminate<br />Guesswork
            </h2>
          </div>

          <div className="lg:col-span-8 flex flex-col border-t border-[#333333] lg:border-t-0 pt-12 lg:pt-0">
            {PIPELINE.map((item) => (
              <article key={item.step} className="grid grid-cols-[60px_1fr] sm:grid-cols-[100px_1fr] md:grid-cols-[140px_1fr] gap-6 md:gap-12 py-10 border-b border-[#333333] hover:bg-[#111111] transition-colors -mx-6 px-6 md:mx-0 md:px-4 group">
                <p className="font-mono text-2xl md:text-4xl text-[#444444] group-hover:text-white transition-colors">{item.step}</p>
                <div>
                  <h3 className="text-3xl md:text-5xl uppercase tracking-tighter font-medium mb-4 md:mb-6">{item.title}</h3>
                  <p className="text-[#A3A3A3] leading-[1.4] max-w-[40ch] text-lg md:text-2xl tracking-tight">{item.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="install" className="flex flex-col items-center pb-16 lg:pb-32 mb-16 lg:mb-32 border-b border-white text-center">
          <div className="mb-12 lg:mb-16">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#666666] mb-8">/ 04 — Deploy</p>
            <h2 className="text-5xl md:text-6xl tracking-tighter leading-[0.9] uppercase font-medium">
              One Command<br />To Start
            </h2>
          </div>

          <InstallCommands />
        </section>
      </main>

      <footer className="px-6 md:px-12 xl:px-16 pb-12 w-full mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <p className="font-mono text-[10px] text-[#666666] uppercase tracking-[0.2em]">
            Natural Language Shell Command Interface.
          </p>
          <div className="flex items-center gap-8 font-mono text-[10px] uppercase tracking-[0.2em]">
            <a href="/privacy" className="text-[#666666] hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="text-[#666666] hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </>
  );
}
