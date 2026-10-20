import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Pill } from "./components/pill.js";
import { NEUTRAL, tones, type PillTone } from "./tones.js";

/**
 * A pill is one line, always.
 *
 * `Pill` had no `whitespace-nowrap`, so a two-word label ("Not Started",
 * "Awaiting Input", "Due Soon") broke onto a second line wherever its
 * container was narrower than the label. The rounded-full ends then stretch
 * into a tall lozenge that no longer reads as a status chip.
 *
 * It had been fixed twice before at the call site — the declared Status column
 * width (Work OS #80) and a `whitespace-nowrap` wrapper in the monthly work
 * report — which is exactly why it recurred: every new caller had to remember.
 * The rule now lives in the component, and this test renders the real component
 * rather than reading its source, so it is the class list a browser receives
 * that is held.
 *
 * Work OS also scans every `<Pill className=…>` call site in the app for a
 * competing `whitespace-*` class. That scan guards an app's callers, not this
 * package, so it stays in Work OS; only the render-based checks live here.
 */

const classesOf = (html: string) =>
  (html.match(/class="([^"]*)"/)?.[1] ?? "").split(/\s+/);

/**
 * Render a real `Pill` and return the classes a browser would receive.
 *
 * The label goes in as `createElement`'s third argument, as the lint rule
 * wants; the props type still demands `children`, so the one cast lives here
 * rather than at every call.
 */
const render = (
  props: Omit<ComponentProps<typeof Pill>, "children">,
  label: string,
) =>
  classesOf(
    renderToStaticMarkup(
      createElement(Pill, props as ComponentProps<typeof Pill>, label),
    ),
  );

const everyTone: PillTone[] = Object.values(tones);

describe("Pill never breaks its label across lines", () => {
  it("covers a plausible number of tones", () => {
    // If the tones were ever emptied, the loop below would pass vacuously.
    expect(new Set(everyTone).size).toBeGreaterThan(5);
  });

  it.each([...new Set(everyTone)])("is one line with tone %s", (tone) => {
    expect(render({ tone }, "Not Started")).toContain("whitespace-nowrap");
  });

  it("is one line with no tone at all", () => {
    expect(render({}, "Awaiting Input")).toContain("whitespace-nowrap");
  });

  it("stays one line when a caller adds layout classes", () => {
    // The policy board's compact pill passes a smaller size through className.
    expect(render({ tone: NEUTRAL, className: "text-[10px]" }, "Not Started")).toEqual(
      expect.arrayContaining(["whitespace-nowrap", "text-[10px]"]),
    );
  });
});
