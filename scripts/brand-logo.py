# Draws the sun and moon logo (David, Oct 21: Figma Frame 72, Cinzel Bold) as SVG in public/brand/.
# Run by hand from repo/ after the mark or wordmark changes: `python3 scripts/brand-logo.py <cinzel-700.woff>`.
# Needs fontTools (`pip install fonttools brotli`) and Cinzel Bold (OFL, @fontsource/cinzel
# files/cinzel-latin-700-normal.woff); the font is read here only, the site ships the outlines.
#
# Every file draws in currentColor with its root `color` set, like the old mono files:
#   logo-mono.svg   the horizontal lockup, one ink (the share card tints its root color)
#   logo-ink.svg    the crescent and wordmark only, same viewBox (the Logo component's first mask)
#   logo-rays.svg   the rays only, same viewBox (the second mask, in gold)
#   glyph-mono.svg, glyph-ink.svg, glyph-rays.svg   the mark alone, likewise
#   glyph-icon-ink.svg, glyph-icon-rays.svg   the mark with 16 heavier rays, for the favicons
# The crescent opens to the right, like the lockup (David's rule for the glyph alone).
import math
import sys

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

INK = '#1e1a17'
R, D, RI = 100.0, 41.3, 89.8  # outer circle, offset and radius of the circle cut from it


def n(v):
    s = f'{v:.1f}'
    return s[:-2] if s.endswith('.0') else s


def crescent():
    x = (R * R - RI * RI + D * D) / (2 * D)
    y = math.sqrt(R * R - x * x)
    return f'M{n(x)} {n(-y)}A{n(R)} {n(R)} 0 1 0 {n(x)} {n(y)}A{n(RI)} {n(RI)} 0 1 1 {n(x)} {n(-y)}Z'


def rays(count=48, inner=119, compass=222, even=200, odd=168):
    d = ''
    for i in range(count):
        a = i * 2 * math.pi / count
        outer = compass if i % (count // 4) == 0 else (even if i % 2 == 0 else odd)
        d += f'M{n(inner * math.cos(a))} {n(inner * math.sin(a))}L{n(outer * math.cos(a))} {n(outer * math.sin(a))}'
    return d


def wordmark(font, cap_height, x, baseline, track):
    glyphs, cmap, upm = font.getGlyphSet(), font.getBestCmap(), font['head'].unitsPerEm
    scale = cap_height / (font['OS/2'].sCapHeight or upm * 0.7)
    d = ''
    for ch in 'ASTROTRIBES':
        name = cmap[ord(ch)]
        pen = SVGPathPen(glyphs, ntos=n)
        glyphs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, x, baseline)))
        d += pen.getCommands()
        x += font['hmtx'][name][0] * scale + track * cap_height
    return d, x - track * cap_height


def svg(box, body):
    v = ' '.join(n(b) for b in box)
    return f'<svg xmlns="http://www.w3.org/2000/svg" fill="none" color="{INK}" viewBox="{v}">{body}</svg>\n'


def write(name, box, ink='', ray='', width=0):
    parts = []
    if ray:
        parts.append(f'<path stroke="currentColor" stroke-linecap="round" stroke-width="{n(width)}" d="{ray}"/>')
    if ink:
        parts.append(f'<path fill="currentColor" d="{ink}"/>')
    with open(f'public/brand/{name}.svg', 'w') as f:
        f.write(svg(box, ''.join(parts)))


def main(font_path):
    font = TTFont(font_path)
    width = 4.2
    edge = 222 + width / 2
    # Lockup: the wordmark's cap height is 22% of the mark, a gap of 34 units, both centred.
    cap = 2 * edge * 0.22
    word, end = wordmark(font, cap, edge + 34, cap / 2, 0.23)
    lockup = (-edge, -edge, end + edge, 2 * edge)
    ink = crescent() + word
    write('logo-mono', lockup, ink, rays(), width)
    write('logo-ink', lockup, ink)
    write('logo-rays', lockup, '', rays(), width)
    mark = (-edge, -edge, 2 * edge, 2 * edge)
    write('glyph-mono', mark, crescent(), rays(), width)
    write('glyph-ink', mark, crescent())
    write('glyph-rays', mark, '', rays(), width)
    # The favicon mark: 16 rays at 10 units so they hold at 32px.
    icon_edge = 192 + 5
    icon = (-icon_edge, -icon_edge, 2 * icon_edge, 2 * icon_edge)
    write('glyph-icon-ink', icon, crescent())
    write('glyph-icon-rays', icon, '', rays(16, 124, 192, 172, 160), 10)
    print(f'lockup viewBox {" ".join(n(b) for b in lockup)}')


if __name__ == '__main__':
    main(sys.argv[1])
