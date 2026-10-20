import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Icon } from "./components/icon.js";
import { ICONS, type IconName } from "./icons.generated.js";

/**
 * The icon vocabulary is two sizes and two strokes, and nothing else.
 *
 * Icons are named by meaning and drawn by Lucide, generated into
 * `icons.generated.tsx` by `scripts/build-icons.ts`. These tests hold the
 * rules that make the set one family: the size/stroke pairs, the two section 8
 * judgements (settings is sliders, drop is a tray), the redistributed ISC
 * notice, and that the component renders on the server. Like the Pill test, the
 * rendering checks read what a browser would receive.
 */

const entries = Object.entries(ICONS) as [IconName, (typeof ICONS)[IconName]][];
const here = import.meta.dirname;
const read = (file: string) => readFileSync(join(here, file), "utf8");

const render = (name: IconName) => renderToStaticMarkup(createElement(Icon, { name }));
const attr = (html: string, key: string) => html.match(new RegExp(`\\s${key}="([^"]*)"`))?.[1];
const firstOfSize = (size: 16 | 20) => entries.find(([, v]) => v.size === size)![0];

/** The names whose drawing is a bin: the §8 judgement, as a function so a control can run it. */
function binSources(map: Record<string, { source: string }>): string[] {
  return Object.entries(map)
    .filter(([, v]) => v.source === "trash" || v.source === "trash-2")
    .map(([name]) => name);
}

describe("the vocabulary", () => {
  it("has at least 45 names", () => {
    expect(entries.length).toBeGreaterThanOrEqual(45);
  });

  it("puts every name at exactly 16px/1.5 or 20px/1.4", () => {
    for (const [name, { size, stroke }] of entries) {
      const pair = `${size}/${stroke}`;
      expect(["16/1.5", "20/1.4"], `${name} is ${pair}`).toContain(pair);
    }
  });

  it("uses both sizes", () => {
    expect(new Set(entries.map(([, v]) => v.size))).toEqual(new Set([16, 20]));
  });

  it("draws settings as sliders and drop as a tray, never a cog or a bin", () => {
    expect(ICONS.settings.source).toBe("sliders-horizontal");
    expect(ICONS.drop.source).toBe("download");
    for (const [name, { source }] of entries) {
      expect(["trash", "trash-2"], `${name} draws ${source}`).not.toContain(source);
      expect(source, `${name} draws ${source}`).not.toMatch(/^(settings|cog)/);
    }
  });

  it("gives every icon at least one node and a meaning", () => {
    for (const [name, v] of entries) {
      expect(v.nodes.length, name).toBeGreaterThan(0);
      expect(v.meaning.length, name).toBeGreaterThan(0);
    }
  });

  it("negative control: a bin would be caught by the source check", () => {
    const fake = { ...ICONS, drop: { ...ICONS.drop, source: "trash-2" } };
    expect(binSources(ICONS)).toEqual([]);
    expect(binSources(fake)).toEqual(["drop"]);
  });
});

describe("the rendered icon", () => {
  it.each([
    [16, "1.5"],
    [20, "1.4"],
  ] as const)("a %ipx icon is aria-hidden, currentColor, unfilled, stroke %s", (size, stroke) => {
    const html = render(firstOfSize(size));
    expect(attr(html, "aria-hidden")).toBe("true");
    expect(attr(html, "stroke")).toBe("currentColor");
    expect(attr(html, "width")).toBe(String(size));
    expect(attr(html, "height")).toBe(String(size));
    expect(attr(html, "stroke-width")).toBe(stroke);
    expect(attr(html, "viewBox")).toBe("0 0 24 24");
    expect(html).not.toMatch(/fill="(?!none")/);
  });

  it("passes className and style through, but not size, stroke or the hidden state", () => {
    const html = renderToStaticMarkup(
      createElement(Icon, {
        name: "settings",
        className: "text-sm",
        style: { opacity: 0.5 },
        // What the type forbids, forced through, must still lose to the vocabulary.
        ...({ width: 48, height: 48, strokeWidth: 3, "aria-hidden": false, fill: "currentColor" } as object),
      }),
    );
    expect(html).toContain('class="text-sm"');
    expect(html).toContain("opacity:0.5");
    expect(attr(html, "width")).toBe("20");
    expect(attr(html, "height")).toBe("20");
    expect(attr(html, "stroke-width")).toBe("1.4");
    expect(attr(html, "aria-hidden")).toBe("true");
    expect(attr(html, "fill")).toBe("none");
  });

  // Stroke-only, with one exception the vocabulary allows: the key's bow has a
  // dot drawn as a fill, because a 0.5px stroked circle disappears at 16px.
  const FILLED_ALLOWED: Record<string, number> = { key: 1 };

  it("every glyph is stroke-only, bar the key's dot", () => {
    for (const [name, v] of Object.entries(ICONS)) {
      const filled = v.nodes.filter(([, attrs]) => attrs.fill !== undefined).length;
      expect(filled, name).toBe(FILLED_ALLOWED[name] ?? 0);
    }
  });

  it("negative control: the fill check rejects a filled glyph", () => {
    expect('<svg fill="currentColor"></svg>').toMatch(/fill="(?!none")/);
  });
});

describe("the sources", () => {
  const generated = read("icons.generated.tsx");

  it("carries the ISC notice for the redistributed Lucide paths, and Feather's MIT one", () => {
    expect(generated).toContain("Cole Bemis");
    expect(generated).toContain("MIT");
    expect(generated).toContain("ISC");
    expect(generated).toContain("Lucide");
    expect(generated).toContain("do not edit");
  });

  it("keeps the component server-safe", () => {
    expect(read("components/icon.tsx")).not.toMatch(/["']use client["']/);
  });
});
