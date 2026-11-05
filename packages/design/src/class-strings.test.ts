import { describe, expect, it } from "vitest";

import * as classes from "./ui-classes.js";

/**
 * What a class string cannot say about itself, held by test.
 *
 * Two utilities for one property, under one variant, are not an override: the
 * order of a `class` attribute means nothing, and the stylesheet's own order
 * decides. `menuTriggerClass` appended `px-1.5 py-0.5` to a string already
 * holding `px-2.5 py-1.5`, and the compact padding it asked for never applied;
 * the browser computed `6px 10px`. Reading the string gave no hint of that.
 */

/** The properties whose conflicts have changed what a control measures. */
const MEASURED_PROPERTIES: readonly (readonly [string, RegExp])[] = [
  ["padding", /^p-/],
  ["inline padding", /^px-/],
  ["block padding", /^py-/],
  ["font size", /^text-(xs|sm|base|lg|xl|[2-9]xl|\[\d+px\])$/],
  ["font weight", /^font-(normal|medium|semibold|bold)$/],
  ["minimum height", /^min-h-/],
  ["minimum width", /^min-w-/],
];

/** The conflicts in a string: each is `property under variant: a, b`. */
function conflicts(classString: string): string[] {
  const seen = new Map<string, string[]>();
  for (const token of classString.split(/\s+/).filter(Boolean)) {
    const split = token.lastIndexOf(":");
    const variant = token.slice(0, split + 1);
    const utility = token.slice(split + 1);
    for (const [property, pattern] of MEASURED_PROPERTIES) {
      if (!pattern.test(utility)) continue;
      const key = `${property} under "${variant}"`;
      seen.set(key, [...(seen.get(key) ?? []), token]);
    }
  }
  return [...seen].filter(([, tokens]) => tokens.length > 1).map(([key, tokens]) => `${key}: ${tokens.join(", ")}`);
}

const STRINGS = Object.entries(classes).filter(
  (entry): entry is [string, string] => typeof entry[1] === "string",
);

describe("no class string sets a measured property twice", () => {
  it("finds the strings it is meant to read", () => {
    expect(STRINGS.length).toBeGreaterThan(40);
  });

  it.each(STRINGS)("%s", (_name, classString) => {
    expect(conflicts(classString)).toEqual([]);
  });

  // The control: the bug this exists for, restated, has to be caught.
  it("catches a padding override appended to a string", () => {
    expect(conflicts("px-2.5 py-1.5 text-xs px-1.5 py-0.5 text-[11px]")).toEqual([
      'inline padding under "": px-2.5, px-1.5',
      'block padding under "": py-1.5, py-0.5',
      'font size under "": text-xs, text-[11px]',
    ]);
  });

  it("does not count the same property under another variant", () => {
    expect(conflicts("min-h-11 md:min-h-0 text-sm hover:text-xs")).toEqual([]);
  });
});

describe("the Move to… trigger", () => {
  // `text-xs` carried a line height as well as a size. Replacing it with an
  // arbitrary size alone let the inherited 1.5 through, and the trigger grew.
  it("sets the line height `text-xs` was supplying", () => {
    expect(classes.menuTriggerClass.split(" ")).toContain("leading-4");
  });

  it("is otherwise the subtle button", () => {
    expect(classes.menuTriggerClass.replace(" text-[11px] leading-4 ", " text-xs ")).toBe(classes.subtleButtonClass);
  });
});

describe("a field's value is not its label", () => {
  // `Field` nests the control inside `labelClass`, whose `font-medium` would
  // otherwise be inherited: browsers computed typed text at 500.
  it.each(["fieldClass", "smallFieldClass", "invalidFieldClass"] as const)("%s sets its own weight", (name) => {
    expect(classes[name].split(" ")).toContain("font-normal");
  });

  it("the label keeps the weight the value gives up", () => {
    expect(classes.labelClass.split(" ")).toContain("font-medium");
  });
});

describe("a row chosen with a thumb has the touch floor below md", () => {
  it.each(["menuItemClass", "popoverOptionClass", "comboboxOptionClass"] as const)("%s", (name) => {
    const tokens = classes[name].split(" ");
    expect(tokens).toContain("min-h-11");
    expect(tokens).toContain("md:min-h-0");
    // A taller row has to centre its text, or the label sits at the top of it.
    expect(tokens).toContain("items-center");
  });
});
