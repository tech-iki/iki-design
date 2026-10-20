import { describe, expect, it } from "vitest";

import { pillWidth, widestPill } from "./pill-width.js";

/*
 * The grid and report column tests that sit beside this one in Work OS (every
 * pill column is at least as wide as its widest pill) depend on its column
 * registries, so they stay there. What is held here is the table itself:
 * `pillWidth` against the widths a browser actually rendered.
 */

/**
 * Rendered widths, in CSS px, of every label the app puts in a pill: Geist 500
 * at 12px plus the pill's `px-2`, measured in Chromium with
 * `getBoundingClientRect` on 2026-09-23. These are the fact `pillWidth` is an
 * estimate of.
 */
const RENDERED: Record<string, number> = {
  "Not Started": 81.52, "In Progress": 79.5, "Awaiting Input": 96.67,
  "On Hold": 61.09, Completed: 77.72, Cancelled: 72.33,
  High: 41.56, Medium: 60.92, Low: 39.27,
  Overdue: 63.14, "Due Soon": 70.11, Stale: 45.25, "On Track": 66.19,
  create: 51.67, update: 55.23, unchanged: 78.53, error: 43.02,
  committed: 75.86, pending: 61.38, discarded: 71.41,
  Active: 51.45, Deactivated: 83.75, Required: 66.45, Optional: 63.63,
  Critical: 56.03,
};

describe("pillWidth", () => {
  it.each(Object.entries(RENDERED))(
    "never under-estimates %s, and is within 4px of it",
    (label, rendered) => {
      // An under-estimate is the failure that matters: a column sized from it
      // would clip the pill. Over is the safe direction, and it is bounded:
      // ignoring kerning costs up to 2.4px across these labels, and rounding up
      // to a whole pixel up to 1px more — so 4px, measured worst 3.3px.
      expect(pillWidth(label)).toBeGreaterThanOrEqual(rendered);
      expect(pillWidth(label) - rendered).toBeLessThanOrEqual(4);
    },
  );

  it("treats a character it has no width for as the widest one", () => {
    expect(pillWidth("é")).toBeGreaterThanOrEqual(pillWidth("W"));
  });
});

describe("widestPill", () => {
  it("is 0 for no labels at all", () => {
    expect(widestPill([])).toBe(0);
  });

  it("finds Awaiting Input the widest of the six task statuses", () => {
    const statuses = [
      "Not Started",
      "In Progress",
      "Awaiting Input",
      "On Hold",
      "Completed",
      "Cancelled",
    ];
    expect(widestPill(statuses)).toBe(pillWidth("Awaiting Input"));
    for (const status of statuses) {
      expect(widestPill(statuses)).toBeGreaterThanOrEqual(pillWidth(status));
    }
  });
});
