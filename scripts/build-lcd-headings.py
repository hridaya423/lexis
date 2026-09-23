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
    "hero": ["In your", "own words."],
    "examples": ["What needs doing?"],
    "review": ["The last word", "is yours."],
    "install": ["Make it", "your", "terminal."],
}

for name, lines in headings.items():
    bitmap = Image.new("L", (max(round(face.getlength(line)) for line in lines), len(lines) * 14))
    draw = ImageDraw.Draw(bitmap)
    draw.fontmode = "1"
    for row, line in enumerate(lines):
        draw.text((0, row * 14), line, font=face, fill=255)
    bitmap = bitmap.crop(bitmap.getbbox())
    assert set(bitmap.tobytes()) <= {0, 255}, "Render glyphs at their native pixel size"
    width, height = bitmap.size
    cells = []
    for y in range(height):
        for x in range(width):
            if bitmap.getpixel((x, y)) >= 128:
                for dy in range(2):
                    for dx in range(2):
                        cells.append(f"M{x * 2 + dx + 0.07:g} {y * 2 + dy + 0.07:g}h.86v.86h-.86z")
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width * 2} {height * 2}" fill="currentColor"><path d="{"".join(cells)}"/></svg>\n'
    (root / f"public/lexis-prompt/heading-{name}.svg").write_text(svg)
    print(f"{name}: {width * 2} / {height * 2}, {len(cells)} cells")
