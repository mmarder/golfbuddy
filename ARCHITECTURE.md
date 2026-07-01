# GolfBuddy — Architecture Reference

This document captures the complete state of the app as of 2026-07-01. Any developer or AI agent
should be able to read this file and have a full mental model **without exploring the codebase**.
Keeping it current is a deploy blocker.

---

## 1. Overview

GolfBuddy is a personal, mobile-first static site for learning golf. It holds notes, drills, and
technique reminders (grip, setup, swing) captured from the owner's pro lessons, plus quick
checklists to run through before heading to the driving range, the putting green, or a dry-practice
session at home. There is no backend and no user accounts — it is a static reference the owner opens
on a phone at the course.

**Deployment:** GitHub Pages (built from this repo via a GitHub Actions workflow — TODO: add).
**Live URL:** TODO — a subdomain of a Namecheap-owned domain, pointed at GitHub Pages via a `CNAME`
record + a `public/CNAME` file in the repo.
**Repo:** https://github.com/mmarder/golfbuddy (not yet pushed).
**Data store:** None. Fully static. Any per-device state (e.g. checked checklist items) would live in
the browser's `localStorage` only — none implemented yet.
**Error tracking:** None.

**Active branches:**
- `main` — production
<!-- list feature branches here -->

---

## 2. Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Static site generator | Astro | TBD — pin on `npm install`, then record here |
| Language | TypeScript | TBD |
| Styling | TBD — recommend Tailwind CSS or scoped `.astro` styles; decide in Phase 1 | TBD |
| Package manager | npm | (bundled with Node) |
| Runtime (build) | Node.js | TBD — pin an LTS in `.nvmrc` / CI |
| Hosting | GitHub Pages | — |
| CI/CD | GitHub Actions (build + deploy to Pages) | TODO |

<!-- Astro has breaking changes across majors. Note the pinned version above and read the matching
     docs (node_modules/astro/ or the versioned reference at https://docs.astro.build) before
     writing .astro components, content-collection schemas, or astro.config.*. -->

---

## 3. Repository Layout

```
golfbuddy/
├── CLAUDE.md            # entry pointer → AGENTS.md + DEVELOPMENT.md
├── AGENTS.md            # agent instructions (stale-data guard, process, source of truth)
├── DEVELOPMENT.md       # mandatory phased dev process (snapshot of the dev-kit protocol)
├── ARCHITECTURE.md      # this file — the single source of truth for current state
├── .gitignore
└── ...                  # Astro app not yet scaffolded — `npm create astro@latest` in Phase 2/3.
                         #   expected once scaffolded:
                         #   ├── package.json / astro.config.mjs / tsconfig.json
                         #   ├── src/pages/        # routes (index, drills, checklists, …)
                         #   ├── src/layouts/      # shared page shell (mobile-first)
                         #   ├── src/components/   # reusable UI (checklist, lesson card)
                         #   ├── src/content/      # markdown lesson notes / drills (content collections)
                         #   └── public/           # static assets + CNAME for the custom subdomain
```

---

## 4. Data Model

No database. Content is authored as files (markdown / Astro content collections) rather than stored
in a data store. If checklist "checked" state is persisted per-device, define its `localStorage` key
shape here when implemented.

---

## 5. Type System

TODO — Astro/TypeScript project not yet scaffolded. Once content collections exist, their Zod
schemas (in `src/content/config.ts`) are the source of truth for content shape; record them here.

---

## 6. Key Modules & Pure Functions

TODO — none yet. Any pure logic (e.g. checklist progress calculation, content sorting/filtering)
should live in a plain `.ts` module separate from `.astro` rendering, and be unit-tested.

---

## 7. Conventions

- **Input validation:** Content is validated at build time via Astro content-collection Zod schemas.
  There are no runtime user-input boundaries today (static site, no forms/backend).
- **Error handling:** N/A at runtime (no I/O). Build must fail loudly on content-schema errors.
- **Safe helpers:** TBD — introduce only if/when browser state or fetches are added.
- **Copy tone reference:** TBD — aim for short, plain, encouraging reminders a beginner can scan
  one-handed at the range. Establish a reference example in Phase 1.
- **Check command:** `npm run check` — TODO: wire to `astro check` (type-check) + `astro build`, and
  add lint (ESLint/Prettier) + a test runner (e.g. Vitest) for any pure logic. Run before every commit.

---

## 8. Interfaces (API routes / functions / events)

None. Static site — no API routes, functions, or events.

---

## 9. Feature Flags & Kill-switches

None.

---

## 10. Environment Variables

None required (static build, no secrets). If a build/deploy secret is ever needed, document its
name, purpose, and where it is consumed here.

---

## 11. Known Issues

- Astro app not yet scaffolded — repo currently contains only process/architecture docs.
- GitHub repo created (https://github.com/mmarder/golfbuddy) and wired as `origin`, but empty — nothing pushed yet. Pages deploy workflow and Namecheap subdomain (`CNAME`) not yet set up.
- Styling approach (Tailwind vs. scoped styles) undecided — open Phase 1 question.
- No `.nvmrc` / pinned Node or Astro version yet.
