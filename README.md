# VICE CUT v2 — Painterly Cover Studio

[![gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/jonjet155/gta6-cover-art-01-vice-cut-v2/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/jonjet155/gta6-cover-art-01-vice-cut-v2/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

VICE CUT v2 is an offline web app that turns your own photos into a GTA 6-style multi-panel cover poster — painted, not photographed. The default layout is the **Cover Grid**: a 3 × 3 grid whose centre cell is a painted title block (sunset gradient, palm silhouettes, gold border, heavy "VICE CUT" lettering), surrounded by **eight different original illustrations** — a sunset couple, a pink wheelie bike, a flamingo speedboat, a gullwing sports car, a swamp gator, a skyline helicopter, a neon diner and a pier fisherman — one per panel, never repeated. Four more layouts (Comic Cut, Hero + 3, Film Strip, Four Cut), four colour grades (Vice Sunset, Neon Night, Teal Coast, Ink Mono), four caption styles, per-panel drag-to-pan and zoom, and one-click PNG export in the three common post sizes: 1080 × 1080, 1080 × 1350 and 1920 × 1080.

The moment it loads, the studio already shows a complete cover made from the eight built-in illustrations — zero clicks to the first cover. Your own photos are read on your machine only and never leave it, and the app makes no network requests at all.

## How to run

```sh
node serve.ts
```

Then open <http://localhost:8080> in desktop Chrome. Add your photos, pick a layout, edit the caption, choose a grade, pick a post size and press **EXPORT PNG**.

## How it works

- `app/src/cover.js` — the cover renderer: Cover Grid geometry with its painted centre title block, panel geometry for the other layouts, cover-fit illustration drawing with pan/zoom, colour grades, grain and vignette, and the face-safe title band.
- `app/src/main.js` — the studio wiring: photo strip, panel picking, drag-to-pan, zoom, caption editing, export.
- `app/src/shots.js` — deterministic `?shot=cover` and `?shot=editor` scenes for screenshots.
- `app/samples/` — eight original painterly illustrations made with an image model for this entry, in the Vice City sunset key-art style.

Everything in this app is original: no Rockstar Games logo, artwork or font.

## License

MIT — see LICENSE.
