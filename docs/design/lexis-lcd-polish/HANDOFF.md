# Lexis polish handoff

Implement the repairs in [SPEC.md](SPEC.md). The user wants the existing site polished to match the approved LCD references, with particular attention to solid, convincing metal components and a coherent page.

Read the repository's AGENTS.md and required skills first. Preserve existing uncommitted work. The application is already implemented; do not scaffold, replace the page, rerun the old hero implementation plan, or introduce a new visual direction.

## Start here

1. Read SPEC.md and inspect `evidence/hero.png`, `workflow.png`, `examples.png`, `review.png`, `install.png`, `closing.png`, `mobile-workflow.png`, and `mobile-review.png`.
2. Inspect `../lexis-lcd/reference.png` and the five approved images under `../lexis-lcd/section-concepts/`.
3. Inspect current application files before editing. The audit is a snapshot; another model or the user may have changed them.
4. Build a shared material proof first, then apply it to the page. Do not tune six separate gradient stacks independently.

## Relevant source

- `app/lexis-lcd.module.css`: page surface, hero dimensions, hero interactions and material placement.
- `app/lexis-lcd-sections.module.css`: lower material rules, typography, layouts, responsive overrides.
- `components/lexis-lcd-hero.tsx`: preserve working hero behavior.
- `components/lexis-lcd-sections.tsx`: workflow, closing, footer.
- `components/lexis-example-selector.tsx`: tabs, tree, preview.
- `components/lexis-command-review.tsx`: annotated command and simulation.
- `components/lexis-install-console.tsx`: OS tabs, command, copy, instructions.
- `public/lexis-lcd/`: existing hero SVG material assets.
- `public/lexis-lcd/sections/`: heading masks, icons, closing key.

## Priorities

P0: mobile truncation and broken workflow geometry; texture overlay crossing coral; clipped tab marker.

P1: one convincing metal/glass/key construction across every section; mobile bevel and screw minimum sizes; review typography and annotations.

P2: calmer grid, section rhythm, support-copy alignment, folder silhouette, installation tabs, footer spacing, secondary glyph refinements.

All priorities belong to the requested finish. Priority only determines order.

## Boundaries and delivery

Use CSS and SVG. No Blender, WebGL, new motion dependency, or generated full-section raster is needed. Replacement assets have not been produced by this audit. If assets are revised, document their dimensions, consumers, and visual verification.

Return the implemented changes, material proof, matched screenshots, and verification report. Do not claim the site is fixed from build results alone. Keep demo execution explicitly illustrative and do not invent product capabilities or installation URLs.

The live audit inspected localhost:3210 on 19 September 2026. Find the current correct server before testing; other local servers belonged to other work. No application files were changed during this audit. Only this new audit/handoff folder was created.
