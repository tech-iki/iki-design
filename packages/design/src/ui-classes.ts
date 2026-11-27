/**
 * Shared form-control and button classes on the ADR 0003 tokens (F17), with
 * the accessibility corrections from Work OS #57 (F24.1, ADR 0006):
 *
 * - Borders use `grid-strong`, not `grid` — a control boundary needs 3:1
 *   (WCAG 1.4.11) and `grid` is 1.36:1 on paper.
 * - Teal-on-white surfaces use `teal-deep`; the workbook teal is 4.11:1, below
 *   the 4.5:1 AA threshold for text.
 * - Every control carries `focusRing`. The app previously reset the native
 *   outline (`focus:outline-none`) and replaced it with a 1px border-colour
 *   change, which left keyboard users — and the F20 arrow-key grid navigation
 *   in particular — with no visible focus at all.
 *
 * Keep these strings the single source: components importing them inherit the
 * fixes for free, which is why per-component copies were removed.
 */

/**
 * The touch-target floor (Work OS #63, F24.7).
 *
 * 44×44px is WCAG 2.5.5, level AAA; the AA rule, 2.5.8, asks for 24px. The system
 * holds the higher one on a phone. Buttons and fields measure 28–38px on desktop, which
 * is fine with a mouse and not with a thumb. Applied as a *responsive* minimum
 * so a phone gets the room and desktop keeps its density — sharing one size
 * would visibly loosen every grid control, which is the risk the issue names.
 *
 * `min-h`/`min-w` rather than fixed sizes, so a button with more in it than a
 * label still grows.
 */
export const touchTarget = "min-h-11 min-w-11 md:min-h-0 md:min-w-0";

/** The same floor for a full-width row, which needs height and has width to spare. */
const touchRow = "min-h-11 md:min-h-0";

/** The one focus indicator in the app. Applied to every interactive class. */
export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-deep";

/**
 * The spreadsheet cursor: the box around the selected grid cell (Work OS #93).
 *
 * The grid's focus indicator, and the one place it is defined — the same rule
 * `focusRing` follows, for the same reason (ADR 0006 §4). A cell cursor is not
 * a `focusRing` variant though, and the three differences are all deliberate:
 *
 * - **Drawn inside the cell**, via a negative offset. A ring outside the box
 *   would be clipped by the scroll frame on the first and last columns, and
 *   would sit *under* the frozen columns, which are painted above their
 *   neighbours by design.
 * - **`focus`, not `focus-visible`.** The cursor is the product here, not a
 *   keyboard courtesy: someone who clicked a cell has to see which one they
 *   are on, and `focus-visible` hides it from exactly that person.
 * - **It stays while the grid is not focused**, applied from the cursor's own
 *   state, so tabbing away and back returns you to the cell you left rather
 *   than to wherever the grid decides. This is what Sheets and Airtable do.
 */
export const cellCursor = "outline-2 -outline-offset-2 outline-teal-deep";

/**
 * The cell's hover preview (Work OS #98) — the cursor's own box, one weight lighter,
 * on the same inset so the two never disagree about where the cell is.
 *
 * Applied only to cells the cursor could land on, via the same `canLand` that
 * already gates a cell's tabindex (Work OS #96's `acceptsInput`) — not
 * `td:has([data-editable-cell])`, which would miss the actions cell: it takes
 * the cursor (`alwaysInteractive`) with no `EditableCell` inside it to match
 * on, and a field this user may not edit renders no `EditableCell` trigger
 * either, so a content-shape selector gets both wrong in opposite directions.
 * `canLand` is already the answer the grid computed for the cursor itself.
 *
 * Never drawn together with `cellCursor` — a hovered cursor cell shows the
 * one 2px box it already has, not a second 1px box nested inside it.
 */
export const cellHover =
  "hover:outline hover:outline-1 hover:-outline-offset-1 hover:outline-teal-deep";

/** Focus indicator for controls on a navy field, where teal has no contrast. */
export const focusRingOnNavy =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper";

/**
 * The disabled field state, which the 20 October 2026 audit found missing (#6):
 * a control that cannot be edited looked exactly like one that could. The fill
 * goes to `paper-tint` and the text to `ink-muted`, a pair `TOKEN_PAIRS`
 * already holds at 4.5:1 — a disabled control is exempt from the contrast
 * floor (WCAG 1.4.3), but there is no reason to spend the exemption. The
 * border stays `grid-strong`, so the boundary is still found by a thumb, and
 * the cursor says why nothing happens. Part of `fieldClass` itself, so the
 * state follows the attribute and no caller has to remember a second string.
 */
const disabledField =
  "disabled:cursor-not-allowed disabled:bg-paper-tint disabled:text-ink-muted";

