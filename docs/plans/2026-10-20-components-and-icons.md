# Plan: more components, one primitive library, one icon source

20 October 2026, decided by Brian on 21 October 2026 (§8). Investigation and
plan only; nothing in the package or site has changed. Two delegated sweeps fed it: a demand inventory of the two
consumer apps (Work OS, Digital Library) and a live check of the candidate
libraries against npm and their published tarballs. Every count below comes
from those sweeps and was spot-checked against the source.

## 1. Where the system stands

- 25 tokens, 9 tones, 15 class strings, 4 components (`Pill`, `KpiTile`,
  `PageTitle`, `PageMain`). All four are server-safe: no hooks, no `"use client"`.
- Neither consumer imports the package yet. Work OS carries local copies of
  `ui-classes`, `ui-colors` and the four components (iki-work-os #443 is the
  switch-over). Digital Library has a shadcn "new-york" layer (`button`,
  `alert` with cva variants; `input`, `textarea`, `native-select`, `skeleton`,
  `label` on the one Radix import) and app wrappers (`Field`, `Notice`,
  `EmptyState`, `LoadingState`, `Pagination`, `PageHeader`), plus six Lucide icons.
- The register says "No component library — a themed library would fight the
  workbook look" (ADR 0003) and "UI would be Tailwind + shadcn/ui — revised,
  never installed" (ADR 0001). Both are about *styled* libraries. Nothing in the
  system rules on *unstyled* primitives, and nothing rules on an icon package;
  §8 says the icons are hand-drawn and explains why two of them are.

## 2. What the consumers build by hand (the demand)

| Pattern | Work OS | Digital Library | Shared today |
| --- | --- | --- | --- |
| Button | 172 `<button>` in 42 files | 65 `<Button>` + 15 `buttonVariants` on links | class strings only |
| Field (label + control + error) | 99 `<label>`; the invalid mark `marks()` copied in 3 files | 90 `<Field>`, which wires `aria-describedby`/`aria-invalid` | `labelClass`, `invalidFieldClass` |
| Inline notice (`role="alert"` / `"status"`) | 45 hand-written `<p>` in 22 files | 53 (`Notice`, `ErrorMessage`, raw) | nothing |
| Empty state | ~18 inline `<p>` + one boxed variant | 8 `<EmptyState>` | nothing |
| Icons | 27 glyphs across 6 files (16/18/20px; strokes 1.4/1.5/1.75) + 14 unicode characters (✕ × ⤢ ✓ ▸ ▾ ← →) | 6 Lucide icons | nothing |
| Native `<select>` | 37 in 12 files | 21 | `fieldClass` |
| Pill / status chip | 31 | 1 (own CSS) | `Pill` |
| Popover panel | 1 impl (`Panel`), 15 sites; own placement maths | — | nothing |
| Portalled floating surface | 4 (cell error, choice combobox, multi-select, move menu) with 3 positioning approaches | — | nothing |
| Drawer / dialog | 1 impl, 7 sites; own focus trap, dismiss stack, escape handling in 15 files | — | nothing |
| Disclosure | 4 native `<details>` + 7 button-and-`aria-expanded` | 2 `<details>` | nothing |
| Menu (`role="menu"`) | 1 (APG, portalled) | — | nothing |
| Tabs | 1 | — | nothing |
| Tooltip | none; 29 native `title=`, 12 on icon-only buttons | none | nothing |
| Toast, skeleton, spinner | none, by decision (§8) | `Skeleton` inside `LoadingState` | — |
| Checkbox / radio / switch | 12 / 7 / 0, native | 4 / 0 / 0 | nothing |
| Table frame | `TableFrame`, 8 sites | — | not yet in the package |

Tone maps: Work OS keeps 7 `Record<…, PillTone>` maps (31 keys) and two
byte-identical due-date tone objects. `KpiTile.tone` is still a second tone
vocabulary (`neutral | warn | bad`), as the audit noted.

## 3. The candidates, measured on 20 October 2026

### Headless primitives

