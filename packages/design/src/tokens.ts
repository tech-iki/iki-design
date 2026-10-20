/**
 * The one place a value of the IKI design system lives.
 *
 * Everything else is derived from this file: `theme.css` (the Tailwind v4
 * `@theme` block), `tokens.css` (plain `:root` custom properties for a Ghost
 * theme, WordPress or Docmost), `tokens.json`, the contrast assertions in
 * `ui-contrast.ts`, and every swatch on the showcase site. Change a hex here
 * and all of them move together; change it anywhere else and a test fails.
 *
 * The palette is the IKI Tracker workbook's own, extracted from its
 * `xl/styles.xml` and adopted by IKI Work OS as ADR 0003 (24 July 2026) —
 * light only, by decision. `teal-deep` and `grid-strong` were added by ADR 0006
 * (29 July 2026) when measurement showed the workbook teal at 4.11:1 and the
 * grid rule at 1.36:1 on white: below AA for text and below 3:1 for a control
 * boundary. Each token's `role` says where it is used and `note` says why it is
 * that value, because a palette whose reasons are lost is a palette that drifts.
 */

export type ColourGroup = "brand" | "surface" | "status";

export type ColourToken =
  | "navy"
  | "teal"
  | "teal-deep"
  | "teal-soft"
  | "sky"
  | "grid"
  | "grid-strong"
  | "ink"
  | "ink-muted"
  | "paper"
  | "paper-tint"
  | "row-hover"
  | "row-error"
  | "health-overdue-bg"
  | "health-overdue-fg"
  | "health-ontrack-bg"
  | "health-ontrack-fg"
  | "health-stale-bg"
  | "health-stale-fg"
  | "warm-bg"
  | "warm-fg"
  | "info-bg"
  | "info-fg"
  | "priority-low-bg"
  | "priority-low-fg";

export type Colour = {
  name: ColourToken;
  hex: `#${string}`;
  group: ColourGroup;
  /** Where it is used. */
  role: string;
  /** Why it is this value, with the measurement that settled it. */
  note?: string;
};

/** The twenty-five colour tokens, in the order the theme block declares them. */
export const COLOURS: readonly Colour[] = [
  // Brand and chrome
  { name: "navy", hex: "#12304a", group: "brand", role: "App furniture: the rail, table header rows. White on it is 13.57:1." },
  {
    name: "teal", hex: "#168b8c", group: "brand",
    role: "The workbook teal. Large decorative fills only — chart columns.",
    note: "4.11:1 on paper: below AA for text, clear of the 3:1 non-text threshold. Darkening it was rejected because the chart columns legitimately want the workbook hue.",
  },
  {
    name: "teal-deep", hex: "#14797a", group: "brand",
    role: "Every text-bearing teal surface: buttons, KPI label bars, links, the focus ring, the grid cursor.",
    note: "5.19:1 on paper. Added by ADR 0006 because plain teal failed AA for text.",
  },
  { name: "teal-soft", hex: "#eaf4f4", group: "brand", role: "KPI tile bodies, hover fills, the workstream chip, the Completed health pill. Navy on it is 12.11:1." },
  { name: "sky", hex: "#ddeaf0", group: "brand", role: "Group header bands. Navy on it is 11.05:1." },

  // Surfaces, rules and text
  { name: "paper", hex: "#ffffff", group: "surface", role: "The page and every card." },
  { name: "paper-tint", hex: "#f4f8f9", group: "surface", role: "Zebra stripe, login ground, dashed panels. 1.069:1 against paper." },
  {
    name: "grid", hex: "#d5dee5", group: "surface",
    role: "Table rules, card borders, dividers, the neutral pill fill.",
    note: "1.36:1 on paper — fine for a table rule, never a control boundary, which WCAG 1.4.11 wants at 3:1.",
  },
  {
    name: "grid-strong", hex: "#7e8d9a", group: "surface",
    role: "Input and button borders, the drawer edge, the task card.",
    note: "3.41:1 on paper, 3.19:1 on paper-tint, 3.04:1 on teal-soft — a control boundary everywhere it is drawn.",
  },
  { name: "ink", hex: "#23313d", group: "surface", role: "Body text. 13.31:1 on paper." },
  { name: "ink-muted", hex: "#5b6b7a", group: "surface", role: "Secondary text; seven of the grid's columns. 5.48:1 on paper." },
  {
    name: "row-hover", hex: "#e0f2f4", group: "surface",
    role: "The hovered grid row.",
    note: "Opaque, and it has to be: frozen columns paint with bg-inherit, so an alpha row background lets the scrolled content show through the pinned cells. The deepest tint that keeps ink-muted at 4.75:1; sky (4.47:1) and grid (4.02:1) both fail it.",
  },
  {
    name: "row-error", hex: "#fcf0f0", group: "surface",
    role: "An errored import row.",
    note: "health-overdue-bg at 30% over paper, pre-flattened so the row stays opaque for the same reason. The teal-deep link on it is 4.66:1.",
  },

  // Status fills: a light fill and dark same-hue text
  { name: "health-overdue-bg", hex: "#f4cccc", group: "status", role: "Overdue; High priority; import error. Its text is 6.10:1." },
  { name: "health-overdue-fg", hex: "#990000", group: "status", role: "Text on health-overdue-bg; field errors." },
  { name: "health-ontrack-bg", hex: "#d9ead3", group: "status", role: "On Track; Completed status; import create. Its text is 7.62:1." },
  { name: "health-ontrack-fg", hex: "#274e13", group: "status", role: "Text on health-ontrack-bg." },
  { name: "health-stale-bg", hex: "#e7b34b", group: "status", role: "Stale — amber, per the workbook. Its text is 4.85:1." },
  { name: "health-stale-fg", hex: "#5c4300", group: "status", role: "Text on health-stale-bg." },
  { name: "warm-bg", hex: "#fce5cd", group: "status", role: "Due Soon; Medium; Awaiting Input; the trash button. Its text is 6.86:1." },
  { name: "warm-fg", hex: "#783f04", group: "status", role: "Text on warm-bg; the warn button." },
  { name: "info-bg", hex: "#d9eaf7", group: "status", role: "In Progress; import update; login notices. Its text is 11.03:1." },
  {
    name: "info-fg", hex: "#12304a", group: "status",
    role: "Text on info-bg.",
    note: "The same hex as navy, as a separate token so a retune of one does not silently move the other.",
  },
  { name: "priority-low-bg", hex: "#fff2cc", group: "status", role: "Low priority. Its text is 5.26:1." },
  { name: "priority-low-fg", hex: "#7f6000", group: "status", role: "Text on priority-low-bg." },
];

