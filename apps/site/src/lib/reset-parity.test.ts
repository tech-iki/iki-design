/**
 * `reset.css` says what Tailwind's Preflight says, for the elements it names
 * (#33). The package ships the reset so an app that omits Preflight still gets
 * correct components; if the two ever disagreed, the app would see one
 * rendering with Preflight and another without, which is the very drift the
 * file exists to close. So every declaration the reset makes is looked up in
 * the installed `tailwindcss/preflight.css`, and must be there with the same
 * value, for the same element or for `*`.
 *
 * This lives in the site because Tailwind is a dependency of the site and not
 * of the package, which has no reason to read it.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import { RESET_RULES } from "@tech-iki/design";

const require = createRequire(import.meta.url);

type PreflightRule = { selectors: string[]; declarations: Map<string, string> };

/** The flat rules of a stylesheet: comments stripped, at-rule wrappers skipped. */
export function parseRules(css: string): PreflightRule[] {
  const bare = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...bare.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selector]) => !selector.trim().startsWith("@"))
    .map(([, selector, body]) => ({
      selectors: selector.split(",").map((s) => s.trim()),
      declarations: new Map(
        body
          .split(";")
          .map((d) => d.trim())
          .filter(Boolean)
          .map((d) => {
            const colon = d.indexOf(":");
            return [d.slice(0, colon).trim(), d.slice(colon + 1).trim().replace(/\s+/g, " ")] as const;
          }),
      ),
    }));
}

/** Whether `rules` give `element` the value for `property`, directly or through `*`. */
export function declares(rules: PreflightRule[], element: string, property: string, value: string): boolean {
  return rules.some(
    (rule) =>
      (rule.selectors.includes(element) || rule.selectors.includes("*")) &&
      rule.declarations.get(property) === value,
  );
}

const PREFLIGHT = parseRules(readFileSync(require.resolve("tailwindcss/preflight.css"), "utf8"));

describe("reset.css and Tailwind's Preflight", () => {
  it("reads Preflight well enough to find its universal and button rules", () => {
    // An empty parse would let every check below pass for nothing.
    expect(PREFLIGHT.length).toBeGreaterThan(20);
    expect(declares(PREFLIGHT, "button", "font", "inherit")).toBe(true);
    expect(declares(PREFLIGHT, "p", "margin", "0")).toBe(true);
  });

  for (const { elements, declarations } of RESET_RULES) {
    for (const element of elements.split(",").map((e) => e.trim())) {
      for (const declaration of declarations) {
        const [property, value] = declaration.split(/:\s*/);
        it(`${element}: ${declaration} is a Preflight declaration`, () => {
          expect(declares(PREFLIGHT, element, property, value)).toBe(true);
        });
      }
    }
  }

  // The control: a value Preflight does not set must be reported as absent.
  it("notices a declaration Preflight does not make", () => {
    expect(declares(PREFLIGHT, "button", "border", "1px solid")).toBe(false);
    expect(declares(PREFLIGHT, "svg", "vertical-align", "top")).toBe(false);
  });
});