/**
 * No `focus:outline-none` on the fields (Work OS #315). Under Tailwind v4 it sets
 * `--tw-outline-style: none`, and `focusRing`'s `outline-2` draws its style
 * from that variable, so on keyboard focus — where `:focus` and
 * `:focus-visible` both match — the 2px ring resolved to no outline at all and
 * only the 1px border changed colour. The native ring needs no reset: the
 * browser draws it only on `:focus-visible`, which `focusRing` replaces.
 *
 * `font-normal` because `Field` nests the control inside `labelClass`: without
 * it the typed value inherits the label's 500, and label and value read alike.
 *
 * `text-base md:text-sm` (#38): 16px below `md`, 14px from `md`. iOS Safari
 * zooms the page when a control under 16px takes focus and does not always
 * zoom back, so a phone gets 16px and desktop keeps its density. This is the
 * documented iOS behaviour, not a measurement on a device. The two sizes sit
 * under different variants, so `class-strings.test.ts` does not read them as a
 * conflict.
 */
const fieldBody =
  `rounded-md border border-grid-strong px-3 py-2 text-base md:text-sm font-normal text-ink focus:border-teal-deep ${disabledField} ${focusRing}`;

const smallFieldBody =
  `rounded-md border border-grid-strong px-2 py-1.5 text-base md:text-sm font-normal text-ink focus:border-teal-deep ${disabledField} ${focusRing}`;

export const fieldClass = `${touchTarget} ${fieldBody}`;

export const smallFieldClass = `${touchTarget} ${smallFieldBody}`;

/**
 * A textarea's field class (#39): a minimum of 7rem, about four rows of the 16px
 * text a phone gets (4 × 24px of line, 16px of padding, 2px of border is
 * 114px, and from `md` four 20px rows are less than that). On `fieldClass` a
 * textarea measured 58px, and a message box that short invites a one-line
 * answer. It takes `min-h-28` where the field has `touchTarget`, not both:
 * two minimum heights under one variant are not an override (see
 * `class-strings.test.ts`). `rows` and `resize` stay the caller's. `Field`
 * gives a native `<textarea>` child this string, and `smallTextareaClass` with
 * `size="small"`. It recognises only that element: a component that wraps a
 * textarea gets `fieldClass`, and a caller who wants this string there must
 * pass it on the textarea itself, not add `textareaClass` through `className`
 * on top of `fieldClass`, where `min-h-11` and `min-h-28` would both apply
 * under one variant.
 */
export const textareaClass = `min-h-28 ${fieldBody}`;

export const smallTextareaClass = `min-h-28 ${smallFieldBody}`;

/**
 * A file input (#39): `fieldClass`, so the 44px floor and the 16px text below
 * `md` come with it, and the browser's button (`::file-selector-button`,
 * Tailwind's `file:` variant) drawn as `subtleButtonClass` is: the same border,
 * padding, 12px text and teal-soft hover. Pairs are `ink` on `paper` and on
 * `teal-soft`, both held in `TOKEN_PAIRS`.
 */
export const fileFieldClass =
  `${fieldClass} file:mr-3 file:cursor-pointer file:rounded-md file:border file:border-grid-strong file:bg-paper file:px-2.5 file:py-1.5 file:text-xs file:text-ink hover:file:bg-teal-soft`;

export const labelClass = "flex flex-col gap-1 text-xs font-medium text-ink";

/**
 * A field the last refusal named, drawn so it can be found by scrolling
 * (Work OS #161). Shared by every create/edit drawer's field-marking helper — the
 * tasks drawer's `TaskFields` and the policy drawer's `PolicyFields` (Work OS #265) —
 * so the two never quietly drift into two shades of "invalid". `invalidFieldMark`
 * is the border and fill alone, for `Field` to add to the small field too.
 */
export const invalidFieldMark = "border-health-overdue-fg bg-health-overdue-bg";

export const invalidFieldClass = `${fieldClass} ${invalidFieldMark}`;

export const primaryButtonClass =
  `${touchTarget} rounded-md bg-teal-deep px-3 py-2 text-sm font-semibold text-paper hover:bg-navy disabled:opacity-50 ${focusRing}`;

/**
 * A row action reduced to its icon (Work OS #95).
 *
 * The actions columns used to spell their verbs out — "Expand", "Delete",
 * "Set password", "Deactivate" — which is four words of chrome on every row of
 * a table whose job is showing tasks. The icon carries it; the name lives in
 * an `sr-only` span and a `title`, never dropped, because an unlabelled icon
 * is a guess.
 *
 * Square by construction (`p-1.5` on a 16px glyph = 28px), and it keeps
 * `touchTarget`'s responsive floor, so a thumb still gets its 44px below `md`
 * while the desk keeps the density the grid was measured at (Work OS #63, F24.7).
 */
export const iconButtonClass =
  `${touchTarget} inline-flex items-center justify-center rounded-md p-1.5 text-ink-muted hover:bg-teal-soft hover:text-ink disabled:opacity-50 ${focusRing}`;

