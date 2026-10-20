// @vitest-environment jsdom
/**
 * The phase 2 components (plan of 20 October 2026): `TableFrame`, the styled
 * natives `Checkbox`, `Radio` and `RadioGroup`, and the three on Base UI —
 * `Tooltip`, `Tabs` and `Combobox` — driven in a DOM, as `overlays.test.tsx`
 * drives phase 1. Class strings are asserted against the exported constants,
 * never a copy; the §8 component blocks are held to what renders.
 */
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Button } from "./components/button.js";
import { Checkbox, Radio, RadioGroup } from "./components/choice.js";
import { Combobox } from "./components/combobox.js";
import { Drawer } from "./components/drawer.js";
import { Tab, TabList, TabPanel, Tabs } from "./components/tabs.js";
import { Tooltip } from "./components/tooltip.js";
import { Field, fieldErrorClass, fieldHintClass } from "./components/field.js";
import { ActionsHeader, TableFrame, rowClass } from "./components/table-frame.js";
import * as classes from "./ui-classes.js";

afterEach(cleanup);

const doc = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "docs", "design-system.md"), "utf8");

function block(marker: string): string {
  const match = doc.match(new RegExp(`<!-- ${marker} -->\\n\`\`\`\\n([\\s\\S]*?)\\n\`\`\``));
  if (!match) throw new Error(`docs/design-system.md has no ${marker} block`);
  return match[1];
}

/** The line that starts with `key`, its remainder. */
function line(body: string, key: string): string {
  const found = body.split("\n").find((l) => l.trimStart().startsWith(`${key} `));
  if (!found) throw new Error(`no line for ${key}`);
  return found.trimStart().slice(key.length).trim();
}

/** Every token of `expected` is present on `el`. */
function hasClasses(el: Element, expected: string) {
  const have = new Set(el.className.split(/\s+/));
  return expected.split(/\s+/).filter(Boolean).every((c) => have.has(c));
}

