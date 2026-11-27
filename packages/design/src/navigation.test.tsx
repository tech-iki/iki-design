// @vitest-environment jsdom
/**
 * The app shell (#19, #23): `SkipLink`, `Rail`, `RailBrand`, `NavGroup`,
 * `NavLink`, `NavButton`, and `renderLink`, the router-link convention they
 * share. Rendered in a DOM and read through the accessibility tree where the
 * claim is about names and roles; class strings are asserted against the
 * exported constants, never a copy. What a test cannot see — the pixels at a
 * breakpoint, Windows High Contrast, a screen reader's speech — is asserted
 * as far as the classes go and stated in §7.
 */
import { cleanup, render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRef, type ComponentProps, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { FOCUSABLE } from "./focusable.js";
import { PageMain } from "./components/page-main.js";
import { NavButton, NavGroup, NavLink, Rail, RailBrand } from "./components/rail.js";
import { MAIN_CONTENT_ID, SkipLink } from "./components/skip-link.js";
import { renderLink } from "./link-render.js";
import * as classes from "./ui-classes.js";

afterEach(cleanup);

const HERE = dirname(fileURLToPath(import.meta.url));

/** Every token of `expected` is on `el`. */
function hasClasses(el: Element, expected: string) {
  const have = new Set(el.className.split(/\s+/));
  return expected.split(/\s+/).filter(Boolean).every((c) => have.has(c));
}

/*
 * Stand-ins for the routers' links, with their real prop shapes, so the
 * convention is tested against what each one takes without a router in the
 * package's dependencies.
 */

/** Next's `Link`: `href`, plus props of its own that it does not pass to the `<a>`. */
function NextLikeLink({ prefetch, ...props }: ComponentProps<"a"> & { href: string; prefetch?: boolean }) {
  return <a {...props} data-router="next" data-prefetch={prefetch === false ? "false" : undefined} />;
}

/** React Router's `Link`: `to` instead of `href`. */
function RouterLikeLink({ to, ...props }: Omit<ComponentPropsWithoutRef<"a">, "href"> & { to: string }) {
  return <a {...props} href={to} data-router="react-router" />;
}

/**
 * React Router's `NavLink`: `className` may be a function of its state, and
 * it reads `aria-current` as the value to use when it is active, which its
 * own matching decides.
 */
function RouterLikeNavLink({
  to,
  className,
  "aria-current": ariaCurrentProp = "page",
  isActive = false,
  ...props
}: Omit<ComponentPropsWithoutRef<"a">, "href" | "className"> & {
  to: string;
  className?: string | ((state: { isActive: boolean }) => string | undefined);
  isActive?: boolean;
}) {
  const resolved = typeof className === "function" ? className({ isActive }) : [className, isActive ? "active" : null].filter(Boolean).join(" ");
  return <a {...props} href={to} className={resolved} aria-current={isActive ? ariaCurrentProp : undefined} />;
}

describe("renderLink: the router-link convention", () => {
  const base = { className: "pkg", children: "Calls", "aria-current": "page" as const };

  it("is a plain <a> without render", () => {
    render(<>{renderLink({ ...base, href: "/calls" })}</>);
    const link = screen.getByRole("link", { name: "Calls" });
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/calls");
    expect(link.getAttribute("aria-current")).toBe("page");
    expect(link.className).toBe("pkg");
  });

  it("clones an element: its own props stay, the package's className, aria-current and children land", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(<>{renderLink(base, <NextLikeLink href="/calls" prefetch={false} className="app" ref={ref} title="Open calls" />)}</>);
    const link = screen.getByRole("link", { name: "Calls" });
    expect(link.dataset.router).toBe("next");
    expect(link.getAttribute("href")).toBe("/calls");
    expect(link.dataset.prefetch).toBe("false");
    expect(link.getAttribute("title")).toBe("Open calls");
    expect(link.className).toBe("pkg app");
    expect(link.getAttribute("aria-current")).toBe("page");
    expect(ref.current).toBe(link);
  });

  it("drops the element's own children and its own aria-current: the package owns both", () => {
    render(
      <>
        {renderLink(
          { className: "pkg", children: "Calls", "aria-current": undefined },
          <RouterLikeLink to="/calls" aria-current="page">
            Ignored
          </RouterLikeLink>,
        )}
      </>,
    );
    const link = screen.getByRole("link", { name: "Calls" });
    expect(link.textContent).toBe("Calls");
    expect(link.hasAttribute("aria-current")).toBe(false);
  });

  it("does not let an undefined prop erase the element's own", () => {
    render(<>{renderLink({ ...base, href: undefined, title: undefined }, <NextLikeLink href="/calls" title="kept" />)}</>);
    const link = screen.getByRole("link", { name: "Calls" });
    expect(link.getAttribute("href")).toBe("/calls");
    expect(link.getAttribute("title")).toBe("kept");
  });

  it("lets a prop given to the component beat the element's", () => {
    render(<>{renderLink({ ...base, href: "/given" }, <NextLikeLink href="/element" />)}</>);
    expect(screen.getByRole("link", { name: "Calls" }).getAttribute("href")).toBe("/given");
  });

  it("works with React Router's Link, whose destination is `to`", () => {
    render(<>{renderLink(base, <RouterLikeLink to="/calls" />)}</>);
    const link = screen.getByRole("link", { name: "Calls" });
    expect(link.dataset.router).toBe("react-router");
    expect(link.getAttribute("href")).toBe("/calls");
    expect(link.getAttribute("aria-current")).toBe("page");
    expect(link.className).toBe("pkg");
  });

  it("appends a function className's result, as React Router's NavLink takes", () => {
    render(
      <>
        {renderLink(
          base,
          <RouterLikeNavLink to="/calls" isActive className={({ isActive }) => (isActive ? "on" : "off")} />,
        )}
      </>,
    );
    const link = screen.getByRole("link", { name: "Calls" });
    expect(link.className).toBe("pkg on");
    expect(link.getAttribute("aria-current")).toBe("page");
  });

  it("takes a function, handing it the props to spread", () => {
    let seen: Record<string, unknown> = {};
    render(
      <>
        {renderLink(base, (props) => {
          seen = props;
          return <RouterLikeLink {...props} to="/calls?page=2" />;
        })}
      </>,
    );
    const link = screen.getByRole("link", { name: "Calls" });
    expect(link.getAttribute("href")).toBe("/calls?page=2");
    expect(link.className).toBe("pkg");
    expect(seen["aria-current"]).toBe("page");
  });

  it("refuses a render that is neither", () => {
    expect(() => renderLink(base, "a" as never)).toThrow(/render must be a React element/);
  });
});

