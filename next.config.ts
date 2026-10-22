import type { NextConfig } from 'next';

const headers = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  // Until launch the placeholder stays out of search results. Remove at launch
  // (docs/architecture.md, launch checklist), with robots in app/layout.tsx.
  { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
];

// Files read at runtime that the tracer cannot see (M16). The engine: node-gyp-build finds the
// sweph binary by a runtime lookup, and the ephemeris and zone files are opened by path
// (lib/engine/ephe/README.md). The share card: its fonts, the logo, and the token layer.
const ENGINE_FILES = [
  './lib/engine/ephe/**/*',
  './node_modules/sweph/prebuilds/linux-x64/**/*',
  './node_modules/geo-tz/data/timezones.geojson.*',
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The chart engine's native binding and the zone lookup read files at runtime, so Node loads
  // them from node_modules rather than the bundle.
  serverExternalPackages: ['sweph', 'geo-tz'],
  outputFileTracingIncludes: {
    '/api/chart': ENGINE_FILES,
    '/share/**': ['./assets/fonts/*.ttf', './public/brand/logo-mono.svg', './app/tokens.css'],
  },
  // Development logging stays quiet about anything a request carried (invariant 9): no fetch URLs
  // (the Geoapify URL holds the typed place and the key), no server function calls, and no
  // browser console forwarded to the terminal. Production has no such logging.
  logging: {
    fetches: { fullUrl: false },
    serverFunctions: false,
    browserToTerminal: false,
  },
  async headers() {
    return [
      { source: '/:path*', headers },
      // Jane's cuts carry a content hash in their names (scripts/art.mjs), so they never change in place.
      { source: '/art/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
      // The Oracle's cards and the inked sky are content-hashed the same way (scripts/tarot-art.mjs, scripts/ink-sky.mjs).
      { source: '/tarot/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
      { source: '/sky-images/:stem/:file', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    ];
  },
};

export default nextConfig;