/** The same, for an action that destroys or withdraws something. */
export const warnIconButtonClass =
  `${touchTarget} inline-flex items-center justify-center rounded-md p-1.5 text-warm-fg hover:bg-warm-bg disabled:opacity-50 ${focusRing}`;

export const subtleButtonClass =
  `${touchTarget} rounded-md border border-grid-strong px-2.5 py-1.5 text-xs text-ink hover:bg-teal-soft disabled:opacity-50 ${focusRing}`;

/*
 * A link drawn as a button (#36): an `<a>`, or a router `Link` that renders
 * one. The button strings assume a `<button>`, which is `inline-block` and
 * centres its own content and carries no underline; an anchor is `inline`, so
 * `min-h-11` does nothing to it, and it keeps the link's underline. These add
 * what the element lacks and change nothing else: the string is the button's
 * own, so the colours, the border, the hover, the 44px floor below `md` and
 * the focus ring are the same and the contrast pairs are the button's pairs.
 * `inline-flex` is what makes the floor apply and centres the label;
 * `no-underline` holds in every state, hover and focus included.
 */
const asAnchor = "inline-flex items-center justify-center no-underline";

/** `primaryButtonClass` on an `<a>`. */
export const primaryLinkButtonClass = `${primaryButtonClass} ${asAnchor}`;

/** `subtleButtonClass` on an `<a>`. */
export const subtleLinkButtonClass = `${subtleButtonClass} ${asAnchor}`;

/**
 * Destructive-but-reversible confirm (move-to-trash) — warm, not alarming.
 * Choose `warn` when the action can be undone; for one that cannot, see
 * `destructiveButtonClass`.
 * The border was `warm-fg/40`, which composites to 1.92:1 on the warm fill —
 * a control boundary under the 3:1 bar just like `grid` was. `/70` clears it
 * at 3.49:1 while staying lighter than the label (Work OS #57).
 */
export const warnButtonClass =
  `${touchTarget} rounded-md border border-warm-fg/70 px-2.5 py-1.5 text-xs text-warm-fg hover:bg-warm-bg disabled:opacity-50 ${focusRing}`;

/**
 * An action that cannot be undone and should not look like a routine one —
 * reject, withdraw, delete (#37). Choose `destructive` when the action is final
 * or consequential, and `warn` when it can be undone: the red is the pair
 * `Overdue` and the invalid field already use, so it says "stop and read", and
 * `warn`'s warm pair says "this can be put back".
 *
 * Filled `health-overdue-fg` with `paper` text, 8.92:1, in primary's type and
 * padding (14px, semibold) because it is the decisive action on its surface.
 * Its 1px border makes it 2px taller and wider than primary at `md` and up
 * (38px against 36px); below `md` both are 44px. The border is the same red, so a filled button keeps its boundary in forced-colours
 * mode, where backgrounds are dropped, and on hover it is the whole of the
 * button's edge: the fill goes to `health-overdue-bg` and the label to
 * `health-overdue-fg`, the pair the overdue pill holds at 6.10:1. The words carry
 * the meaning, not the colour, and a confirm step stays in words (§8).
 * No new token: every pair is in `TOKEN_PAIRS`.
 */
export const destructiveButtonClass =
  `${touchTarget} rounded-md border border-health-overdue-fg bg-health-overdue-fg px-3 py-2 text-sm font-semibold text-paper hover:bg-health-overdue-bg hover:text-health-overdue-fg disabled:opacity-50 ${focusRing}`;

/** An inline text link inside body copy or a cell. */
export const linkClass =
  `text-teal-deep underline hover:text-navy rounded-xs ${focusRing}`;

/*
 * The overlays (plan of 20 October 2026, phase 1; ADR 0002). Each string is
 * what the package's own `Drawer`, `Popover`, `Menu` and `Disclosure` render,
 * and §8's "Drawer and popover", "Board, card and Move to… menu" and
 * "Disclosure" blocks show them under these names, held by the doc test.
 * Base UI owns the behaviour and sets no class of its own; these are the
 * whole of the look.
 */

/**
 * The drawer's scrim, portalled to `<body>`: `bg-navy/25`, never black (§6).
 * `fixed` with a `min-h-dvh` floor, and `absolute` where `-webkit-touch-callout`
 * exists — iOS 26 Safari lets the page show beneath its chrome, and a fixed
 * backdrop stops short of the visual viewport there; `base.css`/`theme.css`
 * position `<body>` so the absolute form still covers it after a scroll.
 * Decorative: it has no contrast pair, and clicking it asks to close.
 */
export const drawerScrimClass =
  "fixed inset-0 z-40 min-h-dvh bg-navy/25 supports-[-webkit-touch-callout:none]:absolute";

