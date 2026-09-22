"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { COUNT_LINES, FIXTURES, type FixtureId } from "@/components/lexis-fixtures";
import { selectExample, usePromptState } from "@/components/lexis-prompt-state";
import styles from "@/app/lexis-lcd-sections.module.css";

const TABS: { id: FixtureId; label: string }[] = [
  { id: "find", label: "Find files" },
  { id: "count", label: "Count lines" },
  { id: "size", label: "Inspect folders" },
];

function FileIcon() {
  return <span className={styles.fileIcon} aria-hidden="true" />;
}

function FolderIcon() {
  return <span className={styles.treeIcon} aria-hidden="true" />;
}

function TreeItem({
  name,
  selected,
  marker,
  file = true,
}: {
  name: string;
  selected?: boolean;
  marker?: boolean;
  file?: boolean;
}) {
  return (
    <li className={`${styles.treeItem} ${selected ? styles.treeSel : ""}`}>
      {marker && <span className={styles.treeMarker} aria-hidden="true" />}
      {file && <FileIcon />}
      <span className={styles.treeName}>{name}</span>
    </li>
  );
}

function Tree({ fixture }: { fixture: FixtureId }) {
  if (fixture === "find") {
    return (
      <div className={styles.tree} aria-hidden="true">
        <p className={styles.treeRoot}>
          <FolderIcon />
          src/
        </p>
        <ul className={styles.treeList}>
          <TreeItem name="app.py" selected marker />
          <TreeItem name="utils.py" selected />
          <TreeItem name="notes.txt" />
          <TreeItem name="styles.css" />
        </ul>
      </div>
    );
  }
  if (fixture === "count") {
    return (
      <div className={styles.sourcePreview}>
        <p className={styles.sourceHeader}><FileIcon /> main.go <span>sample file</span></p>
        <pre className={styles.sourceCode} aria-label="Sample main.go source">{COUNT_LINES.map((line, index) => (
          <span className={styles.sourceLine} key={index}>
            <span className={styles.lineNumber} aria-hidden="true">{index + 1}</span>
            <code>{line || " "}</code>
          </span>
        ))}</pre>
        <p className={styles.sourceCount}><strong>{COUNT_LINES.length} lines</strong><span>Blank lines count too.</span></p>
      </div>
    );
  }
  return (
    <div className={styles.tree} aria-hidden="true">
      <p className={styles.treeRoot}>
        <FolderIcon />
        ./
      </p>
      <ul className={styles.treeList}>
        <TreeItem name="src/" selected marker file={false} />
        <TreeItem name="docs/" file={false} />
        <TreeItem name="photos/" file={false} />
      </ul>
      <p className={styles.treeMeta}>1.2G total</p>
    </div>
  );
}

export function LexisExampleSelector() {
  const { selectedExample } = usePromptState();
  const [exploring, setExploring] = useState(false);
  const [pinned, setPinned] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const keyboardSelection = useRef(false);
  const reduceMotion = useReducedMotion();

  const activeIndex = Math.max(
    0,
    TABS.findIndex((tab) => tab.id === selectedExample),
  );
  const fixture = FIXTURES[TABS[activeIndex].id];

  function onTabsKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    let next = -1;
    if (event.key === "ArrowRight") next = (activeIndex + 1) % TABS.length;
    if (event.key === "ArrowLeft")
      next = (activeIndex - 1 + TABS.length) % TABS.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = TABS.length - 1;
    if (next >= 0) {
      event.preventDefault();
      keyboardSelection.current = true;
      setExploring(false);
      setPinned(false);
      selectExample(TABS[next].id);
      tabRefs.current[next]?.focus();
    }
  }

  return (
    <section
      id="examples"
      className={`${styles.sec} ${styles.examples}`}
      aria-labelledby="examples-title"
    >
      <h2 id="examples-title" className={styles.h2}>
        <span className="sr-only">What needs doing?</span>
        <span
          className={`${styles.hMask} ${styles.hExamples}`}
          aria-hidden="true"
        />
      </h2>

      <div className={styles.exTabsScroll}>
        <div
          className={styles.exTabs}
          role="tablist"
          aria-label="Examples"
          onKeyDown={onTabsKeyDown}
        >
          {TABS.map((tab, i) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`ex-tab-${tab.id}`}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              className={styles.exTab}
              aria-selected={i === activeIndex}
              aria-controls="ex-panel"
              tabIndex={i === activeIndex ? 0 : -1}
              onClick={(event) => {
                keyboardSelection.current = event.detail === 0;
                setExploring(false);
                setPinned(false);
                selectExample(tab.id);
              }}
            >
              {tab.label}
              {i === activeIndex && (
                <motion.span
                  layoutId="example-tab-marker"
                  className={styles.exMarker}
                  aria-hidden="true"
                  transition={
                    reduceMotion || keyboardSelection.current
                      ? { duration: 0 }
                      : { type: "spring", duration: 0.5, bounce: 0.2 }
                  }
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div
        id="ex-panel"
        role="tabpanel"
        aria-labelledby={`ex-tab-${fixture.id}`}
        className={styles.exBody}
        data-exploring={exploring || pinned}
        data-fixture={fixture.id}
      >
        <div key={`request-${fixture.id}`} className={styles.exLeft}>
          <p className={styles.exReq}>
            <span aria-hidden="true">&gt; </span>
            {fixture.id === "find" ? "find my " : fixture.id === "count" ? "count lines in " : "show "}
            <button
              type="button"
              className={styles.requestWord}
              aria-pressed={pinned}
              aria-label={fixture.id === "find" ? "Highlight Python files" : fixture.id === "count" ? "Inspect lines in main.go" : "Inspect this folder"}
              onPointerEnter={(event) => { if (event.pointerType === "mouse") setExploring(true); }}
              onPointerLeave={() => setExploring(false)}
              onFocus={(event) => setExploring(event.currentTarget.matches(":focus-visible"))}
              onBlur={() => setExploring(false)}
              onClick={() => setPinned(!pinned)}
            >
              {fixture.id === "find" ? "Python" : fixture.id === "count" ? "main.go" : "this folder"}
            </button>
            {fixture.id === "find" ? " files" : fixture.id === "size" ? "’s size" : ""}
          </p>
          <code className={styles.exCmd}>{fixture.command}</code>
        </div>
        <Tree key={`tree-${fixture.id}`} fixture={fixture.id} />
      </div>
    </section>
  );
}
