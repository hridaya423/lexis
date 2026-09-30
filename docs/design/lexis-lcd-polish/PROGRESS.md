# Polish audit complete

2026-09-19. Inspected live Lexis at localhost:3210 at 1586×992 desktop and 390×844 mobile. Inspected light sections, mobile workflow/review, and dark workflow; captured full-page evidence for both themes and mobile. Compared approved workflow and review references directly and the supplied hero reference. SPEC.md and HANDOFF.md contain the repair plan and acceptance criteria. Screenshot files verified present. No application files changed. Proposed repairs have not been implemented or validated. Browser theme restored to light and viewport override reset.

# Repair implementation — 2026-09-19 (later session)

All P0/P1 repairs applied to `app/lexis-lcd-sections.module.css` and the four section components. Verified against the approved references and the live page at 1586/1280/768/390/320 in both themes. Evidence in `qa/`.

## Shared material system (P1)

- `.metal`: dark silhouette edge → rolled bevel (`::before` inset lighting) → satin face with `metal-grain.svg` (new irregular 173×40 dash tile modeled on the hero rail grain, not regular stripes) → soft drop shadow. Grain lives in the background layer only, so it can never cross apertures, keys, or text.
- `.screen`: machined border rim (border-box gradient) + inset recess + dark glass + pixel grid `::after`.
- `.socket` (new): dark recess ring every coral/silver key now sits in — face translates on `:active`, socket stays put. All key sites wrapped: `.procKey`, `.exKey`, `.instCopy`, `.revRun`, `.revEdit` (new `.revEditFace` silver key), `.bigKey`.
- `.coral`: shared saturated face + rim gradients; `font: inherit` so text keys take socket font.
- `.screw`: countersunk radial face + slot + specular tick; `max()` floor 15px.

## P0 repairs

- Mobile workflow: `procRail` is now a compact vertical instrument — 16px face padding, full-width screens, 24px bridge row, right-aligned 72×56 socket key, screws omitted symmetrically. Dead `inend`/`keyr` columns removed.
- Truncation: `procScreen`/`.exReq`/`.exCmd` no longer `nowrap`+ellipsis; commands wrap and screens grow (`min-height`), so `find . -name "*.py"` and `list all python files` are fully readable at 320px.
- Leaders: `.procNote::before/::after` are `content:none` on mobile; explanations are plain aligned text groups, 22px apart.
- Example marker: `.exTabs` now reserves a `padding-bottom` indicator row inside the scroll clip; the coral marker lands flush on the baseline rule, fully visible (no clipping, no page overflow).
- Texture exclusion: coral faces are children of `.socket`; metal grain is a background layer under them.

## Section repairs (P1/P2)

- Workflow: `.procNotes` grid mirrors the rail's 6-column template (`padding-inline:5u`), so stems land at input-text start, command-text start, and a pair under the key — sharing the instrument's coordinate system. Labels single-line at 26u/19u per spec ranges. `.procBridge` is a machined metal channel (raised strip) with an unfilled stroked arrow (`fill="none"` added).
- Examples: folder silhouette rebuilt in `build-section-assets.py` (stepped tab + broad body, was a wedge); regenerated. `.exBottom` gap tightened 66u→48u. Mobile: screws omitted, key on a dedicated bottom control row, no screw gutters.
- Review: `.revCmd` 38u→50u (~46px, spec 46–50). Bracket `--annw` default corrected to 7.6ch (both tokens are 6ch — was never set). `.revPreviewTag` flush-left via `margin-right:auto`. `revEdit`/`revRun` are socketed keys on one 92u baseline. Mobile: plate single column, stacked token descriptions, screws omitted.
- Install: support text moved below the heading, left-aligned (was absolute top-right). OS tabs rebuilt as machined tongues — bordered, rounded top, lip highlight + sidewalls, fixed 56u height, active tab drops flush into the plate face; `clip-path` trapezoid removed so focus outline is a real 2px/3px outline outside any clip. Mobile: `flex:1` tabs at 48px, single-column plate.
- Closing: `.hClosing` 1450→1330px (still two lines). CTA/tagline pair left, socketed 428×192 key right — key face is `.coral` so it shares the small-key recipe; no stripes possible. `closing` bottom 60→64u + `.foot` margin-top 80→56u consolidates the footer whitespace.

