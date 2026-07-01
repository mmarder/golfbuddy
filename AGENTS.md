# Agent instructions — GolfBuddy

## Guard against stale training data

This project may pin versions of frameworks and libraries that have **breaking changes** relative to
your training data — APIs, conventions, and file structure may all differ. Before writing code
against any fast-moving dependency, **read its installed docs** (e.g. under `node_modules/<pkg>/`, a
vendored `docs/` folder, or the pinned version's official reference) rather than relying on memory.
Heed deprecation notices.

**GolfBuddy is built on Astro.** Astro's config, content-collections API, and routing conventions
change across major versions. Before writing `.astro` components, content collection schemas, or
`astro.config.*`, check the pinned version in `package.json` and read the matching docs
(`node_modules/astro/` or the versioned reference at https://docs.astro.build). Do not assume APIs
from training-data memory of an older Astro.

## Process

Follow `DEVELOPMENT.md` — the mandatory phased workflow — for every session. Start with Phase 0
orientation. Do not skip phases.

## Source of truth

`ARCHITECTURE.md` describes the full current state of the codebase. Keep it accurate; a stale
architecture doc is treated as a bug. Read it at the start of every session and update it before
every deploy.
