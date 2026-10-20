import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { baseCss, themeCss, tokensCss, tokensJson } from "./generate.js";
import { COLOUR, COLOURS, FONT, Z_INDEX } from "./tokens.js";

type Prefix = "color" | "iki";

/** Every `--<prefix>-name: #rrggbb;` in a stylesheet, in order, duplicates kept. */
function declarations(css: string, prefix: Prefix): [string, string][] {
  const pattern = new RegExp(`--${prefix}-([a-z0-9-]+):\\s*(#[0-9a-f]{6})\\s*;`, "gi");
  return [...css.matchAll(pattern)].map(([, name, hex]) => [name, hex.toLowerCase()]);
}

/** The colours a stylesheet declares, name → hex. */
function declaredColours(css: string, prefix: Prefix = "color"): Record<string, string> {
  return Object.fromEntries(declarations(css, prefix));
}

/** The tokens whose declared value is not the registry's. */
function drift(css: string, prefix: Prefix): string[] {
  const declared = declaredColours(css, prefix);
  return COLOURS.filter((c) => declared[c.name] !== c.hex).map((c) => c.name);
}

describe("the stylesheets carry every token exactly once", () => {
  it("lists all twenty-five tokens in theme.css, once each", () => {
    const found = declarations(themeCss(), "color");
    // A truncated loop would still pass the per-token checks for the tokens it
    // reached, so the total is asserted too.
    expect(found).toHaveLength(25);
    for (const { name, hex } of COLOURS) {
      expect(found.filter(([n, h]) => n === name && h === hex), name).toHaveLength(1);
    }
    expect(found.map(([name]) => name)).toEqual(COLOURS.map((c) => c.name));
  });

  it("lists all twenty-five tokens in tokens.css, once each", () => {
    const found = declarations(tokensCss(), "iki");
    expect(found).toHaveLength(25);
    for (const { name, hex } of COLOURS) {
      expect(found.filter(([n, h]) => n === name && h === hex), name).toHaveLength(1);
    }
  });

  it("finds no drift in either", () => {
    expect(drift(themeCss(), "color")).toEqual([]);
    expect(drift(tokensCss(), "iki")).toEqual([]);
  });

  // The control: a check that has never been seen to fail is a claim, not a
  // check. Change one value in a generated stylesheet and the same parser has
  // to report it.
  it("detects a stylesheet whose one hex has changed", () => {
    const real = themeCss();
    const tampered = real.replace(
      `--color-navy: ${COLOUR.navy};`,
      `--color-navy: ${COLOUR.teal};`,
    );
    expect(tampered).not.toBe(real);
    expect(declaredColours(tampered).navy).toBe(COLOUR.teal);
    expect(declaredColours(tampered).navy).not.toBe(COLOUR.navy);
    expect(drift(tampered, "color")).toEqual(["navy"]);
  });

  it("detects a stylesheet with a token missing", () => {
    const tampered = tokensCss().replace(`--iki-sky: ${COLOUR.sky};`, "");
    expect(drift(tampered, "iki")).toEqual(["sky"]);
  });
});

describe("theme.css", () => {
  const css = themeCss();

  it("makes the consuming app scan this package for utilities", () => {
    expect(css).toContain('@source "./index.js";');
    expect(css).toContain("@layer base");
  });

  it("opens with the generated-file header", () => {
    expect(css.startsWith("/* Generated from tokens.ts by @tech-iki/design")).toBe(true);
  });

  it("puts a token's note above it, as a comment", () => {
    const teal = COLOURS.find((c) => c.name === "teal");
    expect(teal?.note).toBeDefined();
    expect(css).toContain(`/* ${teal?.note} */\n  --color-teal: ${COLOUR.teal};`);
  });

  it("falls back from the next/font variables to a local Geist", () => {
    expect(css).toContain(`var(${FONT.sans.variable}, "${FONT.sans.family}")`);
    expect(css).toContain(`var(${FONT.mono.variable}, "${FONT.mono.family}")`);
  });

  it("declares the colours inside @theme and nowhere else", () => {
    const theme = css.slice(css.indexOf("@theme {"), css.indexOf("@theme inline"));
    expect(declarations(theme, "color")).toHaveLength(25);
  });
});

describe("tokens.css and base.css", () => {
  it("declares the fonts, radius and focus ring", () => {
    const css = tokensCss();
    expect(css).toContain("--iki-font-sans:");
    expect(css).toContain("--iki-font-mono:");
    expect(css).toContain("--iki-radius: 6px;");
    expect(css).toContain("--iki-focus-width: 2px;");
    expect(css).toContain("--iki-focus-offset: 2px;");
  });

  it("references only variables that tokens.css declares", () => {
    const declared = new Set(
      [...tokensCss().matchAll(/(--iki-[a-z0-9-]+)\s*:/g)].map(([, name]) => name),
    );
    const used = new Set(
      [...baseCss().matchAll(/var\((--iki-[a-z0-9-]+)\)/g)].map(([, name]) => name),
    );
    // Both non-empty, or the difference below is empty because nothing was read.
    expect(declared.size).toBeGreaterThan(25);
    expect(used.size).toBeGreaterThan(5);
    expect([...used].filter((name) => !declared.has(name))).toEqual([]);
  });

  it("detects a variable base.css uses but tokens.css does not declare", () => {
    const declared = new Set(
      [...tokensCss().matchAll(/(--iki-[a-z0-9-]+)\s*:/g)].map(([, name]) => name),
    );
    const used = [
      ...`${baseCss()} a { color: var(--iki-nonexistent); }`.matchAll(
        /var\((--iki-[a-z0-9-]+)\)/g,
      ),
    ].map(([, name]) => name);
    expect(used.filter((name) => !declared.has(name))).toEqual(["--iki-nonexistent"]);
  });
});

