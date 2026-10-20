# ADR 0002 — Unstyled primitives behind package-owned components; no styled library

- **Status:** accepted, 21 October 2026
- **Decided by:** Brian Mangi
- **Context:** `docs/plans/2026-10-20-components-and-icons.md` §3, §4.1, §6 and
  §7 (decisions 1, 3 and 4); ADR 0003 and ADR 0006 in tech-iki/iki-work-os;
  `docs/design-system.md` §8 "Drawer and popover", "Board, card and Move to…
  menu" and "Disclosure", which record the hand-rolled originals

## Decision

`@base-ui/react` (1.9.0, pinned exactly) becomes the package's **one runtime
dependency**, and it is **never exposed**:

- The package imports Base UI by per-component subpath (`@base-ui/react/dialog`,
  `/popover`, `/menu`, `/collapsible`) and wraps each part in a component the
  package owns — `Drawer`, `Popover`, `Menu`, `Disclosure` — with the system's
  markup, class strings, tokens and ARIA. No Base UI part, prop type or hook is
  re-exported from `@tech-iki/design`'s index. A consumer that wants a Base UI
  feature the wrapper lacks proposes a change to the wrapper, not an import.
- The register's "No component library" (ADR 0003, 24 July 2026) narrows to
  **"No *styled* component library."** Its reason — a themed library would fight
  the workbook look — stays true and is still honoured: Base UI ships no CSS, no
  motion and no theme, and exposes its state as `data-*` attributes, so the
  Tailwind class strings that *are* this library keep working and the contrast
  suite keeps asserting every pair.
- **Client-only components live in the main export**, each file carrying
  `"use client"`, with a table in §13 of the design-system document naming them.
  The nine components that predate this decision stay server-safe and are held
  so by test. There is no `@tech-iki/design/client` subpath.
- **Phase 1 does not merge until Work OS's port** (tech-iki/iki-work-os #443)
  has exercised the `Drawer`: the component is validated by replacing the
  largest hand-rolled surface, not by its own tests alone.

## Why Base UI, and why behind the package

The plan's §3 measured five headless libraries on 20 October 2026. Base UI is
the only one with a Drawer, a Combobox and a cancellable Escape together; it is
one package with per-component subpaths and `sideEffects: false`; MIT; ten
releases in 2026; and shadcn's default base since July 2026, so examples exist.
Radix lacks Combobox and Drawer; React Aria could not be verified for Drawer
and portal behaviour; Headless UI had one release in 2026 and cannot veto
Escape; Ark UI brings 69 dependencies.

It sits *behind* the package because the system's value is the judgement in
its class strings and its tokens, not the primitive. A consumer that imported
Base UI directly would rebuild the drawer's chrome a seventh time and would
bypass the contrast suite. Wrapping also keeps the dependency replaceable: if
Base UI were abandoned, the four wrappers change and no consumer does.

## What it costs

- Every Base UI-backed component is a **client component**. A Server Component
  page can still render one (the site's `/components` does), but it is shipped
  to the browser. The nine earlier components are not affected.
- Base UI asks the app root for `isolation: isolate`, and iOS 26 Safari wants
  the backdrop `position: absolute` with `body { position: relative }`. Both are
  in the generated `base.css` and in `theme.css`'s base layer, so a consumer
  gets them from the stylesheet it already imports.
- Installed weight, measured 21 October 2026: 22 MB on disk for Base UI with
  its runtime graph (`@base-ui/utils`, `@floating-ui/react-dom`,
  `@floating-ui/utils`, `@floating-ui/dom`, `@floating-ui/core`,
  `@babel/runtime`, `use-sync-external-store`), 20 MB of it `@base-ui/react`
  itself, most of which is parts the package never imports. The package's
  `dist` imports three subpaths (`/dialog` 432 kB, `/popover` 528 kB, `/menu`
  1.4 MB on disk, before bundling and tree-shaking), and the tarball grows by
  eight files, about 26 kB. What reaches a browser is measured in the #443
  port.
- `date-fns` and `@date-fns/tz` are Base UI's *optional* peers (for its calendar
  parts, which the package does not wrap). npm does not install them and the
  package does not ask for them.

## Disclosure and the print rule

The Summary page is a meeting handout that must print every row, so a
collapsed disclosure keeps its rows in the DOM and hides them with the class
`hidden print:block`, never the `hidden` attribute. Whether Base UI's
Collapsible can honour that was the one open point when phase 1 started
(plan §6-3). The outcome is recorded in §8 "Disclosure" of the design-system
document and in the `Disclosure` component's own comment; the CHANGELOG for
0.4.0 names which way it went.

## Consequences

- `@tech-iki/design` 0.4.0 adds `Drawer`, `Popover`, `Menu` and `Disclosure`,
  and the four §8 blocks, the new contrast pairs and the render tests that hold
  them.
- Work OS's `focus-trap.ts`, `dismiss-stack.ts`, `panel-placement.ts`, the
  `Panel` in `grid-controls.tsx` and the `MovePolicyMenu` are deleted by the
  #443 port, or the component is wrong and comes back here.
- During that migration the `Drawer` must coexist with the dismiss stack:
  `onOpenChange(open, reason)` tells the caller *why* a close was requested
  (`escape`, `scrim`, `close`, `programmatic`) and returning `false` from
  `onEscape` vetoes it, so the stack can decide which layer an Escape belongs
  to until it is gone.
- A future primitive (Tooltip, Tabs, Combobox — plan phase 2) follows the same
  rule: subpath import, package-owned wrapper, nothing re-exported.
