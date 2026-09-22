import Link from "next/link";
import { SmearBand } from "@/components/smear/SmearBand";
import { LexisLegalFooter } from "@/components/lexis-lcd-sections";
import styles from "./lexis-lcd.module.css";
import s from "./not-found.module.css";

const GITHUB_URL = "https://github.com/hridaya423/lexis";

export default function NotFound() {
  return (
    <div className={styles.page}>
      <main id="main-content" className={styles.hero}>
        <header className={styles.header}>
          <Link href="/" className={styles.wordmark} aria-label="lexis home" />
          <nav className={styles.nav} aria-label="Main">
            <a href={GITHUB_URL} className={styles.navLink}>
              GitHub ↗
            </a>
          </nav>
        </header>

        <p className={`${styles.command} ${s.cmd}`}>
          <span aria-hidden="true">&gt; </span>open this page
        </p>
        <p className={`${styles.heroNote} ${s.err}`}>
          404: route not found. nothing lives at this address.
        </p>

        <div className={s.band}>
          <SmearBand />
        </div>

        <p className={`${styles.heroInstall} ${s.back}`}>
          <Link href="/">cd ~</Link>
        </p>
      </main>
      <LexisLegalFooter />
    </div>
  );
}
