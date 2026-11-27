import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { KpiTile } from "./components/kpi-tile.js";
import { Pill } from "./components/pill.js";
import * as pkg from "./index.js";
import { RESET_RULES, baseCss, resetCss, themeCss, tokensCss, tokensJson } from "./generate.js";
import { COLOUR } from "./tokens.js";
import { tones } from "./tones.js";
import * as classes from "./ui-classes.js";

/**
 * The written system carries the generated files verbatim, and must not drift
 * from them.
 *
 * `docs/design-system.md` shows `theme.css` (§4), `tokens.css` and `base.css`
 * (§13a) and `tokens.json` (Appendix A) so a reader can see the whole output
 * without opening `dist/`. Each block sits under an HTML comment marker and is
 * compared here, character for character, to what the generators produce. Work
 * OS held its copy of the document the same way; when the system moved here the
 * blocks came with it still showing Work OS's old stylesheet — which is the
 * failure this exists to catch.
 */

const doc = readFileSync(new URL("../../../docs/design-system.md", import.meta.url), "utf8");

const { version } = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as { version: string };

/**
 * The fenced block that follows `<!-- marker -->`.
 *
 * The span is measured, not trusted: a lazy match that ran past its closing
 * fence would swallow the next section and still "match", so the capture may
 * not contain a fence of its own and must be a plausible size.
 */
function block(marker: string, lang: string, source = doc, atLeast = 300): string {
  const pattern = new RegExp(`<!-- ${marker} -->\\n\`\`\`${lang}\\n([\\s\\S]*?)\\n\`\`\``);
  const match = source.match(pattern);
  if (!match) throw new Error(`docs/design-system.md has no ${marker} block`);
  const body = match[1];
  expect(body).not.toContain("```");
  expect(body.length).toBeGreaterThan(atLeast);
  expect(body.length).toBeLessThan(6000);
  return body;
}

describe("docs/design-system.md carries the generated files verbatim", () => {
  it("§4: the theme block is theme.css", () => {
    expect(block("tokens:theme", "css")).toBe(themeCss().trimEnd());
  });

  it("§13a: the :root block is tokens.css", () => {
    expect(block("tokens:root", "css")).toBe(tokensCss().trimEnd());
  });

  it("§13a: the element rules are base.css", () => {
    expect(block("tokens:base", "css")).toBe(baseCss().trimEnd());
  });

  it("§13e: the opt-in reset is reset.css", () => {
    expect(block("tokens:reset", "css")).toBe(resetCss().trimEnd());
  });

  it("Appendix A is tokens.json, stamped with this package's version", () => {
    const shown = block("tokens:json", "json");
    expect(JSON.parse(shown)).toEqual(tokensJson(version));
    expect(shown).toBe(JSON.stringify(tokensJson(version), null, 2));
  });

  // The control: one hex changed in the document, and the same comparison
  // has to fail. Without this, an extractor that returned the wrong block —
  // or an empty one — could pass the checks above for reasons unrelated to
  // their names.
  it("notices a single changed hex in the document", () => {
    const real = block("tokens:theme", "css");
    // Built from the registry, so this file holds no colour literal of its own.
    const tampered = doc.replace(`--color-navy: ${COLOUR.navy};`, `--color-navy: ${COLOUR.teal};`);
    expect(tampered).not.toBe(doc);
    expect(block("tokens:theme", "css", tampered)).not.toBe(real);
    expect(block("tokens:theme", "css", tampered)).not.toBe(themeCss().trimEnd());
  });

  it("notices a block that is missing altogether", () => {
    const without = doc.replace("<!-- tokens:base -->", "<!-- tokens:gone -->");
    expect(() => block("tokens:base", "css", without)).toThrow(/no tokens:base block/);
  });
});

/**
 * §13e lists the reset's rules next to the Library's six and names, for each,
 * what in the package leans on it. The table is held to the code two ways: its
 * rows are `RESET_RULES`, in order and declaration for declaration, and every
 * name in its fourth column is something the package really exports, so a
 * renamed class or a dropped component fails here and not in a consumer.
 */
