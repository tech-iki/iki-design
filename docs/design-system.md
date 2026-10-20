# The IKI design system

The visual language of IKI Work OS, written down so other Islands Knowledge
Institute projects can share it. Everything here is a value the app ships, with
the file it lives in and the reason it is that value.

## 1. Status and scope

- **Status:** accepted, version 1, 10 September 2026; refreshed 23 September
  2026 against `main` at `3acb50b`, including every usage count. The policy
  list and create-flow entries were updated for #265 on 24 September 2026;
  usage counts were not re-measured then.
- **Moved, 20 October 2026:** the system now lives in `tech-iki/iki-design`,
  which is the source of truth. IKI Work OS is a consumer of the
  `@tech-iki/design` package.
- **Applies to:** IKI Work OS today. Offered to the IKI Digital Library and the
  public website (see [§13](#13-adopting-the-system)); neither has adopted it yet.
- **Supersedes nothing.** It records what ADR 0003, 0006 and 0007 decided, plus
  the rules that only ever lived in code comments. The numbered ADRs cited here
  are in Work OS's `docs/decisions/`; new ones go in this repository's.

### Where the source of truth lives

| What | File | Notes |
| --- | --- | --- |
| Colour tokens | `packages/design/src/tokens.ts` | 25 tokens, Tailwind v4 CSS-first. There is no `tailwind.config.*`. |
| Control and focus classes | `packages/design/src/ui-classes.ts` | Buttons, fields, focus rings, the grid cursor. |
| Status colour | `packages/design/src/tones.ts` | The pill tone constants and the `PillTone` union. The vocabulary maps (Work OS's `HEALTH_PILL` and the rest) stay in each app. |
| Contrast assertions | `packages/design/src/ui-contrast.ts` + `.test.ts` | Every rendered pair, with its WCAG threshold. |
| Table chrome | `src/components/data-table.tsx` | Work OS only; stays in tech-iki/iki-work-os. Header, zebra, hover, frozen columns, stacked rows. |
| Email chrome | `src/lib/email-chrome.ts` | Work OS only; stays in tech-iki/iki-work-os. Inline styles; mail clients strip stylesheets. |
| Print | `src/app/globals.css` (`@media print`) | Work OS only; stays in tech-iki/iki-work-os. Page boxes and the Safari caveat. |
| Generated stylesheets | `packages/design/dist/` | `theme.css`, `tokens.css`, `base.css` and `tokens.json`, built from `tokens.ts` by `scripts/build-css.ts`. Edit the source, not these. |

### Decided, and open

**Decided:** the palette and its provenance; light only; no *styled* component
library (unstyled primitives only inside the package, ADR 0002); no motion
without its reduced-motion counterpart; the Airtable interaction model; the accessibility floors; that contrast is
asserted by test rather than claimed in prose.

**Open:** the three colour families across IKI surfaces ([§3](#three-colour-families-today)),
and the drift listed in [§14](#14-known-drift-inside-work-os).

### Changing it

Propose an ADR in `docs/decisions/` of this repository (`tech-iki/iki-design`),
not a change in a consumer. A token added without its contrast pair fails the
suite, which is the point (ADR 0006).

This document's token blocks (§4, §13a and Appendix A) are now generated outputs
of `packages/design/src/tokens.ts`, and a test in the package will hold them to
it. `src/lib/design-system-doc.test.ts` in tech-iki/iki-work-os is still Work OS's:
it reads the three token blocks below and fails if any hex or any token name
disagrees with Work OS's `globals.css`.

## 2. Principles

1. **The data carries the colour; the chrome gets out of the way.** Navy is
   furniture, teal marks actions, and the status fills are the only colour that
   means something (ADR 0006).
2. **Colour is never the only signal.** A pill always carries its label; the
   active nav item has weight and a bar as well as a tint (#57).
3. **Contrast is asserted, not claimed.** ADR 0003 said "AA-safe throughout";
   measurement said 4.11:1. Now a test walks every pair (#57).
4. **Light only.** The workbook is light and the fixed palette is the point; a
   parallel dark theme doubles every decision for no demand (ADR 0003).
5. **No component library.** The primitives are small hand-rolled Tailwind
   components; a themed library would fight the workbook look (ADR 0003, ADR 0006).
6. **Measured, not assumed.** Print orientation, row tints, logo legibility on
   navy: each rule below cites the number that settled it.
7. **Density on the desk, room on the phone.** Controls are about 26px tall with
   a mouse and 44px under a thumb, through a responsive minimum rather than one
   loose size (#63).
8. **One definition per rule.** Focus rings, button classes, status colours and
   email chrome exist once; per-component copies were deleted so a component
   cannot drift (ADR 0006 §4).
9. **An icon is not a name.** Every icon is `aria-hidden`; its control carries an
   `sr-only` label and a hint — a `title`, or since 0.5.0 a `Tooltip`, which
   also reaches the keyboard, never both (#95, §8 Tooltip).
10. **Add a token, add its contrast pair.** Otherwise the suite fails (ADR 0006).

## 3. Brand

### Naming

- The product is **IKI Work OS** — the institute's initials, then the product.
- Tab titles are `Page · IKI Work OS`, a middle dot with a space each side,
  spelled out per page. There is no `title.template`.
- One exception: the month-end report's title is `IKI monthly work report – Sky
  Aelans – August 2026`, with en dashes, because the print dialog offers it as a
  filename and "a middle dot is a poor thing to hand a filesystem".

### The assets

These are Work OS's own files, in `tech-iki/iki-work-os`.

| File | Size | Where | Rule |
| --- | --- | --- | --- |
| `public/iki-logo.png` | 264 × 128 RGBA | Login card, `h-16` (64px) | The full lockup, on white only |
| `public/iki-mark-white.png` | 78 × 78 RGBA, every opaque pixel `#ffffff` | Rail at 28px, email header at 24px | The mark alone, on navy |
| `src/app/icon.png` | 128 × 128 RGBA | Browser tab | Nautilus alone, alpha required |
| `src/app/favicon.ico` | 32 × 32, PNG payload | Browser tab | Ours, not the scaffold's |

Rules, each with its measurement:

- **The coloured lockup goes on white and never on navy.** The mark is dark
  indigo: 1.42:1 against `navy`. A navy band beside the logo also made the login
  card read as two competing headers (#141).
- **On navy, the white reverse mark alone.** The lockup's "ISLANDS KNOWLEDGE
  INSTITUTE" line degrades to a grey smear below about 48px, and the rail never
  offers more than 28 (#143).
- **Never recolour.** The institute supplies the white asset, so nothing is
  generated or matted.
- **Every `<img>` declares `width`/`height` equal to the PNG's real pixels.** A
  mismatch reserves the wrong aspect box and shifts the layout on every load;
  Work OS's `login-logo.test.ts` reads the IHDR bytes and fails if they drift.
- **Icon assets carry an alpha channel.** The first tab icon was RGB with no
  alpha and rendered as a hard white square on dark browser chrome.
- **Assets are same-origin files, never hotlinked.** The policy is `img-src
  'self' blob: data:`, and the source URLs are a CMS that can move.
- **The brand link keeps one accessible name at every width:** `aria-label="IKI
  Work OS"`, image `alt=""`, and no `title` — an identical name and description
  is announced twice by some screen readers (#144).

### Three colour families today

Measured on 10 September 2026 from the assets and stylesheets. These are facts,
not a decision.

| Surface | Colour | Hex | Hue / saturation / lightness |
| --- | --- | --- | --- |
| Logo, nautilus mark | indigo | `#0b023b` | 249° / 93% / 12% |
| Logo, wordmark gradient | indigo → mid blue | `#1d1c60` → `#224f97` | 241° → 217° |
| Logo, institute line | indigo | `#120b4a` | 247° / 74% / 17% |
| Work OS, navy | slate-navy | `#12304a` | 208° / 61% / 18% |
| Work OS, teal | teal | `#168b8c` | 181° / 73% / 32% |
| Digital Library, primary | violet-blue | `oklch(0.42 0.15 270)` ≈ `#2f429d` | 230° / 54% / 40% |
| Website, primary | Pacific blue | `#005f73` | 190° / 100% / 23% |
| Website, accent | lagoon green | `#0a9396` | 181° / 88% / 31% |

Three observations worth carrying:

- The logo shares no hue with any app. The app palette came from the workbook,
  not the logo (ADR 0003), and teal has no counterpart anywhere in the mark.
- The website's lagoon `#0a9396` and Work OS's `teal` `#168b8c` are the **same
  hue**, 181°, differing only in saturation and lightness. They are the closest
  pair across the three families.
- The website's `#0a9396` is 3.73:1 on white — below AA for text. Work OS hit
  the same wall with `#168b8c` (4.11:1) and answered it with `teal-deep`
  `#14797a` at 5.19:1.

**Options, for Brian to decide.** (a) The apps keep navy and teal, and the
website's accent moves to `teal-deep` for text while keeping lagoon for
decoration — the smallest change, and it fixes an existing contrast failure.
(b) The apps adopt the website's Pacific blue and lagoon, which re-opens every
contrast pair and every workbook association staff already read. (c) Leave all
three and treat the logo as the only shared mark. This document describes (a)'s
palette without choosing.

## 4. Colour

Twenty-five tokens. Every ratio below is computed with the WCAG 2.2 formula from
the hex values. Text needs 4.5:1 (WCAG 1.4.3); a control boundary or meaningful
graphic needs 3:1 (WCAG 1.4.11).

### Brand and chrome

| Token | Hex | Role | Measured |
| --- | --- | --- | --- |
| `navy` | `#12304a` | App furniture: the rail, table header rows. Demoted from a per-section band by ADR 0006. | white on it 13.57:1 |
| `teal` | `#168b8c` | The workbook teal. Large decorative fills only — one class use in the tree, the chart columns. | 4.11:1 on paper (fails text, clears 3:1) |
| `teal-deep` | `#14797a` | Every text-bearing teal surface: buttons, KPI label bars, links, focus ring, grid cursor. | 5.19:1 on paper |
| `teal-soft` | `#eaf4f4` | KPI tile bodies, hover fills, the workstream chip, the Completed pill. | navy on it 12.11:1 |
| `sky` | `#ddeaf0` | Group header bands. (ADR 0003 gave it description strips; those are gone.) | navy on it 11.05:1 |

### Surfaces, rules and text

| Token | Hex | Role | Measured |
| --- | --- | --- | --- |
| `paper` | `#ffffff` | The page and every card. | — |
| `paper-tint` | `#f4f8f9` | Zebra stripe, login ground, dashed panels. | 1.069:1 against paper |
| `grid` | `#d5dee5` | Table rules, card borders, dividers, the neutral pill fill. | 1.36:1 on paper — decorative only |
| `grid-strong` | `#7e8d9a` | Input and button borders, drawer edge, task card. | 3.41:1 paper, 3.19:1 tint, 3.04:1 teal-soft |
| `ink` | `#23313d` | Body text. | 13.31:1 on paper |
| `ink-muted` | `#5b6b7a` | Secondary text; seven of the grid's columns. | 5.48:1 on paper |
| `row-hover` | `#e0f2f4` | The hovered grid row. Opaque by necessity. | ink-muted on it 4.75:1 |
| `row-error` | `#fcf0f0` | An errored import row. `health-overdue-bg` at 30% over paper, pre-flattened. | teal-deep link on it 4.66:1 |

`row-hover` is the deepest tint that keeps `ink-muted` above the AA floor.
`sky` (4.47:1) and `grid` (4.02:1) both fail it. Its predecessor was
`teal-soft/40`, which flattens to `#f7fbfb` — 1.04:1, less visible than the
zebra striping itself, and translucent, so the frozen columns showed the
scrolled content straight through the pinned Task ID (#69).

### Status fills — a light fill and dark same-hue text

| Fill | Text | Meaning | Measured |
| --- | --- | --- | --- |
| `health-overdue-bg` `#f4cccc` | `health-overdue-fg` `#990000` | Overdue; High priority; import error | 6.10:1 |
| `health-ontrack-bg` `#d9ead3` | `health-ontrack-fg` `#274e13` | On Track; Completed status; import create | 7.62:1 |
| `health-stale-bg` `#e7b34b` | `health-stale-fg` `#5c4300` | Stale — amber, per the workbook | 4.85:1 |
| `warm-bg` `#fce5cd` | `warm-fg` `#783f04` | Due Soon; Medium; Awaiting Input; trash button | 6.86:1 |
| `info-bg` `#d9eaf7` | `info-fg` `#12304a` | In Progress; import update; login notices | 11.03:1 |
| `priority-low-bg` `#fff2cc` | `priority-low-fg` `#7f6000` | Low priority | 5.26:1 |
| `grid` `#d5dee5` | `ink` `#23313d` | Neutral: Not Started, On Hold, Cancelled | 9.76:1 |
| `teal-soft` `#eaf4f4` | `navy` `#12304a` | Completed health flag | 12.11:1 |

`info-fg` and `navy` are the same hex. They are separate tokens so a retune of
one does not silently move the other.

### The theme block

This is `theme.css` as the package ships it, generated from
`packages/design/src/tokens.ts`; a Tailwind v4 app imports it rather than copying
it. `design-system-doc.test.ts` in the package holds this block, the two in
[§13a](#13a-any-stack--custom-properties) and Appendix A to the generators, so
the document cannot drift from the files.

<!-- tokens:theme -->
```css
/* Generated from tokens.ts by @tech-iki/design — do not edit; change tokens.ts */

/*
 * Make the consuming app's Tailwind build scan this package's compiled
 * components and class strings for utilities. Tailwind does not scan
 * node_modules on its own, so without this `bg-teal-deep`, `focus-visible:outline-2`
 * and the rest of the strings in ui-classes and the pill tones would never be
 * generated, and the components would render unstyled. The path is relative
 * to this file, which sits beside index.js in dist/.
 */
@source "./index.js";

/*
 * index.js only re-exports. The class strings themselves live in the modules
 * beside it, so the directory is scanned as well.
 */
@source "./";

@theme {
  /*
   * Tailwind's default palette is switched off before the tokens are declared, so
   * `bg-red-500` or `text-white` in a consumer compiles to nothing: the system's
   * "no raw palette classes" rule is a build fact, not a review note (#6).
   * `paper` is the system's white and `ink` its black.
   */
  --color-*: initial;

  /* Brand and chrome */
  --color-navy: #12304a;
  /* 4.11:1 on paper: below AA for text, clear of the 3:1 non-text threshold. Darkening it was rejected because the chart columns legitimately want the workbook hue. */
  --color-teal: #168b8c;
  /* 5.19:1 on paper. Added by ADR 0006 because plain teal failed AA for text. */
  --color-teal-deep: #14797a;
  --color-teal-soft: #eaf4f4;
  --color-sky: #ddeaf0;

  /* Surfaces, rules and text */
  --color-paper: #ffffff;
  --color-paper-tint: #f4f8f9;
  /* 1.36:1 on paper — fine for a table rule, never a control boundary, which WCAG 1.4.11 wants at 3:1. */
  --color-grid: #d5dee5;
  /* 3.41:1 on paper, 3.19:1 on paper-tint, 3.04:1 on teal-soft — a control boundary everywhere it is drawn. */
  --color-grid-strong: #7e8d9a;
  --color-ink: #23313d;
  --color-ink-muted: #5b6b7a;
  /* Opaque, and it has to be: frozen columns paint with bg-inherit, so an alpha row background lets the scrolled content show through the pinned cells. The deepest tint that keeps ink-muted at 4.75:1; sky (4.47:1) and grid (4.02:1) both fail it. */
  --color-row-hover: #e0f2f4;
  /* health-overdue-bg at 30% over paper, pre-flattened so the row stays opaque for the same reason. The teal-deep link on it is 4.66:1. */
  --color-row-error: #fcf0f0;

  /* Status fills: a light fill and dark same-hue text */
  --color-health-overdue-bg: #f4cccc;
  --color-health-overdue-fg: #990000;
  --color-health-ontrack-bg: #d9ead3;
  --color-health-ontrack-fg: #274e13;
  --color-health-stale-bg: #e7b34b;
  --color-health-stale-fg: #5c4300;
  --color-warm-bg: #fce5cd;
  --color-warm-fg: #783f04;
  --color-info-bg: #d9eaf7;
  /* The same hex as navy, as a separate token so a retune of one does not silently move the other. */
  --color-info-fg: #12304a;
  --color-priority-low-bg: #fff2cc;
  --color-priority-low-fg: #7f6000;
}

/*
 * A Next app sets these two variables through next/font (self-hosted Geist,
 * so a `font-src 'self'` policy holds). Anything else falls back to a Geist
 * served locally under the family name, and then to the system stack.
 */
@theme inline {
  --font-sans: var(--font-geist-sans, "Geist"), system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono: var(--font-geist-mono, "Geist Mono"), ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

@layer base {
  body {
    background: var(--color-paper);
    color: var(--color-ink);
    font-family: var(--font-sans);
    /* iOS 26 Safari: a scrim is position: absolute and needs a positioned body. */
    position: relative;
  }
  /* The app root: Base UI portals popups to <body>, and the page stays below them. */
  .iki-app {
    isolation: isolate;
  }
  /* No motion (design system §6): a transition needs a motion-reduce: counterpart; this is the floor. */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
}
```

### The semantic maps

Every vocabulary term has a colour, and a test fails if one is added without
one. They are also the only permitted source of a pill's tone, and since #248
the type checker enforces it: `Pill.tone` is a `PillTone`, a union of exactly the
strings the maps use, so a hand-written colour literal at a call site is a
compile error. That replaced the source scan #242 had added — `tsc` is the
guard now, and it cannot be satisfied by a comment or a string built at runtime.

```ts
// packages/design/src/tones.ts
export const NEUTRAL = "bg-grid text-ink";
export const POSITIVE = "bg-health-ontrack-bg text-health-ontrack-fg";

export type PillTone =
  | typeof NEUTRAL
  | typeof POSITIVE
  | "bg-health-overdue-bg text-health-overdue-fg"
  | "bg-warm-bg text-warm-fg"
  | "bg-health-stale-bg text-health-stale-fg"
  | "bg-teal-soft text-navy"
  | "bg-info-bg text-info-fg"
  | "bg-priority-low-bg text-priority-low-fg"
  | `${typeof NEUTRAL} line-through`;
```

A new tone means a new member of this union, which is the moment to add its
contrast pair to `TOKEN_PAIRS`. A pill's `className` is for layout only; a
`bg-` class there would be rendered into the same class string as the tone, and
nothing but review stops it.

The maps below are Work OS's. The package exports only the tone constants and the
`PillTone` union; each app keeps its own `Record<Vocabulary, PillTone>`.

| Map | Entries |
| --- | --- |
| `HEALTH_PILL` | Overdue → overdue; Due Soon → warm; Stale → stale; On Track → POSITIVE; Completed → `bg-teal-soft text-navy`; On Hold, Cancelled → NEUTRAL |
| `STATUS_PILL` | Not Started → NEUTRAL; In Progress → info; Awaiting Input → warm; On Hold → NEUTRAL; Completed → POSITIVE; Cancelled → NEUTRAL + `line-through` |
| `PRIORITY_PILL` | High → overdue; Medium → warm; Low → priority-low |
| `ACTION_PILL` | create → POSITIVE; update → info; unchanged → NEUTRAL; error → overdue |
| `IMPORT_STATUS_PILL` | committed → POSITIVE; pending → warm; discarded → NEUTRAL — keyed by an `ImportStatus` union since #248, so it is exhaustive by type like the others |

### Rules

- **Teal carries text only as `teal-deep`.** Plain `teal` stays for large
  decorative fills, where 3:1 applies. Darkening `teal` itself was rejected: the
  chart columns legitimately want the workbook hue (ADR 0006).
- **Controls are bounded by `grid-strong`, tables by `grid`.** A separator needs
  no ratio; a control boundary needs 3:1.
- **A row's background is always opaque.** Frozen cells inherit it. A state
  colour keeps a hover through `brightness-95`, a filter that cannot introduce
  alpha.
- **`teal-deep` inside a row is an indicator, never text.** On `row-hover` it is
  4.49:1 — fine at 3:1, short of 4.5:1. Every in-row use is an `aria-hidden`
  glyph beside `sr-only` words. If a row ever gains real link text, the hover
  tint must get lighter, and there is no colour that keeps text at AA and still
  beats the zebra.
- **Translucent borders are measured flattened.** `warm-fg/40` looked AA-safe
  and composited to 1.92:1; `/70` clears 3:1 at 3.49:1.
- **No raw Tailwind palette classes, and no hex outside the token files.**
  Searched across Work OS's `src` for `bg-zinc-*`, `text-gray-*` and every numbered
  palette utility: zero hits. Searched for six-digit hex outside Work OS's
  `globals.css` and `email-chrome.ts`, and outside the package's `ui-contrast.ts`: the only hits are Google's four brand
  colours on the sign-in button, which are Google's and literal on purpose.
- **The navy rail uses paper at fixed alphas:** text `paper/75` (8.29:1), saved
  views `paper/70` (7.44:1), group headings `paper/50` (4.59:1), hover
  `paper/10`, active fill `paper/12`, rules `paper/15`, the sign-out border
  `paper/50` (3:1 as a boundary). `white` itself is not a utility: `theme.css`
  switches Tailwind's default palette off, so `paper` is the only white.

## 5. Typography

One family, two faces. Geist for everything, Geist Mono for identifiers.

```tsx
// Work OS: src/app/layout.tsx
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// <html className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
```

`next/font/google` self-hosts the files, so no request reaches Google and the
policy's `font-src 'self'` holds. The fallback stack is `system-ui, sans-serif`.
Email cannot load a web font and uses `system-ui, -apple-system, 'Segoe UI',
sans-serif`.

### The scale in use

| Class | Size | Uses | What it is for |
| --- | --- | --- | --- |
| `text-xs` | 12px | 115 | Table headers, every pill, form labels, hints, mono identifiers, eyebrows, KPI label bars |
| `text-sm` | 14px | 117 | The working size: tables, inputs, buttons, nav links, section headings, page descriptions |
| `text-base` | 16px | 2 | The guide's section headings; the login h1 |
| `text-lg` | 18px | 1 | Import summary chip value |
| `text-xl` | 20px | 2 | Page h1; report h1 |
| `text-3xl` | 30px | 1 | KPI tile figure |
| `text-[11px]` | 11px | 8 | Rail group headings, count badges, and five sites on the policy board (column counts, card reference, a card meta line, refusal chip, Move to… trigger) |
| `text-[10px]` | 10px | 1 | The compact pill on a policy card, through `Pill`'s layout-only `className` |

Two sizes carry about 97% of the interface. There is no `leading-*` anywhere:
every line height is Tailwind's default for its size.

### Weight, tracking, numerals

- **Two weights on a 400 body:** `font-medium` (500) for labels, pill text,
  inactive nav and card titles — 33 uses; `font-semibold` (600) for headings,
  buttons, table headers, active nav and badges — 57 uses. **Nothing is bold**;
  `font-bold` appears nowhere.
- **`tracking-wide`** (0.025em) on uppercase eyebrows, **`tracking-wider`**
  (0.05em) on the rail headings and the report's institute line,
  **`tracking-tight`** (−0.025em) on the two 20px h1s only.
- **`tabular-nums` on every figure** — 29 uses: KPI values, table counts, chart
  labels, percentages, timestamps.
- **Mono marks identifiers, never prose or table numbers:** task references
  (`OPS-014`), workstream codes, generated passwords, error digests, chart axis
  labels.

### Hierarchy and measure

- **h1** — `text-xl font-semibold tracking-tight text-ink` inside `<header
  class="mb-5">`, with an optional `mt-1 max-w-3xl text-sm text-ink-muted`
  description. It was a navy band with a sky strip until ADR 0006 removed it:
  with a navy rail already framing the page, a second navy field competed with
  the status colours in the data.
- **h2** — `text-sm font-semibold text-ink` on data pages, `text-base` on the
  guide. Plain type, never a chip or band.
- **h3 eyebrow** — `text-xs font-semibold uppercase tracking-wide text-ink-muted`.
- **Measure** — prose caps at `max-w-4xl` (896px); descriptions at `max-w-3xl`;
  tables run the full width, like the workbook fills its window.

## 6. Spacing, shape, elevation, layering, motion

**Spacing** is Tailwind's default 4px scale; there are no spacing tokens.
`gap-2` (8px) is the default between siblings, 66 uses; `gap-1` inside a
control, `gap-3` between fields, `gap-4` in a form, `gap-6`/`gap-8` between page
sections. There is no `space-x-*`/`space-y-*` anywhere — flex and grid `gap` are
the only sibling-spacing mechanism. Cell padding is `px-3 py-2`; sheet cells
halve the vertical to `py-1` while keeping `px-3`, so cell text stays aligned
with the header labels. Page padding is `px-6 py-8 lg:px-8`.

**Radius**

| Class | px | Where |
| --- | --- | --- |
| `rounded-md` | 6 | The default box: fields, buttons, cards, tables, panels, tiles — 52 uses, plus the 7 shared control classes |
| `rounded` | 4 | Things *inside* a cell or a panel: chips, cell triggers, option rows — 32 uses |
| `rounded-full` | — | Pills, count badges, the active-nav bar |
| `rounded-xs` | 2 | The focus-ring corner on inline links |
| `rounded-lg` | 8 | The login card, once |

**Borders** are 1px everywhere; `border-2` appears nowhere. Anything thicker is
an `outline`, so it does not shift layout when it appears and can be drawn
inside a box with a negative offset.

**Elevation** is a short ladder, and depth is reserved for what is over the
page or can be lifted off it: border only for anything fixed in place →
`shadow-sm` (the login card, floating on a tinted page, and the policy card,
the one resting object that can be picked up and dragged) →
`shadow-lg` (popovers and cell pickers) → `shadow-2xl` (the record drawer). The
one custom shadow is navy-tinted and conditional:
`shadow-[2px_0_5px_-1px_rgba(18,48,74,0.25)]` on the last frozen column, drawn
only while the grid is scrolled sideways. The drawer's scrim is `bg-navy/25`,
not black.

**Layering**

| z | What |
| --- | --- |
| `z-50` | The skip link when focused; every overlay portalled to `document.body` to escape a scroll container — the cell popovers (error box, pickers, the package's `Combobox`), the policy board's Move to… menu, and `Tooltip` |
| `z-40` | The record drawer and its scrim |
| `z-30` | Toolbar popovers |
| `z-20` | Frozen header cells |
| `z-10` | Header cells and the column-resize handle |
| `z-[1]` | Frozen body cells (`sticky z-[1] bg-inherit`) |

`TableFrame`'s own sticky rule carries no z-index on purpose: as a descendant
selector it out-specifies a utility, and a `z-10` there silently beat the grid's
`z-20` frozen headers — measured, they computed to 10.

**Motion: there is none, and the rule is now written.** Searched `transition-`,
`duration-`, `animate-`, `ease-`, `@keyframes` across Work OS's components and
stylesheet: no hits. The only matches for "transition" are React's
`useTransition`. State changes are instant colour swaps, `opacity-50` when
disabled, `opacity-60` while a cell commits, and a ring on focus. The package's
overlays (§8 Drawer, Popover, Menu, Disclosure) add none either: Base UI ships
no CSS and no motion, and the wrappers add no `transition` or `animate` class,
so an overlay appears and disappears in one frame.

The rule, settled 21 October 2026 (plan of 20 October, §4.3; formerly open
question §16-4): **a transition is allowed only with a `motion-reduce:`
counterpart that removes it, and `base.css` and `theme.css` ship the reset** —
a global `@media (prefers-reduced-motion: reduce)` block that sets every
animation and transition duration to a single millisecond and turns smooth
scrolling off. A consumer that adds a transition inherits the reset from the
stylesheet it already imports; the `motion-reduce:` counterpart is still
required on the class itself, because the reset is a floor, not a design.

## 7. Layout and shell

### The rail

```tsx
<aside className={`sticky top-0 flex h-screen shrink-0 flex-col bg-navy print:hidden ${rail.width}`}>
```

```ts
// The width and visibility matrix, Work OS's src/components/app-sidebar.tsx
function railClasses(collapsed: boolean) {
  return {
    width:    collapsed ? "w-14"                : "w-14 lg:w-56",
    label:    collapsed ? "sr-only"             : "max-lg:sr-only",
    chrome:   collapsed ? "hidden"              : "max-lg:hidden",
    railOnly: collapsed ? ""                    : "lg:hidden",
    row:      collapsed ? "justify-center px-0" : "justify-center px-0 lg:justify-start lg:px-3",
    header:   collapsed ? "flex-col gap-1"      : "flex-col gap-1 lg:flex-row lg:gap-2",
  };
}
```

- **224px from `lg`, 56px below it or when collapsed.** Below `lg`, 224px of
  navigation would leave a phone about 150px of content.
- **Groups:** Work, Setup, Admin (admin only), each headed in 11px uppercase
  `text-paper/50`. Guide sits in the footer, because it is reference rather than
  work.
- **The collapse preference is a cookie, not localStorage,** so the server
  renders the rail at its final width on first paint and it does not jump.
- **A hidden label is `sr-only`, not `hidden`** — it stays the accessible name.
  Decorative chrome is `hidden` outright.

```tsx
// NavLink
className={`relative flex min-h-11 min-w-11 items-center gap-3 rounded-md py-2 text-sm md:min-h-0 md:min-w-0 ${focusRingOnNavy} ${rail.row} ${
  active
    ? "bg-paper/12 font-semibold text-paper before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:rounded-full before:bg-paper"
    : "font-medium text-paper/75 hover:bg-paper/10 hover:text-paper"
}`}
```

Weight and a left bar carry the active state as well as colour, so it survives a
monochrome view. Saved views use a `•` for the same reason, as does the Summary
page's place under Tasks.

### Page container and title

```tsx
// full (default): content runs the width, like the workbook fills its window
"w-full px-6 py-8 lg:px-8"
// readable: the guide and the error page
"mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-8 lg:px-8"
// the landmark the skip link targets
<main id="main-content" tabIndex={-1} className={className}>
```

```tsx
// PageTitle
<header className="mb-5">
  <h1 className="text-xl font-semibold tracking-tight text-ink">{title}</h1>
  <p className="mt-1 max-w-3xl text-sm text-ink-muted">{description}</p>
</header>
```

### Index pages

A page whose content is a list of other pages — the Reports index today (#403) —
is one shape: the page title, then one section per group, one card per entry.

```tsx
<section className="flex flex-col gap-3">
  <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">{area}</h2>
  <ul className="flex flex-col gap-3">
    <li className="rounded-md border border-grid bg-paper p-4">
      <Link href={href} className={linkClass}>{title}</Link>
      <p className="mt-1 max-w-3xl text-sm text-ink-muted">{description}</p>
      <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
        <span>Formats:</span>
        <span className="rounded bg-teal-soft px-1.5 py-0.5 font-mono text-xs text-navy">{format}</span>
      </p>
    </li>
  </ul>
</section>
```

An empty group is **omitted**, never drawn with a "nothing here" line: a heading
over nothing tells the reader that something exists which they may not see, and
spends two lines saying it. When every group is empty the page shows the boxed
empty state, which says only that the reader has none. Nothing has a fixed width,
so the whole thing is a single column at 375px.

**What qualifies as an entry is a rule, not a preference.** An entry is a report,
and a report is a roll-up **across people over a period** — the answers for a
month, a pay run or a leave year, drawn from everyone's rows and standing on its
own. A work queue (#363, the #383 approver queues, #391's certificate list) is
work still to do, one row per item, and belongs on the page that owns the work. A
single-person record (#366's printable timesheet, #381 and #399's leave record)
is one person's row, and belongs on that person's page. Neither is a report.

**Access is decided once, in the registry.** Work OS's `src/lib/reports.ts` holds one entry
per report, each with its `canView(actor)`, and that is the only place the rule
is written: the index asks `reportsByArea(actor)` for what to draw, and each
report page asks `requireReport(slug, actor)`, which calls `notFound()` on a
refusal — in its `generateMetadata` too, first, because Next streams metadata
on its own and a refused 404 must not carry the report's title. Hiding the link is a courtesy; the 404 is the enforcement — and because
a typo in the URL gets the same 404, a refusal never confirms that the report
exists. Work OS's `(app)` group has an `error.tsx` but no `not-found.tsx`, so the 404
is Next's own page.

### Breakpoints

Tailwind's defaults, unmodified. `xl` and `2xl` are never used.

| Prefix | Min width | What changes |
| --- | --- | --- |
| `sm` | 640px | KPI tiles 1 → 2 columns; import chips 2 → 4; guide legend rows go horizontal; the create form goes two-column; record panel field rows become label/value pairs |
| `md` | 768px | The touch floor is released; tables stack or become cards; the toolbar collapses into a "Filter & sort" sheet; table minimum widths begin to apply |
| `lg` | 1024px | The rail widens to 224px with labels; the record drawer becomes a 480px side panel instead of a full-screen sheet; KPI tiles reach 4 columns |

The design-target viewport is 1280px: the grid budget is 988px, being 1280 less
the 224px rail, 48px of page padding, a 2px border and about 16px of scrollbar.
The phone reference is 375 × 812.

**The policy board is the one layout with no breakpoint at all.** Its six
columns sit in `grid min-w-[1140px] grid-cols-6 gap-3` inside an
`overflow-x-auto` strip, so it scrolls sideways at every width rather than
stacking or turning into cards below `md` as every other wide surface does. A
column's header can focus that column and hide the rest, which is the phone
route today. Whether that is the intended phone behaviour is not written down
anywhere; see [§14](#14-known-drift-inside-work-os).

### Phones

Both layouts are always rendered and toggled with CSS (`md:hidden` /
`hidden md:block`), never by measuring the viewport in JavaScript, so everything
is server-rendered and cannot mismatch on hydration. The grid is 2,750px wide;
at 375px only 14% of it shows, and the two frozen columns are 300px of the 375.
So below `md` the task grids are replaced by cards, and the four smaller tables
stack into label/value blocks through one set of JSX rather than a second card
component — two components would become two field lists, one of them quietly
falling behind.

### Sticky, and print

A table header sticks only inside a frame with a bounded height
(`max-h-[calc(100vh-15rem)]`); four tables once carried a `sticky top-0` that
did nothing. The scroll frame must be `relative`: a static frame establishes no
containing block, and the table's overflow inflated the document to 3,751px
against 734px of real content, which also stranded the sticky rail (#165).

Print rules are in [§11](#11-email-and-print).

## 8. Components

There is no styled component library. These class strings are the library, and
the components the package exports are the strings with their behaviour
attached: `Pill`, `KpiTile`, `PageTitle`, `PageMain` since 0.1.0; `Button`,
`Field`, `Notice`, `EmptyState` and `Icon` since 0.3.0 (the plan of 20 October
2026, `docs/plans/2026-10-20-components-and-icons.md`, phase 0); the four
overlays since 0.4.0 (phase 1, client-only); and since 0.5.0 (phase 2)
`TableFrame`, `Checkbox`, `Radio` and `RadioGroup`, server-safe, and
`Tooltip`, `Tabs` and `Combobox` on Base UI, client-only (§13). Every
component passes `...rest` to its root element — or, where the input is the
control (`Checkbox`, `Radio`, `Combobox`), to the input.

### Buttons

<!-- classes:buttons -->
```
touchTarget          min-h-11 min-w-11 md:min-h-0 md:min-w-0
focusRing            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-deep
focusRingOnNavy      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper

primaryButtonClass   {touchTarget} rounded-md bg-teal-deep px-3 py-2 text-sm font-semibold text-paper hover:bg-navy disabled:opacity-50 {focusRing}
subtleButtonClass    {touchTarget} rounded-md border border-grid-strong px-2.5 py-1.5 text-xs text-ink hover:bg-teal-soft disabled:opacity-50 {focusRing}
warnButtonClass      {touchTarget} rounded-md border border-warm-fg/70 px-2.5 py-1.5 text-xs text-warm-fg hover:bg-warm-bg disabled:opacity-50 {focusRing}
iconButtonClass      {touchTarget} inline-flex items-center justify-center rounded-md p-1.5 text-ink-muted hover:bg-teal-soft hover:text-ink disabled:opacity-50 {focusRing}
warnIconButtonClass  {touchTarget} inline-flex items-center justify-center rounded-md p-1.5 text-warm-fg hover:bg-warm-bg disabled:opacity-50 {focusRing}
linkClass            text-teal-deep underline hover:text-navy rounded-xs {focusRing}
```

- **Primary hovers to navy**, not to a darker teal.
- **Warn is destructive but reversible** — warm, not alarming, because the task
  goes to Trash and can be restored. The border is `/70`, not `/40`, because
  `/40` composited to 1.92:1.
- **An icon button is 28px square** (`p-1.5` on a 16px glyph) and keeps the 44px
  floor below `md`. The name lives in an `sr-only` span and a `title`; the glyph
  is `aria-hidden`. **A confirm step stays in words** — a resting action can be
  recognised from its icon, but "yes, really" has to be read.
- **On navy**, the sign-out button is
  `flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md border border-paper/50 p-1.5 text-sm text-paper/90 hover:bg-paper/10 hover:text-paper md:min-h-0 md:min-w-0 {focusRingOnNavy}`.

### Fields and labels

<!-- classes:fields -->
```
fieldClass         {touchTarget} rounded-md border border-grid-strong px-3 py-2 text-sm text-ink focus:border-teal-deep disabled:cursor-not-allowed disabled:bg-paper-tint disabled:text-ink-muted {focusRing}
smallFieldClass    {touchTarget} rounded-md border border-grid-strong px-2 py-1.5 text-sm text-ink focus:border-teal-deep disabled:cursor-not-allowed disabled:bg-paper-tint disabled:text-ink-muted {focusRing}
invalidFieldMark   border-health-overdue-fg bg-health-overdue-bg
invalidFieldClass  {fieldClass} border-health-overdue-fg bg-health-overdue-bg
labelClass         flex flex-col gap-1 text-xs font-medium text-ink
```

The label wraps its control, so the click target includes the label and no
`htmlFor` is needed. There is exactly one exception: the policy panel's
decision-feedback textarea is a sibling of its label and is joined by
`htmlFor`/`id`. Forms are `gap-4`; a label's
own parts are `gap-1`. Errors sit under the field as `role="alert"` text in
`text-health-overdue-fg`, with `aria-invalid` on the field and `invalidFieldClass`
for its border and fill. The native outline is never reset: under Tailwind v4
`focus:outline-none` nulls the variable `focusRing` draws its style from, so on
keyboard focus the ring vanished and only the border moved (Work OS #315).
**A disabled field draws itself** — `paper-tint` fill, `ink-muted` text, the
not-allowed cursor — from `fieldClass`'s own `disabled:` variants, so the state
follows the attribute. The audit of 20 October 2026 found the state missing: a
control that could not be edited looked exactly like one that could.

`Field` is the label, the control and the two lines under it, wired. The
hint and the error are the label's siblings, not its children: a label's
accessible name is every word inside it, and a hint inside would be read as
the field's name and again as its description.

<!-- components:field -->
```
Field        <div>    flex flex-col gap-1
  label      <label>  {labelClass}   wrapping the label text and the control
  control    the one child, cloned with id, aria-describedby → error and hint, aria-invalid when error
  class      {fieldClass} | {smallFieldClass} when size=small | + border-health-overdue-fg bg-health-overdue-bg when error | + the child's own className
  error      text-xs text-health-overdue-fg   (role="alert")
  hint       text-xs text-ink-muted
```

`Button` is one of the five strings above with the two things every call site
had to remember: `type="button"` unless told otherwise, and the pending state.

<!-- components:button -->
```
Button variant=primary   {primaryButtonClass}
Button variant=subtle    {subtleButtonClass}
Button variant=warn      {warnButtonClass}
Button variant=icon      {iconButtonClass}
Button variant=warnIcon  {warnIconButtonClass}
  pending                disabled, aria-busy, the verb with an ellipsis: "Save" → "Save…", or pendingLabel
```

**A refused action costs the click, not the page.** The form stays, the reason
appears, the values are kept (#157). Pending state is the verb in progress with
an ellipsis — "Signing in…", "Saving…", "Applying…" — and the button disabled at
50% opacity. There are no skeletons and no spinners anywhere; a load is a
sentence in `text-ink-muted`, and a failure says so in `warm-fg`.

### Checkbox and radio

Since 0.5.0, `Checkbox`, `Radio` and `RadioGroup` are the browser's own
controls, styled — not Base UI. The native input already has the keyboard
(Space toggles, the arrow keys move within a radio group), the form value,
the indeterminate state and forced-colours support, and staying native keeps
the three server-safe. Work OS has twelve checkboxes and seven radios, Digital
Library four checkboxes, and before this only one of the twenty-three set an
accent colour.

<!-- classes:choices -->
```
choiceLabelClass   flex min-h-11 items-center gap-2 text-sm text-ink md:min-h-0 has-disabled:cursor-not-allowed has-disabled:text-ink-muted
choiceInputClass   size-4 shrink-0 accent-teal-deep disabled:cursor-not-allowed {focusRing}
choiceGroupClass   m-0 flex min-w-0 flex-col gap-1 border-0 p-0
choiceLegendClass  mb-1 p-0 text-xs font-medium text-ink
```

<!-- components:choices -->
```
Checkbox     <label>     {choiceLabelClass}   wrapping the input and the label text
  input      <input type="checkbox">   {choiceInputClass}   the rest of the props reach it
Radio        the same, type="radio"
RadioGroup   <fieldset>  {choiceGroupClass}   name given to each direct Radio without one; disabled disables them all
  legend     <legend>    {choiceLegendClass}
  error      text-xs text-health-overdue-fg   (role="alert", in aria-describedby)
  hint       text-xs text-ink-muted           (in aria-describedby)
```

- **The label wraps the input**, `Field`'s rule: the whole row is the click
  target and the words are the name. The row has the 44px floor below `md`,
  because the 16px box alone is far under it.
- **The checked fill is `teal-deep` through `accent-color`**, a token, never a
  palette class; the browser draws its mark in paper on it. Both pairs, and
  the fill on a hovered `teal-soft` option row, are in `TOKEN_PAIRS`.
- **A disabled input mutes its row** (`has-disabled:`), so the state follows
  the attribute as `fieldClass`'s does; a `disabled` `RadioGroup` is a
  disabled fieldset, which disables every radio in it natively.
- **Unlike the other components, the rest reaches the `<input>`**, because the
  input is the control: `name`, `value`, `checked`, `onChange`, `disabled`.
  `className` reaches the row, for layout; `RadioGroup`'s rest reaches the
  fieldset.
- `PopoverOption` stays for a toolbar panel's hover-tinted row, around a bare
  input with `choiceInputClass`; a `Checkbox` is a label already and never
  goes inside another.

### Pill, chip, tile

<!-- classes:pill -->
```
Pill      inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium {tone: PillTone}
chip      rounded bg-teal-soft px-1.5 py-0.5 font-mono text-xs text-navy
KpiTile   flex flex-col overflow-hidden rounded-md border border-grid
  label   bg-teal-deep px-3 py-1.5 text-center text-xs font-semibold uppercase tracking-wide text-paper
  body    flex-1 bg-teal-soft px-3 py-4 text-center
  value   text-3xl font-semibold tabular-nums text-navy | text-warm-fg | text-health-overdue-fg
```

`KpiTile.tone` is `neutral | warm | overdue`: the pill tones' names, since
0.3.0. It had its own pair (`warn`, `bad`), which the 20 October 2026 audit
named as a second tone vocabulary; nobody imported the package when the rename
landed, so it went out as a minor with a breaking note.

**A pill is always one line.** `whitespace-nowrap` is part of `Pill` itself,
because a wrapped label stretches the rounded ends into a tall lozenge that no
longer reads as a status chip; a caller's `className` may never set a competing
`whitespace-*` class (#261). The consequence is that a pill cannot shrink to fit:
**its container must be at least as wide as its widest label**, which for the
task vocabulary is "Awaiting Input" at 97px in Geist, including padding.

That is now automatic rather than remembered. `packages/design/src/pill-width.ts` holds
Geist's advance widths at the pill's 12px/500, measured in Chromium, and
`pillWidth(label)` sums them — an upper bound, because kerning only tightens
(checked against all 25 pill labels: high by 0.2–3.3px, never low). Every
fixed-width pill column derives its width *and* its resize floor from its
vocabulary: in the grid, `fitPills` gives Status 132px and Priority 94px;
on the printed report, `fitStatusColumn` gives Status 19% of the 653px table,
taken from a named free-text column that it refuses to leave under 10%. A wider
label widens its column with no one re-measuring. Tables with automatic layout
need nothing: an unbreakable pill already sets their column's minimum.
A label column that is *not* a pill is sized as text at its own size:
`widestText(labels, 14)` measures the policy grid's plain-text stages at
226px, and adding the cell's chrome (`CELL_CHROME.readOnly`, 24px) makes
Status 250px. The 12px pill measure had left "Implementation &
Communication" 7px short on staging (#265).

A pill is 20px tall, which is why the short row clamp is 24px and not 20 — a
20px bound shaved the rounded bottom off the status and health pills. The tile's
body is `flex-1` and carries no `h-full`: stretch is what gives the tile its
height, and an override would defeat a caller that chose `items-start`.

### Table frame

Since 0.5.0 the frame is the package's `TableFrame`, ported from Work OS's
`components/data-table.tsx` (eight sites), server-safe and with no Base UI.
Its strings are `ui-classes.ts` exports, held to the code:

<!-- classes:table -->
```
tableFrameClass         relative overflow-auto rounded-md border border-grid print:max-h-none print:overflow-visible
tableFrameStackedClass  max-md:max-h-none
tableFrameFixedClass    w-fit max-w-full
tableClass              border-collapse text-left text-sm
tableStickyHeadClass    [&_thead_th]:sticky [&_thead_th]:top-0
tableStackedClass       max-md:block max-md:min-w-0 [&_thead]:max-md:hidden [&_tbody]:max-md:block [&_tbody]:max-md:divide-y-0 [&_tbody_tr]:max-md:mb-2 [&_tbody_tr]:max-md:block [&_tbody_tr]:max-md:rounded-md [&_tbody_tr]:max-md:border [&_tbody_tr]:max-md:border-grid-strong [&_tbody_td]:max-md:flex [&_tbody_td]:max-md:items-baseline [&_tbody_td]:max-md:justify-between [&_tbody_td]:max-md:gap-3 [&_tbody_td]:max-md:before:text-xs [&_tbody_td]:max-md:before:font-medium [&_tbody_td]:max-md:before:text-ink-muted [&_tbody_td]:max-md:before:content-[attr(data-label)]
gridHeightClass         max-h-[calc(100vh-15rem)]
theadClass              bg-navy text-xs uppercase tracking-wide text-paper
thClass                 z-10 bg-navy px-3 py-2 font-semibold whitespace-nowrap
tbodyClass              divide-y divide-grid
tdClass                 px-3 py-2
sheetRowClass           bg-paper hover:bg-row-hover
sheetTdClass            border-r border-grid px-3 py-1 last:border-r-0
```

How `TableFrame` puts them together, held by `phase-2.test.tsx`:

<!-- components:table -->
```
TableFrame      <div>    {tableFrameClass} {maxHeightClass} {tableFrameStackedClass when stacked and bounded} {tableFrameFixedClass when fixed} {focusRing when scrollableByKeyboard}
  table         <table>  {tableClass} {tableStickyHeadClass when bounded} {tableStackedClass when stacked} {table-fixed | w-full} {minWidthClass}   aria-label={caption}
  keyboard      scrollableByKeyboard: the frame is role="region", tabIndex 0, named by the caption
rowClass(i)     bg-paper | bg-paper-tint (odd)   hover:bg-row-hover
rowClass(i,s)   {s} hover:brightness-95
ActionsHeader   <th scope="col">  {thClass}, its label sr-only
```

- **Two skins, never mixed.** Striped (zebra, horizontal rules only) for every
  ordinary table; sheet (flat white, every cell boxed, half the vertical
  padding) for the spreadsheet grids — Tasks, My tasks, and the policy list.
  Gridlines and stripes do the same job, so the moment every cell is boxed the
  bands stop guiding and start competing.
- **Zebra comes from the data index, not `:nth-child`.** An injected history row
  inverted the banding of 53 rows below it, and the selector's specificity
  erased the import grid's errored-row tint.
- **Numbers are right-aligned and `tabular-nums`**, driven by the column
  registry's `numeric` flag on both `<th>` and `<td>`. An empty value is an em
  dash.
- **Every frame passes a `caption`**, rendered as `aria-label` rather than a
  `<caption>`, because a stacked table is no longer displayed as a table and a
  `<caption>` stops naming it. An unlabelled actions column gets a hidden header.
- **A minimum width is stated with `md:`.** Below `md` a table stacks or becomes
  cards, so a floor there only forces a scrollbar nobody wants.
- **The sticky rule carries no z-index.** `tableStickyHeadClass` is a
  descendant selector on the table and out-specifies a utility; the header
  cells take their own `z-10` from `thClass`, which a frozen header's `z-20`
  overrides ([§6](#6-spacing-shape-elevation-layering-motion)). The header is
  sticky only when `maxHeightClass` bounds the frame (#58).
- **A frame that can overflow and has no cursor is a tab stop**
  (`scrollableByKeyboard`): `role="region"`, named by the caption, with the
  focus ring — Work OS's frame took the tab stop without the ring, and an
  `aria-label` on a bare `<div>` names nothing, so the port adds both.
- **Controls in cells keep the 44px floor below `md` themselves.** A `Button`,
  an icon button or a `Checkbox` row carries `touchTarget`; a cell sets no
  floor of its own, so the desk keeps the density the grid was measured at.
- **What the port changed for Work OS's eight call sites:** `caption` is
  required; `frameRef`, `frameStyle` and `onScroll` become `ref`, `style` and
  `onScroll` on the frame through `...rest`; `tableStyle` and `describedBy`
  become `tableProps={{ style, "aria-describedby" }}`. Every class is the
  same, except `theadClass`'s `text-white`, which is `text-paper` because the
  package switches the default palette off.

### Grid cursor

<!-- classes:cursor -->
```
cellCursor  outline-2 -outline-offset-2 outline-teal-deep
cellHover   hover:outline hover:outline-1 hover:-outline-offset-1 hover:outline-teal-deep
```

Drawn inside the cell, because a ring outside is clipped by the scroll frame on
the first and last columns and sits under the frozen columns. On `focus`, not
`focus-visible`: someone who clicked a cell has to see which one they are on.
It persists while the grid is unfocused, which is what Sheets and Airtable do.
The hover preview is the same box one weight lighter, only on cells the cursor
could land on, and the two are never drawn together.

### Task card, chart, empty states

```
card    flex w-full flex-col gap-1.5 rounded-md border border-grid-strong bg-paper p-3 text-left hover:bg-row-hover {focusRing}
chart   rounded-md border border-grid bg-paper p-5
  track   flex h-48 items-end gap-3 border-b border-grid
  column  w-full max-w-14 rounded-t-sm bg-teal      (height from inline style)
  axis    flex-1 text-center font-mono text-xs text-ink-muted
empty   rounded-md border border-grid bg-paper p-5 text-sm text-ink-muted
clear   rounded-md border border-health-ontrack-fg/30 bg-health-ontrack-bg p-5 text-sm text-health-ontrack-fg
notice  rounded-md border border-grid bg-info-bg/60 px-3 py-2 text-sm text-ink        (role="status")   superseded by Notice below
```

Since 0.3.0 the two are components, and the `notice` line above is what Work
OS still draws by hand until it adopts `Notice`. `Notice` takes a tone and derives its
role from it, so a confirmation can no longer be plain text while the refusal
beside it alerts (the drift row in §14); `EmptyState` is the boxed sentence
with an optional action beneath it.

<!-- components:notice -->
```
Notice           rounded-md px-3 py-2 text-sm {tone}
  tone=info      bg-info-bg text-info-fg                        (role="status")
  tone=positive  bg-health-ontrack-bg text-health-ontrack-fg    (role="status")
  tone=warm      bg-warm-bg text-warm-fg                        (role="alert")
  tone=overdue   bg-health-overdue-bg text-health-overdue-fg    (role="alert")
EmptyState       flex flex-col items-start gap-3 rounded-md border border-grid bg-paper p-5
  sentence       text-sm text-ink-muted
  action         an optional slot beneath the sentence, usually a Button
```

The chart is plain divs, server-rendered, no client JavaScript and no library.
It is `role="img"` with every figure in its accessible name. Empty states are
boxed when they replace a whole page's content and a plain muted line when they
replace a section; a clean report section prints its "none" line rather than
vanishing, so a clean month reads as clean rather than as a report that failed
to render.

### Drawer and popover

Since 0.4.0 both are package components, `Drawer` and `Popover`, on Base UI's
Dialog and Popover (ADR 0002). The strings are `ui-classes.ts` exports and the
block is held to the code by `design-system-doc.test.ts`; `{subtleButtonClass}`
stands for that string.

<!-- classes:overlays -->
```
drawerScrimClass           fixed inset-0 z-40 min-h-dvh bg-navy/25 supports-[-webkit-touch-callout:none]:absolute
drawerPanelClass           fixed inset-y-0 right-0 z-40 flex h-full w-full flex-col border-grid-strong bg-paper shadow-2xl outline-none lg:w-[30rem] lg:border-l
drawerHeaderClass          flex items-start gap-3 border-b border-grid-strong px-4 py-3
drawerBodyClass            min-h-0 flex-1 overflow-y-auto px-4 py-3
drawerRefusalClass         bg-health-overdue-bg px-4 py-2 text-sm text-health-overdue-fg
drawerFooterClass          border-t border-grid-strong px-4 py-3
popoverTriggerClass        {subtleButtonClass} whitespace-nowrap
popoverTriggerActiveClass  border-teal-deep bg-teal-soft font-semibold
popoverBadgeClass          ml-1.5 rounded-full bg-teal-deep px-1.5 text-[11px] font-semibold text-paper
popoverPanelClass          z-30 w-80 rounded-md border border-grid-strong bg-paper p-2 shadow-lg outline-none
popoverOptionClass         flex items-center gap-2 rounded px-1 py-1 text-sm text-ink hover:bg-teal-soft
```

The drawer is `role="dialog" aria-modal="true"`, named by its title, portalled
to `<body>` (Base UI requires the portal; the page root's `isolation: isolate`
in §13 keeps it above everything), 30rem at `lg` and a full-screen sheet below.
The scrim is the dialog's backdrop: `fixed` with a `min-h-dvh` floor, and
`absolute` where `-webkit-touch-callout` exists, because iOS 26 Safari lets the
page show beneath its chrome and a fixed backdrop stops short of the visual
viewport there (`body { position: relative }` in `base.css` and `theme.css`
makes the absolute form cover it after a scroll). Work OS's original rendered
in place with a `fixed inset-0 z-40 flex justify-end` root around an absolute
scrim; the portal replaces the root, and the panel is positioned itself.

Focus opens in the content — the body's first focusable control, not the
header's Close — is trapped while it is the top layer, and returns to the
opener. The page behind is inert and its scroll locked. The refusal band is
`role="alert"` between body and footer.

**Open is controlled, and Escape belongs to the innermost layer.** The caller
holds `open` and hears every request to close as `onOpenChange(false, reason)`
with `reason` one of `escape | scrim | close | programmatic`; it closes by
setting `open` false or refuses by leaving it, which is how a dirty form keeps
its drawer and shows "Discard this task?" in the footer. A nested `Drawer`,
`Popover` or `Menu` takes Escape first and the outer one never hears it. For a
layer Base UI does not know about — Work OS's hand-rolled cell editors, during
the #443 migration — `onEscape` returns `false` to consume the key, so the
dismiss stack's "one Escape closes one thing" holds until the stack is deleted.

The popover's trigger is `subtleButtonClass` that never wraps, and wears
`popoverTriggerActiveClass` while open (Base UI sets `data-popup-open`) and
whenever the caller passes `active` — a filter that is applied — so the open
state is a shape and a weight, not only a colour. The `badge` count sits inside
the button and is part of its name ("Filters 2"). The panel is `z-30` (under
the drawer's `z-40`), `w-80`, portalled and positioned by Base UI below the
trigger, start-aligned, flipped or shifted to stay 16px inside the viewport;
Work OS's `panel-placement.ts` clamp is retired by it. Non-modal: an outside
press or Escape closes it and focus returns to the trigger. `PopoverOption` is
one row: a `<label>` on `popoverOptionClass` around a checkbox or radio.

### Board, card and Move to… menu

The policy board (#218) is the app's one kanban surface. The list view
(`?view=list`, #265) is a spreadsheet grid on `TaskGrid`, and shares the board's
URL grammar (`owner`, `priority`, `launch-before`, `launch-after`, `sort`,
`dir`, and the board's column focus `col`, which the list carries but does not
use) plus a search key `q` that only the list applies; switching views keeps
them. On both views, "New policy" is a primary button that opens the same
`Drawer` as "New task", with the same discard guard.

```
column        flex min-h-72 flex-col rounded-md border border-grid bg-paper-tint
  header      flex w-full items-center gap-2 rounded-t-md px-2 py-2 text-left text-sm font-semibold text-ink {focusRing}
  count       rounded-full bg-grid px-1.5 text-[11px] font-semibold tabular-nums text-ink-muted
  drop target rounded-b-md outline-2 outline-dashed outline-teal-deep bg-teal-soft/60
card          flex flex-col gap-1.5 rounded-md border border-grid bg-paper p-2 shadow-sm
  reference   rounded bg-grid px-1.5 py-0.5 font-mono text-[11px] text-ink hover:bg-teal-soft {focusRing}
  refusal     rounded bg-warm-bg px-1.5 py-0.5 text-[11px] font-medium text-warm-fg   (role="alert")
menu trigger  {subtleButtonClass} px-1.5 py-0.5 text-[11px]
menu          fixed z-50 rounded-md border border-grid-strong bg-paper p-1 shadow-lg   (role="menu", portalled)
  item        block w-full rounded px-2 py-1 text-left text-sm text-ink {focusRing}  (role="menuitem")
```

The Move to… menu is the package's `Menu` and `MenuItem` since 0.4.0, on Base
UI's Menu (ADR 0002); the three lines above are the Work OS original, and the
package's strings are these, held to the code:

<!-- classes:menu -->
```
menuTriggerClass  {subtleButtonClass} px-1.5 py-0.5 text-[11px]
menuClass         z-50 rounded-md border border-grid-strong bg-paper p-1 shadow-lg outline-none
menuItemClass     block w-full rounded px-2 py-1 text-left text-sm text-ink data-highlighted:bg-teal-soft aria-disabled:text-ink-muted {focusRing}
```

Base UI positions it below the trigger (so `fixed` is no longer in the string;
the positioner carries the placement) and owns the keyboard: arrows move a
roving highlight and wrap, Home and End jump, a typed letter finds its item,
Escape closes and returns focus to the trigger, and — unlike the original —
choosing an item returns focus too. The highlight is `data-highlighted`, ink on
teal-soft, so the fill follows the keyboard as well as the pointer. A
`disabled` item (the current status) stays in the list, muted, and is still
read. Non-modal: the page behind stays scrollable.

- **Dragging always has a keyboard route.** A card the reader may move is
  `draggable` for a mouse and also carries a Move to… menu that calls the same
  server action. Both are gated by the same permission check, so nothing on the
  board can be done by drag alone.
- **The menu is an APG menu:** arrow keys, Home and End move focus, Escape and an
  outside click close it, and it is portalled to `document.body` so the column's
  scroll container cannot clip it.
- **The drop target is marked by a dashed outline and a fill**, so it shows as a
  shape as well as a colour. `outline-dashed` appears nowhere else.
- **A refused move is announced on the card itself**, as a small warm
  `role="alert"` chip. That is a third refusal shape, alongside field-level alert
  text and the drawer's refusal band.
- **A column header does two jobs.** It carries `aria-pressed` for "show only this
  column" and `aria-expanded` for whether the column is collapsed.
- **Rejecting a policy asks for words.** "Reject" reveals a labelled feedback
  field and a second, confirming button. This follows the rule that a confirm
  step is read, not recognised.

### Disclosure (collapsible section)

```
disclosure  section h2 holds one full-width button   w-full text-left {focusRing}
  name      "<title>, <count>"        the count is part of the accessible name
  control   aria-expanded + aria-controls → the section's rows
  rows      hidden print:block        collapsed by default, never the hidden attribute
  action    link beside the button    e.g. "Open in Tasks", outside the button
  blurb     aria-describedby          the line under the header is read with the button
  chevron   <Icon name="chevronRight">   the one indicator, rotate-90 when open, print:hidden
  empty     no button at all          a section with no tasks shows only its empty line
```

The package's `Disclosure` (0.4.0) is this shape, and its two strings are held
to the code:

<!-- classes:disclosure -->
```
disclosureButtonClass     flex min-h-11 w-full items-center gap-2 rounded-md text-left md:min-h-0 {focusRing}
disclosureCollapsedClass  hidden print:block
```

A section with tasks is a disclosure. The whole header row is one full-width
`<button>` inside the `h2` (or the `heading` level the caller names), so the
heading stays a heading and the click target is the row, not just the title
text. Its accessible name carries the count ("Overdue, 50"), because the tiles
that used to show the count are gone. Every section starts collapsed. The
button keeps the 44px touch floor below `md`. Open is controlled (`open` +
`onOpenChange`) or uncontrolled from `defaultOpen`; Work OS passes `open` from
its per-session store.

Collapsed rows are hidden with a class, `hidden print:block`, not the `hidden`
attribute. Tailwind's preflight makes `[hidden]` `!important`, so print could
never override it and the handout would print empty. The "Open in Tasks" link
sits outside the button, because a link cannot live inside one, and it shows
whether the section is open or shut. Open state is per session, kept in
Work OS's `src/lib/browser-session.ts` with the grid's collapsed groups: it survives moving
around within a visit and is not a saved preference.

**Why a button and not `<details>`:** a closed `<details>` does not print its
content, and the Summary page is the meeting handout, which must print every
row. The rows are rendered on the server and handed to the client disclosure as
children, so they are in the DOM whether open or shut and only the open state
lives in the browser. Focus stays on the button when it toggles.

**Why not Base UI's Collapsible** (checked against 1.9.0 on 21 October 2026,
plan §6-3): its Panel, kept mounted and closed, renders the boolean `hidden`
attribute (`useCollapsiblePanel.js`: `hidden = !open && !mounted`, returned in
its props), and with `hiddenUntilFound` it sets `hidden="until-found"` — either
way the attribute decides the display, and under preflight's
`[hidden] { display: none !important }` the handout prints empty. A consumer
prop does override an internal one, so `hidden={false}` with a
`data-closed:hidden print:data-closed:block` class would work, but it fights
the primitive's own contract on the one point the system cares about, and a
disclosure needs no keyboard machinery beyond a button's. So `Disclosure` is
built without Base UI, and is the one overlay-phase component that is not on
it; it still carries `"use client"` because it holds state.

`policy-reader.tsx` collapses its cards with the `hidden` attribute. That is
fine there, because policies print from their own route, but do not copy it for
anything that prints in place. First used on the Summary page (#413), in
`src/components/summary-disclosure.tsx`.

### Tooltip

Since 0.5.0, `Tooltip`, on Base UI's Tooltip (ADR 0002): the keyboard and
pointer route for the hint Work OS gave with 29 native `title=` attributes, 12
of them on icon-only buttons, none reachable by keyboard.

<!-- classes:tooltip -->
```
tooltipClass  z-50 max-w-64 rounded bg-navy px-2 py-1 text-xs text-paper shadow-lg
```

<!-- components:tooltip -->
```
Tooltip      wraps one trigger element, usually Button variant=icon, its title removed
  popup      <div role="tooltip">  {tooltipClass}   portalled, side=top, 6px off the trigger
  opens      mouse or pen hover after 600ms (delay); keyboard focus-visible at once
  closes     Escape, a press on the trigger, pointer leaving, blur
  touch      never opens (Base UI, by design)
```

- **A supplement, never the name** (§2 principle 9). The trigger keeps its
  `sr-only` label as its accessible name; the tooltip shows the same words.
  So the popup is `role="tooltip"` but is **not** joined to the trigger by
  `aria-describedby` — a description identical to the name is read twice
  (§10) — and Base UI wires nothing itself.
- **The trigger's `title` is removed**, because a native tooltip beside this
  one shows the hint twice. An icon button carries **either** a `Tooltip` or a
  `title`, never both.
- **What a touch user gets: no tooltip.** Base UI opens on mouse and pen hover
  only, because a long press is the browser's context menu and no touch
  gesture reveals a hint before the tap acts. A touch user has the icon; a
  screen reader has the `sr-only` name. That is why a confirm step stays in
  words (Buttons above), and why a hint someone needs in order to act belongs
  in visible text, not here.
- **No animation**, and nothing is in the DOM while it is closed. Paper on
  navy is the header pair, already held at AA.

### Tabs

Since 0.5.0, `Tabs`, `TabList`, `Tab` and `TabPanel`, on Base UI's Tabs:
Work OS's one tablist, the policy text editor's Edit and Preview.

<!-- classes:tabs -->
```
tabListClass   flex gap-1 border-b border-grid-strong
tabClass       {touchTarget} relative -mb-px rounded-t-md px-3 py-1.5 text-sm text-ink hover:bg-teal-soft data-active:font-semibold data-active:after:absolute data-active:after:inset-x-0 data-active:after:bottom-0 data-active:after:h-0.5 data-active:after:rounded-full data-active:after:bg-teal-deep aria-disabled:cursor-not-allowed aria-disabled:text-ink-muted aria-disabled:hover:bg-transparent {focusRing}
tabPanelClass  pt-3 {focusRing}
```

<!-- components:tabs -->
```
Tabs       <div>                                   value + onValueChange, or defaultValue (one is required)
TabList    <div role="tablist" aria-label>         {tabListClass}   activation=automatic | manual
Tab        <button role="tab" aria-selected>       {tabClass}   one tab stop; data-active when selected
TabPanel   <div role="tabpanel" aria-labelledby>   {tabPanelClass}   unmounted when inactive unless keepMounted
```

- **The selected tab is marked by weight and a bar**: semibold, with a 2px
  `teal-deep` bar along its foot drawn by `after:` — the active nav item's
  rule (§2 principle 2), never a fill colour alone. Work OS's tab was a
  `teal-deep` fill with white text, which carried the state in colour and
  weight but no shape.
- **APG keyboard, from Base UI**: one tab stop for the row, the arrow keys
  move along it and wrap, Home and End jump. **Activation is automatic by
  default** — the arrow selects as it moves, as Work OS's editor does ("focus
  follows selection"); `activation="manual"` moves focus only and Enter or
  Space selects, for a panel that is slow to produce.
- **A disabled tab stays in the row**, muted, `aria-disabled`, and still
  takes focus by arrow, so it is read; it cannot be selected.
- An inactive panel is unmounted; `keepMounted` keeps it under the `hidden`
  attribute, which preflight makes `!important`, so a kept panel never
  prints. For content that must print whole, use `Disclosure`.

### Combobox

Since 0.5.0, `Combobox`, on Base UI's Combobox: the grid's cell chooser,
Work OS's `ChoicePopover` (`role="combobox"` and a listbox) in
`editable-cell.tsx`. **Forms keep the native `<select>`** (plan §4.3): 58 of
them work, meet the touch floor through `fieldClass`, and get the phone's own
picker. This is for the cell chooser and for lists long enough that typing
beats scrolling.

<!-- classes:combobox -->
```
comboboxPopupClass   z-50 max-h-64 w-(--anchor-width) min-w-56 overflow-y-auto rounded-md border border-grid-strong bg-paper p-1 shadow-lg outline-none
comboboxOptionClass  flex cursor-pointer items-center justify-between gap-2 rounded px-2 py-1 text-sm text-ink data-highlighted:bg-teal-soft data-disabled:cursor-not-allowed data-disabled:text-ink-muted
comboboxTickClass    text-teal-deep
comboboxEmptyClass   px-2 py-1 text-xs text-ink-muted empty:hidden
```

<!-- components:combobox -->
```
Combobox   <input role="combobox">   {fieldClass} | {smallFieldClass} when size=small, + className; the rest reach it
  list     <div role="listbox">      {comboboxPopupClass}   portalled, below the input, flipped when there is no room
  option   <div role="option">       {comboboxOptionClass}   aria-selected; <Icon name="check"> in {comboboxTickClass} when chosen
  empty    role="status"             {comboboxEmptyClass}   "No matches." by default
```

- **Typing filters** — a case- and accent-insensitive "contains" on the label,
  as Work OS's `filterOptions` did — and the first match is highlighted, so
  typing and Enter is a choice. Arrow keys move the highlight; Enter or a
  press chooses and closes. Focus stays in the input throughout; the
  highlight is `aria-activedescendant`.
- **Escape closes the innermost layer**: inside a `Drawer` it closes the list,
  not the drawer. `onEscape` is the same veto `Drawer` has — return `false`
  and the list stays open, the key consumed — for a layer Base UI does not
  know about, such as Work OS's dismiss stack until #443 deletes it.
- **An Escape on a closed list clears nothing.** Base UI would clear the
  chosen value and the text there, which in a drawer reads as data lost; the
  wrapper refuses both and lets the key go to the next layer, so the drawer
  hears it. A caller that wants "none" offers it as an option.
- The chosen option shows a tick as well as `aria-selected`, so it is a shape
  and not only the highlight's colour.

### Icons

One component, `Icon`, with a typed `name` that is a meaning, not a picture:
`settings`, `drop`, `mailOff`. The drawings are Lucide's (ISC), vendored at
build time by `scripts/build-icons.ts` into `icons.generated.tsx` from the
`lucide` static package, which is a devDependency and never a consumer's — so
the component is plain SVG, renders in a Server Component, and the vocabulary
is the package's to curate. Two sizes and no others, held by `icon.test.ts`:

<!-- components:icon -->
```
Icon size=20  stroke 1.4   the rail: myTasks timesheet tasks review workstreams policies people import settings guide reports updates record sidebar signOut
Icon size=16  stroke 1.5   rows and inline: everything else
  svg         viewBox 0 0 24 24, fill none, stroke currentColor, round caps and joins, aria-hidden, focusable=false
```

Stroke-only in `currentColor` with round caps (one dot, in the key's bow, is a
fill: a half-pixel stroked circle disappears at 16px), so a glyph weighs the
same as the text beside it and works on both the navy rail and a light hover.
Every one is `aria-hidden`; the control around it carries the name. The
vocabulary is forty-eight names: the twenty-six glyphs Work OS drew by hand
(the plan counted twenty-seven; the Google sign-in mark is a logo, not a
glyph), the nine unicode characters it used as stand-ins (✕ ✓ ● ◇ ↑ ↓ ← → ↗),
and thirteen common roles, the four chevrons among them. Two judgements are kept
from the hand-drawn set and now held by test: Settings is two sliders rather
than a cog, because a cog's teeth turn to fuzz at 20px on navy; the drop action
is an arrow into an open tray rather than a bin, because a bin would promise a
destruction the app does not perform. The site's `/icons` page shows every name
at its size with its Lucide source.

## 9. Content and voice

Sentence case, plain verbs, and descriptions that say what something does or
costs rather than what it is. Real strings:

- **Page descriptions.** Settings: "Rules that apply to everyone's tasks. A
  change takes effect immediately, on the next thing anybody saves." My Tasks:
  "Your open work, soonest deadline first — what to bring to the weekly meeting.
  Progress is recorded on the Tasks page."
- **Buttons are verbs:** "Download PDF", "Try again", "Reload the page", "Add
  the first one", "Sign in with Google".
- **A rule explains its cost:** "A task cannot be saved at all until it says
  what it will produce — including a task somebody is only changing the status
  of."
- **Errors say what is true and what helps:** "That page didn't load. It may be
  a temporary fault, or your session may have ended while the tab was open."
  Then two buttons and the digest that ties the screen to a line in the log.
- **Small print is honest:** "Accounts are provisioned by the IKI team — there
  is no self-service sign-up."
- **Guidance names the constraint:** "Printing from Safari? Choose A4 and
  Portrait in the print dialog; Safari does not apply this page's paper size
  automatically."

Conventions:

- **British spelling:** colour, organisation, programme, behaviour.
- **Typography:** em dashes with spaces (449 uses), the middle dot as a
  separator, a real ellipsis for a pending verb, an em dash for an empty value.
- **Dates are day-first, no leading zero:** `15 Jul 2026`; short form `15 Jul`
  on the agenda, where every task is due inside the week; `29 Jul, 14:02` for
  history, where the time is the point. Empty is `—`, or a caller's own word
  ("no due date").
- **Counts go through one `plural(n, "task", "tasks")`.** It exists because four
  modules spelled it out and one shipped a hardcoded plural that made an email
  disagree with itself.
- **People are greeted by first name**, falling back to the whole trimmed name
  rather than to nothing: `name.split(" ")[0]` produced "Hello ," for an empty
  name, which was reachable.
- **A link is named for where it goes.** One phrase never points at two
  destinations: two emails from one sender using "Open the tracker" for two
  places is how a reader stops trusting either.

## 10. Accessibility

| Criterion | Rule |
| --- | --- |
| 1.4.3 | Text pairs clear 4.5:1 — every pair the app renders is listed in `TOKEN_PAIRS` and tested |
| 1.4.11 | Control boundaries, focus rings and meaningful graphics clear 3:1 |
| 1.4.1 | Colour is never the only signal: labels inside pills, weight and a bar on active nav, `line-through` on Cancelled, `aria-invalid` beside a red border |
| 2.4.7 | One focus indicator, defined once, on every control; the native outline is never reset, because `focus:outline-none` nulls the ring (Work OS #315) |
| 2.5.8 | 44 × 44px targets below `md`; desktop keeps its density |
| 2.4.1 | A skip link, first in the DOM, hidden until focused, targeting a focusable `<main>` |
| 4.1.2 | Icon-only controls carry an `sr-only` name and a `title` or a `Tooltip`, never both; icons are `aria-hidden`; a name and an identical description are never both given |
| 1.3.1 | Tables state role and name; a stacked table restates `rowgroup`/`row`/`cell`, because changing `display` drops those roles |
| 4.1.3 | Errors are `role="alert"`, notices `role="status"`; a refused cell edit announces itself rather than silently reverting |
| 2.1.2 | The drawer traps Tab, opens focus in its content, restores it on close; Escape belongs to the top layer |
| 2.4.3 | The grid is one tab stop with arrow-key movement — it had 2,881 focusable elements before |
| 2.1.1 | A cursor-less scrollable table still takes a tab stop, because Safari does not auto-focus scrollable regions |

Two limits are recorded rather than hidden: read-only grid columns cannot be
arrowed onto in grid mode, and the six `jsx-a11y` rules that ship with the Next
config are warnings, so they cannot fail CI.

## 11. Email and print

### Email

Mail clients strip `<style>` blocks and none resolve CSS custom properties, so
the palette is transcribed — and transcription is exactly how a palette drifts.
Since 10 September 2026 every constant is held against Work OS's `globals.css` by test.

```ts
export const NAVY = "#12304a";       // --color-navy
export const TEAL = "#14797a";       // --color-teal-deep
export const INK = "#23313d";        // --color-ink
export const MUTED = "#5b6b7a";      // --color-ink-muted
export const RULE = "#d5dee5";       // --color-grid
export const PAPER_TINT = "#f4f8f9"; // --color-paper-tint
```

The shell: 24px page gutter on `PAPER_TINT`; a 640px card with a 1px `RULE`
border and 8px radius; a navy header bar at 14px/24px padding carrying the 24px
mark **and** a live-text wordmark, because Outlook blocks images by default and
a logo-only header is often an empty box; 24px content padding. A button is a
padded anchor, because `<button>` does not work in email:

```html
<a href="…" style="display:inline-block;background:#14797a;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:6px;font-size:14px;font-weight:600">See your tasks</a>
```

`<meta charset="utf-8">` comes first and inside the first 1024 bytes: every task
line carries an em dash and every due date a middle dot, and a client that
re-parses the body without the transport's charset turns those into mojibake —
seen exactly that way. `color-scheme: light` is declared three ways, as a claim
rather than a preference: this chrome has one palette, and a client left to
invert it produces dark text on a dark-inverted card.

### Print

These print rules are Work OS's: they live in `src/app/globals.css`
(`@media print`) in tech-iki/iki-work-os.

```css
@media print {
  * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  @page { size: A4 landscape; margin: 12mm; }
  @page report { size: A4 portrait; }
  .\[page\:report\] table { table-layout: fixed; width: 100%; min-width: 0; }
  @page policy {
    size: A4 portrait;
    @bottom-center { content: counter(page); }
  }
  .\[page\:policy\] .policy-sheet + .policy-sheet { break-before: page; }
  .\[page\:policy\] .policy-body tr { break-inside: avoid; }
  .\[page\:policy\] .policy-footer { break-inside: avoid; }
  .\[page\:policy\] .policy-body [role="region"] { overflow: visible; }
  .\[page\:policy\] .policy-body pre {
    overflow: visible; white-space: pre-wrap; overflow-wrap: anywhere;
  }
  .\[page\:policy\] th, .\[page\:policy\] td { overflow-wrap: anywhere; }
  .\[page\:policy\] table { table-layout: fixed; width: 100%; min-width: 0; }
}
```

- **Colour is forced**, because browsers drop backgrounds when printing and the
  status fills are the workbook's meaning.
- **The unnamed box is the Summary handout's.** A named box scopes portrait to
  one route, attached by `[page:report]` on the report's outermost wrapper or
  `[page:policy]` on a policy sheet's. There are **three** page boxes now — the
  unnamed landscape one, `report` and `policy` — and both named ones are
  portrait, so nothing may render in flow before the wrapper that carries the
  name: one extra paragraph flips the whole document back to landscape.
- **The selector must be the escaped class, with its leading dot.**
  `[page\:report]` is a valid selector for an *attribute* of that name, which
  nothing in the app has; written that way the block was dead CSS and the
  seven-column table still ran 138px past the sheet.
- **The policy export is paginated, not just reflowed (#325).** Six rules
  earn their keep, and each was added doing without it:
  - `.policy-sheet + .policy-sheet { break-before: page }` — one policy per
    sheet. The `+` is the first sheet's exemption; without it the export opens
    with a blank leading page.
  - `.policy-body h1…h6, .policy-body tr { break-inside: avoid }` — a heading or
    a row split across a page break.
  - `.policy-heading, .policy-body h1…h6 { break-after: avoid }` — a heading
    stranded alone at the foot of a sheet.
  - `.policy-footer { break-inside: avoid }` — the footer's `<dl>` is a grid,
    and without this Reference/Version/Effective date printed at the foot of one
    page while Ratified by/Printed on/Source document landed at the top of the
    next. One policy, one footer.
  - `.policy-body [role="region"] { overflow: visible }` — the shared Markdown
    renderer wraps tables in a scrollport for the phone, and a bounded overflow
    container prints only that (#58's bug).
  - `.policy-body pre { overflow: visible; white-space: pre-wrap;
    overflow-wrap: anywhere }` — the renderer gives a fenced code block a bare
    `overflow-x-auto` on the `<pre>` itself, which the `[role="region"]` rule
    never matches. Without it a long code line is clipped at the page edge and
    the rest is missing from the PDF (measured); `visible` alone would only
    run it off the sheet, so it wraps too.
- **Page numbers come from a margin box, and only in Chrome.** Measured through
  CDP `Page.printToPDF` with `preferCSSPageSize`: 7 pages, every one
  `594.96 × 841.92 pt` (A4 portrait, so the named box applied), with `1`…`7`
  as the last line of each page. **Safari's page-number behaviour has not been
  measured** and nothing claims it works there; it applies no `size` either, so
  both print pages carry a visible hint to choose A4 and Portrait themselves.
- **Chrome honours the named box; Safari ignores `size` entirely.** In Safari
  the `page` property is unimplemented, and `CSS.supports("page","report")`
  returns true as a false positive. So paper and orientation come from the print
  dialog. The policy print pages carry a visible hint saying so; the Summary
  page carried one too (#230) until #413 removed it as noise.
- **Arithmetic worth carrying:** A4 portrait less 12mm margins is 186mm, about
  703 CSS px — **below Tailwind's `md`**, so on portrait paper every `md:`
  utility is in its mobile state. A printed table therefore never uses
  `stacked`, and never bounds its height, because a bounded overflow container
  prints only its scrollport.

## 12. Enforcement

The system is held by tests, not by memory. Except `ui-contrast.test.ts`, which
is the package's, these tests are Work OS's and run in `tech-iki/iki-work-os`.

| Test | What it holds | Portable? |
| --- | --- | --- |
| `ui-contrast.test.ts` | Every rendered pair clears its threshold; `TOKENS` mirrors `tokens.ts` both ways; negative controls pin 4.11/5.19, 1.36/3.41, 4.02/9.76, 1.92/3.49 | Yes, verbatim — you supply the pair list |
| `ui-colors.test.ts` | Every health flag, status and priority has a pill class | Yes, with your vocabulary |
| `tsc` via `PillTone` | No `Pill` can be given a tone the maps do not define; every map is exhaustive over its vocabulary type (#248) | Yes — a string-literal union costs nothing to copy |
| `row-class.test.ts` | No row background is translucent, hovered or not; every state a caller passes is opaque; no link text inside a row | Yes, if you have frozen columns |
| `login-logo.test.ts` | Image dimensions equal the PNG's IHDR; alpha present; the favicon is ours | Yes — it reads header bytes, no image library |
| `email-chrome.test.ts` | Every exported email colour names a token and equals it; no message module re-inlines a hex; the old lookalike teal cannot return | Yes, for any inline-styled mail |
| `table-consistency.test.ts` | Every `TableFrame` caller, under `src/components` and `src/app` alike (#246), follows the shared conventions; the caller count is asserted so the check cannot pass vacuously | Pattern, not code |
| `grid-consistency.test.ts` | Both task pages render the one shared grid, with declared widths | Pattern |
| `task-card-coverage.test.ts` | The phone card carries exactly the columns the registry marks | Pattern |
| `monthly-report-wiring.test.ts` | The unnamed and `report` page boxes exist and the print selector is the escaped class | Yes, if you print |
| `reports.test.ts` | An entry whose `canView` refuses the actor is absent from the index's list and refused by the guard's `notFound()` — the two halves of one rule | Yes, given a registry to defend |
| `reports-wiring.test.ts` | Every `page.tsx` under `src/app/(app)/reports/` is in the registry and asks its guard by its own slug, the walk proven non-vacuous; the sidebar's **Reports** entry is the only current link on `/reports` and on `/reports/monthly` | Yes — the walk is `readdirSync(…, { recursive: true })` |
| `policy-print-wiring.test.ts` | The `policy` page box and every `[page:policy]` rule hold; the sheet's fields, its lockup and its civil dates are asserted on rendered markup, not on source; no inline `<script>` and no `style=` attribute; the legacy `document: null` row cannot reach a sheet | Yes, for any print-only view of a versioned record |
| `design-system-doc.test.ts` | This document's three token blocks match the stylesheet | Yes |

Two techniques are worth copying with them. **Strip comments before asserting an
absence** — a guard was once satisfied by its own comment. **Measure the span a
regex captured** before trusting what is not in it; one lazy match swallowed 706
lines and the check passed for the wrong reason.

The honest limit, stated in the tests themselves: a source-shape check catches a
guard being removed, which is the realistic regression. It cannot catch a guard
that is present and wrong, and nothing here measures layout — there is no
browser-driven runner.

## 13. Adopting the system

### 13-0. Install the package

The package is `@tech-iki/design`, from `packages/design/` in
`tech-iki/iki-design`. Use the lines for your stack; §13a to §13d are the
per-stack notes that follow.

- **Tailwind v4 apps** import the theme after Tailwind itself:

  ```css
  @import "tailwindcss";
  @import "@tech-iki/design/theme.css";
  ```

- **Plain CSS** imports the custom properties, and optionally
  `@import "@tech-iki/design/base.css";` for the body, link and focus rules:

  ```css
  @import "@tech-iki/design/tokens.css";
  ```

- **Components** come from the package root:

  ```tsx
  import { Pill, tones } from "@tech-iki/design";
  ```

- **The stacking root.** Wrap the page content in one element with the class
  `iki-app`; `theme.css` and `base.css` give it `isolation: isolate`, so an
  overlay the package portals to `<body>` is always above the page, whatever
  `z-index` the page uses. The element is a child of `<body>`, not `<body>`
  itself — a stacking context on `<body>` would hold the portals too. The same
  stylesheets set `body { position: relative }` for the iOS 26 Safari scrim
  and ship the reduced-motion reset of [§6](#6-spacing-shape-elevation-layering-motion).

  ```tsx
  <body>
    <div className="iki-app">{children}</div>
  </body>
  ```

- **Client-only exports.** Every component is server-safe (no hooks, no
  directive, renders in a Server Component and in `renderToStaticMarkup`)
  except the four overlays and the three phase 2 components on Base UI, which are built on `@base-ui/react` (ADR 0002)
  and carry `"use client"` in their own file, preserved in `dist`. A Server
  Component page can still render them; they are shipped to the browser. The
  split is held by `client-directive.test.ts`.

  | Export | Client-only | Base UI part behind it |
  | --- | --- | --- |
  | `Pill`, `KpiTile`, `PageTitle`, `PageMain`, `Button`, `Field`, `Notice`, `EmptyState`, `Icon`, `TableFrame`, `Checkbox`, `Radio`, `RadioGroup` | no | — |
  | `Drawer` | **yes** | Dialog |
  | `Popover` | **yes** | Popover |
  | `Menu` | **yes** | Menu |
  | `Disclosure` | **yes** | see [§8 Disclosure](#disclosure-collapsible-section) |
  | `Tooltip` | **yes** | Tooltip |
  | `Tabs`, `TabList`, `Tab`, `TabPanel` | **yes** | Tabs |
  | `Combobox` | **yes** | Combobox |

- **Until npm publishing exists**, depend on the tagged release on GitHub, in
  `dependencies`:

  ```json
  "@tech-iki/design": "github:tech-iki/iki-design#v0.1.0"
  ```

### 13a. Any stack — custom properties

The `:root` block below is `tokens.css`, exactly as the package ships it.

<!-- tokens:root -->
```css
/* Generated from tokens.ts by @tech-iki/design — do not edit; change tokens.ts */

:root {
  --iki-navy: #12304a;
  --iki-teal: #168b8c;          /* decorative fills only: 4.11:1 on white */
  --iki-teal-deep: #14797a;     /* text, buttons, links, focus: 5.19:1 on white */
  --iki-teal-soft: #eaf4f4;
  --iki-sky: #ddeaf0;
  --iki-paper: #ffffff;
  --iki-paper-tint: #f4f8f9;
  --iki-grid: #d5dee5;          /* rules and dividers, never a control boundary */
  --iki-grid-strong: #7e8d9a;   /* input and button borders: 3.41:1 on white */
  --iki-ink: #23313d;
  --iki-ink-muted: #5b6b7a;
  --iki-row-hover: #e0f2f4;
  --iki-row-error: #fcf0f0;
  --iki-health-overdue-bg: #f4cccc;
  --iki-health-overdue-fg: #990000;
  --iki-health-ontrack-bg: #d9ead3;
  --iki-health-ontrack-fg: #274e13;
  --iki-health-stale-bg: #e7b34b;
  --iki-health-stale-fg: #5c4300;
  --iki-warm-bg: #fce5cd;
  --iki-warm-fg: #783f04;
  --iki-info-bg: #d9eaf7;
  --iki-info-fg: #12304a;
  --iki-priority-low-bg: #fff2cc;
  --iki-priority-low-fg: #7f6000;

  --iki-font-sans: "Geist", system-ui, -apple-system, "Segoe UI", sans-serif;
  --iki-font-mono: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --iki-radius: 6px;            /* pills 999px; inline links 2px; cards inside panels 4px */
  --iki-focus-width: 2px;
  --iki-focus-offset: 2px;
}
```

And `base.css`, optional, for the body, links and the focus ring — load it after `tokens.css`:

<!-- tokens:base -->
```css
/* Generated from tokens.ts by @tech-iki/design — do not edit; change tokens.ts */

/*
 * Optional element rules for plain-CSS consumers (a Ghost theme, WordPress,
 * Docmost). Load tokens.css first. A Tailwind app does not need this file:
 * theme.css sets the body, and ui-classes carries the link and focus rules.
 */
body {
  background: var(--iki-paper);
  color: var(--iki-ink);
  font-family: var(--iki-font-sans);
  font-size: 14px;
  line-height: 1.5;
}
a { color: var(--iki-teal-deep); text-decoration: underline; border-radius: 2px; }
a:hover { color: var(--iki-navy); }
:focus-visible {
  outline: var(--iki-focus-width) solid var(--iki-teal-deep);
  outline-offset: var(--iki-focus-offset);
}
/* On a navy field, teal has no contrast: */
.on-navy :focus-visible { outline-color: var(--iki-paper); }
/* The app root: Base UI portals popups to <body>, and the page stays below them. */
.iki-app {
  isolation: isolate;
}
/* iOS 26 Safari: a scrim is position: absolute and needs a positioned body. */
body {
  position: relative;
}
/* No motion (design system §6): a transition needs a motion-reduce: counterpart; this is the floor. */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 13b. Tailwind v4 projects — the IKI Digital Library

The library is Vite + React 19 + Tailwind v4 with source-owned shadcn/ui
primitives (`components.json`, New York style, lucide icons). Its tokens are
oklch in `apps/web/src/styles.css`.

Steps:

1. **Replace the `:root` palette in `apps/web/src/styles.css`** with the
   `@theme` block from [§4](#the-theme-block). Keep the file's cascade layers
   and `@source` line; only the colour values change. **Import it before any
   `@theme` of your own:** its first declaration is `--color-*: initial`, which
   switches Tailwind's default palette off and would take a colour you had
   declared above it with it. The shadcn primitives' `bg-white`, `text-black`
   and `border-gray-*` compile to nothing after this step; they become
   `bg-paper`, `text-ink` and `border-grid`, or the semantic aliases below.
2. **Re-point the shadcn semantic aliases** in the `@theme inline` block, per
   the table below. The alias names stay, so no component changes.
3. **Decide the four conflicts** below and apply each once, at the token level.
4. **Copy `packages/design/src/ui-contrast.ts` and its test verbatim** and list
   the pairs the library actually renders. This is the only step that is real work, and it is
   the one that keeps the palette honest.
5. **Copy the IHDR reader from Work OS's `login-logo.test.ts`** if the library
   gains brand images.
6. Leave `AppShell.tsx`, the routing and the query layer alone. This is a
   palette and type change, not a restructure.

| Library alias | Current | Map to | Note |
| --- | --- | --- | --- |
| `--background`, `--bg` | `oklch(1 0 0)` | `--color-paper` | identical white |
| `--foreground`, `--ink` | `oklch(0.18 0.018 270)` ≈ `#0e111a` | `--color-ink` | lighter, still 13.31:1 |
| `--card`, `--popover` | `var(--bg)` | `--color-paper` | unchanged |
| `--primary` | `oklch(0.42 0.15 270)` ≈ `#2f429d` | `--color-teal-deep` | violet-blue → teal; 8.80:1 → 5.19:1, still AA |
| `--primary-hover` | `oklch(0.36 0.16 270)` | `--color-navy` | matches the app's `hover:bg-navy` |
| `--primary-foreground` | `var(--bg)` | `--color-paper` | white on teal-deep is 5.19:1 |
| `--secondary`, `--muted`, `--surface` | `oklch(0.972 0.006 270)` | `--color-paper-tint` | |
| `--accent`, `--surface-strong` | `oklch(0.94 0.014 270)` | `--color-teal-soft` | the app's hover surface |
| `--muted-foreground` | `oklch(0.45 0.022 270)` | `--color-ink-muted` | |
| `--border` | `oklch(0.88 0.012 270)` | `--color-grid` | decorative, as in the app |
| `--input`, `--control-border` | `oklch(0.58 0.018 270)` ≈ `#767a85`, 4.29:1 | `--color-grid-strong` | 3.41:1, still clears 1.4.11 |
| `--ring` | `var(--primary)` | `--color-teal-deep` | |
| `--destructive`, `--error-text` | `oklch(0.35 0.11 30)` | `--color-health-overdue-fg` | |
| `--danger-surface`, `--error-bg` | `oklch(0.95 0.04 30)` | `--color-health-overdue-bg` | |
| `--success-foreground`, `--success-text` | `oklch(0.28 0.1 155)` | `--color-health-ontrack-fg` | |
| `--success-surface`, `--success-bg` | `oklch(0.92 0.06 155)` | `--color-health-ontrack-bg` | |
| `--warning-text` | `oklch(0.32 0.09 85)` | `--color-warm-fg` | |
| `--warning-bg` | `oklch(0.95 0.06 85)` | `--color-warm-bg` | |
| `--radius` | `8px` | `6px` | see conflicts |

**The four conflicts, with a recommendation each.**

| Conflict | Library | Work OS | Recommendation |
| --- | --- | --- | --- |
| Radius | `--radius: 8px`, panels 12px | `rounded-md` 6px | **Take 6px.** The library derives `--radius-sm/md/lg` from one value, so this is a one-line change. |
| Typeface | Inter, declared in `:root` with no `@font-face` and no `<link>` — so it silently falls back to `ui-sans-serif` today | Geist via `next/font`, self-hosted | **Take Geist and actually load it.** The library's Inter is a declaration without a file; whichever face wins, it should be served, not hoped for. |
| Focus | `3px solid var(--primary)`, offset 3px (and `-3px` inset on `main`) | 2px / 2px, `focus-visible` only | **Take 2px/2px** for consistency; keep the library's inset ring on `main`, which the app has no equivalent for. |
| Icons | lucide-react | Hand-drawn, no package | **Keep lucide in the library.** The no-package rule exists because Work OS needs seventeen glyphs; a library that already depends on lucide gains nothing by hand-drawing. Match the weight: 20px nav, 16px inline, `currentColor`. |

Two things the library already does better, and should keep: 44px minimum
targets on every nav item, and a `skip-link` that is `position: fixed` rather
than absolutely positioned.

### 13c. Plain CSS and Handlebars — the public website

The Ghost theme carries its palette in `assets/css/screen.css` from the
`/* IKI Custom Theme Styles` comment onward:

```css
:root {
  --iki-color-primary: #005f73;  /* Deep Pacific Blue */
  --iki-color-accent:  #0a9396;  /* Lagoon Green */
  --iki-color-sand:    #e9d8a6;
  --iki-color-coral:   #ae2012;
  --iki-color-dark:    #001219;
  --iki-font-display: 'Inter', sans-serif;
}
```

Steps:

1. **Add the [§13a](#13a-any-stack--custom-properties) block** above the
   existing `:root`, then map the theme's own variables onto it:
   `--iki-color-primary: var(--iki-navy)` and
   `--iki-color-accent: var(--iki-teal)`, leaving every downstream rule alone.
2. **Where the accent carries text, use `--iki-teal-deep`.** The theme's
   `#0a9396` is 3.73:1 on white, below AA. This is the change with the most
   value: it fixes a real contrast failure, and it is the same fix Work OS made.
3. **Set `--ghost-accent-color` to the same value**, since the theme already
   forces it.
4. **Leave the greys.** The nav bar's `#f8fafc` / `#e2e8f0` are close cousins of
   `paper-tint` and `grid`; swapping them is optional and gains little.

**What stays editorial, and should not be forced onto the apps:** the sand and
coral accents, EB Garamond as the serif display face, JetBrains Mono, the
full-bleed hero treatment and the 1120–1320px content measures. A public website
is a different job from a task tracker; sharing the brand does not mean sharing
the furniture.

### 13d. Constraints a shared package must respect

- **No CDN, for anything.** The policy is `default-src 'self'`, `script-src`
  nonce-only with `strict-dynamic`, `style-src` nonce-only, `img-src 'self'
  blob: data:`, `font-src 'self'`. A hosted stylesheet, an icon font, a CDN
  script and a remote image are all blocked. A shared package must be files in
  the repository.
- **No CSS-in-JS that injects `<style>`** unless it can be given the
  per-request nonce. Tailwind v4 compiles to a static stylesheet and is fine.
- **Inline `style` attributes are allowed**, through `style-src-attr
  'unsafe-inline'`, because a nonce cannot apply to an attribute and React
  server-renders the grid's column widths that way. Everything else stays
  strict.
- **No *styled* component library**, per ADR 0003 and ADR 0006, narrowed by
  ADR 0002 of this repository (21 October 2026): unstyled primitives are
  allowed only inside the package, behind components the package owns.
  `@base-ui/react` is the package's one runtime dependency; it is never
  re-exported, so a consumer imports `Drawer`, `Popover`, `Menu` and
  `Disclosure` from `@tech-iki/design` and nothing from Base UI. A shadcn
  project keeps its source-owned primitives and re-points their tokens.
- **`theme.css` owns the colour namespace.** It opens with `--color-*: initial`,
  so it is imported before any `@theme` the consumer writes, and after it the
  only colour utilities are the 25 tokens plus `transparent`, `current` and
  `inherit`. `white` is `paper`; `black` is `ink`. A consumer that needs a
  colour the system lacks proposes a token, not a local `--color-*`.
- **Light only.** Do not add a dark palette on the consumer side; propose it as
  an ADR.

## 14. Known drift inside Work OS

True on `main` at 23 September 2026 (`3acb50b`), less the two rows #265 fixed on
24 September 2026 (the `accent-gov` checkbox and the duplicated policy reference
button). A consumer should copy the rule, not the exception; each of these is a candidate for its own issue.

| Drift | Where | Fix |
| --- | --- | --- |
| The login inputs and the import page's inputs hand-write their field classes, so they lack the 44px floor; the login labels are `text-sm` where every other label is `text-xs` | `login-form.tsx`, `import-manager.tsx` | Use `fieldClass`/`labelClass`, or record why the login page differs |
| The column-resize handle is the only control with `focus-visible:outline-none` and a fill instead of a ring, with no comment saying why | `column-resizer.tsx` | Either `focusRingOnNavy` with an inset offset, or write the geometric reason down |
| The rail's `paper/50`, `/70` and `/75` text pairs (still written `white/…` in Work OS, which `theme.css` 0.2.0 no longer compiles) render but are not in `TOKEN_PAIRS`; all pass, the 11px headings by 0.09 | `app-sidebar.tsx` | Add them; the file claims the list is complete |
| Confirmations are plain text while refusals carry `role="alert"`, so a screen reader hears what failed and not what worked | `tasks-manager.tsx` | `role="status"` on the success notice |
| The workstream chip is copied three times and one copy wraps a task reference, not a workstream code | dashboard, workstreams, Summary | Extract a component, and decide which identifier gets a chip |
| The import summary chips are a third KPI-tile shape | `import-manager.tsx` | Give `KpiTile` a compact size |
| 11px is used at eight sites and 10px at one, but neither is a token; the section `h2` is `text-sm` on data pages and `text-base` on the guide, with no written rule | several | Decide, then write it here |
| Two policy-board controls have no 44px floor below `md`: the column header toggle and the card's reference button | `policy-board.tsx` | `touchTarget` |
| The policy panel's feedback textarea is `smallFieldClass` copied by hand, without its touch floor; the Move to… menu items restate the popover option class with different padding and layout; the card title is a link in behaviour but not `linkClass` | `policy-panel.tsx`, `policy-board.tsx` | Import the shared strings |
| The policy board has no phone layout: a fixed 1140px grid scrolls sideways at every width | `policy-board.tsx` | Decide whether column focus is the phone route, and write it down |

## 15. Decision register

| Date | Source | Decision | What settled it |
| --- | --- | --- | --- |
| 2026-07-23 | ADR 0001 | UI would be Tailwind + shadcn/ui | **Revised**: shadcn was never installed |
| 2026-07-24 | ADR 0003 (#31) | Adopt the workbook's palette as Tailwind v4 `@theme` tokens | Staff read both during the transition; the colours already mean something to them |
| 2026-07-24 | ADR 0003 | Dark mode dropped; light only | A parallel theme doubles every decision for no demand |
| 2026-07-24 | ADR 0003 | No component library | A themed library would fight the workbook look |
| 2026-07-24 | ADR 0003 | Remove the scaffold's Arial override | Geist was loaded and never applied |
| 2026-07-24 | #32 | Status colour lives in one map, exhaustively tested | Four components had drifted; My tasks omitted two health flags |
| 2026-07-24 | #41 | One full-width `PageMain`, `readable` for prose | Eight per-page wrappers ranged from `max-w-3xl` to `6xl` |
| 2026-07-29 | ADR 0006 (#56) | Airtable is the interaction model | 42% of the grid off-screen at 1440px; a header that never stuck; row heights varying 2.1× |
| 2026-07-29 | ADR 0006 (#58) | Navy demoted to app furniture | A second navy field competed with the status colours |
| 2026-07-29 | ADR 0006 (#57) | Add `teal-deep` and `grid-strong`; keep the originals for decoration | teal 4.11:1, grid 1.36:1, neutral pill 4.02:1 — measured on the running app |
| 2026-07-29 | ADR 0006 (#57) | Contrast is asserted by test, not claimed in prose | ADR 0003's "AA-safe throughout" was false for the chrome |
| 2026-07-29 | ADR 0006 (#57) | One focus indicator, defined once | The compiled stylesheet contained zero `:focus-visible` rules |
| 2026-07-29 | #58 | Left rail replaces a seven-link strip; collapse in a cookie | The old nav wrapped to three rows at 375px |
| 2026-07-29 | #58 | Sticky headers only inside a bounded frame | The frame was 3,961px tall and never scrolled |
| 2026-07-30 | #59, #69 | Frozen columns; row backgrounds opaque | `teal-soft/40` flattened to 1.04:1 and showed the scroll through the pinned cells |
| 2026-07-30 | #61 | One record drawer for create, edit and history | A 14-field form shoved the grid off the page |
| 2026-07-31 | #62 | Saved views, listed in the rail, addressed by slug | Somebody rebuilt the same filter by hand before every meeting |
| 2026-07-31 | #63 | Phone cards; a 44px touch floor below `md` | 14% of the grid visible at 375px; controls about 26px tall |
| 2026-08-02 | #86 | Every column shows by default | Hiding nine "was sound about pixels and wrong about people" — **reverses #59** |
| 2026-08-03 | ADR 0007 (#93) | The grid gets a cursor; one tab stop; sheet skin | 2,881 focusable elements in the table body |
| 2026-08-03 | #95 | One-click choosers; icon-only row actions; hand-drawn icons | A status change took four clicks; Safari has no `select.showPicker()` |
| 2026-08-04 | #98 | The cell is the unit: hover and cursor both on the `<td>` | A hover ring inset 9/35/5/9px; a 172px input in a 216px cell |
| 2026-08-13 | #141, #143 | Lockup on the login card; the mark alone in the rail | The mark is 1.42:1 on navy; the lockup's small line smears below ~48px |
| 2026-08-15 | #165 | The scroll frame is `relative`, not `contain: paint` | 3,031px of phantom scroll; `contain` would trap the fixed popovers |
| 2026-08-22 | #167 | The email palette is named and held against the stylesheet | The link teal was Tailwind's teal-700 |
| 2026-09-06 | #215 | A print stylesheet, not a PDF library; a named page box | Chrome honours it; Safari has no `page` property at all |
| 2026-09-09 | #230 | A visible Safari print hint on the meeting page | An A5-landscape control page still opened A4 portrait |
| 2026-10-14 | #413 | The Summary page's Safari print hint removed | Brian judged it noise above a now-compact agenda — **reverses #230** for that page; the policy print hints stay |
| 2026-09-10 | #241 | Email ink is the app's ink; every email colour is guarded | The guard covered two of five constants |
| 2026-09-10 | #242 | Pill tones come only from `ui-colors.ts` | One pill still used the 4.02:1 pair ADR 0006 said was gone |
| 2026-09 | #217–#219 | The policy board: six kanban columns, drag-and-drop with a Move to… menu as its keyboard route, filters in the URL | — |
| 2026-09-18 | #248 | `Pill.tone` is a typed union; the source scan is retired | A type error cannot be satisfied by a comment or a runtime-built string |
| 2026-09-19 | #246 | The table guard scans `src/app` too; the dashboard's workstream table stacks below `md` | Its eight nowrap header cells alone were 820px, three times a 269px phone frame |
| 2026-09-23 | #261 | A pill is always one line, and every fixed-width pill column derives its width from its labels | "Awaiting Input" clipped by 3px in the grid and spilled 30px over the next column on the printed report |
| 2026-10-21 | plan 2026-10-20 §7 | Icons are Lucide drawings vendored by a generator into the package's own typed `Icon`, not a `lucide-react` dependency | A consumer picks a meaning, not one of 1,900 pictures; the §8 judgements survive; no client boundary in a table |
| 2026-10-21 | plan 2026-10-20 phase 0 | `Button`, `Field`, `Notice`, `EmptyState` join the package; `KpiTile.tone` takes the pill tones' names | 238 buttons, 189 fields, 98 notices and 26 empty states written by hand across the two consumers |
| 2026-10-21 | ADR 0002, plan 2026-10-20 §7 | Unstyled primitives (`@base-ui/react`) behind package-owned `Drawer`, `Popover`, `Menu`, `Disclosure`; never re-exported; the "no component library" line narrows to "no *styled* component library"; client-only components stay in the main export with `"use client"` per file; phase 1 waits for the Work OS port (#443) to exercise the Drawer | Base UI is the only candidate with a Drawer, a Combobox and a cancellable Escape together; a themed library would still fight the workbook look, and an unstyled one does not |
| 2026-10-21 | plan 2026-10-20 §7-3, PR #10 | Phase 1 merges before the Work OS port has run the `Drawer`; #443 validates it against `main` instead | Brian: merge so the next phase can start. Nothing is published by the merge; a wrong API is a follow-up before 0.4.0 is tagged — **reverses decision 3 of the same day** |
| 2026-10-21 | plan 2026-10-20 phase 2 | `TableFrame`, `Checkbox`/`Radio`/`RadioGroup` (server-safe, styled natives) and `Tooltip`, `Tabs`, `Combobox` (on Base UI) join the package in one PR for 0.5.0, without waiting for a consumer issue | Brian, 21 October 2026: proceed with phase 2 anyway — **sets aside the plan's "each ships only when a consumer issue asks for it"**. The demand is the plan's own count: 8 table frames, 19 native checkboxes and radios, 29 `title=` hints, one tablist, one cell combobox |
| 2026-10-21 | plan 2026-10-20 §4.3 | A transition is allowed only with a `motion-reduce:` counterpart; `base.css` and `theme.css` ship the global reduced-motion reset | Nothing animated and nothing needed a guard, so the rule had to be written before a consumer added one — formerly open question §16-4 |

### Reversed — do not re-adopt

- **The navy `PageTitle` band** with a sky description strip. Removed once the
  rail carried navy.
- **The login card's navy band.** The mark cannot sit on navy.
- **"Teal: white text for large/bold only."** Stated in ADR 0003 and never
  honoured; `text-sm font-semibold` is not WCAG large text.
- **"Passes AA at 4.5:1 throughout."** The pills did; the chrome did not.
- **`focus:outline-none` with a 1px border change** as the focus style.
- **Alpha row tints** (`teal-soft/40`, `health-overdue-bg/30`) — see [§4](#4-colour).
- **Zebra via `:nth-child`.** It inverted banding under injected rows and erased
  state tints.
- **Nine columns hidden by default.**
- **Native `<select>` as the cell editor.**
- **The email link teal `#0f766e` and ink `#0f172a`**, both Tailwind lookalikes.
- **`[page\:report] table`** as an attribute selector — it matched nothing.
- **The scaffold's Vercel favicon**, which survived three weeks because every
  eye was on what the change added.

## 16. Open questions

1. **The three colour families** ([§3](#three-colour-families-today)). The
   options are laid out; the choice is Brian's. The website's lagoon accent
   failing AA at 3.73:1 is the part with a deadline attached to it.
2. **Whether the logo's indigo should ever become a token.** Every app colour
   comes from the workbook; the login card is the only place the logo's own hue
   appears.
3. **The drift in [§14](#14-known-drift-inside-work-os)** — ten items, most
   of them small.
4. **Whether the F-series labels should be mapped in-repo.** The code's
   reasoning cites F13, F24.2 and so on; the feature list stops at F11 and the
   rest resolve only on GitHub.

## Appendix A — tokens as data

This block is `packages/design/dist/tokens.json`, generated from
`packages/design/src/tokens.ts`.

<!-- tokens:json -->
```json
{
  "name": "IKI design system",
  "version": "0.3.0",
  "source": "tech-iki/iki-design packages/design/src/tokens.ts",
  "colour": {
    "navy": "#12304a",
    "teal": "#168b8c",
    "teal-deep": "#14797a",
    "teal-soft": "#eaf4f4",
    "sky": "#ddeaf0",
    "paper": "#ffffff",
    "paper-tint": "#f4f8f9",
    "grid": "#d5dee5",
    "grid-strong": "#7e8d9a",
    "ink": "#23313d",
    "ink-muted": "#5b6b7a",
    "row-hover": "#e0f2f4",
    "row-error": "#fcf0f0",
    "health-overdue-bg": "#f4cccc",
    "health-overdue-fg": "#990000",
    "health-ontrack-bg": "#d9ead3",
    "health-ontrack-fg": "#274e13",
    "health-stale-bg": "#e7b34b",
    "health-stale-fg": "#5c4300",
    "warm-bg": "#fce5cd",
    "warm-fg": "#783f04",
    "info-bg": "#d9eaf7",
    "info-fg": "#12304a",
    "priority-low-bg": "#fff2cc",
    "priority-low-fg": "#7f6000"
  },
  "font": {
    "sans": "Geist",
    "mono": "Geist Mono",
    "fallback": "system-ui, -apple-system, 'Segoe UI', sans-serif",
    "mono-fallback": "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    "email": "system-ui, -apple-system, 'Segoe UI', sans-serif"
  },
  "type-scale-px": [
    10,
    11,
    12,
    14,
    16,
    18,
    20,
    30
  ],
  "weights": [
    400,
    500,
    600
  ],
  "radius-px": {
    "xs": 2,
    "sm": 4,
    "md": 6,
    "lg": 8,
    "full": 9999
  },
  "breakpoints-px": {
    "sm": 640,
    "md": 768,
    "lg": 1024
  },
  "z-index": {
    "frozen-body-cell": 1,
    "sticky-header": 10,
    "frozen-header": 20,
    "popover": 30,
    "drawer": 40,
    "skip-link": 50
  },
  "touch-target-px": 44,
  "contrast": {
    "text": 4.5,
    "non-text": 3
  },
  "theme": "light-only",
  "motion": "none"
}
```