describe("NavLink", () => {
  it("is a link named by its label, with aria-current only when current", () => {
    render(
      <ul>
        <li>
          <NavLink href="/calls" icon="tasks" current>
            Calls
          </NavLink>
        </li>
        <li>
          <NavLink href="/library" icon="reports">
            Library
          </NavLink>
        </li>
        <li>
          <NavLink href="/dash" icon="myTasks" current={false}>
            Dashboard
          </NavLink>
        </li>
      </ul>,
    );
    const calls = screen.getByRole("link", { name: "Calls" });
    expect(calls.getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Library" }).hasAttribute("aria-current")).toBe(false);
    expect(screen.getByRole("link", { name: "Dashboard" }).hasAttribute("aria-current")).toBe(false);
    expect(document.querySelectorAll("[aria-current]")).toHaveLength(1);
  });

  it("draws the current state from the same prop, and the idle state otherwise", () => {
    render(
      <>
        <NavLink href="/a" icon="tasks" current>
          A
        </NavLink>
        <NavLink href="/b" icon="tasks">
          B
        </NavLink>
      </>,
    );
    const a = screen.getByRole("link", { name: "A" });
    const b = screen.getByRole("link", { name: "B" });
    expect(a.className).toBe(`${classes.navItemClass} ${classes.navItemCurrentClass}`);
    expect(b.className).toBe(`${classes.navItemClass} ${classes.navItemIdleClass}`);
  });

  it('takes "true" for an entry whose page has its own section navigation', () => {
    render(
      <NavLink href="/settings" icon="settings" current="true">
        Settings
      </NavLink>,
    );
    const link = screen.getByRole("link", { name: "Settings" });
    expect(link.getAttribute("aria-current")).toBe("true");
    expect(hasClasses(link, classes.navItemCurrentClass)).toBe(true);
  });

  it("keeps its label as the accessible name when the label is visually hidden", () => {
    render(
      <NavLink href="/calls" icon="tasks">
        Calls
      </NavLink>,
    );
    const link = screen.getByRole("link", { name: "Calls" });
    const label = within(link).getByText("Calls");
    expect(label.className).toBe(`truncate ${classes.railLabelClass}`);
    expect(classes.railLabelClass.split(" ")).toEqual(expect.arrayContaining(["max-lg:sr-only"]));
    // sr-only, never hidden: hidden would take the name away.
    expect(classes.railLabelClass).not.toMatch(/(?<![\w-])hidden\b/);
    // The icon is decorative, its wrapper hidden from the tree too.
    const svg = link.querySelector("svg")!;
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.parentElement!.getAttribute("aria-hidden")).toBe("true");
  });

  it("takes an icon element of the app's own", () => {
    render(
      <NavLink href="/journal" icon={<svg data-testid="own" />}>
        Journal issues
      </NavLink>,
    );
    const link = screen.getByRole("link", { name: "Journal issues" });
    expect(within(link).getByTestId("own").parentElement!.getAttribute("aria-hidden")).toBe("true");
  });

  it("renders the app's router link: aria-current and the classes land on it (Digital Library 101)", () => {
    render(
      <>
        <NavLink render={<RouterLikeLink to="/calls" />} icon="tasks" current>
          Calls
        </NavLink>
        <NavLink render={<NextLikeLink href="/library" prefetch={false} />} icon="reports">
          Library
        </NavLink>
      </>,
    );
    const calls = screen.getByRole("link", { name: "Calls" });
    expect(calls.dataset.router).toBe("react-router");
    expect(calls.getAttribute("href")).toBe("/calls");
    expect(calls.getAttribute("aria-current")).toBe("page");
    expect(calls.className).toBe(`${classes.navItemClass} ${classes.navItemCurrentClass}`);
    const library = screen.getByRole("link", { name: "Library" });
    expect(library.dataset.router).toBe("next");
    expect(library.getAttribute("href")).toBe("/library");
    expect(library.dataset.prefetch).toBe("false");
    expect(library.hasAttribute("aria-current")).toBe(false);
  });

  it("keeps aria-current its own: one in the rest cannot contradict current", () => {
    // JSX does not type-check hyphenated attributes, so this is held at run time.
    const stray = { "aria-current": "page" } as Record<string, string>;
    render(
      <NavLink href="/a" icon="tasks" {...stray}>
        A
      </NavLink>,
    );
    expect(screen.getByRole("link", { name: "A" }).hasAttribute("aria-current")).toBe(false);
  });

  it("passes the rest through and appends className", () => {
    render(
      <NavLink href="/a" icon="tasks" title="All calls" data-x="1" className="extra">
        A
      </NavLink>,
    );
    const link = screen.getByRole("link", { name: "A" });
    expect(link.getAttribute("title")).toBe("All calls");
    expect(link.dataset.x).toBe("1");
    expect(link.className.endsWith(" extra")).toBe(true);
  });
});