/**
 * The panel: a full-screen sheet below `lg`, a 30rem side panel with a left
 * border at `lg` and above. `z-40` with the scrim (§6 layering), `shadow-2xl`
 * as the one thing allowed the deepest elevation. `outline-none` only because
 * the dialog element itself takes focus as a last resort and the ring belongs
 * to the control inside it that `initialFocus` chose.
 */
export const drawerPanelClass =
  "fixed inset-y-0 right-0 z-40 flex h-full w-full flex-col border-grid-strong bg-paper shadow-2xl outline-none lg:w-[30rem] lg:border-l";

export const drawerHeaderClass = "flex items-start gap-3 border-b border-grid-strong px-4 py-3";

export const drawerBodyClass = "min-h-0 flex-1 overflow-y-auto px-4 py-3";

/** The refusal band between body and footer: `role="alert"`, the overdue pair. */
export const drawerRefusalClass =
  "bg-health-overdue-bg px-4 py-2 text-sm text-health-overdue-fg";

export const drawerFooterClass = "border-t border-grid-strong px-4 py-3";

/**
 * A toolbar popover's trigger: `subtleButtonClass` that never wraps, and —
 * while its panel is open or the caller says it is `active` (a filter that
 * is applied) — the teal-soft fill, the teal-deep border and a semibold label,
 * so the open state shows as a shape and a weight, not only a colour.
 * `data-popup-open` is what Base UI sets on the trigger while open.
 */
export const popoverTriggerClass = `${subtleButtonClass} whitespace-nowrap`;

export const popoverTriggerActiveClass = "border-teal-deep bg-teal-soft font-semibold";

/** The count on a trigger ("Filters 2"): paper on teal-deep, 11px, in the accessible name. */
export const popoverBadgeClass =
  "ml-1.5 rounded-full bg-teal-deep px-1.5 text-[11px] font-semibold text-paper";

/**
 * The panel, portalled and positioned by Base UI below its trigger: `z-30`
 * (§6, under the drawer's `z-40`), `w-80`, the popover elevation. Replaces
 * Work OS's `absolute left-0 top-full` and its clamp arithmetic.
 */
export const popoverPanelClass =
  "z-30 max-h-(--available-height) w-80 overflow-y-auto rounded-md border border-grid-strong bg-paper p-2 shadow-lg outline-none";

/** One option row inside a panel (a labelled checkbox or radio, usually). */
export const popoverOptionClass =
  `flex ${touchRow} items-center gap-2 rounded px-1 py-1 text-sm text-ink hover:bg-teal-soft`;

/**
 * The Move to… trigger: `subtleButtonClass` at the card's 11px scale, with its
 * padding. This string used to append `px-1.5 py-0.5`, which never applied,
 * because two utilities for one property are settled by the stylesheet's order
 * and not the attribute's; it computed `6px 10px`. Applied, it would measure
 * about 21px, under WCAG 2.5.8's 24px, so the padding that was always drawn is
 * now the padding written. `leading-4` because `text-xs` was supplying the line
 * height: without it the trigger inherits 1.5 and measures 30.5px. With it, 30px,
 * the height of the subtle button it derives from.
 */
export const menuTriggerClass = subtleButtonClass.replace(" text-xs ", " text-[11px] leading-4 ");

/**
 * The menu: `z-50` (§6: every overlay portalled to `<body>` to escape a scroll
 * container). It scrolls within the height Base UI's positioner measures, as the
 * popover panel does, because a long list of 44px rows can outgrow a phone.
 */
export const menuClass =
  "z-50 max-h-(--available-height) overflow-y-auto rounded-md border border-grid-strong bg-paper p-1 shadow-lg outline-none";

/**
 * One item. Base UI moves a roving highlight with the arrow keys and sets
 * `data-highlighted` on the item under it, so the fill follows the keyboard as
 * well as the pointer; the pair (ink on teal-soft) is in `TOKEN_PAIRS`.
 * `aria-disabled` items stay in the list, muted, so the current choice is
 * still read out.
 *
 * 44px below `md` by padding (20px of text, 12px either side), and not by
 * `touchRow`: centring in a taller row would take `flex`, which collapses the
 * space between mixed children, so "Move to <strong>Done</strong>" would read "Move toDone".
 */
export const menuItemClass =
  `block w-full rounded px-2 py-3 text-left text-sm text-ink md:py-1 data-highlighted:bg-teal-soft aria-disabled:text-ink-muted ${focusRing}`;

/**
 * The disclosure's header row: one full-width button inside the heading, with
 * the 44px touch floor below `md` (§8 "Disclosure").
 */
export const disclosureButtonClass =
  `flex min-h-11 w-full items-center gap-2 rounded-md text-left md:min-h-0 ${focusRing}`;

/**
 * Collapsed rows: a class, never the `hidden` attribute. Tailwind's preflight
 * makes `[hidden]` `display: none !important`, which print could never
 * override, and the Summary handout must print every row.
 */
