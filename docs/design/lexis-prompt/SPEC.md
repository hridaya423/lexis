# Lexis: prompt design implementation specification

Status: ready for implementation. Prepared 19 September 2026. This package specifies the approved visual direction; it does not change the running website.

## 1. Authority and scope

Implement the marketing homepage from the four approved section images in `references/`, using the selected earlier footer composition. This document resolves behaviour and responsive layouts that the images cannot show. The supplied heading geometry is the source of truth for display typography. Preserve existing installation endpoints and legal content.

Use this precedence when references disagree: the user's latest corrections, this specification's explicit adaptations, the approved images, then existing implementation. Earlier metal/LCD handoffs describe a superseded direction. Do not combine their materials with this one.

The page contains, in order: header and hero, examples, review, installation, footer. Remove the separate process section and the separate closing CTA. They repeat the hero and footer without adding information.

The approved design uses a continuous pale green substrate. The user's request to remove the dark section and keep the same colour overrides the repository's default requirement for two themes on this marketing page. Do not invent a dark interpretation during this implementation. A saved theme preference must not silently darken the page.

No product/backend redesign is included. The web examples remain local demonstrations. Do not execute commands, connect an AI backend, change installer routes, or alter unrelated terminal-product work.

## 2. What makes the design work

The large headings are actual square-cell letterforms with irregular details inherited from the approved artwork. Ordinary copy uses the much smaller Departure Mono. Their contrast in scale creates the identity. The page should feel spacious, readable and responsive, with the `>` prompt providing a recurring interaction cue.

Coral appears in tiny cursors and selection markers. It is not a button fill or a second background colour. Rules and underlines supply structure without panels. The directory tree is the one substantial illustration; it should respond to the example selection rather than operate as a decorative diagram.

Exclude brushed metal, bevels, screws, inset dark screens, raised keys, orange Enter buttons, pill controls, rounded cards, shadows, glass, section gradients and generic feature grids. Do not replace the lettering with a vaguely similar pixel font. Do not turn every piece of copy into a huge headline.

## 3. Reference coordinate system

All five source images are 1586 × 992. Coordinates below describe visible ink, measured from each image's top-left. They are visual calibration anchors, not instructions to absolutely position the entire page. Use semantic flow, grid and spacing. The images contain some spare bottom space; preserve the internal relationships before matching total image height.

| Image | Asset | Visible heading bounds, x/y/right/bottom |
| --- | --- | --- |
| Hero | `heading-hero.svg` | 75 / 183 / 1232 / 549 |
| Examples | `heading-examples.svg` | 78 / 137 / 1070 / 245 |
| Review | `heading-review.svg` | 76 / 253 / 1030 / 568 |
| Installation | `heading-install.svg` | 80 / 205 / 654 / 567 |
| Footer | `footer-wordmark.svg` | Adapted; use its natural aspect ratio |

Start desktop calibration at 1586 CSS pixels wide and device scale factor 1. At that width, use a 1436px content area with 75px side gutters. Reference edges vary by a few pixels; align actual implementation consistently to the shared gutter rather than reproducing generation drift.

At 1280–1586 widths, scale large geometry with the container. A useful desktop scale is content width / 1436. Body copy must retain a sensible minimum size instead of shrinking everything proportionally. Above 1586px, cap content at 1436px and centre it; the background continues to the viewport edges.

Recommended section heights at the reference width, after content settles: hero about 992px, examples 830–900px, review about 992px, installation 880–950px. These are calibration ranges, not fixed heights. Footer height follows the natural wordmark and its preceding whitespace. On short screens the page scrolls normally; never shrink the hero to force it into one viewport.

## 4. Shared visual tokens

| Token | Value | Use |
| --- | --- | --- |
| Page | `#c3dfa0` | Every marketing section |
| Ink | `#182510` | Headings, body, controls, active tree rows |
| Secondary ink | `#41582d` | Supporting copy and inactive metadata |
| Accent | `#ff735b` | Decorative block/underscore cursor, small active marker |
| Rule | Ink at 24% opacity | Horizontal separators and directory stems |
| Display | Supplied SVG masks | Four fixed headings and footer wordmark |
| Text | Departure Mono 1.500 | Navigation, input, commands, copy, links |
| Radius | 0 | Normal page controls and illustration |
| Shadow | None | All page components |

