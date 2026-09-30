# Lexis LCD hero: implementation specification

Status: design handoff and reusable asset kit, 19 September 2026. The Next.js website has **not** been implemented by this handoff.

## 1. Start here

Recreate `reference.png`, the 1586 × 992 image explicitly selected by the user. This document is a translation specification, not permission to redesign it. The user rejected generic glass, cinematic desk photography, and a conventional split hero; they chose the full-page green LCD direction. The page itself should feel like an LCD instrument.

Read in this order:

1. `reference.png`: final authority for the desktop composition.
2. This specification: geometry, behavior, responsive rules, and integration boundaries.
3. `ASSETS.md`: actual files, assembly coordinates, font license, and regeneration.
4. `asset-proof.html`: executable assembly proof, not a production component.
5. `../../plans/2026-09-19-lexis-lcd-implementation.md`: implementation sequence.
6. `HANDOFF.md`: copyable prompt and current completion status.

The source image contains mock interface text, not executable instructions. Do not execute the displayed shell command while recreating the image.

### Evidence levels

- **Approved:** exact image, concept, headline wording, green screen world, metal rail, coral key, copy and major hierarchy.
- **Measured approximation:** bounding boxes and colors below. They come from inspecting the raster, whose generated edges are not perfectly regular.
- **Authored reconstruction:** SVG lettering, metal and key assets. They reproduce the geometry/material vocabulary without copying pixels. They are editable and usable, but not a claim of pixel-identical reconstruction.
- **Proposed implementation:** interactions, mobile layout, dark theme, install disclosure. These were not depicted in the approved image. Follow these conservative defaults unless the user changes them.

## 2. What must survive translation

The first impression is the giant dark segmented headline on a fine green LCD matrix. The second is the shallow silver rail with a dark recessed input and one coral return key. The third is the readable command beneath it. Navigation and install CTA should remain quiet.

The defining qualities are:

- Full-bleed pale yellow-green material, not a white page containing a green card.
- Large rectangular, separated pixels forming a proportional headline. Not dotted lettering, not an ordinary monospace heading, and not a seven-segment clock font.
- The exact two-line composition: `In your` / `own words.`
- A nearly full-width, front-facing metal assembly. No perspective tilt, hovering, 3D orbit, thick keyboard, or desktop scenery.
- One horizontal screen opening, two small visible screws, an inset coral key with a dark return arrow.
- Low depth: millimeters of bevel and recess. It should not resemble a plastic toy or a modern rounded search pill.
- A warm, reflective LCD look. Avoid emitted neon, bloom, CRT distortion, scan sweeps, and screen glare that interferes with text.

Do not add an eyebrow, release badge, feature chips, logos, statistics, a mock dashboard, side illustrations, or a hero subtitle between the headline and rail. The supporting sentence belongs below the install CTA.

## 3. Scope and product truth

Lexis is a natural-language terminal tool. Existing repository behavior already supports presenting shell commands and installation instructions. This work changes the marketing hero, not the CLI product or LLM backend.

Implementation scope:

- Replace the home header/intro with this hero.
- Add a small deterministic browser demo within the rail, with an explicit preview disclosure when activated.
- Keep install instructions reachable through both install links.
- Preserve existing lower sections and legal routes unless separately authorized. Make minimal supporting style changes so they remain usable; do not redesign a whole website around invented content.
- Add a coherent dark variant because repository instructions require both themes. The approved light appearance is the initial visual target.

Do not add an AI endpoint, browser command execution, microphone permission, terminal connection, filesystem access, authentication, pricing, or invented platform support.

The image's `du -ah . | sort -rh | head -5` example includes directories as well as files. Reproduce it as a familiar illustrative example. In the review explanation, say “Shows the five largest entries under the current directory,” not “guarantees five files.” The web demo does not run it. Do not silently change the screenshot copy or use the illustration as proof of cross-platform correctness.

## 4. Reference geometry

Coordinate origin is the top-left of the approved 1586 × 992 image. Units below are reference pixels, not an instruction to hardcode one viewport. Bounding boxes are approximate visible bounds.

