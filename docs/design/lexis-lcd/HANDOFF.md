# Start here: Lexis LCD hero

The user selected the full-page green LCD concept and asked for a detailed implementation specification plus any assets required for a faithful build. This package fulfills the planning/asset request. It does not implement the Next.js website.

## Your assignment

Implement the approved image faithfully, using the prepared assets. Do not begin a new concept exploration. Keep the product itself and installer routes unchanged. The page should feel like the selected image, not a generic terminal landing page inspired by it.

The user explicitly prefers this concept's pixel headline, green LCD material, long silver input rail, and coral key. Earlier unrelated glass and conventional UI concepts were rejected. These preferences are settled; do not ask the user to choose a style again.

## Repository

Root: `/Users/hridyaagrawal/Honey/React/smartterminal`.

Observed repository remote: `https://github.com/hridaya423/lexis.git`.

Next.js 16.2.1, React 19.2.4, Tailwind 4, TypeScript. The repo instructs agents to consult bundled Next docs, and the user's AGENTS instructions require ponytail and code-deslop for coding, design-engineering for UI, and receive-handoff when resuming a handoff. Read current instructions before working.

## Read these artifacts

1. `docs/design/lexis-lcd/reference.png` — the approved user-supplied 1586×992 image.
2. `docs/design/lexis-lcd/SPEC.md` — detailed geometry, materials, typography, behavior, responsive adaptations, architecture and acceptance criteria.
3. `docs/design/lexis-lcd/ASSETS.md` — all asset files, assembly equations, local font provenance and preview instructions.
4. `docs/plans/2026-09-19-lexis-lcd-implementation.md` — ordered implementation steps and checks.
5. `docs/design/lexis-lcd/VERIFICATION.md` — what was inspected and what remains untested.

## Already prepared

- Original reference preserved without modification.
- Bespoke two-line pixel headline SVG, glyph map, and deterministic source generator.
- Desktop metallic rail as full master and three stretch-safe SVG slices.
- Separate compact rail slices for small screens.
- Desktop and compact coral keycap assets, separate return glyph.
- Fine LCD grid tile.
- Local Departure Mono 1.500 WOFF2 and full SIL OFL license.
- Static asset assembly proof with desktop, compact and proposed dark material views.
- Four saved browser screenshots and a SHA-256 asset manifest.

All assets are under `docs/design/lexis-lcd/assets/`. Copy the runtime subset into public/font locations during implementation. Keep documentation, reference and evidence out of public unless deliberately needed.

No Blender, WebGL, external texture, imagegen pass or new renderer dependency is needed. This view is front-on; SVG skins provide stable geometry while native HTML controls supply behavior.

## What is not done

- No app page/component/global CSS was changed for this handoff.
- No functional input, command preview, install dialog or theme persistence was built.
- No production accessibility or performance audit has been completed.
- No Next build/lint claim is being made for an implementation that does not exist.
- The asset proof is not the final site. It uses absolute coordinates to inspect geometry and has intentionally inert actions.

## Important implementation cautions

Use native input/button above the metal assets. Never flatten the hero into one image. Keep one semantic h1 underneath the decorative headline mask. Use normal document flow rather than the proof's absolute coordinates. Do not stretch the entire rail at compact widths; use compact caps/key so screws stay round and controls stay usable.

The demo is a local example. No browser shell execution or fabricated AI responses. The existing CommandStudio uses a global Enter handler and several presets; do not copy that global keyboard behavior into the new hero. The existing QuickInstall sets copied status without awaiting clipboard success; fix that boundary if reusing it.

The screenshot command includes directories, so its explanatory text should describe “largest entries.” Keep the visual example unchanged. Preserve existing deployment-origin behavior and installer endpoints.

The light screenshot is authoritative. Mobile and dark are proposed adaptations, explicitly marked in SPEC. Existing lower sections and legal pages stay intact unless the user changes scope. Avoid broad global palette changes that break those routes.

Known reconstruction differences: custom glyph contours are more regular than the generated raster; the metal is procedural rather than photographic; the small font is an approximation; proof wordmark is Arial and should use existing Sora in production. Tune within this direction using side-by-side screenshots.

## Run the proof

```sh
python3 -m http.server 8766 --directory docs/design/lexis-lcd
```

Open `http://localhost:8766/asset-proof.html`. If 8766 is still occupied by the earlier proof server, reuse it or choose another local port. Do not kill unrelated processes.

## Copyable next-model prompt

> Implement the Lexis LCD homepage hero from `docs/design/lexis-lcd/HANDOFF.md`. Read the approved `reference.png`, detailed `SPEC.md`, `ASSETS.md`, verification notes, and `docs/plans/2026-09-19-lexis-lcd-implementation.md` before editing. Use the supplied SVG rail/key/headline assets and local font; preserve the image's layout and material identity. Build native accessible input and controls, a bounded local demo, and functioning installation disclosure, without changing the CLI or executing commands in the browser. Keep existing lower sections and legal routes intact. Inspect desktop and compact screenshots against the reference, test keyboard/reduced-motion/zoom and proposed dark appearance, and run repository lint/build. Report actual checks and remaining visual differences. Do not redesign the concept or use the approved raster as a flattened webpage.