These colours intentionally reconcile small colour differences between generated images. Do not sample a different green for each section. Ink has approximately 10.97:1 contrast against the page, and secondary ink 5.41:1. Coral has only 1.83:1; it must not carry essential text, focus or selected state by itself.

Use a flat green foundation. The supplied 6px substrate tile adds a very faint grid. Keep it fixed in CSS pixels, not scaled with the layout; start with its embedded 0.035 opacity. It must disappear perceptually when reading. If screenshots show moiré, reduce opacity or omit the tile at that density. Do not add canvas noise, flickering scanlines or a full-screen texture image.

Use Departure Mono from the existing local font, with a monospace fallback. Load one font file, not another copy for each component. Keep existing unrelated font consumers working. Avoid synthetic bold where the font lacks a bold face; selected states can use underlines and explicit markers instead.

## 5. Heading rendering

Copy the prepared assets to a dedicated public directory, for example `public/lexis-prompt/`. Use each SVG as a CSS mask filled with currentColor, or inline its supplied path. Masks make global ink changes and footer interaction easier. External SVG loaded through an image element will not inherit the surrounding currentColor in the same way.

Each semantic heading contains real text for assistive technology and one aria-hidden visual mask. Use one h1 for the hero; the other section titles are h2. Keep the accessible text visually hidden using an established accessible clipping utility. Do not duplicate the title in accessible image alt text as well.

The hero asset already contains two lines, review two lines, and installation three lines. Preserve these arrangements on desktop. Set width and aspect-ratio; never assign a conflicting height. Do not stretch horizontally, squash vertically, apply letter spacing to the SVG, or reconstruct the text with a CSS grid font.

| Asset | Natural dimensions | Desktop maximum width |
| --- | --- | --- |
| Hero | 1157 × 366 | 1157px |
| Examples | 992 × 108 | 992px |
| Review | 954 × 315 | 954px |
| Installation | 574 × 362 | 574px |
| Footer | 759.3 × 264.3 | Full content width |

The reference-extracted assets deliberately retain their visible cell geometry. They are not a reusable alphabet and cannot supply new arbitrary headlines. Use the exact approved copy. If future copy changes, commission a new asset rather than silently falling back to another font.

## 6. Header and hero

Reference: `references/01-hero.png`.

The header shares the 75px gutter, approximately 50–75px from the top. Place a compact lowercase lexis wordmark left and GitHub ↗ / Install Lexis ↗ right. Use simple text links with visible underlines. Reuse the actual GitHub destination already configured in the repository. Install links target `#install` within this page. No sticky bar or solid overlay is needed.

The headline starts at x75/y183, about 100px below the header baseline. Its ink is 1157px wide and 366px high. Preserve its two lines, “In your” and “own words.” At the reference width the right side remains empty. This asymmetry is intentional.

The prompt row sits approximately 80–90px below the heading. Its visible baseline is around y690. Use a separate `>` at the left, then an actual single-line text input with default value `show my largest files`. Reference prompt size is about 52–58px; calibrate against the screenshot after font loading. Desktop prompt text can use clamp(28px, 3.55vw, 56px). The prompt container is transparent, borderless and full-width.

A narrow coral block follows the default text, approximately 30 × 64px in the reference. This is a decorative idle cursor. When the real input receives focus, hide it and use the native caret. Do not overlay a fake caret on selected text or mirror passwords/input content into inaccessible controls. A hidden measurement span may locate the idle cursor; it must not intercept clicks or enter the accessibility tree. Long input scrolls inside its input rather than extending the page.

A full-width rule lands around y741. Beneath it, place the proposed command at the left and the underlined Review → action at the right, with roughly 28–36px vertical padding. Default command: `du -ah . | sort -rh | head -5`. Command text is approximately 28px at 1586px. The command row is visually quiet compared with the request.

Near y884, show Install Lexis ↗ as an underlined link; below it at y933, “A smart terminal. In plain language.” Use about 25px and 22px respectively. The install action has no filled rectangle.

Review submits a known example and transfers its request/command to the lower review section, scrolls there and focuses its heading without a second unwanted jump. Enter in the prompt does the same. It does not run anything. For unsupported text, keep the entered text and show one inline message: “Try one of the examples below.” Link “examples” to that section. Do not invent a shell command or make a silent network request.

