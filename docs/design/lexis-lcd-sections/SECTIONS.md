# Lower-section design and behavior specification

Approved scope: sections 2–6 only. The implemented hero is the starting point. All coordinates below refer to each section's standalone reference canvas of approximately 1586×992. They are visual measurements, not a requirement for fixed-height sections. Exact raster edges vary; use the images as the visual authority.

## Shared system and page composition

Use the existing `.page` wrapper and its local font variable. Its palette is already defined: light green `--lcd-paper/#c7e6a5`, highlight `--lcd-paper-hi/#d0edb0`, low `--lcd-paper-lo/#c1e39e`, olive ink `--lcd-ink/#18250e`, screen text `--lcd-screen-ink/#b9dd93`. Preserve these values unless a narrow lower-section override is necessary. Do not modify hero tokens to solve a lower-section issue.

Match pale green fine LCD grid, rectangular segmented headline pixels, mono UI text, shallow brushed silver, inset olive displays, and coral physical controls. Keep lower headings smaller than the hero. The grid continues through light sections; avoid a differently phased grid restarting at every boundary. Give the dark section its own matching grid layer.

At a 1586px viewport, use a maximum inner width of 1480px and about 53px outer margins, centered in a 1586px content frame. Existing lower content has a 1380px cap; replace that wrapper rather than squeezing these wider designs into it. Full-bleed color bands span the viewport; content stays centered.

Use document flow, intrinsic heights, and generous padding. Starting desktop block paddings are 100–140px at top, 80–120px at bottom, with 60–90px between heading and main instrument. Do not stack five mandatory 992px-high sections simply because the source images have equal dimensions. At native desktop width, target roughly 800–950px for process/examples, 850–1000px for review, 750–900px for installation, and 850–1000px for the closing/footer. These are composition guides; text zoom and responsive needs may increase height.

Each section should end with enough space that its CTA does not visually belong to the next heading. No separator between every light section. The dark review band is the main page-level contrast. Do not add section-number badges, repeated page navigation, bento cards, fake metrics or scroll-hijacking.

### Typography

The existing hero pixel mask is specific to “In your own words.” Do not stretch or repurpose it for other headings. New headings need their own visible text treatment: author SVG masks using the same rectangular pixel construction, or render the local Departure Mono at a suitable scale with a carefully aligned pixel-cell cutout pattern. Choose the former if the font silhouette cannot match the approved references. Each h2 must retain a real accessible text string even when its visual lettering is a mask.

New headline artwork is an implementation task, not already supplied in the hero SVG kit. Compare its stroke thickness, x-height and line lengths before approving. Use the reference for shape; do not substitute an ordinary smooth sans or retro seven-segment display. Lower titles vary around 88–115px at reference width. Supporting/terminal copy is about 24–38px; explanations can be 20–24px. Clamp body text to at least 16px on compact screens. No synthetic bold on the pixel mono face.

The shared silver treatment is front-facing. Border radii are modest, around 16–22px on large panels and 8–14px on inset screens. Screws are 24–28px desktop, approximately 12px compact. Highlight ridge, grain and dark lower edge create millimeters of depth; avoid heavy extruded chassis or cinematic shadows.

## Section 2: from intent to command

Reference: `../lexis-lcd/section-concepts/02-how-it-works.png`.

Anchor: `id="workflow"`. h2: `A thought becomes a command.` Visual lines: `A thought becomes` / `a command.`

The main diagram is a single continuous horizontal metal instrument, not three independent cards. It explains a pipeline with human language on the left, command on the right, and a final return key. The annotations belong to those exact parts.

### Reference geometry

- Heading: x56, y144, width about900, height190.
- Supporting line: x925, y305, width610: “Describe it. Read the plan. Decide what runs.”
- Metal strip: x53, y412, width1480, height132.
- Input recess: x117–696, y437–520.
- Transition bridge: x697–794, a narrow silver piece with right arrow.
- Command recess: x795–1273, same vertical alignment as input.
- Coral key: x1290–1467; two screws at the outside ends.
- Three annotation stems begin directly beneath the strip around x150, x820 and x1380, ending near y613.
- Annotation text starts near y632, with labels larger/bolder than explanatory sentences.
- “Try an example ↗” action: x60, y790, about320×73.

### Copy

Input: `list all python files`.
Command: `find . -name "*.py"`.
Annotations: “Your intent” / “Use the words you already know.”; “The proposed command” / “See the command before it runs.”; “Your decision” / “Keep the final say.”

