/**
 * The readers on fixtures, each shape with a control that breaks it. The
 * readers' promise is that they fail loudly instead of returning less than the
 * document holds, so every negative case asserts a throw, never an empty
 * result.
 */
import { describe, expect, it } from "vitest";
import {
  DocShapeError,
  boldLead,
  lead,
  list,
  paragraphs,
  section,
  table,
} from "@/lib/markdown";

const DOC = `# Title

## 1. First

Some prose.

## 2. Register

A paragraph above the table,
over two lines.

| Date | Decision |
| --- | --- |
| 2026-07-23 | One \`a\` thing |
| 2026-07-24 | Two, with an escaped \\| pipe |

Prose after the table.

### Reversed

- **The rule.** Why it went,
  across a line.
- **\`code\` lead** with its reason.

## 3. Principles

1. **One.** First,
   continued.
2. **Two.** Second.

\`\`\`md
## 2. Register
\`\`\`
`;

describe("section", () => {
  it("returns the body under a heading, up to the next heading of any level", () => {
    const body = section(DOC, "## 2. Register");
    expect(body).toContain("A paragraph above the table");
    expect(body).toContain("Prose after the table.");
    expect(body).not.toContain("The rule.");
  });

  it("ignores a heading inside a fenced code block", () => {
    expect(() => section(DOC, "## 2. Register")).not.toThrow();
  });

  it("throws on a missing heading", () => {
    expect(() => section(DOC, "## 4. Missing")).toThrow(DocShapeError);
  });

  it("throws on a heading at the wrong level", () => {
    expect(() => section(DOC, "### 2. Register")).toThrow(DocShapeError);
  });

  it("throws on a heading that occurs twice", () => {
    expect(() => section(`${DOC}\n## 1. First\n`, "## 1. First")).toThrow(
      /found it 2 times/,
    );
  });

  it("throws on something that is not a heading", () => {
    expect(() => section(DOC, "2. Register")).toThrow(/Not a heading/);
  });
});

describe("table", () => {
  const body = section(DOC, "## 2. Register");

  it("returns every row, split on unescaped pipes", () => {
    expect(table(body, ["Date", "Decision"])).toEqual([
      ["2026-07-23", "One `a` thing"],
      ["2026-07-24", "Two, with an escaped | pipe"],
    ]);
  });

  it("throws on a ragged row instead of dropping or padding it", () => {
    const ragged = body.replace(
      "| 2026-07-24 | Two",
      "| 2026-07-24 | extra | Two",
    );
    expect(() => table(ragged, ["Date", "Decision"])).toThrow(/3 cells/);
  });

  it("throws on an empty cell", () => {
    const empty = body.replace("| 2026-07-24 | Two, with an escaped \\| pipe |", "| 2026-07-24 |  |");
    expect(() => table(empty, ["Date", "Decision"])).toThrow(/empty cell/);
  });

  it("throws when the header is not the expected one", () => {
    expect(() => table(body, ["Date", "What"])).toThrow(
      /one table headed "Date \| What", found 0/,
    );
  });

  it("picks the table by its header when a section holds two", () => {
    const two = `| A | B |\n| --- | --- |\n| 1 | 2 |\n\nProse.\n\n| C |\n| --- |\n| 3 |`;
    expect(table(two, ["C"])).toEqual([["3"]]);
    expect(table(two, ["A", "B"])).toEqual([["1", "2"]]);
  });

  it("throws when two tables share the header asked for", () => {
    const twice = `| C |\n| --- |\n| 1 |\n\n| C |\n| --- |\n| 2 |`;
    expect(() => table(twice, ["C"])).toThrow(/found 2/);
  });

  it("throws when the separator row is missing", () => {
    const noSeparator = body.replace("| --- | --- |\n", "");
    expect(() => table(noSeparator, ["Date", "Decision"])).toThrow(/separator/);
  });

  it("throws on a table with a header and no rows", () => {
    expect(() =>
      table("| Date | Decision |\n| --- | --- |\n\nProse.", ["Date", "Decision"]),
    ).toThrow(/no rows/);
  });

  it("throws when there is no table at all", () => {
    expect(() => table(section(DOC, "## 1. First"), ["Date"])).toThrow(
      /No table/,
    );
  });
});

describe("list", () => {
  it("returns numbered items with their continuation lines joined", () => {
    expect(list(section(DOC, "## 3. Principles"), { ordered: true })).toEqual([
      "**One.** First, continued.",
      "**Two.** Second.",
    ]);
  });

  it("returns bulleted items with their continuation lines joined", () => {
    expect(list(section(DOC, "### Reversed"), { ordered: false })).toEqual([
      "**The rule.** Why it went, across a line.",
      "**`code` lead** with its reason.",
    ]);
  });

  it("throws on a numbered list that skips a number", () => {
    expect(() =>
      list("1. **One.** a\n3. **Three.** c", { ordered: true }),
    ).toThrow(/numbered 3 where 2/);
  });

  it("throws on a loose list rather than stopping at its blank line", () => {
    expect(() =>
      list("1. **One.** a\n\n2. **Two.** b", { ordered: true }),
    ).toThrow(/broken by a blank line/);
  });

  it("throws on an unindented continuation line", () => {
    expect(() =>
      list("- **One.** begins\nand runs on", { ordered: false }),
    ).toThrow(/unindented/);
  });

  it("throws when there is no list of the kind asked for", () => {
    expect(() => list(section(DOC, "### Reversed"), { ordered: true })).toThrow(
      /No numbered list/,
    );
    expect(() => list(section(DOC, "## 1. First"), { ordered: false })).toThrow(
      /No bulleted list/,
    );
  });
});

describe("lead", () => {
  it("returns the paragraphs above the first table, each on one line", () => {
    expect(lead(section(DOC, "## 2. Register"))).toEqual([
      "A paragraph above the table, over two lines.",
    ]);
  });

  it("throws when a table comes first", () => {
    expect(() => lead("| a |\n| --- |\n| b |")).toThrow(/No lead/);
  });
});

describe("paragraphs", () => {
  it("returns the prose on either side of a table and skips lists", () => {
    expect(paragraphs(section(DOC, "## 2. Register"))).toEqual([
      "A paragraph above the table, over two lines.",
      "Prose after the table.",
    ]);
    expect(paragraphs("| A |\n| --- |\n| 1 |\nGlued to the table.")).toEqual([
      "Glued to the table.",
    ]);
    expect(() => paragraphs(section(DOC, "### Reversed"))).toThrow(
      /No paragraph/,
    );
  });
});

describe("boldLead", () => {
  it("splits the bold rule from the rest, keeping the space between", () => {
    expect(boldLead("**The rule.** Why it went.")).toEqual([
      "The rule.",
      " Why it went.",
    ]);
  });

  it("returns an empty rest for an item that is all rule", () => {
    expect(boldLead("**Nine columns hidden by default.**")).toEqual([
      "Nine columns hidden by default.",
      "",
    ]);
  });

  it("keeps punctuation outside the stars with the rest", () => {
    expect(boldLead("**The favicon**, which survived.")).toEqual([
      "The favicon",
      ", which survived.",
    ]);
  });

  it("throws on an item without a bold lead", () => {
    expect(() => boldLead("Plain item.")).toThrow(/bold lead/);
  });
});
