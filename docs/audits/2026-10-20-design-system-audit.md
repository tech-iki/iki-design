# Design System Audit — 20 October 2026

Audited on `issue-1-scaffold` at `a149202` (PR #4). Read-only; nothing in the
package or site was changed. Two delegated sweeps (hardcoded values and naming;
component completeness) were reviewed and spot-checked against the source
before anything below was accepted. Every contrast ratio quoted was measured
with the package's own `contrast()`.

## Summary

**Components reviewed:** 4 components, 15 control classes, 25 tokens, 9 tones
| **Issues found:** 14 (3 priority, 6 should-fix, 5 minor) | **Score: 74/100**

Where the points went: tokens and tones are as good as a system this size
gets — one source file, generated outputs held by tests, 43 asserted contrast
pairs, no hex and no palette class anywhere in production source. The points
come off for the components, which are thin and untested; for the written
system drifting from the code in §8; and for the two rules that are stated
but not mechanically held.

## Token coverage

| Category | Defined | Hardcoded values found |
| --- | --- | --- |
| Colour | 25 tokens, 43 asserted pairs | **0** hex in production source outside `tokens.ts`, bar the 9 *named foreign constants* on `/decisions` (logo, library, website, email) — deliberate, and allowed by the site's own rule test |
| Typography | Geist / Geist Mono, 8-step scale, 3 weights | `text-[10px]` ×1 and `text-[11px]` ×1 as live classes (`site-nav.tsx:49`; `type/page.tsx` is documentation data). 10px and 11px are in `TYPE_SCALE_PX` but have no utility — the doc §14 already names this |
| Spacing | none — Tailwind's 4px scale, by decision (§6) | — |
| Radius | 5 named, in `RADIUS_PX` | 0 |
| Elevation | 3 Tailwind shadows + 1 custom (frozen column) | the custom shadow is a literal `rgba(18,48,74,0.25)` in Work OS, documented not tokenised |
| Z-index | 6, in `Z_INDEX` | `z-[1]` ×1, documentation data only |
| Motion | `MOTION = "none"` | 0 motion classes; 0 `prefers-reduced-motion` rules (nothing to reduce) |
| Dark mode | `THEME = "light-only"` | 0 `dark:` variants |
| Inline styles | — | 4, all on the site and all data-driven swatches/specimens (`colour`, `swatch`, `tones`, `controls`) |

**Spelling:** 0 American spellings in prose, copy or comments. British holds.

## Naming consistency

| Issue | Where | Recommendation |
| --- | --- | --- |
| One token, three spellings | `COLOUR.teal` (TS) → `--color-teal` (theme.css) → `--iki-teal` (tokens.css) | Accept and *write it down*: TS is British, CSS follows Tailwind's `--color-*` namespace, plain CSS gets the `--iki-` prefix. One sentence in §4 ends the question |
| Two tone vocabularies on one prop name | `Pill.tone: PillTone` vs `KpiTile.tone: "neutral" \| "warn" \| "bad"` | Retype `KpiTile.tone` onto `ToneName` (`neutral \| warm \| overdue`) so the system has one tone vocabulary |
| `Class` suffix applied to 10 of 15 class strings | `focusRing`, `touchTarget`, `cellCursor`, `cellHover`, `focusRingOnNavy` lack it | Either is fine; the five without are modifiers, not whole controls — document that distinction or rename |
| Same shape, two names | `CONTRAST_THRESHOLD` (tokens.ts) and `THRESHOLD` (ui-contrast.ts) | Export one |
| `hint` vs `description` for secondary text | `KpiTile.hint`, `PageTitle.description` | Minor; leave unless a third component appears |
| Stale file name in four places | `ui-colors.ts` cited in `/decisions`, ADR 0001, doc §12 and §15; the file is `tones.ts` | Fix the four references |
| Comment says "nine named tones", module exports two | `tones.ts:7` | Reword: nine *keys of `tones`* |

## Component completeness

| Component / class | States | Variants | A11y | Docs | Tests | Score |
| --- | --- | --- | --- | --- | --- | --- |
| `Pill` | n/a (static) | 9 tones, 1 size | ✅ label inside; no `...rest` so no `aria-*` | ⚠️ doc line omits `whitespace-nowrap` | ⚠️ asserts only `whitespace-nowrap` | 7/10 |
| `KpiTile` | n/a | 3 tones (own vocabulary) | ⚠️ label and value are unrelated `<p>`s; **2 rendered pairs not in `TOKEN_PAIRS`** | ✅ | ❌ none | 5/10 |
| `PageTitle` | n/a | none | ✅ one `h1`; no `id` for `aria-labelledby` | ✅ | ❌ none | 6/10 |
| `PageMain` | n/a | `full`, `readable` | ✅ `<main id tabIndex=-1>` | ⚠️ `readable` also adds `flex-col gap-8`, doc says only "measure" | ❌ none | 6/10 |
| `primaryButtonClass` | hover ✅ focus-visible ✅ disabled ✅ active — | 1 | ✅ 5.19:1 | ✅ | ❌ | 8/10 |
| `subtleButtonClass`, `warnButtonClass` | same | 1 each | ✅ `/70` border asserted on both fills | ✅ | ❌ | 8/10 |
| `iconButtonClass`, `warnIconButtonClass` | same | 1 each | ✅ name by `sr-only` convention (documented) | ✅ | ❌ | 8/10 |
| `fieldClass`, `smallFieldClass` | focus ✅ focus-visible ✅ **disabled ❌** hover — | 2 sizes | ✅ 44px floor | **❌ doc shows `focus:outline-none`, removed in code** | ❌ | 5/10 |
| `invalidFieldClass` | — | 1 | ✅ when paired with `aria-invalid` + `role="alert"` (convention) | ⚠️ absent from the §8 class block | ❌ | 6/10 |
| `labelClass` | n/a | 1 | ✅ wrapping label | ✅ | ❌ | 8/10 |
| `linkClass` | hover ✅ focus-visible ✅ | 1 | ✅ underlined | ✅ | ❌ | 8/10 |
| `focusRing`, `focusRingOnNavy`, `touchTarget`, `cellCursor`, `cellHover` | — | — | ✅ all pairs asserted | ✅ | ❌ no test ties `min-h-11` to `TOUCH_TARGET_PX` | 7/10 |

Loading states, transitions and `active:` are absent **by decision** (§6, §8:
"pending is the verb with an ellipsis plus `disabled`") and are not counted
against anything above.

## Findings

### Priority — these break the system's own stated rules

1. **`KpiTile` renders two pairs `TOKEN_PAIRS` does not hold.** `warn` puts
   `warm-fg` on `teal-soft`, `bad` puts `health-overdue-fg` on `teal-soft`.
   Measured: 7.46:1 and 7.96:1 — both pass comfortably — but the rule is
   "contrast is asserted, never claimed", and one of the package's four
   components claims. Add both to `TOKEN_PAIRS` (`ui-contrast.ts`).
2. **"No raw Tailwind palette classes" has no guard in a consumer.**
   `theme.css` adds the 25 tokens but does not reset Tailwind's defaults
   (`--color-*: initial`), so `bg-red-500` compiles in every app that imports
   it. Today the rule is held only by a regex test on the site's own source.
   Decide: either reset the default palette in `themeCss()` (keeping `white`,
   which `primaryButtonClass` and `focusRingOnNavy` use — or move them to
   `paper`), making a palette class a build-time no-op; or ship the site's
   `site-rules.test.ts` matchers from the package so consumers can run them.
   The first is stronger and is what the extraction was for.
3. **§8 of the written system has drifted from the code it describes.**
   `fieldClass`/`smallFieldClass` are printed with `focus:outline-none`, which
   `ui-classes.ts:77-84` removed on purpose and explains; `Pill`'s line omits
   `whitespace-nowrap` while the next paragraph calls it part of the component;
   `invalidFieldClass` is missing from the block. `design-system-doc.test.ts`
   holds §4 and §13 to the generated CSS but nothing holds §8 to
   `ui-classes.ts`. Extend the doc test to the §8 class strings — the same
   technique, one more block.

### Should fix

4. **`fieldClass` has no disabled state.** Every button carries
   `disabled:opacity-50`; the fields carry nothing, so a disabled input is
   indistinguishable from an enabled one. Add the same, or write down why not.
5. **No component tests beyond `Pill`'s one assertion.** `KpiTile`, `PageTitle`
   and `PageMain` render nothing under test; `Pill`'s test would pass if `tone`
   stopped being applied. Four small `renderToStaticMarkup` tests cover it:
   tone class present, `h1` count, `id="main-content"` + `tabIndex`, tile
   `flex-1`/no `h-full`.
6. **`KpiTile.tone` is a second tone vocabulary.** See naming above; retyping
   onto `ToneName` also makes finding 1 structural rather than a one-off.
7. **No component accepts `...rest`; three accept no `className`.** A consumer
   cannot put `id`, `aria-*`, `data-*` or a handler on `KpiTile`, `PageTitle`
   or `PageMain`, and `Pill` cannot take `aria-label`. Forward native props on
   all four (on `Pill`, keep refusing `whitespace-*`/`bg-*` in `className` —
   now a test can hold it, since the package has `renderToStaticMarkup`).
8. **`TONE_TOKENS.meaning` is Work OS vocabulary** ("Not Started, On Hold",
   "trash button", "login notices") inside the module whose header says the
   system exports no vocabulary, and the site prints it. Either rename it
   `example` and say so, or move the mapping to the doc's semantic-maps section.
9. **§8 documents a table frame, drawer, board and task card the package does
   not ship.** They are Work OS code. Mark them as *recipes from Work OS, not
   exports* until they are extracted — or extract `TableFrame` and the row
   classes, which every consumer with a table will otherwise copy (the drift
   §14 was written to stop).

### Minor

10. `KpiTile`'s label and value are two sibling `<p>`s — a screen reader hears
    a word and a number. A `<dl>`/`<dt>`/`<dd>` or `aria-labelledby` fixes it.
11. `focusRing` is applied per control *and* `base.css` emits a global
    `:focus-visible` rule — two definitions of the one indicator §10 says is
    defined once. Harmless (they agree) but say which one wins in a Tailwind
    app and which in plain CSS.
12. `PageMain` `readable` changes child layout (`flex flex-col gap-8`) as well
    as measure; the doc says only "keeps a measure for prose".
13. `/controls` shows a disabled specimen for `primaryButtonClass` only; none
    for the other buttons, none for an invalid field with focus, none for a
    tone-less `Pill`.
14. Dependencies: `npm audit --omit=dev` is clean. The 5 high findings on
    install are one dev-only chain, `eslint-config-next` → `fast-glob` →
    `micromatch` → `braces` (stack-exhaustion ReDoS in a glob library a linter
    uses). Not shippable code; clears when `eslint-config-next` bumps. ESLint
    9.39 is past support; ESLint 10 is the path once `eslint-config-next`
    agrees.

## Priority actions

1. **Close the two rule breaks** — add the two `KpiTile` pairs to
   `TOKEN_PAIRS`, and extend `design-system-doc.test.ts` to hold §8's class
   block to `ui-classes.ts`, fixing the three drifts it will find. Half a
   day, and the system is again what it says it is.
2. **Decide the palette reset.** Resetting Tailwind's default colours in
   `theme.css` is the one change that turns "no raw palette classes" from a
   rule into a fact for every consumer. It is a minor-version change for the
   package (consumers using `white` or `black` need `paper`/`ink` or the
   reset must keep them). Decide before Work OS switches over, because Work OS
   is where the stray classes would be.
3. **Give the components a floor** — `...rest` and `className` on all four,
   `KpiTile.tone` on `ToneName`, a disabled state on the fields, and one
   render test each. Then the four components are things an app can build on
   rather than copy.

## What was not covered

No browser-driven check: nothing here measures rendered layout, the 44px floor
in a real viewport, or the focus ring's visibility on each fill — the doc's
§12 names this limit and it stands. The site's own `DataTable` component and
`layout.tsx` skip link were not reviewed. `ui-contrast.test.ts`'s negative
controls were read, not re-derived.