describe("NavButton", () => {
  it("is a real <button>, type=button by default, with a rail link's look (Digital Library 101)", () => {
    render(<NavButton icon="signOut">Sign out</NavButton>);
    const button = screen.getByRole("button", { name: "Sign out" });
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("type")).toBe("button");
    expect(button.className).toBe(`${classes.navItemClass} ${classes.navItemIdleClass} ${classes.navButtonClass}`);
    expect(button.hasAttribute("aria-current")).toBe(false);
  });

  it("can submit a form, and passes the rest through", () => {
    render(
      <form>
        <NavButton icon="signOut" type="submit" name="intent" value="sign-out" disabled>
          Sign out
        </NavButton>
      </form>,
    );
    const button = screen.getByRole("button", { name: "Sign out" });
    expect(button.getAttribute("type")).toBe("submit");
    expect(button.getAttribute("name")).toBe("intent");
    expect(button).toHaveProperty("disabled", true);
  });
});

describe("the 44px target, at every width (WCAG 2.5.5)", () => {
  const tokens = (s: string) => s.split(/\s+/);

  it("holds on every rail item, link and button, and is never released at a breakpoint", () => {
    for (const name of ["navItemClass", "railBrandClass"] as const) {
      const t = tokens(classes[name]);
      expect(t, name).toEqual(expect.arrayContaining(["min-h-11", "min-w-11"]));
      expect(t.filter((c) => /min-[hw]-(?!11\b)/.test(c)), name).toEqual([]);
    }
  });

  it("holds on the focused skip link", () => {
    expect(tokens(classes.skipLinkClass)).toContain("focus:min-h-11");
  });

  it("leaves 48px in the 56px rail for an icon-only item, at every width below lg and when collapsed", () => {
    // w-14 is 56px; px-1 takes 4px a side.
    expect(tokens(classes.railClass)).toEqual(expect.arrayContaining(["w-14", "lg:w-56", "data-collapsed:w-14"]));
    for (const name of ["railGroupsClass", "railFootClass"] as const) {
      const t = tokens(classes[name]);
      expect(t, name).toEqual(expect.arrayContaining(["px-1", "lg:group-data-collapsed/rail:px-1"]));
      expect(t.filter((c) => /^(?:sm|md):px-/.test(c)), name).toEqual([]);
    }
  });
});

