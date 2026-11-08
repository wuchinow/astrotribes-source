"""Brush-style stand-in glyphs, not Dawa's: the North Node (the Galactic Center and the Rising once;
Dawa's own Rising replaced its stand-in on Nov 8).

A local tool, run by hand from repo/: `python3 scripts/brush-glyphs.py` (needs potracer,
numpy, and pillow from pip). It reads nothing: each glyph is drawn from scratch as dry-brush
strokes (a row of bristles that run dry toward the end of a stroke), in the manner of Dawa's set,
fitted to 88 of a 96 viewBox like scripts/trace-glyphs.mjs, traced with potrace, and written to
public/glyphs/ with <g id="glyph"> and no fill. The seed fixes the drawing, so a rerun gives the
same files. It stays `placeholder: true` in lib/glyphs.ts until Dawa brushes his own.
Usage: brush-glyphs.py [outdir] [seed]
"""
import math
import sys

import numpy as np
import potrace
from PIL import Image, ImageDraw

BIG = 2400
CANVAS = 1024
ART = CANVAS * 88 / 96


def smooth_noise(rng, n, knots, amp):
    xs = np.linspace(0, 1, knots)
    ys = rng.normal(0, amp, knots)
    return np.interp(np.linspace(0, 1, n), xs, ys)


def stroke(draw, rng, pts, width, dry=0.38, press=0.18, taper=0.25, bristles=46, splits=4):
    """pts: centerline (N x 2). width in px. dry: share of the stroke's end where bristles drop out."""
    pts = np.asarray(pts, float)
    n = len(pts)
    t = np.linspace(0, 1, n)
    d = np.gradient(pts, axis=0)
    d /= np.linalg.norm(d, axis=1, keepdims=True) + 1e-9
    normal = np.stack([-d[:, 1], d[:, 0]], axis=1)
    # Pressure: a firm press at the start, a slow lift at the end.
    w = width * (0.78 + 0.22 * np.clip(t / max(press, 1e-3), 0, 1))
    w *= 1 - 0.55 * np.clip((t - (1 - taper)) / taper, 0, 1) ** 1.6
    w *= 1 + smooth_noise(rng, n, 9, 0.06) + smooth_noise(rng, n, 45, 0.035)
    for k in range(bristles):
        u = (k / (bristles - 1)) * 2 - 1
        edge = abs(u)
        u += smooth_noise(rng, n, 14, 0.025) + smooth_noise(rng, n, 50, 0.012 * edge ** 3)
        # Edge bristles run dry first; a few in the middle split for a while.
        end = 1 - 0.06 * rng.random() - (dry * (rng.random() ** 1.2) * (0.25 + 0.75 * edge) if rng.random() < 0.7 else 0)
        start = rng.random() * 0.04 * edge
        alive = (t >= start) & (t <= end)
        for _ in range(rng.poisson(splits * edge ** 2)):
            a = rng.uniform(0.15, 0.95)
            alive &= ~((t > a) & (t < a + rng.uniform(0.03, 0.12)))
        r = max(width / bristles * 1.6, 2.2)
        cx = pts[:, 0] + normal[:, 0] * u * w / 2
        cy = pts[:, 1] + normal[:, 1] * u * w / 2
        for i in range(1, n):
            if alive[i] and alive[i - 1]:
                draw.line([(cx[i - 1], cy[i - 1]), (cx[i], cy[i])], fill=0, width=int(round(r * 2)))
    # Flecks thrown off the dry end.
    for _ in range(rng.integers(3, 8)):
        i = int(n * rng.uniform(1 - dry * 0.6, 1)) - 1
        off = normal[i] * rng.uniform(-0.8, 0.8) * w[i] / 2 + d[i] * rng.uniform(0, width * 0.6)
        x, y = pts[i] + off
        s = rng.uniform(2, 6)
        draw.ellipse([x - s, y - s, x + s, y + s], fill=0)


