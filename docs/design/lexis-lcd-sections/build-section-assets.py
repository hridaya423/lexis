"""Generate lower-section pixel heading masks + XL coral keycap.

Reuses the hero glyph conventions from ../lexis-lcd/build-assets.py:
column pitch ~12 units (pixel width pitch-1.25), row pitch 14 units
(pixel height 12.65), cap height rows 0-13, x-height body rows 4-13,
descenders reach row 16. Output SVGs are alpha masks: fill=currentColor,
applied via CSS mask like the hero headline.
"""
from pathlib import Path
import json

root = Path(__file__).resolve().parent
out = root.parent.parent.parent / 'public' / 'lexis-lcd' / 'sections'
out.mkdir(parents=True, exist_ok=True)

ROW = 14.0
PXH = 12.65
GAP = 1.25
LINE = 206.0
LETTER = 12.0
SPACE = 60.0

# --- glyphs -------------------------------------------------------------
glyphs = {
# glyphs carried over from the hero set (verbatim)
'n': ['00000000000'] * 4 + ['11101111100', '11111111110', '11110000111'] + ['11100000111'] * 7,
'o': ['00000000000'] * 4 + ['00111111100', '01111111110'] + ['11100000111'] * 6 + ['01111111110', '00111111100'],
'u': ['00000000000'] * 4 + ['11100000111'] * 7 + ['11100001111', '01111111111', '00111110111'],
'r': ['000000000'] * 4 + ['111011110', '111111111', '111100111'] + ['111000000'] * 7,
'y': ['00000000000'] * 4 + ['11100000111'] * 5 + ['01110001110', '00111011100', '00011111000', '00001110000', '00011100000', '00111000000', '01110000000', '11110000000'],
'w': ['0000000000000'] * 4 + ['1110000000111'] * 3 + ['1110011100111'] * 3 + ['0110111110110', '0111110111110', '0011100011100', '0011100011100'],
'd': ['00000000111'] * 4 + ['00111110111', '01111111111', '11100001111'] + ['11100000111'] * 4 + ['11100001111', '01111111111', '00111110111'],
's': ['00000000000'] * 4 + ['00111111100', '01111111110', '11100000000', '11110000000', '01111111000', '00011111110', '00000001111', '00000000111', '11111111110', '01111111100'],
'.': ['000'] * 12 + ['111', '111'],
# new glyphs
'a': ['00000000000'] * 4 + ['00111111100', '01111111110', '00000000111', '00111111111', '01111111111', '11100000111', '11100000111', '11100001111', '01111111111', '00111110111'],
'b': ['11100000000'] * 4 + ['11101111100', '11111111110', '11110000111'] + ['11100000111'] * 4 + ['11110000111', '11111111110', '11101111100'],
'c': ['00000000000'] * 4 + ['00111111100', '01111111110', '11100000111'] + ['11100000000'] * 4 + ['11100000111', '01111111110', '00111111100'],
'e': ['00000000000'] * 4 + ['00111111100', '01111111110', '11100000111', '11111111111', '11100000000', '11100000000', '11100000000', '11100000111', '01111111110', '00111111100'],
'g': ['00000000000'] * 4 + ['00111111100', '01111111110', '00000000111', '00111111111', '01111111111', '11100000111', '11100000111', '11100001111', '01111111111', '00111110111', '00000000111', '01110001110', '00111111100'],
'h': ['11100000000'] * 4 + ['11101111100', '11111111110', '11110000111'] + ['11100000111'] * 7,
'i': ['110', '110', '000', '000'] + ['110'] * 9 + ['111'],
'k': ['11100000000'] * 4 + ['11100001110', '11100011100', '11100111000', '11101110000', '11111100000', '11101110000', '11100111000', '11100011100', '11100001110', '11100000111'],
'l': ['110'] * 13 + ['011'],
'm': ['0000000000000000000'] * 4 + ['1110111111101111100', '1111111111111111110', '1111000011110000111'] + ['1110000011100000111'] * 7,
't': ['001100000'] * 4 + ['111111110', '111111110'] + ['001100000'] * 6 + ['001100111', '000111110'],
'x': ['00000000000'] * 4 + ['11100000111', '01110001110', '00111011100', '00011111000', '00001110000', '00001110000', '00011111000', '00111011100', '01110001110', '11100000111'],
'A': ['00001110000', '00011111000', '00111011100', '01110001110', '11100000111', '11100000111', '11111111111', '11100000111', '11100000111', '11100000111', '11100000111', '11100000111', '11100000111', '11100000111'],
'M': ['1110000000111', '1111000011111', '1111100011111', '1110100010111', '1110010100111', '1110011100111', '1110001000111'] + ['1110000000111'] * 7,
'T': ['11111111111', '11111111111'] + ['00001110000'] * 12,
'W': ['1110000000111'] * 7 + ['1110011100111'] * 3 + ['0110111110110', '0111110111110', '0011100011100', '0011100011100'],
'Y': ['11100000111', '11100000111', '01110001110', '00111011100', '00011111000', '00001110000'] + ['00001110000'] * 8,
'?': ['011111110', '111111111', '111000111', '000000111', '000001110', '000011100', '000111000', '001110000', '001110000', '000000000', '000000000', '000000000', '001110000', '001110000'],
# lowercase ascender/descender + symbol glyphs for terminal screen text
'f': ['000111100', '001110000', '001100000', '001100000', '111111000', '111111000'] + ['001100000'] * 8,
'p': ['00000000000'] * 4 + ['11101111100', '11111111110', '11110000111'] + ['11100000111'] * 3 + ['11110000111', '01111111110', '00111111100', '11100000000', '11100000000', '11100000000'],
'z': ['0000000000'] * 4 + ['1111111111', '1111111111', '0000000111', '0000001110', '0000011100', '0000111000', '0001110000', '0011100000', '0111000000', '1111111111', '1111111111'],
'-': ['00000'] * 6 + ['11111', '11111'] + ['00000'] * 5,
'"': ['1100110', '1100110', '1100110', '0100010'] + ['0000000'] * 10,
"'": ['110', '110', '110', '010'] + ['000'] * 10,
'*': ['0000000'] * 4 + ['0010100', '0111110', '0011100', '0111110', '0010100'] + ['0000000'] * 5,
'/': ['00000011', '00000110', '00001100', '00011000', '00011000', '00110000', '00110000', '01100000', '01100000', '11000000', '11000000', '11000000', '01100000', '00110000'],
}