| | Base UI `@base-ui/react` | Radix `radix-ui` | React Aria Components | Headless UI | Ark UI |
| --- | --- | --- | --- | --- | --- |
| Version, date | 1.9.0, 9 Oct 2026 | 1.8.1, 12 Oct 2026 | 1.22.1, 9 Oct 2026 | 2.2.10, 7 Apr 2026 | 5.39.3, 5 Oct 2026 |
| 2026 releases | 10 | 12, all since June | 11 | 1 | 19 |
| Licence | MIT | MIT | Apache-2.0 | MIT | MIT |
| Ships CSS or motion | none; state via `data-*`; `className` may be a function of state | none; `data-state` | none; `data-*` + render props + stable class names | none; opt-in `transition` prop | none |
| Drawer | yes | no (Dialog) | not found | no (Dialog) | preview |
| Combobox | yes (+ Autocomplete) | no | yes | yes | yes |
| Toast, Tooltip | yes, yes | yes, yes | listed, yes | no, no | yes, yes |
| Escape can be vetoed by the caller | yes (`eventDetails.cancel()`) | yes (`onEscapeKeyDown`) | boolean switch only | no documented veto | yes (`onEscapeKeyDown`) |
| Portal | explicit `Portal` part | explicit `Portal` part | not stated | automatic | explicit |
| Package shape | one package, subpath per component, `sideEffects:false` | umbrella over ~55 packages | one package over the `@react-aria/*` family | one package, 4 deps | one package, 69 deps |
| Client-only | yes (`"use client"` in dist) | yes | yes | yes | yes |

shadcn/ui is a copy-in registry, not a library. Since July 2026 it defaults to
Base UI, with Radix and React Aria as selectable bases. Tailwind Plus/Catalyst
is paid, closed to new customers since Tailwind Labs joined Shopify on
9 September 2026, and Catalyst carries `motion`; it is out.

### Icon sets

| | Lucide `lucide-react` | Tabler `@tabler/icons-react` | Heroicons | Phosphor | Radix Icons |
| --- | --- | --- | --- | --- | --- |
| Version, date | 1.60.0, 20 Oct 2026 | 3.49.0, 5 Oct 2026 | 2.2.0, Nov 2024 | 2.1.10, May 2025 | 1.3.2, Nov 2024 |
| Licence | ISC | MIT | MIT | MIT | MIT |
| Count | ~1,900 | ~5,185 outline | 324 | 1,512 × 6 weights | 318 |
| Grid, default stroke | 24, 2 | 24, 2 | 24, 1.5 (16/20 sets are filled) | 256, weight-based | 15, filled |
| Stroke per instance | `strokeWidth`, `absoluteStrokeWidth`, a context provider | `stroke` prop | `strokeWidth` (outline only) | no | no |
| Round caps | yes | yes | yes | n/a | n/a |
| `"use client"` | yes (context hook) | no | no | no (`/ssr` entry) | no |
| All 12 role glyphs present | yes | yes | no drag handle | yes | no filter, no inbox |
| Install size | 36 MB | 17.5 MB | 3.7 MB | 33 MB | 3.4 MB |

None of the five bundles any animation.

## 4. Recommendation

### 4.1 One primitive library, behind the package: Base UI

Adopt `@base-ui/react` as the package's one runtime dependency, and **never
expose it directly**. A consumer imports `Drawer`, `Popover`, `Menu` from
`@tech-iki/design`; the package owns the markup, the class strings and the
tokens; Base UI owns focus, keyboard, pointer-outside, positioning and ARIA.

Why Base UI over the others:

- It is the only one with a Drawer, a Combobox and a cancellable Escape hook
  together. The Drawer is Work OS's largest hand-rolled surface (7 sites,
  `focus-trap.ts`, `dismiss-stack.ts`, `trapTab`, escape handling in 15 files);
  the Combobox is the grid's `ChoicePopover`; the Escape veto is what lets
  the package coexist with Work OS's existing layer stack during migration.
- Unstyled, with state as `data-*` attributes, so the Tailwind class strings
  that *are* the library keep working (`data-open:bg-teal-soft`), and the
  contrast test keeps asserting every pair.
- One package with per-component subpaths and `sideEffects:false`; MIT; React
  17–19; 10 releases this year; shadcn's default base, so examples and
  answers exist.
- Radix lacks Combobox and Drawer and has an uncertain year. React Aria is
  large, Apache-2.0, and its Drawer and portal behaviour could not be
  verified. Headless UI had one release in 2026 and cannot veto Escape.
  Ark UI brings 69 dependencies.

What this changes in the written system: the register's "No component
library" line becomes **"No *styled* component library. Unstyled primitives
are allowed only inside the package, behind components the package owns."**
ADR 0003's reason (a themed library fights the workbook look) stays true and
is still honoured. Record it as a new register row and a new ADR (0002 in this
repo).

