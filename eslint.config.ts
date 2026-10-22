import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { KEY_LIST, RETIRED_KEY_NAMES } from './lib/keys';

// Copy and keys guards. Key names, current and retired, come from lib/keys.ts, so this file types none.
// Tribe is also the brand noun (AstroTribes, the 12 Tribes) and may appear in copy.
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const keyNames = [...KEY_LIST.map((k) => k.name), ...RETIRED_KEY_NAMES].filter((name) => name !== 'Tribe');
const keyNamePattern = `\\b(?:${keyNames.map(escape).join('|')})\\b`;

const KEY_MESSAGE =
  'Key names, current or retired, are typed only in lib/keys.ts. Import the key (KEYS.x.name) or use KeyChip.';
const EM_DASH_MESSAGE = 'No em-dashes in copy. Use a comma, a period, or a colon.';
const EXCLAMATION_MESSAGE = 'No exclamation marks in copy.';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
  {
    files: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'content/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: `JSXText[value=/${keyNamePattern}/]`, message: KEY_MESSAGE },
        { selector: `Literal[value=/${keyNamePattern}/]`, message: KEY_MESSAGE },
        { selector: `TemplateElement[value.raw=/${keyNamePattern}/]`, message: KEY_MESSAGE },
        { selector: 'JSXText[value=/\u2014/]', message: EM_DASH_MESSAGE },
        { selector: 'Literal[value=/\u2014/]', message: EM_DASH_MESSAGE },
        { selector: 'TemplateElement[value.raw=/\u2014/]', message: EM_DASH_MESSAGE },
        { selector: 'JSXText[value=/!/]', message: EXCLAMATION_MESSAGE },
        {
          selector:
            'JSXAttribute[name.name=/^(alt|title|placeholder|aria-label|aria-description)$/] > Literal[value=/!/]',
          message: EXCLAMATION_MESSAGE,
        },
      ],
    },
  },
  {
    // Invariant 9: the free chart's server code never logs. Every error is answered as a code.
    files: [
      'proxy.ts',
      'app/api/**/*.ts',
      'lib/preview.ts',
      'lib/rate-limit.ts',
      'lib/chart-request.ts',
      'lib/geoapify.ts',
      'lib/free-chart.ts',
      'components/FreeChart.tsx',
      'components/PlaceCombobox.tsx',
      'components/ShareButton.tsx',
    ],
    rules: { 'no-console': 'error' },
  },
]);
