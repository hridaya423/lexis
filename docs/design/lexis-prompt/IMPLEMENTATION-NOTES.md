# Implementation notes

Implemented the pale-green prompt design from `SPEC.md`, superseding the LCD/metal direction. Checked 19 September 2026 against the five references at 1586/1280/768/390/320 plus 1920 and 200%-zoom-equivalent widths. Evidence in `qa/`.

## Effects pass (later)

- **"Try your own request ↗" removed** from the examples section — it scrolled to the hero input but could never work as advertised (it can't execute typed text). The fixture tabs are the honest version of the same idea.
- **Footer wordmark is now Ink Flood** (`components/ink-flood/`): the static `footer-wordmark.svg` mask was replaced by a full-bleed canvas band driven by a scene-table engine (`scene.ts` types, `ease.ts` easings/table sampler, `halftone.ts` print-grain tile, `generate.ts` pen-tip + flood-table builders). `lexis-scene.ts` rasterizes "lexis" in Departure Mono (EM 280, faux-bold 0.05em stroke — light enough that the 'e' counter and mouth survive cell quantization), quantizes the alpha into a 6px cell grid, assigns cells to glyphs by advance-boundary bisection, then snake-orders each glyph's cells — column-major boustrophedon on pass one, row-major on pass two — into a pen spine with `r=0` lifts between strokes. Rendering stamps **discrete rounded-square tiles** (`roundRect`, one batched path) exactly at lattice positions — no interpolation between samples, each cell grows in over ~1.5 frames — so the word materializes like a display refreshing, not a pen dragging. `GAP` 0.18 keeps every tile visibly separate; radius jitter is ±1% (LCD pixels are uniform). The scene is defined in word-space (`size: {w,h}`) and `engine.toScene` fits it to the **measured footer text column** (`.footTop`'s rect, read per resize) so the wordmark's edges align flush with the footer copy above — the word is the footer's own typography, not a floating widget. Each half (72 frames @ 25fps): write → rest → two coral sparks pop at the word's diagonal corners and diverge → the word zooms ~5× while cell radius swells ~3× (quadratic drift table) until ink floods the whole band → the band sits as a solid field that is exactly the next half's background, so **the loop is seamless and the palette inverts every pass** (ink-on-paper, then paper-on-ink). A low-alpha halftone `overlay` screen gives print grain. Band height cropped to `1344/500` and `margin-top` to `40u` so the wordmark sits directly under the footer text. Pauses offscreen/hidden; reduced motion renders the word at rest; fonts.ready rebuilds both scenes if the family resolved late. `components/wild-type/` (the prior warp-mesh wordmark) was deleted — this replaces it.
- **404 redesigned in the flat prompt style** (`app/not-found.tsx` + `not-found.module.css`): same `.page`/`.hero`/`.header`/`.wordmark` shell as the homepage, a `> open this page` transcript with the error output line, the smear band as the visual, a `cd ~` link home, and `LexisLegalFooter`.
- **Smear band** (`components/smear/`): WebGL `FadeMotion` engine. The word "404" is rasterized to an offscreen mask texture in Departure Mono, then drawn as literally hundreds of overlapping blended copies offset along a downward trail with quadratic spacing and per-copy alpha decay — the fade into the paper. Pointer tilts/stretches the trail (fine pointers only); `enableHero(2)` grows the trail in on first view; pauses offscreen/hidden; reduced motion renders the rest state; a static `404` fallback shows if WebGL is unavailable. Palette is the page's paper/ink, pushed to the host via `onBg`.

## Refinement pass 2 (20 September)