Costs to state plainly:

- Every Base UI-backed component is a **client component**. The package's
  four components today are server-safe. Keep them so, add `"use client"` to
  each new wrapper file (tsc preserves the directive), and document which
  exports are client-only. Do not move the existing four.
- Base UI asks the app root for `isolation: isolate`, and iOS 26 Safari wants
  the backdrop `position: absolute` with `body { position: relative }`. Both
  belong in `base.css`, generated, and in §13.
- Bundle weight lands on Work OS, which has none of this today. Per-component
  subpath imports keep it to what is used; measure it in the #443 port.

### 4.2 Icons: Lucide drawings, curated into the package's own `Icon`

Use Lucide as the **source of drawings**, not as a consumer-facing dependency.
The package ships an `Icon` component with a typed `name` union — the 27
glyphs Work OS already has, the 8 unicode stand-ins, and the 12 common roles
(settings, archive, chevrons, plus/minus, search, filter, calendar, drag
handle, external link, warning, info, check) — drawn from Lucide's paths at the
system's own sizes and weights: 16px at 1.5 stroke in a row, 20px at 1.4 on
the rail, round caps, `currentColor`, `aria-hidden`. The paths are generated
into `icons.generated.tsx` by a build script from the `lucide` static package
(a devDependency), the same way `theme.css` comes from `tokens.ts`; the
generated file is never edited.

Why this shape:

- A consumer picks a *meaning*, not one of 1,900 pictures, so the system keeps
  the two judgements §8 records (settings is sliders, not a cog; drop is a tray,
  not a bin) and gains the ability to make more of them.
- No `"use client"` in consumers' tables: the generated component is plain
  SVG, so it renders in Server Components, unlike `lucide-react` itself.
- One stroke weight per size, held by a test, ends the 1.4/1.5/1.75 spread.
- Lucide over Tabler for the drawing because it is the most active set (77
  releases this year), ISC, and the one Digital Library already uses, so its
  six icons map one-to-one. Tabler is the fallback if a needed glyph is
  missing; the generator can take a path from either.

If a direct dependency is preferred instead, `lucide-react` with the package's
`strokeWidth` context provider is the next-best; it costs the client boundary
and the open vocabulary.

### 4.3 What stays decided

- **Light only. No motion.** Base UI ships none; the wrappers add none. Open
  question §16-4 gets its answer now: *a transition is allowed only with a
  `motion-reduce:` counterpart, and `base.css` ships a global
  `prefers-reduced-motion` reset* (Digital Library already has one).
- **No toasts, skeletons or spinners.** §8's rule holds: a load is a sentence,
  a failure says so inline. Base UI's Toast is not wrapped.
- **Native `<select>` for forms.** 58 of them work and meet the touch floor
  via `fieldClass`. Only the grid's cell chooser (already a custom combobox)
  moves to the Combobox primitive. The "native select as cell editor" reversal
  in §15 is untouched.
- **A pill is one line; a tone is a `PillTone`.** Nothing here touches tones.

## 5. Phases

Each phase is one minor version, one issue, one PR, and adds its §8 block,
its contrast pairs, its tests and its page on the site before it merges. The
order follows demand, and phase 0 needs no dependency at all.

### Phase 0 — 0.3.0: the components the counts ask for, no library

| Component | Replaces | Notes |
| --- | --- | --- |
| `Button` (`variant: primary \| subtle \| warn \| icon \| warnIcon`, `pending`) | 238 sites; Digital Library's cva `button-variants` | Wraps the existing class strings; `pending` renders the ellipsis verb and `disabled`. `...rest` passes through. |
| `Field` (label, control, hint, error) | 189 sites; 3 copies of `marks()`; DL's `Field.tsx` | Wires `aria-describedby`, `aria-invalid`, `role="alert"` on the error, `invalidFieldClass`. Adds the missing **disabled** field state (audit). |
| `Notice` (`tone: info \| positive \| warm \| overdue`, `role` derived) | 98 sites | `role="status"` for info/positive, `"alert"` for warm/overdue — fixes the drift row "confirmations are plain text while refusals alert". Tones are `ToneName`s, so the pairs are already asserted. |
| `EmptyState` | ~26 sites | A sentence in `text-ink-muted`, optional action. |
| `Icon` + generator | 27 glyphs + 14 unicode + DL's 6 | §4.2. A test holds every name to one of the two size/stroke pairs. |
| `KpiTile.tone` → `ToneName`; `...rest` on all components | audit findings | Breaking for `warn`/`bad` callers: Work OS has 7 tiles. Do it before anyone imports. |

