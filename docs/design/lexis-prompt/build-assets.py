from pathlib import Path
import json
from PIL import Image
import numpy as np

root = Path(__file__).resolve().parent
out = root / 'assets'
out.mkdir(exist_ok=True)
specs = {
    'heading-hero': ('01-hero.png', (65, 170, 1240, 565), 'In your own words.'),
    'heading-examples': ('02-examples.png', (70, 125, 1085, 250), 'What needs doing?'),
    'heading-review': ('03-review.png', (65, 235, 1050, 585), 'The last word is yours.'),
    'heading-install': ('04-install.png', (60, 190, 670, 590), 'Make it your terminal.'),
}
manifest = {}
for name, (source, box, label) in specs.items():
    image = np.array(Image.open(root / 'references' / source).convert('RGB'))
    left, top, right, bottom = box
    mask = image[top:bottom, left:right].max(axis=2) < 100
    ys, xs = np.where(mask)
    x0, y0, x1, y1 = int(xs.min()), int(ys.min()), int(xs.max()+1), int(ys.max()+1)
    mask = mask[y0:y1, x0:x1]
    runs = []
    active = {}
    for y, row in enumerate(mask):
        edges = np.diff(np.concatenate(([False], row, [False])).astype(int))
        spans = list(zip(np.where(edges == 1)[0], np.where(edges == -1)[0]))
        next_active = {}
        for a, b in spans:
            key = (int(a), int(b))
            if key in active:
                start, height = active.pop(key)
                next_active[key] = (start, height+1)
            else:
                next_active[key] = (y, 1)
        for (a,b), (start,height) in active.items():
            runs.append((a,start,b-a,height))
        active = next_active
    for (a,b), (start,height) in active.items():
        runs.append((a,start,b-a,height))
    path = ''.join(f'M{x} {y}h{w}v{h}h-{w}z' for x,y,w,h in runs)
    w, h = x1-x0, y1-y0
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" fill="currentColor"><path d="{path}"/></svg>'
    (out / f'{name}.svg').write_text(svg)
    manifest[f'{name}.svg'] = {'viewBox':[0,0,w,h], 'text':label, 'reference':source, 'sourceBounds':[left+x0,top+y0,left+x1,top+y1], 'method':'Thresholded ink geometry, merged horizontal runs; no embedded raster', 'pathRectangles':len(runs)}

cells=json.loads((out/'footer-wordmark-cells.json').read_text())
path=''.join(f'M{x} {y}h{cells["cellSize"]}v{cells["cellSize"]}h-{cells["cellSize"]}z' for x,y in cells['cells'])
w,h=cells['width'],cells['height']
(out/'footer-wordmark.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" fill="currentColor"><path d="{path}"/></svg>')
manifest['footer-wordmark.svg']={'viewBox':[0,0,w,h], 'text':'lexis', 'method':'Natural-proportion bold grotesk sampled into regular square cells', 'cells':len(cells['cells']), 'reference':'05-footer-composition.png', 'adaptation':'Full uncropped wordmark, as requested; no squashing'}
(out/'lcd-substrate.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6"><path d="M0 .3H6M.3 0V6" fill="none" stroke="#182510" stroke-width=".6" stroke-opacity=".035"/></svg>')
manifest['lcd-substrate.svg']={'viewBox':[0,0,6,6], 'purpose':'Optional subtle repeated background tile; never scale with viewport'}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({k:v['viewBox'] for k,v in manifest.items()},indent=2))