## Page rhythm (P2)

- Page grid: `lcd-grid.svg` line opacities .33/.30→.22/.20 (~-33%); new `lcd-grid-dark-page.svg` (single dim ink lines, no light highlight — the highlight read as glowing on dark paper) swapped in on `html[data-lexis-theme="dark"]`.
- Hero: pipes get `.pipe` inline-block padding 0.14em — visual breathing room, copied bytes unchanged.
- Heading widths match the spec table (workflow 900, examples 1100, review 1000, install 1100, closing 1330).

## Verification

- `npm run lint` clean; `npm run build` passes; `/install.sh`, `/win.ps1`, `/privacy`, `/terms` all serve.
- Interactions: example tabs switch illustration+command+marker; Preview example disclosure opens (`aria-expanded`); review Run→simulated output + Reset; OS tabs swap command; copy announces; dialog open/Escape unchanged.
- `scrollWidth == clientWidth` at 1280/768/390/320 — no horizontal overflow.
- qa/: desktop-full, per-section 1586, tablet-1280-workflow, tablet-768-examples, mobile-*, mobile-320-full, dark-full, install-win-tab, example-preview-open, review-simulated, focus-os-tab, hero.

## Honest deltas remaining

- Pixel headings remain clean vector cells vs. the rasters' irregular edge noise (sub-pixel at normal scale).
- Metal grain is an SVG dash tile — irregular, but periodic on very long faces.
- Screw heads are a single shaded slot + specular tick, not a photographic philips.
- Dark theme remains a designed adaptation (no approved reference); grid is dimmed further there. Footer toggle removed at user request — theme now only follows a previously saved `lexis-theme` preference.
- `material-proof.html` retained as the recipe reference for the shared primitives.

# Follow-up repairs — same day

User-reported polish items, applied and verified live:

- **"doina" (clipped descenders)**: `emit()` sized heading viewBoxes to 14 rows; `g`/`y`/`p` descenders (rows 14–16) were clipped — "What needs doing?" rendered "doina". viewBox now covers 17 rows; all 5 heading aspect-ratios updated (`x/444` two-line, `x/238` single-line).
- **Pixel text inside terminals**: root cause was Tailwind preflight forcing `code`/`pre` to `--font-mono` (IBM Plex) — only `<input>` in the hero escaped. Two-part fix: `.page :is(code,pre,kbd,samp) { font-family: inherit }` restores `--lcd-font` (Departure Mono) everywhere, and static screen strings additionally render through generated pixel-cell masks (`.pxText`, `px-*.svg` assets from the same glyph system as headings) with real text kept as `.sr-only` siblings. Covers workflow request/command, all 3 example screens, review command + output. The install command stays live text (dynamic per origin + must remain selectable for the copy-failure fallback).
- **Review annotations**: brackets are now `position:absolute` spans anchored to token ranges of the command mask (`find .` = 0–27%, `"*.py"` = 60.6–91.8%), labels flex-centered beneath. `.revAnnotations` is the accessible + mobile presentation (visually hidden on desktop, real list ≤700px); decorative brackets are `aria-hidden`.
- **Tab marker straddle**: the coral square sat on top of the baseline rule (`bottom:-15u` against `padding-bottom:15u`). Now `bottom:-30u` (desktop) / `-25px` (mobile) — the rule crosses the marker's midline again.
- **Hero Enter**: `onKeyDown` preventDefault on Enter — the command is pre-given; Enter no longer submits the form. `enterKeyHint` now `done`.
- **Footer**: `LexisThemeToggle` removed from `.footLinks` (+ dead `.footLinks button` rule removed); `.foot` gains `padding-bottom: 56u` so the page breathes after the rule.
- **Mobile stray stem**: `.procNote:nth-child(3)::after` outranks the plain `.procNote::after` mobile disable on specificity — mobile rule now uses `:nth-child(n)` selectors.
- **New glyphs** in `build-section-assets.py`: `f p z - " ' * /` for screen-text masks.

Verified: lint clean, build passes, Enter blocked (typed value persists, no submit), marker straddles at 1586 + 390, no stray stems at 390, labels centered under brackets, review simulation + pixel output intact. Evidence: `qa/fix2-*.png`.
