"""The footer's enso as ink alone (4m, David, Nov 9: "more padding between circle and frame. or no bg").

Reads the enso's own web cut (public/art/p5-enso, 448px, from scripts/art.mjs) and writes
public/enso/enso-ink.webp: white where the brush is, clear where the paper was, with the paper's
grain levelled away. The footer paints it in the ink token through a CSS mask, so it reads dark on
Paper and light on Night with no paper square around it. Run by hand after the enso is recut:

    python3 scripts/enso-ink.py

Needs numpy and pillow.
"""

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = next((ROOT / 'public/art/p5-enso').glob('p5-enso-crop-448.*.webp'))
OUT = ROOT / 'public/enso/enso-ink.webp'

# Luminance at or above PAPER is paper (clear); at or below INK is full ink.
PAPER = 165.0
INK = 70.0

image = np.asarray(Image.open(SOURCE).convert('L'), dtype=np.float32)
alpha = np.clip((PAPER - image) / (PAPER - INK), 0.0, 1.0)
rgba = np.zeros((*alpha.shape, 4), dtype=np.uint8)
rgba[..., :3] = 255
rgba[..., 3] = np.round(alpha * 255).astype(np.uint8)
OUT.parent.mkdir(parents=True, exist_ok=True)
Image.fromarray(rgba, 'RGBA').save(OUT, 'WEBP', quality=90, method=6)
print(f'{OUT.relative_to(ROOT)} from {SOURCE.relative_to(ROOT)}')
