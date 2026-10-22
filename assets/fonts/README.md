# Share image fonts

Read by `app/(public)/share/[sun]/[moon]/[rising]/opengraph-image.tsx` only. The share card is drawn by `ImageResponse` (Satori), which takes TTF, OTF, or WOFF but not the WOFF2 that next/font serves, so it gets its own static copies. The site's pages keep using next/font.

| File | From | Instance | SHA-256 |
| --- | --- | --- | --- |
| `Fraunces-Display-Regular.ttf` | `ofl/fraunces/Fraunces[SOFT,WONK,opsz,wght].ttf` | wght 400, opsz 144, SOFT 30, WONK 0 | `e53a11171873336fd22a432b87c2d216c97369b99fcba59b501e2bc35f0b1d0a` |
| `Fraunces-Display-Italic.ttf` | `ofl/fraunces/Fraunces-Italic[SOFT,WONK,opsz,wght].ttf` | wght 400, opsz 144, SOFT 30, WONK 0 | `dc8379865711d6b8a2525b5519d469c7d6084c76a437e5f3819c7fb777d29ee2` |
| `NunitoSans-Regular.ttf` | `ofl/nunitosans/NunitoSans[YTLC,opsz,wdth,wght].ttf` | wght 400, opsz 12, wdth 100, YTLC 500 | `8104d4c9b7d193cbaa30b892e3d0433ddae1d7455c41cc2a6b1f4572f591d91c` |
| `NunitoSans-SemiBold.ttf` | same | wght 600, opsz 12, wdth 100, YTLC 500 | `5ef7ef1e0c0a35e190877443b70d9addd680c2650d4804dc386e1a9c37917ad0` |

Source: [google/fonts](https://github.com/google/fonts) at commit `23e54b51ddffbc7713c583748e3bd86f62b1fa4a`, fetched Sep 24, 2026. google/fonts ships these families as variable fonts only, so the static instances were cut with fontTools 4 (`fonttools varLib.instancer`), then subset to Basic Latin, Latin-1, curly quotes, the ellipsis, the middle dot, and primes (`pyftsubset`, kern and liga kept). The display settings match `type-display-xl` in `app/globals.css`.

Licence: SIL Open Font License 1.1, `OFL-fraunces.txt` and `OFL-nunitosans.txt`. Neither family declares a Reserved Font Name, so the instanced files keep their names.