- **Sampled SVG headings restored — properly this time.** The supplied extractions are 1px rasters of a pixel font rendered at fractional scale, so cell edges stair-step and the grid drifts sub-pixel amounts (no global lattice fits). `perfect-assets.py` now: splits the mask at empty row/column lines into cell blobs → splits fused blobs at lowest-ink lines near pitch boundaries → **snaps cell centres to a per-letterform-cluster lattice** at the measured per-heading pitch (union-find clusters, least-squares phase fit, collided points deduped) → emits uniform 0.86-ratio squares. Result: identical cells, uniform gaps, letterforms exactly as supplied. Per-heading pitches measured from blob geometry (hero 9.5×10, examples 6×6, review 9.4×8.8, install 7.1×7.5). Headings render as `currentColor` masks with sr-only real text.
- **Genuinely risky review fixture.** `clean` is now "start my repo fresh" → `rm -rf .git && git init` — wipes the repo's entire history/branches/remotes and reinitializes. `reset --hard + clean -fdx` only loses uncommitted work; this is irreversible. Fixture-only; nothing executes.
- **"Edit request" removed** from review; `source`/`editRequest` plumbing dropped from `lexis-prompt-state.ts`, and example-tab selection no longer overwrites the pending review fixture (decoupled — the destructive command is the section's point).
- **Install copy cut.** "Paste into your terminal." / "Follow setup." removed; "Installation details +" disclosure stays underlined with the + inside the label.
- **"Make it your terminal." centred** — mask at `min(340px, 86%)` with `margin-inline: auto` inside the 420px column.
- Re-verified: lint clean, build passes, no overflow at 1586/390/320, Enter-submit and Run exercised live. Evidence: `qa/r3-*.png`, `qa/pf-*.png`, `qa/hz-*.png`.

## Refinement pass (20 September)

Feedback-driven polish, all verified live:

- **Pixel type = real text.** Cell-mask headings (supplied extractions and a resampled variant) both read as noise next to the pixel font. All headings are now plain Departure Mono text — the same pixel-perfect treatment as every other string on the page, and natively accessible (no sr-only mirror). `heading-*.svg` deleted from `public/`; `perfect-assets.py` remains in `docs/` for regenerating masks if ever needed. *(Superseded by refinement pass 2: masks restored after lattice snapping made them pixel-perfect.)*
- **Navbar/footer wordmark parity.** `wordmark-mark.svg` aggregates the wordmark cell grid into 4×4 supercells so the pixel texture survives at ~112px — the header mark now reads as the same treatment as the footer's fine grid.
- **Pixel tree icons.** `icon-folder.svg`/`icon-file.svg` (cell-grid assets from the prior set) replace the stroked-path icons in the examples tree, rendered as masks.
- **Tab slider.** Active example tab carries a coral square centered under its label, straddling the rule (`::after`, `left:50%`, `bottom:-0.35em`). `.exTabsScroll` wrapper reserves room inside the mobile scroll clip; `width: max-content` on the inner row keeps the rule under scrolled content.
- **Riskier fixture.** `clean` became "start my repo fresh" → `git reset --hard && git clean -fdx`. *(Superseded in pass 2 → `rm -rf .git && git init`.)*
- **Hero stripped.** Review button removed (Enter still submits), tagline removed, "Install Lexis ↗" underlined. Fixed a `nowrap` bug that clipped pipe-free commands at 320px.
- **Install reshaped.** OS tabs moved above the command inside the right column (tablist is a sibling of the tabpanel, not inside it); heading shrunk to 62px max, command to 28px max, left column narrowed to 420px. No detection label. Copy is icon-only (`aria-label` "Copy install command" → "Copied"). "Installation details" is an inline-block summary so the +/− flows inside the underlined label.
- **Footer.** Tagline removed; the wordmark carries the whitespace itself.
- Re-verified: lint clean, build passes, no overflow at 1586/390/320, Enter-submit/scroll/focus exercised live. Evidence: `qa/r2-*.png`.

## What changed

- `app/lexis-lcd.module.css` — rewritten: flat tokens (`#c3dfa0`/`#182510`/`#41582d`/`#ff735b`, ink-24% rules), 6px substrate tile, header, hero prompt. Legacy `--muted`/`--line`/`--line-strong` aliases kept for the legal pages.
- `app/lexis-lcd-sections.module.css` — rewritten: examples, review, install, footer, compact legal footer.
- `components/lexis-fixtures.ts` (new) — five typed fixtures: `clean` (`rm -rf .git && git init`, the destructive default), `largest`, `find`, `count`, `size`, plus the `list all python files` alias → `find`.
- `components/lexis-prompt-state.ts` (new) — `useSyncExternalStore` module holding pending fixture, hero input, selected example, review-ran. Neutral server snapshot.
- `components/lexis-lcd-hero.tsx` — flat `>` + native input + decorative idle block cursor located by a hidden sizer span (hidden on focus, native caret takes over). Enter submits: known fixture → transfers to review section, scrolls, focuses heading; unknown input → "Try one of the examples below." with `examples` linked; input preserved.
- `components/lexis-example-selector.tsx` — real tablist (roving tabindex, arrows/Home/End), coral square straddling the rule under the active tab. Two-column request/command + pixel-icon tree; stacks under 899px; tabs scroll under 600px via the `.exTabsScroll` wrapper.
- `components/lexis-command-review.tsx` — kicker, heading, `> command_`, rule, "Your terminal. Your decision." + Run ↵ (aria-label "Run example"). Run reveals labelled fixture output once.
- `components/lexis-install-console.tsx` — two-column flat layout; `userAgentData.platform` → `platform`/UA detection picks the default tab silently (no label), mobile-first, manual override never overwritten (explicit `manual` state, detection via memoized client snapshot). Copy is an icon-only button that takes the exact active command; check icon for 2s on success, timer cleared on unmount/selection change; failure shows "Select and copy the command." Installer copy and command formats unchanged.
- `components/lexis-lcd-sections.tsx` — reduced to `LexisFooter` (quiet `> your move_` sign-off + natural-proportion wordmark) and `LexisLegalFooter` (compact row for legal pages).
- `app/page.tsx` — hero → examples → review → install → footer; process and closing sections removed.
- `app/layout.tsx` — removed the `lexis-theme` bootstrap script; no dark rules exist on the marketing page, so a saved preference cannot darken it.
- Deleted `app/lexis-material.module.css` and `components/lexis-theme-toggle.tsx` (no remaining consumers).
- Assets copied to `public/lexis-prompt/`.

## Verified live

- Known hero submission (Enter) reaches review with `rm -rf .git && git init`, scrolls, focuses the h2.
- Unknown input keeps typed text, shows the examples message; its link scrolls to and focuses the active example tab.
- Tab selection updates request, command and tree; arrow keys move and focus correctly. (Tabs no longer overwrite the pending review fixture.)
- Run reveals "Example output" once, labelled, deterministic; fixture change clears it.
- Detection picks the macOS/Linux tab silently on this machine; Windows tab swaps command to `iwr …/win.ps1 -useb | iex`; manual selection survives re-renders.
- Clipboard failure path verified (headless denies clipboard): shows "Select and copy the command.", no false success. Success path is the same code path with `Copied` + 2s restore.
- No horizontal overflow at 1586/1280/768/390/320/1920 (scrollWidth === innerWidth each). Content centers at 1436px max.
- `npm run lint` clean (only pre-existing `lexis/` warnings); `npm run build` passes; `/`, `/install.sh`, `/win.ps1`, `/privacy`, `/terms` all serve; legal pages readable with the compact footer.

## Deliberate deviations / limitations

- Footer wordmark reuse: the header's compact `lexis` reuses `footer-wordmark.svg` at ~110px. Cells soften at that scale but the silhouette matches the reference. *(Superseded in the effects pass: the footer's static mark is now the Ink Flood band; the header still uses `wordmark-mark.svg`.)*
- Command wrapping: `overflow-wrap: break-word` wraps at spaces first, so `> curl -fsSL` sits alone on line 1 as in the reference; long dev-origin URLs still split mid-string when they cannot fit a line alone (spec permits).
- Tree illustrations for Count lines / Inspect folders are the spec's "restrained adaptations" — same stems/highlight system, `42 main.go` / `1.2G total` readouts.
- Optional pointer-highlight on the footer wordmark was not added (spec allows it only after static layout passes; static layout was prioritized).
- 200% zoom verified via equivalent CSS-width viewports (all content reachable at 640–900px layouts) rather than browser zoom, which the capture tool can't emulate.
- No animation at all — the spec's allowed set (idle cursor, tab opacity, output reveal) was implemented as static/instant states, which is within "a simple output reveal is enough". *(Superseded in the effects pass: Wild Type and Smear are deliberate additions.)*
- Old `/public/lexis-lcd/` assets remain on disk, unused by the new page.
