// Writes lib/tune-base.json: every color token's resolved value in both moods (from app/tokens.css)
// with its usage line (from the design system mirror), for the Tune section (1f). Run by hand after
// any change to the token layer: node scripts/tune-base.mjs. tests/tune.test.ts fails until it is.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const css = readFileSync(path.join(root, 'app/tokens.css'), 'utf8');
const mirror = JSON.parse(readFileSync(path.join(root, 'docs/design-system/tokens.json'), 'utf8'));

// The same parse as lib/tokens.ts.
function block(selector) {
  const start = css.indexOf(selector);
  const open = css.indexOf('{', start);
  return css.slice(open + 1, css.indexOf('}', open));
}
function variables(body) {
  const values = {};
  for (const m of body.matchAll(/--([\w-]+):\s*([^;]+);/g)) values[m[1]] = m[2].trim();
  for (const [name, value] of Object.entries(values)) {
    const ref = /^var\(--([\w-]+)\)$/.exec(value);
    if (ref && values[ref[1]]) values[name] = values[ref[1]];
  }
  return values;
}

const paper = variables(block('[data-theme="paper"]'));
const night = variables(block('[data-theme="night"] {'));
const usage = Object.fromEntries(mirror.color.tokens.map((t) => [t.name, t.usage]));
const tokens = Object.keys(paper)
  .filter((name) => /^#[0-9a-f]{6}$/i.test(paper[name]) && /^#[0-9a-f]{6}$/i.test(night[name] ?? ''))
  .map((name) => ({ name, paper: paper[name].toLowerCase(), night: night[name].toLowerCase(), usage: usage[name] ?? '' }));

const out = { $source: 'Written by scripts/tune-base.mjs from app/tokens.css and docs/design-system/tokens.json. Do not edit.', version: String(mirror.version), tokens };
writeFileSync(path.join(root, 'lib/tune-base.json'), `${JSON.stringify(out, null, 2)}\n`);
console.log(`lib/tune-base.json: ${tokens.length} color tokens, tokens v${mirror.version}`);
