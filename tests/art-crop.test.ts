import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ART, FRAMED, TEXTURE_CROPS, TRIBE_CROPS, WASHES, cutIsFree, marksCut, type ArtId, type Box } from '@/lib/art';
import { SIGN_IDS } from '@/lib/keys';
import files from '@/lib/art-files.json';

const root = process.cwd();
const ids = Object.keys(ART) as ArtId[];
const within = (box: Box, [w, h]: readonly [number, number]) =>
  box[0] >= 0 && box[1] >= 0 && box[2] > 0 && box[3] > 0 && box[0] + box[2] <= w && box[1] + box[3] <= h;

describe('the art manifest', () => {
  it.each(ids)('%s: every box lies inside its source, and every cut inside the crop', (id) => {
    const piece = ART[id];
    expect(within(piece.crop, piece.size)).toBe(true);
    for (const mark of piece.marks) expect(within(mark.box, piece.size), mark.label).toBe(true);
    for (const [name, cut] of Object.entries(piece.cuts)) {
      expect(within(cut.box, piece.size), name).toBe(true);
      const [cx, cy, cw, ch] = piece.crop;
      const [x, y, w, h] = cut.box;
      expect(x >= cx && y >= cy && x + w <= cx + cw && y + h <= cy + ch, `${id} ${name} inside the crop`).toBe(true);
      for (const width of cut.widths) expect(width, `${id} ${name} never upscaled`).toBeLessThanOrEqual(cut.box[2]);
    }
  });

  it.each(ids)('%s: no crop box or cut passes through a marked signature or seal', (id) => {
    const piece = ART[id];
    expect(marksCut(piece, piece.crop).map((m) => m.label)).toEqual([]);
    for (const [name, cut] of Object.entries(piece.cuts)) {
      expect(marksCut(piece, cut.box).map((m) => `${name}: ${m.label}`)).toEqual([]);
    }
  });

  it('crops further only where no mark is inside: strips and thumbnails use mark-free cuts', () => {
    for (const piece of Object.values(WASHES)) {
      const cuts = piece.cuts as Record<string, { box: Box }>;
      expect(cutIsFree(piece, cuts[piece.use.strip].box), `${piece.stem} strip`).toBe(true);
      expect(cutIsFree(piece, cuts[piece.use.thumb].box), `${piece.stem} thumbnail`).toBe(true);
    }
    // P2 gives each Tribe card a window (TRIBE_CROPS) and P3 fills the next step's edge, cropped by cover.
    expect(cutIsFree(FRAMED.p2, FRAMED.p2.cuts.crop.box)).toBe(true);
    expect(cutIsFree(FRAMED.p3, FRAMED.p3.cuts.crop.box)).toBe(true);
  });

  it('the 12 Tribe cards each show their own window of P2, inside its served cut and clear of any mark', () => {
    const cut = FRAMED.p2.cuts.crop.box;
    expect(Object.keys(TRIBE_CROPS).sort()).toEqual([...SIGN_IDS].sort());
    const boxes = Object.entries(TRIBE_CROPS) as Array<[string, Box]>;
    for (const [sign, box] of boxes) {
      expect(within(box, [cut[0] + cut[2], cut[1] + cut[3]]), `${sign} inside P2`).toBe(true);
      expect(box[2] / box[3], `${sign} is 2:1`).toBe(2);
      expect(marksCut(FRAMED.p2, box).map((m) => m.label), sign).toEqual([]);
    }
    // Different windows: no two share more than a quarter of their area.
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const [a, b] = [boxes[i][1], boxes[j][1]];
        const w = Math.max(0, Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0]));
        const h = Math.max(0, Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]));
        expect((w * h) / (a[2] * a[3]), `${boxes[i][0]} and ${boxes[j][0]}`).toBeLessThanOrEqual(0.25);
      }
    }
  });

  it('textures crop only mark-free cuts, and every texture crop covers its section', () => {
    // A texture zooms into its cut (TEXTURE_CROPS), so the cut must hold no seal or signature at all.
    for (const piece of Object.values(WASHES)) {
      const cuts = piece.cuts as Record<string, { box: Box }>;
      expect(cutIsFree(piece, cuts[piece.use.texture].box), `${piece.stem} texture`).toBe(true);
    }
    for (const [name, crop] of Object.entries(TEXTURE_CROPS)) {
      // Laid with cover and scaled by at least 1, the layer always fills the section.
      expect(crop.scale, name).toBeGreaterThanOrEqual(1);
      for (const v of crop.origin) expect(v >= 0 && v <= 100, `${name} origin`).toBe(true);
    }
  });

  it("the landing's textures reuse the hero's painting and never touch the hero", () => {
    const page = readFileSync(path.join(root, 'app/(public)/page.tsx'), 'utf8');
    const hero = /<ArtWash piece="(\w+)" top>/.exec(page)![1];
    const textures = [...page.matchAll(/texture=\{\{ piece: '(\w+)'/g)].map((m) => m[1]);
    // How it works only: The Keys dropped its texture in 1h, when its cards took sky images.
    expect(textures.length).toBe(1);
    for (const piece of textures) expect(piece).toBe(hero);
    // The section after the hero carries no texture.
    const afterHero = page.slice(page.indexOf('</ArtWash>')).match(/<Section[^>]*>/)![0];
    expect(afterHero).not.toContain('texture');
  });

  it('a Night alternate is another wash, and P7 shows P9 on Night (David, Sep 25 evening)', () => {
    for (const piece of Object.values(WASHES) as Array<(typeof WASHES)[keyof typeof WASHES] & { night?: string }>) {
      if (!piece.night) continue;
      expect(piece.night in WASHES, `${piece.stem} night`).toBe(true);
      expect(WASHES[piece.night as keyof typeof WASHES].stem).not.toBe(piece.stem);
    }
    expect((WASHES.p7 as { night?: string }).night).toBe('p9');
  });

  it('P7 and P9 use the confirmed windows: wide at desktop, tall on phones (David, Sep 25)', () => {
    expect(WASHES.p7.use).toMatchObject({ lg: 'wide', sm: 'tall' });
    expect(WASHES.p9.use).toMatchObject({ lg: 'wide', sm: 'tall' });
    // The wide P7 window keeps the left seal column whole.
    const column = WASHES.p7.marks.find((m) => m.label.includes('left column'))!;
    const wide = WASHES.p7.cuts.wide.box;
    expect(column.box[1] >= wide[1] && column.box[1] + column.box[3] <= wide[1] + wide[3]).toBe(true);
  });

  // The caption names the medium for the About page; the site shows none under a piece (1h).
  it('every piece is a flagged placeholder with a caption, and the web-size sources are noted', () => {
    for (const id of ids) {
      const piece = ART[id];
      expect(piece.approved).toBe(false);
      expect(piece.caption).toMatch(/^(Painting|Collage|Calligraphy) by Jane Kwan$/);
      expect(piece.alt.length).toBeGreaterThan(20);
    }
    for (const p of ['P1', 'P2', 'P3', 'P4', 'P5', 'P8']) {
      const piece = Object.values(ART).find((a) => a.p === p)!;
      expect(piece.source_note, p).toBe('web-size file; ask Jane for the original');
    }
    expect(WASHES.p10.orientation).toBe('unconfirmed');
  });

  it('framed pieces render no wider than half their cropped pixels', () => {
    for (const piece of Object.values(FRAMED)) {
      if (piece.stem === 'p2-black-arch') continue; // accepted at 1x in the Tribe cards (David, Sep 25)
      expect(piece.maxCssWidth).toBe(Math.floor(piece.crop[2] / 2));
    }
  });
});