export const disclosureCollapsedClass = "hidden print:block";

/*
 * Phase 2 (plan of 20 October 2026): the styled natives and the table frame,
 * server-safe, and the three components on Base UI's Tooltip, Tabs and
 * Combobox (ADR 0002). §8's "Checkbox and radio", "Table frame", "Tooltip",
 * "Tabs" and "Combobox" blocks show these strings under these names, held by
 * the doc test.
 */

/**
 * The row a checkbox or radio sits in: a `<label>` wrapping the native input
 * and its text, so the whole row is the click target and the text is the
 * control's name (§8, the same rule as `labelClass`). The row takes the 44px
 * touch floor below `md`, because the 16px box alone is far under it, and
 * mutes itself when its input is disabled (`has-disabled:`), so the state
 * follows the attribute as `fieldClass`'s does.
 */
export const choiceLabelClass =
  "flex min-h-11 items-center gap-2 text-sm text-ink md:min-h-0 has-disabled:cursor-not-allowed has-disabled:text-ink-muted";

/**
 * The native checkbox or radio itself: 16px, its checked fill the action
 * colour through `accent-color` (a token, never a palette class), and the
 * focus ring every control carries. The browser draws the box and the mark;
 * the system draws nothing over it, so a forced-colours user still gets the
 * platform control.
 */
export const choiceInputClass = `size-4 shrink-0 accent-teal-deep disabled:cursor-not-allowed ${focusRing}`;

/** The radio group's frame: a `<fieldset>` with the browser's border and padding removed. */
export const choiceGroupClass = "m-0 flex min-w-0 flex-col gap-1 border-0 p-0";

/** The group's `<legend>`: `labelClass`'s type, so a group reads like a field's label. */
export const choiceLegendClass = "mb-1 p-0 text-xs font-medium text-ink";

/**
 * The table frame (§8 "Table frame"; Work OS's `TableFrame`, eight sites):
 * `relative` and not `contain: paint`, which made 3,031px of phantom scroll and
 * would trap the fixed popovers (#165); bordered in `grid`, and unbounded in
 * print so the paper gets every row.
 */
export const tableFrameClass =
  "relative overflow-auto rounded-md border border-grid print:max-h-none print:overflow-visible";

/** A stacked frame drops its bound below `md`, where the rows are cards and the page scrolls. */
export const tableFrameStackedClass = "max-md:max-h-none";

/** A fixed-layout table's frame hugs the table and never outgrows its container. */
export const tableFrameFixedClass = "w-fit max-w-full";

export const tableClass = "border-collapse text-left text-sm";

/**
 * The sticky header, only inside a bounded frame (#58: a frame 3,961px tall
 * never scrolled, so its header never stuck). **No z-index here:** as a
 * descendant selector this out-specifies a utility, and a `z-10` in it beat
 * the grid's `z-20` frozen headers — measured, they computed to 10 (§6). The
 * header cells carry their own `z-10` in `thClass`, which a frozen cell's
 * `z-20` can override.
 */
export const tableStickyHeadClass = "[&_thead_th]:sticky [&_thead_th]:top-0";

/**
 * Below `md` a stacked table becomes cards: the head is hidden, each row is a
 * bordered block, and each cell shows its column's name from `data-label`
 * before its value. Changing `display` drops the table roles, which is why
 * every frame names its table with `aria-label` rather than a `<caption>`.
 */
export const tableStackedClass =
  "max-md:block max-md:min-w-0 [&_thead]:max-md:hidden [&_tbody]:max-md:block [&_tbody]:max-md:divide-y-0 [&_tbody_tr]:max-md:mb-2 [&_tbody_tr]:max-md:block [&_tbody_tr]:max-md:rounded-md [&_tbody_tr]:max-md:border [&_tbody_tr]:max-md:border-grid-strong [&_tbody_td]:max-md:flex [&_tbody_td]:max-md:items-baseline [&_tbody_td]:max-md:justify-between [&_tbody_td]:max-md:gap-3 [&_tbody_td]:max-md:before:text-xs [&_tbody_td]:max-md:before:font-medium [&_tbody_td]:max-md:before:text-ink-muted [&_tbody_td]:max-md:before:content-[attr(data-label)]";

/** The bound the spreadsheet grids and long tables use: the viewport less the page chrome. */
export const gridHeightClass = "max-h-[calc(100vh-15rem)]";

/** The header row: navy furniture, small uppercase paper type (§4: white on navy, held at AA). */
export const theadClass = "bg-navy text-xs uppercase tracking-wide text-paper";

/**
 * A header cell. `bg-navy` again because a sticky cell must be opaque over the
 * rows scrolling under it; `z-10` so it stays above the body (§6 layering).
 */
export const thClass = "z-10 bg-navy px-3 py-2 font-semibold whitespace-nowrap";

