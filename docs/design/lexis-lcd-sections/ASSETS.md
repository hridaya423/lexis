# Lower-page references and asset responsibilities

This inventory is separate from the historical hero asset kit. The hero assets already exist in the application. Reuse their material definitions; do not overwrite them to change lower-page panels.

## Approved section images

All five images were generated with the built-in image generation tool, visually inspected in the conversation and then approved by the user. They are full-section visual references, not website runtime assets.

| Section | Reference file | Role |
| --- | --- | --- |
| 2 | `../lexis-lcd/section-concepts/02-how-it-works.png` | Continuous input/command process rail and annotations |
| 3 | `../lexis-lcd/section-concepts/03-example-tasks.png` | Tabs, pixel file tree and example display |
| 4 | `../lexis-lcd/section-concepts/04-command-review.png` | Dark command-anatomy panel and controls |
| 5 | `../lexis-lcd/section-concepts/05-installation.png` | Integrated OS tabs and copy console |
| 6 | `../lexis-lcd/section-concepts/06-closing.png` | Closing CTA, enlarged return key and footer |

The older section-concepts README calls these proposed additions because it was written before approval. For this task, the user's subsequent “perfect” and request for implementation specs establish the selected direction. This handoff is the current scope authority.

## Already available in runtime

Inspect `public/lexis-lcd/` before copying anything. Observed files include:

- `lcd-grid.svg`
- `headline-pixels.svg`, specific to the hero only
- `rail-left.svg`, `rail-center.svg`, `rail-right.svg`
- `rail-mobile-left.svg`, `rail-mobile-center.svg`, `rail-mobile-right.svg`
- `keycap-coral.svg`, `keycap-coral-mobile.svg`

Local Departure Mono already loads from `app/fonts/DepartureMono-1.500.woff2`. Existing Sora supplies the wordmark. Preserve the font license. Existing theme variables and materials live in `app/lexis-lcd.module.css`.

Editable material source exists in `../lexis-lcd/build-assets.py`. Read it for gradients, grain and shapes; do not run it to replace runtime files automatically. The original kit also contains `return-arrow.svg` and the font license if the next implementation needs them.

## New artwork required during implementation

These are **not yet delivered as finished lower-page SVG assets**. They are bounded native vector/CSS tasks, not external asset blockers. No Blender or paid download is required.

| Item | Method | Constraints |
| --- | --- | --- |
| Five section heading treatments | New SVG masks from pixel glyphs, or validated pixel-font/cell rendering | Real h2 accessible text; never stretch the hero mask |
| Section2 transition bridge | CSS silver skin plus inline arrow | Central bridge maintains fixed readable width; stacks vertically on mobile |
| Section2 dual-display frame | Explicit CSS grid with material layers, or new sliced SVG frame | Reuse color/bevel stops; do not stretch full hero rail into two windows |
| Section3 pixel folder/file/tree artwork | Authored SVG rects/paths or HTML tree | Square cells; no smooth generic folder icon; matching files highlighted |
| Section3 two-line display | Explicit display frame with live text | Height follows content and wraps; key remains a real button |
| Section4 review plate | CSS metal perimeter/inset display/action shelf | Command annotations remain HTML aligned to words; not baked into artwork |
| Section5 silver OS tabs | CSS clip-path/pseudo-elements and layered gradients | Actual native tab controls sit above decoration; selected tab joins body |
| Copy glyph | Inline SVG rect outlines | Same visual weight as pixel type; aria-hidden inside labeled Copy button |
| Section6 enlarged key socket | CSS/SVG using existing coral gradients | Independent native link and visible return arrow; no low-res raster scaling |

Create new files under `public/lexis-lcd/sections/` only when an exported vector is needed. Simple lines, annotations and spacing belong in CSS/HTML. Keep existing hero assets immutable. Avoid an asset for every visual state when CSS transforms/colors suffice.

There are two practical frame methods. CSS layers allow any height and live content; they are preferred for taller review/install panels. New sliced SVG skins give tighter photographic control, but require compact variants. Either is acceptable if visually verified. A tall panel cannot be made by simply increasing the height of `rail-center.svg`: its bevel and grain scale would change.

## Asset acceptance

- No readable user content, command or label is baked into a decorative raster.
- Exported SVGs contain no scripts or external texture links.
- Artwork uses the existing grid/metal/coral palette.
- Pixels and screws retain shape at compact widths.
- Fonts and vectors load locally.
- Placeholder icons or flat grey boxes cannot stand in for finished material in completion screenshots.
- Keep source for newly authored vectors so refinement remains possible.

## Reference integrity

`references.json` records local paths, file sizes and SHA-256 hashes of the five approved images. Do not alter those images when tuning code. Put implementation screenshots in a new evidence directory, separate from the approved references and the earlier hero asset proofs.
