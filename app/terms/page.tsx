import Link from "next/link";

export const metadata = {
  title: "Lexis — Terms",
};

const TERMS_SECTIONS = [
  {
    heading: "No Guarantees",
    body: "Lexis is provided as-is, without warranty of any kind. You assume responsibility for reviewing generated commands before execution.",
  },
  {
    heading: "User Responsibility",
    body: "By executing generated scripts, you accept responsibility for potential data loss, system compromise, unintended deletions, and production impact. Never run a command you do not fully understand.",
  },
  {
    heading: "Commercial and Infrastructure Use",
    body: "Lexis is built for supervised developer workflows. Do not run it in unmonitored production pipelines, CI/CD deployments, or privileged infrastructure without explicit policy controls and manual approval gates.",
  },
];

export default function TermsPage() {
  return (
    <main id="main-content" className="w-full flex-1 px-6 py-20 md:px-10 md:py-24 xl:px-14">
      <div className="mx-auto w-full max-w-[1040px] border-y border-[var(--line)] py-8 md:py-10">
        <header className="border-b border-[var(--line)] pb-8 md:pb-10">
          <Link href="/" className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[var(--text)]">
            Lexis / Home
          </Link>
          <h1 className="mt-7 text-5xl uppercase tracking-[-0.04em] md:text-7xl">Terms</h1>
          <p className="mt-5 max-w-[38ch] text-lg leading-relaxed text-[var(--muted)] md:text-xl">
            Use with review and intent. Command execution always stays in your control.
          </p>
        </header>

        <div className="mt-8 divide-y divide-[var(--line)]">
          {TERMS_SECTIONS.map((section, index) => (
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