export const tbodyClass = "divide-y divide-grid";

export const tdClass = "px-3 py-2";

/** The sheet skin's row: flat white, no zebra (§8: gridlines and stripes never mixed). */
export const sheetRowClass = "bg-paper hover:bg-row-hover";

/** The sheet skin's cell: every cell boxed, half the vertical padding. */
export const sheetTdClass = "border-r border-grid px-3 py-1 last:border-r-0";

/**
 * A tooltip: paper on navy, 12px, at `z-50` above every other layer (§6),
 * `max-w-64` so a long hint wraps rather than running off the page. It is a
 * supplement to a name, never the name (§2 principle 9).
 */
export const tooltipClass = "z-50 max-w-64 rounded bg-navy px-2 py-1 text-xs text-paper shadow-lg";

/** The tab row: tabs side by side over a `grid-strong` rule. */
export const tabListClass = "flex gap-1 border-b border-grid-strong";

/**
 * One tab. The active tab is marked by **weight and a bar** — semibold, and a
 * 2px `teal-deep` bar along its foot drawn by `after:` so it adds no border —
 * as the active nav item is, never by colour alone (§2 principle 2). Base UI
 * sets `data-active` on it and `aria-disabled` on a disabled one, which stays
 * focusable and is muted. The 44px floor below `md`, as every control.
 */
export const tabClass =
  `${touchTarget} relative -mb-px rounded-t-md px-3 py-1.5 text-sm text-ink hover:bg-teal-soft data-active:font-semibold data-active:after:absolute data-active:after:inset-x-0 data-active:after:bottom-0 data-active:after:h-0.5 data-active:after:rounded-full data-active:after:bg-teal-deep aria-disabled:cursor-not-allowed aria-disabled:text-ink-muted aria-disabled:hover:bg-transparent ${focusRing}`;

/** A tab's panel: room under the row, and the ring when the panel itself takes focus. */
export const tabPanelClass = `pt-3 ${focusRing}`;

/**
 * The combobox's list, portalled and positioned below its input: the cell
 * popovers' `z-50` (§6), at least as wide as the input and never under
 * 14rem (Work OS's 224px), scrolling past 16rem.
 */
export const comboboxPopupClass =
  "z-50 max-h-64 w-(--anchor-width) min-w-56 overflow-y-auto rounded-md border border-grid-strong bg-paper p-1 shadow-lg outline-none";

/**
 * One option. The highlight follows the keyboard (`data-highlighted`, ink on
 * teal-soft, as the menu's); the chosen option carries a tick as well as
 * `aria-selected`, so it is a shape, not a colour.
 */
export const comboboxOptionClass =
  `flex ${touchRow} cursor-pointer items-center justify-between gap-2 rounded px-2 py-1 text-sm text-ink data-highlighted:bg-teal-soft data-disabled:cursor-not-allowed data-disabled:text-ink-muted`;

/** The tick on the chosen option. */
export const comboboxTickClass = "text-teal-deep";

/** The "No matches." line; Base UI keeps the element mounted, so it hides itself when empty. */
export const comboboxEmptyClass = "px-2 py-1 text-xs text-ink-muted empty:hidden";

/*
 * The app shell (§7; #19, #23): the skip link and the navy rail, drawn from
 * Work OS's `app-sidebar.tsx` and rendered by the package's `SkipLink`,
 * `Rail`, `RailBrand`, `NavGroup`, `NavLink` and `NavButton`. §7's
 * "classes:nav" block shows these strings under these names, held by the doc
 * test.
 *
 * Collapse is CSS, not a prop on every item: `Rail` sets `data-collapsed` on
 * the `<aside>`, which is the named group `group/rail`, and each item's
 * `group-data-collapsed/rail:` classes read it. A `group-*` variant wraps its
 * selector in `:is()`, which is one attribute more specific than a bare
 * breakpoint, so the collapsed form beats the `lg:` one it overrides without
 * an `!important`. That keeps every part server-safe: nothing needs a context
 * or a hook to know how wide the rail is.
 *
 * **No Preflight needed.** The Digital Library runs without Tailwind's
 * Preflight (#33), so every string here resets what it relies on itself:
 * `box-border` where a size meets padding, `m-0 list-none p-0` on the
 * lists, the `<hr>`'s inset border and margins, the heading's margin, the
 * link's underline, and the button's border, fill, padding and font. Held
 * by `navigation.test.tsx`.
 */

