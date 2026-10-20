import { describe, expect, it } from "vitest";

import {
  blend,
  contrast,
  luminance,
  THRESHOLD,
  TOKEN_PAIRS,
  TOKENS,
} from "./ui-contrast.js";
import { COLOUR, COLOURS } from "./tokens.js";

describe("contrast arithmetic", () => {
  it("matches the WCAG reference values at the extremes", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrast("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
  });

  it("is symmetric", () => {
    expect(contrast(TOKENS.ink, TOKENS.paper)).toBeCloseTo(
      contrast(TOKENS.paper, TOKENS.ink),
      10,
    );
  });

  it("computes relative luminance on the sRGB curve", () => {
    expect(luminance("#000000")).toBe(0);
    expect(luminance("#ffffff")).toBeCloseTo(1, 5);
  });

  it("flattens a translucent colour onto its backdrop", () => {
    expect(blend("#000000", 1, "#ffffff")).toBe("#000000");
    expect(blend("#000000", 0, "#ffffff")).toBe("#ffffff");
    expect(blend("#000000", 0.5, "#ffffff")).toBe("#808080");
  });
});

describe("every token is held to a contrast pair", () => {
  // The anti-drift guard, against the registry rather than a stylesheet: a
  // token added to COLOURS without a pair in TOKEN_PAIRS fails here, which is
  // the only way the class of bug in ui-contrast.ts's header can come back.
  //
  // The comparison is by hex, because a pair stores values, not names. So two
  // tokens that share a hex cannot be told apart: `info-fg` is the same colour
  // as `navy` on purpose (see tokens.ts), and navy's pairs satisfy it here
  // too. The guard is exact for the other twenty-three.
  const used = new Set(TOKEN_PAIRS.flatMap(({ fg, bg }) => [fg, bg]));

  it("has enough pairs that the checks below cannot pass vacuously", () => {
    // 43 today; the floor is set under it so adding a pair never trips
    // it, and well over zero so emptying the list does.
    expect(TOKEN_PAIRS.length).toBeGreaterThan(35);
    expect(COLOURS).toHaveLength(25);
  });

  it.each(COLOURS.map((c) => c.name))("%s appears in at least one pair", (name) => {
    expect(used.has(COLOUR[name])).toBe(true);
  });

  it("derives TOKENS from COLOUR, one entry per token", () => {
    expect(Object.keys(TOKENS)).toHaveLength(COLOURS.length);
    expect(TOKENS.tealDeep).toBe(COLOUR["teal-deep"]);
    expect(TOKENS.priorityLowFg).toBe(COLOUR["priority-low-fg"]);
  });
});

describe("design tokens meet WCAG AA", () => {
  it.each(TOKEN_PAIRS)("$what", ({ fg, bg, kind }) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(THRESHOLD[kind]);
  });

  it("records why the workbook teal cannot carry text", () => {
    // The reason teal-deep exists (Work OS #57). If this ever passes, the token
    // changed and `teal-deep` may no longer be needed.
    expect(contrast(TOKENS.teal, TOKENS.paper)).toBeLessThan(THRESHOLD.text);
    expect(contrast(TOKENS.tealDeep, TOKENS.paper)).toBeGreaterThanOrEqual(
      THRESHOLD.text,
    );
  });

  it("records why the neutral pill uses ink on grid", () => {
    // The neutral pill used to render `ink-muted` on `grid` (Work OS #242). The
    // workbook fill stays the same, but its label must use the full ink token.
    expect(contrast(TOKENS.inkMuted, TOKENS.grid)).toBeCloseTo(4.02, 2);
    expect(contrast(TOKENS.inkMuted, TOKENS.grid)).toBeLessThan(
      THRESHOLD.text,
    );
    expect(contrast(TOKENS.ink, TOKENS.grid)).toBeCloseTo(9.76, 2);
    expect(contrast(TOKENS.ink, TOKENS.grid)).toBeGreaterThanOrEqual(
      THRESHOLD.text,
    );
  });

  it("records why the translucent borders had to be darkened", () => {
    // `warm-fg/40` looked like it used an AA-safe colour but composited to
    // 1.92:1 — the same class of bug as `grid`, hidden behind an alpha (Work OS #57).
    expect(
      contrast(blend(TOKENS.warmFg, 0.4, TOKENS.warmBg), TOKENS.warmBg),
    ).toBeLessThan(THRESHOLD.nonText);
    expect(
      contrast(blend(TOKENS.warmFg, 0.7, TOKENS.warmBg), TOKENS.warmBg),
    ).toBeGreaterThanOrEqual(THRESHOLD.nonText);
  });

  it("records why the grid rule cannot bound a control", () => {
    expect(contrast(TOKENS.grid, TOKENS.paper)).toBeLessThan(THRESHOLD.nonText);
    expect(contrast(TOKENS.gridStrong, TOKENS.paper)).toBeGreaterThanOrEqual(
      THRESHOLD.nonText,
    );
  });
});
