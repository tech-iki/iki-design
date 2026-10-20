// @vitest-environment jsdom
/**
 * The four overlay components, driven in a DOM. Every other test in this
 * package runs in node; this file alone opts into jsdom because a dialog's
 * focus, a menu's highlight and a popover's outside press only exist in one.
 *
 * What is held, and why: the class strings are the design (§8), so each part
 * is asserted against the exported constant, never a copy of it; the
 * behaviours are the ones Work OS's hand-rolled versions had and the Base UI
 * ones must keep (focus lands in the body, Escape and the Close button report
 * their reason, focus returns to the opener); and the Disclosure's rows must
 * stay in the DOM when collapsed, hidden by a class and not the `hidden`
 * attribute, or the Summary handout prints empty.
 */
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Disclosure } from "./components/disclosure.js";
import { Drawer } from "./components/drawer.js";
import { Menu, MenuItem } from "./components/menu.js";
import { Popover, PopoverOption } from "./components/popover.js";
import {
  disclosureButtonClass,
  disclosureCollapsedClass,
  drawerBodyClass,
  drawerFooterClass,
  drawerHeaderClass,
  drawerPanelClass,
  drawerRefusalClass,
  drawerScrimClass,
  menuClass,
  menuItemClass,
  menuTriggerClass,
  popoverBadgeClass,
  popoverOptionClass,
  popoverPanelClass,
  popoverTriggerActiveClass,
  popoverTriggerClass,
} from "./ui-classes.js";

afterEach(cleanup);

/*
 * Accessible names: the markup is "Overdue", a sr-only ", " and "12" in three
 * spans inside a flex button. jsdom has no stylesheet, so it reads the spans as
 * inline and trims the whitespace ("Overdue,12", "Filters2"); a browser, where
 * flex makes each span a separate item, reads "Overdue, 12" and "Filters 2".
 * The names are therefore matched with optional whitespace; the text content
 * is asserted exactly where it matters.
 */

/*
 * Accessible names: the markup is "Overdue", a sr-only ", " and "12" in three
 * spans inside a flex button. jsdom has no stylesheet, so it reads the spans as
 * inline and trims the whitespace ("Overdue,12", "Filters2"); a browser, where
 * flex makes each span a separate item, reads "Overdue, 12" and "Filters 2".
 * The names are therefore matched with optional whitespace.
 */

/** Every token of `expected` is present on `el` (class strings may be merged). */
function hasClasses(el: Element, expected: string) {
  const have = new Set(el.className.split(/\s+/));
  return expected.split(/\s+/).every((c) => have.has(c));
}

