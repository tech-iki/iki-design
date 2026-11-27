/**
 * Which page numbers a `Pagination` shows (#20): a pure function, so the
 * truncation can be tested at every edge without rendering anything.
 *
 * The first and last pages are always there; the current page and `siblings`
 * either side of it are there; what lies between is an ellipsis. The row has
 * the same number of slots wherever the current page is — `2 * siblings + 5` —
 * so the controls do not shift under the pointer as someone pages through, and
 * an ellipsis never stands for a single page (it would be shorter to show it).
 *
 * | pages | current | siblings | result |
 * | --- | --- | --- | --- |
 * | 5 | 3 | 1 | 1 2 3 4 5 |
 * | 10 | 1 | 1 | 1 2 3 4 5 … 10 |
 * | 10 | 5 | 1 | 1 … 4 5 6 … 10 |
 * | 10 | 10 | 1 | 1 … 6 7 8 9 10 |
 */

/** A page number, or the ellipsis standing for the pages left out. */
export type PageRangeItem = number | "ellipsis";

/** A whole number from `from` to `to`, inclusive. */
function span(from: number, to: number): number[] {
  return Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);
}

/**
 * The page count as a whole number: `0` for anything that is not a count of
 * at least one (`NaN`, `Infinity`, zero, a negative), the integer part
 * otherwise.
 */
export function wholePages(totalPages: number): number {
  return Number.isFinite(totalPages) && totalPages >= 1 ? Math.trunc(totalPages) : 0;
}

/**
 * `page` as a page that exists: the integer part, held to `1…totalPages`;
 * `1` when it is not a number. `0` when there are no pages.
 */
export function clampPage(page: number, totalPages: number): number {
  const total = wholePages(totalPages);
  if (total === 0) return 0;
  if (!Number.isFinite(page)) return 1;
  return Math.min(Math.max(Math.trunc(page), 1), total);
}

/**
 * The items of the row: page numbers and `"ellipsis"`, in order. `[]` when
 * there are no pages. An invalid `page` is clamped (`clampPage`); `siblings`
 * is the integer part, at least 0.
 */
export function pageRange(page: number, totalPages: number, siblings = 1): PageRangeItem[] {
  const total = wholePages(totalPages);
  if (total === 0) return [];
  const current = clampPage(page, total);
  const around = Number.isFinite(siblings) ? Math.max(0, Math.trunc(siblings)) : 1;

  // Everything fits: first, last, the current page and its siblings, and the
  // two ellipses, are the row's slots.
  if (total <= 2 * around + 5) return span(1, total);

  const left = Math.max(current - around, 1);
  const right = Math.min(current + around, total);
  const gapBefore = left > 3;
  const gapAfter = right < total - 2;
  const edge = 3 + 2 * around;

  if (!gapBefore) return [...span(1, edge), "ellipsis", total];
  if (!gapAfter) return [1, "ellipsis", ...span(total - edge + 1, total)];
  return [1, "ellipsis", ...span(left, right), "ellipsis", total];
}