describe("tokensJson", () => {
  it("carries the colours exactly as the registry has them", () => {
    expect(tokensJson("0.0.0").colour).toEqual(COLOUR);
    expect(Object.keys(tokensJson("0.0.0").colour)).toHaveLength(25);
  });

  it("is stamped with the version it is given and the source it came from", () => {
    const json = tokensJson("9.8.7");
    expect(json.version).toBe("9.8.7");
    expect(json.source).toBe("tech-iki/iki-design packages/design/src/tokens.ts");
  });

  it("spells the layers and thresholds the way the design system does", () => {
    const json = tokensJson("0.0.0");
    expect(json["z-index"]).toEqual({
      "frozen-body-cell": Z_INDEX.frozenBodyCell,
      "sticky-header": Z_INDEX.stickyHeader,
      "frozen-header": Z_INDEX.frozenHeader,
      popover: Z_INDEX.popover,
      drawer: Z_INDEX.drawer,
      "skip-link": Z_INDEX.skipLink,
    });
    expect(json.contrast).toEqual({ text: 4.5, "non-text": 3 });
  });

  it("survives a round trip through JSON", () => {
    const json = tokensJson("1.2.3");
    expect(JSON.parse(JSON.stringify(json))).toEqual(json);
  });
});

/**
 * Remove block and line comments, so a hex quoted in a docblock does not count.
 * A `//` only starts a comment at the line start or after whitespace, which
 * keeps `https://` inside a string intact.
 */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "$1");
}

/**
 * Every colour literal left once comments are gone: a hex of three, four, six
 * or eight digits, or a functional colour (`rgb(`, `hsl(`, `oklch(` and their
 * alpha forms). Six digits alone would let `#fff`, `#rrggbbaa` and
 * `oklch(0.42 0.15 270)` past a guard named for keeping colours in tokens.ts.
 */
function hexLiterals(source: string): string[] {
  const code = stripComments(source);
  return [
    ...(code.match(/#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g) ?? []),
    ...(code.match(/\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\([^)]*\)/g) ?? []),
  ];
}

describe("no hex literal outside tokens.ts", () => {
  const root = new URL(".", import.meta.url);
  const files = readdirSync(root, { recursive: true, encoding: "utf8" }).filter(
    (file) => /\.tsx?$/.test(file) && file !== "tokens.ts",
  );

  /**
   * `ui-contrast.test.ts` checks the arithmetic against the WCAG reference
   * colours (black on white is 21:1, black at 50% over white is mid grey).
   * Those are properties of the formula, not palette values, so they are the
   * one exception, named literal by literal. Everything else, including every
   * other test, builds its colours from `COLOUR`.
   */
  const REFERENCE: Record<string, string[]> = {
    // Digits only, so this file holds no literal of its own to scan.
    "ui-contrast.test.ts": ["000000", "ffffff", "808080"],
  };

  it("scans enough files that an empty directory listing cannot pass", () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it.each(files)("%s", (file) => {
    const allowed = REFERENCE[file] ?? [];
    const found = hexLiterals(readFileSync(new URL(file, root), "utf8")).filter(
      (hex) => !allowed.includes(hex.slice(1).toLowerCase()),
    );
    expect(found).toEqual([]);
  });

  // The control: the scanner has to see a literal, and has to ignore one that
  // only a comment quotes. The fixtures are assembled from COLOUR so that this
  // file holds no six-digit literal itself.
  it("finds a literal in code and ignores one in a comment", () => {
    const { navy, teal } = COLOUR;
    expect(hexLiterals(`const bad = "${navy}";`)).toEqual([navy]);
    expect(hexLiterals(`// navy is ${navy}\n/* and ${teal} */ const ok = 1;`)).toEqual([]);
    expect(hexLiterals(`const url = "https://example.test/${navy}";`)).toEqual([navy]);
    // The shorter and functional forms, which a six-digit pattern let through.
    const short = `#${navy.slice(1, 4)}`;
    expect(hexLiterals(`const a = "${short}";`)).toEqual([short]);
    expect(hexLiterals(`const b = "${navy}80";`)).toEqual([`${navy}80`]);
    // Assembled in pieces so this file does not itself contain the forms it guards against.
    const oklch = ["oklch", "(0.42_0.15_270)"].join("");
    const rgb = ["rgb", "(18 48 74 / 50%)"].join("");
    expect(hexLiterals(`const c = \`bg-[${oklch}]\`;`)).toEqual([oklch]);
    expect(hexLiterals(`const d = "${rgb}";`)).toEqual([rgb]);
  });
});
