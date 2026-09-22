import Link from "next/link";
import lcd from "@/app/lexis-lcd.module.css";
import styles from "@/app/lexis-legal.module.css";
import { LexisLegalFooter } from "@/components/lexis-lcd-sections";

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
    <div className={lcd.page}>
      <main id="main-content" className={styles.content}>
        <nav className={styles.nav} aria-label="Primary">
          <Link href="/" className={styles.mark}>lexis</Link>
          <Link href="/" className={styles.back}>← Back to Lexis</Link>
        </nav>
        <header className={styles.header}>
          <h1>Terms</h1>
          <p>Use with review and intent. Command execution always stays in your control.</p>
        </header>
        {TERMS_SECTIONS.map((section, index) => (
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
