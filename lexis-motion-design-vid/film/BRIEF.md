---
workflow: general-video
flow: automation
storyboard: no
message: "Eighty years of progress, and we still memorize tar flags. Lexis: say it in your own words."
destination: x-feed
aspect: 1920x1080
fps: 60
language: en
length: 15s
angle: history-to-punchline brand ad
---

## Intent

A fast-paced, very creative 15s ad for Lexis (lexis.hridya.tech), a local-first terminal
assistant that turns plain English into shell commands. Opens on the dawn of computing and
an acceleration montage of tech optimism (ENIAC, punch cards, Saturn V, chips), lands on the
punchline that we still memorize terminal flags, then introduces Lexis and ends on the logo.

## Assets

- ../raw/video/* — Prelinger Archives (public domain) + NASA (public domain) footage.
- ../raw/img/* — Wikimedia Commons photos/engravings; licenses in ../raw/img/credits.json.
- ../../app/fonts/DepartureMono-1.500.woff2 — brand typeface.
- ../../public/lexis-prompt/footer-wordmark-cells.json — the dot-matrix wordmark cells (logo).

## Notes

- Built from scratch; ignores every earlier film in the repo.
- Brand palette only: paper #c3dfa0, ink #182510, ink2 #41582d, coral #ff735b. No beige, no eyebrow labels.
- References: LexnLin/Claude ad (shot rhythm ~0.25-0.5s, traveling brand dot, arcs painted over archival art,
  letter-swap word morphs), ideogram (selection brackets, word-between-images), a16z Machine Age
  (moving dot narrative, type-on with ghost glyphs), a16z Time to Build (archival optimism).
- Every morph runs through one shared cell system: images, text, and the logo are all LCD cells.
