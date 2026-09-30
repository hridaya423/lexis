# Lexis LCD hero implementation plan

**Goal:** faithfully implement the approved LCD hero using the prepared artwork, while preserving the existing Lexis product and install routes.

**Architecture:** server-render static heading/navigation and use a small client component for the bounded demo and disclosures. SVG supplies material; native HTML supplies text, semantics and behavior. No WebGL or new UI framework.

**Stack:** Next.js 16.2.1, React 19.2.4, TypeScript, existing Tailwind/CSS conventions, local Departure Mono font and supplied SVGs.

**Executor:** read `docs/design/lexis-lcd/HANDOFF.md`, `SPEC.md`, and `ASSETS.md`; load `receive-handoff`, `ponytail`, `code-deslop`, `design-engineering` and `executing-plans` as applicable. Follow repository instructions and local Next documentation. This plan has not been executed against the application.

## Task 1. Establish the baseline

Files to read: `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `components/command-studio.tsx`, `components/quick-install.tsx`, `components/install-commands.tsx`, `app/install.sh/route.ts`, `app/win.ps1/route.ts`.

1. Run `git status --short` and identify user changes. At handoff, the only pre-existing status was untracked `docs/`; do not assume that remains true.
2. Read `AGENTS.md` and applicable user instructions.
3. Read local Next guides for layouts/pages, server/client components, CSS, and fonts, all under `node_modules/next/dist/docs/01-app/01-getting-started/`.
4. Open the approved `docs/design/lexis-lcd/reference.png` and proof at full size.
5. Run `npm run dev -- --port 3000` and inspect the current home and legal pages. Record the baseline without changing the product.

Expected result: you understand old background ownership, lower sections and install commands before editing.

## Task 2. Install only the prepared runtime assets

Create: `public/lexis-lcd/`, `app/fonts/DepartureMono-1.500.woff2`, font license file.

1. Copy only the 12 SVG runtime assets from `docs/design/lexis-lcd/assets/` to `public/lexis-lcd/`. `rail-full.svg` is optional at runtime; the six rail slices are the responsive implementation.
2. Copy the local font and full license. Keep reference image, evidence, generator and manifest in docs; they do not belong in a production payload.
3. Load the font locally. Preserve the existing Sora/IBM Plex setup for unrelated pages.
4. Verify asset requests succeed and text uses Departure Mono; do not fall back silently and call typography done.

Expected result: no new npm package, no external font request, no live-route visual change yet except intentional setup.

## Task 3. Build the reference first frame

Modify: `app/page.tsx`. Create: `app/lexis-lcd.module.css`. Create a narrow hero component only when it has clear ownership.

1. Render header links and lowercase wordmark using specified spacing.
2. Render one semantic h1 with the headline mask, reserved aspect ratio and accessible text.
3. Render the desktop rail slices and HTML input/button above them. Start with the exact example value.
4. Render the exact command and Review → Run row without cards.
5. Render the install CTA and tagline at the specified positions in normal flow.
6. Apply scoped green material and grid. Remove/override inherited dark gradients only where necessary for this hero.
7. Preserve the existing lower sections and footer. Do not perform opportunistic product refactors.
8. Render at 1586×992 and inspect immediately. Correct scale, silhouette and positions before adding interaction.

Use the asset-proof as an assembly reference, not as production layout code. The proof's absolute coordinates and inert controls are intentionally incomplete.

Expected result: the static page reads like the approved image without waiting for hydration. Main measured edges should fall within the SPEC acceptance tolerances.

## Task 4. Add bounded preview behavior

Create: `components/lexis-lcd-demo.tsx` or a single local hero client component. Do not create a generic state-management module for one example.

Suggested state boundary:

```tsx
type Preview =
  | { kind: 'example'; reviewOpen: boolean }
  | { kind: 'editing' }
  | { kind: 'invalid'; message: string }
  | { kind: 'simulated' };
```

Keep the input value as a string. Keep copy feedback separate because copying does not change what command is being reviewed. The exact type can be smaller if implementation warrants it; do not add phases that only simulate an API.

1. Make the rail input editable and label it.
2. Handle Enter only on the form, not document/window.
3. Match the provided example deterministically; preserve unsupported text and show the explicit example limitation.
4. Open an inline review disclosure with the accurate explanation and browser-preview notice.
5. Add Copy command with awaited success/error handling.
6. Add Simulate run with clearly labeled static example output. Never invoke a shell or network endpoint.
7. Add Reset example restoring exact initial composition.
8. Verify keyboard flow, empty input, unsupported input, and stale-command clearing.

Focused behavioral check: type an unsupported request, submit, and verify that the original example command is not presented as its answer. Then restore the example, review, simulate, reset, and verify original first-frame content returns. This tests the real user boundary; do not create tests for decorative SVG rectangles.

## Task 5. Wire installation and GitHub

Inspect/modify: `components/quick-install.tsx`, `components/install-commands.tsx` only where reusing behavior is clearer than duplicating it. Add one native installation dialog near its owning component.

1. Both install actions open the same dialog.
2. Show existing macOS/Linux and Windows commands based on existing origin logic.
3. Await clipboard writes before announcing success; preserve selectable text on failure.
4. Close with button and Escape; return focus to the invoking trigger.
5. Set GitHub destination to the repository's verified remote.
6. Verify `/install.sh` and `/win.ps1` still serve through their existing handlers. Do not run either installer as a design test.

Expected result: no dead install CTA, no falsely reported copy, no installation side effect from clicking the site.

## Task 6. Adapt without redesigning

Modify: the same scoped CSS and rail asset choice.

1. At 601–1023px, retain two headline lines and use readable minimum input text sizes.
2. At ≤600px, switch to compact cap/key assets and their exact overlay coordinates.
3. Stack command/review rows when needed. Ensure wrapped shell text copies as one original string.
4. At 320px verify no page overflow, all links remain reachable, and the native input can scroll its value.
5. Implement proposed dark tokens, retaining light as initial approved appearance. Put theme choice outside the approved hero header.
6. Add reduced-motion and focus-visible states.
7. Check 200% zoom; replace any absolute vertical sizing that clips expanded text.

Expected result: same recognizable design across widths, with undistorted screws/key and accessible content.

## Task 7. Verify and refine against evidence

Create screenshot evidence in a clearly named implementation QA folder. Do not overwrite the handoff's original proof evidence.

1. Run `npm run lint`. Expected: exit 0, or report unrelated pre-existing failures separately with exact evidence.
2. Run `npm run build`. Expected: successful Next build; distinguish external font/network problems from source errors.
3. Capture 1586×992 light first-frame and compare to approved reference. Fix geometry before texture.
4. Inspect 1440×900, 1280×720, 768×1024, 390×844, 320×740.
5. Inspect dark, reduced motion, keyboard focus, review open, install open and unsupported-input states.
6. Measure scroll width and test copy failure; do not rely on global overflow hidden.
7. Do a final code-deslop review: no new comments, decorative runtime loops, overbuilt abstraction, copied old global keydown handler, or unused packages.
8. Record tested states, screenshots, exact checks and remaining deviations. Do not claim pixel identity or behavior not tested.

A completion report should link the running page and evidence, identify material remaining visual differences, and distinguish this implementation from the earlier static proof. Commit only when requested or established workflow authorizes it; do not stage unrelated user work.
