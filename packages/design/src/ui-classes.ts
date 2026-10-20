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
 * WCAG 2.5.8 wants 44×44px. The desktop classes were roughly 26px tall, which
 * is fine with a mouse and not with a thumb. Applied as a *responsive* minimum
 * so a phone gets the room and desktop keeps its density — sharing one size
 * would visibly loosen every grid control, which is the risk the issue names.
 *
 * `min-h`/`min-w` rather than fixed sizes, so a button with more in it than a
 * label still grows.
 */
export const touchTarget = "min-h-11 min-w-11 md:min-h-0 md:min-w-0";

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
 * No `focus:outline-none` on the fields (Work OS #315). Under Tailwind v4 it sets
 * `--tw-outline-style: none`, and `focusRing`'s `outline-2` draws its style
 * from that variable, so on keyboard focus — where `:focus` and
 * `:focus-visible` both match — the 2px ring resolved to no outline at all and
 * only the 1px border changed colour. The native ring needs no reset: the
 * browser draws it only on `:focus-visible`, which `focusRing` replaces.
 */
export const fieldClass =
  `${touchTarget} rounded-md border border-grid-strong px-3 py-2 text-sm text-ink focus:border-teal-deep ${focusRing}`;

export const smallFieldClass =
  `${touchTarget} rounded-md border border-grid-strong px-2 py-1.5 text-sm text-ink focus:border-teal-deep ${focusRing}`;

export const labelClass = "flex flex-col gap-1 text-xs font-medium text-ink";

/**
 * A field the last refusal named, drawn so it can be found by scrolling
 * (Work OS #161). Shared by every create/edit drawer's field-marking helper — the
 * tasks drawer's `TaskFields` and the policy drawer's `PolicyFields` (Work OS #265) —
 * so the two never quietly drift into two shades of "invalid".
 */
export const invalidFieldClass =
  `${fieldClass} border-health-overdue-fg bg-health-overdue-bg`;

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

/**
 * Destructive-but-reversible confirm (move-to-trash) — warm, not alarming.
 * The border was `warm-fg/40`, which composites to 1.92:1 on the warm fill —
 * a control boundary under the 3:1 bar just like `grid` was. `/70` clears it
 * at 3.49:1 while staying lighter than the label (Work OS #57).
 */
export const warnButtonClass =
  `${touchTarget} rounded-md border border-warm-fg/70 px-2.5 py-1.5 text-xs text-warm-fg hover:bg-warm-bg disabled:opacity-50 ${focusRing}`;

/** An inline text link inside body copy or a cell. */
export const linkClass =
  `text-teal-deep underline hover:text-navy rounded-xs ${focusRing}`;