The hero's default request is a known fixture, not evidence that the website can interpret arbitrary language. Keep the visual prompt useful while retaining the honest local-demo boundary.

## 7. Examples

Reference: `references/02-examples.png`.

Heading ink begins x78/y137. Keep its single-line arrangement on desktop, width about 992px. Below it, the tabs sit around y303; their bottom rule runs across the page around y350. Tabs: Find files, Count lines, Inspect folders. Find files is the default. Place a small coral square before the active label, paired with a dark underline so colour is not the only indication.

The working area is a two-column grid: approximately 62% request/command and 32% directory illustration with a 6% gap. Left prompt starts around x75/y445. Right illustration begins near x1075/y421. Request text is about 38–42px, commands 28–32px, tree labels 28px. The left side includes an underlined “Try your own request ↗” link around y709; this returns to the hero input and focuses it, without replacing the user's text unless a fixture action explicitly does so.

Use this content contract:

| Tab | Request | Proposed command | Example output/illustration |
| --- | --- | --- | --- |
| Find files | find my Python files | `find . -name "*.py"` | `src/app.py` and `src/utils.py` |
| Count lines | count lines in main.go | `wc -l main.go` | `42 main.go` |
| Inspect folders | show this folder's size | `du -sh .` | `1.2G .` |

The first tree has root `src/`, thin stems and four rows: app.py, utils.py, notes.txt, styles.css. Highlight the first two with flat olive rectangles and pale text. Keep the other two unfilled. A small coral marker sits at the first selected branch. Stems must connect cleanly to the text rows rather than running through labels. Build this illustration with HTML/CSS or simple inline SVG lines plus real text. No generated image is required.

For Count lines, show main.go with its line count using the same tree region and baseline system. For Inspect folders, show the folder and size using the same region. These two states are specified adaptations; only Find files has an approved image. Keep them as restrained as the default, with no new chart styles or cards.

Tabs are genuine accessible tabs with arrow-key, Home and End navigation. Use roving tabIndex and connect each tab to its panel. Selecting a tab updates its request, command and illustration together. It may update the pending review fixture but must not scroll the page or steal focus. A 120–180ms opacity change is sufficient; disable it for reduced motion. Do not auto-cycle tabs.

## 8. Review

Reference: `references/03-review.png`.

Continue the pale green background. Small label “Before you run” starts near x75/y156. Heading begins x76/y253 and reads “The last word” / “is yours.” Its width is 954px and height 315px. The gap between the small label and heading is generous; do not put them into a bordered card.

The proposed command row begins near x75/y705. Prefix it with `>`, use about 44–50px for the command and append a short coral underscore. The default screenshot state is `find . -name "*.py"`; after hero submission, use that submitted fixture instead. Allow wrapping at spaces on narrow screens, preserving copied/source command bytes.

Place a rule at about y818. Below, align “Your terminal. Your decision.” left; Edit request and Run ↵ right. Actions are underlined text, not outlined or filled buttons. Keep clear separation between them and a minimum 44px interactive target height. The rule separates the command from its decisions; do not add another visible “Proposed command” label or syntax breakdown.

Remove “Match Python files”, the explanatory `"*.py"` column, “Search this folder”, and repeated “Preview only. No commands run.” statements. Their absence is intentional.

Run displays local fixture results beneath the action row with the heading “Example output”. Its accessible name should be “Run example”; the visible label can remain “Run ↵” to match the image. No OS command or remote execution occurs. Announce results once through a polite live region. Do not pretend to wait on a server with artificial multi-second loading. A simple output reveal is enough.

Edit request returns focus to the source of the pending request: the hero input if submitted there, otherwise the corresponding example tab. Changing the pending fixture clears previous output so a stale result cannot appear under a new command. Repeated Run remains deterministic and does not duplicate output blocks.

## 9. Installation

Reference: `references/04-install.png`.

Use a two-column layout at desktop. Left heading x80/y205, 574px wide, three lines: “Make it” / “your” / “terminal.” Right command area begins x745/y317, leaving a deliberate gap between the two. The right column is approximately 785px wide; account for shared gutters rather than extending it offscreen.

Under the heading, place understated text tabs “macOS / Linux” and “Windows”, around y666. Use a short underline for the selected option, no raised tab panels. Detection status sits beneath around y725. On a Mac it reads “Detected macOS”; on Linux, “Detected Linux”; on Windows, “Detected Windows”. Do not show a false desktop detection on iPhone, iPad or Android. For unknown devices use “Choose your operating system.”

