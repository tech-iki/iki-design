/**
 * Just enough markdown to read the design-system document's tables and lists
 * at build time, so the site shows the document rather than a copy of it
 * (#5). It reads three shapes — the body under one heading, a `| … |` table,
 * and a run of `1.` or `-` items — and nothing else.
 *
 * Every reader throws rather than returning less than it was asked for. A
 * renamed heading, a reshaped table or a row with a cell too few must fail the
 * build: an empty table on the page would be the same silent drift the
 * readers exist to end.
 */

export class DocShapeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocShapeError";
  }
}

/**
 * The lines under `heading` (given whole, `## 15. Decision register`), up to
 * the next heading of any level. The heading must occur exactly once, outside
 * a fenced code block.
 */
export function section(markdown: string, heading: string): string {
  if (!/^#{1,6} \S/.test(heading)) {
    throw new DocShapeError(`Not a heading: "${heading}"`);
  }
  const lines = markdown.split("\n");
  const starts: number[] = [];
  let fenced = false;
  for (const [i, line] of lines.entries()) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    if (!fenced && line.trimEnd() === heading) starts.push(i);
  }
  if (starts.length !== 1) {
    throw new DocShapeError(
      `Expected the heading "${heading}" once in the document, found it ${starts.length} times`,
    );
  }
  const body: string[] = [];
  fenced = false;
  for (const line of lines.slice(starts[0] + 1)) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    if (!fenced && /^#{1,6} /.test(line)) break;
    body.push(line);
  }
  return body.join("\n");
}

/** A table row's cells, split on unescaped pipes, with `\|` unescaped. */
function cells(line: string): string[] {
  const inner = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return inner.split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, "|"));
}

/**
 * The table in `body` whose header is exactly `columns` — a section may hold
 * more than one. Returns its rows, each with exactly as many cells as there
 * are columns. No such table, two of them, a missing separator, a ragged row,
 * an empty cell or a table with no rows all throw.
 */
export function table<const C extends readonly string[]>(
  body: string,
  columns: C,
): { [K in keyof C]: string }[] {
  const lines = body.split("\n");
  const wanted = columns.join(" | ");
  const headers = lines.flatMap((l, i) =>
    l.trimStart().startsWith("|") &&
    !lines[i - 1]?.trimStart().startsWith("|")
      ? [{ i, header: cells(l).join(" | ") }]
      : [],
  );
  if (headers.length === 0) throw new DocShapeError("No table found");
  const matching = headers.filter((h) => h.header === wanted);
  if (matching.length !== 1) {
    throw new DocShapeError(
      `Expected one table headed "${wanted}", found ${matching.length}; the tables here are headed ${headers
        .map((h) => `"${h.header}"`)
        .join(", ")}`,
    );
  }
  const start = matching[0].i;

  const separator = cells(lines[start + 1] ?? "");
  if (
    separator.length !== columns.length ||
    !separator.every((c) => /^:?-{3,}:?$/.test(c))
  ) {
    throw new DocShapeError(
      `Table "${columns.join(" | ")}" has no separator row under its header`,
    );
  }

  const rows: string[][] = [];
  for (const line of lines.slice(start + 2)) {
    if (!line.trimStart().startsWith("|")) break;
    const row = cells(line);
    if (row.length !== columns.length) {
      throw new DocShapeError(
        `Row has ${row.length} cells, expected ${columns.length}: ${line}`,
      );
    }
    if (row.some((c) => c === "")) {
      throw new DocShapeError(`Row has an empty cell: ${line}`);
    }
    rows.push(row);
  }
  if (rows.length === 0) {
    throw new DocShapeError(`Table "${columns.join(" | ")}" has no rows`);
  }
  return rows as { [K in keyof C]: string }[];
}

/**
 * The first list in `body`: `1.`-numbered when `ordered`, `-` otherwise. Each
 * item's indented continuation lines are joined to it with a space. An ordered
 * list must count 1, 2, 3 without a gap, and the list must have an item.
 */
export function list(body: string, { ordered }: { ordered: boolean }): string[] {
  const marker = ordered ? /^(\d+)\. (.*)$/ : /^- (.*)$/;
  const lines = body.split("\n");
  const start = lines.findIndex((l) => marker.test(l));
  if (start === -1) {
    throw new DocShapeError(`No ${ordered ? "numbered" : "bulleted"} list found`);
  }

  const items: string[] = [];
  for (const line of lines.slice(start)) {
    const m = marker.exec(line);
    if (m) {
      if (ordered && Number(m[1]) !== items.length + 1) {
        throw new DocShapeError(
          `List item numbered ${m[1]} where ${items.length + 1} was expected`,
        );
      }
      items.push(m[ordered ? 2 : 1].trim());
    } else if (/^\s+\S/.test(line)) {
      items[items.length - 1] += ` ${line.trim()}`;
    } else {
      break;
    }
  }
  return items;
}

/**
 * The paragraphs in `body` before its first table or list, each joined onto
 * one line. Throws when there are none.
 */
export function lead(body: string): string[] {
  const paragraphs: string[] = [];
  let current: string[] = [];
  for (const line of body.split("\n")) {
    if (/^(\||- |\d+\. )/.test(line.trimStart())) break;
    if (line.trim() === "") {
      if (current.length) paragraphs.push(current.join(" "));
      current = [];
    } else {
      current.push(line.trim());
    }
  }
  if (current.length) paragraphs.push(current.join(" "));
  if (paragraphs.length === 0) throw new DocShapeError("No lead paragraph found");
  return paragraphs;
}

/**
 * Every prose paragraph in `body` — tables and lists skipped — each joined
 * onto one line. Throws when there are none.
 */
export function paragraphs(body: string): string[] {
  const out: string[] = [];
  let current: string[] = [];
  let inBlock = false;
  for (const line of body.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "") {
      if (current.length) out.push(current.join(" "));
      current = [];
      inBlock = false;
    } else if (/^(\||- |\d+\. )/.test(trimmed) || (inBlock && /^\s/.test(line))) {
      if (current.length) out.push(current.join(" "));
      current = [];
      inBlock = true;
    } else if (!inBlock) {
      current.push(trimmed);
    }
  }
  if (current.length) out.push(current.join(" "));
  if (out.length === 0) throw new DocShapeError("No paragraph found");
  return out;
}

/**
 * `**The rule.** Why it holds.` → `["The rule.", " Why it holds."]`: the bold
 * lead the document opens its principles, reversals and questions with, and
 * the rest, which keeps whatever separates the two — a space, or the
 * punctuation of `**The rule**, which …` — so the pair renders back to back.
 * Throws when the item does not open with a bold span.
 */
export function boldLead(item: string): [rule: string, rest: string] {
  const m = /^\*\*(.+?)\*\*(.*)$/.exec(item);
  if (!m) throw new DocShapeError(`Item does not open with a bold lead: ${item}`);
  return [m[1], m[2]];
}
