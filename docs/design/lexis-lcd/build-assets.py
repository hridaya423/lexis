from pathlib import Path
import json

root = Path(__file__).resolve().parent
assets = root / 'assets'
assets.mkdir(exist_ok=True)

glyphs = {
'I': ['1111111','1111111'] + ['0011100'] * 10 + ['1111111','1111111'],
'n': ['00000000000'] * 4 + ['11101111100','11111111110','11110000111'] + ['11100000111'] * 7,
'o': ['00000000000'] * 4 + ['00111111100','01111111110'] + ['11100000111'] * 6 + ['01111111110','00111111100'],
'u': ['00000000000'] * 4 + ['11100000111'] * 7 + ['11100001111','01111111111','00111110111'],
'r': ['000000000'] * 4 + ['111011110','111111111','111100111'] + ['111000000'] * 7,
'y': ['00000000000'] * 4 + ['11100000111'] * 5 + ['01110001110','00111011100','00011111000','00001110000','00011100000','00111000000','01110000000','11110000000'],
'w': ['0000000000000'] * 4 + ['1110000000111'] * 3 + ['1110011100111'] * 3 + ['0110111110110','0111110111110','0011100011100','0011100011100'],
'd': ['00000000111'] * 4 + ['00111110111','01111111111','11100001111'] + ['11100000111'] * 4 + ['11100001111','01111111111','00111110111'],
's': ['00000000000'] * 4 + ['00111111100','01111111110','11100000000','11110000000','01111111000','00011111110','00000001111','00000000111','11111111110','01111111100'],
'.': ['000'] * 12 + ['111','111']
}
lines = [
[(c,x,w) for c,x,w in [('I',0,84),('n',100,132),('y',304,132),('o',460,132),('u',604,132),('r',748,84)]],
[(c,x,w) for c,x,w in [('o',0,132),('w',140,144),('n',292,132),('w',480,156),('o',644,132),('r',784,100),('d',890,132),('s',1030,132),('.',1166,36)]]
]
rects=[]
for line_index,line in enumerate(lines):
    for glyph,x,width in line:
        rows=glyphs[glyph]
        pitch=width / len(rows[0])
        for row,bits in enumerate(rows):
            for col,bit in enumerate(bits):
                if bit=='1':
                    rects.append(f'<rect x="{x+col*pitch:.3f}" y="{line_index*206+row*14}" width="{pitch-1.25:.3f}" height="12.65"/>')
headline='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1202 402" fill="currentColor"><g>'+''.join(rects)+'</g></svg>'
(assets/'headline-pixels.svg').write_text(headline)
(assets/'headline-map.json').write_text(json.dumps({'glyphs':glyphs,'lines':lines,'viewBox':[0,0,1202,402],'rowPitch':14,'pixelGap':1.25},indent=2)+'\n')