| Element | X | Y | Width | Height | Notes |
| --- | ---: | ---: | ---: | ---: | --- |
| Canvas | 0 | 0 | 1586 | 992 | No card wrapper or outer border |
| Wordmark | 53 | 34 | 105 | 40 | Lowercase heavy sans, modest negative tracking |
| GitHub link | 1188 | 39 | 116 | 26 | Baseline aligned with install link |
| Header install | 1345 | 39 | 192 | 26 | Arrow is part of label |
| Headline complete | 57 | 130 | about 1185 | 402 | Asset uses 1202 × 402 for clean reconstructed pixels |
| Line 1 | 57 | 130 | about 815 | 232 | Includes descending y |
| Line 2 | 57 | 336 | about 1185 | 196 | d ascends before the other lowercase letters |
| Visible rail body | 53 | 570 | 1480 | 132 | Asset box starts y566 and includes shadow margin |
| Screen outer bevel | 118 | 591 | 1158 | 89 | Left inner screen edge at x123 |
| Input visible ink | 170 | 621 | about 530 | 37 | No prefixed dollar sign in input |
| Caret | 712 | 614 | 4 | 46 | Thin pale bar, not a square block |
| Coral key outer bezel | 1288 | 591 | 183 | 91 | Key face inset from opening |
| Return arrow | 1376 | 621 | 39 | 35 | Dark brown/olive, not pure white |
| Left screw | 85 | 637 | 28 diameter | — | Head at vertical center |
| Right screw | 1503 | 637 | 28 diameter | — | Match left scale |
| Command result | 61 | 730 | about 605 | 36 | Left aligned; no surrounding card |
| Review → Run | 1300 | 737 | about 217 | 32 | Align toward rail's right side |
| Main install CTA | 61 | 829 | 329 | 80 | Near-square corners, inset dark LCD look |
| Tagline | 61 | 921 | about 510 | 26 | One line at desktop |

Important relationships: left edges cluster at 53–61; the heading is approximately 81% of the rail's width; there are about 38px between the headline's last pixel and rail body; command row starts about 30px beneath rail; CTA begins about 61px beneath the command row; tagline starts 12px beneath CTA.

### Desktop scaling contract

Let `s = min(containerWidth / 1586, 1)` for the main visual composition. At 1586px wide, s=1. At 1440px, s≈0.908. At 1280px, s≈0.807. At wider screens, center the 1586px composition but let the green material cover the viewport.

Use a real document-flow layout in production. The proof uses absolute coordinates to measure asset geometry; do not copy its positioning wholesale into the page. A suitable flow is header → heading → rail → command row → install block. Maintain the reference gaps by scaling them, while letting text and controls impose readable minimum sizes.

Suggested desktop content gutter: `clamp(24px, 3.34vw, 53px)`. Heading width: `min(81.22% of rail width, 1202px)`. The larger side of the headline remains open green space. Do not center it or stretch it to the full rail width.

At ≥1024px, composition height begins near `992*s`, then expands if zoom/text sizing requires it. At 1280 × 720, the full reference composition is about 800px tall, so a small amount of scrolling is correct. Do not squash the headline, hide the tagline, or shrink buttons merely to force everything into 720px height.

## 5. Color and LCD surface

The raster has fine variations. Use these authored starting tokens, then compare screenshots. They are not exact flat-color readings from every location.

| Token | Light value | Role |
| --- | --- | --- |
| `--lcd-paper` | `#c7e6a5` | Lower/left ground |
| `--lcd-paper-high` | `#d0edb0` | Upper/right diffuse light |
| `--lcd-paper-low` | `#c1e39e` | Restrained edge falloff |
| `--lcd-ink` | `#18250e` | Heading and body copy |
| `--lcd-grid-ink` | `#557c36` | Grid lines, low opacity |
| `--lcd-screen` | `#151f0b` | Recessed terminal interior |
| `--lcd-screen-ink` | `#b9dd93` | Editable screen text |
| `--lcd-caret` | `#cce5af` | Input caret |
| `--lcd-cta` | `#172309` | Primary install surface |
| `--lcd-cta-ink` | `#c4e5a2` | Install text |
| `--lcd-coral` | `#ff654b` | Physical submit key |
| `--lcd-key-ink` | `#42271b` | Return glyph |

Build the material in separate layers:

1. Solid green fallback.
2. Very broad, subtle green-only light variation. The supplied proof uses a pale upper-right radial grade over a diagonal green gradient.
3. `lcd-grid.svg` repeated at 6 × 6 CSS px at the reference size. Its two offset hairlines imitate small recessed cells. The matrix is stationary, not animated.
4. Optional extremely low-opacity grain only if it improves comparison. Do not add coarse noise just because the asset feels clean.

