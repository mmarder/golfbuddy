# GolfBuddy — Development Process

This file defines the mandatory process for every development session. Follow the phases in order.
Do not skip phases or merge them. This protocol is stack-agnostic — the specifics of *this*
project's stack, data model, and conventions live in `ARCHITECTURE.md`.

---

## Phase 0 — Orientation (start of every session)

1. Read this file (`DEVELOPMENT.md`) in full.
2. Read `ARCHITECTURE.md` to get the current state of the codebase: stack, file layout, data model,
   external interfaces, and known issues.
3. Run `git log --oneline -10` to see recent commits and understand what has already been done.
4. **Check for live errors.** If the project has an error tracker (Sentry, etc.), check it via the
   project's committed script — never an ad-hoc `curl` pipeline. Summarise the top unresolved issues
   (title, count, first/last seen) and flag anything new or high-frequency as a candidate for this
   session. If there is no error tracker yet, note that.
5. If the user references an open issue or a previous plan, ask them to summarise it before
   proceeding.

Only move to Phase 1 once you have a solid mental model of the codebase.

---

## Phase 1 — Requirements & Planning

**Goal:** Eliminate ambiguity before writing a single line of code.

Ask clarifying questions until all of the following are answered:

- **Intent**: What problem does this change solve? What is the desired outcome?
- **Scope**: What is explicitly in scope? What is explicitly out of scope?
- **UI/UX**: If there is a UI component, ask about layout, copy, interaction states (loading, empty,
  error), and responsive/mobile behaviour.
- **Data**: Does this require new persistence (tables, columns, files)? Does it change existing data
  shapes?
- **Edge cases**: What should happen when data is missing, an external call fails, or the user does
  something unexpected?
- **Success criteria**: How will we know the feature is working correctly?

Do not assume. Do not default to the simplest interpretation without confirming. Questions are
cheap; rework is expensive.

---

## Phase 2 — Feature Plan

Write a short, structured plan that covers:

1. **Summary** — one paragraph describing what will be built and why.
2. **Files to create** — new files and their purpose.
3. **Files to change** — existing files and what changes.
4. **New interfaces** — API routes / functions / events: signature, input, output shape.
5. **Input validation** — the schema for any new input boundary.
6. **Tests to write** — which new pure functions need tests, and what the key cases are.
7. **Out of scope** — explicit list of what is not being done.

Present the plan to the user. **Do not begin implementation until the user has approved it.** If the
user asks for changes, revise the plan and re-present.

---

## Phase 3 — Execution

Implement the approved plan. Rules:

- **Tests first for pure logic**: write the test file for any new pure function before (or at least
  alongside) implementing it.
- **Validate every new input boundary**: parse and validate untrusted input with a schema before it
  reaches any persistence or business logic. Return a clear, structured error on failure.
- **Error handling on every I/O path**: wrap all external I/O in try/catch. Keep auth/permission
  checks *outside* the try/catch. Return a consistent error response on unexpected failure — never
  let an unhandled throw reach the user.
- **Use the project's safe helpers** for JSON parsing, required-env assertion, and retry-on-transient
  failure rather than re-implementing them.
- **No unused code**: no feature flags without a live use, no backwards-compat shims, no placeholder
  functions.
- **No speculative features**: implement exactly what was agreed in Phase 2, nothing more.

After each logical chunk (data layer, interface, UI), self-check:
- Does it pass the project's check command (type-check + lint + tests)?
- Does it follow the patterns in `ARCHITECTURE.md`?
- Are the tests written?

Always run the full check command (not just the build) before committing — some toolchains skip
lint/type-check during dev and build.

---

## Phase 4 — UX/UI Senior Expert Review

**Switch role: you are now a Senior UX/UI Designer reviewing every changed screen.**
*(Skip only if this session changed no user-facing UI.)*

**Start here:** List every file changed in this session. For each UI file in that list, check:

**Layout & Positioning**
- [ ] No UI element is obscured by fixed navigation/toolbars (check every full-screen view).
- [ ] Modals, popovers, and toasts are fully visible at the smallest supported width, respecting
      safe-area insets.
- [ ] Scrolling does not reveal content trapped behind fixed bars.

**Touch & Interaction**
- [ ] Every tappable element meets the minimum touch-target size (≈44×44px on touch devices).
- [ ] No interactive element requires hover to be discoverable.
- [ ] Loading, disabled, and active states are visually distinct.