/** Token name → hex, for arithmetic and generation. */
export const COLOUR = Object.fromEntries(
  COLOURS.map((c) => [c.name, c.hex]),
) as Readonly<Record<ColourToken, `#${string}`>>;

/**
 * One family, two faces: Geist for everything, Geist Mono for identifiers. The
 * apps load it through `next/font` (self-hosted, so a `font-src 'self'` policy
 * holds) and set these two custom properties; the stylesheets fall back to a
 * locally served "Geist" and then to the system stack.
 */
export const FONT = {
  sans: { family: "Geist", variable: "--font-geist-sans", fallback: "system-ui, -apple-system, 'Segoe UI', sans-serif" },
  mono: { family: "Geist Mono", variable: "--font-geist-mono", fallback: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" },
  /** Mail clients load no web font. */
  email: "system-ui, -apple-system, 'Segoe UI', sans-serif",
} as const;

/** The type sizes in use, in px. Two of them (12 and 14) carry about 97% of the interface. */
export const TYPE_SCALE_PX = [10, 11, 12, 14, 16, 18, 20, 30] as const;

/** 400 body, 500 for labels and pill text, 600 for headings and buttons. Nothing is bold. */
export const WEIGHTS = [400, 500, 600] as const;

/** Tailwind's radius names and what each is for. */
export const RADIUS_PX = {
  xs: 2, // the focus-ring corner on inline links
  sm: 4, // things inside a cell or a panel: chips, cell triggers, option rows
  md: 6, // the default box: fields, buttons, cards, tables, panels, tiles
  lg: 8, // the login card, once
  full: 9999, // pills, count badges, the active-nav bar
} as const;

/** Tailwind's defaults, unmodified; `xl` and `2xl` are never used. */
export const BREAKPOINTS_PX = { sm: 640, md: 768, lg: 1024 } as const;

export const Z_INDEX = {
  frozenBodyCell: 1,
  stickyHeader: 10,
  frozenHeader: 20,
  popover: 30,
  drawer: 40,
  skipLink: 50,
} as const;

/** WCAG 2.5.8, applied as a responsive minimum below `md`. */
export const TOUCH_TARGET_PX = 44;

/** WCAG 1.4.3 for text; 1.4.11 for control boundaries and meaningful graphics. */
export const CONTRAST_THRESHOLD = { text: 4.5, nonText: 3 } as const;

export const THEME = "light-only" as const;
export const MOTION = "none" as const;

/** The design-target viewport and the phone reference. */
export const VIEWPORTS_PX = { desktop: { width: 1280 }, phone: { width: 375, height: 812 } } as const;