defs='''<defs>
<linearGradient id="edge" x2="0" y2="1"><stop stop-color="#525953"/><stop offset=".09" stop-color="#f4f5f1"/><stop offset=".22" stop-color="#a0a49e"/><stop offset=".79" stop-color="#92948f"/><stop offset=".94" stop-color="#e4e6e1"/><stop offset="1" stop-color="#3a4039"/></linearGradient>
<linearGradient id="metal" x2="0" y2="1"><stop stop-color="#dce0d9"/><stop offset=".1" stop-color="#b6b9b4"/><stop offset=".33" stop-color="#c3c6c0"/><stop offset=".58" stop-color="#a5a8a2"/><stop offset=".82" stop-color="#bfc2bc"/><stop offset="1" stop-color="#e0e1dd"/></linearGradient>
<linearGradient id="screenEdge" x2="0" y2="1"><stop stop-color="#717d69"/><stop offset=".35" stop-color="#202b18"/><stop offset=".75" stop-color="#84927a"/><stop offset="1" stop-color="#eaf0e4"/></linearGradient>
<linearGradient id="screen" x2="0" y2="1"><stop stop-color="#0c1408"/><stop offset=".5" stop-color="#151f0b"/><stop offset="1" stop-color="#263219"/></linearGradient>
<radialGradient id="screw"><stop stop-color="#bec2b9"/><stop offset=".52" stop-color="#e2e5df"/><stop offset=".7" stop-color="#70766c"/><stop offset=".88" stop-color="#2c3328"/><stop offset="1" stop-color="#eff0eb"/></radialGradient>
<pattern id="grain" width="173" height="8" patternUnits="userSpaceOnUse"><path d="M0 .5H173M18 3H157M0 6H134" stroke="#fff" stroke-opacity=".22" stroke-width=".5"/><path d="M31 1.7H172M0 4.5H104M70 7.4H173" stroke="#222b22" stroke-opacity=".14" stroke-width=".5"/></pattern>
<pattern id="screenPixels" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0H4M0 0V4" stroke="#45532d" stroke-width=".35" opacity=".18"/></pattern>
<filter id="brushing" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency=".009 .65" numOctaves="2" seed="17"/><feColorMatrix type="saturate" values="0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
<filter id="shadow" x="-.1" y="-.3" width="1.2" height="1.7"><feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#19250d" flood-opacity=".4"/></filter>
</defs>'''
screw=lambda x: f'<g transform="translate({x} 69)"><circle r="14.4" fill="#666d60"/><circle r="12.5" fill="url(#screw)"/><path d="M-6 0H6M0-6V6" stroke="#172013" stroke-width="3.4" stroke-linecap="round"/><path d="M-5-2H-2V-5" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1"/></g>'
body=f'''<g filter="url(#shadow)"><rect x="2" y="4" width="1476" height="128" rx="21" fill="url(#edge)" stroke="#66725d" stroke-width="1.5"/><rect x="7" y="9" width="1466" height="116" rx="16" fill="url(#metal)"/><rect x="8" y="10" width="1464" height="114" rx="15" fill="url(#grain)"/><rect x="8" y="10" width="1464" height="114" rx="15" fill="#aaa" opacity=".15" filter="url(#brushing)"/><path d="M24 11H1456" stroke="#fff" stroke-opacity=".7"/><path d="M24 124H1456" stroke="#5b6257" stroke-opacity=".7"/>
<rect x="65" y="24" width="1158" height="89" rx="14" fill="url(#screenEdge)"/><rect x="70" y="29" width="1148" height="78" rx="9" fill="url(#screen)" stroke="#37432d" stroke-width="2"/><rect x="72" y="31" width="1144" height="74" rx="7" fill="url(#screenPixels)"/><path d="M80 31H1208" stroke="#000" stroke-opacity=".6" stroke-width="3"/>
<rect x="1235" y="23" width="183" height="91" rx="17" fill="#3c3028"/><rect x="1238" y="26" width="177" height="85" rx="14" fill="#c5c6b8"/>{screw(32)}{screw(1447)}</g>'''
for name,view,width in [('rail-full.svg','0 0 1480 140',1480),('rail-left.svg','0 0 96 140',96),('rail-center.svg','96 0 1092 140',1092),('rail-right.svg','1188 0 292 140',292)]:
    (assets/name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="140" viewBox="{view}" preserveAspectRatio="none">{defs}{body}</svg>')
key='''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 176 86"><defs><linearGradient id="rim" x2="0" y2="1"><stop stop-color="#ffd0bd"/><stop offset=".3" stop-color="#8a4a38"/><stop offset="1" stop-color="#583c2c"/></linearGradient><linearGradient id="face" x2=".3" y2="1"><stop stop-color="#ff7962"/><stop offset=".55" stop-color="#f96952"/><stop offset="1" stop-color="#c84b39"/></linearGradient></defs><rect x="1" y="1" width="174" height="84" rx="12" fill="url(#rim)"/><rect x="4" y="4" width="167" height="75" rx="9" fill="url(#face)" stroke="#a84a34" stroke-width="1.5"/><path d="M14 6H160Q169 6 169 15V66" fill="none" stroke="#ffb499" stroke-width="2"/><path d="M7 69Q7 77 16 77H160" fill="none" stroke="#c44931" stroke-width="2"/></svg>'''
(assets/'keycap-coral.svg').write_text(key)
(assets/'return-arrow.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none"><path d="M32 7V25H7M15 17L7 25L15 33" stroke="currentColor" stroke-width="3" stroke-linecap="square" stroke-linejoin="miter"/></svg>')
(assets/'lcd-grid.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6"><path d="M.5 0V6M0 .5H6" fill="none" stroke="#557c36" stroke-opacity=".22" stroke-width=".65"/><path d="M1.35 0V6M0 1.35H6" fill="none" stroke="#f2ffd8" stroke-opacity=".2" stroke-width=".5"/></svg>')
# darker, highlight-free tile for the dark theme — the pale highlight line
# reads as glowing on dark paper, so dark mode uses only dim ink lines
(assets/'lcd-grid-dark-page.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6"><path d="M.5 0V6M0 .5H6" fill="none" stroke="#9ccb6f" stroke-opacity=".12" stroke-width=".6"/></svg>')
print(f'Built {len(list(assets.glob("*.svg")))} SVG assets')
mobilebody=f'''<rect x="1" y="3" width="358" height="80" rx="12" fill="url(#edge)" stroke="#66725d"/><rect x="4" y="6" width="352" height="73" rx="10" fill="url(#metal)"/><rect x="4" y="6" width="352" height="73" rx="10" fill="url(#grain)"/><rect x="23" y="15" width="240" height="57" rx="8" fill="url(#screenEdge)"/><rect x="26" y="18" width="234" height="50" rx="5" fill="url(#screen)"/><rect x="272" y="15" width="65" height="57" rx="9" fill="#3c3028"/><g transform="translate(12 44)"><circle r="6" fill="url(#screw)"/><path d="M-3 0H3M0-3V3" stroke="#172013" stroke-width="1.5"/></g><g transform="translate(347 44)"><circle r="6" fill="url(#screw)"/><path d="M-3 0H3M0-3V3" stroke="#172013" stroke-width="1.5"/></g>'''
for name,view,width in [('rail-mobile-left.svg','0 0 32 88',32),('rail-mobile-center.svg','32 0 224 88',224),('rail-mobile-right.svg','256 0 104 88',104)]:
    (assets/name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="88" viewBox="{view}" preserveAspectRatio="none">{defs}{mobilebody}</svg>')
mobilekey=key.replace('viewBox="0 0 176 86"','viewBox="0 0 61 50"').replace('width="174" height="84" rx="12"','width="59" height="48" rx="7"').replace('x="4" y="4" width="167" height="75" rx="9"','x="3" y="3" width="54" height="41" rx="5"').replace('M14 6H160Q169 6 169 15V66','M8 5H51Q56 5 56 10V36').replace('M7 69Q7 77 16 77H160','M5 37Q5 43 10 43H51')
(assets/'keycap-coral-mobile.svg').write_text(mobilekey)
