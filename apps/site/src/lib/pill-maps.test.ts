/**
 * The semantic-maps reader on the real §4 table, against a second, hand-typed
 * expectation — this file is the one place the mapping is written out, as the
 * fixture a reader must reproduce.
 */
import { describe, expect, it } from "vitest";
import { DOC } from "@/lib/design-doc";
import { pillMapEntries } from "@/lib/pill-maps";

describe("pillMapEntries", () => {
  it("reads STATUS_PILL entry by entry, tone by tone", () => {
    expect(pillMapEntries(DOC.pillMaps, "STATUS_PILL")).toEqual([
      ["Not Started", "neutral"],
      ["In Progress", "info"],
      ["Awaiting Input", "warm"],
      ["On Hold", "neutral"],
      ["Completed", "positive"],
      ["Cancelled", "cancelled"],
    ]);
  });

  it("splits a grouped entry into one pair per label", () => {
    expect(pillMapEntries(DOC.pillMaps, "HEALTH_PILL").slice(-2)).toEqual([
      ["On Hold", "neutral"],
      ["Cancelled", "neutral"],
    ]);
  });

  it("throws on a tone the table names some other way", () => {
    expect(() =>
      pillMapEntries([["`X`", "Late → amber"]], "X"),
    ).toThrow(/names no known tone/);
  });

  it("throws on a missing map", () => {
    expect(() => pillMapEntries(DOC.pillMaps, "NO_SUCH_PILL")).toThrow(
      /no `NO_SUCH_PILL` row/,
    );
  });
});
