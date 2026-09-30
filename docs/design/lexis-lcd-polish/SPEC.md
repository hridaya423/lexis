# Lexis: visual repair specification

Status: implementation handoff, based on inspection of the running website on 19 September 2026. This document specifies changes; it does not claim they have been implemented or visually validated. Evidence is captured from localhost:3210. Desktop baseline is 1586 × 992 CSS pixels, mobile baseline 390 × 844.

## 1. Direction and scope

Keep the approved LCD direction: pale celery surface, olive pixel lettering, restrained coral controls, recessed terminal glass, machined silver housings. Keep the section order and working interactions. The hero composition is already close. Refine its material alongside the rest of the page; do not rebuild its layout or replace its headline with a different aesthetic.

The repair must make the page feel like one deliberately manufactured instrument. At present, its panels have different constructions, its background competes with content, and its sections repeat the same visual emphasis. The solution is consistent material construction, a quieter surface, stronger hierarchy, and responsive layouts designed around readable content.

This specification supersedes conflicting visual instructions in `../lexis-lcd-sections/`. Those documents remain useful for content and interaction requirements. The original hero handoff remains historical reference, not a plan to rerun. Do not delete working behaviors to match a static image.

Reference authority, in order:

1. User-approved hero `../lexis-lcd/reference.png` for material and overall identity.
2. Approved lower images in `../lexis-lcd/section-concepts/` for the distinctive composition of each section.
3. This document for continuous-page rhythm, mobile adaptation, material consistency, and corrections to the current implementation.

The reference images are individual artboards. Their complete top and bottom whitespace must not be mechanically stacked into a webpage. Preserve the objects and their relationships while fitting them into a coherent scrolling composition.

## 2. What the live audit found

| Finding | Evidence | Implementation cause / repair location |
|---|---|---|
| Hero geometry is substantially faithful; its key and rail still look more diagrammatic than the reference | `evidence/hero.png` | Existing hero SVG rail slices and key asset; preserve their geometry, refine their surface |
| Lower metal looks like broad horizontal bands; corners look flattened and glass rims lack depth | `evidence/workflow.png`, `review.png`, `install.png` | `.metal`, `.metal::before`, `.screen`, `.coral` in `app/lexis-lcd-sections.module.css` |
| Background grid is visually insistent across the entire page, particularly dark mode | `evidence/desktop-full.png`, `dark-full.png` | Page grid and dark-band texture; reduce contrast rather than changing the concept |
| Workflow labels do not share the alignment of the objects they explain | `evidence/workflow.png` | `.procNotes` column starts differ from leader/text starts in the reference |
| Examples active-tab marker is visibly clipped at the baseline | `evidence/examples.png` | `.exTabs` scrolling overflow and negative marker position |
| Folder resembles a sloping wedge; tree lacks reference's generous folder silhouette | `evidence/examples.png` | `icon-folder.svg`, folder aspect ratio and root layout |
| Review command is undersized relative to its glass window; annotations are brackets over labels rather than anchored under command tokens | `evidence/review.png` | `.revCmd`, `.annBody`, `.revZone` |
| Review disclaimer is low contrast on silver and competes with the controls | `evidence/review.png` | `.revPreviewTag`; move to a dedicated readable line |
| Installation support copy floats above/right of the heading; tabs look like cut paper trapezoids | `evidence/install.png` | Absolute support positioning, clipped tab shape, missing edge construction |
| Closing key is striped across the coral face | `evidence/closing.png` | Broad metal pseudo-element overlays descendants; key asset also needs material consistency |
| Mobile workflow wastes width, truncates its meaning, and puts vertical lines through label text | `evidence/mobile-workflow.png` | Mobile grid reserves unused columns; desktop decoration survives the stacked layout |
| Mobile review loses its rounded manufactured edges and reduces screws to tiny dots | `evidence/mobile-review.png` | Material dimensions derive from global viewport scale `--u` without physical minimums |

These are observed visual findings. Other widths and interaction states listed below are acceptance work for the implementing model, not claimed test results.

## 3. Shared material: first and highest-priority work

### Construction

Use one material recipe for hero, workflow, examples, review, installation, and closing socket. Existing hero assets can remain if their surface is brought into agreement with the shared recipe. Do not build a generic component framework. Shared CSS material classes and a small decorative asset set are sufficient; content layouts remain section-specific.

Every housing must show these layers, outside to inside:

1. Contact shadow: narrow dark contact beneath the object, plus a soft shallow cast shadow.
2. Outer silhouette: continuous dark silver edge, darkest at bottom/right.
3. Rolled bevel: bright thin upper/left lip, midtone sidewall, restrained lower reflection.
4. Broad satin face: predominantly neutral silver with subtle horizontal grain.
5. Aperture rim: a distinct machined border surrounding the glass or key socket.
6. Recess: black/olive interior lip, darker at top, with a narrow lower reflection.
7. Glass or key face, each with its own material. Neither inherits the metal texture.

