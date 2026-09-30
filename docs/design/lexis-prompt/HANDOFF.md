# Lexis implementation handoff

Implement the approved pale-green prompt design described in [SPEC.md](SPEC.md). The task is a homepage redesign within the existing Next.js repository, not a backend redesign. This package was prepared on 19 September 2026; the website has not been changed by this preparation task.

## Read first

1. Read the repository instructions and inspect the current working tree. Preserve unrelated changes, especially everything under `lexis/`.
2. Read [SPEC.md](SPEC.md) completely, then open all five files in [references](references/).
3. Read [ASSETS.md](ASSETS.md) and open [asset-proof.html](asset-proof.html) through a local server. The proof validates asset geometry, not page composition.
4. Follow [the implementation plan](../../plans/2026-09-19-lexis-prompt-implementation.md). Apply the repository's required coding and design skills.

## Fixed decisions

The page order is hero → examples → review → installation → footer. Remove the duplicate process section and closing CTA. Use a continuous pale green surface with olive text, exact supplied LCD headings, flat `>` prompts and tiny coral cursors. Remove metal, screws, dark inset screens, raised tabs and orange Enter keys.

The selected footer is the quiet `> your move_` composition, with a full oversized lowercase lexis wordmark at its natural proportions. Do not regenerate or squeeze it. The supplied footer geometry is an intentional adaptation of the original cropped artwork.

Review has no syntax annotation columns or repeated preview disclaimers. Its Run action shows clearly labelled local example output, never real command execution. The install control detects desktop OS and respects manual tab selection. Keep installation routes and command formats intact.

## Assets ready to use

Four SVG headings extracted from the approved images, a natural-proportion footer wordmark, optional subtle substrate tile, Departure Mono WOFF2 and licence, wordmark cell data, reproducible extraction script and asset inventory are supplied in this folder. No image generation or Blender work remains necessary.

## Expected implementation evidence

Provide inspected desktop and mobile screenshots, a full-page pacing check, meaningful behaviour tests for fixtures/OS detection/copy, relevant lint/build results, and a short list of deliberate deviations. Follow the acceptance criteria in SPEC.md. Do not treat the current asset proof as proof of a completed website.

## Paste into the next model

> Implement `docs/design/lexis-prompt/SPEC.md` using its bundled references and assets. Read `HANDOFF.md`, `ASSETS.md` and `docs/plans/2026-09-19-lexis-prompt-implementation.md` first. Preserve unrelated working-tree changes, especially `lexis/`. Match the four approved section images and the selected footer, including the documented natural-proportion footer adjustment. This is the pale green, flat `>` prompt direction; remove the old metallic UI and duplicate sections. Keep demos local and installer routes unchanged. Verify by rendering and inspecting desktop/mobile screenshots, then test the specified interaction states. Continue until the implementation and visual checks are complete.