The small background matrix and large heading pixels have different scales. Background cells are approximately 6px. Headline cells are approximately 12px wide × 14px tall, with 1.25px gaps. This distinction is central to the reference.

Keep the grid visible but subordinate. Do not put a global overlay above the text and input; it reduces clarity and intercepts events unless explicitly disabled. Prefer background layers. In smaller viewports keep cells around 4–6px rather than scaling them to subpixel mush.

A color sample of the upper-right blank raster region frequently returned values around `#d1eeb2`. The grid darkens the perceived average. Do not set the whole surface to a dark saturated green based on its grid lines.

## 6. Typography and graphics

### Headline

Use `assets/headline-pixels.svg` as a CSS mask colored with `--lcd-ink`. It is built from separate rectangles; its shape is not dependent on an installed font. It has a 1202 × 402 viewBox and explicitly preserves the two lines.

Semantic implementation:

```tsx
<h1 className={styles.headline}>
  <span className="sr-only">In your own words.</span>
  <span className={styles.headlinePixels} aria-hidden="true" />
</h1>
```

```css
.headlinePixels {
  display: block;
  width: 100%;
  aspect-ratio: 1202 / 402;
  background: var(--lcd-ink);
  mask: url('/lexis-lcd/headline-pixels.svg') center / contain no-repeat;
}
```

Reserve the aspect ratio before load. Do not replace the SVG with Departure Mono, Sora, Inter, an HTML screenshot, or a raster crop. Do not apply letter-spacing to the mask. Do not use `image-rendering: pixelated` to solve vector scaling; inspect antialiasing at actual browser dimensions.

The supplied glyphs are deliberately clean vector reconstructions. The approved image has irregular generated pixels. Exact irregularity is lower priority than matching silhouettes, line widths, cap height, cell size, and line positions. If refining, edit the glyph map and generator, not hundreds of generated rectangles individually.

### Small text

Departure Mono 1.500 is bundled with its SIL Open Font License. It is an implementation match for the reference's small pixel copy, not an identified original font. Use at normal weight; synthetic bold destroys the counters.

Reference sizes: navigation 22px, input 38px, command 32px, review link 27px, CTA 26px, tagline 23px. Scale desktop values with the composition. On small screens clamp text to the mobile values below. Disable ligatures for shell commands; keep literal spaces and pipes.

The wordmark is a heavy conventional lowercase sans, approximately 48px at the reference width. Use existing Sora at weight 650–700, tracking approximately -0.06em, with a 104–110px visual target width. The proof uses Arial as a stand-in and is visibly narrower than the reference. Sora is already loaded by the app. Do not use the pixel headline glyphs for the wordmark.

### Exact first-frame copy

- Brand: `lexis`
- Header: `GitHub ↗` and `Install Lexis ↗`
- Heading, accessible text: `In your own words.`
- Heading visual lines: `In your` / `own words.`
- Input value: `show my largest files`
- Command: `du -ah . | sort -rh | head -5`
- Secondary action: `Review → Run`
- CTA: `Install Lexis ↗`
- Supporting sentence: `A smart terminal. In plain language.`

Do not auto-type or rotate any of this on load. The user approved the settled composition.

## 7. Metallic rail assembly

The rail is a shallow front-facing 2D object. Authored SVG is the selected implementation, with native HTML input and button placed above it. Blender, Three.js, R3F, image generation, video, canvas and WebGL are unnecessary for this viewpoint.

Asset layers include outer dark edge, highlight ridge, brushed silver face, horizontally oriented fine grain, inset screen bevel, dark screen, two cross-head screws, button socket, and separate keycap. The key is separate specifically so a native button can depress without moving the surrounding rail.

Desktop geometry is based on a 1480 × 140 assembly box. It includes transparent shadow margin. Use three side-by-side SVGs: left cap 96 units, center 1092 units, right cap 292 units. End caps scale uniformly with rail height; only center width stretches. The center contains straight horizontal borders and screen fill. It has no screw or key to distort.

Desktop assembly equations, at rail height H:

- `k = H / 140`
- left cap width `96*k`
- right cap width `292*k`
- center width = available rail width minus the two end caps
- input rectangle: left `114*k`, right `310*k`, top `31*k`, height `74*k`
- key: right `67*k`, top `27*k`, width `176*k`, height `86*k`
- return glyph: `40*k` square, centered on key

