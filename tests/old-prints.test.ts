import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import files from '@/lib/old-prints-files.json';
import { CARTOONS, PLATES, TRIBE_CARTOON, oldPrintSet } from '@/lib/old-prints';
import { SIGN_IDS } from '@/lib/keys';
import { pictureCreditLines } from '@/lib/sky-credits';

const cut = files as Record<string, { files: Record<string, { avif: { src: string }; webp: { src: string } }> }>;

describe('old prints on the Tribe pages', () => {
  it('gives every Tribe a star card and an engraving, each cut and on disk', () => {
    for (const sign of SIGN_IDS) {
      for (const id of [`plate-${sign}`, `cartoon-${TRIBE_CARTOON[sign]}`]) {
        expect(cut[id], id).toBeDefined();
        for (const variant of Object.values(cut[id].files)) {
          for (const file of [variant.avif, variant.webp]) {
            expect(existsSync(path.join('public', file.src)), file.src).toBe(true);
          }
        }
        expect(oldPrintSet(id).width).toBeGreaterThanOrEqual(384);
      }
    }
  });

  it('describes every print for alt text', () => {
    for (const print of [...Object.values(PLATES), ...Object.values(CARTOONS)]) {
      expect(print.alt.length).toBeGreaterThan(40);
      expect(print.alt).toMatch(/^(A hand-colored star card from 1824|An engraving from 1844): /);
    }
  });

  it('credits them in the footer of every Tribe page', () => {
    for (const sign of SIGN_IDS) {
      expect(pictureCreditLines[`/tribes/${sign}`]).toMatch(/Urania’s Mirror.*Grandville/);
    }
  });
});
