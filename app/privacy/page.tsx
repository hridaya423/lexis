import Link from "next/link";

export const metadata = {
  title: "Lexis — Privacy",
};

const PRIVACY_SECTIONS = [
  {
    heading: "Local Execution",
    body: "Lexis runs locally for planning and command execution. Installer defaults may enable local MCP web lookup mode, which sends search queries to public search engines only when retrieval is needed. You can disable web retrieval at any time with lexis config disable-web.",
  },
  {
    heading: "Third-Party Providers",
    body: "External providers, including non-local MCP servers, hosted search APIs, or remote LLMs, may receive prompt fragments and queries under their own privacy policies. For maximum isolation, keep web retrieval disabled and use local model servers such as MLX, vLLM, or llama.cpp.",
  },
  {
    heading: "Telemetry",
    body: "This website runs without analytics, ad trackers, or crash telemetry. Product debugging relies on direct user reports and GitHub issues.",
  },
];

export default function PrivacyPage() {
  return (
    <main id="main-content" className="w-full flex-1 px-6 py-20 md:px-10 md:py-24 xl:px-14">
      <div className="mx-auto w-full max-w-[1040px] border-y border-[var(--line)] py-8 md:py-10">
        <header className="border-b border-[var(--line)] pb-8 md:pb-10">
          <Link href="/" className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[var(--text)]">
            Lexis / Home
          </Link>
          <h1 className="mt-7 text-5xl uppercase tracking-[-0.04em] md:text-7xl">Privacy</h1>
          <p className="mt-5 max-w-[38ch] text-lg leading-relaxed text-[var(--muted)] md:text-xl">
            Local-first behavior with clear boundaries around external retrieval.
          </p>
        </header>

        <div className="mt-8 divide-y divide-[var(--line)]">
          {PRIVACY_SECTIONS.map((section, index) => (
            <section key={section.heading} className="grid grid-cols-1 gap-5 py-7 md:grid-cols-[110px_1fr] md:gap-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--quiet)]">{String(index + 1).padStart(2, "0")}</p>
              <div>
                <h2 className="text-2xl tracking-[-0.03em] md:text-3xl">{section.heading}</h2>
                <p className="mt-4 text-base leading-relaxed text-[var(--muted)] md:text-lg">{section.body}</p>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