def arc(cx, cy, r, a0, a1, n=500, wobble=0.0, rng=None, ry=None):
    a = np.linspace(math.radians(a0), math.radians(a1), n)
    rr = r * (1 + (smooth_noise(rng, n, 7, wobble) if rng is not None else 0))
    return np.stack([cx + rr * np.cos(a), cy + (ry or r) / r * rr * np.sin(a)], axis=1)


def north_node(seed):
    rng = np.random.default_rng(seed)
    img = Image.new('L', (BIG, BIG), 255)
    dr = ImageDraw.Draw(img)
    cx, cy = 1200, 1150
    # The arch, one stroke from the left foot up over the top and down to the right.
    arch = arc(cx, cy, 560, 160, 380, wobble=0.02, rng=rng, ry=600)
    stroke(dr, rng, arch, 195, dry=0.3)
    # The two small loops at the feet, each an open circle like Dawa's Venus.
    for end, sign in ((arch[0], -1), (arch[-1], 1)):
        lr = 175
        fx, fy = end[0] + sign * 15, end[1] + lr * 0.9
        a0 = 280 if sign < 0 else -100
        loop = arc(fx, fy, lr, a0, a0 + 340 * sign, n=320, wobble=0.05, rng=rng)
        stroke(dr, rng, loop, 120, dry=0.45, bristles=36)
    return img


def galactic_center(seed):
    rng = np.random.default_rng(seed)
    img = Image.new('L', (BIG, BIG), 255)
    dr = ImageDraw.Draw(img)
    cx, cy = 1200, 1200
    # A spiral of about one and three quarter turns, drawn from the middle out.
    n = 900
    th = np.linspace(0.6, 0.6 + 2 * math.pi * 1.75, n)
    r = 70 + 640 * (th - th[0]) / (th[-1] - th[0])
    r *= 1 + smooth_noise(rng, n, 11, 0.025)
    pts = np.stack([cx + r * np.cos(th), cy - r * np.sin(th)], axis=1)
    stroke(dr, rng, pts, 150, dry=0.35, press=0.08, taper=0.35, bristles=40)
    # The bright core.
    dr.ellipse([cx - 58, cy - 58, cx + 58, cy + 58], fill=0)
    return img


def fit(img):
    a = np.array(img)
    ys, xs = np.where(a < 128)
    box = img.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    s = ART / max(box.size)
    box = box.resize((max(1, round(box.width * s)), max(1, round(box.height * s))), Image.LANCZOS)
    out = Image.new('L', (CANVAS, CANVAS), 255)
    out.paste(box, ((CANVAS - box.width) // 2, (CANVAS - box.height) // 2))
    return out


def fmt(p):
    return f'{p.x:.1f} {p.y:.1f}'


def to_svg(img):
    bm = potrace.Bitmap(np.array(img))
    path = bm.trace(turdsize=12, alphamax=1.0, opticurve=True, opttolerance=0.2)
    d = []
    for curve in path:
        d.append(f'M{fmt(curve.start_point)}')
        for seg in curve:
            if seg.is_corner:
                d.append(f'L{fmt(seg.c)}L{fmt(seg.end_point)}')
            else:
                d.append(f'C{fmt(seg.c1)} {fmt(seg.c2)} {fmt(seg.end_point)}')
        d.append('Z')
    s = 96 / CANVAS
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">'
        f'<g id="glyph" transform="scale({s:.6f})"><path fill-rule="evenodd" d="{"".join(d)}"/></g></svg>\n'
    )


SEED = 7  # the drawing in public/glyphs/, picked from a contact sheet (Nov 4)

if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else 'public/glyphs'
    seed = int(sys.argv[2]) if len(sys.argv) > 2 else SEED
    # The Galactic Center's spiral is retired: public/glyphs/galacticCenter.svg is now traced from
    # the starburst on the old Lovable site (Nov 6), so only the North Node is drawn here.
    for name, fn in (('northNode', north_node),):
        with open(f'{out}/{name}.svg', 'w') as fh:
            fh.write(to_svg(fit(fn(seed))))
        print(f'{out}/{name}.svg')
