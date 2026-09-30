# Lexis LCD handoff progress

Completed 2026-09-19 (planning): detailed SPEC, asset inventory, implementation plan, handoff prompt, reusable SVG/font kit, deterministic generator and browser evidence.

Completed 2026-09-19 (implementation): the homepage hero is implemented per SPEC using the prepared assets.

## What was built

- `app/lexis-lcd.module.css` — scoped LCD material (green paper, 6px grid tile, upper-right glow), u-scaled reference geometry, compact fixed-px assembly at ≤600px, proposed dark tokens via `html[data-lexis-theme]`, and token remapping (`--text/--muted/--quiet/--line/--bg-elevated`) so the preserved lower sections sit on the LCD sheet.
- `components/lexis-lcd-hero.tsx` — client hero: header (Sora wordmark, GitHub ↗ same-tab link, Install button), semantic h1 + pixel mask, rail form (3 SVG slices + native input + coral key + decorative resting caret), command row with `Review → Run`, inline review disclosure (explanation, "Website preview. Nothing runs on your computer.", Simulate run with labeled sample output, awaited Copy command, Reset example), native `<dialog>` install disclosure with both commands + awaited per-row copy + localhost note.
- `components/lexis-theme-toggle.tsx` — footer Light/Dark toggle, `localStorage('lexis-theme')` persisted, MutationObserver-synced; inline pre-paint script in `app/page.tsx` applies the stored theme before first paint. Light is always the default.
- `app/page.tsx` — Departure Mono via `next/font/local` (`--font-departure`), theme script, `.page` wrapper, preserved Studio/Workflow/Install sections and footer.
- `app/fonts/` — DepartureMono-1.500.woff2 + full OFL license. `public/lexis-lcd/` — 10 runtime SVGs.
- `app/layout.tsx` — `suppressHydrationWarning` on `<html>` (theme attribute is set by the pre-hydration script).

## Verified

- `npm run lint` exit 0; `npm run build` succeeds (all routes incl. `/install.sh`, `/win.ps1`, `/privacy`, `/terms` serve 200).
- 1586×992 measured vs SPEC: headline (57,129,1202×402), rail (53,565,1480×140), input/key per authored equations, command (61,729), review right edge ~1517, CTA (61,830,329×80), tagline (61,922) — inside stated tolerances.
- Viewports 1440×900, 1280×720, 768×1024 scale proportionally; 390 and 320 use compact rail; scrollWidth == viewport at 320 (no horizontal overflow); command wraps after pipes.
- Behaviors: Enter/coral key/Review → Run open the disclosure and focus its heading; unsupported input keeps the value + notice + "Restore example"; empty submit shows "Describe a task first." and focuses the input; simulate shows labeled illustrative output; copy reports awaited success; reset restores the exact first frame; install dialog opens from both triggers, Escape closes, focus returns to trigger; focus ring lands on the screen opening; GitHub link navigates same-tab to `hridaya423/lexis`.
- Evidence in `docs/design/lexis-lcd/qa/`.

## Remaining differences (known, bounded)

- Headline glyphs are the clean authored vector reconstruction — smoother than the generated raster's irregular pixels.
- Metal is procedural SVG, not photographic; small-copy font is Departure Mono (approximation, per ASSETS).
- Dark theme is the proposed adaptation (no approved dark reference exists).
- `components/quick-install.tsx` is now unused by the homepage (its hero usage was replaced by the install dialog); left in place — delete if desired.
- Dev-mode screenshots show the Next.js dev badge bottom-left; not part of the page.

## Sections 2–6 (2026-09-19, second pass)

Completed per `docs/design/lexis-lcd-sections/` (HANDOFF / SECTIONS / IMPLEMENTATION / ASSETS). The hero is untouched; old Studio/Workflow/Install lower content and the old footer were replaced.

- `app/lexis-lcd-sections.module.css` — shared metal frame / screen / screw / coral-key primitives and per-section geometry, `--u`-scaled; pixel heading masks with real h2 text; dark review band scoped to `.band` so its tokens never leak; responsive stacking at ≤900/700/360px; reduced-motion guard.
- `components/lexis-lcd-sections.tsx` — static composition: process rail (input → bridge → command → coral key, three stem annotations, CTA), closing (CTA + XL coral key on socket → `#install`), single footer (wordmark, GitHub, Privacy, Terms, `LexisThemeToggle`).
- `components/lexis-example-selector.tsx` — accessible tablist (roving tabIndex, arrows/Home/End); per-tab pixel illustration + two-line instrument; local preview disclosure with simulate/copy; selection clears stale state; `id="studio"` compat anchor preserved.
- `components/lexis-command-review.tsx` — fixed annotated example (`find . -name "*.py"`), bracket labels anchored to inline spans, Edit request → `#examples`, Run ↵ → labeled simulation + Reset preview; annotation bodies are `user-select:none` so the command copies as one string.
- `components/lexis-install-console.tsx` — OS tabs that merge into the console plate, single-string commands wrapped via `<wbr>` (copied value byte-for-byte), awaited clipboard → "Copied" 2s without resizing the key, failure shows recovery text and keeps the command selectable, localhost origin labeled, details block links README + `/install.sh` + `/win.ps1`.
- `components/lexis-section-anchor.tsx` — hash link that also moves focus into the destination section (no smooth-scroll dependency).
- `docs/design/lexis-lcd-sections/build-section-assets.py` → `public/lexis-lcd/sections/` — five pixel headings, folder/file icons, dark grid tile, XL coral key, manifest.

## Sections 2–6 verified

- `npm run lint` 0 errors/0 warnings; `npm run build` succeeds; `/`, `/install.sh`, `/win.ps1`, `/privacy`, `/terms` all serve 200.
- Hero regression: 1586×992 screenshot identical to baseline; input/review/simulate/copy/reset and install-dialog open/Escape/focus-return re-verified.
- Interactions: tab switch changes request+command+illustration together; preview disclosure focuses its heading; review Run ↵ → labeled sample output + Reset; install Copy → "Install command copied."; forced clipboard failure → "Couldn't copy. Select the command to copy it manually." with command still selectable; closing CTA and key both anchor `#install`.
- Responsive: no horizontal overflow at 1280/768/390/320 (scrollWidth == clientWidth); 793×496 (≈200% zoom) all controls reachable; 320px stacks process/annotations, tabs scroll locally, closing key becomes 160×90.
- Themes: light and global dark both verified; section 4 stays dark in each; dark tokens don't leak.
- Console: no page errors (only dev-server HMR noise).
- Evidence in `docs/design/lexis-lcd-sections/qa/`.

## Remaining differences (sections 2–6)

- Pixel headings are clean vector glyphs (same construction as hero), smoother than the rasters' irregular cells.
- Install command sits on one line at 1586 when the dev origin is short — it wraps per terminal width, matching spec (no forced newline).
- Section 3 non-default illustrations are designed adaptations (spec allowed; footprint/density kept close).
