/**
 * The parts of `docs/design-system.md` the site shows, read from the document
 * itself (#5). The site used to carry the principles, the drift table and the
 * decision register as typed constants, and the register fell six rows behind
 * within a day. Now the document is the one copy and the pages render it.
 *
 * The read happens once, at module scope, which Next.js treats as a
 * predictable value: it completes while the page prerenders and the result is
 * part of the static HTML, so no host ever reads the file. A heading renamed
 * or a table reshaped throws here and fails the build.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  DocShapeError,
  boldLead,
  lead,
  list,
  paragraphs,
  section,
  table,
} from "@/lib/markdown";

/** The document's path, found by walking up from `from` to the repository root. */
export function findDoc(from: string = process.cwd()): string {
  for (let dir = from; ; dir = dirname(dir)) {
    const candidate = join(dir, "docs", "design-system.md");
    if (existsSync(candidate)) return candidate;
    if (dirname(dir) === dir) {
      throw new Error(`docs/design-system.md not found above ${from}`);
    }
  }
}

export const HEADINGS = {
  principles: "## 2. Principles",
  families: "### Three colour families today",
  drift: "## 14. Known drift inside Work OS",
  register: "## 15. Decision register",
  reversed: "### Reversed — do not re-adopt",
  scale: "### The scale in use",
  shape: "## 6. Spacing, shape, elevation, layering, motion",
  breakpoints: "### Breakpoints",
  constraints: "### 13d. Constraints a shared package must respect",
  open: "## 16. Open questions",
} as const;

export const DRIFT_COLUMNS = ["Drift", "Where", "Fix"] as const;
export const FAMILY_COLUMNS = [
  "Surface",
  "Colour",
  "Hex",
  "Hue / saturation / lightness",
] as const;
export const REGISTER_COLUMNS = [
  "Date",
  "Source",
  "Decision",
  "What settled it",
] as const;

export const SCALE_COLUMNS = ["Class", "Size", "Uses", "What it is for"] as const;
export const RADIUS_COLUMNS = ["Class", "px", "Where"] as const;
export const LAYER_COLUMNS = ["z", "What"] as const;
export const BREAKPOINT_COLUMNS = ["Prefix", "Min width", "What changes"] as const;

/** Everything the site reads from one copy of the document. */
export function readDesignDoc(markdown: string) {
  const drift = section(markdown, HEADINGS.drift);
  const families = section(markdown, HEADINGS.families);
  const shape = section(markdown, HEADINGS.shape);
  const options = paragraphs(families).filter((p) =>
    p.startsWith("**Options"),
  );
  if (options.length !== 1) {
    throw new DocShapeError(
      `Expected one "**Options" paragraph in §3, found ${options.length}`,
    );
  }
  return {
    /** §3: when the families were measured. */
    familiesLead: lead(families),
    familyRows: table(families, FAMILY_COLUMNS),
    /** §3: the observations under the table. */
    familyNotes: list(families, { ordered: false }),
    /** §3: the options, for Brian to decide. */
    familyOptions: options[0],
    /** §2: the rule in bold, then what stands behind it. */
    principles: list(section(markdown, HEADINGS.principles), {
      ordered: true,
    }).map(boldLead),
    /** §14's paragraph above the table: the commit it is true at. */
    driftLead: lead(drift),
    driftRows: table(drift, DRIFT_COLUMNS),
    /** §15, every row, in the document's order. */
    register: table(section(markdown, HEADINGS.register), REGISTER_COLUMNS),
    /** §15, "Reversed — do not re-adopt": the rule in bold, then why. */
    reversed: list(section(markdown, HEADINGS.reversed), {
      ordered: false,
    }).map(boldLead),
    /** §5: the type sizes in use. */
    scale: table(section(markdown, HEADINGS.scale), SCALE_COLUMNS),
    /** §6: the radius in use, and the z-index layers. */
    radius: table(shape, RADIUS_COLUMNS),
    layers: table(shape, LAYER_COLUMNS),
    /** §7: what changes at each breakpoint. */
    breakpoints: table(
      section(markdown, HEADINGS.breakpoints),
      BREAKPOINT_COLUMNS,
    ),
    /** §13d: what a consumer must respect, each opening with its rule in bold. */
    constraints: list(section(markdown, HEADINGS.constraints), {
      ordered: false,
    }),
    /** §16: the question in bold, then what is known. */
    open: list(section(markdown, HEADINGS.open), { ordered: true }).map(
      boldLead,
    ),
  };
}

/** The document's text, read once while the site builds. */
export const MARKDOWN = readFileSync(findDoc(), "utf8");

export const DOC = readDesignDoc(MARKDOWN);
