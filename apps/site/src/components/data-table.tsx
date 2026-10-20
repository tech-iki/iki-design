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
 */
export function DataTable({
  label,
  columns,
  rows,
}: {
  label: string;
  columns: Column[];
  rows: ReactNode[][];
}) {
  return (
    <div
      tabIndex={0}
      className={`overflow-auto rounded-md border border-grid ${focusRing}`}
    >
      <table
        aria-label={label}
        className="w-full border-collapse text-left text-sm"
      >
        <thead className="bg-navy text-xs uppercase tracking-wide text-white">
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