Use leader lines once per annotation. The generated image has a doubled line beneath the key; treat that as an image artifact and implement one clean leader.

### Behavior

This is primarily an explanatory diagram. Do not make a second freeform task input here. The dark input and command are selectable HTML text. “Try an example” navigates to `#examples` and focuses the example heading or selected tab. The coral return key can activate the same navigation; name it “Try this example.” If it is decorative instead, it must not have hover/press states or a keyboard stop. Prefer the actionable version because its shape is strongly button-like.

Use the existing silver/green material vocabulary, but create the additional central bridge locally. A single flexible CSS grid can express left display / bridge / command display / key. Keep screws outside the display tracks.

### Responsive

Below about900px move the supporting sentence below the heading. Below700px stack input and command displays with a downward transition arrow, keeping a consistent thin silver edge. Move annotation labels immediately under their relevant display and remove long leader lines. Put decision/key together on the last row. Preserve process order in DOM. Do not shrink the shell command below16px to maintain a horizontal assembly. Target 20–24px gutters and minimum44px key hit area.

## Section 3: example selector

Reference: `../lexis-lcd/section-concepts/03-example-tasks.png`.

Anchor: `id="examples"`; optionally preserve `id="studio"` on an inner anchor for old links. h2: `What needs doing?`

The open tab line, pixel file tree and command display form one composed section. They are not separate product feature cards.

### Reference geometry

- Heading x55, y137, width about1100, height120.
- Tabs top y313; labels at x55, x590, x1144. Baseline y373, x55–1533.
- Selected coral square near x146,y358, about30×28. This is the active indicator, not a decorative floating pixel.
- Pixel folder x59,y443, about165×123; file-tree region extends to x462,y815.
- Command instrument x536,y482, width998,height207.
- Dark screen x590,y516, width750,height147; coral key x1360,y517,110×146.
- “Preview example” label/link x551,y707.
- Bottom sentence x55,y888: “Start with the task. Let Lexis work out the syntax.”

### Tab content contract

| Tab | Request | Command | Illustration |
| --- | --- | --- | --- |
| Find files | `list all python files` | `find . -name "*.py"` | src tree, app.py and utils.py selected; notes.txt unselected |
| Count lines | `count lines in main.go` | `wc -l main.go` | main.go file; sample numbered rows, no fabricated project data |
| Inspect folders | `show this folder's size` | `du -sh .` | folder icon, small child entries, total marked as an example |

The first tab is selected initially and matches the reference. Other tab illustrations are designed adaptations; keep their footprint and visual density close to the first. Sample file names represent examples, not access to the visitor's filesystem.

Use a real accessible tablist, roving tabIndex and Left/Right/Home/End behavior, with associated tabpanel. Activating a tab changes request, command and illustration together and clears stale review/simulation feedback. No network request or fake loading animation. Reserve enough panel height that switching tabs does not yank the page.

“Preview example” and the coral key open a local inline disclosure below this instrument. It shows the selected command, explanation and a clear “Website preview. Nothing runs on your computer.” notice. It may offer Copy and Simulate; simulation output must be marked “Example output.” Do not remotely drive the hero's state or borrow its DOM IDs. Each demo owns its own state and unique IDs.

Illustrations should use SVG rects/paths or semantic file-tree HTML, not an icon font with smooth generic folders. Cells should resemble the headline's square pixels, with small gaps. Use dark selection strips only for matching files. Expose a short accessible description; decorative connector paths are hidden from assistive technology.

### Responsive

Tabs remain available in one horizontal row if they fit; otherwise allow horizontal scrolling of the tab strip only. Maintain visible focus and minimum44px targets. At ≤700px put the file illustration above the instrument, reduce it to roughly160–220px height, and use a two-line command display. Keep the coral key at least50×50 rather than retaining the very tall desktop ratio. Bottom supporting copy wraps normally. The page itself must not acquire horizontal overflow.

## Section 4: review before running

Reference: `../lexis-lcd/section-concepts/04-command-review.png`.

Anchor: `id="review"`. h2: `The last word is yours.` Visual lines: `The last word` / `is yours.`

This is a dark green LCD band, not a black CRT section. Ground around #14260f, pale pixel text around #c1e5a0, faint matching grid. It remains dark in both global themes. Silver stays legible; avoid filtering all child text/buttons darker.

### Reference geometry

