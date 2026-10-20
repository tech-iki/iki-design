/**
 * The site holds itself to the design system's own rules, and until this file
 * nothing checked that. These are source-shape tests: they read every `.tsx`
 * under `src/`, strip comments, and fail on the patterns the system forbids.
 *
 * Every matcher is a named function with a control below it: a fixture the
 * matcher is shown to catch. A guard that has never been seen to fail is a
 * claim, not a check.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = join(__dirname);

/** Below this the walk found too little, and an empty walk would pass every rule. */
const MIN_FILES = 15;

/** Remove `/* *\/` blocks (JSX `{/* *\/}` included) and whole-line or trailing `//` comments. */
export function stripComments(source: string): string {
  return source
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1");
}

/**
 * Hex colours and functional colour notations. The site's prose cites issue
 * numbers (`#219`), which are valid three-digit hex, so a 3 or 4 digit
 * all-numeric match is read as an issue reference unless its digits are all
 * the same (`#000`, `#111` stay caught). The cost: `#123` is not caught.
 */
export function colourLiterals(source: string): string[] {
  const hexes = (source.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).filter(
    (hex) => !/^#(?!(\d)\1+$)\d{3,4}$/.test(hex),
  );
  return [
    ...hexes,
    ...(source.match(/\b(?:rgba?|hsla?|oklch)\(/g) ?? []),
  ];
}

/** A hex is allowed only on a line that declares `const UPPER_SNAKE = "#…"`. */
const FOREIGN_CONSTANT = /^\s*(?:export\s+)?const\s+[A-Z][A-Z0-9_]*\s*=\s*"#[0-9a-fA-F]{3,8}";/;

export function colourLiteralsOutsideConstants(source: string): string[] {
  return source
    .split("\n")
    .flatMap((line) => (FOREIGN_CONSTANT.test(line) ? [] : colourLiterals(line)));
}

/**
 * Raw Tailwind palette classes (`bg-zinc-100`); the system's `bg-teal-deep` has
 * no numeric suffix. `white` and `black` count too: `theme.css` switches the
 * default palette off (#6), so `text-white` is not a lighter shade of anything,
 * it is a class that compiles to nothing. The system's white is `paper`.
 */
export function paletteClasses(source: string): string[] {
  return (
    source.match(
      /\b(?:bg|text|border|ring|outline|fill|stroke|divide|from|to|via)-(?:(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}|white|black)\b/g,
    ) ?? []
  );
}

/** `<Pill … className="…whitespace-X…">` where X is not `nowrap`. */
export function pillWhitespace(source: string): string[] {
  const out: string[] = [];
  for (const tag of source.match(/<Pill\b[^>]*>/g) ?? []) {
    for (const m of tag.matchAll(/whitespace-(?!nowrap\b)[a-z-]+/g)) {
      out.push(m[0]);
    }
  }
  return out;
}

export function clientDirectives(source: string): string[] {
  return source.match(/^\s*["']use client["']/gm) ?? [];
}

/** The system has no motion and no reduced-motion rule to inherit. */
export function motionClasses(source: string): string[] {
  return source.match(/\b(?:transition|duration|animate|ease)-[\w[\]./-]+/g) ?? [];
}

/** Literal `<Section title="…">` and `<Section title={`…`}>` titles, in order. */
export function sectionTitles(source: string): string[] {
  const titles: string[] = [];
  for (const m of source.matchAll(
    /<Section\b[^>]*?\btitle=(?:"([^"]*)"|\{`([^`$]*)`\})/g,
  )) {
    titles.push(m[1] ?? m[2]);
  }
  return titles;
}

export function duplicates(items: string[]): string[] {
  return items.filter((item, i) => items.indexOf(item) !== i);
}

const files = readdirSync(SRC, { recursive: true, encoding: "utf8" })
  .filter((f) => f.endsWith(".tsx"))
  .sort()
  .map((f) => ({ name: f, source: stripComments(readFileSync(join(SRC, f), "utf8")) }));

describe("the walk", () => {
  it("finds the site's components and pages", () => {
    expect(files.length).toBeGreaterThanOrEqual(MIN_FILES);
  });
});

describe("controls: each matcher catches what it guards against", () => {
  it("strips comments but not strings", () => {
    expect(stripComments("a // #fff\nb /* #fff */ c {/* #fff */}")).not.toContain("#fff");
    expect(stripComments('href="https://x.test"')).toContain("https://x.test");
  });

  it("catches colour literals", () => {
    expect(colourLiterals('style={{ color: "#0b023b" }}')).toEqual(["#0b023b"]);
    expect(colourLiterals("fill: rgb(0 0 0)")).toEqual(["rgb("]);
    expect(colourLiterals("a: oklch(0.4 0.1 270)")).toEqual(["oklch("]);
    expect(colourLiterals('className="bg-teal-deep"')).toEqual([]);
    expect(colourLiterals("#000 #fff #123456 #12345678")).toEqual(["#000", "#fff", "#123456", "#12345678"]);
    expect(colourLiterals("see #219 and #1234")).toEqual([]);
  });

  it("allows a hex only on a named constant's declaration line", () => {
    expect(colourLiteralsOutsideConstants('const LOGO_INDIGO = "#0b023b";')).toEqual([]);
    expect(
      colourLiteralsOutsideConstants('const LOGO_INDIGO = "#0b023b";\n<i style={{ color: "#0b023b" }} />'),
    ).toEqual(["#0b023b"]);
    expect(colourLiteralsOutsideConstants('const logo = "#0b023b";')).toEqual(["#0b023b"]);
  });

  it("catches raw palette classes and spares the system's tokens", () => {
    expect(paletteClasses('className="bg-zinc-100"')).toEqual(["bg-zinc-100"]);
    expect(paletteClasses("bg-teal-600")).toEqual(["bg-teal-600"]);
    expect(paletteClasses("text-gray-500")).toEqual(["text-gray-500"]);
    expect(paletteClasses("text-white hover:bg-white/10 outline-black")).toEqual([
      "text-white",
      "bg-white",
      "outline-black",
    ]);
    expect(paletteClasses("bg-teal-deep")).toEqual([]);
    expect(paletteClasses("bg-sky")).toEqual([]);
    expect(paletteClasses("text-paper/75")).toEqual([]);
  });

  it("catches a Pill that can wrap, not one that cannot", () => {
    expect(pillWhitespace('<Pill tone="ok" className="whitespace-normal">x</Pill>')).toEqual([
      "whitespace-normal",
    ]);
    expect(pillWhitespace('<Pill className="whitespace-nowrap">x</Pill>')).toEqual([]);
    expect(pillWhitespace('<td className="whitespace-normal">x</td>')).toEqual([]);
  });

  it("catches a client directive", () => {
    expect(clientDirectives('"use client";\nexport {}')).toHaveLength(1);
    expect(clientDirectives("export {}")).toEqual([]);
  });

  it("catches motion classes", () => {
    expect(motionClasses('className="transition-colors duration-200"')).toEqual([
      "transition-colors",
      "duration-200",
    ]);
    expect(motionClasses('className="animate-spin ease-in"')).toEqual(["animate-spin", "ease-in"]);
    expect(motionClasses('className="px-3"')).toEqual([]);
  });

  it("collects section titles and finds repeats", () => {
    const fixture = '<Section title="A">x</Section><Section title={`B`}>y</Section><Section title="A">z</Section>';
    expect(sectionTitles(fixture)).toEqual(["A", "B", "A"]);
    expect(duplicates(sectionTitles(fixture))).toEqual(["A"]);
    expect(duplicates(["A", "B"])).toEqual([]);
  });
});

describe("the site obeys the system's rules", () => {
  it("has no hex or functional colour literal, bar the named foreign constants", () => {
    for (const f of files) {
      const found =
        f.name === join("app", "decisions", "page.tsx")
          ? colourLiteralsOutsideConstants(f.source)
          : colourLiterals(f.source);
      expect(found, f.name).toEqual([]);
    }
  });

  it("has no raw Tailwind palette class", () => {
    for (const f of files) expect(paletteClasses(f.source), f.name).toEqual([]);
  });

  it("lets no Pill wrap", () => {
    for (const f of files) expect(pillWhitespace(f.source), f.name).toEqual([]);
  });

  /**
   * The one exception is named, not patterned: the overlay specimens on
   * `/components` hold open state for Drawer, Popover, Menu and Disclosure,
   * which are client components (design system §13). Every page stays a
   * Server Component and renders that wrapper, which is the arrangement a
   * consuming Next app has.
   */
  it('has no "use client" outside the overlay specimens: a client component must be a deliberate decision', () => {
    const allowed = [join("components", "overlay-specimens.tsx")];
    for (const f of files) {
      expect(clientDirectives(f.source), f.name).toEqual(allowed.includes(f.name) ? ['"use client"'] : []);
    }
  });

  it("has no transition or animation class", () => {
    for (const f of files) expect(motionClasses(f.source), f.name).toEqual([]);
  });

  it("gives no two sections of one file the same title, so heading ids stay unique", () => {
    for (const f of files) expect(duplicates(sectionTitles(f.source)), f.name).toEqual([]);
  });
});
