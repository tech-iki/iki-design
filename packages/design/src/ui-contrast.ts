/**
 * WCAG contrast arithmetic for the design tokens (Work OS #57, F24.1).
 *
 * ADR 0003 asserted the palette was "AA-safe throughout"; it was not — the
 * workbook teal is 4.11:1 on white and the grid border is 1.36:1, so every
 * primary button and every input boundary failed. The assertion is now
 * mechanical: `TOKEN_PAIRS` below lists every foreground/background pair the
 * app actually renders, and a test walks it. Adding a token without adding its
 * pair is the only way to reintroduce the class of bug.
 */

import { COLOUR } from "./tokens.js";

/** sRGB channel → linear light. */
function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Relative luminance of a `#rrggbb` colour (WCAG 2.2 definition). */
export function luminance(hex: string): number {
  const n = Number.parseInt(hex.slice(1), 16);
  return (
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255)
  );
}

/** Contrast ratio between two `#rrggbb` colours, 1–21. */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Flatten a translucent colour onto its backdrop — Tailwind's `border-x/40`
 * and friends. Contrast is computed against what the eye receives, not the
 * nominal token, and skipping this step is how `warm-fg/40` sat at 1.92:1
 * behind a border that looked like it used an AA-safe colour (Work OS #57).
 */
export function blend(fg: string, alpha: number, bg: string): string {
  const parts = (hex: string) => {
    const n = Number.parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const [f, b] = [parts(fg), parts(bg)];
  return `#${f
    .map((c, i) => Math.round(alpha * c + (1 - alpha) * b[i]))
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")}`;
}

/** `teal-deep` → `tealDeep`, as a type. */
type Camel<S extends string> = S extends `${infer Head}-${infer Tail}`
  ? `${Head}${Capitalize<Camel<Tail>>}`
  : S;

/** `teal-deep` → `tealDeep`. */
const camel = (name: string) =>
  name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());

/**
 * The token values, camel-cased so `TOKEN_PAIRS` reads `TOKENS.tealDeep`.
 *
 * In Work OS this was a hand-typed mirror of the `@theme` block, with a test to
 * catch the two drifting. Here it is derived from `COLOUR` in `tokens.ts`, so
 * there is one source and nothing to mirror: no hex literal appears in this
 * file.
 */
export const TOKENS = Object.fromEntries(
  Object.entries(COLOUR).map(([name, hex]) => [camel(name), hex]),
) as { readonly [N in keyof typeof COLOUR as Camel<N>]: (typeof COLOUR)[N] };

/**
 * `text` pairs must clear 4.5:1 (WCAG 1.4.3); `nonText` pairs — control
 * boundaries and meaningful graphics — must clear 3:1 (WCAG 1.4.11).
 */
export type ContrastKind = "text" | "nonText";

export const THRESHOLD: Record<ContrastKind, number> = {
  text: 4.5,
  nonText: 3,
};

export const TOKEN_PAIRS: {
  what: string;
  fg: string;
  bg: string;
  kind: ContrastKind;
}[] = [
  // App chrome
  { what: "header and table head: white on navy", fg: TOKENS.paper, bg: TOKENS.navy, kind: "text" },
  { what: "primary button: white on teal-deep", fg: TOKENS.paper, bg: TOKENS.tealDeep, kind: "text" },
  { what: "KPI label bar: white on teal-deep", fg: TOKENS.paper, bg: TOKENS.tealDeep, kind: "text" },
  { what: "link: teal-deep on paper", fg: TOKENS.tealDeep, bg: TOKENS.paper, kind: "text" },
  { what: "link: teal-deep on paper-tint", fg: TOKENS.tealDeep, bg: TOKENS.paperTint, kind: "text" },

  // Body text
  { what: "body: ink on paper", fg: TOKENS.ink, bg: TOKENS.paper, kind: "text" },
  { what: "body: ink on paper-tint", fg: TOKENS.ink, bg: TOKENS.paperTint, kind: "text" },
  { what: "secondary: ink-muted on paper", fg: TOKENS.inkMuted, bg: TOKENS.paper, kind: "text" },
  { what: "secondary: ink-muted on paper-tint", fg: TOKENS.inkMuted, bg: TOKENS.paperTint, kind: "text" },
  { what: "hovered link card: ink-muted on teal-soft", fg: TOKENS.inkMuted, bg: TOKENS.tealSoft, kind: "text" },
  { what: "workstream code: navy on teal-soft", fg: TOKENS.navy, bg: TOKENS.tealSoft, kind: "text" },
  { what: "page description: ink on sky", fg: TOKENS.ink, bg: TOKENS.sky, kind: "text" },
  // The grouped grid's header band (Work OS #62): the label is navy on the sky fill,
  // and its count sits in a paper pill.
  { what: "group header: navy on sky", fg: TOKENS.navy, bg: TOKENS.sky, kind: "text" },

  /*
   * The hovered grid row (Work OS #69).
   *
   * `ink-muted` is the binding text constraint — it is the colour of seven of
   * the grid's columns, and it is what rules out `sky` (4.47:1) and `grid`
   * (4.02:1) as row-hover tints.
   *
   * `teal-deep` is deliberately a **nonText** pair here, and it is the reason
   * this tint is as deep as it can get. On `row-hover` it is 4.49:1 — just under
   * AA for text. That is sound because no *link text* is ever rendered inside a
   * row: every `linkClass` in the app sits in prose or an empty state, outside
   * the table (checked in Work OS, and asserted by its test suite). Inside a row `teal-deep` appears
   * only as a graphical indicator — the hovered cell's ring, and the evidence
   * link's `↗`, whose accessible name is separate `sr-only` text — so 3:1 is the
   * applicable threshold and it clears it comfortably.
   *
   * If a row ever gains real link text, this tint must get lighter: there is no
   * colour that keeps `teal-deep` at 4.5:1 *and* stays more visible than the
   * zebra striping, because the striping already spends most of the 1.15:1 of
   * headroom `teal-deep` has above the AA floor.
   */
  { what: "hovered row: ink on row-hover", fg: TOKENS.ink, bg: TOKENS.rowHover, kind: "text" },
  { what: "hovered row: ink-muted on row-hover", fg: TOKENS.inkMuted, bg: TOKENS.rowHover, kind: "text" },
  { what: "hovered row: navy on row-hover", fg: TOKENS.navy, bg: TOKENS.rowHover, kind: "text" },
  { what: "hovered row: teal-deep indicator on row-hover", fg: TOKENS.tealDeep, bg: TOKENS.rowHover, kind: "nonText" },
  { what: "hovered cell ring: teal-deep on row-hover", fg: TOKENS.tealDeep, bg: TOKENS.rowHover, kind: "nonText" },
  { what: "hovered cell ring: teal-deep on teal-soft", fg: TOKENS.tealDeep, bg: TOKENS.tealSoft, kind: "nonText" },
  /*
   * The Days-to-Due column paints itself overdue-red or warm-orange
   * (`DUE_TONE_CLASS`), so both render on a hovered row too. Missing from the
   * first pass — and the omission is the exact failure mode the header of this
   * file warns about, since a token can only be trusted for the pairs listed
   * here (Work OS #69 review).
   */
  { what: "hovered row: overdue days-to-due on row-hover", fg: TOKENS.healthOverdueFg, bg: TOKENS.rowHover, kind: "text" },
  { what: "hovered row: due-soon days-to-due on row-hover", fg: TOKENS.warmFg, bg: TOKENS.rowHover, kind: "text" },

  /*
   * The import grid's errored rows. `teal-deep` here is genuine link text — the
   * "Create new person" control — not an indicator, so unlike the hovered row it
   * has to clear 4.5:1, and it does at 4.66:1.
   */
  { what: "errored import row: ink on row-error", fg: TOKENS.ink, bg: TOKENS.rowError, kind: "text" },
  { what: "errored import row: ink-muted on row-error", fg: TOKENS.inkMuted, bg: TOKENS.rowError, kind: "text" },
  { what: "errored import row: field error on row-error", fg: TOKENS.healthOverdueFg, bg: TOKENS.rowError, kind: "text" },
  { what: "errored import row: create-person link on row-error", fg: TOKENS.tealDeep, bg: TOKENS.rowError, kind: "text" },

  // Status, priority, health and import pills
  { what: "pill: overdue", fg: TOKENS.healthOverdueFg, bg: TOKENS.healthOverdueBg, kind: "text" },
  { what: "pill: on track", fg: TOKENS.healthOntrackFg, bg: TOKENS.healthOntrackBg, kind: "text" },
  { what: "pill: stale", fg: TOKENS.healthStaleFg, bg: TOKENS.healthStaleBg, kind: "text" },
  { what: "pill: warm / due soon", fg: TOKENS.warmFg, bg: TOKENS.warmBg, kind: "text" },
  { what: "pill: info", fg: TOKENS.infoFg, bg: TOKENS.infoBg, kind: "text" },
  { what: "pill: low priority", fg: TOKENS.priorityLowFg, bg: TOKENS.priorityLowBg, kind: "text" },
  { what: "pill: neutral (grid fill)", fg: TOKENS.ink, bg: TOKENS.grid, kind: "text" },
  { what: "pill: completed (teal-soft fill)", fg: TOKENS.navy, bg: TOKENS.tealSoft, kind: "text" },

  // The KPI tile's value, in each of its three tones, on the tile's teal-soft body.
  // The neutral tone is navy on teal-soft, asserted above. The tones were
  // `warn` and `bad` until 0.3.0 made them the pill tones' names. Found missing by the
  // 20 October 2026 audit (#6): the only component that rendered a pair this
  // list did not hold.
  { what: "KPI tile: warm value on teal-soft", fg: TOKENS.warmFg, bg: TOKENS.tealSoft, kind: "text" },
  { what: "KPI tile: overdue value on teal-soft", fg: TOKENS.healthOverdueFg, bg: TOKENS.tealSoft, kind: "text" },

  // The invalid field (`invalidFieldClass`, rendered by `Field` since 0.3.0):
  // what is typed sits on the overdue fill, the border is the overdue red on
  // it, and the error line beneath is the same red on the page.
  { what: "invalid field: ink on health-overdue-bg", fg: TOKENS.ink, bg: TOKENS.healthOverdueBg, kind: "text" },
  { what: "invalid field border: overdue-fg on health-overdue-bg", fg: TOKENS.healthOverdueFg, bg: TOKENS.healthOverdueBg, kind: "nonText" },
  { what: "field error line: overdue-fg on paper", fg: TOKENS.healthOverdueFg, bg: TOKENS.paper, kind: "text" },

  // The overlays (0.4.0, ADR 0002). The drawer's scrim (`bg-navy/25`) is
  // decorative and has no pair; everything with words in it is here.
  { what: "menu item highlighted, popover option hovered: ink on teal-soft", fg: TOKENS.ink, bg: TOKENS.tealSoft, kind: "text" },
  { what: "disabled menu item: ink-muted on paper", fg: TOKENS.inkMuted, bg: TOKENS.paper, kind: "text" },
  { what: "active popover trigger: ink on teal-soft", fg: TOKENS.ink, bg: TOKENS.tealSoft, kind: "text" },
  { what: "active popover trigger border: teal-deep on teal-soft", fg: TOKENS.tealDeep, bg: TOKENS.tealSoft, kind: "nonText" },
  { what: "popover badge: paper on teal-deep", fg: TOKENS.paper, bg: TOKENS.tealDeep, kind: "text" },
  { what: "drawer refusal band: overdue-fg on health-overdue-bg", fg: TOKENS.healthOverdueFg, bg: TOKENS.healthOverdueBg, kind: "text" },
  { what: "disclosure count: ink-muted on paper", fg: TOKENS.inkMuted, bg: TOKENS.paper, kind: "text" },

  // Control boundaries and meaningful graphics — 3:1
  { what: "input border on paper", fg: TOKENS.gridStrong, bg: TOKENS.paper, kind: "nonText" },
  { what: "input border on paper-tint", fg: TOKENS.gridStrong, bg: TOKENS.paperTint, kind: "nonText" },
  { what: "input border on teal-soft", fg: TOKENS.gridStrong, bg: TOKENS.tealSoft, kind: "nonText" },
  { what: "focus ring: teal-deep on paper", fg: TOKENS.tealDeep, bg: TOKENS.paper, kind: "nonText" },
  { what: "chart column: teal on paper", fg: TOKENS.teal, bg: TOKENS.paper, kind: "nonText" },

  // Translucent borders, flattened onto what sits behind them.
  {
    what: "trash button border: warm-fg/70 on warm fill",
    fg: blend(TOKENS.warmFg, 0.7, TOKENS.warmBg),
    bg: TOKENS.warmBg,
    kind: "nonText",
  },
  {
    what: "trash button border: warm-fg/70 on paper",
    fg: blend(TOKENS.warmFg, 0.7, TOKENS.paper),
    bg: TOKENS.paper,
    kind: "nonText",
  },
  {
    what: "copy button border: info-fg/70 on info fill",
    fg: blend(TOKENS.infoFg, 0.7, TOKENS.infoBg),
    bg: TOKENS.infoBg,
    kind: "nonText",
  },
  {
    what: "sign-out border: paper/50 on navy",
    fg: blend(TOKENS.paper, 0.5, TOKENS.navy),
    bg: TOKENS.navy,
    kind: "nonText",
  },
  {
    what: "focus ring on navy: white on navy",
    fg: TOKENS.paper,
    bg: TOKENS.navy,
    kind: "nonText",
  },
];
