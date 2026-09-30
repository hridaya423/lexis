# Lexis: implement sections 2–6 beneath the existing hero

## Assignment and boundary

The hero is already implemented. Preserve it. Implement the five approved lower-section designs, replacing the old Studio, Workflow, Install and footer content beneath it. This is a new, separate handoff; the earlier hero handoff is historical context, not your task list.

The user approved the five lower-section images on 2026-09-19 and explicitly said: “make a new handoff. the hero is already implemented.” Do not regenerate the hero, change its headline, replace its material assets, or repeat its implementation plan.

This package specifies work for the next model. No application code was edited while creating it.

## Read in order

1. This handoff.
2. [Section specification](SECTIONS.md).
3. [Implementation plan](IMPLEMENTATION.md).
4. [Asset and reference map](ASSETS.md).
5. All five linked reference images at full size.
6. The live repository files listed below. Read current code; another task may have continued work since this snapshot.

Read applicable AGENTS instructions and load receive-handoff, ponytail, code-deslop, design-engineering and other applicable skills. Consult the bundled Next.js docs before writing Next code.

## Current repository evidence

Root: `/Users/hridyaagrawal/Honey/React/smartterminal`.

Observed 2026-09-19:

- `app/page.tsx` already imports and renders `LexisLcdHero` inside `styles.page`, with local Departure Mono.
- `components/lexis-lcd-hero.tsx` owns the editable hero demo, review/simulation state and native installation dialog.
- `app/lexis-lcd.module.css` owns the LCD material, hero geometry and theme tokens.
- `components/lexis-theme-toggle.tsx` persists the theme through `localStorage['lexis-theme']` and `html[data-lexis-theme]`.
- `public/lexis-lcd/` contains the headline, rail, compact rail, key and grid SVGs. `app/fonts/` already exists.
- Old Studio, Workflow and Install sections still follow the hero inside a max-1380px wrapper. The existing footer follows main.
- Git remote: `https://github.com/hridaya423/lexis.git`.

Working tree is already dirty: app/layout.tsx and app/page.tsx are modified; the hero component, CSS, fonts, theme component and public artwork are untracked. They are existing work. Never reset them, replace them from the earlier handoff, or overwrite them wholesale. This snapshot is not a code-review verdict or runtime verification of the hero.

## Target page order

1. Existing hero, unchanged.
2. Process: “A thought becomes a command.”
3. Example selector: “What needs doing?”
4. Dark review section: “The last word is yours.”
5. Installation console: “Make it your terminal.”
6. Closing CTA/footer: “Your next command starts with you.”

Only the first section has the page navigation and h1. Lower sections use h2. The footer appears once. Do not leave the old generic sections beneath the new ones.

## Important decisions

- Keep the existing page-level material/font/theme system. New sections inherit it.
- Section 4 is an intentionally dark editorial band even in the light theme. A user choosing global dark mode does not invert this band back to light.
- Native HTML carries text, controls, tabs and commands. SVG/CSS carries material and pixel illustration. Never use a complete generated screenshot as the implemented section.
- There is no new shell execution, backend or AI endpoint. Lower-section controls demonstrate static examples and label simulated results.
- Installation is now a real section with OS tabs and copy. The existing hero installation dialog remains untouched. New lower-page install links anchor to `#install`.
- Preserve current-origin installer URLs and the existing route handlers. A visual line wrap must not become a newline in copied shell text.
- Preserve legal routes. Move the existing theme control into the new footer without changing its storage contract.
- No Blender, Three.js, video or image-generation step is required. All additional visual shapes are front-facing and can use the existing material vocabulary.

## Deliverables expected from the implementing model

A complete lower page matching all five references; functional example tabs/review/copy controls; mobile layouts; coherent dark mode; screenshots at desktop and compact sizes; lint/build results; and an honest list of remaining differences. Verify the existing hero has not visually or behaviorally regressed.

Do not claim pixel perfection from a successful build. Do not import the absolute-positioned historical asset-proof as production layout. Do not redesign the brand, invent trust logos or add feature sections.

## Copyable prompt

> Continue the existing Lexis website by implementing only sections 2–6 from `docs/design/lexis-lcd-sections/HANDOFF.md`. The hero is already implemented; preserve its appearance, behavior, assets and installation dialog. Read this new handoff, SECTIONS.md, IMPLEMENTATION.md, ASSETS.md, all five references, and the current app code. Replace the old lower sections/footer with the approved LCD process, example selector, dark review, installation console and closing/footer designs. Reuse existing theme/font/material conventions, keep browser demos local and simulated, preserve installer routes and legal pages, and verify desktop/mobile/theme/keyboard behavior plus lint/build. Do not execute the earlier hero implementation plan or flatten the images into a webpage.
