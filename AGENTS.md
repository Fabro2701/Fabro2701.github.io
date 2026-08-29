# AGENTS.md

Portfolio site for Fabrizio (BS CS · MSc Quant Finance). Single-page app, **three `100vh` scroll-snapped sections**. Framework: **Next.js** (App Router, JSX), static export.

## Commands

- `npm run dev` — local dev server
- `npm run build` — Next build → static `out/`
- `npm run lint` — `next lint`
- `npm run gen:data` — regenerate `data/price-series.json` (seeded, deterministic)
- `npm run gen:media` — regenerate placeholder project SVGs under `public/images/projects`

## Non-negotiable deployment constraints (GitHub Pages)

- **No server runtime** — pure client-side static export (`output: 'export'`). Every component with interactivity must be `"use client"`. No API routes, no server components, no `next/image` optimization (config already sets `images: { unoptimized: true }`).
- **Base path** — deploys to `Fabro2701.github.io/portfolio/`; `next.config.mjs` sets `basePath: '/portfolio'` and `assetPrefix: '/portfolio/'`. No hardcoded `/image.png` asset links — respect the base (see `Projects.jsx#L7` `const BASE = "/portfolio"`).
- **SPA routing** — GitHub Pages 404s on sub-route refreshes. This site sidesteps the problem entirely: it is a single scroll-based page, no sub-routes.
- **No backend for forms/db** — client-side `fetch()` to public APIs only; contact form (if ever added) via a serverless provider. No secrets in the repo.
- **CI/CD** — use GitHub Actions (`actions/upload-pages-artifact`, `actions/deploy-pages`). **Note: `.github/workflows/deploy.yml` does not exist yet — must be created before first deploy.**

## Architecture — file map

```
app/
  layout.jsx         Root layout: next/font/google Space_Grotesk + IBM_Plex_Mono, metadata
  page.jsx           Home: renders <Section> x3 → Hero / Timeline / Projects
  globals.css        ALL styles live here (tokens, sections, chart, panel, pnl, log,
                     timeline, projects, overlay, reduced-motion, focus rings)
components/
  Section.jsx        Shared 100vh scroll-snap wrapper + down-arrow scroll cue (.section, .cue)
  Hero.jsx           Screen 1 heading + <TradingChart/>
  TradingChart.jsx   Screen 1 playback engine + candle chart + trade arrows
  TradingPanel.jsx   Screen 1 BUY/SELL + lot stepper / open-position panel
  PnLChart.jsx       Screen 1 realized + open PnL lines
  LogConsole.jsx     Screen 1 action log
  Timeline.jsx       Screen 2 experience timeline
  Projects.jsx       Screen 3 project grid
  ProjectOverlay.jsx Screen 3 detail dialog
hooks/
  useTradingEngine.js  Screen 1 state machine (FLAT/LONG/SHORT) + tick + PnL + log state
data/
  price-series.json  250 OHLC candles, deterministic (generated)
  experience.json    Timeline entries
  projects.json      Project grid entries
scripts/
  generate-price-series.mjs    Seeds a mulberry32 random-walk → data/price-series.json
  generate-project-media.mjs   Writes placeholder SVGs → public/images/projects/<id>/
public/images/projects/…      Project media (real assets dropped alongside placeholders)
next.config.mjs        output:'export', basePath/assetPrefix '/portfolio', images unoptimized
jsconfig.json          Path alias @/* → ./*
```

Path alias `@/` = project root (`@/components/X`, `@/data/x.json`, `@/hooks/X`).

## Shared system

**Tokens** (`app/globals.css` `:root`): `--bg #0b0e12`, `--grid #1c2129`, `--ink #eef0f1`, `--muted #71798a`, `--up #22c55e` (green/long), `--down #ef4444` (red/short), `--accent #6fd7c5`, `--live #a78bfa` (open PnL line). Fonts: Space Grotesk (`--font-display`), IBM Plex Mono (`--font-mono`); `.mono` utility class for numeric/data/tags.

**Sections**: `.section` = `100vh`, `scroll-snap-align: start`, centered `.section__inner` (max-width 960px), grid-pattern `::before` overlay. `.section .cue` = animated down-arrow button that `scrollIntoView`s the next section (not rendered when `last`).

## Screen 1 — Trading Hero (`components/Hero.jsx` → `TradingChart.jsx`)

Simplified data flow: `useTradingEngine()` owns ALL trading state; `TradingChart` owns playback (`step`), reads candles, computes SVG geometry, and fans state/handlers out to `TradingPanel`, `PnLChart`, `LogConsole`.