describe("Drawer", () => {
  function Harness({ onOpenChange, onEscape }: { onOpenChange?: (o: boolean, r: string) => void; onEscape?: (e: KeyboardEvent) => boolean | void }) {
    const [open, setOpen] = useState(false);
    return (
      <div>
        <button onClick={() => setOpen(true)}>Open drawer</button>
        <Drawer
          open={open}
          onOpenChange={(o, r) => {
            onOpenChange?.(o, r);
            setOpen(o);
          }}
          onEscape={onEscape}
          title="Task"
        >
          <button>First</button>
          <input aria-label="Name" />
        </Drawer>
      </div>
    );
  }

  it("renders nothing while closed", () => {
    render(
      <Drawer open={false} onOpenChange={() => {}} title="Task">
        <p>Body</p>
      </Drawer>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("is a modal dialog named by its title, portalled to the body, with the exported classes", () => {
    const { container } = render(
      <Drawer open onOpenChange={() => {}} title="Task" refusal="Cannot close" footer={<span>Foot</span>}>
        <button>Go</button>
      </Drawer>,
    );
    const dialog = screen.getByRole("dialog", { name: "Task" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(document.body.contains(dialog)).toBe(true);
    expect(container.contains(dialog)).toBe(false);
    expect(hasClasses(dialog, drawerPanelClass)).toBe(true);

    const scrim = document.body.querySelector(`[class~="${drawerScrimClass.split(/\s+/)[0]}"]`);
    expect(scrim).not.toBeNull();
    expect(scrim!.className).toBe(drawerScrimClass);

    const header = dialog.firstElementChild as HTMLElement;
    expect(header.className).toBe(drawerHeaderClass);
    const body = dialog.querySelector(`[class="${drawerBodyClass}"]`);
    expect(body).not.toBeNull();
    expect(within(body as HTMLElement).getByText("Go")).toBeTruthy();
    const refusal = within(dialog).getByRole("alert");
    expect(refusal.className).toBe(drawerRefusalClass);
    expect(within(dialog).getByText("Foot").parentElement!.className).toBe(drawerFooterClass);
  });

  it("opens focus on the body's first focusable control, not the Close button", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Open drawer" }));
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("button", { name: "First" })));
    expect(document.activeElement).not.toBe(screen.getByRole("button", { name: "Close" }));
  });

  it("traps Tab inside the dialog", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Open drawer" }));
    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    const seen = new Set<Element | null>();
    for (let i = 0; i < 6; i++) {
      await user.tab();
      // Base UI parks focus on a guard span for a tick and then moves it on.
      await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
      seen.add(document.activeElement);
    }
    // It wrapped: the Close button (first in the panel) was reached again
    // after the body's last control, rather than focus leaving for the page.
    expect(seen.has(screen.getByRole("button", { name: "Close" }))).toBe(true);
  });

  it("reports Escape and Close with their reasons", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Harness onOpenChange={onOpenChange} />);
    await user.click(screen.getByRole("button", { name: "Open drawer" }));
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false, "escape");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    onOpenChange.mockClear();
    await user.click(screen.getByRole("button", { name: "Open drawer" }));
    await screen.findByRole("dialog");
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onOpenChange).toHaveBeenCalledWith(false, "close");
  });

  it("keeps the drawer open when onEscape returns false", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onEscape = vi.fn(() => false as const);
    render(<Harness onOpenChange={onOpenChange} onEscape={onEscape} />);
    await user.click(screen.getByRole("button", { name: "Open drawer" }));
    await screen.findByRole("dialog");
    onOpenChange.mockClear();
    await user.keyboard("{Escape}");
    expect(onEscape).toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("returns focus to the opener on close", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Open drawer" });
    await user.click(trigger);
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });
});

describe("Popover", () => {
  it("has a button trigger on the exported class, with the badge inside the name", () => {
    render(
      <Popover label="Filters" badge={2}>
        <PopoverOption>
          <input type="checkbox" /> Overdue
        </PopoverOption>
      </Popover>,
    );
    const trigger = screen.getByRole("button", { name: /^Filters\s*2$/ });
    expect(trigger.tagName).toBe("BUTTON");
    expect(hasClasses(trigger, popoverTriggerClass)).toBe(true);
    expect(trigger.querySelector(`[class="${popoverBadgeClass}"]`)).not.toBeNull();
    expect(hasClasses(trigger, popoverTriggerActiveClass)).toBe(false);
  });

  it("wears the active style when `active` while closed", () => {
    render(
      <Popover label="Filters" active>
        <p>x</p>
      </Popover>,
    );
    expect(hasClasses(screen.getByRole("button", { name: "Filters" }), popoverTriggerActiveClass)).toBe(true);
  });

  it("wears the active style and data-popup-open while open, and the panel its class", async () => {
    const user = userEvent.setup();
    render(
      <Popover label="Filters">
        <PopoverOption>
          <input type="checkbox" /> Overdue
        </PopoverOption>
      </Popover>,
    );
    const trigger = screen.getByRole("button", { name: "Filters" });
    await user.click(trigger);
    const option = await screen.findByText("Overdue");
    expect(hasClasses(trigger, popoverTriggerActiveClass)).toBe(true);
    expect(trigger.hasAttribute("data-popup-open")).toBe(true);
    const label = option.closest("label")!;
    expect(hasClasses(label, popoverOptionClass)).toBe(true);
    const panel = label.parentElement!;
    expect(hasClasses(panel, popoverPanelClass)).toBe(true);
  });

  it("closes on Escape and on an outside click", async () => {
    const user = userEvent.setup();
    render(
      <Popover label="Filters">
        <p>Panel content</p>
      </Popover>,
    );
    const trigger = screen.getByRole("button", { name: "Filters" });
    await user.click(trigger);
    await screen.findByText("Panel content");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByText("Panel content")).toBeNull());

    await user.click(trigger);
    await screen.findByText("Panel content");
    await user.click(document.body);
    await waitFor(() => expect(screen.queryByText("Panel content")).toBeNull());
  });
});

