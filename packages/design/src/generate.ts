/**
 * The generators: `tokens.ts` in, four deliverables out.
 *
 * Every function here is pure and returns a string (or, for `tokensJson`, a
 * plain object). `scripts/build-css.ts` calls them and writes the results to
 * `dist/`; the tests call them directly. Nothing is retyped: every colour, font
 * and size is read from `tokens.ts`, and a source-shape test holds this file to
 * that by refusing any hex literal outside it.
 *
 * - `themeCss()` — `theme.css`, the Tailwind v4 stylesheet for an app that
 *   builds with Tailwind (Work OS, the IKI Digital Library).
 * - `tokensCss()` — `tokens.css`, plain `:root` custom properties for anything
 *   else: a Ghost theme, WordPress, Docmost.
 * - `baseCss()` — `base.css`, the optional element rules that go with them.
 * - `tokensJson()` — `tokens.json`, the same values as data, for tools.
 */

import {
  BREAKPOINTS_PX,
  COLOUR,
  COLOURS,
  CONTRAST_THRESHOLD,
  FONT,
  MOTION,
  RADIUS_PX,
  THEME,
  TOUCH_TARGET_PX,
  TYPE_SCALE_PX,
  WEIGHTS,
  Z_INDEX,
  type ColourGroup,
  type ColourToken,
} from "./tokens.js";

const HEADER =
  "/* Generated from tokens.ts by @tech-iki/design — do not edit; change tokens.ts */";

/** The group comment each run of tokens sits under in `theme.css`. */
const GROUP_LABEL: Readonly<Record<ColourGroup, string>> = {
  brand: "Brand and chrome",
  surface: "Surfaces, rules and text",
  status: "Status fills: a light fill and dark same-hue text",
};

/** A font stack written with double quotes, the way the stylesheets spell it. */
const stack = (fallback: string) => fallback.replaceAll("'", '"');

/**
 * The Tailwind v4 stylesheet.
 *
 * `@theme` makes each colour a utility (`bg-teal-deep`, `text-ink`, …) as well
 * as a variable. The font block is `@theme inline` because it names another
 * variable, which Tailwind must not resolve at build time.
 */
export function themeCss(): string {
  const lines: string[] = [HEADER, ""];

  lines.push(
    "/*",
    " * Make the consuming app's Tailwind build scan this package's compiled",
    " * components and class strings for utilities. Tailwind does not scan",
    " * node_modules on its own, so without this `bg-teal-deep`, `focus-visible:outline-2`",
    " * and the rest of the strings in ui-classes and the pill tones would never be",
    " * generated, and the components would render unstyled. The path is relative",
    " * to this file, which sits beside index.js in dist/.",
    " */",
    '@source "./index.js";',
    "",
    "/*",
    " * index.js only re-exports. The class strings themselves live in the modules",
    " * beside it, so the directory is scanned as well.",
    " */",
    '@source "./";',
    "",
    "@theme {",
  );

  let group: ColourGroup | undefined;
  for (const colour of COLOURS) {
    if (colour.group !== group) {
      if (group !== undefined) lines.push("");
      lines.push(`  /* ${GROUP_LABEL[colour.group]} */`);
      group = colour.group;
    }
    if (colour.note) lines.push(`  /* ${colour.note} */`);
    lines.push(`  --color-${colour.name}: ${colour.hex};`);
  }
  lines.push("}", "");

  lines.push(
    "/*",
    " * A Next app sets these two variables through next/font (self-hosted Geist,",
    " * so a `font-src 'self'` policy holds). Anything else falls back to a Geist",
    " * served locally under the family name, and then to the system stack.",
    " */",
    "@theme inline {",
    `  --font-sans: var(${FONT.sans.variable}, "${FONT.sans.family}"), ${stack(FONT.sans.fallback)};`,
    `  --font-mono: var(${FONT.mono.variable}, "${FONT.mono.family}"), ${stack(FONT.mono.fallback)};`,
    "}",
    "",
    "@layer base {",
    "  body {",
    "    background: var(--color-paper);",
    "    color: var(--color-ink);",
    "    font-family: var(--font-sans);",
    "  }",
    "}",
    "",
  );

  return lines.join("\n");
}