- **Hero.jsx** — `.hero__title` h1 ("Hi, I'm Fabrizio") with inline `.hero__tag` mono badge; renders `<TradingChart/>`.
- **TradingChart.jsx** — constants `TICK_MS = 500`, `WINDOW = 60` (visible candles), viewBox 880×360 with `PAD_L/R/T/B`. `step` advances `(s+1) % candles.length` every 500ms. `xOf/yOf` map prices→SVG. Renders grid lines + price labels, OHLC candle bodies/whiskers, a dashed "now" vertical line, a current-price tag chip, and `positionsOverlay` (entry/exit arrows + entry→line→exit connectors). Wires `tick(step, current.close)` in a `useEffect`. Ticker label string `SIM·USD`.
- **useTradingEngine.js** — `position` (`{side, entryStep, entryPrice, lotSize, unrealizedPnL}`), `lotSize` (default 10, clamped 1–100), `realized` `[{step, entryStep, side, entryPrice, exitPrice, lotSize, pnl}]`, `pnlHistory` (recorded per-step *net* series `{step, value}` — appended on every tick and again on close; never recomputed), `log` `[{step, tone:'long'|'short'|'close', action, text}]`. `tick()` guards against re-processing the same step via `lastStepRef`. `openPosition` ignores calls while a position is open; `closePosition` adds to `realizedRef`, appends a pnlHistory point, and nulls the position.
- **PnLChart.jsx** — viewBox 880×150, `MAX_STEP = 249` (fixed, == 250 candles, NOT the live step). Realized line: solid `--accent`, holds level between closes (rebuilt from `realized` each frame). Open line: dashed `--live`, plotted directly from recorded `pnlHistory`, coincides with realized when flat. Y/x ticks, zero line, header legend + running total.
- **TradingPanel.jsx** — FLAT row: `.panel__btn--buy/--sell`, lot stepper `− / +` (`.panel__lot`). Open row: `.panel__side` (data-side=LONG/SHORT), entry, `.panel__pnl` (data-pos), `.panel__close` ✕ CLOSE.
- **LogConsole.jsx** — `.log__body` fixed height, auto-scrolls to bottom on new entries, `role="log" aria-live="polite"`, entries `[t=NNN]` + `.log__kw--long/--short/--close` colored keywords.

Own CSS blocks in `globals.css`: `.chart*`, `.panel*`, `.pnl*`, `.log*`. Data source: `data/price-series.json`.

## Screen 2 — Experience Timeline (`components/Timeline.jsx`)

- Imports `data/experience.json`, sorts newest-first by `start` (format `"MM.YYYY"` or `"YYYY"` via regex in `startKey`/`formatDate`).
- `IntersectionObserver` (threshold 0.15) flips `.timeline--in` once on scroll-in; items stagger via `--i` index CFM delay (`.timeline--js .timeline__item`). Respects `prefers-reduced-motion`.
- Each entry: `.timeline__meta` (`.timeline__date` + optional `.timeline__kind` tag, data-kind=education/work, accent border for education), `.timeline__title`, `.timeline__company`, `.timeline__skills` (`.chip` pills).
- Data shape: `{start, end, title, company, skills[], kind}`. Own CSS: `.timeline*`, `.chip`. Content is user data — edit `data/experience.json`.

## Screen 3 — Projects Grid (`components/Projects.jsx` → `ProjectOverlay.jsx`)

- Grid `.projects__grid` = 2 columns (1 column <640px), tiles `.project-card` (image `.project-card__media` + `.project-card__title` + `.project-card__date`). `comingSoon` tiles are non-interactive (`.project-card--soon`, keeps `soon.svg`).
- Clicking a card sets `activeId` → renders `ProjectOverlay`; locks body scroll while open.
- **ProjectOverlay.jsx** — `.overlay` (fixed, `.overlay__scrim`) + `.overlay__card` `role="dialog" aria-modal`. Closes via ✕, **Escape**, or clicking the scrim (`onMouseDown` on `.overlay`). Focus is moved into the dialog and trapped; returns focus to opener on close. Multi-image gallery: prev/next/thumbnails (`.overlay__slicer`, `.overlay__nav`, `.overlay__thumb`, `.overlay__counter`), keyboard `← / →`. Footer: `.overlay__title` + external-link icon (`.overlay__link`), `.overlay__desc`, `.overlay__techs` chips.
- Image URLs are resolved against `BASE = "/portfolio"` in `Projects.jsx#L7-11` — do not break this for basePath.
- Data shape (`data/projects.json`): `{id, title, startDate, description, images[], url, technologies[], comingSoon?}`. Images live in `public/images/projects/<id>/`.

## Gotchas

- **All styles are in `app/globals.css`** — there is no per-component CSS, and some colors are hardcoded *outside* tokens (`rgba(11, 14, 18, …)` chart/panel/pnl/log frames, `#0e1218` media areas, scrim/box-shadows). Retheme work must sweep those too, plus the palette constants in `scripts/generate-project-media.mjs`.
- `next.config.mjs` hardcodes `basePath`/`assetPrefix` = `/portfolio` — if the repo ever moves, update both *and* the `BASE` constant in `Projects.jsx` in lockstep.
- No `next/image`; plain `<img>` with `eslint-disable` comments where needed.
- `data/price-series.json` has exactly 250 candles; `PnLChart.jsx` `MAX_STEP = 249` is hardcoded to match. Keep them in sync.
- Everything reads from the same `price-series.json` array — swapping ticker source is a data-only change.
- Deterministic data generators are our only "backend" — regenerate via `npm run gen:data` / `npm run gen:media`; commit the output.

## TODOs (planned — NOT implemented, do not build)

- **T-2 Light theme**: switch the site from the current dark palette to a light one. Touch: `:root` tokens in `app/globals.css`, every hardcoded dark color there (`rgba(11, 14, 18, …)`, `#0e1218`, scrim/shadow values), and the palette constants (`BG/GRID/INK/MUTED/ACCENT`) in `scripts/generate-project-media.mjs` (then rerun `npm run gen:media`). Verify contrast of `--up`/`--down`/`--accent`/`--live` against light backgrounds before choosing values.
- **T-3 Continuous-time trading**: currently the engine completes one full candle per 500ms tick (`TradingChart.jsx` `step` advancement + `useTradingEngine` `tick()` semantics treat each step as a finished OHLC candle). Change playback so each candle takes several timesteps to complete (intra-candle price progression). Touch: `components/TradingChart.jsx`, `hooks/useTradingEngine.js`, and likely the `data/price-series.json` format (needs per-timestep prices) — coordinate with `MAX_STEP` coupling in `PnLChart.jsx`.