The critical distinction is between the housing face and its edges. Increasing stripe contrast does not add depth. The housing should read as metal at thumbnail size, before grain is perceptible.

### Starting dimensions and colors

These are tuning targets, not measurements of the raster's exact colors. Judge rendered output against the reference.

| Property | Desktop target | Mobile target |
|---|---|---|
| Outer housing radius | 20–22px | 14–16px |
| Total visible outer bevel | 5–7px | 4–5px |
| Glass aperture radius | 12–14px | 9–11px |
| Aperture rim + recess | 5–7px | 4–5px |
| Screw face diameter | 26–28px | 14–16px |
| Coral face radius | 11–13px | 9–11px |
| Key socket width around face | 5–7px | 4–5px |
| Housing contact shadow | 0 2px 2px, olive-black at ~30% | 0 2px 2px, ~25% |
| Housing cast shadow | 0 5px 8px, olive-black at ~15% | 0 3px 5px, ~14% |

Metal face: approximately `#afb2ae` through `#d5d7d3`; bright lip `#eff0e9`; dark edge `#5d655b`. Keep the broad face's value variation small. Use broad light transitions, not repeating light/dark ridges.

Glass base: approximately `#101b0c`, with a restrained lower/central olive lift toward `#233219`. Screen text approximately `#badb96`. Top inner shadow should make glass feel below the face; a luminous bottom border must not make it appear to float above it.

Coral: upper face approximately `#ff7962`, main `#f96952`, lower side `#c84b39`; warm dark edge `#583c2c`. Maintain the reference's saturated coral rather than the current muted salmon. Use one small upper highlight and a darker lower side. No metal grain, scanline overlay, heavy gloss stripe, animated shine, or bloom on the key face.

### Grain and compositing

Replace the two regular 6px/9px stripe patterns in `.metal::before`. Use fine horizontal irregular grain with most variation below 3% luminance. A small deterministic SVG texture or CSS background asset is sufficient. Keep it at native density when the panel changes size; do not stretch the texture with the whole panel.

Texture belongs to the exposed metal face only. Put the face texture behind child apertures and controls, or mask it to the exposed face. Explicitly verify the closing coral key is completely free of silver stripes. Texture must not affect text, glass, buttons, focus outlines, or screws.

Keep screen texture subtler still: a faint matrix below text rather than an overlay that scratches through glyphs. Avoid multiplying the page grid, screen grid, and grain into visible moiré. Inspect at 100% browser zoom and device pixel ratios 1 and 2. Prefer the simpler surface if detail aliases.

Screws should resemble shallow countersunk fasteners: silver rim, dark inner boundary, shaded slot. Use the existing hero screw as the starting point. The current large CSS plus sign looks like a UI icon. Do not make all fasteners more prominent to compensate for missing edge depth.

### Asset decision

No Blender or runtime 3D is required for this frontal design. Use CSS for responsive geometry and live controls, SVG for fixed decorative details, and existing pixel masks for headings. Do not render the entire terminal as a raster image with text baked in.

Before touching every section, make a local material proof showing: hero rail, two-window workflow rail, review plate, small key, and closing key. Show all on both page backgrounds, at desktop and mobile dimensions. It must use the actual proposed production material rules. Save screenshots and compare with the approved raster crops. Only propagate the material after the edges, glass, key socket, and grain read correctly together.

Required outputs from that pass: shared material rules; any revised decorative SVGs; an asset manifest with dimensions and consumers; material-proof screenshots. This audit does not supply replacement assets, and no unproduced asset should be marked ready.

## 4. Page rhythm and typography

Keep one 1480px content width at the 1586px baseline, with 53px outer gutters. For smaller screens use 20–24px gutters. Do not scale every physical dimension by `--u`: layout widths can be fluid; bevels, touch targets, body copy, and screws need minimum sizes.

Keep the hero's existing headline width and two-line composition. It is the loudest moment. The review band is the second emphasis. Workflow and installation explain; their headings should not compete with the hero. Closing resolves the page.

Use these initial desktop targets:

| Section | Heading visual width | Main composition spacing |
|---|---:|---|
| Hero | retain ~1202px | preserve existing geometry |
| Workflow | ~900px, two lines | 56–72px heading-to-rail; 64–76px rail-to-label baseline |
| Examples | ~1040–1100px, one line | 56–64px heading-to-tabs; 48px tabs-to-content |
| Review | ~940–1000px, two lines | 32px heading-to-support; 40–48px support-to-plate |
| Installation | ~1050–1120px, one line | support below heading; 40–48px to tabs |
| Closing | ~1280–1380px, two lines | 64–80px heading-to-actions |