- Heading x74,y111, width1000,height270.
- Supporting line x74,y407: “Review the command before you run it.”
- Review plate x462,y467, width1053,height385, offset right.
- Inset screen x527,y495,width925,height233.
- “Proposed command” x576,y530; command x575,y565.
- Command annotation brackets under `find .` and `"*.py"`, around y627.
- Explanations at y673: “Search this folder” and “Match Python files.”
- Lower metal action shelf y739–850; “Edit request” x992,y753,about258×80; coral “Run ↵” x1274,y753,about180×80.
- Bottom-left small sentence x75,y905: “Your terminal. Your decision.”

Command is exactly `find . -name "*.py"`. Use two inline spans as the annotation anchors; do not hardcode leader X coordinates that become wrong when the font loads. Screen DOM can use a small CSS grid for command chunks and their descriptions. Keep the entire command copyable as a single string independently from annotations.

### Behavior and honest labels

This panel illustrates reviewing a command in the terminal. Include a small “Interactive preview” label near the actions or on focus/activation; the production website cannot imply that its Run button executes a real shell command.

“Edit request” scrolls to `#examples`, focuses the selected tab, and does not overwrite the hero input. “Run ↵” triggers a labeled simulation in this panel. On activation, replace the annotation area with “Example output” and a short sample list such as `./src/app.py` and `./src/utils.py`; show “No commands ran on your computer.” Keep plate size stable, change the action to “Reset preview,” and make reset restore the reference state. Announce completion politely once. No artificial progress bar, backend call or risk-free/security promise.

The initial Run label may remain faithful to the artwork, but its accessible name should be “Simulate running example command,” and the nearby preview notice must be visible before action. Never rely on a tooltip alone to communicate simulation.

### Responsive

At ≤1000px align the plate to the content gutter rather than forcing a large left offset. At compact widths place heading, support, plate and closing line sequentially. The plate becomes full width; input command may wrap after a logical space; annotations turn into stacked label/value explanations rather than tiny crossing leader lines. Put actions side by side only if both meet44px targets and readable labels; otherwise stack them. Maintain dark surface to viewport edges.

## Section 5: installation console

Reference: `../lexis-lcd/section-concepts/05-installation.png`.

Anchor: `id="install"`. h2: `Make it your terminal.` A real installation section replaces the old plain installation block; the implemented hero's dialog remains as-is.

### Reference geometry

- Top-right supporting line x1053,y167: “Install Lexis. Then start with a task.”
- Heading x57,y205,width about1150,height100.
- Engraved tabs at y390–442: active macOS/Linux x121–447, Windows x448–752.
- Silver body x56,y432,width1478,height234.
- Screen x118,y474,width1154,height160.
- Coral Copy key x1293,y477,width179,height157, with copy glyph above label.
- Three instruction labels at y723: x60, x587, x1216.
- Bottom link x61,y865: “View installation instructions ↗”.

The tab strip looks cut from the same shallow silver plate. Active tab has the same material as body and no visible seam at its base. Inactive tab is slightly darker and sits visually behind the plate. Do not use rounded colored web pills or OS brand logos.

### Real command values

Default selected tab: macOS / Linux. Preserve current-origin behavior already used by the hero. Server fallback is `https://lexis.hridya.tech`.

- Unix: `curl -fsSL ${baseUrl}/install.sh | bash`
- Windows: `iwr ${baseUrl}/win.ps1 -useb | iex`

The reference visually wraps after `curl -fsSL`. That must not become a newline in the value passed to clipboard. Use one command string, CSS wrapping and optional wbr elements. Never copy textContent that includes OS labels, Copy label, line numbers or explanatory annotations. At localhost, keep the current convention and clearly label the local URL when necessary; do not silently hardcode production just to match a screenshot.

Use accessible tabs with associated panel. No auto-selecting Windows during hydration that makes screenshots jump. User can select explicitly. On tab change, clear copied/error feedback and preserve keyboard focus. Native Copy button awaits clipboard.writeText; success changes the label to “Copied” for approximately2s, then restores it without resizing the key. Clipboard failure displays “Couldn’t copy. Select the command to copy it manually.” The command remains selectable.

Instructions: “1. Copy the command”, “2. Paste into your terminal”, “3. Follow setup”. These numbers explain order and are not decorative section stamps.

“View installation instructions” expands a local native details block with separate macOS/Linux and Windows guidance, plus links to the repository README and existing installer endpoints. Do not invent a new docs route or point back to an inert #. Follow setup behavior observed in current project documentation; do not promise unsupported installation prerequisites.