COLS = {c: len(rows[0]) for c, rows in glyphs.items()}
WIDTH = {c: cols * 12 for c, cols in COLS.items()}


def emit(lines):
    """lines: list of strings. Returns svg text + viewBox dims."""
    rects = []
    max_w = 0.0
    for li, text in enumerate(lines):
        x = 0.0
        for ch in text:
            if ch == ' ':
                x += SPACE
                continue
            g = glyphs[ch]
            w = WIDTH[ch]
            pitch = w / COLS[ch]
            for row, bits in enumerate(g):
                for col, bit in enumerate(bits):
                    if bit == '1':
                        rects.append(
                            f'<rect x="{x + col * pitch:.3f}" y="{li * LINE + row * ROW}" '
                            f'width="{pitch - GAP:.3f}" height="{PXH}"/>'
                        )
            x += w + LETTER
        max_w = max(max_w, x - LETTER)
    # 17 rows: 14 cap rows + 3 descender rows — 'g', 'y', 'p' must not clip
    h = (len(lines) - 1) * LINE + 17 * ROW
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {max_w:.0f} {h:.0f}" '
        f'fill="currentColor"><g>' + ''.join(rects) + '</g></svg>',
        round(max_w),
        round(h),
    )


HEADINGS = {
    'head-workflow.svg': ['A thought becomes', 'a command.'],
    'head-examples.svg': ['What needs doing?'],
    'head-review.svg': ['The last word', 'is yours.'],
    'head-install.svg': ['Make it your terminal.'],
    'head-closing.svg': ['Your next command', 'starts with you.'],
}

manifest = {}
for name, lines in HEADINGS.items():
    svg, w, h = emit(lines)
    (out / name).write_text(svg)
    manifest[name] = {'viewBox': [0, 0, w, h], 'lines': lines}
    print(f'{name}: {w}x{h}')

# --- pixel text masks for terminal screen content ----------------------
# Same glyph system as the headings; applied via CSS mask over the
# screen-ink color so LCD text inside glass matches the hero headline.
SCREEN_TEXT = {
    'px-req-list.svg': ['list all python files'],
    'px-req-count.svg': ['count lines in main.go'],
    'px-req-folder.svg': ["show this folder's size"],
    'px-cmd-find.svg': ['find . -name "*.py"'],
    'px-cmd-wc.svg': ['wc -l main.go'],
    'px-cmd-du.svg': ['du -sh .'],
    'px-out-find.svg': ['./src/app.py', './src/utils.py'],
}

for name, lines in SCREEN_TEXT.items():
    svg, w, h = emit(lines)
    (out / name).write_text(svg)
    manifest[name] = {'viewBox': [0, 0, w, h], 'lines': lines}
    print(f'{name}: {w}x{h}')

