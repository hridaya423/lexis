import Link from "next/link";
import { SectionAnchor } from "@/components/lexis-section-anchor";
import { InkFloodBand } from "@/components/ink-flood/InkFloodBand";
import styles from "@/app/lexis-lcd-sections.module.css";

const GITHUB_URL = "https://github.com/hridaya423/lexis";

export function LexisFooter() {
  return (
    <footer className={styles.foot}>
      <div className={styles.sec}>
        <div className={styles.footTop}>
          <div>
            <p className={styles.footPrompt}>
              &gt; your move
              <span className={styles.footCursor} aria-hidden="true" />
            </p>
            <SectionAnchor
              href="#install"
              focus="#install-title"
              className={`${styles.underlined} ${styles.footInstall}`}
            >
              Install Lexis ↗
            </SectionAnchor>
          </div>
          <nav className={styles.footNav} aria-label="Footer">
            <a href={GITHUB_URL} className={styles.underlined}>
              GitHub ↗
            </a>
            <Link href="/privacy" className={styles.underlined}>
              Privacy
            </Link>
            <Link href="/terms" className={styles.underlined}>
              Terms
            </Link>
          </nav>
        </div>
      </div>
      <div className={styles.footBand}>
        <InkFloodBand />
      </div>
    </footer>
  );
}

export function LexisLegalFooter() {
  return (
    <footer className={styles.sec}>
      <div className={styles.legalFoot}>
        <nav className={styles.legalNav} aria-label="Footer">
          <Link href="/">lexis</Link>
          <a href={GITHUB_URL}>GitHub ↗</a>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
