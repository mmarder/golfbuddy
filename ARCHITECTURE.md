# GolfBuddy — Architecture Reference

This document captures the complete state of the app as of 2026-07-02. Any developer or AI agent
should be able to read this file and have a full mental model **without exploring the codebase**.
Keeping it current is a deploy blocker.

---

## 1. Overview

GolfBuddy is a personal, mobile-first static site for learning golf. It holds club notes and
technique reminders captured from the owner's pro lessons across four practice areas (Fundamentals,
Long Game, Short Game, Putting), plus a **Practice** hub and a **Learn** section. The Practice hub
links to two sub-pages: the **Daily Drills** checklists (split into "without a ball — everyday" and
"with a ball — on the range" routines) and a **How to Practice** guide. Skill **benchmarks**
(approximate performance targets across skill levels) are no longer a standalone page — they render
inline at the bottom of the relevant practice-area page (Putting, Short Game, Long Game) via
`<BenchmarkBlock>`. **Learn** is a top-level nav destination with a Golf Basics guide (rules +
glossary) for a beginner who needs the rules and vocabulary, not just the swing mechanics. It is a
static reference the owner opens on a phone at the range or on the green. No backend, no user
accounts, no personal data.

**Deployment:** GitHub Pages, built and deployed by the GitHub Actions workflow in
`.github/workflows/deploy.yml` (push to `main` → build with `withastro/action` → deploy to Pages).
Pages is enabled with Source = GitHub Actions.
**Live URL:** https://mmarder.github.io/golfbuddy/ (project Pages). Served from the `/golfbuddy`
subpath, so `astro.config.mjs` sets `base: '/golfbuddy'` and internal links go through
`withBase()` (`src/lib/paths.ts`).
**Custom domain (deferred):** `golf.mardr.com` is planned but not set up yet. To switch: set
`site: 'https://golf.mardr.com'`, remove `base` from `astro.config.mjs`, re-add `public/CNAME`
containing `golf.mardr.com`, and add a Namecheap DNS record (`golf` CNAME → `mmarder.github.io`).
`withBase()` makes the link changes automatic.
**Repo:** https://github.com/mmarder/golfbuddy
**Data store:** None. Fully static. The only per-device state is the two Daily Drills checklists
(everyday / range), stored independently in the browser's `localStorage` under keys
`golfbuddy.drills.everyday` and `golfbuddy.drills.range` (functional state only — no PII). The
original single key `golfbuddy.drills` is superseded — any value left under it from before this
split is simply orphaned/ignored, not migrated (no PII, safe to lose).
**Error tracking:** None.

**Routes:** `/`, `/practice/`, `/practice/drills/`, `/practice/how/`, `/learn/`,
`/fundamentals/`, `/long-game/`, `/short-game/`, `/putting/`.

**Active branches:**
- `main` — production
<!-- list feature branches here -->

---

## 2. Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Static site generator | Astro | ^7.0.4 |
| Language | TypeScript | ^6.0.3 (config extends `astro/tsconfigs/strict`) |
| Styling | Tailwind CSS (via `@tailwindcss/vite`) + DaisyUI | tailwind ^4.3.2, daisyui ^5.6.6 |
| Markdown styling | `@tailwindcss/typography` (`prose`) | ^0.5.20 |
| Package manager | npm | (bundled with Node) |
| Runtime (build) | Node.js | 24 (pinned in `.nvmrc`; Astro engines require ≥22.12) |
| Testing | Vitest | ^4.1.9 |
| Type checking | `@astrojs/check` | ^0.9.9 |
| Hosting | GitHub Pages | — |
| CI/CD | GitHub Actions (`withastro/action@v3` + `actions/deploy-pages@v4`) | — |

> **Stale-data guard:** Astro 7 uses the Content Layer API (loaders in `astro/loaders`) and Tailwind
> is v4 (CSS-first: `@import "tailwindcss"` / `@plugin`), both newer than common training data. Read
> `node_modules/astro/` or https://docs.astro.build for the pinned version before writing `.astro`
> components, content-collection schemas, or `astro.config.mjs`.

---

## 3. Repository Layout

