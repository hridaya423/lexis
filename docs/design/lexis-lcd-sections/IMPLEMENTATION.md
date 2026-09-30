# Implementation sequence: lower page only

Goal: replace old content beneath the already implemented hero with five approved LCD sections. Preserve the hero and its existing private demo/dialog state. Read HANDOFF.md and SECTIONS.md first.

This plan is unexecuted. The planning task made no application changes and did not run application lint/build or assert that the existing hero passes QA.

## 1. Capture current baseline

Read `app/page.tsx`, `app/lexis-lcd.module.css`, `components/lexis-lcd-hero.tsx`, `components/lexis-theme-toggle.tsx`, installation components, and installer route handlers. Read local Next guides under `node_modules/next/dist/docs/01-app/01-getting-started/` for server/client components, CSS and fonts.

Run `git status --short`. Existing dirty files belong to ongoing work. Save a screenshot of the actual implemented hero in light/dark at desktop and390px before edits. Capture the hero install dialog and preview briefly so regression checks have a baseline.

Do not execute `docs/plans/2026-09-19-lexis-lcd-implementation.md`; it is the old hero plan. Do not replace current app files with historical snippets.

## 2. Prepare a scoped lower-page shell

Recommended new files:

- `components/lexis-lcd-sections.tsx`: static section composition; server component by default.
- `components/lexis-example-selector.tsx`: local tab/demo state.
- `components/lexis-command-review.tsx`: fixed example simulation state.
- `components/lexis-install-console.tsx`: OS tabs/copy state.
- `app/lexis-lcd-sections.module.css`: section geometry and locally scoped material variants.
- `public/lexis-lcd/sections/`: only actual new vector assets.

These names are a suggested minimal split, not a requirement to fragment every section. No new UI framework or state store. Static process and closing sections can remain in the same module. The browser-only state has three concrete independent owners.

Keep new markup inside the existing `.page` wrapper so Departure Mono, palette and theme variables resolve. Reuse existing storage and html data attribute. Avoid importing hero CSS classes whose margins or container units assume hero geometry; share tokens rather than accidental layout dependencies.

Initially develop lower sections without touching the existing hero component. In `app/page.tsx`, replace the old lower max-width wrapper and footer with the new composition. Remove dead PIPELINE and old imports only after replacement. Preserve `main-content`, `workflow`, `install` and a studio compatibility anchor if linked elsewhere.

## 3. Match static composition before behavior

For each section, create exact headings/copy and primary geometry first. Use approved PNGs as reference; do not embed them as the implementation.

1. Process: dual screen rail, fixed arrow bridge, coral key, three aligned annotations.
2. Examples: open tab baseline, selected coral marker, pixel tree, taller live-text display.
3. Review: full-bleed dark band, inset right-offset plate, annotated command, action shelf.
4. Install: silver tabs joining plate, wrapped command display, Copy key, ordered instructions.
5. Closing/footer: large heading, dark CTA, enlarged coral key, one footer with theme/legal links.

Create necessary heading masks and pixel illustrations as described in ASSETS.md. Use the existing frame gradients as material references, not whole-image scaling hacks. Render at1586px and compare each section before refining interactions. Correct overly large cards, wrong headline breaks, thick hardware, and gutter drift first.

## 4. Implement example selection

Use a small immutable local example array with the exact requests/commands from SECTIONS.md. Keep selected ID and local preview state together. Avoid arbitrary text interpretation or artificial API delays.

Accessible tabs need roving tabindex, ArrowLeft/ArrowRight, Home/End, aria-selected, aria-controls and one associated tabpanel. Clicking/keyboard selection changes request, command and meaningful illustration. Clear stale simulation state when changing examples. Preserve a stable minimum panel height.

Coral key and Preview example activate the same local review UI. Name simulation honestly; no backend, shell or filesystem access. Use exact command strings for copy. Give file-tree illustration a short description and mark decorative paths hidden.

Focused check: select Count lines, verify `wc -l main.go`; then select Inspect folders, verify `du -sh .`; return to Find files, verify original tree and command. The hero's input/value must not change.

## 5. Implement the separate command-review preview

Keep section4 fixed to the reference's find command. One local boolean or small discriminated state handles initial/simulated. Run displays marked example output, reset restores annotated command. Edit request anchors/focuses section3. Do not build a cross-section event bus.

Focus and status must be understandable without motion. No global keyboard listener. Simulate action accessible name includes simulation, and a visible preview notice appears before activation.

Focused check: activate with keyboard, verify labeled example output and no network request; reset restores annotations and action label. Repeat without affecting the hero or example selector state.

## 6. Implement the installation console

Use the existing current-origin convention and the same installer endpoints. Inspect current helper logic before introducing a shared helper; do not refactor the existing hero merely to share two small strings. Duplication of a tiny stable formula is preferable to changing an implemented component outside scope.

Default Unix tab, explicit Windows tab. Copy receives one original command string, not rendered textContent. Await clipboard success. Feedback is local to the chosen tab, clears on tab change, and does not change key size. On failure preserve selectable command and show recovery copy.

The instructions link expands real installation details; it is not a dead href. Keep supporting text grounded in README/install scripts. Do not run installer scripts as tests.

Focused check: copy both OS commands; compare clipboard text to expected string with no newline. Simulate denied clipboard permission or an unavailable API and verify recovery. Existing hero installation dialog must still open and close normally.

## 7. Wire anchors and footer

Process Try an example → `#examples`.
Review Edit request → `#examples`.
Closing CTA and enlarged key → `#install`.
Footer GitHub → existing repository remote; Privacy/Terms → existing routes.

Use native links for navigation. Add scroll-margin if required by actual navigation behavior. No sticky header assumption; the current hero navigation is not a global floating bar. Smooth scrolling is optional and disabled with reduced motion.

Move LexisThemeToggle into the new footer without changing its persistence contract. Keep one footer and remove duplicate old legal/theme links.

## 8. Responsive and theme pass

Test content breakpoints from SECTIONS.md. Stack process stages, compact the tree and display, reflow annotations, stack install actions, wrap footer. Keep min16px command text and44px targets. Do not solve overflow with hidden clipping.

Light sections inherit current global theme. The review band deliberately stays dark in both. Scope overrides to the band so its pale text does not leak into the next section. Preserve one continuous matrix feel on adjacent light sections.

Check desktop1586, laptop1280, tablet768, mobile390 and320. At200% zoom, inspect tabs, command strings and footer. Honor reduced motion. Keep all interactions available without hover.

## 9. Verification and completion

Run `npm run lint` and `npm run build`. Report exact failures and distinguish pre-existing failures from new ones. Do not alter unrelated files solely to make a handoff claim cleaner.

Visual evidence should include five section captures at desktop, one continuous page view, mobile section layouts, dark page, active second tab, review simulated state, install copied/error feedback and hero before/after comparison. View the images yourself. Routine automated checks cannot establish visual fidelity.

Check DOM scroll width equals viewport width at compact sizes except intentionally local scrollers. Verify font/assets load and there are no new browser errors. Validate legal links and original hero behaviors.

Do a final code-deslop pass scoped to your changes. Add no implementation comments per repository instructions. Do not remove existing unrelated comments as an opportunistic cleanup. Remove dead old lower-section data/imports, but do not delete unused modules until searching for other consumers.

Completion report: identify implemented sections, tested behaviors, screenshot evidence, lint/build results and any material visual gaps. Do not claim to have rebuilt the hero. Do not commit, deploy or create a new task unless authorized by the user's next request/workflow.
