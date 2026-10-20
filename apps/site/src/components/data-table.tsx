import type { ReactNode } from "react";
import { focusRing } from "@tech-iki/design";

export type Column = {
  header: string;
  /** Right-aligned with tabular figures. */
  numeric?: boolean;
};

/**
 * The system's table, as §8 draws it: a navy header row in small uppercase,
 * `divide-y divide-grid` between rows, zebra from the row index (never
 * `:nth-child`, which inverted banding under injected rows), all inside a
 * `rounded-md` bordered frame that scrolls on its own so a wide table never
 * makes the page scroll sideways.
 *
 * `scrollable` is the caller's statement that the table can overflow its frame
 * at 375px. Only then does the frame take a tab stop and the focus ring, so a
 * keyboard user can scroll it (WCAG 2.1.1, design-system §10); a frame that
 * cannot overflow is not a tab stop.
 */
export function DataTable({
  label,
  columns,
  rows,
  scrollable = false,
}: {
  label: string;
  columns: Column[];
  rows: ReactNode[][];
  scrollable?: boolean;
}) {
  return (
    <div
      tabIndex={scrollable ? 0 : undefined}
      className={`overflow-auto rounded-md border border-grid ${
        scrollable ? focusRing : ""
      }`}
    >
      <table
        aria-label={label}
        className="w-full border-collapse text-left text-sm"
      >
        <thead className="bg-navy text-xs uppercase tracking-wide text-paper">
          <tr>
            {columns.map((c) => (
              <th
                key={c.header}
                scope="col"
                className={`px-3 py-2 font-semibold whitespace-nowrap ${
                  c.numeric ? "text-right" : ""
                }`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-grid">
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-paper" : "bg-paper-tint"}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-3 py-2 align-top ${
                    columns[j]?.numeric ? "text-right tabular-nums" : ""
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
