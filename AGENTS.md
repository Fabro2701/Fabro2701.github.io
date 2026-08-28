# AGENTS.md

Fresh portfolio site (repo currently **empty** — build it from the roadmap below). Deploy target: **GitHub Pages**, static-only.

**Framework: Next.js** (locked). Static export only.

## Non-negotiable deployment constraints (GitHub Pages)

- **No server runtime** (no Node/Python/PHP, no Next.js server components, no API routes). Pure client-side SPA that builds to a static `out/`.
- **Base path**: repo deploys to `Fabro2701.github.io/portfolio/`, so set `basePath: '/portfolio'` (and `assetPrefix`) in `next.config.mjs`. All asset/font links must respect this base — no hardcoded `/image.png`.
- **SPA routing**: GitHub Pages 404s on sub-route refresh. Use a hash router OR build as a true single scroll-based page (this site is the latter — see below) OR the `404.html` redirect hack.
- **No backend for forms/db**: any external data via client-side `fetch()` to public APIs; any contact form via a serverless provider (Formspree/EmailJS/Web3Forms). No secrets in the repo; only public-safe/domain-restricted keys.
- **CI/CD**: use GitHub Actions (`.github/workflows/deploy.yml`) — build, `actions/upload-pages-artifact`, `actions/deploy-pages`. Don't rely on manual `gh-pages` script.

## Site spec (full roadmap — verify against this; see "First iteration" for what ships now)

Single-page app: **three `100vh` scroll-snapped sections** (`scroll-snap-type: y mandatory`). This structure **avoids the SPA 404 problem** — no sub-routes.

### Visual tokens (shared system)
`--bg #0b0e12`, `--grid #1c2129`, `--ink #eef0f1`, `--muted #71798a`, `--up #22c55e` (green/up/long), `--down #ef4444` (red/down/short), `--accent #6fd7c5`, `--live #a78bfa` (unrealized PnL line). Fonts: **Space Grotesk** (display) + **IBM Plex Mono** (numeric/data/tags/logs). Down-arrow scroll cue pinned to each section bottom (last section excluded).

### Screen 1 — Trading Hero
- Fixed **client-side** data `data/price-series.json`: seeded random walk of ~200–300 OHLC candles (deterministic, reproducible — no API).
- Playback: `currentStep` pointer advances every 500ms, scrolls chart left, loops at end. `currentStep.close` = the single current price.
- State machine `FLAT/LONG/SHORT`; **Buy/Sell disabled while a position is open**; only panel ✕ closes it.
- `unrealizedPnL = (current - entry) * lotSize * (side==='LONG'?1:-1)`, recomputed each tick.
- PnL chart: **two cumulative lines sampled across the playback-step axis, both always displayed**. **Realized** (solid `--accent`) updates only at trade close and holds level between closes; **unrealized** (dashed `--live`, unique color) is a **recorded per-step series** — a new net value is appended every playback tick (never recomputed/straightened), so it traces the open position continuously and meets the realized line exactly at close (both accumulate; net = realized + open). When flat the two lines are coincident (unrealized hidden under realized). Y/x axis ticks + labels, zero line.
- Candle chart shows the open position: fat arrow at entry (up for LONG, down for SHORT) + thin connecting line to the live last price (updates each tick, colored long/short). On close an opposite-pointing arrow is added at the close point; realized trades render the full entry→line→exit arrow trio. All three elements colored long=`--up`(green)/short=`--down`(red).
- Log console: fixed-height, auto-scroll, timestamped by playback step (`[t=042]`), `aria-live="polite"`, with buy/sell/close action keywords colored (`--up`/`--down`/`--accent`).
- Lot stepper default 10, range 1–100.
### Screen 2 — Experience Timeline
Vertical timeline, data-driven array (`{start,end,title,company,skills[]}`). Staggered fade/slide on scroll-in, respecting `prefers-reduced-motion`. **Content is placeholder — user supplies real data.**

### Screen 3 — Projects Grid
2×3 grid (single column <640px), 6 tiles → **overlay** expanded card (scrim + centered card: title, labeled external link, description, tech chips, ✕). Close on ✕, **Escape**, and click-outside. Data-driven (`{title,tagline,description,link,linkLabel,tech[]}`). **Content is placeholder.**

### Responsive/accessibility
Keyboard-reachable with visible focus rings; `prefers-reduced-motion` disables scroll-reveal, hover-scale, and decorative motion; log console `aria-live="polite"`.

## First iteration — keep it SIMPLE
Ship only the static shell first; defer the trading engine and interactions to later passes.
- **In scope**: Next.js app scaffolded with static export + base path; three scroll-snapped `100vh` sections; shared CSS tokens + fonts; placeholder content for all three screens (no real trading/timeline/project data); scroll cue arrows.
- **Explicitly deferred**: Screen 1 playback engine, state machine, position panel, PnL chart, log console. Screen 2/3 scroll-reveal and overlay interactions.
- Bonus only if trivial: `data/price-series.json` seeded random walk (deterministic, ~200–300 candles). Otherwise add it with the playback engine.

## Suggested build order
1. Shared tokens + 3-snap-section shell, fonts, colors.
2. Screen 1 playback engine + static chart (no trading).
3. Screen 1 state machine, position panel, log, PnL chart.
4. Screen 2 timeline (placeholder data).
5. Screen 3 grid + overlay (placeholder data).
6. Swap in real experience/project content.
7. Accessibility + responsive pass.

## Gotchas
- No `next/image` optimization or SSR features — everything must survive `output: 'export'` (which also requires your layout/root component to avoid server-only code and generally mark client interactivity with `use client`).
- Everything reads from the same `price-series.json` array — swapping ticker source is a data-only change.