```
golfbuddy/
├── CLAUDE.md                     # entry pointer → AGENTS.md + DEVELOPMENT.md
├── AGENTS.md                     # agent instructions (stale-data guard, process, source of truth)
├── DEVELOPMENT.md                # mandatory phased dev process
├── ARCHITECTURE.md               # this file — single source of truth
├── .nvmrc                        # Node 24
├── astro.config.mjs              # site URL + Tailwind vite plugin
├── tsconfig.json                 # extends astro strict
├── package.json                  # scripts: dev / build / preview / test / check
├── .github/workflows/deploy.yml  # build + deploy to GitHub Pages
├── public/
│   └── favicon.svg               # (CNAME re-added here when the custom domain is set up)
└── src/
    ├── content.config.ts         # collections: `areas` (glob md) + `drills` (json) + `guides` (glob md) + `benchmarks` (json)
    ├── content/
    │   ├── drills.json           # daily-drill list (id, title, detail, category, order, steps?)
    │   ├── benchmarks.json       # skill benchmarks (putting/short-game/approach/driving × 3 levels)
    │   ├── areas/                # fundamentals.md, long-game.md, short-game.md, putting.md
    │   └── guides/               # how-to-practice.md, golf-basics.md
    ├── layouts/
    │   └── BaseLayout.astro      # mobile-first shell + DaisyUI dock nav (prefix-aware active state, 6 items)
    ├── components/
    │   ├── Checklist.astro       # interactive checklist (localStorage + reset) + client script; `storageKey` prop supports multiple independent instances per page
    │   └── BenchmarkBlock.astro  # renders one or more benchmark sections (putting / shortGame / long) inline on an area page
    ├── lib/
    │   ├── checklist-state.ts    # PURE logic (toggle/progress/serialize/deserialize/reset)
    │   ├── checklist-state.test.ts
    │   ├── paths.ts              # PURE withBase() — prefixes internal links with Astro base
    │   ├── paths.test.ts
    │   ├── units.ts              # PURE unit conversion (feet↔m, yd↔m) + combined-format helpers
    │   └── units.test.ts
    ├── pages/
    │   ├── index.astro           # home hub (cards → practice + 4 areas)
    │   ├── practice/
    │   │   ├── index.astro       # practice hub (cards → drills / how)
    │   │   ├── drills.astro      # renders TWO <Checklist> sections: everyday (no ball) + range (with ball)
    │   │   └── how.astro         # renders the how-to-practice guide (prose)
    │   ├── learn/
    │   │   └── index.astro       # renders the golf-basics guide (prose) — top-level nav destination
    │   └── [area].astro          # dynamic route: one page per `areas` entry; renders <BenchmarkBlock> for putting / short-game / long-game
    └── styles/
        └── global.css            # @import tailwindcss; @plugin typography; @plugin daisyui
```

---

## 4. Data Model

No database. Content is authored as files validated at build time:

- **`areas`** collection — markdown files in `src/content/areas/`, entry id = filename slug
  (`fundamentals`, `long-game`, `short-game`, `putting`). Frontmatter: `title`, `summary`, `icon`,
  `order`. Body is markdown. Ordered by `order` on the home hub (Fundamentals=1, Long Game=2,
  Short Game=3, Putting=4). Content convention: `⚠️ **Watch-out:**` blockquotes flag common errors.
- **`drills`** collection — `src/content/drills.json`, an array of
  `{ id, title, detail?, category, order, steps? }`. `category` is `'everyday' | 'range'` (required)
  and determines which of the two checklists on `/practice/drills/` the drill renders in. The `id`
  is the stable key used for checklist persistence, so editing/reordering drills does not lose
  ticked state. `steps` (optional) is `{ heading: string; cues: string[] }[]` — when present, a
  native `<details>`/`<summary>` disclosure is rendered as a sibling of the checkbox label inside
  the card, so tapping the summary never toggles the checkbox.
- **`guides`** collection — markdown files in `src/content/guides/`, entry ids = filename slugs
  (`how-to-practice`, `golf-basics`). Frontmatter: `title`, `summary`, `icon?`. Body is markdown,
  rendered prose-styled like the area pages. Same content convention (`⚠️ **Watch-out:**`
  blockquotes). `golf-basics` covers the rules that matter for a beginner round plus a glossary of
  common terms; rendered at `/learn/`.
- **`benchmarks`** collection — `src/content/benchmarks.json`, a single-entry array (id `main`)
  holding approximate performance numbers across three skill levels (`beginner`, `goodAmateur`,
  `tour`): `putting` (make-% by distance in feet), `shortGame.upAndDownPct`, `approach`
  (proximity in feet by yardage), and `driving` (`carryYd`, `totalYd`, `fairwayPct` per level).
  Numbers are approximate feel-guides grounded in public data (Broadie/ShotLink putting, Arccos /
  Shot Scope / Left Rough handicap tables, PGA Tour driving averages). No longer has its own page —
  `<BenchmarkBlock>` renders the relevant section(s) inline at the bottom of the Putting,
  Short Game, and Long Game area pages, converting feet↔metres and yards↔metres via
  `src/lib/units.ts`.

