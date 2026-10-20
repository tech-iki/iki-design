import { readFileSync } from "node:fs";
import { Fragment, createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Button } from "./components/button.js";
import { EmptyState, emptyStateClass, emptyStateTextClass } from "./components/empty-state.js";
import { Field, fieldErrorClass, fieldFrameClass, fieldHintClass } from "./components/field.js";
import { ICONS, type IconName } from "./icons.generated.js";
import { Notice, noticeClass, type NoticeTone } from "./components/notice.js";
import { KpiTile } from "./components/kpi-tile.js";
import { PageMain } from "./components/page-main.js";
import { PageTitle } from "./components/page-title.js";
import { Pill } from "./components/pill.js";
import { tones } from "./tones.js";
import * as classes from "./ui-classes.js";

/**
 * The phase 0 components (plan of 20 October 2026): what each one wires that
 * the hand-written sites kept forgetting, rendered through the real component
 * so it is the markup a browser receives — and the §8 blocks that describe
 * them, held to the code the way the class blocks are.
 */

const doc = readFileSync(new URL("../../../docs/design-system.md", import.meta.url), "utf8");

function block(marker: string): string {
  const match = doc.match(new RegExp(`<!-- ${marker} -->\\n\`\`\`\\n([\\s\\S]*?)\\n\`\`\``));
  if (!match) throw new Error(`docs/design-system.md has no ${marker} block`);
  return match[1];
}

const PLACEHOLDER: Readonly<Record<string, string>> = {
  "{touchTarget}": classes.touchTarget,
  "{focusRing}": classes.focusRing,
  "{fieldClass}": classes.fieldClass,
  "{smallFieldClass}": classes.smallFieldClass,
  "{invalidFieldClass}": classes.invalidFieldClass,
  "{labelClass}": classes.labelClass,
  "{primaryButtonClass}": classes.primaryButtonClass,
  "{subtleButtonClass}": classes.subtleButtonClass,
  "{warnButtonClass}": classes.warnButtonClass,
  "{iconButtonClass}": classes.iconButtonClass,
  "{warnIconButtonClass}": classes.warnIconButtonClass,
};

/** The line that starts with `key` (after indentation), its remainder with placeholders expanded. */
function line(body: string, key: string): string {
  const found = body.split("\n").find((l) => l.trimStart().startsWith(`${key} `) || l.trimStart() === key);
  if (!found) throw new Error(`no line for ${key}`);
  let rest = found.trimStart().slice(key.length).trim();
  for (const [k, real] of Object.entries(PLACEHOLDER)) rest = rest.replaceAll(k, real);
  return rest;
}

const html = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el);
const classOf = (markup: string, nth = 0) =>
  [...markup.matchAll(/class="([^"]*)"/g)].map((m) => m[1])[nth];

describe("Button", () => {
  const variants = ["primary", "subtle", "warn", "icon", "warnIcon"] as const;
  const expected = {
    primary: classes.primaryButtonClass,
    subtle: classes.subtleButtonClass,
    warn: classes.warnButtonClass,
    icon: classes.iconButtonClass,
    warnIcon: classes.warnIconButtonClass,
  };

  it("is the class string of its variant, nothing added, and §8 says so", () => {
    const body = block("components:button");
    for (const variant of variants) {
      const markup = html(createElement(Button, { variant, children: "Save" }));
      expect(classOf(markup), variant).toBe(expected[variant]);
      expect(line(body, `Button variant=${variant}`)).toBe(expected[variant]);
    }
  });

  it("defaults to type=button, primary, and appends className", () => {
    const markup = html(createElement(Button, { className: "w-full", children: "Save" }));
    expect(markup).toContain('type="button"');
    expect(classOf(markup)).toBe(`${classes.primaryButtonClass} w-full`);
    expect(html(createElement(Button, { type: "submit", children: "Save" }))).toContain('type="submit"');
  });

  it("pending disables, sets aria-busy and gives the verb its ellipsis", () => {
    const markup = html(createElement(Button, { pending: true, children: "Save" }));
    expect(markup).toMatch(/<button[^>]* disabled=""/);
    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain(">Save…<");
    expect(html(createElement(Button, { pending: true, pendingLabel: "Signing in…", children: "Sign in" }))).toContain(
      ">Signing in…<",
    );
    expect(html(createElement(Button, { pending: true, children: "Save." }))).toContain(">Save…<");
    const rest = html(createElement(Button, { children: "Save" }));
    expect(rest).not.toMatch(/<button[^>]* disabled=""/);
    expect(rest).not.toContain("aria-busy");
  });

  it("passes the rest through", () => {
    expect(html(createElement(Button, { name: "intent", value: "save", children: "x" }))).toContain('name="intent"');
  });
});