/**
 * The skip link (§10, 2.4.1): first in the DOM, `sr-only` until focused, then
 * fixed at the top left above everything (`z-50`, §6), 44px tall.
 *
 * It carries `focusRing`, the teal one, and stands on a 6px `paper` box-shadow
 * so the ring is always teal-deep on paper (5.19:1) whatever is behind the
 * link: it lands over the navy rail, where teal-deep alone is 2.61:1 and
 * would fail 1.4.11. Forced colours drop the shadow and keep the outline,
 * which the browser repaints in a system colour.
 *
 * **The reveal is spelled out under `focus:`, not `focus:not-sr-only`.**
 * `sr-only` and `not-sr-only` each set `padding: 0` among their eight
 * properties, so beside a `px-3 py-2` the stylesheet's order decided the
 * padding, and it decided against it: measured in the built site, the
 * focused link computed `padding: 0px`. Every property `sr-only` sets is
 * now undone by a `focus:` utility of its own (`clip-path`, width, height,
 * margin, overflow, position) and the padding is `focus:` too, so each
 * property has one utility per variant and the order cannot matter. The
 * text stays `nowrap`, which `sr-only` sets and the link wants anyway.
 * `class-strings.test.ts` now counts `sr-only` as padding, so the clash
 * cannot come back unseen.
 */
export const skipLinkClass =
  `sr-only z-50 box-border rounded-md bg-paper text-sm font-semibold text-ink no-underline focus:fixed focus:left-2 focus:top-2 focus:m-0 focus:inline-flex focus:h-auto focus:min-h-11 focus:w-auto focus:items-center focus:overflow-visible focus:px-3 focus:py-2 focus:[clip-path:none] focus:shadow-[0_0_0_6px_var(--color-paper)] ${focusRing}`;

/**
 * The rail: navy, sticky, the full height of the viewport, gone in print.
 * `h-dvh`, not `h-screen`: on iOS Safari `100vh` is taller than the visible
 * area, and the foot (Sign out) would sit under the toolbar — the drawer's
 * scrim uses `dvh` for the same reason. 224px from `lg`, 56px below it or
 * when collapsed (`data-collapsed` on this element; the attribute selector
 * outranks the breakpoint).
 */
export const railClass =
  "group/rail sticky top-0 flex h-dvh w-14 shrink-0 flex-col bg-navy print:hidden lg:w-56 data-collapsed:w-14";

/** The brand row: stacked while the rail is narrow, a row when it is wide (Work OS #143). */
export const railHeaderClass =
  "flex flex-col items-center justify-center gap-1 px-1 py-3 lg:flex-row lg:gap-2 lg:px-3 lg:group-data-collapsed/rail:flex-col lg:group-data-collapsed/rail:gap-1 lg:group-data-collapsed/rail:px-1";

/** The `<nav>`: the groups scroll, the foot stays at the bottom. */
export const railNavClass = "flex min-h-0 flex-1 flex-col";

/**
 * The scrolling list of groups. `px-1` while narrow, so a 44px target fits
 * the 56px rail (Work OS #63) at every width below `lg` and when collapsed.
 * There the scrollbar is hidden: a classic one would take 8 to 15px of the
 * 48px and push the targets under 44. The list still scrolls — by wheel, by
 * touch, and by keyboard, since Tab scrolls each link into view as it takes
 * focus. The wide rail keeps its scrollbar.
 */
export const railGroupsClass =
  "min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-1 pb-2 max-lg:[scrollbar-width:none] max-lg:[&::-webkit-scrollbar]:hidden lg:px-2 lg:group-data-collapsed/rail:px-1 group-data-collapsed/rail:[scrollbar-width:none] group-data-collapsed/rail:[&::-webkit-scrollbar]:hidden";

/** The foot: Guide, the person, Sign out. A `paper/15` rule above it, decorative. */
export const railFootClass =
  "flex flex-col gap-0.5 border-t border-paper/15 px-1 py-2 lg:px-2 lg:group-data-collapsed/rail:px-1";

/**
 * A label hidden while the rail is narrow: `sr-only`, never `hidden`, so it
 * stays the accessible name of an icon-only item (§7).
 */
export const railLabelClass = "max-lg:sr-only group-data-collapsed/rail:sr-only";

/** The brand link: the mark, and the name beside it while the rail is wide. 44px at every width. */
export const railBrandClass =
  `box-border flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md text-paper no-underline lg:flex-1 lg:justify-start lg:group-data-collapsed/rail:flex-none lg:group-data-collapsed/rail:justify-center ${focusRingOnNavy}`;

/** The brand's name: white, semibold, truncated rather than wrapped. */
export const railBrandNameClass = "truncate text-sm font-semibold tracking-wide text-paper";

/** One group: a heading over a list, 16px under it. */
export const navGroupClass = "mb-4";

/**
 * A group's heading: 11px uppercase `paper/50` (4.59:1, the tightest pair the
 * rail has). Visually hidden while the rail is narrow, and still the list's
 * name, so a screen reader hears the group at every width.
 */
export const navHeadingClass =
  "m-0 px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-paper/50";

/**
 * The rule that stands in for a heading on the narrow rail. Decorative. An
 * `<hr>`, so it sets its own margins, height and a 1px solid top border
 * rather than the browser's inset one.
 */
