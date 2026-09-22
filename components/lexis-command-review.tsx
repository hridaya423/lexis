"use client";

import { FIXTURES } from "@/components/lexis-fixtures";
import { runReview, usePromptState } from "@/components/lexis-prompt-state";
import styles from "@/app/lexis-lcd-sections.module.css";

export function LexisCommandReview() {
  const { pending, reviewRan } = usePromptState();
  const fixture = FIXTURES[pending];

  return (
    <section
      id="review"
      className={`${styles.sec} ${styles.review}`}
      aria-labelledby="review-title"
    >
      <p className={styles.kicker}>Before you run</p>
      <h2 id="review-title" tabIndex={-1} className={styles.h2}>
        <span className="sr-only">The last word is yours.</span>
        <span
          className={`${styles.hMask} ${styles.hReview}`}
          aria-hidden="true"
        />
      </h2>

      <p className={styles.revCmd}>
        <span aria-hidden="true">&gt; </span>
        <code className={styles.revCmdText}>
          {fixture.command}
          {!reviewRan && <span className={styles.revCursor} aria-hidden="true" />}
        </code>
      </p>

      <div className={styles.revRule} aria-hidden="true" />

      <div className={styles.revActions}>
        <p className={styles.revDecision}>Your terminal. Your decision.</p>
        <button
          type="button"
          className={styles.textButton}
          onClick={runReview}
          aria-label="Run example"
        >
          Run ↵
        </button>
      </div>

      {reviewRan && (
        <div className={styles.revOutput}>
          <p className={styles.revOutLabel}>Example output</p>
          <pre className={styles.revOut}>{fixture.output.join("\n")}</pre>
        </div>
      )}

      <p className="sr-only" role="status">
        {reviewRan ? "Example output shown. No commands ran on your computer." : ""}
      </p>
    </section>
  );
}
