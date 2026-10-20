import { describe, expect, it } from "vitest";

import { COLOUR, type ColourToken } from "./tokens.js";
import { NEUTRAL, POSITIVE, TONE_TOKENS, tones, type PillTone, type ToneName } from "./tones.js";
import { contrast, THRESHOLD, TOKEN_PAIRS } from "./ui-contrast.js";

const names = Object.keys(tones) as ToneName[];

describe("tones", () => {
  it("has the nine tones, so the loops below cannot pass vacuously", () => {
    expect(names).toHaveLength(9);
    expect(Object.keys(TONE_TOKENS).sort()).toEqual([...names].sort());
  });

  it("keeps the two constants Work OS imports by name", () => {
    expect(NEUTRAL).toBe("bg-grid text-ink");
    expect(POSITIVE).toBe("bg-health-ontrack-bg text-health-ontrack-fg");
  });

  it.each(names)("%s is the classes of the two tokens behind it", (name) => {
    const { bg, fg } = TONE_TOKENS[name];
    const classes = `bg-${bg} text-${fg}`;
    // Cancelled is the neutral pair struck through; no other tone has a suffix.
    if (name === "cancelled") {
      expect(tones[name]).toBe(`${classes} line-through`);
    } else {
      expect(tones[name]).toBe(classes);
    }
  });

  it.each(names)("%s has a meaning to show beside its ratio", (name) => {
    expect(TONE_TOKENS[name].meaning.length).toBeGreaterThan(5);
  });

  it.each(names)("%s names real tokens", (name) => {
    const { bg, fg } = TONE_TOKENS[name];
    for (const token of [bg, fg] satisfies ColourToken[]) {
      expect(COLOUR[token]).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  // A tone without a contrast pair is a colour nobody measured.
  it.each(names)("%s has a text pair in TOKEN_PAIRS that clears 4.5:1", (name) => {
    const { bg, fg } = TONE_TOKENS[name];
    const pair = TOKEN_PAIRS.find(
      (p) => p.kind === "text" && p.fg === COLOUR[fg] && p.bg === COLOUR[bg],
    );
    expect(pair, `no text pair for ${name}: ${fg} on ${bg}`).toBeDefined();
    expect(contrast(COLOUR[fg], COLOUR[bg])).toBeGreaterThanOrEqual(THRESHOLD.text);
  });
});

/*
 * Exhaustiveness is held by the type checker, not by vitest, which does not
 * type-check. `Record<PillTone, ToneName>` must name every member of the union
 * and nothing outside it, so adding a `PillTone` that no tone produces — or
 * removing one a tone still produces — fails `npm run typecheck`. The test
 * below then holds the runtime half: each tone round-trips through the map.
 */
const TONE_OF: Record<PillTone, ToneName> = {
  "bg-grid text-ink": "neutral",
  "bg-health-ontrack-bg text-health-ontrack-fg": "positive",
  "bg-health-overdue-bg text-health-overdue-fg": "overdue",
  "bg-warm-bg text-warm-fg": "warm",
  "bg-health-stale-bg text-health-stale-fg": "stale",
  "bg-teal-soft text-navy": "completed",
  "bg-info-bg text-info-fg": "info",
  "bg-priority-low-bg text-priority-low-fg": "low",
  "bg-grid text-ink line-through": "cancelled",
};

describe("PillTone", () => {
  it("is produced, member for member, by the tones", () => {
    expect(Object.keys(TONE_OF)).toHaveLength(names.length);
    for (const name of names) expect(TONE_OF[tones[name]]).toBe(name);
  });
});