Use shared spacing values 16, 24, 32, 48, 64, 80, 112px. Begin with 96–112px section top space and 64–80px bottom space. Adjacent light sections should have 144–176px from the previous section's final content to the next heading, not two independently inflated blank artboard margins. Avoid fixed viewport heights. Aim for roughly 10–15% less total page height than the current page as a diagnostic, not a hard requirement that permits cramped content.

At 1586px: body/support 24–26px, quiet captions 18–20px, controls 24–28px, primary terminal copy 32–38px. Review command can be 46–50px. On mobile: body 16–18px, captions at least 14px, commands 16–18px, controls 16–18px. Do not force paragraph wrapping with manual spaces.

Keep Departure Mono for interface and command text. Preserve pixel headline masks, but correct obvious glyph inconsistencies against the approved images when practical. Do not add distortion or random missing pixels. Current hero `y`, `w`, and `s` are approximations; their refinement is secondary to material and responsive defects. Keep semantic heading text separate from decorative masks.

Reduce page-grid contrast by an initial 25–35% from the current implementation, keeping its approximately 6px pitch. This is a tuning proposal. The reference still has a visible grid; do not remove it. Dark-mode grid requires a larger reduction if it remains the first thing noticed. Preserve one continuous grid origin across adjacent light sections. The review band may have its own origin and a darker surface.

## 5. Section repairs

### Hero

Keep layout, live input, review behavior, navigation, CTA, and dialog. Match the coral/socket recipe above and make the rail's face agree with the lower housings. Preserve the small rail-to-command gap. Give shell pipes visible inline breathing room; the current command visually runs into its pipes. Prefer `gap` or deliberate nonbreaking segment spacing without changing copied command bytes. Do not shrink the hero simply to shorten the page.

### Workflow

Retain the dual-screen horizontal instrument. The center arrow belongs on a narrow metal bridge aligned with the glass apertures. Use an unfilled stroked arrow; explicitly set `fill="none"` where needed. Match the reference's narrow bridge rather than a floating arrow in a broad empty face.

Align labels with their corresponding features: first label near first screen text start; second near command screen text start; third under the key. Leader lines terminate above label text with 14–18px clear space. Labels and leaders must share a coordinate system. Remove the current mismatch between grid column starts and decorative offsets.

Keep one modest dark CTA below the explanation. It should feel subordinate to the hero install CTA.

### Examples

Fix the active marker clipping by separating the scrollable tab labels from the visible indicator layer, or keep the marker wholly inside a reserved indicator row. Do not solve it by exposing horizontal page overflow. Reserve enough room for the full 24–28px marker.

Rebuild the folder silhouette from the reference: recognizable folder tab and broad rectangular body, approximately 160 × 115px on desktop. Put `src/` beneath or beside it with intentional spacing; the current wedge is not acceptable. Keep the tree branches fine and labels aligned. Selected files may use dark olive blocks, but do not give them unrelated pill radii.

The example panel, tree, and preview link must form one group. Reduce the detached whitespace before the bottom explanatory sentence. Tab changes must preserve panel height and display all command text. Preview expansion must have deliberate spacing and the same screen treatment.

### Review

Keep the single dark band and offset right-hand panel. Target approximately 1053 × 385px at desktop if content permits; current extra height should be earned by content, not an oversized empty output reservation. Increase the command's prominence inside the screen. Align annotation brackets directly beneath `find .` and `"*.py"`, with a small elbow down to each description, as in the reference. They should explain syntax at a glance.

Place a concise, readable “Interactive preview — no commands run.” line below the screen or below the instrument, using the correct foreground for its surface. Do not remove the truth that this is a simulation. Keep the action shelf uncluttered: silver Edit request, coral Run, aligned on one baseline. Both need sockets or rims consistent with the main material. Simulated output may replace the annotations without moving the section below.

### Installation

Put support text below the heading, left aligned. Remove the current absolute top-right placement. Keep raised OS tabs, but make them part of the enclosure: visible upper lip, sidewall, and an active tab whose lower seam merges with the face. Avoid bare clipped trapezoids. Maintain fixed tab height between states and visible keyboard focus outside any clip.

Keep the command readable in a dark glass area. For long commands, wrap at intentional shell boundaries or offer horizontal scrolling within the screen; never silently ellipsize installation instructions. Copied content must be the complete canonical command, without presentation line breaks changing its meaning.

Do not invent a production install origin. Verify the existing installation route/configuration before altering it. The local-server explanation currently visible in development should not become production marketing copy. If installation configuration is missing, retain an honest usable fallback rather than fabricate an installer URL.

Align the three setup steps to a deliberate three-column grid below the panel. Instructions expansion uses the same text scale and spacing as the rest of the page.

### Closing and footer

