import { describe, expect, it } from "vitest";

import { clampPage, pageRange, wholePages, type PageRangeItem } from "./page-range.js";

/** The row as a reader sees it: `1 … 4 5 6 … 10`. */
const show = (items: PageRangeItem[]) => items.map((i) => (i === "ellipsis" ? "…" : String(i))).join(" ");

describe("wholePages and clampPage", () => {
  it.each([
    [10, 10],
    [10.9, 10],
    [1, 1],
    [0.5, 0],
    [0, 0],
    [-3, 0],
    [Number.NaN, 0],
    [Number.POSITIVE_INFINITY, 0],
  ])("reads %s pages as %s", (given, expected) => {
    expect(wholePages(given)).toBe(expected);
  });

  it.each([
    [3, 10, 3],
    [0, 10, 1],
    [-4, 10, 1],
    [11, 10, 10],
    [4.9, 10, 4],
    [Number.NaN, 10, 1],
    [Number.POSITIVE_INFINITY, 10, 1],
    [5, 0, 0],
  ])("holds page %s of %s to %s", (page, total, expected) => {
    expect(clampPage(page, total)).toBe(expected);
  });
});

describe("pageRange", () => {
  it("is empty when there are no pages", () => {
    expect(pageRange(1, 0)).toEqual([]);
    expect(pageRange(1, -2)).toEqual([]);
    expect(pageRange(1, Number.NaN)).toEqual([]);
  });

  it("is the one page for one page, and both for two", () => {
    expect(show(pageRange(1, 1))).toBe("1");
    expect(show(pageRange(1, 2))).toBe("1 2");
    expect(show(pageRange(2, 2))).toBe("1 2");
  });

  it("shows every page while they fit the row (7 slots at one sibling)", () => {
    expect(show(pageRange(4, 7))).toBe("1 2 3 4 5 6 7");
    expect(show(pageRange(1, 5))).toBe("1 2 3 4 5");
  });

  it("truncates the far end from the first pages", () => {
    expect(show(pageRange(1, 10))).toBe("1 2 3 4 5 … 10");
    expect(show(pageRange(4, 10))).toBe("1 2 3 4 5 … 10");
  });

  it("truncates both ends in the middle", () => {
    expect(show(pageRange(5, 10))).toBe("1 … 4 5 6 … 10");
    expect(show(pageRange(6, 10))).toBe("1 … 5 6 7 … 10");
  });

  it("truncates the near end from the last pages", () => {
    expect(show(pageRange(7, 10))).toBe("1 … 6 7 8 9 10");
    expect(show(pageRange(10, 10))).toBe("1 … 6 7 8 9 10");
  });

  it("handles 1000 pages at the start, the middle and the end", () => {
    expect(show(pageRange(1, 1000))).toBe("1 2 3 4 5 … 1000");
    expect(show(pageRange(500, 1000))).toBe("1 … 499 500 501 … 1000");
    expect(show(pageRange(1000, 1000))).toBe("1 … 996 997 998 999 1000");
  });

  it("reads an invalid current page as the nearest one that exists", () => {
    expect(pageRange(Number.NaN, 10)).toEqual(pageRange(1, 10));
    expect(pageRange(0, 10)).toEqual(pageRange(1, 10));
    expect(pageRange(-5, 10)).toEqual(pageRange(1, 10));
    expect(pageRange(99, 10)).toEqual(pageRange(10, 10));
    expect(pageRange(5.7, 10)).toEqual(pageRange(5, 10));
  });

  it("never stands an ellipsis for a single page, and is the same length for every current page", () => {
    for (const total of [8, 9, 10, 25, 1000]) {
      const lengths = new Set<number>();
      for (let page = 1; page <= Math.min(total, 40); page++) {
        const items = pageRange(page, total);
        lengths.add(items.length);
        items.forEach((item, i) => {
          if (item !== "ellipsis") return;
          const before = items[i - 1] as number;
          const after = items[i + 1] as number;
          expect(after - before, `${total} pages, on ${page}`).toBeGreaterThan(2);
        });
        // The current page, the first and the last are always there, once, in order.
        const numbers = items.filter((i): i is number => i !== "ellipsis");
        expect(numbers).toContain(page);
        expect(numbers[0]).toBe(1);
        expect(numbers.at(-1)).toBe(total);
        expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
        expect(new Set(numbers).size).toBe(numbers.length);
      }
      expect(lengths).toEqual(new Set([7]));
    }
  });

  it("takes siblings: none, two, and a nonsense value read as the default", () => {
    expect(show(pageRange(5, 20, 0))).toBe("1 … 5 … 20");
    expect(show(pageRange(10, 20, 2))).toBe("1 … 8 9 10 11 12 … 20");
    expect(show(pageRange(1, 20, 2))).toBe("1 2 3 4 5 6 7 … 20");
    expect(pageRange(10, 20, Number.NaN)).toEqual(pageRange(10, 20, 1));
    expect(pageRange(10, 20, -3)).toEqual(pageRange(10, 20, 0));
  });
});
