from io import BytesIO
from pathlib import Path

from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont


root = Path(__file__).resolve().parents[1]
font = TTFont(root / "app/fonts/DepartureMono-1.500.woff2")
font.flavor = None
buffer = BytesIO()
font.save(buffer)
buffer.seek(0)
face = ImageFont.truetype(buffer, 11)

headings = {
    "examples": ["What needs doing?"],
    "review": ["The last word", "is yours."],
    "install": ["Make it", "your", "terminal."],
}

for name, lines in headings.items():
    line_height = 14
    bitmap = Image.new("L", (max(round(face.getlength(line)) for line in lines), len(lines) * line_height))
    draw = ImageDraw.Draw(bitmap)
    draw.fontmode = "1"
    for row, line in enumerate(lines):
        draw.text((0, row * line_height), line, font=face, fill=255)
    bitmap = bitmap.crop(bitmap.getbbox())
    assert set(bitmap.tobytes()) <= {0, 255}, "Render glyphs at their native pixel size"
    width, height = bitmap.size
    cells = set()
    for y in range(height):
        for x in range(width):
            if bitmap.getpixel((x, y)) >= 128:
                for dy in range(3):
                    for dx in range(3):
                        cells.add((x * 2 + dx, y * 2 + dy))
    path = "".join(f"M{x + 0.07:g} {y + 0.07:g}h.86v.86h-.86z" for x, y in sorted(cells))
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width * 2 + 1} {height * 2 + 1}" fill="currentColor"><path d="{path}"/></svg>\n'
    (root / f"public/lexis-prompt/heading-{name}.svg").write_text(svg)
    print(f"{name}: {width * 2 + 1} / {height * 2 + 1}, {len(cells)} cells")
