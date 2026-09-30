# Lexis LCD asset kit

All files are local. No image generation, Blender scene, stock render, paid component, remote texture, or additional font purchase is needed to begin implementation.

These are authored, editable SVG reconstructions of the approved image. They intentionally separate material from live interface content. The assets are ready to use; the application and its interaction states still need implementation.

## Inventory

| File | Source dimensions | Use |
| --- | --- | --- |
| `headline-pixels.svg` | 1202 × 402 | Both headline lines; CSS mask with theme ink |
| `headline-map.json` | Glyph rows and placements | Human-readable reconstruction data; not a runtime dependency |
| `rail-full.svg` | 1480 × 140 | Desktop reference assembly without key face or text; inspect only, or use at its native aspect ratio |
| `rail-left.svg` | 96 × 140 | Fixed desktop left cap, screw and start of recess |
| `rail-center.svg` | 1092 × 140 | Stretchable desktop center |
| `rail-right.svg` | 292 × 140 | Fixed desktop right cap, button socket, screw and end of recess |
| `rail-mobile-left.svg` | 32 × 88 | Compact left cap, smaller screw |
| `rail-mobile-center.svg` | 224 × 88 | Stretchable compact center |
| `rail-mobile-right.svg` | 104 × 88 | Compact socket/right screw |
| `keycap-coral.svg` | 176 × 86 | Desktop key face, no arrow |
| `keycap-coral-mobile.svg` | 61 × 50 | Compact key face with appropriate corner radius |
| `return-arrow.svg` | 40 × 40 | Inline SVG glyph, currentColor |
| `lcd-grid.svg` | 6 × 6 | Tiled background matrix |
| `DepartureMono-1.500.woff2` | Binary font | Small pixel text; self-host |
| `DepartureMono-LICENSE.txt` | SIL OFL | Must accompany redistributed font |

`manifest.json` records byte counts and SHA-256 hashes. It is an inventory snapshot; regenerate after intentional changes.

## Provenance

- `reference.png` is the image explicitly supplied/approved by the user, copied without modification from the attached file. Original raster: 1586 × 992.
- SVG artwork and glyph maps are authored for this handoff. They contain no extracted raster pixels or external resources.
- Font source: [Departure Mono repository](https://github.com/rektdeckard/departure-mono), authored by Helena Zhang. The release file was downloaded from `https://raw.githubusercontent.com/rektdeckard/departure-mono/main/public/assets/DepartureMono-1.500.woff2` on 2026-09-19.
- Font license downloaded from `https://raw.githubusercontent.com/rektdeckard/departure-mono/main/public/assets/LICENSE`. Preserve the complete local license, including reserved font names. No font outline modification or subsetting was performed.

## Rebuild

From the repository root:

```sh
python3 docs/design/lexis-lcd/build-assets.py
```

The generator uses only Python's standard library. It regenerates the SVG artwork and headline map. It does not download the font, change the reference, render screenshots, touch application code, or update the manifest. No image editing dependency is needed.

The authoritative editable artwork is `build-assets.py`. `headline-map.json` is an exported inspection aid; modifying JSON alone does not change the generator. For a glyph adjustment, edit `glyphs`/`lines` in the Python source and rebuild.

## Desktop assembly

At native scale, create a relative container 1480px wide × 140px high. Use CSS grid columns `96px minmax(0, 1fr) 292px`. Put left/center/right skins in those cells with no gap. Set all decorative images to 100% width and height, display block, empty alt and pointer-events none.

Above this layer:

- Input: left 114, right 310, top 31, height 74.
- Key: right 67, top 27, width 176, height 86.
- Return glyph: centered 40 × 40.

At another height, multiply all cap widths and overlay offsets by `height/140`. The SVG viewBox crops are intentional. Do not “repair” them to zero-based viewBoxes without translating their artwork; the caps would show the wrong sections.

The right cap starts at source X1188. Its socket begins 47 units into the cap. That relation gives the native key-right offset of 67. If the button appears a few pixels disconnected from its socket, check container sizing and offsets before editing the artwork.

The master assembly contains no baked text or active key surface. `rail-full.svg` has the same intentional empty button socket. Seeing an empty socket in that standalone file is not a missing asset.

## Compact assembly

At ≤600px, grid columns are `32px minmax(0, 1fr) 104px`, container height 88px. Use compact skins. Input left38/right112/top18/height50; key right25/top18/61×50. Use the compact key asset. Return glyph is 26px square.

The compact assembly is authored separately to preserve circles, bevel width, and usable key dimensions. The center stretches between fixed caps. A 320px viewport with 16px gutters leaves 288px for the rail and 152px for its middle track. The native input may scroll its value horizontally; the entire page must not scroll sideways.

## Font integration

Copy the font to `app/fonts/DepartureMono-1.500.woff2` and keep the license. Load through `next/font/local`; the local Next.js documentation explains src paths relative to the module that calls it. Scope the returned class/variable to the hero and relevant disclosures, rather than changing every existing page.

Suggested call if placed in `app/page.tsx`:

```tsx
const departure = localFont({
  src: './fonts/DepartureMono-1.500.woff2',
  display: 'swap',
  variable: '--font-departure',
  weight: '400',
});
```

The proof uses CSS @font-face because it is a standalone inspection sheet. Do not infer that production must bypass next/font.

## Preview and evidence

Run from repository root:

```sh
python3 -m http.server 8766 --directory docs/design/lexis-lcd
```

Then visit `http://localhost:8766/asset-proof.html`.

The page assembles the artwork and compares material proportions. It is deliberately not a functional site: input is represented by text, install links jump to the proof note, the key has no command handler, and theme choice is not persisted. Do not copy it into `app/page.tsx` as-is.

Screenshot evidence:

- `evidence/desktop-1586.png`: assembled assets at approved dimensions.
- `evidence/mobile-390.png`: compact assembly.
- `evidence/mobile-320.png`: minimum-width layout check.
- `evidence/dark-1586.png`: proposed dark material treatment.

The static input text clips at narrow sizes. A native production input must allow caret navigation and horizontal text scrolling. Clipping of the static proof is not a mobile text-entry implementation.

## Refinement boundaries

Preserve separate key, arrow, screen content, and decorative assembly. Do not merge them into a screenshot. Do not add environmental reflections, perspective, surrounding hardware, or photographic props. If production screenshot comparison requires material tuning, first adjust small SVG gradient stops and grain opacity, not the assembly silhouette.

The font is a visual approximation. The headline is separately authored to prevent an approximate font from determining its silhouette. Mobile and dark treatments are proposals, not additional approved reference images.