describe("the focus ring, on every interactive item (§10, 2.4.7)", () => {
  it("is focusRingOnNavy on the rail's links and buttons, and focusRing on the skip link", () => {
    render(
      <>
        <SkipLink />
        <Rail brand={<RailBrand name="IKI Library" mark={<svg />} />} foot={<NavButton icon="signOut">Sign out</NavButton>}>
          <NavGroup heading="Library">
            <NavLink href="/a" icon="tasks" current>
              A
            </NavLink>
            <NavLink href="/b" icon="tasks">
              B
            </NavLink>
          </NavGroup>
        </Rail>
      </>,
    );
    const focusable = [...document.querySelectorAll<HTMLElement>(FOCUSABLE)];
    expect(focusable).toHaveLength(5);
    const [skip, ...rail] = focusable;
    expect(hasClasses(skip, classes.focusRing)).toBe(true);
    for (const el of rail) expect(hasClasses(el, classes.focusRingOnNavy), el.textContent ?? "").toBe(true);
  });

  it("is an outline, which forced colours keep, not a shadow, which they drop", () => {
    for (const ring of [classes.focusRing, classes.focusRingOnNavy]) expect(ring).toContain("focus-visible:outline-2");
  });
});

describe("the current page in forced colours, and no motion", () => {
  it("keeps the bar in Windows High Contrast: it opts out of the repaint and takes the system text colour", () => {
    const t = classes.navItemCurrentClass.split(" ");
    expect(t).toEqual(expect.arrayContaining(["before:forced-color-adjust-none", "forced-colors:before:bg-[CanvasText]", "font-semibold"]));
  });

  it("adds no transition or animation anywhere in the shell", () => {
    const shell = Object.entries(classes).filter(([name]) => /^(?:nav|rail|skipLink)/.test(name));
    expect(shell.length).toBeGreaterThanOrEqual(15);
    for (const [name, value] of shell) expect(value, name).not.toMatch(/\b(?:transition|duration|animate|ease)-/);
  });
});

