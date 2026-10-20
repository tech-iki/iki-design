import type { ComponentPropsWithRef, ComponentPropsWithoutRef, ReactNode } from "react";

import {
  focusRing,
  tableClass,
  tableFrameClass,
  tableFrameFixedClass,
  tableFrameStackedClass,
  tableStackedClass,
  tableStickyHeadClass,
  thClass,
} from "../ui-classes.js";

/**
 * The bounded scroll frame every table sits in (§8 "Table frame"; plan of 20
 * October 2026, phase 2; Work OS's `TableFrame`, eight sites, ported).
 * Server-safe, no Base UI: it is markup and class strings.
 *
 * - **The frame scrolls, the page does not.** A wide table scrolls sideways
 *   inside its `rounded-md` border; `maxHeightClass` (usually
 *   `gridHeightClass`) bounds it vertically too, and only then is the header
 *   sticky — a sticky header in an unbounded frame never sticks (#58). In
 *   print the bound and the overflow are dropped so the paper gets every row.
 * - **The sticky rule carries no z-index** (§6 Layering): it is a descendant
 *   selector on the table, which out-specifies a utility, and a `z-10` there
 *   beat the grid's `z-20` frozen headers. `thClass` gives each header cell
 *   its own `z-10`, which a frozen cell can still override.
 * - **The table is named by `caption`**, as `aria-label`, never a
 *   `<caption>`: a stacked table is no longer displayed as a table and a
 *   `<caption>` stops naming it.
 * - **`stacked`** turns rows into cards below `md`, each cell labelled from
 *   its `data-label`, and drops the frame's bound there. **`fixed`** is
 *   `table-fixed` with the frame hugging the table. `minWidthClass` is stated
 *   with `md:`, because below `md` a floor only forces a scrollbar.
 * - **`scrollableByKeyboard`** makes the frame a tab stop, named by the
 *   caption and drawn with the focus ring, for a table that can overflow and
 *   has no cursor of its own: Safari does not focus a scrollable region by
 *   itself (WCAG 2.1.1, §10).
 * - **Controls in cells keep the 44px floor below `md`**: a `Button`, an icon
 *   button, a `Checkbox` row each carry `touchTarget` themselves, so a cell
 *   needs no floor of its own and the desk keeps its density.
 *
 * `role="grid"` with `readOnly` is for the spreadsheet grid, which owns its
 * cursor (§8 "Grid cursor"). `...rest` reaches the frame `<div>` — `ref`,
 * `style`, `onScroll` — and `tableProps` the `<table>` (`style`,
 * `aria-describedby`). The rows inside use `theadClass`, `thClass`,
 * `tbodyClass`, `tdClass` and `rowClass`, or the sheet skin's
 * `sheetRowClass`/`sheetTdClass`, never both skins in one table.
 */
export function TableFrame({
  caption,
  maxHeightClass = "",
  minWidthClass = "",
  stacked = false,
  fixed = false,
  role = "table",
  readOnly,
  scrollableByKeyboard = false,
  tableProps,
  className,
  children,
  ...rest
}: {
  /** The table's accessible name. Every frame passes one. */
  caption: string;
  /** Bounds the frame, which makes the header sticky: usually `gridHeightClass`. */
  maxHeightClass?: string;
  /** A width floor, stated with `md:` (`md:min-w-3xl`). */
  minWidthClass?: string;
  stacked?: boolean;
  fixed?: boolean;
  role?: "table" | "grid";
  /** `aria-readonly` on a `role="grid"` table. */
  readOnly?: boolean;
  scrollableByKeyboard?: boolean;
  /** Reaches the `<table>`: `style`, `aria-describedby`, `id`. */
  tableProps?: Omit<ComponentPropsWithoutRef<"table">, "children" | "role" | "aria-label">;
  /** Appended to the frame's own class string. */
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithRef<"div">, "children" | "className" | "role">) {
  const { className: tableClassName, ...tableRest } = tableProps ?? {};
  const frame = [
    tableFrameClass,
    maxHeightClass,
    stacked && maxHeightClass ? tableFrameStackedClass : "",
    fixed ? tableFrameFixedClass : "",
    scrollableByKeyboard ? focusRing : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  const table = [
    tableClass,
    maxHeightClass ? tableStickyHeadClass : "",
    stacked ? tableStackedClass : "",
    fixed ? "table-fixed" : "w-full",
    minWidthClass,
    tableClassName ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      {...rest}
      className={frame}
      tabIndex={scrollableByKeyboard ? 0 : rest.tabIndex}
      aria-label={scrollableByKeyboard ? caption : rest["aria-label"]}
      role={scrollableByKeyboard ? "region" : undefined}
    >
      <table
        {...tableRest}
        role={role}
        aria-label={caption}
        aria-readonly={role === "grid" ? readOnly : undefined}
        className={table}
      >
        {children}
      </table>
    </div>
  );
}

/**
 * A row's classes in the striped skin: zebra from the **data index**, never
 * `:nth-child` (an injected history row inverted the banding of 53 rows
 * below it), and the row-hover tint. A row with a state tint (the import
 * grid's errored row) keeps it and darkens on hover instead.
 */
export function rowClass(index: number, state?: string): string {
  return state
    ? `${state} hover:brightness-95`
    : `${index % 2 === 1 ? "bg-paper-tint" : "bg-paper"} hover:bg-row-hover`;
}

/** The header of an unlabelled actions column: a header cell whose name is for assistive technology only. */
export function ActionsHeader({
  label = "Actions",
  className,
  ...rest
}: { label?: string } & Omit<ComponentPropsWithoutRef<"th">, "children">) {
  return (
    <th scope="col" {...rest} className={className ? `${thClass} ${className}` : thClass}>
      <span className="sr-only">{label}</span>
    </th>
  );
}
