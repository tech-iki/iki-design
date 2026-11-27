// @vitest-environment jsdom
/**
 * Navigation by links (#20, #22): `Pagination`, `PrevNextNav`, `BackLink` and
 * `ViewSwitch`. Rendered in a DOM and read through the accessibility tree
 * where the claim is about names, roles and focus; class strings are asserted
 * against the exported constants. What a test cannot see — pixels at a
 * breakpoint, Windows High Contrast, a screen reader's speech — is asserted as
 * far as the classes go and stated in §8.
 */
import { cleanup, render, screen, within } from "@testing-library/react";
import type { ComponentProps, ComponentPropsWithoutRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { BackLink } from "./components/back-link.js";
import { Pagination, PrevNextNav } from "./components/pagination.js";
import { ViewSwitch } from "./components/view-switch.js";
import { FOCUSABLE } from "./focusable.js";
import * as classes from "./ui-classes.js";

afterEach(cleanup);

/** Every token of `expected` is on `el`. */
function hasClasses(el: Element, expected: string) {
  const have = new Set(el.className.split(/\s+/));
  return expected.split(/\s+/).filter(Boolean).every((c) => have.has(c));
}

/** Next's `Link`: takes `href`, and `prefetch`, which it does not pass to the `<a>`. */
function NextLikeLink({ prefetch, ...props }: ComponentProps<"a"> & { href: string; prefetch?: boolean }) {
  return <a {...props} data-router="next" data-prefetch={prefetch === false ? "false" : undefined} />;
}

/** React Router's `Link`: `to` instead of `href`. */
function RouterLikeLink({ to, ...props }: Omit<ComponentPropsWithoutRef<"a">, "href"> & { to: string }) {
  return <a {...props} href={to} data-router="react-router" />;
}

const hrefFor = (n: number) => `/library?page=${n}`;

describe("Pagination", () => {
  it("is a nav with a name: 'Pagination' by default, the caller's when given", () => {
    const { rerender } = render(<Pagination page={2} totalPages={5} hrefFor={hrefFor} />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeTruthy();
    rerender(<Pagination page={2} totalPages={5} hrefFor={hrefFor} label="Pagination, reviews" />);
    expect(screen.getByRole("navigation", { name: "Pagination, reviews" })).toBeTruthy();
    expect(screen.queryByRole("navigation", { name: "Pagination" })).toBeNull();
  });

  it.each([
    ["one page", 1, 1],
    ["no pages", 1, 0],
    ["a negative count", 1, -4],
    ["a count that is not a number", 1, Number.NaN],
    ["an infinite count", 1, Number.POSITIVE_INFINITY],
  ])("renders nothing for %s", (_name, page, total) => {
    const { container } = render(<Pagination page={page} totalPages={total} hrefFor={hrefFor} />);
    expect(container.innerHTML).toBe("");
  });

  it("names each page link 'Page N' and the ends 'Previous page' and 'Next page'", () => {
    render(<Pagination page={3} totalPages={5} hrefFor={hrefFor} />);
    const nav = screen.getByRole("navigation");
    expect(within(nav).getAllByRole("link").map((l) => l.getAttribute("aria-label"))).toEqual([
      "Previous page",
      "Page 1",
      "Page 2",
      "Page 4",
      "Page 5",
      "Next page",
    ]);
    expect(within(nav).getByRole("link", { name: "Page 4" }).getAttribute("href")).toBe("/library?page=4");
    expect(within(nav).getByRole("link", { name: "Previous page" }).getAttribute("href")).toBe("/library?page=2");
    expect(within(nav).getByRole("link", { name: "Next page" }).getAttribute("href")).toBe("/library?page=4");
  });

  it("names a link by words that contain what it shows (WCAG 2.5.3): '2' is 'Page 2', 'Next' is 'Next page'", () => {
    render(<Pagination page={1} totalPages={3} hrefFor={hrefFor} />);
    const page = screen.getByRole("link", { name: "Page 2" });
    expect(page.textContent).toBe("2");
    expect(screen.getByRole("link", { name: "Next page" }).textContent).toBe("Next");
  });

  it("marks the current page aria-current='page', once, and it is not a link", () => {
    render(<Pagination page={3} totalPages={5} hrefFor={hrefFor} />);
    const current = document.querySelectorAll("[aria-current]");
    expect(current).toHaveLength(1);
    const here = current[0];
    expect(here.getAttribute("aria-current")).toBe("page");
    expect(here.tagName).toBe("SPAN");
    expect(here.textContent).toBe("Page 3");
    expect(here.hasAttribute("href")).toBe(false);
    expect(here.matches(FOCUSABLE)).toBe(false);
    expect(screen.queryByRole("link", { name: "Page 3" })).toBeNull();
    // Weight and a bar, not colour alone; the bar survives forced colours.
    expect(hasClasses(here, classes.linkNavCurrentClass)).toBe(true);
    expect(classes.linkNavCurrentClass).toContain("font-semibold");
    expect(classes.linkNavCurrentClass).toContain("after:h-0.5");
    expect(classes.linkNavCurrentClass).toContain("forced-colors:after:bg-[CanvasText]");
  });

  it("renders Previous on the first page as a non-link that is not focusable and is read as unavailable", () => {
    render(<Pagination page={1} totalPages={4} hrefFor={hrefFor} />);
    const nav = screen.getByRole("navigation");
    const ends = within(nav).getAllByRole("link", { name: /Previous page/ });
    expect(ends).toHaveLength(1);
    const previous = ends[0];
    expect(previous.tagName).toBe("SPAN");
    expect(previous.hasAttribute("href")).toBe(false);
    expect(previous.hasAttribute("tabindex")).toBe(false);
    expect(previous.matches(FOCUSABLE)).toBe(false);
    expect(previous.getAttribute("aria-disabled")).toBe("true");
    // Next is a real link.
    expect(within(nav).getByRole("link", { name: "Next page" }).getAttribute("href")).toBe("/library?page=2");
  });

  it("renders Next on the last page the same way", () => {
    render(<Pagination page={4} totalPages={4} hrefFor={hrefFor} />);
    const next = screen.getByRole("link", { name: "Next page" });
    expect(next.tagName).toBe("SPAN");
    expect(next.hasAttribute("href")).toBe(false);
    expect(next.matches(FOCUSABLE)).toBe(false);
    expect(next.getAttribute("aria-disabled")).toBe("true");
    expect(screen.getByRole("link", { name: "Previous page" }).getAttribute("href")).toBe("/library?page=3");
  });

  it("puts aria-disabled on no element that has an href, and no href='#' anywhere", () => {
    for (const page of [1, 2, 3]) {
      const { container, unmount } = render(<Pagination page={page} totalPages={3} hrefFor={hrefFor} />);
      expect(container.querySelectorAll("a[aria-disabled]")).toHaveLength(0);
      expect(container.querySelectorAll('[href="#"]')).toHaveLength(0);
      expect(container.querySelectorAll("[aria-disabled][href]")).toHaveLength(0);
      unmount();
    }
  });

  it("gives every focusable thing in it an href, so the only tab stops are real links", () => {
    const { container } = render(<Pagination page={1} totalPages={20} hrefFor={hrefFor} />);
    const stops = [...container.querySelectorAll(FOCUSABLE)];
    expect(stops.length).toBeGreaterThan(0);
    for (const stop of stops) {
      expect(stop.tagName).toBe("A");
      expect(stop.getAttribute("href")).toMatch(/^\/library\?page=\d+$/);
    }
  });

  it("truncates a long range with an ellipsis that is hidden from assistive technology and is not a link", () => {
    const { container } = render(<Pagination page={500} totalPages={1000} hrefFor={hrefFor} />);
    const nav = screen.getByRole("navigation");
    const gaps = [...container.querySelectorAll("li[aria-hidden='true']")];
    expect(gaps).toHaveLength(2);
    for (const gap of gaps) {
      expect(gap.textContent).toBe("…");
      expect(gap.querySelector("a")).toBeNull();
    }
    expect(hasClasses(gaps[0], classes.linkNavGapClass)).toBe(true);
    // 1 … 499 500 501 … 1000, with Previous and Next: seven numbers' worth of links, not a thousand.
    const names = within(nav).getAllByRole("link").map((l) => l.getAttribute("aria-label"));
    expect(names).toEqual(["Previous page", "Page 1", "Page 499", "Page 501", "Page 1000", "Next page"]);
    expect(container.querySelectorAll("li")).toHaveLength(9);
  });

  it("calls hrefFor only with pages that exist, and clamps an invalid current page", () => {
    const seen = new Set<number>();
    render(
      <Pagination
        page={99}
        totalPages={5}
        hrefFor={(n) => {
          seen.add(n);
          return `?page=${n}`;
        }}
      />,
    );
    expect([...seen].sort()).toEqual([1, 2, 3, 4]);
    expect(screen.getByRole("link", { name: "Next page" }).tagName).toBe("SPAN");
    expect(document.querySelector("[aria-current]")?.textContent).toBe("Page 5");
  });

  it("reads page NaN as page 1", () => {
    render(<Pagination page={Number.NaN} totalPages={5} hrefFor={hrefFor} />);
    expect(document.querySelector("[aria-current]")?.textContent).toBe("Page 1");
  });

  it("marks Previous and Next rel='prev' and rel='next'", () => {
    render(<Pagination page={3} totalPages={5} hrefFor={hrefFor} />);
    expect(screen.getByRole("link", { name: "Previous page" }).getAttribute("rel")).toBe("prev");
    expect(screen.getByRole("link", { name: "Next page" }).getAttribute("rel")).toBe("next");
    expect(screen.getByRole("link", { name: "Page 4" }).hasAttribute("rel")).toBe(false);
  });

  it("holds every link to the 44px floor below md and the package's focus ring", () => {
    const { container } = render(<Pagination page={5} totalPages={10} hrefFor={hrefFor} />);
    const links = [...container.querySelectorAll("a")];
    expect(links.length).toBeGreaterThan(4);
    for (const link of links) {
      expect(hasClasses(link, classes.linkNavLinkClass)).toBe(true);
      expect(hasClasses(link, classes.touchTarget)).toBe(true);
      expect(hasClasses(link, classes.focusRing)).toBe(true);
    }
    // The non-links and the current page keep the floor too, so the row is even.
    for (const el of container.querySelectorAll("[aria-current], [aria-disabled]")) {
      expect(hasClasses(el, classes.touchTarget)).toBe(true);
    }
  });

  it("hides the arrows from assistive technology and keeps the end names when their words give way", () => {
    const { container } = render(<Pagination page={2} totalPages={5} hrefFor={hrefFor} />);
    const svgs = [...container.querySelectorAll("svg")];
    expect(svgs).toHaveLength(2);
    for (const svg of svgs) expect(svg.getAttribute("aria-hidden")).toBe("true");
    const previous = screen.getByRole("link", { name: "Previous page" });
    expect(previous.querySelector(".max-sm\\:sr-only")?.textContent).toBe("Previous");
    expect(classes.linkNavLabelClass).toBe("max-sm:sr-only");
  });

  it("renders Next's Link through an element, which takes the hrefs", () => {
    render(<Pagination page={2} totalPages={5} hrefFor={hrefFor} render={<NextLikeLink href="/" prefetch={false} />} />);
    const link = screen.getByRole("link", { name: "Page 3" });
    expect(link.dataset.router).toBe("next");
    expect(link.dataset.prefetch).toBe("false");
    expect(link.getAttribute("href")).toBe("/library?page=3");
    expect(link.className).toContain(classes.linkNavLinkClass);
    // The current page and the ends are the package's own, never the router's.
    expect(document.querySelector("[aria-current]")?.tagName).toBe("SPAN");
  });

  it("renders React Router's Link through a function, whose destination is `to`", () => {
    render(
      <Pagination
        page={2}
        totalPages={5}
        hrefFor={(n) => `?page=${n}`}
        render={({ href, ...props }) => <RouterLikeLink {...props} to={href ?? ""} />}
      />,
    );
    const link = screen.getByRole("link", { name: "Next page" });
    expect(link.dataset.router).toBe("react-router");
    expect(link.getAttribute("href")).toBe("?page=3");
    expect(link.getAttribute("rel")).toBe("next");
    expect(hasClasses(link, classes.linkNavLinkClass)).toBe(true);
  });

  it("takes siblings and ...rest (on the nav)", () => {
    render(<Pagination page={10} totalPages={20} siblings={2} hrefFor={hrefFor} id="p" data-x="y" className="mt-4" />);
    const nav = screen.getByRole("navigation");
    expect(nav.id).toBe("p");
    expect(nav.getAttribute("data-x")).toBe("y");
    expect(nav.className).toBe("mt-4");
    expect(within(nav).getByRole("link", { name: "Page 8" })).toBeTruthy();
    expect(within(nav).queryByRole("link", { name: "Page 7" })).toBeNull();
  });

  it("is server-safe: it renders to static markup with no DOM", () => {
    const html = renderToStaticMarkup(<Pagination page={2} totalPages={3} hrefFor={hrefFor} />);
    expect(html).toContain('<nav aria-label="Pagination">');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('href="/library?page=3"');
  });
});

describe("PrevNextNav", () => {
  const props = {
    label: "Fortnights",
    current: "13–26 Nov 2026",
    previous: { href: "/t?f=prev", label: "Previous fortnight" },
    next: { href: "/t?f=next", label: "Next fortnight" },
  };

  it("is a named nav of links, with the current period marked and not a link", () => {
    render(<PrevNextNav {...props} />);
    const nav = screen.getByRole("navigation", { name: "Fortnights" });
    expect(within(nav).getAllByRole("link").map((l) => l.textContent)).toEqual(["Previous fortnight", "Next fortnight"]);
    const current = document.querySelectorAll("[aria-current]");
    expect(current).toHaveLength(1);
    expect(current[0].getAttribute("aria-current")).toBe("page");
    expect(current[0].tagName).toBe("SPAN");
    expect(current[0].textContent).toBe("13–26 Nov 2026");
    expect(current[0].matches(FOCUSABLE)).toBe(false);
  });

  it("takes the label as required: the nav's name is exactly the caller's", () => {
    render(<PrevNextNav {...props} label="Holiday year" />);
    expect(screen.getByRole("navigation").getAttribute("aria-label")).toBe("Holiday year");
  });

  it("hides the arrows from assistive technology, and rel's the ends", () => {
    const { container } = render(<PrevNextNav {...props} />);
    const svgs = [...container.querySelectorAll("svg")];
    expect(svgs).toHaveLength(2);
    for (const svg of svgs) expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByRole("link", { name: "Previous fortnight" }).getAttribute("rel")).toBe("prev");
    expect(screen.getByRole("link", { name: "Next fortnight" }).getAttribute("rel")).toBe("next");
  });

  it("leaves out an end that has no period, and shows the way back to now when the app gives it", () => {
    render(<PrevNextNav {...props} previous={undefined} today={{ href: "/t", label: "This fortnight" }} />);
    expect(screen.queryByRole("link", { name: "Previous fortnight" })).toBeNull();
    const today = screen.getByRole("link", { name: "This fortnight" });
    expect(today.getAttribute("href")).toBe("/t");
    expect(today.hasAttribute("rel")).toBe(false);
    expect(screen.queryAllByRole("link")).toHaveLength(2);
  });

  it("holds each link to the floor and the ring, and uses the router's link through render", () => {
    render(<PrevNextNav {...props} render={<NextLikeLink href="/" />} />);
    for (const link of screen.getAllByRole("link")) {
      expect((link as HTMLElement).dataset.router).toBe("next");
      expect(hasClasses(link, classes.linkNavLinkClass)).toBe(true);
    }
    expect(screen.getByRole("link", { name: "Next fortnight" }).getAttribute("href")).toBe("/t?f=next");
  });

  it("passes ...rest to the nav", () => {
    render(<PrevNextNav {...props} id="steps" />);
    expect(screen.getByRole("navigation").id).toBe("steps");
  });
});

describe("BackLink", () => {
  it("is a link whose name is the destination, with the arrow hidden", () => {
    const { container } = render(<BackLink href="/submissions">Back to submissions</BackLink>);
    const link = screen.getByRole("link", { name: "Back to submissions" });
    expect(link.getAttribute("href")).toBe("/submissions");
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.parentElement?.getAttribute("aria-hidden")).toBe("true");
    expect(link.textContent).toBe("Back to submissions");
  });

  it("holds the 44px floor, the focus ring, and underlines the label but not the arrow", () => {
    render(<BackLink href="/x">Back to library</BackLink>);
    const link = screen.getByRole("link");
    expect(hasClasses(link, classes.backLinkClass)).toBe(true);
    expect(hasClasses(link, classes.touchTarget)).toBe(true);
    expect(hasClasses(link, classes.focusRing)).toBe(true);
    expect(link.querySelector("span.underline")?.textContent).toBe("Back to library");
    expect(link.querySelector("svg")?.closest("span.underline")).toBeNull();
  });

  it("takes an icon name or an element of the app's own", () => {
    const { container, rerender } = render(
      <BackLink href="/x" icon="chevronLeft">
        Back
      </BackLink>,
    );
    expect(container.querySelector("svg")).toBeTruthy();
    rerender(
      <BackLink href="/x" icon={<svg data-mine="1" aria-hidden="true" />}>
        Back
      </BackLink>,
    );
    expect(container.querySelector("svg[data-mine]")).toBeTruthy();
  });

  it("renders React Router's Link through an element: `to` stays, the classes and label land", () => {
    render(<BackLink render={<RouterLikeLink to="/library" />}>Back to library</BackLink>);
    const link = screen.getByRole("link", { name: "Back to library" });
    expect(link.dataset.router).toBe("react-router");
    expect(link.getAttribute("href")).toBe("/library");
    expect(hasClasses(link, classes.backLinkClass)).toBe(true);
  });

  it("merges the caller's className and passes ...rest", () => {
    render(
      <BackLink href="/x" className="mb-2" data-testid="b" title="Up one level">
        Back to x
      </BackLink>,
    );
    const link = screen.getByTestId("b");
    expect(link.className).toBe(`${classes.backLinkClass} mb-2`);
    expect(link.getAttribute("title")).toBe("Up one level");
  });

  it("is server-safe", () => {
    expect(renderToStaticMarkup(<BackLink href="/x">Back to x</BackLink>)).toContain('href="/x"');
  });
});