describe('nothing renders a piece that is not in the manifest', () => {
  const stems = new Set(Object.values(ART).map((a) => a.stem));

  it('every file in public/art belongs to a manifest piece and is listed in lib/art-files.json', () => {
    const listed = new Set(
      Object.values(files as Record<string, Record<string, { files: Record<string, Record<string, unknown>> }>>)
        .flatMap((cuts) => Object.values(cuts))
        .flatMap((cut) => Object.values(cut.files))
        .flatMap((file) => [(file.avif as { src: string }).src, (file.webp as { src: string }).src]),
    );
    const dir = path.join(root, 'public/art');
    for (const entry of readdirSync(dir)) {
      expect(statSync(path.join(dir, entry)).isDirectory(), `public/art/${entry} is a piece folder`).toBe(true);
      expect(stems.has(entry), `public/art/${entry} is in lib/art.ts`).toBe(true);
      for (const file of readdirSync(path.join(dir, entry))) {
        expect(listed.has(`/art/${entry}/${file}`), `/art/${entry}/${file} is a current cut`).toBe(true);
      }
    }
  });

  it('no page or component points at an art file directly', () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (statSync(full).isDirectory()) walk(full);
        else if (/\.(tsx?|css)$/.test(entry) && /["'(]\/?(?:public\/)?art\//.test(readFileSync(full, 'utf8'))) {
          offenders.push(path.relative(root, full));
        }
      }
    };
    for (const dir of ['app', 'components', 'content']) walk(path.join(root, dir));
    expect(offenders).toEqual([]);
  });
});