describe("docs/design-system.md §13e lists the reset's rules", () => {
  /** The table's body rows: cells split on ` | `, first and last pipe removed. */
  function resetRows(source: string): string[][] {
    const lines = source.split("\n");
    const head = lines.findIndex((line) => line.startsWith("| Rule | Mirrors in Preflight"));
    if (head === -1) throw new Error("§13e has no reset table");
    const body: string[][] = [];
    for (const line of lines.slice(head + 2)) {
      if (!line.startsWith("| ")) break;
      body.push(line.slice(2, -2).split(" | "));
    }
    return body;
  }

  const rows = resetRows(doc);

  /** The backticked names in the fourth column that the package does not export. */
  function notExported(table: string[][]): string[] {
    const exported = pkg as Record<string, unknown>;
    const named = table.flatMap((row) => [...row[3].matchAll(/`(\w+)`/g)].map((m) => m[1]));
    expect(named.length).toBeGreaterThan(15);
    return named.filter((name) => !(name in exported));
  }

  it("has one row for each rule, with the rule's own declarations", () => {
    expect(rows).toHaveLength(RESET_RULES.length);
    RESET_RULES.forEach(({ declarations }, i) => {
      expect(rows[i][0], `row ${i + 1}`).toContain(`\`${declarations.join("; ")}\``);
    });
  });

  it("names the Library's six copies, one to six, and the two it supplies itself", () => {
    expect(rows.map((row) => row[4])).toEqual([
      "rule 1",
      "rule 2",
      "rule 3",
      "rule 4",
      "rule 5",
      "rule 6",
      "the app's own `* { box-sizing }`",
      "the app's own `button, input… { font: inherit }`",
    ]);
  });

  it("names only exports of the package in the fourth column", () => {
    expect(notExported(rows)).toEqual([]);
  });

  // The control: a class the package does not export, in the document, and the
  // same comparison has to name it.
  it("notices a class the package does not export", () => {
    const tampered = doc.replace("`tabClass`, `disclosureButtonClass`", "`tabClass`, `noSuchClass`");
    expect(tampered).not.toBe(doc);
    expect(notExported(resetRows(tampered))).toEqual(["noSuchClass"]);
  });
});

/**
 * §8 (and §7, for the shell) shows the class strings as `name  value` lines, with `{touchTarget}`,
 * `{focusRing}` and `{fieldClass}` standing for the strings they are built
 * from. Until the 20 October 2026 audit (#6) nothing compared those lines to
 * `ui-classes.ts`, and three had drifted: the fields still showed a
 * `focus:outline-none` the code had removed, `Pill` had lost its
 * `whitespace-nowrap`, and `invalidFieldClass` was not listed. Same technique
 * as the blocks above: a marker, a fence, a comparison.
 */
const PLACEHOLDER: Readonly<Record<string, string>> = {
  "{touchTarget}": classes.touchTarget,
  "{focusRing}": classes.focusRing,
  "{fieldClass}": classes.fieldClass,
  "{primaryButtonClass}": classes.primaryButtonClass,
  "{subtleButtonClass}": classes.subtleButtonClass,
  "{focusRingOnNavy}": classes.focusRingOnNavy,
};

/** `name  classes` lines → name → classes, placeholders expanded. */
function classLines(body: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of body.split("\n")) {
    const match = line.match(/^\s*(\S+)\s{2,}(.+)$/);
    if (!match) continue;
    let value = match[2].trim();
    for (const [key, real] of Object.entries(PLACEHOLDER)) value = value.replaceAll(key, real);
    out[match[1]] = value;
  }
  return out;
}

const CLASS_BLOCKS = [
  "classes:buttons",
  "classes:fields",
  "classes:cursor",
  // Phase 1 (ADR 0002): the overlays' strings, in the §8 blocks that describe them.
  "classes:overlays",
  "classes:menu",
  "classes:disclosure",
  // Phase 2: the table frame, the styled natives, and the three on Base UI.
  "classes:table",
  "classes:choices",
  "classes:tooltip",
  "classes:tabs",
  "classes:combobox",
  // The app shell (#19): §7's rail and skip link, held as §8's are.
  "classes:nav",
] as const;

