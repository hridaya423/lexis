# Verification record

Date: 2026-09-19. Scope: specification and asset kit only.

## Performed

- Opened and visually inspected the exact attached reference at 1586×992.
- Read the current home page, root layout, global CSS, command studio and installation components; checked package versions and Git remote.
- Read local Next.js font and server/client guidance for the implementation handoff.
- Preserved the reference image without modification.
- Parsed all 12 SVG files as XML; checked that they contain no scripts or external resource URLs.
- Re-ran the standard-library asset generator and verified SVG SHA-256 hashes remained identical.
- Confirmed downloaded local font has WOFF2 signature; preserved its supplied license and provenance.
- Rendered asset-proof.html in the Codex browser at 1586×992, 390×844 and 320×740.
- Visually inspected the light desktop assembly, both compact widths, and proposed dark desktop material.
- Fixed a compact-key aspect-ratio defect by authoring a separate compact key asset; re-rendered both compact widths.
- Saved desktop/light, desktop/dark, mobile390 and mobile320 screenshots under evidence/.

## Visual findings and limits

Desktop reproduces the selected hierarchy, large two-line pixels, green matrix surface, shallow full-width rail, recessed input, separate coral key, command row and CTA placement. It is a vector reconstruction, not pixel-identical photographic extraction.

The hand-authored y/w/s contours differ from the reference; the metal has cleaner procedural grain; Departure Mono approximates the small text. The proof wordmark is narrower than the reference and uses Arial as a stand-in for production Sora. SPEC identifies these as refinement targets.

Compact assets preserve distinct screws and a readable key instead of stretching the desktop hardware. The static text stand-in clips inside the input at small widths. It is not a native input; production must support native caret movement and horizontal input scrolling. The surrounding command wraps at 320px and remains visible.

The dark preview is a proposed material direction. It dims the entire proof rail for quick inspection; production should dim only decorative metal so input text/focus remain independently controlled. No dark reference was supplied by the user.

## Not performed

No application implementation, functional demo testing, clipboard testing, installation dialog testing, final route regression testing, accessibility certification, measured contrast audit, Web Vitals benchmark or Next production build. These checks belong to the implementation plan. Do not treat the static proof as evidence for them.

The asset proof is an inspection artifact, not an accessibility or responsive architecture template. The next model must implement normal-flow production layout and test the behaviors specified in SPEC.