describe("SkipLink", () => {
  it("targets PageMain's main, which takes focus", () => {
    render(
      <>
        <SkipLink />
        <PageMain>Body</PageMain>
      </>,
    );
    const skip = screen.getByRole("link", { name: "Skip to content" });
    const main = screen.getByRole("main");
    expect(skip.getAttribute("href")).toBe(`#${main.id}`);
    expect(main.id).toBe(MAIN_CONTENT_ID);
    expect(main.getAttribute("tabindex")).toBe("-1");
    expect(skip.className).toBe(classes.skipLinkClass);
  });

  it("is hidden until focused, then fixed above everything", () => {
    const t = classes.skipLinkClass.split(" ");
    expect(t).toEqual(expect.arrayContaining(["sr-only", "focus:not-sr-only", "focus:fixed", "z-50"]));
  });

  it("takes another target, other words, and the rest", () => {
    render(
      <SkipLink targetId="content" data-x="1" className="extra">
        Skip to the results
      </SkipLink>,
    );
    const skip = screen.getByRole("link", { name: "Skip to the results" });
    expect(skip.getAttribute("href")).toBe("#content");
    expect(skip.dataset.x).toBe("1");
    expect(skip.className).toBe(`${classes.skipLinkClass} extra`);
  });
});

describe("Rail and NavGroup", () => {
  function Shell({ collapsed, label }: { collapsed?: boolean; label?: string }) {
    return (
      <>
        <SkipLink />
        <Rail
          label={label}
          collapsed={collapsed}
          data-x="1"
          brand={<RailBrand name="IKI Library" mark={<svg data-testid="mark" />} render={<RouterLikeLink to="/" />} />}
          foot={
            <>
              <NavLink href="/me" icon="record">
                Amina Rahman
              </NavLink>
              <NavButton icon="signOut">Sign out</NavButton>
            </>
          }
        >
          <NavGroup heading="Library">
            <NavLink href="/library" icon="reports" current>
              Library
            </NavLink>
            <NavLink href="/calls" icon="tasks">
              Calls
            </NavLink>
          </NavGroup>
          <NavGroup heading="Admin">
            {false}
            <NavLink href="/audit" icon="review">
              Audit
            </NavLink>
          </NavGroup>
        </Rail>
        <PageMain>Body</PageMain>
      </>
    );
  }

  it("is an <aside> holding one <nav>, named Main by default or by label", () => {
    const { unmount } = render(<Shell />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(nav.parentElement!.tagName).toBe("ASIDE");
    expect(nav.parentElement!.className).toBe(classes.railClass);
    expect(nav.parentElement!.dataset.x).toBe("1");
    unmount();
    render(<Shell label="Workspace" />);
    expect(screen.getByRole("navigation", { name: "Workspace" })).toBeTruthy();
  });

  it("labels each group's list with its heading, one <li> per item", () => {
    render(<Shell />);
    const library = screen.getByRole("list", { name: "Library" });
    expect(within(library).getAllByRole("listitem")).toHaveLength(2);
    const admin = screen.getByRole("list", { name: "Admin" });
    expect(within(admin).getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 2, name: "Admin" }).className).toBe(
      `${classes.navHeadingClass} ${classes.railLabelClass}`,
    );
  });

  it("puts the foot inside the nav landmark, a fragment's items one <li> each", () => {
    render(<Shell />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    const signOut = within(nav).getByRole("button", { name: "Sign out" });
    const footList = signOut.closest("ul")!;
    expect(footList.parentElement!.className).toBe(classes.railFootClass);
    expect(within(footList).getAllByRole("listitem")).toHaveLength(2);
  });

  it("puts the brand above the nav, named by its words at every width", () => {
    render(<Shell />);
    const brand = screen.getByRole("link", { name: "IKI Library" });
    expect(brand.closest("nav")).toBeNull();
    expect(brand.parentElement!.className).toBe(classes.railHeaderClass);
    expect(brand.dataset.router).toBe("react-router");
    expect(brand.getAttribute("href")).toBe("/");
    expect(brand.className).toBe(classes.railBrandClass);
    expect(within(brand).getByTestId("mark").parentElement!.getAttribute("aria-hidden")).toBe("true");
    expect(brand.hasAttribute("aria-label")).toBe(false);
  });

  it("orders focus as the DOM does: skip link, brand, the groups in order, the foot", () => {
    render(<Shell />);
    const order = [...document.querySelectorAll<HTMLElement>(FOCUSABLE)].map((el) => el.textContent);
    expect(order).toEqual(["Skip to content", "IKI Library", "Library", "Calls", "Audit", "Amina Rahman", "Sign out"]);
    // No positive tabindex anywhere to reorder it.
    expect(document.querySelectorAll('[tabindex]:not([tabindex="-1"])')).toHaveLength(0);
  });

  it("marks exactly one link current", () => {
    render(<Shell />);
    const current = document.querySelectorAll('[aria-current="page"]');
    expect(current).toHaveLength(1);
    expect(current[0].textContent).toBe("Library");
  });

  it("sets data-collapsed only when collapsed, and the items' classes read it", () => {
    const { unmount } = render(<Shell />);
    const aside = () => screen.getByRole("navigation").parentElement!;
    expect(aside().hasAttribute("data-collapsed")).toBe(false);
    unmount();
    render(<Shell collapsed />);
    expect(aside().getAttribute("data-collapsed")).toBe("true");
    expect(classes.railClass.split(" ")).toContain("group/rail");
    expect(classes.railLabelClass.split(" ")).toContain("group-data-collapsed/rail:sr-only");
  });

  it("gives the plain brand link / when there is no router element", () => {
    render(<RailBrand name="IKI design" mark={<svg />} />);
    expect(screen.getByRole("link", { name: "IKI design" }).getAttribute("href")).toBe("/");
  });

  it("gives two groups on one page distinct heading ids", () => {
    render(<Shell />);
    const ids = [...document.querySelectorAll("h2")].map((h) => h.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every(Boolean)).toBe(true);
  });
});

