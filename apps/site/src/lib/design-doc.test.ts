/**
 * The pages show the document, all of it. Each count below is taken from the
 * document's raw lines without the readers — a dated row is a line opening
 * `| 2026-`, a principle a line opening `N. **` — and compared with what the
 * readers return and with what the rendered pages contain. A reader that
 * dropped a row, or a page that sliced one off, fails here.
 */
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import AdoptPage from "@/app/adopt/page";
import DecisionsPage from "@/app/decisions/page";
import LayoutPage from "@/app/layout/page";
import TypePage from "@/app/type/page";
import OverviewPage from "@/app/page";
import { DOC, HEADINGS, findDoc, readDesignDoc } from "@/lib/design-doc";
import { DocShapeError } from "@/lib/markdown";

const MARKDOWN = readFileSync(findDoc(__dirname), "utf8");

/** The raw lines between one heading and the next heading line after it. */
function rawLines(heading: string): string[] {
  const lines = MARKDOWN.split("\n");
  const start = lines.indexOf(heading);
  expect(start, `${heading} is in the document`).toBeGreaterThan(-1);
  const next = lines.findIndex((l, i) => i > start && /^#{1,6} /.test(l));
  return lines.slice(start + 1, next === -1 ? lines.length : next);
}

const RAW = {
  principles: rawLines(HEADINGS.principles).filter((l) => /^\d+\. \*\*/.test(l)).length,
  drift: rawLines(HEADINGS.drift).filter((l) => l.startsWith("| ")).length - 2,
  register: rawLines(HEADINGS.register).filter((l) => /^\| \d{4}-\d{2}/.test(l)).length,
  reversed: rawLines(HEADINGS.reversed).filter((l) => l.startsWith("- **")).length,
  families: rawLines(HEADINGS.families).filter((l) => l.startsWith("| ")).length - 2,
  familyNotes: rawLines(HEADINGS.families).filter((l) => l.startsWith("- ")).length,
  constraints: rawLines(HEADINGS.constraints).filter((l) => l.startsWith("- **")).length,
  scale: rawLines(HEADINGS.scale).filter((l) => l.startsWith("| `text-")).length,
  radius: rawLines(HEADINGS.shape).filter((l) => l.startsWith("| `rounded")).length,
  layers: rawLines(HEADINGS.shape).filter((l) => l.startsWith("| `z-")).length,
  breakpoints: rawLines(HEADINGS.breakpoints).filter((l) => l.startsWith("| `")).length,
  open: rawLines(HEADINGS.open).filter((l) => /^\d+\. \*\*/.test(l)).length,
};

/** The `<tr>`s in a table's body, found by its accessible name. */
function bodyRows(html: string, label: string): number {
  const at = html.indexOf(`aria-label="${label}"`);
  expect(at, `a table labelled "${label}" is rendered`).toBeGreaterThan(-1);
  const tbody = html.slice(html.indexOf("<tbody", at), html.indexOf("</tbody>", at));
  return tbody.match(/<tr[ >]/g)?.length ?? 0;
}

/** The `<li>`s of the first list after a section heading. */
function listItems(html: string, sectionId: string): number {
  const at = html.indexOf(`id="${sectionId}"`);
  expect(at, `a section "${sectionId}" is rendered`).toBeGreaterThan(-1);
  const open = html.slice(at).search(/<[ou]l[ >]/) + at;
  const tag = html.slice(open + 1, open + 3);
  const list = html.slice(open, html.indexOf(`</${tag}>`, open));
  return list.match(/<li[ >]/g)?.length ?? 0;
}

describe("the readers return every row the document holds", () => {
  it("has non-trivial raw counts, so an empty walk cannot pass", () => {
    expect(RAW.principles).toBeGreaterThanOrEqual(10);
    expect(RAW.drift).toBeGreaterThanOrEqual(1);
    expect(RAW.register).toBeGreaterThanOrEqual(40);
    expect(RAW.reversed).toBeGreaterThanOrEqual(12);
    expect(RAW.open).toBeGreaterThanOrEqual(1);
    expect(RAW.families).toBeGreaterThanOrEqual(8);
    expect(RAW.familyNotes).toBeGreaterThanOrEqual(3);
    expect(RAW.constraints).toBeGreaterThanOrEqual(6);
    expect(RAW.scale).toBeGreaterThanOrEqual(8);
    expect(RAW.radius).toBeGreaterThanOrEqual(5);
    expect(RAW.layers).toBeGreaterThanOrEqual(6);
    expect(RAW.breakpoints).toBeGreaterThanOrEqual(3);
  });

  it("reads each table and list at its raw count", () => {
    expect(DOC.principles).toHaveLength(RAW.principles);
    expect(DOC.driftRows).toHaveLength(RAW.drift);
    expect(DOC.register).toHaveLength(RAW.register);
    expect(DOC.reversed).toHaveLength(RAW.reversed);
    expect(DOC.open).toHaveLength(RAW.open);
    expect(DOC.familyRows).toHaveLength(RAW.families);
    expect(DOC.familyNotes).toHaveLength(RAW.familyNotes);
    expect(DOC.constraints).toHaveLength(RAW.constraints);
    expect(DOC.scale).toHaveLength(RAW.scale);
    expect(DOC.radius).toHaveLength(RAW.radius);
    expect(DOC.layers).toHaveLength(RAW.layers);
    expect(DOC.breakpoints).toHaveLength(RAW.breakpoints);
    expect(DOC.familyOptions).toMatch(/^\*\*Options, for Brian to decide\.\*\*/);
  });

  it("keeps the document's order", () => {
    expect(DOC.register[0][0]).toBe("2026-07-23");
    expect(DOC.principles[0][0]).toMatch(/^The data carries the colour/);
  });

  it("fails loudly on a renamed heading, never an empty table", () => {
    const renamed = MARKDOWN.replace(HEADINGS.register, "## 15. Decisions");
    expect(() => readDesignDoc(renamed)).toThrow(DocShapeError);
  });

  it("fails loudly on a register row with a cell missing", () => {
    const row = MARKDOWN.split("\n").find((l) => l.startsWith("| 2026-07-24 | #32 |"));
    expect(row).toBeDefined();
    const ragged = MARKDOWN.replace(row!, row!.replace(" | #32 |", " |"));
    expect(() => readDesignDoc(ragged)).toThrow(/3 cells, expected 4/);
  });
});

describe("the rendered pages show every row", () => {
  const decisions = renderToStaticMarkup(createElement(DecisionsPage));
  const overview = renderToStaticMarkup(createElement(OverviewPage));
  const adopt = renderToStaticMarkup(createElement(AdoptPage));

  it("renders the whole colour-families table", () => {
    expect(bodyRows(decisions, "Colour families across IKI surfaces")).toBe(RAW.families);
  });

  const layout = renderToStaticMarkup(createElement(LayoutPage));
  const type = renderToStaticMarkup(createElement(TypePage));

  it("renders every row of the layout and type tables", () => {
    expect(bodyRows(type, "The type scale in use")).toBe(RAW.scale);
    expect(bodyRows(layout, "Border radius")).toBe(RAW.radius);
    expect(bodyRows(layout, "The z-index layers")).toBe(RAW.layers);
    expect(bodyRows(layout, "Breakpoints and what changes at each")).toBe(RAW.breakpoints);
  });

  it("renders every constraint a consumer must respect", () => {
    expect(listItems(adopt, "what-a-consumer-must-respect")).toBe(RAW.constraints);
    expect(adopt).toContain("<em>styled</em>");
  });

  it("renders the whole decision register", () => {
    expect(bodyRows(decisions, "Decision register")).toBe(RAW.register);
  });

  it("renders the whole drift table", () => {
    expect(bodyRows(decisions, "Known drift inside Work OS")).toBe(RAW.drift);
  });

  it("renders every reversal", () => {
    expect(listItems(decisions, "reversed-do-not-re-adopt")).toBe(RAW.reversed);
  });

  it("renders every open question as a heading", () => {
    const open = decisions.slice(
      decisions.indexOf('id="open"'),
      decisions.indexOf('id="reversed-do-not-re-adopt"'),
    );
    expect(open.match(/<h3[ >]/g)?.length).toBe(RAW.open);
  });

  it("renders every principle", () => {
    expect(listItems(overview, "principles")).toBe(RAW.principles);
  });

  it("renders the document's inline markdown, not its punctuation", () => {
    expect(decisions).not.toMatch(/\*\*|\]\(#/);
    expect(decisions).toContain(
      'href="https://github.com/tech-iki/iki-design/blob/main/docs/design-system.md#4-colour"',
    );
    expect(decisions).toContain("<em>styled</em>");
    expect(overview).not.toContain("**");
    expect(adopt).not.toContain("**");
  });
});