describe("Field", () => {
  const input = (props: Record<string, unknown> = {}) => createElement("input", { name: "title", ...props });

  it("wraps the control in the label, with id and aria-describedby for the hint beside it", () => {
    const markup = html(createElement(Field, { label: "Title", hint: "Short.", children: input() }));
    expect(classOf(markup, 0)).toBe(fieldFrameClass);
    expect(classOf(markup, 1)).toBe(classes.labelClass);
    expect(markup).toMatch(/^<div[^>]*><label[^>]*>Title<input/);
    // The hint is the label's sibling, so the label's name is "Title" alone.
    expect(markup).toMatch(/<\/label><span id="[^"]+-hint"/);
    const id = markup.match(/<input[^>]* id="([^"]+)"/)?.[1];
    expect(id).toBeTruthy();
    expect(markup).toContain(`aria-describedby="${id}-hint"`);
    expect(markup).toContain(`<span id="${id}-hint" class="${fieldHintClass}">Short.</span>`);
    expect(classOf(markup, 2)).toBe(classes.fieldClass);
    expect(markup).not.toContain("aria-invalid");
  });

  it("an error marks the field invalid and is announced", () => {
    const markup = html(createElement(Field, { label: "Due", hint: "A date", error: "June has 30 days.", children: input() }));
    const id = markup.match(/<input[^>]* id="([^"]+)"/)?.[1];
    expect(markup).toContain('aria-invalid="true"');
    expect(markup).toContain(`aria-describedby="${id}-error ${id}-hint"`);
    expect(classOf(markup, 2)).toBe(classes.invalidFieldClass);
    expect(markup).toContain(`<span id="${id}-error" role="alert" class="${fieldErrorClass}">June has 30 days.</span>`);
    expect(markup).toMatch(/<\/label><span id="[^"]+-error"/);
  });

  it("appends a class the child brought, takes size=small, and merges its own describedby", () => {
    const markup = html(
      createElement(Field, {
        label: "Note",
        hint: "h",
        size: "small",
        children: input({ className: "w-24", "aria-describedby": "outer", id: "note" }),
      }),
    );
    expect(classOf(markup, 2)).toBe(`${classes.smallFieldClass} w-24`);
    expect(markup).toContain('aria-describedby="outer note-hint"');
    expect(markup).toContain('id="note"');
    const smallInvalid = html(createElement(Field, { label: "N", size: "small", error: "e", children: input() }));
    expect(classOf(smallInvalid, 2)).toBe(`${classes.smallFieldClass} border-health-overdue-fg bg-health-overdue-bg`);
  });

  it("refuses a fragment, which it could not wire", () => {
    expect(() =>
      html(createElement(Field, { label: "N", children: createElement(Fragment, null, input()) } as never)),
    ).toThrow(/fragment/);
  });

  it("a disabled control draws its own state from fieldClass", () => {
    const markup = html(createElement(Field, { label: "Owner", children: input({ disabled: true }) }));
    expect(markup).toMatch(/<input[^>]* disabled=""/);
    expect(classes.fieldClass).toContain("disabled:bg-paper-tint");
    expect(classes.fieldClass).toContain("disabled:text-ink-muted");
    expect(classes.smallFieldClass).toContain("disabled:bg-paper-tint");
  });

  it("§8 shows its parts", () => {
    const body = block("components:field");
    expect(line(body, "Field")).toBe(`<div>    ${fieldFrameClass}`);
    expect(line(body, "label")).toBe(`<label>  ${classes.labelClass}   wrapping the label text and the control`);
    const [base, small, invalid] = line(body, "class").split(" | ");
    expect(base).toBe(classes.fieldClass);
    expect(small).toBe(`${classes.smallFieldClass} when size=small`);
    expect(`${classes.fieldClass} ${invalid.replace("+ ", "").replace(" when error", "")}`).toBe(classes.invalidFieldClass);
    expect(line(body, "hint")).toBe(fieldHintClass);
    expect(line(body, "error")).toBe(`${fieldErrorClass}   (role="alert")`);
  });
});

