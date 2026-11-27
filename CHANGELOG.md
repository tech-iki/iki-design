# Changelog

Everything that changes in `@tech-iki/design`, newest first. The format follows
[Keep a Changelog](https://keepachangelog.com) and the versions follow
[Semantic Versioning](https://semver.org): a new token, tone or component is a
minor; a value correction that keeps every name is a patch; a renamed or removed
token or class is a major.

## [Unreleased]

### Added

- `SkipLink`, `Rail`, `RailBrand`, `NavGroup`, `NavLink` and `NavButton`:
  §7's navy rail, server-safe (no `"use client"`, no location read), `...rest`
  on each root. `Rail` is an `<aside>` with the brand on top and one named
  `<nav>` (`label`, "Main" by default) holding the groups and the `foot`;
  `collapsed` sets `data-collapsed`, which every item's classes read, so no
  item needs the prop. `NavGroup`'s heading names its list and stays the name,
  `sr-only`, on the narrow rail. `NavLink` takes `icon` (an `IconName` or an
  element) and `current`, which the app computes: `true` sets
  `aria-current="page"` and draws weight, the tint and the left bar; `"true"`
  is for an entry whose page has its own section navigation. `NavButton` is a
  real `<button>` with a link's look, for Sign out. `RailBrand` is the brand
  slot's link, named by its words at every width. `SkipLink` targets
  `PageMain`'s main through the new `MAIN_CONTENT_ID`, and carries
  `focusRing` on a paper shadow, so the ring holds 5.19:1 over the navy rail.
  The rail is `h-dvh`, so iOS Safari's toolbar never covers the foot, and
  hides its scrollbar where it is 56px wide. `NavGroup` takes `headingLevel`
  (2 to 6); the links and `NavButton` take a `ref`. None of the shell depends
  on Tailwind's Preflight (#33): each string resets the defaults it would
  otherwise inherit. A group, or a foot, with nothing in it renders nothing.
  Every item keeps the 44px floor at every width, where Work OS's rail
  releases it at `md` like `touchTarget`: from `md` to `lg` the rail is still
  a column of bare icons, so a Work OS rail that adopts the components gets
  44px rows on the wide rail, against 36px today. The current item's bar
  survives forced colours (`forced-color-adjust-none`, `CanvasText`); Work
  OS's did not.
- `isActivePath(pathname, href, { exact, exclude })`: Work OS's
  segment-boundary match with child exclusion, pure and tested — `/` exact,
  `/calls` never current on `/calls-admin`, query, hash and trailing slashes
  ignored.
- `renderLink`, `joinClasses`, `LinkRender` and `LinkSlotProps`
  (`link-render.ts`): **the router-link convention.** Every link-shaped
  component takes `render`, an element (`<Link href>` from Next,
  `<Link to>` from React Router) that is cloned, or a function of the props;
  the package's classes, `aria-current` and children land on it, its own
  props stay, and an `on…` handler on both runs the element's first. Pass the
  router's `Link`, never React Router's `NavLink`, which overrides
  `aria-current` with its own matching: the package's `current` is the
  single source. No hooks, so it works in a Server Component. `Pagination`,
  `PrevNextNav` and `BackLink` (#20, #22) build on it. Written once in §7.
- The shell's class strings in `ui-classes.ts` — `skipLinkClass`, `railClass`,
  `railHeaderClass`, `railNavClass`, `railGroupsClass`, `railFootClass`,
  `railLabelClass`, `railBrandClass`, `railBrandNameClass`, `navGroupClass`,
  `navHeadingClass`, `navDividerClass`, `navListClass`, `navItemClass`,
  `navItemIdleClass`, `navItemCurrentClass`, `navButtonClass` — shown in §7's
  new `classes:nav` block and held to it by the doc test.
- `TOKEN_PAIRS`: the rail's pairs, flattened onto navy — `paper/75`, the
  `paper/50` group heading (4.59:1, the tightest), hover on `paper/10`,
  current on `paper/12` and its bar. Closes the §14 drift row that said they
  rendered unasserted; the `paper/70` of Work OS's child links joins with a
  child-link component when there is one.
- Navigation by links (#20, #22), server-safe, `...rest` on each root, every
  link taking `render` (the router-link convention above): `Pagination`,
  `PrevNextNav`, `ViewSwitch` and `BackLink`. The caller supplies every href
  (`Pagination` takes `hrefFor(page)`); nothing reads the router.
  - `Pagination` (`page`, `totalPages`, `hrefFor`, `label` (required),
    `previousLabel`, `nextLabel`, `status`, `pending`): Previous, "Page N of
    M", Next, in a `<nav>`; returns nothing for one page with the reader on it.
    Previous and Next are links with `rel`; the one that cannot go further, or
    both while `pending`, is `<span role="link" aria-disabled="true">` with no
    `href` and no tab stop. The status is plain text with no `aria-current`
    and no live region. The reader is never stranded: past the end the status
    shows the real page and Previous goes to the last page that exists. The
    Digital Library's button-callback pagination becomes links (its #107).
  - `PrevNextNav` (`label`, `current`, `previous`, `next`, `today`,
    `ariaCurrent`): the period stepper of Work OS's fortnight and holiday-year
    navs; `ariaCurrent` is `"true"` where the page is already current elsewhere.
  - `ViewSwitch` (`label`, `views`, `current`, `ariaCurrent`): a nav of links, the current
    view `aria-current="page"` with weight and a bar. Closes the second half of
    #22; §8 says when it is right and when `Tabs` is.
  - `BackLink`: a leading arrow (`icon`, `previous` by default) and the
    destination in the words ("Back to submissions"), `linkClass`'s look as a 44px
    target.
  - The strings `linkNavListClass`, `linkNavItemClass`, `linkNavLinkClass`,
    `linkNavIdleClass`, `linkNavCurrentClass`, `linkNavUnavailableClass`,
    `linkNavStatusClass`, `linkNavLabelClass`, `backLinkClass` and
    `backLinkIconClass`, in §8's new `classes:linknav`
    block, with the list and underline resets spelled out for a consumer
    without Preflight. No new token and no new `TOKEN_PAIRS` entry: every colour is a pair
    already held, named in a comment in `ui-contrast.ts`. No new icon.
  - The showcase's `/components` draws each, with Next's `Link` through
    `render`.

### Changed

- `PageMain` sets its id from `MAIN_CONTENT_ID`; the value is still
  `main-content`.
- The site: the rail and the skip link are the package's (#23): the current page is
  marked with `aria-current="page"`, weight, the tint and the bar, read by a
  small client `SiteNavLink` (the layout cannot read the pathname), and the
  skip link has its focus ring. A test renders the rail for every page and
  finds exactly one current link. `/components` shows the rail, collapsed and
  wide, and the router-link convention.
- The site's navigation is now named "Main", not "Sections", and the
  `@tech-iki/design` line at the foot of its rail is gone. The site only; the
  package is unaffected.

## [0.6.0] — 2026-11-27

The control corrections of PR #32 (the field weight, the option row touch floor,
the Move to… trigger and the WCAG citation), and the Digital Library's own form and
base-style needs: the link-button classes and a destructive button, the `Field`
text size, textarea minimum and `announceError` opt-out, `EmptyState`'s headline
`title`, and the opt-in `reset.css`. A minor: it adds exports and props and
renames no token or class; the two incompatible changes noted below are allowed
before 1.0 (SemVer §4). Some rendered sizes change, listed first below.

> **For a consumer upgrading from 0.5.0: what you will see.** These changes reach
> an existing app with no code change. Each is detailed under Added, Changed and Fixed.
>
> - Typed text in a field is weight 400, not the label's 500.
> - Field text is 16px below `md` (14px from `md`), not 14px at every width.
> - A `<textarea>` inside `Field` has a 112px minimum height (7rem).
> - Menu, popover and combobox rows are 44px below `md` (they were 28px), and
>   menu and popover panels scroll within the height available to them.
> - The Move to… trigger (`menuTriggerClass`) is 30px tall, not 28.7px.
> - `EmptyState`'s `title` is the visible headline above the sentence, not the
>   HTML `title` attribute. A tooltip passed that way now shows as a headline.
> - A `Button` label that ends in an ellipsis keeps a single one while `pending`.
> - `ButtonVariant` gains `"destructive"`. An exhaustive `Record<ButtonVariant, …>`
>   or `switch` must add the case.

### Added

- `class-strings.test.ts`: fails when a class string sets a measured property
  twice under one variant, and holds the field weight and the row touch floor.
- `EmptyState` takes an optional `title`, rendered above the sentence in a
  `<div>` 4px above it (`emptyStateTitleClass`; the pair is in `TOKEN_PAIRS`).
  Not a heading, because the component cannot know the page's level; pass an
  `<h3>` as the title for one. Without it the markup is unchanged (#41).
- `primaryLinkButtonClass` and `subtleLinkButtonClass` (#36): the two button
  looks on an `<a>` or a router `Link`: the button's own string plus
  `inline-flex items-center justify-center no-underline`, so the 44px floor
  below `md` applies and the label is not underlined. Colours, border, hover
  and focus ring are the button's, so no contrast pair changes. Held by §8 and
  shown on `/controls` and `/components`. A minor; no existing string changes.
- `destructiveButtonClass` and `Button variant="destructive"` (#37), for an
  action that cannot be undone: reject, withdraw, delete. `health-overdue-fg`
  fill with a `paper` label (8.92:1), the overdue pill's pair on hover, and a
  border of its own so it stays a button in forced-colours mode. It takes
  primary's type and padding, so its border makes it 2px taller and wider at
  `md` and up (38px against 36px); both are 44px below `md`. `warn` stays for an
  action that can be put back. No new token; two pairs added to `TOKEN_PAIRS`.
  `ButtonVariant` gains a member, `"destructive"`: a consumer with an exhaustive
  `Record<ButtonVariant, …>` or `switch` must add the case.
- `reset.css`, an opt-in export (`@tech-iki/design/reset.css`) for a Tailwind app
  that omits Preflight (#33). Eight rules in `@layer base`, each the value
  Preflight sets for those elements, scoped to `.iki-reset`: the Digital
  Library's own six, word for word, and the box-sizing and control-font rules it
  supplies elsewhere. Nothing imports it for you and no existing file changes, so
  an app with Preflight sees nothing; it is not part of `theme.css` or
  `base.css`. Put `iki-reset` on `<body>` so the portalled overlays are reached.
  §13d now states the Preflight assumption and §13e lists each rule against the
  Preflight rule it mirrors and the package classes that need it; the adopt page
  shows the file. `RESET_RULES`, `RESET_SCOPE` and `resetCss()` are exported.
- `Field` `announceError` (default `true`, so nothing changes by default): `false`
  drops the error's `role="alert"` for a form that shows its own error summary,
  keeping the id, `aria-describedby` and `aria-invalid` (#40). `Checkbox` and
  `RadioGroup` take it too.
- `Field`'s `label` and `hint` accept `ReactNode`, not only `string` (#39).
- `Checkbox` accepts `hint` and `error` and wires `aria-describedby` and
  `aria-invalid`, as `Field` does. With neither, the markup is unchanged (#39).
- `textareaClass`, `smallTextareaClass` (minimum height `min-h-28`, about four
  rows) and `fileFieldClass` (the field class with the browser's file button
  drawn as the subtle button) (#39).

### Changed

- **Install from the release tarball.** Each GitHub release now carries the
  packed tarball and its checksum, and the install line is the tarball URL (#31).
- **Docs: §8 "Task grid".** The task grid's interaction model is written up
  (#29, #30). No code change.
- **Docs: §13b.** The Digital Library's adoption path now follows its decision
  to converge on the package (theme, components, icons, and the rail for its
  signed-in pages); the palette-only steps are marked superseded (#42). No code
  or version change.
- **`EmptyState` no longer passes `title` to the root as the HTML attribute
  (#41).**
  A caller that used `title="…"` for a tooltip now gets the visible headline
  instead. No call site in Work OS or the Digital Library does this.
- **Rendered size change for existing consumers (#38):** `fieldClass` and
  `smallFieldClass` set `text-base md:text-sm`, so a field's text is 16px below
  `md` and 14px from `md`; it was 14px at every width. iOS Safari zooms the page
  when a control under 16px takes focus. Desktop is unchanged. Everything built
  on the two strings follows: `invalidFieldClass`, `Field`, the `Combobox`
  input. Heights are unchanged (the 44px floor already exceeds the taller text).
  The package has no popover search field, so none changed.
- `Field` gives a `<textarea>` child `textareaClass` (`smallTextareaClass` with
  `size="small"`) in place of the field class, so an existing textarea in a
  `Field` now has a minimum height of 7rem (#39). Set `rows` for more.

### Fixed

The first five are the control corrections of #32.

- `fieldClass` and `smallFieldClass` set `font-normal`. `Field` nests the control
  inside `labelClass`, so typed text had been inheriting the label's 500.
- `menuItemClass`, `popoverOptionClass` and `comboboxOptionClass` take the 44px
  touch floor below `md`. They were 28px on a phone. Desktop is unchanged.
- `menuClass` and `popoverPanelClass` scroll within the height available to them,
  so a long list of taller rows cannot push its last rows off a phone's screen.
- `menuTriggerClass` no longer appends `px-1.5 py-0.5`, which never applied
  (computed `6px 10px`). The padding it renders is unchanged and the string now
  says so. It sets `leading-4`, so its height moves from 28.7px to 30px, the
  same as the subtle button.
- The touch floor cites WCAG 2.5.5 (44px, AAA), not 2.5.8 (24px, AA). Principle 7
  states the measured 28–38px for buttons and fields in place of "about 26px".
- `Button` (#35): a string child that already ends in an ellipsis, the
  character or three full stops, keeps it while `pending`; "Save…" no longer
  renders "Save……". `ref` is now in `Button`'s types (a plain prop in React
  19), so a caller can pass one without a cast. `pendingLabel` is unchanged: it
  is shown as given.

## [0.5.0] — 2026-10-21

Phase 2 of the plan of 20 October 2026: the rest of the components the
consumers draw by hand. The plan said each would ship only when a consumer
issue asked for it; none has, and Brian said on 21 October to proceed anyway
(§15). A minor, in its own version-bump PR after 0.4.0's.

### Added

- `TableFrame`, `rowClass` and `ActionsHeader`: Work OS's bounded scroll frame
  (eight sites), server-safe. Sticky header only when bounded, and **no
  z-index on the sticky rule** (§6); cards below `md` when `stacked`; the
  caption as `aria-label`; `scrollableByKeyboard` makes the frame a named
  `role="region"` tab stop with the focus ring, which Work OS's lacked, and
  the caption then names the region only — Work OS named both, and a screen
  reader said the name twice. For
  the port: `frameRef`/`frameStyle`/`onScroll` become `ref`/`style`/`onScroll`
  through `...rest`, `tableStyle`/`describedBy` become `tableProps`, and
  `caption` is required. The class strings are exported and held by §8.
- `Checkbox`, `Radio` and `RadioGroup`: styled natives, server-safe, not Base
  UI. A label wrapping the input, the checked fill `teal-deep` through
  `accent-color`, the 44px row below `md`, a muted row when disabled;
  `RadioGroup` is a `<fieldset>` with a `<legend>` that names its radios and
  carries a hint and a `role="alert"` error. The input's own props reach the
  input.
- `Tooltip`, `Tabs` and `Combobox` on Base UI's Tooltip, Tabs and Combobox,
  each a client component with `"use client"`, listed in §13 and held by
  `client-directive.test.ts`. See §8 for each.
- `TOKEN_PAIRS`: every pair the five render was already held, which the list
  now says, and the one new pair — the browser's checkmark, `paper` on the
  `teal-deep` fill — is added. §8 blocks for each, held
  by `design-system-doc.test.ts` and `phase-2.test.tsx`; live specimens on the
  site's `/components`.

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