### Responsive

On tablet, allow support line below heading. Keep both tabs readable. At ≤700px the screen and Copy action stack within one metal perimeter, or Copy becomes a compact square to the screen's right only when the command has adequate width. Prefer a stacked layout to a 10px command. Minimum command size16px, break URL at safe opportunities visually; copied text remains intact. Stack the three instructions in order with16px gaps. Touch target for Copy ≥50px high.

## Section 6: closing and footer

Reference: `../lexis-lcd/section-concepts/06-closing.png`.

Anchor optional `id="get-started"`; do not create a second install ID. h2 `Your next command starts with you.` Visual lines `Your next command` / `starts with you.`

### Reference geometry

- Headline x69,y148,width1450,height325.
- Main dark CTA x70,y560,width667,height135. Larger than hero CTA, with very subtle angular corners and inset LCD edge.
- Supporting sentence x74,y729: “A smart terminal. In plain language.”
- Large coral return key on silver base x1050,y528,width468,height232.
- Fine footer divider x70–1517,y866.
- Wordmark x70,y891,about110×42.
- Footer links x1147–1517,y905: GitHub, Privacy, Terms.

Keep the return key front-on. No floating keys, keyboard scene or decorative wiring. The right key is the final punctuation of the composition, not a different product illustration. Use a proportionate silver socket around it, with a large dark return arrow. The coral face can be rebuilt from existing key gradients at this size; do not scale a tiny raster.

Both the dark CTA and large coral key link to `#install`; arrow accessible name “Go to installation.” If reduced motion is requested, jump rather than smooth scrolling. A decorative key is possible, but then it must not look pressable on hover or enter the tab order. Prefer consistent actionable semantics.

Footer uses the existing lowercase sans wordmark and real routes: GitHub remote, `/privacy`, `/terms`. Add the existing LexisThemeToggle as a quiet fourth control, with spacing adjusted to fit; it must not cover links. This is a functional addition to the raster to preserve existing theme access. There is only one footer. Do not invent a newsletter, copyright date, social accounts or tracking badge.

### Responsive

At ≤900px reduce headline size and let the second line wrap only if unavoidable. At ≤600px use two or three intentional lines, keep the CTA full available width up to360px, and place the key below or beside it at about160×90px. Do not preserve a 468px key at mobile width. Footer wraps into brand row and links/theme row, with44px hit areas. Let content height grow rather than clipping the footer.

## Cross-section interaction and state

The existing hero remains self-contained. Do not control its modal by querying a private dialog DOM node. New lower CTAs use a real `#install` anchor. Lower demos have isolated state; selected example in section3 need not silently change section4, whose fixed example is a separate explanation. This avoids surprising updates in another part of the page.

Reuse small, proven material primitives where two sections genuinely need them: metal frame skin, coral key face, display typography and font sizing. Do not build a configurable “instrument engine.” Different panel layouts should remain explicit. A shared display component earns its existence only if it hides repeated real layout/material work.

Motion is sparse: coral key press1px/100ms, tab indicator movement100–150ms, optional short opacity transition on selected example. No typing loops, auto-rotating tabs, parallax, scroll pinning or sound. Reduced motion disables movement. Buttons have static hover/focus feedback; color alone does not communicate selection.

## Acceptance criteria

Match references by section at 1586px width, then inspect the actual continuous page. Preserve the existing hero's before/after screenshot. Main section gutters should align within4px; large panel bounds within about8px; headline line breaks and dominant width within about2%. Fine generated pixel irregularities are lower priority than silhouette, typography scale and material proportions.

Test 1586×992 section views, full-page desktop, 1280×720, 768×1024, 390×844 and320×740. Test light and global dark, and confirm section4 stays dark in both. At200% zoom no content or control should be unreachable. No horizontal page overflow; tab strips and native inputs may scroll locally.

Keyboard: meaningful tab order, tablist arrow/Home/End keys, no global Enter interception, visible focus on coral keys and links, copy feedback announced once. Reduced-motion setting respected. Browser demo never executes code. Install copied strings equal original command strings byte-for-byte and contain no newline from visual wrap. Legal and existing hero install dialog still work.

Run lint/build and report real results separately from visual comparison. Capture initial and selected-tab/review/copy states. Report remaining differences rather than calling a compilation success “pixel-perfect.”