/** Notes printed beside a custom property in `tokens.css`. */
const INLINE_NOTE: Readonly<Partial<Record<ColourToken, string>>> = {
  teal: "decorative fills only: 4.11:1 on white",
  "teal-deep": "text, buttons, links, focus: 5.19:1 on white",
  grid: "rules and dividers, never a control boundary",
  "grid-strong": "input and button borders: 3.41:1 on white",
};

const NOTE_COLUMN = 32;

/** `  --name: value;` padded so the trailing comment lines up, as in the design system doc. */
function declaration(name: string, value: string, note?: string): string {
  const text = `  --iki-${name}: ${value};`;
  return note ? `${text.padEnd(NOTE_COLUMN)}/* ${note} */` : text;
}

/**
 * Plain `:root` custom properties: the whole palette, the two font stacks, the
 * default radius and the focus ring's width and offset. Works in any stylesheet,
 * with no build step.
 */
export function tokensCss(): string {
  const lines: string[] = [HEADER, "", ":root {"];
  for (const colour of COLOURS) {
    lines.push(declaration(colour.name, colour.hex, INLINE_NOTE[colour.name]));
  }
  lines.push(
    "",
    declaration("font-sans", `"${FONT.sans.family}", ${stack(FONT.sans.fallback)}`),
    declaration("font-mono", `"${FONT.mono.family}", ${stack(FONT.mono.fallback)}`),
    declaration("radius", `${RADIUS_PX.md}px`, "pills 999px; inline links 2px; cards inside panels 4px"),
    declaration("focus-width", "2px"),
    declaration("focus-offset", "2px"),
    "}",
    "",
  );
  return lines.join("\n");
}

/**
 * The element rules that go with `tokens.css`: body, links and the focus ring.
 *
 * Optional, and for plain-CSS consumers only. A Tailwind app gets the
 * equivalent from `theme.css` (the body rule) and from `ui-classes` (`linkClass`
 * and `focusRing`), and would only fight these. Load `tokens.css` first: every
 * value here is a `var(--iki-*)` it declares.
 */
export function baseCss(): string {
  return [
    HEADER,
    "",
    "/*",
    " * Optional element rules for plain-CSS consumers (a Ghost theme, WordPress,",
    " * Docmost). Load tokens.css first. A Tailwind app does not need this file:",
    " * theme.css sets the body, and ui-classes carries the link and focus rules.",
    " */",
    "body {",
    "  background: var(--iki-paper);",
    "  color: var(--iki-ink);",
    "  font-family: var(--iki-font-sans);",
    "  font-size: 14px;",
    "  line-height: 1.5;",
    "}",
    "a { color: var(--iki-teal-deep); text-decoration: underline; border-radius: 2px; }",
    "a:hover { color: var(--iki-navy); }",
    ":focus-visible {",
    "  outline: var(--iki-focus-width) solid var(--iki-teal-deep);",
    "  outline-offset: var(--iki-focus-offset);",
    "}",
    "/* On a navy field, teal has no contrast: */",
    ".on-navy :focus-visible { outline-color: var(--iki-paper); }",
    "",
  ].join("\n");
}

/** `frozenBodyCell` → `frozen-body-cell`, the spelling the data file uses. */
const kebab = (name: string) => name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** The tokens as data (design system Appendix A), stamped with the package version. */
export function tokensJson(version: string) {
  return {
    name: "IKI design system",
    version,
    source: "tech-iki/iki-design packages/design/src/tokens.ts",
    colour: { ...COLOUR },
    font: {
      sans: FONT.sans.family,
      mono: FONT.mono.family,
      fallback: FONT.sans.fallback,
      "mono-fallback": FONT.mono.fallback,
      email: FONT.email,
    },
    "type-scale-px": [...TYPE_SCALE_PX],
    weights: [...WEIGHTS],
    "radius-px": { ...RADIUS_PX },
    "breakpoints-px": { ...BREAKPOINTS_PX },
    "z-index": Object.fromEntries(
      Object.entries(Z_INDEX).map(([name, layer]) => [kebab(name), layer]),
    ) as Record<string, number>,
    "touch-target-px": TOUCH_TARGET_PX,
    contrast: { text: CONTRAST_THRESHOLD.text, "non-text": CONTRAST_THRESHOLD.nonText },
    theme: THEME,
    motion: MOTION,
  };
}
