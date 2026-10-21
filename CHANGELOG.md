# Changelog

Everything that changes in `@tech-iki/design`, newest first. The format follows
[Keep a Changelog](https://keepachangelog.com) and the versions follow
[Semantic Versioning](https://semver.org): a new token, tone or component is a
minor; a value correction that keeps every name is a patch; a renamed or removed
token or class is a major.

## [Unreleased]

## [0.4.0] — 2026-10-21

Phase 1 of the plan of 20 October 2026: the overlays, on Base UI (ADR 0002,
decided by Brian on 21 October). A minor, in its own version-bump PR as the
workflow asks. It was to wait for Work OS's port (tech-iki/iki-work-os #443)
to exercise the `Drawer`; Brian lifted that gate on 21 October so the next
phase could start, and #443 validates the `Drawer` against `main` instead.

### Added

- **One runtime dependency: `@base-ui/react` 1.9.0**, pinned exactly, imported
  by per-component subpath (`/dialog`, `/popover`, `/menu`, `/collapsible`) and
  never re-exported. The register's "no component library" narrows to "no
  *styled* component library" (§13d, §15). Its optional peers `date-fns` and
  `@date-fns/tz` are not required.
- `Drawer`: a side panel 30rem wide with a left border at `lg`, a full-screen
  sheet below; `header`, `refusal` (`role="alert"`) and `footer` slots around
  the body; scrim `bg-navy/25`; focus opens in the body, is trapped, and returns
  to the opener; Escape closes only the innermost layer and `onEscape` can veto
  it, with `onOpenChange(open, reason)` naming why a close was asked for, so
  Work OS's dismiss stack can coexist during the #443 migration.
- `Popover`: the toolbar trigger on `subtleButtonClass` with the `active` style
  while open and an optional count badge, and the `z-30 w-80` panel with
  option rows; Base UI positions it, replacing `panel-placement.ts`.
- `Menu`: an APG menu — arrow keys, Home and End, Escape, outside click —
  portalled, `role="menu"` and `role="menuitem"`, on §8's menu class strings.
- `Disclosure`: the whole header row is one button inside the heading, the
  count is part of the accessible name, `aria-expanded`/`aria-controls` are
  wired, the chevron is `Icon`, and **the rows stay in the DOM when collapsed**
  (`hidden print:block`, never the `hidden` attribute) so a page prints every
  row.
- **The four are client components** — each file starts with `"use client"`,
  which `tsc` preserves in `dist` — and §13 lists them. The nine earlier
  components stay server-safe, held by test.
- `base.css` and `theme.css`'s base layer gain the three rules the overlays
  need: `isolation: isolate` on the app root, the iOS 26 Safari backdrop rule
  (`body { position: relative }` with the scrim absolute), and the global
  `@media (prefers-reduced-motion: reduce)` reset the new §6 motion rule
  names. §16 loses its question 4.
- `TOKEN_PAIRS` holds every pair the overlays render: the highlighted menu
  item and option row (`ink` on `teal-soft`), the active trigger (`ink` and
  its `teal-deep` border on `teal-soft`) and the count badge (`paper` on
  `teal-deep`). The scrim is decorative and has no pair.
- The site: the four join `/components` as live specimens through one small
  client wrapper, the only `"use client"` the site allows.
- ADR 0002 in `docs/decisions`, two §15 rows, §8 blocks for the four, held by
  `overlays.test.tsx`; a test that every client-only file carries the directive.

## [0.3.0] — 2026-10-21

Phase 0 of the plan of 20 October 2026
(`docs/plans/2026-10-20-components-and-icons.md`, decided by Brian on 21
October): the components the consumers' counts asked for, and one icon source.
A minor; the breaking note below is why it is not a major.

### Changed

- **`KpiTile.tone` is `neutral | warm | overdue`**, the pill tones' names
  (`KpiTone`, a subset of `ToneName`). It was `neutral | warn | bad`, a second
  tone vocabulary the audit named. **Breaking for a `warn` or `bad` caller**
  (Work OS has seven tiles); nobody imports the package yet, so, as 0.2.0 did,
  this is a minor with the break stated rather than a major.
- `fieldClass` and `smallFieldClass` carry the disabled state the audit found
  missing: `disabled:cursor-not-allowed disabled:bg-paper-tint
  disabled:text-ink-muted`. The pair (`ink-muted` on `paper-tint`) was already
  held by `TOKEN_PAIRS`. The three pairs the invalid field renders — typed text
  and the border on the overdue fill, the error line on paper — were not, and
  are now.
- Every component passes `...rest` to its root element: `Pill`, `KpiTile`,
  `PageTitle`, `PageMain` and the five below.

### Added

- `Button` (`variant: primary | subtle | warn | icon | warnIcon`, `pending`,
  `pendingLabel`): the five class strings with `type="button"` by default and
  the pending state — the verb with an ellipsis, disabled, `aria-busy`.
- `Field` (`label`, `hint`, `error`, `size`, one control child): the label
  wraps the control and the hint and error sit beside it; `id`,
  `aria-describedby` and `aria-invalid` are wired; the invalid border and fill
  when there is an error, which is `role="alert"` text.
- `Notice` (`tone: info | positive | warm | overdue`): the tone's pair with the
  role derived from it — `status` for news, `alert` for refusals.
- `EmptyState`: a boxed sentence in `text-ink-muted` with an optional action.
- `Icon` with a typed `name`: 48 meanings — the 26 glyphs Work OS drew by hand,
  the nine unicode characters it used as stand-ins, and thirteen common roles —
  drawn from Lucide 1.60.0 (ISC) by `scripts/build-icons.ts` into
  `icons.generated.tsx` at build time, with Lucide's licence file (the ISC
  notice and Feather's MIT one) in the generated file. Two
  sizes only, 16px at stroke 1.5 and 20px at 1.4, held by `icon.test.ts`;
  settings is `sliders-horizontal` and drop is `download` (a tray), also held.
  `lucide` is a devDependency; `lucide-react` is not a dependency and will not
  be. `ICONS`, `LUCIDE_VERSION`, `IconName` and `IconSize` are exported for the
  site and for consumers that list the vocabulary.
- The site: `/components` and `/icons`. §8 of the written system gains one
  held block per new component and §15 the two decisions.

## [0.2.0] — 2026-10-20

The three rule breaks the 20 October 2026 audit found (#6,
`docs/audits/2026-10-20-design-system-audit.md`).

### Changed

- **`theme.css` switches Tailwind's default palette off** (`--color-*: initial`)
  before declaring the tokens. In an app that imports it, `bg-red-500`,
  `text-gray-500` and `text-white` now compile to nothing: the "no raw palette
  classes" rule is a build fact. `paper` is the system's white (`#ffffff`) and
  `ink` its black; `paper/50` and the other alpha forms work as `white/50` did.
  **Breaking for a consumer that used any default-palette class:** it stops
  generating. `white` and `black` were the only ones a rule-abiding consumer
  could have had; they move to `paper` and `ink`. The system's own names are
  all unchanged, which is why this is a minor and not a major.
- `primaryButtonClass`, `focusRingOnNavy` and `KpiTile`'s label bar say
  `paper`, not `white`. Same pixels, one token for one value.

### Added

- `TOKEN_PAIRS` holds `KpiTile`'s `warn` and `bad` values on the tile's
  `teal-soft` body (7.46:1 and 7.96:1). They passed; they were not asserted.
- `design-system-doc.test.ts` holds §8's class blocks to `ui-classes.ts`, `Pill`
  and `KpiTile`, the way §4 and §13 are held to the generated CSS.

### Fixed

- §8 of the written system: `fieldClass` and `smallFieldClass` no longer show
  the `focus:outline-none` the code removed; `Pill`'s line carries its
  `whitespace-nowrap`; `invalidFieldClass` is listed.

## [0.1.0] — 2026-10-20

The extraction (#1, PR #4, `23063fb`): the IKI design system leaves Work OS and
becomes a package, with this repository as its source of truth (ADR 0001).

### Added

- `tokens.ts`, the one place a value lives: 25 colour tokens, the Geist font
  stacks, the type scale, weights, radii, breakpoints, z-index ladder, the
  44px touch target, the contrast thresholds, `light-only`, no motion.
- Generated from it: `theme.css` (Tailwind v4 `@theme`, with an `@source` so a
  consumer's build scans the package's own classes), `tokens.css` (plain
  `:root` custom properties), `base.css`, `tokens.json`.
- Nine typed pill tones (`tones`, `PillTone`) and no vocabulary; the control
  class strings (`ui-classes.ts`); the contrast arithmetic with 43 asserted
  pairs and its negative controls (`ui-contrast.ts`); the pill width table
  (`pill-width.ts`); four components: `Pill`, `KpiTile`, `PageTitle`,
  `PageMain`.
- The showcase site (`apps/site`), eight static pages, and
  `docs/design-system.md` with its generated blocks held by test.

Neither version is published to npm yet (#2); consumers install from the git
tag and `prepare` builds `dist/`.