**Hierarchy & Typography**
- [ ] The primary action on each screen is visually dominant.
- [ ] Font sizes follow a clear hierarchy (heading > sub-heading > body > caption).
- [ ] Text does not truncate or overflow at the smallest supported width.

**Copy**
- [ ] User-facing strings are consistent in tone (see the project's copy reference).
- [ ] Error messages describe what went wrong and what to do next.
- [ ] Empty states have a clear call to action.

**Colour & Contrast**
- [ ] All text meets WCAG AA contrast (4.5:1 body, 3:1 large text).
- [ ] Colour is never the sole conveyor of meaning (pair with icon or text).

**Navigation**
- [ ] The active navigation item is clearly indicated.
- [ ] Back paths and exit points are always obvious.

Write a bullet review using `[must fix]` / `[should fix]` / `[consider]` tags. Implement all
`[must fix]` and `[should fix]` items. Present `[consider]` items to the user. Do not proceed until
`[must fix]` and `[should fix]` are resolved.

---

## Phase 5 — Senior Engineer Code Review

**Switch role: you are now a Senior Engineer reviewing a pull request.**

**Start here:** List every file changed in this session. Go through each in turn — do not rely on
memory of what you wrote. Check each for:

- **Correctness**: does the logic match the requirements exactly? Off-by-one errors, wrong
  comparisons, missing conditions?
- **Security**: unvalidated user input reaching persistence, missing auth checks, secrets in code,
  open redirects, injection.
- **Error handling**: are all failure paths handled? Can this throw and reach the user unguarded?
- **Types**: any loose/`any` casts that can be tightened? Are the types accurate?
- **Patterns**: does the code follow existing conventions (naming, structure, response shapes)?
- **Performance**: any N+1 reads or repeated work that could be batched?
- **Tests**: do they test the right things? Obvious missing cases?
- **Architecture doc**: are all new interfaces, types, and files reflected in `ARCHITECTURE.md`?
  Any gap is a `[must fix]`.

Tag each finding `[must fix]` / `[should fix]` / `[consider]`. Implement all `[must fix]` and
`[should fix]`. Present `[consider]` items to the user. Do not proceed until they are resolved.

---

## Phase 5.5 — Security Researcher Review

**Switch role: you are now a Security Researcher doing a focused threat-model pass.**

**Start here:** List every file changed in this session. You are looking for vulnerabilities a
motivated attacker — including an authenticated user — could exploit.

**Authentication & Authorisation**
- [ ] Every new protected interface starts with an auth check (reject if no session).
- [ ] Every interface that takes a resource identifier verifies the resource belongs to the caller
      before reading or writing it.
- [ ] No privilege-escalation path: can any operation modify another user's data, or promote
      privileges?
- [ ] Admin-only operations check the privilege server-side, not just in the client.

**Input Validation**
- [ ] Every mutating interface validates its input with a schema before touching persistence.
- [ ] Identifiers from the client are treated as opaque — never interpolated into queries, ranges,
      or evaluated expressions.
- [ ] Numeric/bounded inputs are range-checked.

**Data Exposure**
- [ ] Responses never include data belonging to another user.
- [ ] Aggregate/admin endpoints return computed values, not raw PII.
- [ ] Server-only secrets are never referenced from client code or public config.

**Secrets & Configuration**
- [ ] No credentials, tokens, or environment IDs hardcoded in source.
- [ ] New sensitive env vars are asserted at startup and documented in `ARCHITECTURE.md`.
- [ ] Privilege/role flags in the data store cannot be set through any user-facing write path.

**Side-effects & Idempotency**
- [ ] Awards, charges, and external mutations are idempotent — a double-call cannot double-apply.

Write findings using `[must fix]` / `[should fix]` / `[consider]` / `[accepted risk]`. Implement all
`[must fix]` and `[should fix]` before Phase 5.7.

> **Note for GolfBuddy:** this is a static, client-only site with no auth, no backend, and no data
> store. Most Auth/Data-Exposure/Idempotency items are not applicable today. The pass still matters
> for anything that runs in the browser (e.g. `localStorage` used for checklist state, third-party
> scripts, links/redirects) — do not skip it, scope it.

---

## Phase 5.7 — Compliance / Privacy Review

**Switch role: you are now a Compliance Officer reviewing changed files against privacy law
(GDPR and local equivalents) and the project's legal pages.**
*(Skip only if this session processes no personal data and adds no third-party service.)*

> **Not applicable to GolfBuddy as currently scoped:** the site processes no personal data and has
> no backend. This phase becomes active the moment the project adds a third-party script/SDK
> (analytics, embeds, fonts loaded from a CDN), stores anything on the device beyond strictly
> necessary state, or starts collecting user data. Re-read and apply it then.

**Start here:** List every file changed in this session. For each file that touches user data:

**Data Collection**
- [ ] Does this collect new personal data not listed in the privacy policy? If yes, update it before
      deploy.
- [ ] Does it expand scope of existing collection (new fields, longer retention, new purpose)? If
      yes, re-assess the legal basis and update the policy.
- [ ] Does it store data in the user's browser/device? If yes: is it strictly necessary? If not, it
      requires consent and must be disclosed.

**Third-Party Processors**
- [ ] Does this introduce a new third-party service/SDK/script? If yes, confirm a data-processing
      agreement and transfer mechanism exist, and add it to the privacy policy / processing record.
- [ ] Does any script that accesses the device load before consent? That requires consent.

**User Rights & Consent**
- [ ] Does this make it harder to exercise access/deletion/portability/objection rights? Flag it.
- [ ] Any new data type must have a clear deletion path.
- [ ] Analytics/monitoring must not run before positive consent is recorded.

**Legal Pages**
- [ ] Update privacy / terms / imprint if the change affects data types, processors, or the service
      description. A deploy that introduces new personal-data processing without updating the privacy
      policy is a violation — treat it as a blocker.

Tag each finding `[must fix]` / `[should fix]` / `[consider]` / `[ok]`. Implement all `[must fix]`
and `[should fix]` before Phase 6.

---

## Phase 6 — QA Engineer Review

**Switch role: you are now a QA Engineer verifying the implementation.**

**Start here:** List every file changed in this session. Work through the checklist, then verify the
golden path (in a browser/runtime if available, or describe the exact steps a tester should follow).

**Tests**
- [ ] Every new pure function has at least one test.
- [ ] Happy-path cases are covered.
- [ ] At least one edge/failure case per function is covered.
- [ ] Tests use real logic, not mocks of the code under test.
- [ ] No hardcoded dates that will break in future (freeze time or use fixed far dates).
- [ ] The test command passes with zero failures.

**Interfaces**
- [ ] Every mutating interface validates input — sending `{}` returns a validation error.
- [ ] Every protected interface rejects unauthenticated requests.
- [ ] Every interface returns a handled error (not a crash) when its I/O fails.
- [ ] New interfaces are documented in `ARCHITECTURE.md`.

**UI**
- [ ] Loading state handled (no blank flash).
- [ ] Empty state handled (no "undefined" visible).
- [ ] Error state handled (failures don't silently disappear).
- [ ] Responsive layout is correct at the smallest supported width.

**Data integrity**
- [ ] New serialized reads use the safe-parse helper.
- [ ] New required env vars use the required-env helper.

**Architecture doc**
- [ ] `ARCHITECTURE.md` reflects all new files, interfaces, types, and workflows. Updating it is a
      deploy blocker.

Fix and re-check any failing item before continuing.

---

## Phase 7 — Deploy

Only proceed once Phases 5, 5.5, and 6 (and 4 / 5.7 where applicable) are complete with no
outstanding issues.

1. **Update `ARCHITECTURE.md`** — mandatory. Verify every change this session is reflected: new
   files, new/changed interfaces, new types, new env vars, new workflow steps, updated known issues.
2. Run `git status` — confirm no unintended files are staged.
3. **Re-verify the staged diff** (`git diff --staged`) — concurrent work can clobber shared files
   between writing and committing.
4. Commit with a clear message describing what changed and why.
5. Push, and confirm the deploy pipeline succeeds.
6. Smoke-test the live change: open the affected flow and verify the golden path.

---

## Standing Rules

These apply at all times, regardless of phase:

- **Never push without completing Phases 5, 5.5, and 6.** No exceptions for "small" changes.
- **Never use `--no-verify`, `--force`, or skip lint/type-check/tests.** Fix the root cause.
- **Never mock the database in tests.** Test pure logic; if a function needs the DB, test the pure
  layer, not the I/O layer.
- **Never hardcode credentials, environment IDs, or user IDs.** Use env vars.
- **Never add a dependency without a clear reason.** Check stdlib and existing code first.
- **Respect the primary form factor.** GolfBuddy is **mobile-first web** — every UI change must look
  correct at the smallest supported width (phone), since the site is used at the range and on the
  green.
- **Guard against stale training data.** For any fast-moving dependency, read the installed docs
  before writing code — do not rely on training-data memory of its API.
- **Keep the architecture doc honest.** It is the single source of truth; a stale doc is a bug.