describe("ViewSwitch", () => {
  const views = [
    { id: "board", href: "/p?view=board", label: "Board" },
    { id: "list", href: "/p?view=list", label: "List" },
  ];

  it("is a named nav with every view a link, and exactly one marked current", () => {
    render(<ViewSwitch label="View" views={views} current="list" />);
    const nav = screen.getByRole("navigation", { name: "View" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((l) => l.textContent)).toEqual(["Board", "List"]);
    expect(links.map((l) => l.getAttribute("href"))).toEqual(["/p?view=board", "/p?view=list"]);
    const current = nav.querySelectorAll("[aria-current]");
    expect(current).toHaveLength(1);
    expect(current[0]).toBe(screen.getByRole("link", { name: "List" }));
    expect(current[0].getAttribute("aria-current")).toBe("page");
  });

  it("marks the current view by weight and a bar as well as colour, and the others as links", () => {
    render(<ViewSwitch label="View" views={views} current="board" />);
    const board = screen.getByRole("link", { name: "Board" });
    const list = screen.getByRole("link", { name: "List" });
    expect(hasClasses(board, classes.linkNavCurrentClass)).toBe(true);
    expect(hasClasses(list, classes.linkNavCurrentClass)).toBe(false);
    for (const link of [board, list]) {
      expect(hasClasses(link, classes.linkNavLinkClass)).toBe(true);
      expect(hasClasses(link, classes.touchTarget)).toBe(true);
    }
  });

  it("marks none when `current` names no view", () => {
    render(<ViewSwitch label="View" views={views} current="map" />);
    expect(document.querySelectorAll("[aria-current]")).toHaveLength(0);
  });

  it("uses the router's link through render", () => {
    render(<ViewSwitch label="View" views={views} current="board" render={<NextLikeLink href="/" />} />);
    for (const link of screen.getAllByRole("link")) expect((link as HTMLElement).dataset.router).toBe("next");
    expect(screen.getByRole("link", { name: "List" }).getAttribute("href")).toBe("/p?view=list");
  });
});

describe("the navigation classes", () => {
  const all = [
    classes.linkNavListClass,
    classes.linkNavItemClass,
    classes.linkNavLinkClass,
    classes.linkNavCurrentClass,
    classes.linkNavUnavailableClass,
    classes.linkNavGapClass,
    classes.linkNavLabelClass,
    classes.backLinkClass,
  ];

  it("hold no motion: no transition, no animation", () => {
    for (const value of all) expect(value).not.toMatch(/transition|animate|duration|motion/);
  });

  it("keep the touch-target floor on every interactive form", () => {
    for (const value of [classes.linkNavItemClass, classes.linkNavLinkClass, classes.backLinkClass]) {
      expect(value).toContain(classes.touchTarget);
    }
    for (const value of [classes.linkNavLinkClass, classes.backLinkClass]) expect(value).toContain(classes.focusRing);
  });

  it("use no raw palette class", () => {
    for (const value of all) expect(value).not.toMatch(/\b(?:bg|text|border)-(?:[a-z]+-\d{2,3}|white|black)\b/);
  });
});
