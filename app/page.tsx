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
      <main id="main-content" className="w-full flex-1 px-6 md:px-10 xl:px-14">
        <div className="mx-auto w-full max-w-[1380px]">
          <header className="flex items-end justify-between gap-6 border-b border-[var(--line-strong)] py-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--text)]">Lexis</p>
            <nav className="flex items-center gap-6 sm:gap-12 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
              <a href="#studio" className="hover:text-[var(--text)]">Studio</a>
              <a href="#workflow" className="hidden sm:inline hover:text-[var(--text)]">Workflow</a>
              <a href="#install" className="hover:text-[var(--text)]">Install</a>
            </nav>
          </header>

          <section
            className="border-b border-[var(--line)] py-14 md:py-20"
            aria-labelledby="hero-title"
          >
            <div className="mx-auto flex w-full max-w-[980px] flex-col items-center text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--quiet)]">/ 01 - Positioning</p>
              <h1
                id="hero-title"
                className="mt-6 max-w-[11ch] text-balance text-[14vw] leading-[0.88] tracking-[-0.045em] uppercase font-medium text-[var(--text)] md:text-[9.4vw] lg:text-[6.6vw]"
              >
                Talk To Your Terminal.
              </h1>
              <p className="mt-8 max-w-[36ch] text-xl leading-[1.35] tracking-[-0.02em] text-[var(--muted)] md:text-2xl">
                Describe what you need in plain language. Lexis translates the request into platform-aware shell
                commands with risk checks before execution.
              </p>

              <div className="mt-12 w-full max-w-[760px] text-left">
                <QuickInstall />
              </div>
            </div>
          </section>

          <section
            id="studio"
            className="grid grid-cols-1 gap-12 border-b border-[var(--line)] py-16 md:py-24 lg:grid-cols-12 lg:gap-10"
          >
            <div className="lg:col-span-4 lg:sticky lg:top-12 lg:self-start">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--quiet)]">/ 02 - Studio</p>
              <h2 className="mt-7 max-w-[8ch] text-5xl leading-[0.9] tracking-[-0.04em] uppercase font-medium md:text-6xl">
                Command Preview
              </h2>
              <p className="mt-7 max-w-[28ch] text-lg leading-[1.45] text-[var(--muted)] md:text-xl">
                Inspect intent selection, command generation, and risk labeling in a single restrained workspace.
              </p>
            </div>
            <div className="lg:col-span-8">
              <CommandStudio />
            </div>
          </section>

          <section
            id="workflow"
            className="grid grid-cols-1 gap-12 border-b border-[var(--line)] py-16 md:py-24 lg:grid-cols-12 lg:gap-10"
          >
            <div className="lg:col-span-4 lg:sticky lg:top-12 lg:self-start">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--quiet)]">/ 03 - Workflow</p>
              <h2 className="mt-7 max-w-[8ch] text-5xl leading-[0.9] tracking-[-0.04em] uppercase font-medium md:text-6xl">
                Four Clear Steps
              </h2>
            </div>

            <div className="lg:col-span-8 border-t border-[var(--line)]">
              {PIPELINE.map((item) => (
                <article
                  key={item.step}
                  className="grid grid-cols-[58px_1fr] gap-5 border-b border-[var(--line)] py-8 sm:grid-cols-[88px_1fr] md:grid-cols-[120px_1fr] md:gap-10 md:py-10 hover:bg-[var(--bg-elevated)]"
                >
                  <p className="font-mono text-xl tracking-tight text-[var(--quiet)] md:text-3xl">{item.step}</p>
                  <div>
                    <h3 className="text-3xl tracking-[-0.04em] uppercase font-medium md:text-5xl">{item.title}</h3>
                    <p className="mt-4 max-w-[40ch] text-lg leading-[1.4] text-[var(--muted)] md:mt-5 md:text-xl">
                      {item.copy}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section
            id="install"
            className="grid grid-cols-1 gap-12 border-b border-[var(--line)] py-16 md:py-24 lg:grid-cols-12 lg:gap-10"
          >
            <div className="lg:col-span-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--quiet)]">/ 04 - Install</p>
              <h2 className="mt-7 max-w-[8ch] text-5xl leading-[0.9] tracking-[-0.04em] uppercase font-medium md:text-6xl">
                Start In One Command
              </h2>
            </div>
            <div className="lg:col-span-8">
              <InstallCommands />
            </div>
          </section>
        </div>
      </main>

      <footer className="w-full px-6 pb-12 md:px-10 xl:px-14">
        <div className="mx-auto flex w-full max-w-[1380px] flex-col gap-6 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--quiet)]">
            Natural language shell command interface.
          </p>
          <div className="flex items-center gap-8 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
            <a href="/privacy" className="hover:text-[var(--text)]">
              Privacy
            </a>
            <a href="/terms" className="hover:text-[var(--text)]">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