describe("Menu", () => {
  function setup(onA = vi.fn(), onB = vi.fn(), onC = vi.fn()) {
    render(
      <Menu label="Move to…">
        <MenuItem onSelect={onA}>Todo</MenuItem>
        <MenuItem onSelect={onB} disabled>
          Doing
        </MenuItem>
        <MenuItem onSelect={onC}>Done</MenuItem>
      </Menu>,
    );
    return { onA, onB, onC };
  }

  /** Open by click and wait until focus has moved into the menu, so keys reach it. */
  async function open(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", { name: "Move to…" }));
    const menu = await screen.findByRole("menu");
    await waitFor(() => expect(menu.contains(document.activeElement)).toBe(true));
    return menu;
  }

  it("has a menu trigger and opens a portalled role=menu of menuitems", async () => {
    const user = userEvent.setup();
    const { baseElement } = render(
      <Menu label="Move to…">
        <MenuItem>Todo</MenuItem>
        <MenuItem>Done</MenuItem>
      </Menu>,
    );
    const trigger = screen.getByRole("button", { name: "Move to…" });
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(hasClasses(trigger, menuTriggerClass)).toBe(true);
    await user.click(trigger);
    const menu = await screen.findByRole("menu");
    expect(baseElement.contains(menu)).toBe(true);
    expect(hasClasses(menu, menuClass)).toBe(true);
    const items = within(menu).getAllByRole("menuitem");
    expect(items).toHaveLength(2);
    for (const item of items) expect(hasClasses(item, menuItemClass)).toBe(true);
  });

  it("moves the highlight with the arrows, wrapping, and with Home and End", async () => {
    const user = userEvent.setup();
    setup();
    await open(user);
    const items = screen.getAllByRole("menuitem");
    const highlighted = () => items.filter((i) => i.hasAttribute("data-highlighted"));
    // Doing is disabled but stays in the list; the keyboard still lands on it
    // or skips it depending on Base UI, so the test only holds that exactly
    // one item is highlighted and that it moves and wraps.
    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(highlighted()).toHaveLength(1));
    const first = highlighted()[0];
    await user.keyboard("{End}");
    await waitFor(() => expect(highlighted()[0]).toBe(items[items.length - 1]));
    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(highlighted()[0]).toBe(items[0]));
    await user.keyboard("{ArrowUp}");
    await waitFor(() => expect(highlighted()[0]).toBe(items[items.length - 1]));
    await user.keyboard("{Home}");
    await waitFor(() => expect(highlighted()[0]).toBe(items[0]));
    expect(first).toBeTruthy();
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    setup();
    const trigger = screen.getByRole("button", { name: "Move to…" });
    await user.click(trigger);
    await screen.findByRole("menu");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("selects the highlighted item on Enter and closes", async () => {
    const user = userEvent.setup();
    const { onA } = setup();
    await open(user);
    await user.keyboard("{Home}");
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Todo" }).hasAttribute("data-highlighted")).toBe(true));
    await user.keyboard("{Enter}");
    expect(onA).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });

  it("announces a disabled item and does not select it on click", async () => {
    const user = userEvent.setup();
    const { onB } = setup();
    await user.click(screen.getByRole("button", { name: "Move to…" }));
    const doing = await screen.findByRole("menuitem", { name: "Doing" });
    expect(doing.getAttribute("aria-disabled")).toBe("true");
    await user.click(doing);
    expect(onB).not.toHaveBeenCalled();
  });

  it("closes on an outside click", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: "Move to…" }));
    await screen.findByRole("menu");
    await user.click(document.body);
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });
});