Preserve the large return key as the closing visual. Its socket and face must match the small keys. Give it no metal stripes. Reduce heading width slightly from the current near-edge-to-edge setting; preserve two lines. Align the install CTA and key as a balanced pair with the CTA's center near the key's center.

Keep the tagline close to the CTA. Consolidate closing bottom padding and footer top margin so their combined whitespace is deliberate. Footer divider, wordmark, links, and theme switch should share page gutters. Do not introduce a new footer type style or material.

## 6. Responsive rules

Use content-driven breakpoints around 1000px and 700px; inspect their actual transitions. Do not proportionally shrink desktop hardware to phone scale.

At 390px, the workflow becomes a compact vertical instrument: 16px face padding, full-width first screen, 24px arrow row, full-width command screen, then a right-aligned 64 × 48px return key. Screens have a minimum 56px height and may grow for text. Remove unused grid columns and all desktop leader lines. Put the three explanations below as ordinary aligned text groups, 20–24px apart. Both example commands must be fully readable.

Examples stack tree above panel, with a compact tree no taller than approximately 220px. Tabs remain accessible without clipping the selected marker. The screen uses all available width; the key can sit in a dedicated bottom control row. Do not reserve desktop screw gutters around a tiny command viewport.

Review becomes full width. Use simple token descriptions below the command instead of desktop absolute bracket geometry. Keep 16px internal spacing, legible metadata, 48px minimum action heights, and 10–16px material radii. Buttons may stack. Screws stay 14–16px or are omitted symmetrically if space cannot support them; they must not become 4px dots.

Installation tabs fit the content width with minimum 44px hit areas. Command area and copy control stack when necessary. Steps become a vertical numbered list. Closing headline may use a mobile-specific line composition, but no stretching of glyph proportions. Keep CTA full width; place the large key below at about 220–260px wide, with enough space that it reads as a deliberate object.

At 320px, every meaningful command, control label, and paragraph remains readable. No horizontal document overflow. Isolated command scrolling is acceptable when wrapping would be misleading. Test 200% text zoom independently of viewport width.

## 7. Theme, interaction, and accessibility

Light mode remains the primary reference. Dark mode preserves the same materials and geometry: neutral silver does not become an unrelated flat gray rectangle. Apply material theme rules consistently, including the review panel, which sits outside `.sec` and is missed by selectors scoped only to `.sec .metal`.

Keep native buttons, links, inputs, tab semantics, status announcements, and dialog behavior. Decorative metal cannot intercept pointer input or hide focus rings. Minimum touch target 44 × 44px. Use visible 2px focus outlines with a 3px offset and adequate contrast on both backgrounds.

Key press: 1–2px downward travel over roughly 90–120ms, with the lower shadow reducing. Only the key face moves; socket and enclosure stay still. Hover may brighten the face slightly. No looping shimmer, cursor-following tilt, scroll-jacked sections, floating panels, or new animation library. Reduced motion removes translation and uses immediate state changes.

## 8. Implementation order and acceptance

1. Capture the current page before edits; reuse this audit's screenshots as the starting evidence.
2. Build and inspect the shared material proof. Resolve face grain, bevel, socket, glass, and mobile dimensions first.
3. Apply the shared material to all sections, retaining their content and behaviors.
4. Repair mobile grids, command truncation, marker clipping, and leader collisions.
5. Adjust page rhythm, heading hierarchy, background contrast, and per-section alignment.
6. Verify every interactive state and both themes. Run repository lint/build checks appropriate to the changed files. Do not spend effort creating tests that merely repeat CSS values.
7. Save matched before/after screenshots and an honest verification report.

Required screenshot matrix: desktop 1586 × 992 and 1280 × 800; tablet 768 × 1024; phone 390 × 844 and 320 × 740. Capture the whole page plus 1:1 material details at desktop and phone. Inspect both themes at desktop and phone. Inspect examples in all three tabs, preview expanded, review simulated, both OS tabs, instructions expanded, install dialog, keyboard focus, and reduced motion.

Pass conditions:

- All silver objects visibly share one construction and lighting direction.
- Grain is subordinate to shape; coral and text contain no metal overlay.
- Glass reads as recessed, keys as seated, and screws as fasteners.
- Hero remains recognizably faithful to the approved composition.
- Lower headings and whitespace establish a clear hierarchy when viewing the full page at reduced scale.
- No clipped marker, command ellipsis, leader-through-label collision, tiny mobile fastener, or text/surface contrast failure remains.
- Commands, tabs, copy feedback, review simulation, install flows, links, and theme switching still work.
- No unrelated application changes, dependencies, or code comments were added.

Do not describe the result as perfected based on code inspection or a successful build. Inspect the rendered output. If material still reads as striped plastic, return to the proof before polishing minor spacing.