The command uses about 32–36px Departure Mono, with a leading decorative `>` and small coral cursor at its end. The Unix image shows `curl -fsSL` on the first visual line and the URL/pipeline on subsequent space-based wraps. The actual command is one string. Do not insert line breaks into clipboard text just because the display wraps.

Retain these existing command forms:

- Unix: `curl -fsSL ${baseUrl}/install.sh | bash`
- Windows: `iwr ${baseUrl}/win.ps1 -useb | iex`

Use the current origin on the client, retaining the existing server fallback `https://lexis.hridya.tech`. A localhost screenshot therefore legitimately shows a localhost command; do not hardcode the reference image's host. Do not change installer contents or route behaviour.

A rule sits below the command near y450, followed by right-aligned “Copy command” around y477. Supporting copy starts around x745/y586: “Paste into your terminal.” then “Follow setup.” Place “Installation details +” around y726 and implement it with an accessible disclosure. Reuse accurate existing installer explanations inside it; do not add product claims. Hide development-origin notices inside the details rather than adding a prominent new paragraph.

### OS selection contract

Resolve the environment from navigator.userAgentData.platform when available, with navigator.platform/userAgent fallback. Classify macOS, Linux and Windows separately; both macOS and Linux map to the Unix tab. Detect mobile platforms first so an iPad reporting a desktop-like platform does not get a confident Mac label. Feature-detect optional browser APIs and keep the server snapshot neutral.

Maintain an explicit manual selection override. Displayed tab = manual override if present, otherwise detected tab, otherwise Unix as the neutral command fallback. Detection must never reset a manual selection. Renders, copying, disclosure expansion and scrolling must leave the selected tab unchanged. Avoid an effect that repeatedly assigns the detected OS to selection state.

No persistent storage is required for the manual override; preserve it for the page component's lifetime. A reload may detect again. If implementing persistence, it is an optional extension and must not be confused with the requirement to initially detect the visitor's actual OS.

On initial hydration, reserve enough height for the detection label and command to prevent large jumps. Do not read navigator during server render or suppress hydration warnings to conceal divergent text. A small external-store hook with a stable server snapshot or a mount-time detection state is sufficient; no device-detection package is needed.

### Clipboard states

Copy exactly the active command, excluding the prompt and cursor. Show “Copied” for approximately two seconds, then restore “Copy command”. Clear timers on unmount and selection change. If clipboard access fails, show “Select and copy the command.” Keep the command selectable and do not claim success. Announce feedback politely without moving focus. Selecting another OS must immediately clear stale “Copied” feedback.

## 10. Footer

Reference: `references/05-footer-composition.png`. Do not regenerate this concept or introduce another footer direction.

Preserve the quiet sign-off: `> your move_` at upper left, Install Lexis ↗ below it, GitHub ↗ / Privacy / Terms arranged as a sparse upper-right group. Leave meaningful open green space between these controls and the wordmark. Place “A smart terminal. In plain language.” just above the large lowercase lexis at the bottom.

The original image's wordmark was cropped and appeared compressed. The user's correction was to stop squeezing it. Use the supplied full, naturally proportioned cell wordmark at an aspect ratio of 759.3 / 264.3. At a 1436px content width its height is about 500px. Do not constrain it to a 250px slot or stretch it to fill a short footer. This full wordmark is a deliberate adaptation, not an exact extraction from the cropped reference.

Suggested desktop spacing: 100–140px top padding, a 180–240px quiet gap after the upper controls, tagline with 28–40px bottom gap, wordmark, then 30–60px bottom padding. At narrower widths reduce the quiet gap, while retaining natural logo proportions. The footer is the page's final large visual, so it does not need another headline or CTA panel above it.

Optional interaction, only after the static layout passes: on a fine pointer, reveal a restrained lighter olive highlight through a 100–160px radial mask following the pointer over the wordmark. Clip it to the existing glyph shape. The letters remain fully legible, stationary and dark enough. Use at most one duplicate mask overlay, not thousands of animated DOM cells. Pointer leave fades the overlay out over 180ms. Disable this treatment for reduced motion and coarse pointers. No particle explosion, deformation, sound, spring displacement or recurring animation.