**Per-device state:** two independent checklists, each `localStorage["golfbuddy.drills.everyday"]`
/ `localStorage["golfbuddy.drills.range"]` holding `{ version: 1, checked: string[] }` — the ids of
ticked drills for that split. Read/written only through `checklist-state.ts` (safe-parse: any
malformed/legacy/wrong-version payload resets to empty). No personal data. The pre-split single key
`golfbuddy.drills` is superseded and no longer read; any pre-existing value under it is orphaned.

---

## 5. Type System

- Content shapes are defined by Zod schemas in `src/content.config.ts` (the source of truth for
  content). `astro sync` generates types consumed via `astro:content`.
- `ChecklistState` (`src/lib/checklist-state.ts`): `{ checked: string[] }`, with `STORAGE_VERSION`
  and a `Progress` interface `{ done, total, percent }`.

---

## 6. Key Modules & Pure Functions

- **`src/lib/checklist-state.ts`** — the entire testable logic layer, free of DOM/`localStorage`:
  `emptyState`, `reset`, `isChecked`, `toggle` (immutable), `progress` (ignores stale ids, no
  divide-by-zero), `serialize`, `deserialize` (safe-parse). Fully unit-tested (17 cases).
- **`src/lib/units.ts`** — PURE, DOM-free distance conversion used by `BenchmarkBlock.astro`:
  `feetToMeters` (1-dp), `yardsToMeters` (whole metres), and the combined-format helpers
  `formatFeetMeters` ("N ft / ~M m") and `formatYardsMeters` ("N yd / ~M m"). Unit-tested
  (22 cases: known conversions, rounding, 0, and large distances).
- **`src/components/Checklist.astro`** `<script>` — the only I/O layer: reads/writes `localStorage`
  (wrapped in try/catch for private-mode/disabled), paints the DOM, wires checkbox + reset events.
  All state transitions delegate to the pure module. Takes a required `storageKey` prop so multiple
  `<Checklist>` instances can coexist on one page with independent, non-colliding persisted state
  (the root element carries `data-storage-key`; the client script does
  `document.querySelectorAll('[data-checklist]')` and initialises each root against its own key,
  falling back to `'golfbuddy.drills'` only if the attribute is ever missing).
- **`src/components/BenchmarkBlock.astro`** — server-only (no `<script>`) component. Prop
  `section: 'putting' | 'shortGame' | 'long'`. Loads the `benchmarks` collection itself and renders
  the level legend + "approximate feel-guides" info alert plus the card(s) for that section
  (`'long'` renders both Approach and Driving). Used by `[area].astro`; not used directly by any
  page.

---

## 7. Conventions

- **Input validation:** Content validated at build time by content-collection Zod schemas. There are
  no runtime user-input boundaries (static site, no forms/backend).
- **Error handling:** N/A at runtime except `localStorage` access, which is try/catch-wrapped and
  degrades gracefully (UI still works for the session; persistence silently skipped).
- **Safe helpers:** `deserialize()` is the safe-parse boundary for persisted state.
- **Copy tone:** short, plain, encouraging reminders a beginner can scan one-handed at the range.
- **Check command:** `npm run check` → `astro check` (type-check) + `vitest run` + `astro build`.
  Run before every commit.

---

## 8. Interfaces (API routes / functions / events)

None. Static site — no API routes, functions, or server events. Routes are file-based static pages:
`/`, `/practice/`, `/practice/drills/`, `/practice/how/`, `/learn/`,
`/fundamentals/`, `/long-game/`, `/short-game/`, `/putting/`.

---

## 9. Feature Flags & Kill-switches

None.

---

## 10. Environment Variables

None required (static build, no secrets).

---

## 11. Known Issues

- **Custom domain deferred.** Site currently lives at the project-Pages subpath
  (https://mmarder.github.io/golfbuddy/). Switching to `golf.mardr.com` later is the documented
  change in the Overview section (config `site`/`base`, `public/CNAME`, Namecheap DNS).
- All four practice-area pages now contain real lesson content. Future lessons should be added
  directly to the relevant `src/content/areas/*.md` file.
- Light theme is hardcoded (`data-theme="light"`); no dark-mode toggle yet.
- The dock nav now has 6 items (Home, Practice, Long, Short, Putt, Learn). It fits at phone width but
  is near the practical limit — adding a 7th item would crowd the labels and should trigger a nav
  rethink (e.g. grouping or a "More" entry).
