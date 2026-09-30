# Asset inventory and usage

All required static visual assets are ready. Reference images are design evidence and must not be shipped as the rendered webpage.

| File in assets/ | Purpose | Notes |
| --- | --- | --- |
| heading-hero.svg | Hero h1 | 1157 × 366, two lines |
| heading-examples.svg | Examples h2 | 992 × 108, one line |
| heading-review.svg | Review h2 | 954 × 315, two lines |
| heading-install.svg | Installation h2 | 574 × 362, three lines |
| footer-wordmark.svg | Oversized lexis | 759.3 × 264.3, never distort |
| footer-wordmark-cells.json | Editable wordmark geometry | 3468 square cells; runtime does not need this file |
| lcd-substrate.svg | Optional 6px background tile | Very low contrast; omit if it causes moiré |
| DepartureMono-1.500.woff2 | Body and control text | Copy of existing project font |
| DepartureMono-LICENSE.txt | Font licence | Retain with redistributed font |
| manifest.json | Geometry/provenance details | Source image bounds and extraction method |
| checksums.json | File integrity | SHA-256 for references and assets, excluding itself |

## Heading construction

`build-assets.py` reads only the known display-heading regions of the approved images, thresholds dark ink, and merges equal horizontal runs into vector rectangles. SVGs contain geometry rather than embedded images. This retains the specific approved cell pattern without approximating it with another font. Small irregularities are part of the source image; body copy must remain native text.

To regenerate, run `python3 docs/design/lexis-prompt/build-assets.py` from the repository root in an environment with Pillow and NumPy. These are asset-authoring dependencies, not application dependencies. Do not add them to the web app. The committed SVGs require no generation step to use.

The footer has a different provenance: natural bold grotesk letter shapes were sampled into square cells, then saved as geometry. It is a deliberate full-width, uncropped adaptation of the selected footer, answering the user's request that it not be squeezed. The source note is retained in the cell JSON. No system font file is redistributed for this wordmark.

## Rendering contract

Use a currentColor-filled CSS mask or inline SVG and preserve each viewBox aspect ratio. Give semantic headings their accessible text once, with the decorative visual aria-hidden. An external img does not inherit currentColor from its parent; do not assume it will.

A solid background layer plus the optional substrate tile is enough. Tree stems, selection rectangles, underlines and cursors are native CSS/SVG primitives. No additional raster art, 3D asset or icon package is needed.

## Proof

Serve the repository root and open `/docs/design/lexis-prompt/asset-proof.html`. For example: `python3 -m http.server 8767 --bind 127.0.0.1`. The proof loads its bundled font and assets through relative URLs and can travel with this directory. It displays heading geometry and natural footer proportions; it is not an implementation template for section spacing.

The source images remain at 1586 × 992. The file names establish page order. Original generation IDs are recorded in `references/provenance.json`.
