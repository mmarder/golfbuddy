# GolfBuddy — Architecture Reference

This document captures the complete state of the app as of 2026-07-01. Any developer or AI agent
should be able to read this file and have a full mental model **without exploring the codebase**.
Keeping it current is a deploy blocker.

---

## 1. Overview

GolfBuddy is a personal, mobile-first static site for learning golf. It holds club notes and
technique reminders captured from the owner's pro lessons across three practice areas (Long Game,
Short Game, Putting), plus a **Daily Drills** checklist — a core-swing routine to run every day. It
is a static reference the owner opens on a phone at the range or on the green. No backend, no user
accounts, no personal data.

**Deployment:** GitHub Pages, built and deployed by the GitHub Actions workflow in
`.github/workflows/deploy.yml` (push to `main` → build with `withastro/action` → deploy to Pages).
**Live URL:** https://golf.mardr.com — custom subdomain via `public/CNAME` + a Namecheap DNS record
(`golf` CNAME → `mmarder.github.io`). **DNS record + enabling Pages in repo settings still to be
done** (see Known Issues).
**Repo:** https://github.com/mmarder/golfbuddy
**Data store:** None. Fully static. The only per-device state is the Daily Drills checklist, stored
in the browser's `localStorage` under key `golfbuddy.drills` (functional state only — no PII).
**Error tracking:** None.

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
│   ├── CNAME                     # golf.mardr.com
│   └── favicon.svg
└── src/
    ├── content.config.ts         # content collections: `areas` (glob md) + `drills` (json)
    ├── content/
    │   ├── drills.json           # daily-drill list (id, title, detail, order)
    │   └── areas/                # long-game.md, short-game.md, putting.md
    ├── layouts/
    │   └── BaseLayout.astro      # mobile-first shell + DaisyUI dock nav
    ├── components/
    │   └── Checklist.astro       # interactive checklist (localStorage + reset) + client script
    ├── lib/
    │   ├── checklist-state.ts    # PURE logic (toggle/progress/serialize/deserialize/reset)
    │   └── checklist-state.test.ts
    ├── pages/
    │   ├── index.astro           # home hub (cards → drills + 3 areas)
    │   ├── drills.astro          # renders <Checklist>
    │   └── [area].astro          # dynamic route: one page per `areas` entry
    └── styles/
        └── global.css            # @import tailwindcss; @plugin typography; @plugin daisyui
```

---

## 4. Data Model

No database. Content is authored as files validated at build time:

- **`areas`** collection — markdown files in `src/content/areas/`, entry id = filename slug
  (`long-game`, `short-game`, `putting`). Frontmatter: `title`, `summary`, `icon`, `order`. Body is
  markdown (Clubs + Lesson learnings sections).
- **`drills`** collection — `src/content/drills.json`, an array of `{ id, title, detail?, order }`.
  The `id` is the stable key used for checklist persistence, so editing/reordering drills does not
  lose ticked state.

**Per-device state:** `localStorage["golfbuddy.drills"]` holds `{ version: 1, checked: string[] }`
— the ids of ticked drills. Read/written only through `checklist-state.ts` (safe-parse: any
malformed/legacy/wrong-version payload resets to empty). No personal data.

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
- **`src/components/Checklist.astro`** `<script>` — the only I/O layer: reads/writes `localStorage`
  (wrapped in try/catch for private-mode/disabled), paints the DOM, wires checkbox + reset events.
  All state transitions delegate to the pure module.

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
`/`, `/drills/`, `/long-game/`, `/short-game/`, `/putting/`.

---

## 9. Feature Flags & Kill-switches

None.

---

## 10. Environment Variables

None required (static build, no secrets).

---

## 11. Known Issues

- **GitHub Pages not yet enabled / DNS not yet set.** Before the site goes live: (1) in repo
  Settings → Pages, set Source = GitHub Actions; (2) add a Namecheap DNS record `golf` CNAME →
  `mmarder.github.io`; (3) confirm the deploy workflow runs on push and the custom domain verifies.
- Practice-area pages contain placeholder content only — real club notes and lesson learnings to be
  written into `src/content/areas/*.md`.
- Light theme is hardcoded (`data-theme="light"`); no dark-mode toggle yet.