describe("server-safe", () => {
  it("renders on the server, with no client directive", () => {
    const markup = renderToStaticMarkup(
      <>
        <SkipLink />
        <Rail brand={<RailBrand name="IKI" mark={<svg />} />} foot={<NavButton icon="signOut">Sign out</NavButton>}>
          <NavGroup heading="Work">
            <NavLink href="/tasks" icon="tasks" current>
              Tasks
            </NavLink>
          </NavGroup>
        </Rail>
      </>,
    );
    expect(markup.startsWith('<a href="#main-content"')).toBe(true);
    expect(markup.match(/aria-current="page"/g)).toHaveLength(1);
  });

  it("uses no hook in the link path, and none but useId anywhere in the shell", () => {
    const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
    const hooks = (file: string) => [...strip(readFileSync(join(HERE, file), "utf8")).matchAll(/\buse[A-Z]\w*/g)].map((m) => m[0]);
    expect(hooks("link-render.ts")).toEqual([]);
    expect(hooks("is-active-path.ts")).toEqual([]);
    expect(hooks("components/skip-link.tsx")).toEqual([]);
    expect([...new Set(hooks("components/rail.tsx"))]).toEqual(["useId"]);
  });
});

/** A typed check that the props reject what they should; `tsc` runs it, vitest only loads it. */
export function _typeChecks(): ReactNode[] {
  return [
    // @ts-expect-error a NavLink needs an href or a render
    <NavLink icon="tasks">x</NavLink>,
    // @ts-expect-error the icon is a vocabulary name or an element, not any string
    <NavLink href="/" icon="not-an-icon">x</NavLink>,
    // @ts-expect-error a NavButton has no current
    <NavButton icon="signOut" current>x</NavButton>,
    <NavLink key="ok" render={<RouterLikeLink to="/" />} icon="tasks">x</NavLink>,
  ];
}
