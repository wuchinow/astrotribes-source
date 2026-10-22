# Swiss Ephemeris data files

Read at runtime by `lib/engine/swisseph.ts` (`set_ephe_path`). Without them Swiss Ephemeris falls back to the Moshier model, which has no Chiron, so the engine refuses to answer (`ephemeris_unavailable`).

| File | Bytes | Covers | SHA-256 |
| --- | --- | --- | --- |
| `sepl_18.se1` | 484061 | Planets, 1800 to 2399 | `ca1393ceab3a44fbc895887cf789c68819ae6a1cbc9b22225872dbe4ccd99a66` |
| `semo_18.se1` | 1304771 | Moon, 1800 to 2399 | `1ca07bd67c24374d77226180c20a4f9996cba013697894810518e7eb582ca4f7` |
| `seas_18.se1` | 223004 | Main asteroids including Chiron, 1800 to 2399 | `a2cd8fc33807c78ca9a700c91c2e042258b12fc4796519e00781440b5ad8b2e2` |
| `sefstars.txt` | 136618 | Fixed stars; the engine reads only "Galactic Center" (Sgr A*) | `18b0dcafbe5b7240773daba2c038a325f5b3fc4163f61e0a7f4e92abd4f517c6` |

Built by Astrodienst from JPL DE441 (Apr and May 2026). Source: [aloistr/swisseph](https://github.com/aloistr/swisseph/tree/9083a12d59e98034fb2337061481ac8800c16e64/ephe), commit `9083a12d59e98034fb2337061481ac8800c16e64`, fetched Sep 24, 2026. Unmodified.

Licence: Swiss Ephemeris, Astrodienst AG, dual-licensed under AGPL-3.0 or the Swiss Ephemeris Professional License. The build uses AGPL, with the engine routes behind the preview passcode until Dawa chooses the Professional License or a hosted API before launch (brief, Chart engine). The `sweph` binding is AGPL-3.0, or LGPL-3.0 for Professional License holders.

On Vercel these files are not imported, so each engine route lists them in `outputFileTracingIncludes` in `next.config.ts` (from 1b: `/api/chart`), with `./node_modules/sweph/prebuilds/linux-x64/**/*` (the tracer misses `node-gyp-build`'s lookup) and `./node_modules/geo-tz/data/timezones.geojson.*`.
