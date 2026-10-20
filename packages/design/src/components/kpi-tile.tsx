import type { ComponentPropsWithoutRef } from "react";

import type { ToneName } from "../tones.js";

/**
 * The tones a tile's figure may take: the neutral navy, the warm "due soon"
 * and the overdue red. A subset of `ToneName`, so the tile and the pill beside
 * it share one vocabulary — until 0.3.0 the tile had its own (`warn`, `bad`),
 * which the 20 October 2026 audit named as a second tone vocabulary.
 */
export type KpiTone = Extract<ToneName, "neutral" | "warm" | "overdue">;

const VALUE_CLASS: Readonly<Record<KpiTone, string>> = {
  neutral: "text-navy",
  warm: "text-warm-fg",
  overdue: "text-health-overdue-fg",
};

/**
 * A workbook-style KPI tile (F13): a teal label bar above a big number on a
 * light-teal body, mirroring the Dashboard sheet's summary cells (ADR 0003).
 * Replaces the two duplicated KPI card implementations. `...rest` reaches the
 * frame, so an `aria-describedby` or a `data-` attribute passes through.
 */
export function KpiTile({
  label,
  value,
  hint,
  tone = "neutral",
  className,
  ...rest
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: KpiTone;
} & ComponentPropsWithoutRef<"div">) {
  const frame = "flex flex-col overflow-hidden rounded-md border border-grid";

  /*
   * A flex column so the body can fill the tile (Work OS #145). The grid stretches
   * every tile to its row's tallest sibling, but the teal body was sized by
   * its own content — a tile with no hint line left an unpainted strip inside
   * its own border. No `h-full` here: `align-items: stretch` is what gives the
   * tile its height, and a height override would quietly defeat a caller that
   * ever chose `items-start` (Work OS #146 review).
   */
  return (
    <div className={className ? `${frame} ${className}` : frame} {...rest}>
      <p className="bg-teal-deep px-3 py-1.5 text-center text-xs font-semibold uppercase tracking-wide text-paper">
        {label}
      </p>
      <div className="flex-1 bg-teal-soft px-3 py-4 text-center">
        <p className={`text-3xl font-semibold tabular-nums ${VALUE_CLASS[tone]}`}>
          {value}
        </p>
        {hint ? <p className="mt-1 text-xs text-ink-muted">{hint}</p> : null}
      </div>
    </div>
  );
}
