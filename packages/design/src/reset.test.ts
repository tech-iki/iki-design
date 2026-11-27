import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { RESET_RULES, RESET_SCOPE, baseCss, resetCss, themeCss, tokensCss } from "./generate.js";

/**
 * `reset.css` (#33): the opt-in reset for a Tailwind app that omits Preflight.
 *
 * The risks are three. It could leak into a consumer that never asked for it
 * (Work OS and the members portal have Preflight; Ghost, WordPress and Docmost
 * use `tokens.css`). It could stop being what the Digital Library already runs,
 * so the Library could not delete its copy. And it could fall out of the
 * tarball, so a consumer imports a file that is not there. There is no browser
 * runner in this repository (jsdom draws no native button border, so a
 * computed-style test would pass with or without the file), so the rules'
 * effect is held two other ways: word for word against the Library's own six,
 * measured in three engines there, and value for value against Preflight in
 * `apps/site`'s `reset-parity.test.ts`.
 */

const HERE = new URL(".", import.meta.url).pathname;
const ROOT = join(HERE, "..");

/** A rule's selector and declarations, with the trailing `;` and spacing made uniform. */
function normalise(rule: string): string {
  return rule.replace(/;\s*}/, " }").replace(/\s+/g, " ").trim();
}

/** The six rules the Library carries in `apps/web/src/styles.css` (its issue 111), as written there. */
const LIBRARY_AS_WRITTEN = [
  ".iki-app :where(button) { border: 0 solid; padding: 0; background-color: transparent; color: inherit; }",
  ".iki-app :where(button, input, select, textarea) { margin: 0; }",
  ".iki-app :where(textarea) { resize: vertical; }",
  ".iki-app :where(h1,h2,h3,h4,h5,h6,p) { margin: 0; }",
  ".iki-app :where(h1,h2,h3,h4,h5,h6) { font-size: inherit; font-weight: inherit; }",
  ".iki-app :where(svg) { vertical-align: middle; }",
];

/** The same six under this file's scope, in the uniform spelling `normalise` gives. */
const LIBRARY_SIX = LIBRARY_AS_WRITTEN.map((rule) => normalise(rule.replace(".iki-app", RESET_SCOPE)));

/** The rules inside the one `@layer base { … }` block. */
function layerRules(css: string): string[] {
  const open = css.indexOf("@layer base {");
  expect(open).toBeGreaterThan(-1);
  const body = css.slice(open + "@layer base {".length, css.lastIndexOf("}"));
  return body
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

describe("reset.css", () => {
  const css = resetCss();
  const rules = layerRules(css);

  it("opens with the generated-file header and names its scope", () => {
    expect(css.startsWith("/* Generated from tokens.ts by @tech-iki/design")).toBe(true);
    expect(RESET_SCOPE).toBe(".iki-reset");
  });

  it("holds every rule in one @layer base block, so any later layer wins", () => {
    expect(css.match(/@layer /g)).toHaveLength(1);
    expect(rules).toHaveLength(RESET_RULES.length);
    // Nothing outside the block but comments.
    const outside = css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/@layer base \{[\s\S]*\}/, "");
    expect(outside.trim()).toBe("");
  });

  it("scopes every selector to .iki-reset, at one class of specificity", () => {
    for (const rule of rules) {
      expect(rule, rule).toMatch(/^\.iki-reset :where\([^()]+\) \{/);
    }
    // No bare element rule outside the scope.
    expect(css).not.toMatch(/^\s*(?:html|body|:root|\*)\b/m);
  });

  it("states no !important and no colour of its own", () => {
    expect(css).not.toContain("!important");
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch)\(/i);
  });

  it("gives the Library every one of its six rules, so it can delete its copy", () => {
    const shipped = rules.map(normalise);
    for (const rule of LIBRARY_SIX) {
      expect(shipped, rule).toContain(rule);
    }
  });

  it("adds only the two Preflight rules the Library supplies elsewhere", () => {
    const shipped = rules.map(normalise);
    expect(shipped.filter((rule) => !LIBRARY_SIX.includes(rule))).toEqual([
      ".iki-reset :where(*) { box-sizing: border-box }",
      ".iki-reset :where(button, input, select, textarea) { font: inherit; letter-spacing: inherit }",
    ]);
  });

  // The control: a fixture the Library check has to catch, so the six-rule
  // assertion above is shown able to fail.
  it("notices a Library rule that the file does not carry", () => {
    const shipped = rules.map(normalise).filter((rule) => !rule.includes(":where(svg)"));
    expect(shipped).not.toContain(LIBRARY_SIX[5]);
  });
});

describe("reset.css is opt-in and additive", () => {
  it("is not in theme.css, tokens.css or base.css, so nobody receives it unasked", () => {
    for (const css of [themeCss(), tokensCss(), baseCss()]) {
      expect(css).not.toContain("iki-reset");
      expect(css).not.toContain("box-sizing");
    }
  });

  it("is a new export beside the ones that were already there", () => {
    const { exports } = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      exports: Record<string, unknown>;
    };
    expect(exports["./reset.css"]).toBe("./dist/reset.css");
    // The entries that shipped in 0.5.0 are untouched: adding one is a minor.
    for (const key of [".", "./theme.css", "./tokens.css", "./base.css", "./tokens.json", "./package.json"]) {
      expect(exports, key).toHaveProperty(key);
    }
  });
});

describe("reset.css in the packed tarball", () => {
  const built = join(ROOT, "dist", "reset.css");

  // `npm pack --dry-run`, the check CI also runs for the record, listing what
  // would publish. `--ignore-scripts` keeps `prepare` from rebuilding under it.
  it.skipIf(!existsSync(built))(
    "is listed by npm pack, and is what resetCss() returns (skipped: dist/ not built)",
    () => {
      const out = execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
        cwd: ROOT,
        encoding: "utf8",
      });
      const [{ files }] = JSON.parse(out) as [{ files: { path: string }[] }];
      expect(files.map((file) => file.path)).toContain("dist/reset.css");
      expect(readFileSync(built, "utf8")).toBe(resetCss());
    },
  );
});