/**
 * Every class the §8 blocks document, name → classes. A name that appears
 * in two blocks is an error, not a merge: the later copy would silently win
 * and a stale earlier one would never be compared.
 */
function documentedClasses(source: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const marker of CLASS_BLOCKS) {
    for (const [name, value] of Object.entries(classLines(block(marker, "", source, 50)))) {
      if (name in out) throw new Error(`${name} is documented twice; the second time under ${marker}`);
      out[name] = value;
    }
  }
  return out;
}

/** The documented names whose string is not the one the code exports. */
function drifted(source: string): string[] {
  const exported = classes as Record<string, string>;
  return Object.entries(documentedClasses(source))
    .filter(([name, shown]) => shown !== exported[name])
    .map(([name]) => name);
}

describe("docs/design-system.md §8 shows the class strings as the package exports them", () => {
  it("names every string ui-classes.ts exports, and no other", () => {
    const exported = Object.keys(classes).sort();
    expect(exported.length).toBeGreaterThanOrEqual(15);
    expect(Object.keys(documentedClasses(doc)).sort()).toEqual(exported);
  });

  it("gives each the string the code gives it", () => {
    expect(drifted(doc)).toEqual([]);
  });

  it("shows Pill's own classes, whitespace-nowrap among them", () => {
    const lines = classLines(block("classes:pill", "", doc, 100));
    const shown = lines.Pill.replace("{tone: PillTone}", tones.neutral);
    const html = renderToStaticMarkup(createElement(Pill, { tone: tones.neutral, children: "x" }));
    expect(html.match(/class="([^"]*)"/)?.[1]).toBe(shown);
    expect(shown).toContain("whitespace-nowrap");
  });

  it("shows KpiTile's frame, label bar, body and the value in each tone", () => {
    const lines = classLines(block("classes:pill", "", doc, 100));
    // `value   text-3xl … text-navy | text-warm-fg | text-health-overdue-fg`:
    // the shared classes, then the colour each tone gives the number.
    const [neutralValue, warm, overdue] = lines.value.split(/\s*\|\s*/);
    const words = neutralValue.split(" ");
    const valueBase = words.slice(0, -1).join(" ");
    const toneOf = { neutral: words.at(-1), warm, overdue } as const;
    for (const tone of ["neutral", "warm", "overdue"] as const) {
      const html = renderToStaticMarkup(createElement(KpiTile, { label: "L", value: 1, tone }));
      const found = [...html.matchAll(/class="([^"]*)"/g)].map((m) => m[1]);
      expect(found[0], "frame").toBe(lines.KpiTile);
      expect(found[1], "label").toBe(lines.label);
      expect(found[2], "body").toBe(lines.body);
      expect(found[3], tone).toBe(`${valueBase} ${toneOf[tone]}`);
    }
  });

  // The controls: put the removed class back into the document and the same
  // comparison the suite runs has to name the line; document a class twice
  // and the merge has to refuse rather than keep one.
  it("notices a class the document shows and the code does not have", () => {
    const tampered = doc.replace(
      "disabled:text-ink-muted {focusRing}\nsmallFieldClass",
      "disabled:text-ink-muted focus:outline-none {focusRing}\nsmallFieldClass",
    );
    expect(tampered).not.toBe(doc);
    expect(drifted(tampered)).toEqual(["fieldClass"]);
  });

  it("refuses a class documented in two blocks", () => {
    const twice = doc.replace(
      "<!-- classes:cursor -->\n```\n",
      "<!-- classes:cursor -->\n```\nlinkClass   not-the-real-string\n",
    );
    expect(twice).not.toBe(doc);
    expect(() => documentedClasses(twice)).toThrow(/linkClass is documented twice/);
  });
});
