"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { SectionAnchor } from "@/components/lexis-section-anchor";
import { FIXTURES, matchHeroRequest } from "@/components/lexis-fixtures";
import {
  setHeroInput,
  submitFixture,
  usePromptState,
} from "@/components/lexis-prompt-state";
import styles from "@/app/lexis-lcd.module.css";

const GITHUB_URL = "https://github.com/hridaya423/lexis";

function CommandLine({ text }: { text: string }) {
  const segments = text.split("|");
  return (
    <>
      {segments.map((segment, i) => (
        <span key={i}>
          {segment}
          {i < segments.length - 1 && <span className={styles.pipe}>|</span>}
          {i < segments.length - 1 && <wbr />}
        </span>
      ))}
    </>
  );
}

export function LexisLcdHero() {
  const { heroInput } = usePromptState();
  const [note, setNote] = useState(false);
  const [status, setStatus] = useState("");

  const match = matchHeroRequest(heroInput);
  const command = match ? FIXTURES[match].command : null;

  function handleChange(next: string) {
    setHeroInput(next);
    setNote(false);
  }

  function review(event?: FormEvent) {
    event?.preventDefault();
    if (match) {
      submitFixture(match);
      setStatus("Moved to the review section. Nothing ran on your computer.");
      document.getElementById("review")?.scrollIntoView();
      document
        .getElementById("review-title")
        ?.focus({ preventScroll: true });
      return;
    }
    setNote(true);
    setStatus("Unknown request. Try one of the examples below.");
  }

  return (
    <div className={styles.hero}>
      <header className={styles.header}>
        <Link href="/" className={styles.wordmark} aria-label="lexis home" />
        <nav className={styles.nav} aria-label="Primary">
          <a className={styles.navLink} href={GITHUB_URL}>
            GitHub ↗
          </a>
          <SectionAnchor
            href="#install"
            focus="#install-title"
            className={styles.navButton}
          >
            Install Lexis ↗
          </SectionAnchor>
        </nav>
      </header>

      <section aria-labelledby="lcd-title">
        <h1 id="lcd-title" className={styles.headline}>
          <span className="sr-only">In your own words.</span>
          <span className={styles.headlinePixels} aria-hidden="true" />
        </h1>

        <form className={styles.promptRow} onSubmit={review}>
          <span className={styles.promptGt} aria-hidden="true">
            &gt;
          </span>
          <span className={styles.inputWrap}>
            <label htmlFor="lcd-task" className="sr-only">
              Describe a terminal task
            </label>
            <input
              id="lcd-task"
              name="task"
              className={styles.input}
              value={heroInput}
              onChange={(event) => handleChange(event.target.value)}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              enterKeyHint="done"
            />
            <span className={styles.sizer} aria-hidden="true">
              {heroInput}
              <span className={styles.idleCursor} />
            </span>
          </span>
        </form>

        <div className={styles.heroRule} aria-hidden="true" />

        <div className={styles.cmdRow}>
          {command ? (
            <p className={styles.command}>
              <CommandLine text={command} />
            </p>
          ) : note ? (
            <p className={styles.heroNote}>
              Try one of the{" "}
              <SectionAnchor href="#examples" focus='#examples [aria-selected="true"]'>
                examples
              </SectionAnchor>{" "}
              below.
            </p>
          ) : (
            <p className={styles.command} aria-hidden="true" />
          )}
        </div>

        <p className={styles.heroInstall}>
          <SectionAnchor href="#install" focus="#install-title">
            Install Lexis ↗
          </SectionAnchor>
        </p>
      </section>

      <p className="sr-only" role="status">
        {status}
      </p>
    </div>
  );
}
