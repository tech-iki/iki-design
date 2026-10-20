import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { baseCss, themeCss, tokensCss, tokensJson } from "./generate.js";
import { COLOUR } from "./tokens.js";

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
function block(marker: string, lang: string, source = doc): string {
  const pattern = new RegExp(`<!-- ${marker} -->\\n\`\`\`${lang}\\n([\\s\\S]*?)\\n\`\`\``);
  const match = source.match(pattern);
  if (!match) throw new Error(`docs/design-system.md has no ${marker} block`);
  const body = match[1];
  expect(body).not.toContain("```");
  expect(body.length).toBeGreaterThan(300);
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
