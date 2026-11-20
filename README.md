# Leonida Legend

[![Competition](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/ngadukun/leonida-legend-3/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/ngadukun/leonida-legend-3/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline trophy guide and tracker for **Grand Theft Auto VI** on PlayStation 5,
built for the make.fun [GTA 6 Trophy Guide bounty](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01).
It covers all **55 official trophies** — 1 Platinum, 2 Gold, 6 Silver, 46 Bronze,
28 of them hidden on PlayStation — each with its official name, description and
grade, an original guide written for this entry, and the sources that guide rests
on, named beside it.

The app is plain static files. It runs entirely from its own files with the
network off: no accounts, no uploads, no tracking, nothing fetched from anywhere
else.

## What is in it

- **Tracker** (`#/`): every trophy as a card with a tier-coloured edge, tier
  badge, kind tag and card number, plus a hero band with an SVG progress ring
  showing the percent to Platinum. Filters: search, tier, kind, *hide earned*,
  and *spoilers off* (story trophies stay masked until earned). Progress is
  saved in the browser (localStorage) and can be **exported to a JSON file and
  imported back**.
- **Missables only** (`#missables`): the tracker filtered to the 8 missable
  trophies, each carrying a red MISSABLE ribbon everywhere it appears.
- **Trophy detail** (`#trophy-N`): one page per trophy — the official
  description quoted, a GUIDE section in our own words (what to do, where,
  and when it can be missed), and a SOURCES section naming where the facts
  come from.
- **Roadmap to the Platinum** (`#roadmap`): a six-phase timeline built only
  from the official descriptions — story first with the missable moments
  called out, then character strands, activities, the collectible sweep, the
  counted grinds, and the 100% close-out. Each phase names the trophies it
  covers.
- **Watch-outs** (`#watch`): one alert card per missable trophy explaining
  why it can be missed, plus a "Before you finish the story" checklist.

A demo state is built in for screenshots: open the app with `?demo=1` and 12
trophies start ticked (about 22%), so the tracker shows a lived-in progress
ring. A normal visit is unaffected.

## Run it

```sh
node serve.ts            # serves app/ at http://localhost:8080
# or: node serve.ts --port 9000
```

Any static file server pointed at `app/` works just as well. To hand the
entry in the way the bounty expects:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` checks the trophy data, copies `app/` and `screenshots/` to the
output directory and writes `dossier.json` there using the vendored
`buildDossier` from `vendor/makefun-frontend.ts` (the kit's library, kept
byte-identical, as the bounty requires).

## Data and sources

`app/data/trophies.json` holds the trophy list: the official names,
descriptions and grades as PlayStation publishes them (the list the bounty
kit carries, agreeing with Exophase and PSNProfiles), plus this entry's own
fields — kind, hidden and missable flags, tracked counts, an original guide
per trophy, and its sources. Guides are written for this entry and cite their
sources by name — the official PlayStation descriptions, the PowerPyx trophy
guide, the PSNProfiles trophy guide, the PlayStationTrophies.org guide and
the Exophase trophy list. No guide text is copied from any of them, and the
app shows no Rockstar Games logo or official artwork; the look is its own.

The 8 missable trophies — the ones whose official descriptions tie them to
one-time story moments — are Strangers & Freaks, Fair Game, Hot Together,
Retail Therapy, Catch Me If You Can, In The Beginning…, Capital Offense and
Personal Best.

## Layout

```
app/index.html        the shell: hero band, nav pills, filter toolbar
app/style.css         the dark sunset theme
app/app.js            routing, rendering, filters, progress, export/import
app/data/trophies.json  the 55 trophies with guides and sources
app/shots.json        the screenshot scenes for this entry
screenshots/          the entry's screenshots (first by name is the cover)
main.ts               the hand-in program
serve.ts              a tiny local static server for app/
vendor/               the kit's makefun-frontend.ts, unchanged
```

## License

MIT — see `LICENSE`.