The SVGs share the same master coordinate system and identical material definitions, so joins should be seamless. Set each image to `display:block;width:100%;height:100%`; keep the grid's min track size at zero. Do not allow intrinsic SVG width to enlarge the center column.

Use a sibling button with `background-image: keycap-coral.svg`. It has no text baked into it. Inline `return-arrow.svg` so `currentColor` works. The background is decorative; the button label is “Review example command.” Do not treat the asset as an image map.

Input should be a real text input, transparent, borderless until focus, with accessible label “Describe a terminal task,” `spellCheck={false}`, `autoComplete="off"`, `autoCapitalize="off"`, and `enterKeyHint="go"`. No browser speech control. Use native caret when focused. A decorative resting caret may be shown while unfocused; remove it on focus so there are never two carets. Avoid overlay text hiding the actual typed value.

Focus ring goes on the screen opening, not the whole page. Suggested light focus: 2px `#e5f7c9` inset plus an outer dark ring where needed. Ensure focus remains visible against both the black recess and metal.

The rail texture is deliberately fixed. Do not animate brushing, sparkle, ambient tilt or screws. Coral hover: 3% brightness increase; active: key face translates down 1px and shadow shortens over 100–120ms. The socket does not move. Respect reduced motion by making press feedback instantaneous.

## 8. Responsive contract

No responsive reference was approved; these are functional adaptations of the same design.

### Wide desktop: ≥1024px

Keep two headline lines and horizontal command/review row. Scale the composition toward the 1586px reference. Preserve 44px minimum interactive targets even when the visible label is smaller. Use transparent padding on header links.

Rail height should not drop below 96px while using desktop caps. The heading-to-rail gap may increase slightly as necessary to keep the lowercase descender clear. Use normal flow; never allow it to overlap the screen.

### Intermediate: 601–1023px

Keep the same two headline lines. Use 24–32px page gutters. Reduce header navigation gaps before hiding any link. Heading width can increase to 100% of content here; it is already a complete two-line vector.

Use a 96px-high desktop assembly with end caps scaled by 96/140. Keep the native input at least 18px. Place command and review in two rows when the command's intrinsic width would collide with review. A two-row command area is preferable to clipped code or 11px text.

### Compact: ≤600px

Use the dedicated compact rail assets; do not horizontally squash desktop screws or key.

- Page gutters: 20px at 390px, 16px at 320px.
- Header top: 24px; wordmark approximately 32px; links 12–13px with expanded 44px hit areas. At 320px, reduce link gap to 10px and wordmark width before wrapping the header.
- Heading top in proof: 120px; width = viewport minus 40px; same 1202/402 aspect. Maintain at least 40px after the header. Allow natural top spacing rather than setting a fixed screen height.
- Rail: 88px high, outer gutters 16px; left cap 32px, right cap 104px, center flexible. The fixed right cap reserves the key; decorative screw diameter is 12px.
- Compact input: left 38px, right 112px, top 18px, height 50px; font 16px minimum. Native horizontal scrolling handles long values.
- Compact key: right 25px, top 18px, 61 × 50px; use `keycap-coral-mobile.svg`, not the desktop key squashed into a narrow box.
- Command: 17px/1.6; wrap after pipes where possible. Use ordinary whitespace wrapping or `<wbr>` immediately after each pipe. Keep copied command string unchanged.
- Review action: on its own row, at least 20px after command; 17px with a 44px hit area.
- CTA: 230 × 56px, 20px text. Allow width to become content-based under text zoom.
- Tagline: 17px/1.6; wrap into two lines naturally.

The proof demonstrates a 390px layout with the rail near y300 and CTA near y548. Those are inspection anchors, not production absolute offsets. At 320px, all content must remain reachable without horizontal page scrolling. At 200% zoom, layout should enter compact mode and continue in document flow.

### Why not shrink the complete image?

A scaled screenshot makes input and links unreadable and prevents real text entry. Asset slicing preserves the appearance while letting the content adapt. The approved raster is a comparison target only; never ship it as the page background.

## 9. Proposed demo behavior

The website is a bounded demonstration, not a remote shell. Keep it deterministic and local to a small client component. No network dependency is required to satisfy this hero.

First paint is the exact reference example, already showing a proposed command. Input is editable. Coral key or Enter in the input opens a review disclosure below the command row. “Review → Run” opens the same disclosure. Do not register a document-wide Enter handler.

Use these states:

| State | Visual result | Available action |
| --- | --- | --- |
| Initial | Reference example and command visible; review disclosure closed | Edit or review |
| Editing | Preserve typed value; clear stale command if it no longer matches the example | Submit |
| Supported example | Show mapped command; review disclosure opens | Copy command or simulate |
| Unsupported input | Keep input; show “This preview uses a few examples. Try ‘show my largest files’.” | Restore example |
| Empty submission | Inline “Describe a task first.”; return focus to input | Type |
| Review open | Explain what command does and state “Website preview. Nothing runs on your computer.” | “Simulate run” and “Copy command” |
| Simulated | Explicit “Example output” with short static sample entries | Reset example |
| Copy failure | “Couldn’t copy. Select the command to copy it manually.” | Selectable command remains |

Normalize supported input only by trim, whitespace collapse and lowercase. Do not manufacture an answer for arbitrary text. A single example is sufficient for the first faithful implementation; additional existing safe presets can be added only if they do not clutter the hero. Avoid the existing “kill port 3000” example in the first demo.

The review disclosure uses the same green matrix surface with a simple dark rule, not a modal glass card. On opening it pushes later content downward. Keep the first screenshot unchanged when closed. If the disclosure is opened from the button, focus its heading or first action only when it helps keyboard orientation; do not steal focus on every text edit.

Example simulated output can include explicit sample rows such as `420M  ./example-video.mov`. Mark it illustrative, never as discovered local files. No timer is necessary. If a brief processing transition is desired, cap it around 150ms and do not claim actual model work.

## 10. Install, GitHub, and navigation

GitHub destination observed in repository remote: `https://github.com/hridaya423/lexis`. Prefer same-tab navigation. If opening a new tab, use `rel="noopener noreferrer"` and accessible indication.

Both install triggers should open the same installation disclosure, ideally a native `<dialog>` outside the hero's reference layout. Do not auto-download, auto-run, or attempt to install from a browser click. The dialog displays the existing macOS/Linux and Windows commands and a copy button for each.

Existing command URL behavior uses current `window.location.origin`, with server fallback `https://lexis.hridya.tech`. Preserve that convention after inspecting the installer routes. Explain that localhost development commands point to localhost. Do not change deployment URLs speculatively.

Dialog requirements: accessible heading, close button, Escape closes, focus trapped by native dialog, focus returns to the triggering link/button, backdrop click is optional, copy reports success only after clipboard promise resolves. Preserve selectable command text if clipboard is unavailable. Do not reuse the existing QuickInstall copy handler unchanged: it currently sets “copied” without awaiting the write.

Use the existing installer endpoints `/install.sh` and `/win.ps1`. Do not alter their implementation for a visual redesign. Footer legal links remain intact. A small theme control may live below the hero or in the install/footer area; adding it to the approved header would be an unrequested visual change.

## 11. Dark appearance

Repository requirements call for light and dark support. The screenshot establishes only light. Implement light as the default visual direction, with an explicit persisted theme choice outside the hero and an optional system setting. The first visit must not unexpectedly replace the approved green appearance merely because the developer's OS is dark.

Proposed dark palette:

- Ground `#172610`, high `#263c1c`.
- Headline/copy `#bddf90`.
- Grid dark-green lines with very low-opacity pale highlights.
- Metal retains silver but may be dimmed to brightness .83. Apply to decorative metal only, not native text, focus ring or key label.
- Coral retains its warm red identity.
- CTA uses dark olive with a subtle pale border and light-green text.

Do not invert the complete hero or hue-rotate the metal. Keep identical geometry and copy between themes. The included proof toggle is a material check, not finished theme persistence code. Validate contrast in the final rendered states; the proof's existence does not establish WCAG compliance.

## 12. Accessibility, motion, and performance

Use one real h1, header/nav/main/section semantics, native input and button, and plain selectable command text. Decorative assets get empty alt; headline SVG gets `aria-hidden` because its h1 supplies text. Retain the app's skip link and `main-content` target.

No fake click target around the whole rail. Tab sequence: brand, GitHub, header install, input, return key, review, main install, lower-page content. Use `aria-expanded`/`aria-controls` for the review disclosure. Use a small `aria-live="polite"` region for status; do not announce every cursor blink or each typed character.

Do not animate the whole heading, grid or rail. Optional resting caret blink uses 1-second step timing for at most a few cycles, or stays solid. Stop blink on reduced motion. Press transitions are local, 100–120ms, on transform and brightness only. No layout shifts on load, no sound by default, no hover-only information.