The footer prompt can carry the same tiny coral idle cursor as the hero. Never place a giant orange key or install button here. Keep Privacy and Terms linked to their current routes. Legal pages can use a compact footer variant so their shared import does not suddenly append this entire oversized homepage composition.

## 11. Responsive rules

Use content-driven breakpoints. The following sizes define acceptance cases rather than a device taxonomy.

| Width | Gutter | Main adaptation |
| --- | --- | --- |
| 320–599 | 20px; 16px at 320 if needed | Single-column sections, scaled artwork, wrapped actions |
| 600–899 | 32px | Comfortable stacked examples and install; larger type |
| 900–1279 | 48px | Two-column examples when content fits; install may remain stacked until 1024 |
| 1280–1585 | Fluid toward 75px | Scale major reference geometry within container |
| 1586+ | Centred 1436px maximum | Preserve measured desktop design |

Hero: keep the supplied two-line title, full available width. At 390px with 20px gutters it is about 350 × 111px. Header links use 14–16px, with 16–24px separation; allow a second header row at 320px rather than overlapping the logo. Hero prompt uses at least 22px and the editable input at least 16px. Stack command and Review if they cannot share a line. Use 48–64px between major groups, with 80–100px section padding instead of reference-sized desktop gaps.

Examples: the single-line heading becomes small at mobile, about 350 × 38px at 390. This is acceptable as a section title and preserves exact artwork; do not stretch it taller. Keep tabs on one row only if their labels fit at 14px with adequate targets; otherwise use a horizontally scrollable tablist with a visible affordance, no clipped active tab. Stack the tree below the request and command with a 40px gap. The illustration is normal content, not a background that disappears on mobile.

Review: supplied two-line title scales to approximately 350 × 116px. Command uses 22–26px, wraps safely at spaces and can expose internal horizontal scrolling only as a last resort for unbreakable user content. Put the supporting sentence above the action row when needed. Keep Edit and Run separate; neither should become a full-width filled button.

Installation: stack heading, tabs/detection, command/copy, setup copy, disclosure. On mobile cap the heading around 330px wide while preserving all three lines. Use 18–22px command type and allow visual wrapping of long URLs. A URL may break anywhere in presentation without adding clipboard bytes. Copy stays easy to find immediately beneath the rule. Do not hide the Windows option.

Footer: use the full available width wordmark, never a fixed 500px height. At 350px wide it is about 122px tall. Keep the upper prompt and navigation in two columns when possible; stack at 320 if necessary. Reduce the central quiet gap to roughly 80px. No horizontal overflow, right-edge clipping or hidden links.

At 200% zoom all content must remain reachable and controls must not collide. Do not use body overflow-x:hidden to conceal layout failures. Test command containers and grid children with min-width:0. Heading assets should scale through width and intrinsic aspect ratio rather than transform:scale.

## 12. Motion and accessibility

Default animation is limited to the idle cursor, tab content changes, output reveal and optional footer highlight. No scroll-jacking, pinned sections, entrance choreography or animation library is required.

The idle cursor may blink at roughly 1.1 seconds using a discrete step. Stop blinking after a short interval or keep it steady when focus is elsewhere if perpetual motion feels distracting. Reduced motion uses a steady cursor and instant content changes. Never flash full sections.

Use native links for navigation and buttons for actions. Underlining is visual styling, not a reason to turn a button into an anchor. Preserve open-in-new-tab and modifier-key behaviour on normal navigation. In-page focus transfer should happen only for a deliberate section-navigation action.

Provide a visible dark olive 2px focus outline with 4px offset. Keep at least 44 × 44px targets through padding without changing the apparent lightness of text links. Preserve selection and copy of commands. Do not rasterize UI text into screenshots. Do not trap keyboard focus in the prompt or tablist.

The page needs one main landmark, a labelled footer navigation, one h1 and logical h2 sections. Announce copy/error/output states once. Decorative `>`, cursor and tree connectors should be aria-hidden where equivalent semantic text is present. Focus targets can use tabIndex=-1. Never use positive tabIndex.

## 13. Implementation boundaries

The inspected repository uses Next 16.2.1, React 19.2.4 and CSS modules. Read the local Next documentation before editing: `node_modules/next/dist/docs/`. The CSS guide is `01-app/01-getting-started/11-css.md`. Follow repository instructions and preserve unrelated working-tree changes.