describe("TableFrame", () => {
  const rows = (
    <>
      <thead className={classes.theadClass}>
        <tr>
          <th scope="col" className={classes.thClass}>Task</th>
          <ActionsHeader />
        </tr>
      </thead>
      <tbody className={classes.tbodyClass}>
        <tr className={rowClass(0)}>
          <td data-label="Task" className={classes.tdClass}>Draft</td>
          <td className={classes.tdClass} />
        </tr>
      </tbody>
    </>
  );

  it("is a bordered frame round a table named by its caption, and no tab stop by default", () => {
    render(<TableFrame caption="Tasks">{rows}</TableFrame>);
    const table = screen.getByRole("table", { name: "Tasks" });
    const frame = table.parentElement!;
    expect(frame.className).toBe(classes.tableFrameClass);
    expect(table.className).toBe(`${classes.tableClass} w-full`);
    expect(frame.hasAttribute("tabindex")).toBe(false);
    expect(frame.getAttribute("role")).toBeNull();
    expect(table.querySelector("caption")).toBeNull();
  });

  it("makes the header sticky only when bounded, and never puts a z-index on the table", () => {
    render(<TableFrame caption="Bounded" maxHeightClass={classes.gridHeightClass}>{rows}</TableFrame>);
    const table = screen.getByRole("table", { name: "Bounded" });
    expect(hasClasses(table.parentElement!, `${classes.tableFrameClass} ${classes.gridHeightClass}`)).toBe(true);
    expect(hasClasses(table, classes.tableStickyHeadClass)).toBe(true);
    expect(table.className).not.toMatch(/(^|\s|:)z-/);
    expect(classes.tableStickyHeadClass).not.toMatch(/z-/);
    expect(classes.thClass.split(" ")).toContain("z-10");
  });

  it("stacks below md, dropping the bound there, and fixes the layout when asked", () => {
    render(
      <TableFrame caption="Stacked" stacked fixed maxHeightClass={classes.gridHeightClass} minWidthClass="md:min-w-3xl">
        {rows}
      </TableFrame>,
    );
    const table = screen.getByRole("table", { name: "Stacked" });
    expect(hasClasses(table, `${classes.tableStackedClass} table-fixed md:min-w-3xl`)).toBe(true);
    expect(hasClasses(table.parentElement!, `${classes.tableFrameStackedClass} ${classes.tableFrameFixedClass}`)).toBe(true);
  });

  it("is a named, ringed region tab stop when scrollable by keyboard", async () => {
    render(<TableFrame caption="Wide" scrollableByKeyboard>{rows}</TableFrame>);
    const region = screen.getByRole("region", { name: "Wide" });
    expect(region.tabIndex).toBe(0);
    expect(hasClasses(region, classes.focusRing)).toBe(true);
    await userEvent.tab();
    expect(document.activeElement).toBe(region);
  });

  it("is a read-only grid when the caller says so, with rest on the frame and tableProps on the table", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <TableFrame caption="Grid" role="grid" readOnly ref={ref} data-x="1" tableProps={{ "aria-describedby": "hint", style: { width: 640 } }}>
        {rows}
      </TableFrame>,
    );
    const grid = screen.getByRole("grid", { name: "Grid" });
    expect(grid.getAttribute("aria-readonly")).toBe("true");
    expect(grid.getAttribute("aria-describedby")).toBe("hint");
    expect(grid.style.width).toBe("640px");
    expect(ref.current).toBe(grid.parentElement);
    expect(ref.current?.dataset.x).toBe("1");
  });

  it("stripes from the data index, and a state tint darkens instead", () => {
    expect(rowClass(0)).toBe("bg-paper hover:bg-row-hover");
    expect(rowClass(1)).toBe("bg-paper-tint hover:bg-row-hover");
    expect(rowClass(2, "bg-row-error")).toBe("bg-row-error hover:brightness-95");
  });

  it("names the actions column for assistive technology only", () => {
    render(<TableFrame caption="Actions">{rows}</TableFrame>);
    const header = screen.getByRole("columnheader", { name: "Actions" });
    expect(header.className).toBe(classes.thClass);
    expect(header.querySelector(".sr-only")?.textContent).toBe("Actions");
  });

  it("§8 shows how the frame and the table are assembled", () => {
    const body = block("components:table");
    expect(line(body, "TableFrame")).toContain("{tableFrameClass} {maxHeightClass}");
    expect(line(body, "table")).toContain("{tableClass} {tableStickyHeadClass when bounded}");
    expect(line(body, "rowClass(i)")).toContain("bg-paper | bg-paper-tint (odd)");
  });
});

