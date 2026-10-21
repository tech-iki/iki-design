/**
 * §4's semantic-maps table, read as label → tone (#17). The maps are Work
 * OS's; the site writes its `STATUS_PILL` example from the document's row so
 * the example cannot show a mapping the system does not.
 */
import type { ToneName } from "@tech-iki/design";

/*
 * How the table names each tone, and the package's name for it. An entry the
 * document writes some other way throws.
 */
const DOC_TONE: Record<string, ToneName> = {
  NEUTRAL: "neutral",
  POSITIVE: "positive",
  "NEUTRAL + `line-through`": "cancelled",
  "`bg-teal-soft text-navy`": "completed",
  info: "info",
  warm: "warm",
  overdue: "overdue",
  stale: "stale",
  "priority-low": "low",
};

/**
 * One map's entries, `Overdue → overdue; On Hold, Cancelled → NEUTRAL`, as
 * `[label, tone]` pairs in the document's order, a grouped entry giving one
 * pair per label.
 */
export function pillMapEntries(
  maps: readonly (readonly [string, string])[],
  name: string,
): [label: string, tone: ToneName][] {
  const row = maps.find(([map]) => map === `\`${name}\``);
  if (!row) throw new Error(`§4 has no \`${name}\` row`);
  return row[1].split("; ").flatMap((entry) => {
    const [labels, docTone, extra] = entry.split(" → ");
    const tone = DOC_TONE[docTone];
    if (!labels || !tone || extra !== undefined) {
      throw new Error(`§4 ${name} entry "${entry}" names no known tone`);
    }
    return labels.split(", ").map((label) => [label, tone] as [string, ToneName]);
  });
}