| Existing file | Expected work |
| --- | --- |
| `app/page.tsx` | Compose hero, examples, review, install and footer; remove process/closing from homepage |
| `components/lexis-lcd-hero.tsx` | Flat prompt and native editable input; remove physical key/disclosure duplication |
| `components/lexis-example-selector.tsx` | Flat tabs, fixture content and directory illustration |
| `components/lexis-command-review.tsx` | Pale surface, simplified command/actions, local example output |
| `components/lexis-install-console.tsx` | Flat command, OS detection/manual override, retained copy/disclosure behaviours |
| `components/lexis-lcd-sections.tsx` | Homepage footer; preserve compact legal-page use |
| `components/lexis-section-anchor.tsx` | Reuse focus/scroll behaviour; preserve native link modifiers |
| `app/lexis-lcd.module.css` | Hero/shared substrate and type rules |
| `app/lexis-lcd-sections.module.css` | Lower section layouts and responsive rules |
| `app/lexis-material.module.css` | Remove homepage consumers; delete only after checking all imports |
| `app/layout.tsx`, `app/globals.css` | Ensure legacy theme bootstrap/dark body cannot override approved marketing surface |
| `app/privacy/page.tsx`, `app/terms/page.tsx` | Verify readability and footer use; preserve legal prose |

A small shared client owner may hold the pending fixture, its source, and review output state for hero/examples/review. Keep fixture definitions in one typed module if sharing avoids duplicated command strings. No global store, context framework, schema engine, event bus or generic terminal renderer is necessary. Keep install selection and clipboard state local to installation.

Suggested state shape: pending fixture identifier, source (`hero` or `examples`), hero input text, selected example identifier and whether review output is visible. Derive commands from the fixture, not separately mutable request/command pairs. Include the three lower examples and the hero largest-files fixture. Accept the previous “list all python files” wording as an alias if retaining existing demo behaviour. Normalize case and repeated spaces only for matching; preserve what the visitor typed in the input.

Do not mutate files under `lexis/`; the working tree contains unrelated terminal-product edits and new modules there. Do not reset, stage or delete unrelated files. Existing old design documents/assets are historical material; remove old runtime imports only when their consumers have been checked.

## 14. Visual calibration and acceptance

Render after the font has loaded. Compare each section at 1586px wide against its corresponding image, with the top of that section aligned to the top of the reference. Use a temporary isolated section route or screenshot crop if helpful; do not add permanent product UI for visual comparison.

Match in this order: background and heading geometry; shared gutters and vertical relationships; text sizes and line breaks; rules and control alignment; cursor and texture. Tweaking micro-details while the heading scale is wrong is wasted effort.

At the reference width, aim for major anchor positions within about 8px and heading dimensions within 2% of the specified measurement. These are practical implementation targets, not measurements of an already completed site. Footer geometry and responsive arrangements follow the explicit adaptations above. Colours should use the exact tokens rather than trying to imitate JPEG-like noise from the image generation.

Capture 1586, 1280, 768 and 390px screenshots; inspect 320 and 1920 as boundary checks. Review one full-page desktop image for pacing and section continuity. Then inspect each section close-up for type rasterization, cell integrity, rule alignment and cursor placement. Verify with the reduced-motion preference and at 200% zoom.

Functional acceptance: known hero submission reaches the correct review command; unknown input shows useful inline feedback; tabs update their three linked outputs; Run reveals labelled fixture output; Edit returns to the correct source; OS detection selects the correct tab; manual OS selection survives rerenders; clipboard bytes match the active command; failure feedback is honest; all links resolve; privacy and terms remain readable.

Do not declare fidelity based only on tests, screenshots that were never opened, or a build exit code. Inspect the rendered output. Record deliberate deviations and remaining limitations in the implementation handoff.

## 15. Completion boundaries

This specification delivers reference images, prepared vector display assets, the local font and licence, a proof page, implementation instructions and verification criteria. It does not claim the application has been rebuilt or tested against this design. The proof page demonstrates asset shape and proportions; its spacing is not the final website layout.

No Blender scene, generated hardware image, 3D renderer, shader, stock photograph or external icon asset is needed. The remaining graphics are native text, rules, a directory tree and small cursor rectangles. Implement these directly so they remain sharp and accessible.