SVG assets and local font should require no runtime library. No new renderer dependency. Use the mask/SVG without hydration. Only demo, installation disclosure, and theme choice need client logic. Preload the local small-copy font if measurement shows a visible swap; do not download more font families. Preserve image dimensions/aspect ratios. Do not inline the large headline path repeatedly.

Performance acceptance: no continuous requestAnimationFrame loop; no network request for a demo command; no remote font fetch at runtime; no warning/error in console; no unnecessary new package. Compare LCP and layout shifts in browser after implementation, but do not invent performance scores.

## 13. Repository integration

Observed stack: Next.js 16.2.1 App Router, React 19.2.4, Tailwind 4, TypeScript, Sora and IBM Plex Mono, existing Framer Motion and Phosphor. No Three.js dependency is necessary.

Read local Next documentation before implementation:

- `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md`

Recommended ownership:

- `app/page.tsx`: server-rendered hero composition and preserved lower sections.
- `components/lexis-lcd-hero.tsx`: small client boundary only if the complete hero needs shared disclosure state; otherwise keep header/heading server-rendered and use a narrower `components/lexis-lcd-demo.tsx`.
- `app/lexis-lcd.module.css`: scoped materials, geometry, breakpoints, focus and theme tokens.
- `public/lexis-lcd/`: copies of the SVGs actually used.
- `app/fonts/DepartureMono-1.500.woff2`: locally loaded via next/font/local, with its license nearby or in public notices.
- Existing `components/install-commands.tsx` / `quick-install.tsx`: inspect before extracting any shared installation behavior. Do not create a generic component library.

Two viable shapes were considered: CSS-only shadows/gradients, or prepared SVG skins with HTML controls. CSS-only is slightly smaller but leaves material interpretation to the next model and is harder to keep visually stable. SVG skins are selected because their geometry is explicit and already inspected. A full WebGL/Blender scene would add runtime/render workflow without a requested camera movement.

The current `app/globals.css` paints dark gradients on html/body, and `app/layout.tsx` adds a dark body background. Override/scopingly replace these for the home hero, otherwise green edges can expose black. Do not change legal-page tokens globally without inspecting those pages. Existing `overflow-x-hidden` can hide layout bugs; verify actual scroll width rather than treating clipping as a fix.

Keep `lexis/`, installer scripts and route handlers untouched. The pre-existing untracked `docs/` content is user work; do not overwrite or delete it.

## 14. Acceptance and comparison protocol

Capture the new home page at 1586 × 992, DPR1, light mode, first-frame state, after font readiness. Compare directly with `reference.png`, not only the proof. The proof demonstrates reusable assets; the approved image remains the target.

Prioritize in order:

1. Content/line breaks and headline silhouette.
2. Gutter, headline bounds, rail Y position and size.
3. Background green and grid scale.
4. Metal layering, recess, coral size/color and screw positions.
5. Input/command text sizes and baseline alignment.
6. CTA/tagline and navigation.
7. Fine noise variation.

Suggested reference-size tolerances: main left edges ±4px; rail top ±5px; rail width ±6px; headline height ±6px; headline total width ±20px; screen/key alignment ±3px. These are review thresholds, not measured accuracy claims for the current assets.

Inspect at 1586 × 992, 1440 × 900, 1280 × 720, 768 × 1024, 390 × 844, and 320 × 740. Also inspect dark, 200% zoom, reduced motion, focus-visible, open review, empty/unsupported input, open install dialog and clipboard failure.

Functional checks: both install triggers open the same UI; Escape returns focus; Enter only submits the focused form; arbitrary input is not mapped to fake commands; simulation is labeled; no system command executes; all assets/font load; no horizontal page overflow; selectable command survives wrapping.

Run `npm run lint` and `npm run build`. Those validate implementation, not appearance. Include screenshot paths and honest remaining differences in the completion report. Do not label “pixel-perfect” based on compilation or a small screenshot.

### Known asset-proof differences

The vector headline is cleaner and more geometrically regular than the generated source. Its y, w and s shapes differ slightly. The rail is cleaner and less photographic; brushing is procedural. The proof wordmark uses Arial rather than the app's Sora. Departure Mono approximates the small lettering rather than identifying an exact original. Mobile and dark are proposed adaptations. These are bounded refinement areas, not permission to replace the concept.
