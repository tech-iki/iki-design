/**
 * Which component files are Client Components, held as a list.
 *
 * The four overlays use state, effects and Base UI, so they carry
 * `"use client";`; everything else in `src/components` stays a Server
 * Component. The set is compared whole, so a new client file fails here until
 * it is added on purpose, and a stray directive on a server file fails too.
 * Base UI must stay an implementation detail (ADR 0002): nothing of it is
 * re-exported, and it is imported by subpath only.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const HERE = dirname(fileURLToPath(import.meta.url));
const COMPONENTS = join(HERE, "components");
const CLIENT = ["disclosure.tsx", "drawer.tsx", "menu.tsx", "popover.tsx"];

// Same technique as apps/site/src/site-rules.test.ts.
function stripComments(source: string): string {
  return source
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1");
}

const files = readdirSync(COMPONENTS).filter((f) => f.endsWith(".tsx"));
const read = (f: string) => readFileSync(join(COMPONENTS, f), "utf8");

describe("the client directive", () => {
  it("finds the components", () => {
    expect(files.length).toBeGreaterThanOrEqual(CLIENT.length);
  });

  it("is on exactly the overlay files, as their first line", () => {
    const withDirective = files.filter((f) => read(f).split("\n")[0].trim() === '"use client";').sort();
    expect(withDirective).toEqual([...CLIENT].sort());
  });

  it("appears nowhere in the other components", () => {
    for (const f of files.filter((f) => !CLIENT.includes(f))) {
      expect(stripComments(read(f)), f).not.toMatch(/use client/);
    }
  });

  // Run `npm run build -w packages/design` first to exercise this.
  const built = join(HERE, "..", "dist", "components", "drawer.js");
  it.skipIf(!existsSync(built))("survives the build on the built drawer (skipped: dist/ not built)", () => {
    expect(readFileSync(built, "utf8").split("\n")[0].trim()).toBe('"use client";');
  });
});

describe("Base UI stays behind the package", () => {
  const all = [...files.map((f) => ({ name: `components/${f}`, source: read(f) })), { name: "index.ts", source: readFileSync(join(HERE, "index.ts"), "utf8") }];

  it("is not re-exported from the entry or any component", () => {
    for (const { name, source } of all) {
      const code = stripComments(source);
      expect(code, name).not.toMatch(/export\s+\*\s+from\s+["']@base-ui/);
      expect(code, name).not.toMatch(/export\s+(type\s+)?\{[^}]*\}\s+from\s+["']@base-ui/);
    }
    expect(stripComments(all.find((a) => a.name === "index.ts")!.source)).not.toContain("@base-ui");
  });

  it("is imported by subpath only", () => {
    for (const f of CLIENT) {
      const imports = [...stripComments(read(f)).matchAll(/from\s+["'](@base-ui\/react[^"']*)["']/g)].map((m) => m[1]);
      for (const spec of imports) expect(spec, f).toMatch(/^@base-ui\/react\/[a-z-]+$/);
    }
  });
});
