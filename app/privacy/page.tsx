import Link from "next/link";
import lcd from "@/app/lexis-lcd.module.css";
import styles from "@/app/lexis-legal.module.css";
import { LexisLegalFooter } from "@/components/lexis-lcd-sections";

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
    <div className={lcd.page}>
      <main id="main-content" className={styles.content}>
        <nav className={styles.nav} aria-label="Primary">
          <Link href="/" className={styles.mark}>lexis</Link>
          <Link href="/" className={styles.back}>← Back to Lexis</Link>
        </nav>
        <header className={styles.header}>
          <h1>Privacy</h1>
          <p>Local-first behavior with clear boundaries around external retrieval.</p>
        </header>
        {PRIVACY_SECTIONS.map((section, index) => (
          <section key={section.heading} className={styles.section}>
            <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
            <div><h2>{section.heading}</h2><p>{section.body}</p></div>
          </section>
        ))}
      </main>
      <LexisLegalFooter />
    </div>
  );
}