describe("Disclosure", () => {
  const rows = <ul><li>Row one</li><li>Row two</li></ul>;

  it("is one button inside a heading, named with the count", () => {
    render(
      <Disclosure title="Overdue" count={12} blurb="Past their due date">
        {rows}
      </Disclosure>,
    );
    const button = screen.getByRole("button", { name: /^Overdue,\s*12$/ });
    expect(button.className).toBe(disclosureButtonClass);
    expect(button.closest("h2")).not.toBeNull();
    expect(button.getAttribute("aria-describedby")).toBeTruthy();
    expect(document.getElementById(button.getAttribute("aria-describedby")!)!.textContent).toBe("Past their due date");
  });

  it("honours the heading prop", () => {
    render(
      <Disclosure title="Overdue" count={1} heading="h3">
        {rows}
      </Disclosure>,
    );
    expect(screen.getByRole("button").closest("h3")).not.toBeNull();
    expect(screen.getByRole("button").closest("h2")).toBeNull();
  });

  it("keeps collapsed rows in the DOM, hidden by class and never by attribute", () => {
    render(
      <Disclosure title="Overdue" count={2}>
        {rows}
      </Disclosure>,
    );
    const button = screen.getByRole("button", { name: /^Overdue,\s*2$/ });
    expect(button.getAttribute("aria-expanded")).toBe("false");
    const region = document.getElementById(button.getAttribute("aria-controls")!)!;
    expect(region).not.toBeNull();
    expect(region.textContent).toContain("Row one");
    expect(region.getAttribute("class")).toBe("hidden print:block");
    expect(region.getAttribute("class")).toBe(disclosureCollapsedClass);
    expect(region.hasAttribute("hidden")).toBe(false);
  });

  it("toggles aria-expanded and the class on click, and keeps focus on the button", async () => {
    const user = userEvent.setup();
    render(
      <Disclosure title="Overdue" count={2}>
        {rows}
      </Disclosure>,
    );
    const button = screen.getByRole("button", { name: /^Overdue,\s*2$/ });
    const region = document.getElementById(button.getAttribute("aria-controls")!)!;
    await user.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(region.className).not.toContain("hidden");
    expect(document.activeElement).toBe(button);
    await user.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(region.className).toBe(disclosureCollapsedClass);
    expect(document.activeElement).toBe(button);
  });

  it("opens from defaultOpen", () => {
    render(
      <Disclosure title="Overdue" count={2} defaultOpen>
        {rows}
      </Disclosure>,
    );
    expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe("true");
  });

  it("in controlled mode asks, and leaves the DOM to the caller", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Disclosure title="Overdue" count={2} open={false} onOpenChange={onOpenChange}>
        {rows}
      </Disclosure>,
    );
    const button = screen.getByRole("button");
    await user.click(button);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(document.getElementById(button.getAttribute("aria-controls")!)!.className).toBe(disclosureCollapsedClass);
  });

  it("hides the chevron from assistive technology", () => {
    render(
      <Disclosure title="Overdue" count={2}>
        {rows}
      </Disclosure>,
    );
    const svg = screen.getByRole("button").querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("server rendering", () => {
  // The site's pages are Server Components that render these; a hook or a
  // browser global at render time would throw here.
  it("renders closed overlays and a collapsed disclosure to static markup", () => {
    expect(() =>
      renderToStaticMarkup(
        <div>
          <Drawer open={false} onOpenChange={() => {}} title="T">
            <p>x</p>
          </Drawer>
          <Popover label="Filters">
            <p>x</p>
          </Popover>
          <Menu label="Move">
            <MenuItem>One</MenuItem>
          </Menu>
          <Disclosure title="Overdue" count={3}>
            <p>x</p>
          </Disclosure>
        </div>,
      ),
    ).not.toThrow();
  });
});
