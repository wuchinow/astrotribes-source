import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';
import { shareCopy } from '@/content/chart';
import { THREE, parseShare, signText, type SignReading } from '@/lib/free-chart';
import { readTokens } from '@/lib/tokens';

// The share card: text, and the logo in its Paper tone, from the signs in the URL only. No glyphs
// (none is reviewed yet, and a card travels off the noindex site), no art, no key names (a card
// has no room for Dawa's gloss). Fonts and the logo are traced in next.config.ts.

export const alt = 'Three signs shared from AstroTribes';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const root = process.cwd();
const fonts = Promise.all(
  ['Fraunces-Display-Regular', 'Fraunces-Display-Italic', 'NunitoSans-Regular', 'NunitoSans-SemiBold'].map(
    (name) => readFile(path.join(root, 'assets/fonts', `${name}.ttf`)),
  ),
);
const paper = readTokens().paper;
const color = (token: string) => paper[token];
// The mono lockup draws in currentColor; its root `color` becomes the logo token's Paper tone and
// its rays (the one stroked path) take gold-500, as the Logo component draws them on Paper.
const logo = readFile(path.join(root, 'public/brand/logo-mono.svg'), 'utf8').then((svg) => {
  const tinted = svg
    .replace(/^(<svg[^>]*?)\scolor="[^"]*"/, `$1 color="${color('logo')}"`)
    .replace('stroke="currentColor"', `stroke="${color('gold-500')}"`);
  if (!tinted.includes(color('logo')) || !tinted.includes(color('gold-500'))) {
    throw new Error('logo-mono.svg has no root color or rays to tint');
  }
  return `data:image/svg+xml;base64,${Buffer.from(tinted).toString('base64')}`;
});

const LABEL = { sun: 'Sun', moon: 'Moon', rising: 'Rising' } as const;

export default async function Image({ params }: { params: Promise<{ sun: string; moon: string; rising: string }> }) {
  const { sun, moon, rising } = await params;
  const chart = parseShare(sun, moon, rising);
  if (!chart) notFound();

  const [displayRegular, displayItalic, bodyRegular, bodySemiBold] = await fonts;
  const logoSrc = await logo;
  const reading = (body: (typeof THREE)[number]): SignReading | null =>
    body === 'rising' ? chart.rising : chart[body];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: color('surface-100'),
          color: color('ink-900'),
          fontFamily: 'Nunito Sans',
        }}
      >
        {/* The lockup in the logo token's Paper tone, deep plum (design system v16). */}
        <img src={logoSrc} width={310} height={80} alt="" />
        <div style={{ display: 'flex', gap: 48 }}>
          {THREE.map((body) => {
            const value = reading(body);
            const text = value ? signText(value) : shareCopy.risingUnknown;
            return (
              <div
                key={body}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  borderTop: `2px solid ${color('ink-200')}`,
                  paddingTop: 20,
                }}
              >
                <div style={{ fontSize: 30, fontWeight: 600, color: color('ink-500') }}>{LABEL[body]}</div>
                <div
                  style={{
                    fontFamily: 'Fraunces',
                    fontStyle: value ? 'normal' : 'italic',
                    fontSize: value ? (value.candidates ? 50 : 76) : 40,
                    lineHeight: 1.1,
                    marginTop: 8,
                    color: value ? color('ink-900') : color('ink-500'),
                  }}
                >
                  {text}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', fontSize: 28, color: color('ink-700') }}>{shareCopy.cta}</div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Fraunces', data: displayRegular, style: 'normal', weight: 400 },
        { name: 'Fraunces', data: displayItalic, style: 'italic', weight: 400 },
        { name: 'Nunito Sans', data: bodyRegular, style: 'normal', weight: 400 },
        { name: 'Nunito Sans', data: bodySemiBold, style: 'normal', weight: 600 },
      ],
    },
  );
}