# --- pixel icons for the example tree illustration (cell = 1 unit, square pixels)
def emit_icon(name, rows, gap=0.35):
    rects = []
    for r, bits in enumerate(rows):
        for c, bit in enumerate(bits):
            if bit == '1':
                rects.append(f'<rect x="{c}" y="{r}" width="{1 - gap:.3f}" height="{1 - gap:.3f}"/>')
    w = max(len(r) for r in rows)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {len(rows)}" '
           f'fill="currentColor">' + ''.join(rects) + '</svg>')
    (out / name).write_text(svg)
    manifest[name] = {'viewBox': [0, 0, w, len(rows)]}
    print(f'{name}: {w}x{len(rows)}')

# closed folder: stepped tab at upper left, broad rectangular body
emit_icon('icon-folder.svg', [
    '11111100000000000000000000',
    '11111111000000000000000000',
    '11111111110000000000000000',
    '11111111111111111111111111',
    '11111111111111111111111111',
    '11111111111111111111111111',
    '11111111111111111111111111',
    '11111111111111111111111111',
    '11111111111111111111111111',
    '11111111111111111111111111',
    '11111111111111111111111111',
    '11111111111111111111111111',
    '11111111111111111111111111',
    '11111111111111111111111111',
    '11111111111111111111111111',
    '11111111111111111111111111',
    '11111111111111111111111111',
    '11111111111111111111111111',
])
# document with folded top-right corner
emit_icon('icon-file.svg', [
    '1111110000',
    '1111111000',
    '1111111100',
    '1111111110',
    '1111111111',
    '1111111111',
    '1111111111',
    '1111111111',
    '1111111111',
    '1111111111',
    '1111111111',
    '1111111111',
    '1111111111',
    '1111111111',
    '1111111111',
])

# pale grid tile for the dark review band (6px, matching lcd-grid.svg rhythm)
grid_dark = '<svg xmlns="http://www.w3.org/2000/svg" width="6" height="6"><path d="M0 .5H6M.5 0V6" stroke="#9ccb6f" stroke-opacity=".16" stroke-width=".5"/></svg>'
(out / 'lcd-grid-dark.svg').write_text(grid_dark)
manifest['lcd-grid-dark.svg'] = {'size': [6, 6], 'consumers': ['.band']}

# fine irregular metal grain — irregular dash tile like the hero rail's grain,
# not regular stripes; drawn under apertures so it never crosses keys/text
grain = '''<svg xmlns="http://www.w3.org/2000/svg" width="173" height="40" viewBox="0 0 173 40">
  <g fill="none" stroke="#fff" stroke-opacity=".17" stroke-width=".5">
    <path d="M0 .5H173M18 4H157M0 8H134M55 12H160M9 16H120M40 20H173M0 24H96M70 28H150M22 32H110M130 36H173"/>
  </g>
  <g fill="none" stroke="#222b22" stroke-opacity=".11" stroke-width=".5">
    <path d="M31 2.2H172M0 6.8H104M70 10.7H173M12 14.3H88M96 18.6H170M0 22.4H60M44 26.9H140M105 30.5H173M0 34.2H75M140 38.1H173"/>
  </g>
</svg>
'''
(out / 'metal-grain.svg').write_text(grain)
manifest['metal-grain.svg'] = {'viewBox': [0, 0, 173, 40], 'consumers': ['.metal', '.osTab']}

# --- XL coral keycap (section 6 socket key), same gradients as keycap-coral.svg
key = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 468 232"><defs><linearGradient id="rim" x2="0" y2="1"><stop stop-color="#ffd0bd"/><stop offset=".3" stop-color="#8a4a38"/><stop offset="1" stop-color="#583c2c"/></linearGradient><linearGradient id="face" x2=".3" y2="1"><stop stop-color="#ff7962"/><stop offset=".55" stop-color="#f96952"/><stop offset="1" stop-color="#c84b39"/></linearGradient></defs><rect x="2" y="2" width="464" height="228" rx="26" fill="url(#rim)"/><rect x="9" y="9" width="448" height="208" rx="19" fill="url(#face)" stroke="#a84a34" stroke-width="3"/><path d="M34 13H430Q453 13 453 36V186" fill="none" stroke="#ffb499" stroke-width="4"/><path d="M17 190Q17 212 40 212H430" fill="none" stroke="#c44931" stroke-width="4"/></svg>'''
(out / 'keycap-coral-xl.svg').write_text(key)
manifest['keycap-coral-xl.svg'] = {'viewBox': [0, 0, 468, 232]}

(out / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
print('wrote', out)