describe("Checkbox and Radio", () => {
  it("is a label wrapping the native input, named by its words, with the exported classes", () => {
    render(<Checkbox label="Share with everyone" name="share" />);
    const box = screen.getByRole("checkbox", { name: "Share with everyone" });
    expect(box.className).toBe(classes.choiceInputClass);
    expect(box.getAttribute("name")).toBe("share");
    const label = box.closest("label")!;
    expect(label.className).toBe(classes.choiceLabelClass);
  });

  it("toggles with a click on its words and with Space", async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Overdue only" onChange={onChange} />);
    const box = screen.getByRole("checkbox", { name: "Overdue only" });
    await userEvent.click(screen.getByText("Overdue only"));
    expect((box as HTMLInputElement).checked).toBe(true);
    box.focus();
    await userEvent.keyboard(" ");
    expect((box as HTMLInputElement).checked).toBe(false);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("does not toggle when disabled, and the row carries the muted state", async () => {
    render(<Checkbox label="Locked" disabled className="sm:col-span-2" />);
    const box = screen.getByRole("checkbox", { name: "Locked" });
    expect((box as HTMLInputElement).disabled).toBe(true);
    await userEvent.click(screen.getByText("Locked"));
    expect((box as HTMLInputElement).checked).toBe(false);
    const label = box.closest("label")!;
    expect(hasClasses(label, "has-disabled:text-ink-muted sm:col-span-2")).toBe(true);
  });

  it("takes the accent from a token and keeps the touch floor below md", () => {
    expect(classes.choiceInputClass).toContain("accent-teal-deep");
    expect(classes.choiceInputClass).toContain(classes.focusRing);
    expect(classes.choiceLabelClass).toMatch(/\bmin-h-11\b.*\bmd:min-h-0\b/);
  });
});

describe("RadioGroup", () => {
  it("is a fieldset named by its legend, giving its name to each Radio", async () => {
    function Group() {
      const [value, setValue] = useState("week");
      return (
        <RadioGroup legend="Group by" name="group-by" hint="Applies to the grid.">
          <Radio label="Week" value="week" checked={value === "week"} onChange={() => setValue("week")} />
          <Radio label="Owner" value="owner" checked={value === "owner"} onChange={() => setValue("owner")} />
          <Radio label="Own name" name="other" value="x" readOnly />
        </RadioGroup>
      );
    }
    render(<Group />);
    const group = screen.getByRole("group", { name: "Group by" });
    expect(group.tagName).toBe("FIELDSET");
    expect(group.className).toBe(classes.choiceGroupClass);
    expect(group.querySelector("legend")?.className).toBe(classes.choiceLegendClass);
    const [week, owner, own] = screen.getAllByRole("radio");
    expect(week.getAttribute("name")).toBe("group-by");
    expect(owner.getAttribute("name")).toBe("group-by");
    expect(own.getAttribute("name")).toBe("other");
    await userEvent.click(screen.getByText("Owner"));
    expect((owner as HTMLInputElement).checked).toBe(true);
    expect((week as HTMLInputElement).checked).toBe(false);
    const hint = screen.getByText("Applies to the grid.");
    expect(hint.className).toBe(fieldHintClass);
    expect(group.getAttribute("aria-describedby")).toBe(hint.id);
  });

  it("names a Radio wrapped in layout elements too", () => {
    render(
      <RadioGroup legend="Sort" name="sort">
        <div className="flex gap-3">
          <Radio label="Due" value="due" />
          <span>
            <Radio label="Name" value="name" />
          </span>
        </div>
      </RadioGroup>,
    );
    for (const radio of screen.getAllByRole("radio")) expect(radio.getAttribute("name")).toBe("sort");
  });

  it("announces an error and joins it to the group; disabled disables every radio", () => {
    render(
      <RadioGroup legend="Sort" name="sort" error="Choose a sort." disabled>
        <Radio label="Due" value="due" />
        <Radio label="Name" value="name" />
      </RadioGroup>,
    );
    const alert = screen.getByRole("alert");
    expect(alert.className).toBe(fieldErrorClass);
    expect(screen.getByRole("group", { name: "Sort" }).getAttribute("aria-describedby")).toBe(alert.id);
    for (const radio of screen.getAllByRole("radio")) expect(radio.matches(":disabled")).toBe(true);
  });

  it("§8 shows the parts", () => {
    const body = block("components:choices");
    expect(line(body, "Checkbox")).toContain("{choiceLabelClass}");
    expect(line(body, "RadioGroup")).toContain("<fieldset>");
  });
});

describe("server rendering", () => {
  it("renders the server-safe ones to static markup", () => {
    const markup = renderToStaticMarkup(
      <>
        <TableFrame caption="S">
          <tbody />
        </TableFrame>
        <Checkbox label="A" />
        <RadioGroup legend="B" name="b">
          <Radio label="C" />
        </RadioGroup>
      </>,
    );
    expect(markup).toContain('aria-label="S"');
    expect(markup).toContain('type="checkbox"');
    expect(markup).toContain('name="b"');
  });
});

describe("Tooltip", () => {
  function IconTip() {
    return (
      <Tooltip content="Expand record" delay={0}>
        <Button variant="icon" title="Expand record">
          <span aria-hidden="true">+</span>
          <span className="sr-only">Expand record</span>
        </Button>
      </Tooltip>
    );
  }

  it("leaves the trigger named by its sr-only label, with no title and no description", () => {
    render(<IconTip />);
    const button = screen.getByRole("button", { name: "Expand record" });
    expect(button.hasAttribute("title")).toBe(false);
    expect(button.hasAttribute("aria-describedby")).toBe(false);
    expect(button.getAttribute("type")).toBe("button");
    expect(button.className).toBe(classes.iconButtonClass);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("opens on keyboard focus with the exported class, and Escape closes it", async () => {
    render(<IconTip />);
    await userEvent.tab();
    const tip = await screen.findByRole("tooltip");
    expect(tip.textContent).toBe("Expand record");
    expect(tip.className).toBe(classes.tooltipClass);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Expand record" }));
  });

  it("opens on mouse hover and closes when the pointer leaves", async () => {
    render(<IconTip />);
    const button = screen.getByRole("button", { name: "Expand record" });
    await userEvent.hover(button);
    expect(await screen.findByRole("tooltip")).toBeTruthy();
    await userEvent.unhover(button);
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
  });

  it("does not open on touch", async () => {
    render(<IconTip />);
    const button = screen.getByRole("button", { name: "Expand record" });
    await userEvent.pointer({ keys: "[TouchA]", target: button });
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("stays shut when disabled", async () => {
    render(
      <Tooltip content="Hint" disabled delay={0}>
        <Button>Go</Button>
      </Tooltip>,
    );
    await userEvent.tab();
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});

describe("Tabs", () => {
  function Editor({ activation, onValueChange }: { activation?: "automatic" | "manual"; onValueChange?: (v: string) => void }) {
    return (
      <Tabs defaultValue="edit" onValueChange={onValueChange}>
        <TabList label="Edit or preview" activation={activation}>
          <Tab value="edit">Edit</Tab>
          <Tab value="preview">Preview</Tab>
          <Tab value="history" disabled>History</Tab>
        </TabList>
        <TabPanel value="edit">Edit panel</TabPanel>
        <TabPanel value="preview">Preview panel</TabPanel>
        <TabPanel value="history">History panel</TabPanel>
      </Tabs>
    );
  }

  it("is an APG tablist with the exported classes and one tab stop", async () => {
    render(<Editor />);
    const list = screen.getByRole("tablist", { name: "Edit or preview" });
    expect(list.className).toBe(classes.tabListClass);
    const [edit, preview] = screen.getAllByRole("tab");
    expect(edit.className).toBe(classes.tabClass);
    expect(edit.getAttribute("aria-selected")).toBe("true");
    expect(edit.hasAttribute("data-active")).toBe(true);
    expect(preview.getAttribute("aria-selected")).toBe("false");
    expect(edit.tabIndex).toBe(0);
    expect(preview.tabIndex).toBe(-1);
    const panel = screen.getByRole("tabpanel");
    expect(panel.className).toBe(classes.tabPanelClass);
    expect(panel.getAttribute("aria-labelledby")).toBe(edit.id);
    expect(screen.queryByText("Preview panel")).toBeNull();
  });

  it("selects as the arrow moves, by default, and reports only that choice", async () => {
    const onValueChange = vi.fn();
    render(<Editor onValueChange={onValueChange} />);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    const preview = screen.getByRole("tab", { name: "Preview" });
    expect(document.activeElement).toBe(preview);
    await waitFor(() => expect(preview.getAttribute("aria-selected")).toBe("true"));
    expect(screen.getByRole("tabpanel").textContent).toBe("Preview panel");
    expect(onValueChange).toHaveBeenCalledWith("preview");
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it("in manual activation moves focus only, and Enter selects", async () => {
    render(<Editor activation="manual" />);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    const preview = screen.getByRole("tab", { name: "Preview" });
    expect(document.activeElement).toBe(preview);
    expect(preview.getAttribute("aria-selected")).toBe("false");
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(preview.getAttribute("aria-selected")).toBe("true"));
  });

  it("wraps with the arrows, jumps with Home and End, and never selects a disabled tab", async () => {
    render(<Editor />);
    await userEvent.tab();
    await userEvent.keyboard("{End}");
    const history = screen.getByRole("tab", { name: "History" });
    expect(history.getAttribute("aria-disabled")).toBe("true");
    expect(history.getAttribute("aria-selected")).toBe("false");
    await userEvent.click(history);
    expect(history.getAttribute("aria-selected")).toBe("false");
    await userEvent.keyboard("{Home}");
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "Edit" }));
  });

  it("marks the selected tab by weight and a bar, not colour alone", () => {
    expect(classes.tabClass).toContain("data-active:font-semibold");
    expect(classes.tabClass).toContain("data-active:after:bg-teal-deep");
    expect(classes.tabClass).toContain(classes.focusRing);
  });
});

const OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "review", label: "In review" },
  { value: "approved", label: "Approved" },
  { value: "retired", label: "Retired", disabled: true },
];

describe("Combobox", () => {
  function Chooser({ onValueChange, onEscape }: { onValueChange?: (v: string | null) => void; onEscape?: (e: KeyboardEvent) => boolean | void }) {
    const [value, setValue] = useState<string | null>("review");
    return (
      <Combobox
        label="Status"
        options={OPTIONS}
        value={value}
        onValueChange={(v) => {
          onValueChange?.(v);
          setValue(v);
        }}
        onEscape={onEscape}
      />
    );
  }

  it("is a combobox input on the field class, closed until asked", () => {
    render(<Chooser />);
    const input = screen.getByRole("combobox", { name: "Status" });
    expect(hasClasses(input, classes.fieldClass)).toBe(true);
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect((input as HTMLInputElement).value).toBe("In review");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("opens a portalled listbox of options, the chosen one selected and ticked", async () => {
    render(<Chooser />);
    const input = screen.getByRole("combobox", { name: "Status" });
    await userEvent.click(input);
    const list = await screen.findByRole("listbox");
    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(hasClasses(list.closest(`[class~="max-h-64"]`)!, classes.comboboxPopupClass)).toBe(true);
    const review = screen.getByRole("option", { name: /In review/ });
    expect(review.className).toBe(classes.comboboxOptionClass);
    expect(review.getAttribute("aria-selected")).toBe("true");
    expect(review.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("filters as you type, highlights the first match, and Enter chooses it", async () => {
    const onValueChange = vi.fn();
    render(<Chooser onValueChange={onValueChange} />);
    const input = screen.getByRole("combobox", { name: "Status" });
    await userEvent.clear(input);
    await userEvent.type(input, "appr");
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1));
    const approved = screen.getByRole("option", { name: /Approved/ });
    await waitFor(() => expect(approved.hasAttribute("data-highlighted")).toBe(true));
    expect(input.getAttribute("aria-activedescendant")).toBe(approved.id);
    await userEvent.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("approved");
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    expect(document.activeElement).toBe(input);
  });

  it("says so when nothing matches", async () => {
    render(<Chooser />);
    const input = screen.getByRole("combobox", { name: "Status" });
    await userEvent.clear(input);
    await userEvent.type(input, "zzz");
    const empty = await screen.findByText("No matches.");
    expect(empty.className).toBe(classes.comboboxEmptyClass);
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it("moves the highlight with the arrows and skips nothing it can choose", async () => {
    render(<Chooser />);
    const input = screen.getByRole("combobox", { name: "Status" });
    await userEvent.click(input);
    await screen.findByRole("listbox");
    await userEvent.keyboard("{ArrowDown}");
    const highlighted = () => screen.getAllByRole("option").find((o) => o.hasAttribute("data-highlighted"));
    await waitFor(() => expect(highlighted()).toBeTruthy());
    const first = highlighted()!;
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(highlighted()).not.toBe(first));
  });

  it("does not choose a disabled option", async () => {
    const onValueChange = vi.fn();
    render(<Chooser onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("combobox", { name: "Status" }));
    const retired = await screen.findByRole("option", { name: /Retired/ });
    expect(retired.hasAttribute("data-disabled")).toBe(true);
    await userEvent.click(retired);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("closes on Escape, keeps the value, and a second Escape does not clear it", async () => {
    const onValueChange = vi.fn();
    render(<Chooser onValueChange={onValueChange} />);
    const input = screen.getByRole("combobox", { name: "Status" });
    await userEvent.click(input);
    await screen.findByRole("listbox");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    await userEvent.keyboard("{Escape}");
    expect(onValueChange).not.toHaveBeenCalled();
    expect((input as HTMLInputElement).value).toBe("In review");
  });

  it("keeps the list open when onEscape returns false", async () => {
    const onEscape = vi.fn(() => false);
    render(<Chooser onEscape={onEscape} />);
    await userEvent.click(screen.getByRole("combobox", { name: "Status" }));
    await screen.findByRole("listbox");
    await userEvent.keyboard("{Escape}");
    expect(onEscape).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("listbox")).toBeTruthy();
  });

  it("inside a drawer, Escape closes the list and not the drawer", async () => {
    const onOpenChange = vi.fn();
    render(
      <Drawer open onOpenChange={onOpenChange} title="Edit task">
        <Combobox label="Status" options={OPTIONS} defaultValue="draft" />
      </Drawer>,
    );
    const input = await screen.findByRole("combobox", { name: "Status" });
    await userEvent.click(input);
    await screen.findByRole("listbox");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("inside a drawer, an Escape on a closed list clears nothing and reaches the drawer", async () => {
    const onOpenChange = vi.fn();
    render(
      <Drawer open onOpenChange={onOpenChange} title="Edit task">
        <Combobox label="Status" options={OPTIONS} defaultValue="draft" />
      </Drawer>,
    );
    const input = (await screen.findByRole("combobox", { name: "Status" })) as HTMLInputElement;
    input.focus();
    expect(screen.queryByRole("listbox")).toBeNull();
    await userEvent.keyboard("{Escape}");
    expect(input.value).toBe("Draft");
    expect(onOpenChange).toHaveBeenCalledWith(false, "escape");
  });

  it("on Tab leaves without choosing — unlike Work OS's grid chooser, which commits", async () => {
    const onValueChange = vi.fn();
    render(
      <>
        <Chooser onValueChange={onValueChange} />
        <button>Next</button>
      </>,
    );
    const input = screen.getByRole("combobox", { name: "Status" });
    await userEvent.clear(input);
    await userEvent.type(input, "appr");
    await screen.findByRole("listbox");
    await userEvent.tab();
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    expect(onValueChange).not.toHaveBeenCalledWith("approved");
  });

  it("is named by a Field's label that wraps it", () => {
    render(
      <Field label="Status" hint="Pick one.">
        <Combobox options={OPTIONS} defaultValue="draft" />
      </Field>,
    );
    const input = screen.getByRole("combobox", { name: "Status" });
    expect(input.getAttribute("aria-describedby")).toBeTruthy();
    expect(hasClasses(input, classes.fieldClass)).toBe(true);
  });

  it("is disabled when asked", () => {
    render(<Combobox label="Status" options={OPTIONS} disabled />);
    expect((screen.getByRole("combobox", { name: "Status" }) as HTMLInputElement).disabled).toBe(true);
  });
});

describe("the Base UI components on the server", () => {
  it("render closed to static markup, with nothing portalled", () => {
    const markup = renderToStaticMarkup(
      <>
        <Tooltip content="Hint">
          <Button>Go</Button>
        </Tooltip>
        <Tabs defaultValue="a">
          <TabList label="L">
            <Tab value="a">A</Tab>
          </TabList>
          <TabPanel value="a">Panel A</TabPanel>
        </Tabs>
        <Combobox label="Status" options={OPTIONS} defaultValue="draft" />
      </>,
    );
    expect(markup).toContain('role="tablist"');
    expect(markup).toContain("Panel A");
    expect(markup).toContain('role="combobox"');
    expect(markup).not.toContain('role="tooltip"');
    expect(markup).not.toContain('role="listbox"');
  });
});
