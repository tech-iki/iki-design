/**
 * A workbook-style KPI tile (F13): a teal label bar above a big number on a
 * light-teal body, mirroring the Dashboard sheet's summary cells (ADR 0003).
 * Replaces the two duplicated KPI card implementations.
 */
export function KpiTile({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "neutral" | "warn" | "bad";
}) {
  const valueClass =
    tone === "bad"
      ? "text-health-overdue-fg"
      : tone === "warn"
        ? "text-warm-fg"
        : "text-navy";

  /*
   * A flex column so the body can fill the tile (Work OS #145). The grid stretches
   * every tile to its row's tallest sibling, but the teal body was sized by
   * its own content — a tile with no hint line left an unpainted strip inside
   * its own border. No `h-full` here: `align-items: stretch` is what gives the
   * tile its height, and a height override would quietly defeat a caller that
   * ever chose `items-start` (Work OS #146 review).
   */
  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-grid">
      <p className="bg-teal-deep px-3 py-1.5 text-center text-xs font-semibold uppercase tracking-wide text-paper">
        {label}
      </p>
      <div className="flex-1 bg-teal-soft px-3 py-4 text-center">
        <p className={`text-3xl font-semibold tabular-nums ${valueClass}`}>
          {value}
        </p>
        {hint ? <p className="mt-1 text-xs text-ink-muted">{hint}</p> : null}
      </div>
    </div>
  );
}