export const navDividerClass =
  "mx-2 mt-0 mb-2 h-0 border-x-0 border-t border-b-0 border-solid border-paper/15 lg:hidden lg:group-data-collapsed/rail:block";

/** A list of rail items: no bullets, margin or indent of the browser's. */
export const navListClass = "m-0 flex list-none flex-col gap-0.5 p-0";

/**
 * Every rail item, link or button: 44px tall at every width, and 44px wide
 * when it is only an icon, which the 56px rail's `px-1` leaves room for. This
 * is the one place the rail departs from Work OS, whose items release the
 * floor at `md` like `touchTarget` does: the narrow rail is still a column
 * of bare icons from `md` to `lg`, so the floor stays. Centred while narrow,
 * a row with its label from `lg`.
 */
export const navItemClass =
  `relative box-border flex min-h-11 min-w-11 items-center justify-center gap-3 rounded-md px-0 py-2 text-sm no-underline lg:justify-start lg:px-3 lg:group-data-collapsed/rail:justify-center lg:group-data-collapsed/rail:px-0 ${focusRingOnNavy}`;

/** An item that is not the current page: `paper/75`, lifted on hover. */
export const navItemIdleClass = "font-medium text-paper/75 hover:bg-paper/10 hover:text-paper";

/**
 * The current page: weight and a 2px left bar as well as the tint, so it
 * survives a monochrome view (§2 principle 2). Forced colours paint over
 * backgrounds, the tint and the bar's included, so the bar opts out
 * (`forced-color-adjust-none`) and takes the system's text colour; the
 * semibold weight needs no help.
 */
export const navItemCurrentClass =
  "bg-paper/12 font-semibold text-paper before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:rounded-full before:bg-paper before:forced-color-adjust-none forced-colors:before:bg-[CanvasText]";

/**
 * What a `<button>` needs to look like a rail link: the full width, a
 * pointer, left-aligned text, and — for an app without Preflight — no
 * border, fill, margin or native appearance, and the page's typeface.
 */
export const navButtonClass =
  "m-0 w-full cursor-pointer appearance-none border-0 bg-transparent text-left [font-family:inherit] disabled:cursor-not-allowed disabled:opacity-50";

/*
 * Navigation by links (§8; #20, #22): `Pagination`, `PrevNextNav`, `ViewSwitch`
 * and `BackLink`. A `<nav>` holding a list of items, each one a link, the
 * current place, or an unavailable end. Nothing here is a button, and
 * nothing moves: no transition, no animation.
 */

/** The list inside the `<nav>`: a row that wraps rather than overflows a phone, with the list resets spelled out so it needs no Preflight. */
export const linkNavListClass = "m-0 flex list-none flex-wrap items-center gap-1 p-0";

/**
 * What every item shares, link or not, so the row has one rhythm: `touchTarget`'s
 * 44px floor below `md`, the rounded box, 14px type.
 */
export const linkNavItemClass =
  `${touchTarget} relative inline-flex items-center justify-center gap-1 rounded-md px-3 py-1.5 text-sm`;

/** A link to somewhere else (`no-underline`, so a consumer without Preflight gets no browser underline): `teal-deep`, the tint and `navy` on hover, the package's focus ring. */
export const linkNavLinkClass =
  `${linkNavItemClass} no-underline text-teal-deep hover:bg-teal-soft hover:text-navy ${focusRing}`;

/**
 * Where you are: semibold, `ink`, and a 2px bar along the foot, so it is not
 * marked by colour alone (§2 principle 2). The bar opts out of forced colours'
 * repaint (`forced-color-adjust-none`) and takes `CanvasText`, as the rail's
 * does, so Windows High Contrast still shows it; the weight needs no help.
 * It follows `linkNavItemClass` on a `<span>` (`PrevNextNav`), or
 * `linkNavLinkClass` on a link (`ViewSwitch`, which keeps the current view a
 * link).
 */
export const linkNavCurrentClass =
  "font-semibold text-ink after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-teal-deep after:forced-color-adjust-none forced-colors:after:bg-[CanvasText]";

/**
 * An end with nowhere to go (Previous on page 1): `ink-muted` and a
 * not-allowed cursor, with no hover. A `<span>`, so it has no `href` and no
 * tab stop.
 */
export const linkNavUnavailableClass = "cursor-not-allowed text-ink-muted";

/**
 * A label that gives way to its icon below `sm` and stays the accessible
 * name: `sr-only`, never `hidden`.
 */
export const linkNavLabelClass = "max-sm:sr-only";

/**
 * The back link: an arrow and a teal label, 44px below `md`. `BackLink`
 * underlines the label alone, so the line does not run under the arrow.
 */
export const backLinkClass =
  `${touchTarget} inline-flex items-center gap-1 rounded-md text-sm no-underline text-teal-deep hover:text-navy ${focusRing}`;
