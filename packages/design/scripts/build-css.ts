/**
 * Writes the four generated files into `dist/`: `theme.css`, `tokens.css`,
 * `base.css` and `tokens.json`. Run by `npm run build` after `tsc`.
 *
 * Node 24 runs this file as it stands, by stripping the types. Stripping does
 * not rewrite import specifiers, so `../src/generate.ts` would fail at run time:
 * it imports `./tokens.js`, which only exists once tsc has compiled it. The
 * script therefore imports the compiled `../dist/generate.js`, which is there
 * because `tsc -p tsconfig.build.json` runs first in the build script. The
 * import goes through a computed URL so the type checker does not require
 * `dist/` to exist; the type comes from the source module instead.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type * as Generate from "../src/generate.ts";

const root = join(import.meta.dirname, "..");
const dist = join(root, "dist");

const { baseCss, themeCss, tokensCss, tokensJson }: typeof Generate = await import(
  new URL("../dist/generate.js", import.meta.url).href
);

const { version } = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
  version: string;
};

mkdirSync(dist, { recursive: true });
writeFileSync(join(dist, "theme.css"), themeCss());
writeFileSync(join(dist, "tokens.css"), tokensCss());
writeFileSync(join(dist, "base.css"), baseCss());
writeFileSync(join(dist, "tokens.json"), `${JSON.stringify(tokensJson(version), null, 2)}\n`);

console.log(`@tech-iki/design ${version}: wrote theme.css, tokens.css, base.css, tokens.json to dist/`);