### Phase 1 — 0.4.0: the overlays, on Base UI

| Component | Base UI part | Replaces |
| --- | --- | --- |
| `Drawer` (side at `lg`, sheet below; header, body, refusal band, footer slots) | Dialog / Drawer | Work OS `Drawer`, 7 sites, plus `focus-trap.ts`, `dismiss-stack.ts`, `trapTab` |
| `Popover` (trigger + panel; `active` trigger style; count badge) | Popover | `Panel`, 15 sites, `panel-placement.ts` |
| `Menu` (APG menu, portalled) | Menu | `MovePolicyMenu` |
| `Disclosure` (button in heading, count in name, rows stay in the DOM for print) | Collapsible with content kept mounted | 11 sites; verify the print requirement holds before adopting, else keep the hand-rolled one and say why |

Validation is the #443 port: Work OS's drawer and panels move onto these and
the dismiss stack is deleted, or the component is wrong.

### Phase 2 — 0.5.0: the rest, each on demand

`Tooltip` (29 `title=` sites; gives keyboard and touch users the hint),
`Tabs` (1 site today), `Combobox` for the grid cell chooser, `TableFrame`
(8 sites, already a component in Work OS), `Checkbox`/`Radio` styled natives.
Each ships only when a consumer issue asks for it.

### Phase 3 — the site and the written system

Two new pages: `/icons` (every name, both sizes, the Lucide source name) and
`/components` (every component, every state, the class string beneath, as
`/controls` does now). §8 gains one block per component, held by
`design-system-doc.test.ts`. §15 gains the three decisions above; §16 loses
question 4.

## 6. Risks and open decisions

1. **Adoption order.** No consumer imports 0.2.0 yet. Phase 0 can ship now; phase
   1 should not merge until Work OS's #443 port has exercised the Drawer, or
   the package will carry an overlay nobody has run.
2. **Client boundary.** Decide whether client-only components live under a
   subpath (`@tech-iki/design/client`) or in the main export with the
   directive. Recommendation: main export, directive in each file, a table in
   §13 saying which are client-only.
3. **Disclosure and print.** Base UI's Collapsible must keep its content in the
   DOM for the Summary handout. If it cannot, the hand-rolled disclosure stays.
4. **Version policy.** Each phase is a minor; `KpiTile.tone` is a renamed
   prop value and by the rule a major, but nobody imports yet. Call it a
   minor with a breaking note, as 0.2.0 did, and say so in the changelog.
5. **Licence.** Lucide is ISC and its paths will be redistributed inside an
   `UNLICENSED` package; the ISC notice must ship in the generated file.
6. **Digital Library.** It keeps `lucide-react` for anything outside the
   curated set, and can drop its shadcn `button`/`alert`/`skeleton` when phase
   0 lands. Its reduced-motion rule becomes the package's.

## 7. Decisions, 21 October 2026 (Brian)

1. **Base UI behind the package**, never re-exported, and the register line
   narrows to "no *styled* component library". Record as ADR 0002 and a §15 row
   when phase 1 opens.
2. **Vendored Lucide paths in a generated, typed `Icon`**, not a `lucide-react`
   dependency.
3. **Phase 1 waits for the Work OS port** (iki-work-os #443) to exercise the
   Drawer before it merges. **Reversed by Brian on 21 October 2026**, later
   the same day, when phase 1 (PR #10) was open on green CI and #443 had not
   started: merge now so the next phase can start, and let the #443 port
   validate the `Drawer` against `main`. Merging publishes nothing; if the port
   finds the API wrong, the fix is a follow-up PR before 0.4.0 is tagged.
4. **Client-only components stay in the main export**, each file carrying
   `"use client"`, with a §13 table naming them.
5. This document is committed as the plan of record.

Still open: the Disclosure-and-print check (§6-3), settled when phase 1 starts.

## 8. What was delegated

Two sub-agents, both Sonnet-class: a read-only demand sweep of the two
consumer repositories (patterns, icons, tone maps, `title=` tooltips) and a
library research pass against npm and the published tarballs. Their counts
and version facts are what §2 and §3 report; the recommendations in §4–§6
are the top-level agent's, checked against the design-system document and the
register. Items the research could not verify are left as open decisions
above rather than assumed.
