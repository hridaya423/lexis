# Lexis prompt implementation plan

Goal: faithfully implement the approved homepage described in `docs/design/lexis-prompt/SPEC.md`, using the prepared vector assets and preserving installation/backend behaviour.

This is a future implementation plan. No application work below is marked complete.

## 1. Establish the baseline

Read repository instructions, the required ponytail/code-deslop/design-engineering skills, and relevant local Next.js 16 documentation. Inspect git status before editing. Record existing unrelated changes and leave them untouched. Read the specification, references and asset inventory. Open the running page and capture its current state for comparison.

Acceptance: the implementer can identify the five intended sections, their reference images, the files that currently render them, and the unrelated work that must survive.

## 2. Establish the shared surface and assets

Copy the prepared SVG assets into a dedicated public directory. Reuse the existing Departure Mono loading. Introduce the specified colour, gutter and typography values through the existing CSS module structure. Remove homepage dependence on old material effects and neutralize unwanted dark theme overrides without breaking legal pages.

Render heading masks with semantic text and intrinsic aspect ratios. Verify the hero heading against the reference before polishing other sections. Do not introduce new packages.

Acceptance: correct pale substrate, ink, loaded body font, exact heading geometry and no aspect distortion at 1586/390px.

## 3. Build the hero and fixture boundary

Replace the metal rail with the flat prompt, input, rule, command and Review action. Keep installation links plain and underlined. Consolidate the small known-fixture set only where shared state requires it. Wire Enter/Review to the lower review section, with focus transfer and honest unsupported-input feedback.

Acceptance: the default visual matches the hero image; typing remains native; a known fixture reaches review; arbitrary text cannot cause execution or fabricated output.

## 4. Build examples and review

Implement flat accessible tabs and the directory illustration. Use the exact request/command pairs from the spec. Replace the review panel with its pale surface and simplified action row. Remove annotations and preview-copy clutter. Run reveals labelled fixture output; Edit returns to its source. Clear output on fixture changes.

Acceptance: tabs, request, command and illustration stay synchronized; keyboard navigation works; review shows the submitted command; no stale output remains; screenshot composition matches both references.

## 5. Build installation

Keep installer routes unchanged. Add OS detection with a manual override that detection cannot overwrite. Restyle tabs, command, rule, copy control and details disclosure. Preserve active-command clipboard bytes regardless of visual wrapping. Implement success/failure/reset feedback with timer cleanup.

Acceptance: simulate Mac/Linux/Windows/mobile/unknown platforms; check initial selection and label, manual changes, rerenders, copy success/failure and no hydration mismatch. The local origin remains legitimate in local command output.

## 6. Compose the page and selected footer

Remove the duplicate process and closing CTA from homepage composition. Implement the selected quiet footer with the natural wordmark asset, existing destinations and no physical key. Preserve a compact legal-page footer. Add the optional masked pointer highlight only after static desktop/mobile layouts pass.

Acceptance: the full page has one coherent green surface, distinct section purposes and no repeated CTA panel. Footer logo is uncompressed and fully visible. Privacy/terms still work.

## 7. Calibrate responsive layouts

Inspect 1586, 1280, 768 and 390px captures, plus 320/1920px boundaries and 200% zoom. Adjust layout and spacing to the spec. Check the actual font-loaded page, not skeleton states. Fix overflow at the component instead of hiding it on body. Check reduced motion and keyboard focus.

Acceptance: images and text retain proportions, commands remain readable, all controls remain reachable, and the full-page rhythm is coherent. Save evidence with viewport sizes and state labels.

## 8. Verify and hand off

Use the repository's existing test setup. Add only meaningful behaviour coverage for fixture transitions and OS/manual-selection logic if a suitable test harness exists; do not install a framework just to assert static CSS. Run relevant lint/build checks and separate pre-existing failures from new ones with evidence. Inspect the final diff for unrelated edits, dead material imports, duplicated state and unnecessary abstractions.

Finish with inspected screenshots, checks actually run, remaining limitations and deliberate visual adaptations. Do not claim that a build pass proves design fidelity. Keep the final change reviewable; do not deploy or modify backend behaviour as part of this task.
