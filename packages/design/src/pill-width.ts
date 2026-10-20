/**
 * How wide a pill is, so a column can be made to fit it (Work OS #261).
 *
 * A pill is always one line (`whitespace-nowrap` on `Pill`), so it can no longer
 * shrink to fit its cell: a column narrower than its widest label clips it (the
 * task grid's row clamp is `overflow-hidden`) or lets it spill over the next
 * column (the printed report). Before this, the grid's Status column was 3px
 * narrower than "Awaiting Input" and Priority 1px narrower than "Medium", and
 * the printed report let "Awaiting Input" run 30px into Next action — all
 * measured.
 *
 * Declared widths cannot be trusted to keep up, because the labels change and
 * nobody re-measures. So the pill columns derive their floor from the labels
 * themselves: a new status that is wider than the old ones widens its column
 * the moment it is added to the vocabulary.
 *
 * ## Why a table of advances, not a measurement
 *
 * The widths are needed where there is no browser — the column registry is read
 * on the server to render the grid at its final shape, and by the tests. So the
 * width is computed from Geist's advance widths at the pill's size and weight
 * (12px, 500), measured once in Chromium with `CanvasRenderingContext2D
 * .measureText` against the same Geist the app self-hosts through `next/font`.
 *
 * Summing per-character advances ignores kerning, which only ever tightens a
 * pair — so the sum is an **upper bound**. Checked against the rendered width of
 * every label the app puts in a pill (25 of them): the sum was high by 0.2px to
 * 2.4px and never low. Erring wide is the right direction: a column a pixel or
 * two too generous costs nothing, and one a pixel too narrow clips the pill.
 * A character outside this table counts as the widest one in it, for the same
 * reason.
 */

/** Geist 500 at 12px, advance width in CSS px, printable ASCII. */
const ADVANCE: Readonly<Record<string, number>> = {
  " ": 2.914, "!": 2.734, '"': 4.33, "#": 6.18, $: 7.711, "%": 9.718, "&": 7.783,
  "'": 2.237, "(": 3.482, ")": 3.482, "*": 5.126, "+": 6.744, ",": 2.554,
  "-": 5.021, ".": 2.554, "/": 5.928,
  "0": 8.076, "1": 4.867, "2": 7.565, "3": 7.502, "4": 7.546, "5": 7.692,
  "6": 7.25, "7": 6.37, "8": 7.488, "9": 7.267,
  ":": 3.619, ";": 3.619, "<": 6.552, "=": 6.528, ">": 6.552, "?": 6.838,
  "@": 11.098,
  A: 8.263, B: 8.251, C: 8.561, D: 8.414, E: 7.31, F: 7.138, G: 8.554,
  H: 8.59, I: 3.36, J: 7.284, K: 7.874, L: 6.996, M: 10.675, N: 8.945,
  O: 9.014, P: 7.886, Q: 8.94, R: 8.165, S: 7.846, T: 6.814, U: 8.326,
  V: 8.256, W: 11.618, X: 7.598, Y: 7.133, Z: 6.727,
  "[": 4.334, "\\": 5.642, "]": 4.334, "^": 5.254, _: 6.701, "`": 3.096,
  a: 6.785, b: 7.296, c: 6.758, d: 7.296, e: 6.91, f: 4.946, g: 7.286,
  h: 7.092, i: 3.077, j: 3.406, k: 7.308, l: 3.386, m: 10.615, n: 7.092,
  o: 7.056, p: 7.296, q: 7.296, r: 4.73, s: 6.439, t: 4.915, u: 7.03,
  v: 6.722, w: 9.948, x: 7.279, y: 6.641, z: 6.626,
  "{": 4.742, "|": 3.288, "}": 4.742, "~": 6.276,
};

const WIDEST = Math.max(...Object.values(ADVANCE));

/** `px-2` either side of the label — `Pill`'s own padding. */
const PILL_PADDING = 16;

/** A label's summed advances at the table's 12px/500 — the one loop both measures share. */
function advanceSum(label: string): number {
  let text = 0;
  for (const ch of label) text += ADVANCE[ch] ?? WIDEST;
  return text;
}

/** The rendered width of one pill, rounded up to a whole pixel. */
export function pillWidth(label: string): number {
  return Math.ceil(advanceSum(label) + PILL_PADDING);
}

/** The widest pill a vocabulary can produce. */
export function widestPill(labels: readonly string[]): number {
  return Math.max(0, ...labels.map(pillWidth));
}

/**
 * The width of a label set as plain grid text, not a pill (Work OS #265 staging).
 *
 * The policy grid's Status is unpilled `text-sm` — 14px at weight 400 — and was
 * sized with `widestPill`, a 12px measure: on staging "Implementation &
 * Communication" rendered 216px into a 209px box and lost its last letters to
 * the row clamp. The table above is Geist 500 at 12px; scaling it to the font
 * size keeps it an upper bound, because 500 is wider than 400 and kerning
 * only tightens (measured: 226px computed, 216px rendered).
 */
export function textWidth(label: string, fontSizePx: number): number {
  return Math.ceil((advanceSum(label) * fontSizePx) / 12);
}

/** The widest plain-text label a vocabulary can produce, at a font size. */
export function widestText(labels: readonly string[], fontSizePx: number): number {
  return Math.max(0, ...labels.map((label) => textWidth(label, fontSizePx)));
}