describe("Notice", () => {
  const roles: Record<NoticeTone, string> = { info: "status", positive: "status", warm: "alert", overdue: "alert" };

  it("takes a tone's pair and derives the role, and §8 says so", () => {
    const body = block("components:notice");
    expect(line(body, "Notice")).toBe(`${noticeClass} {tone}`);
    for (const tone of Object.keys(roles) as NoticeTone[]) {
      const markup = html(createElement(Notice, { tone, children: "Saved." }));
      expect(markup).toContain(`role="${roles[tone]}"`);
      expect(classOf(markup), tone).toBe(`${noticeClass} ${tones[tone]}`);
      expect(line(body, `tone=${tone}`).replace(/\s+/g, " ")).toBe(`${tones[tone]} (role="${roles[tone]}")`);
    }
  });

  it("defaults to info, and an explicit role in the rest wins", () => {
    expect(html(createElement(Notice, { children: "x" }))).toContain('role="status"');
    expect(html(createElement(Notice, { tone: "warm", role: "status", children: "x" }))).toContain('role="status"');
  });
});

describe("EmptyState", () => {
  it("is a muted sentence in a box, with the action beneath, and §8 says so", () => {
    const body = block("components:notice");
    expect(line(body, "EmptyState")).toBe(emptyStateClass);
    expect(line(body, "sentence")).toBe(emptyStateTextClass);
    const plain = html(createElement(EmptyState, { children: "No tasks yet." }));
    expect(plain).toBe(`<div class="${emptyStateClass}"><p class="${emptyStateTextClass}">No tasks yet.</p></div>`);
    const withAction = html(
      createElement(EmptyState, { action: createElement(Button, { children: "New task" }), children: "No tasks yet." }),
    );
    expect(withAction).toMatch(/<\/p><div><button/);
  });
});

describe("the rest reaches every root", () => {
  it("Pill, KpiTile, PageTitle, PageMain carry a data attribute", () => {
    expect(html(createElement(Pill, { "data-x": "1", children: "x" } as never))).toContain('data-x="1"');
    expect(html(createElement(KpiTile, { label: "L", value: 1, "data-x": "1" } as never))).toContain('data-x="1"');
    expect(html(createElement(PageTitle, { title: "T", "data-x": "1" } as never))).toContain('data-x="1"');
    const main = html(createElement(PageMain, { "data-x": "1", children: "x" } as never));
    expect(main).toContain('data-x="1"');
    expect(main).toContain('id="main-content"');
  });

  it("KpiTile's tones are the pill tones' names", () => {
    expect(html(createElement(KpiTile, { label: "L", value: 1, tone: "overdue" }))).toContain("text-health-overdue-fg");
    expect(html(createElement(KpiTile, { label: "L", value: 1, tone: "warm" }))).toContain("text-warm-fg");
  });
});

describe("§8's icon block names every 20px glyph", () => {
  it("lists exactly the rail names", () => {
    const listed = line(block("components:icon"), "Icon size=20").split("the rail: ")[1].split(" ").sort();
    const rail = (Object.keys(ICONS) as IconName[]).filter((n) => ICONS[n].size === 20).sort();
    expect(listed).toEqual(rail);
  });
});
