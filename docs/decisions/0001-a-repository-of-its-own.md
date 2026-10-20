# ADR 0001 — The design system gets a repository of its own

- **Status:** accepted, 20 October 2026
- **Decided by:** Brian Mangi
- **Context:** `docs/design-system.md` (written in tech-iki/iki-work-os, 10 September 2026, merged 20 October 2026 as a58e164)

## Decision

The IKI design system moves out of IKI Work OS into **tech-iki/iki-design**, a
public repository that is both an npm package and its own showcase:

- `packages/design` publishes `@tech-iki/design`. `src/tokens.ts` is the single
  source of every value; `theme.css` (Tailwind v4 `@theme`), `tokens.css` (plain
  `:root` custom properties), `base.css` and `tokens.json` are generated from
  it. The package also carries the typed pill tones, the control class strings,
  the contrast arithmetic with every rendered pair, the pill width table, and
  four components: `Pill`, `KpiTile`, `PageTitle`, `PageMain`.
- `apps/site` is a Next.js app that renders the package live, so a change to
  `tokens.ts` is seen before it ships.
- From this extraction onward **this repository is the source of truth**. IKI
  Work OS becomes a consumer like every other IKI project; its own `@theme`
  block, `ui-colors.ts` tones, `ui-classes.ts`, `ui-contrast.ts`, `pill-width.ts`
  and `pill.tsx` are to be replaced by imports (tracked in Work OS).
- The vocabulary stays with each app and the colour with the system: an app
  writes `Record<TaskStatus, PillTone>` from the exported `tones`; the package
  exports no task, health or policy terms.
- The repository is **public**. It holds colours, fonts and a pill — nothing
  secret — and a public package needs no read token in every consumer's build.

## Why not the alternatives

- **A showcase site alone** (Storybook in Work OS, or a design page to copy
  from) repeats the mechanism that produced the drift in §14 of the system
  document and the three colour families in §3: every project *copied* the
  values and nobody re-synced. What the other projects need to **import** is a
  package; the site is how it is seen and edited, the package is how it ships.
- **Keeping the source of truth in Work OS** and publishing from there would
  make every token change a Work OS release, and would leave two `@theme`
  blocks the moment another repo held a copy.
- **Copying the CSS file into each project** is what happened already.

## Consequences

- Work OS needs a switch-over change (one PR): import `theme.css`, delete the
  duplicated modules, keep its vocabulary maps. Its `design-system-doc.test.ts`
  retires with the doc's move; `pill-width.test.ts`'s grid-column assertions and
  `ui-contrast.test.ts`'s Work-OS-only pairs stay there.
- Publishing to npm under `@tech-iki` is not yet configured: no npm account is
  logged in on the development machine and the scope is unclaimed. Until then
  consumers install from a git tag and the package builds itself through
  `prepare`.
- The site has no hosting yet. Coolify on iki-server-01 has no build headroom
  (4.1 GiB free, a Next build peaks at 2.4 GiB), so a static host is the likely
  answer; decided separately.
- A new token is added in `tokens.ts` and, by the suite, in `TOKEN_PAIRS`; a
  renamed or removed token is a major version.
