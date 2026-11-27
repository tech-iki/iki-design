/**
 * The site's rail marks exactly one link as the current page, on every page
 * it links to (#23). Before it marked none: every link rendered the same
 * `text-paper/75`, with no `aria-current` and no bar. The pathname is what
 * Next's `usePathname` would return during prerendering; the rail is the
 * real `SiteNav`, rendered on the server as the layout renders it.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { navItemCurrentClass, navItemIdleClass } from "@tech-iki/design";

let pathname = "/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

const { SECTIONS, SiteNav } = await import("@/components/site-nav");

/** The `<a>`s in the rail's nav, with their href, aria-current and class. */
function links(html: string) {
  const nav = html.slice(html.indexOf("<nav"), html.indexOf("</nav>"));
  return [...nav.matchAll(/<a\b([^>]*)>/g)].map(([, attrs]) => ({
    href: attrs.match(/href="([^"]*)"/)?.[1],
    current: attrs.match(/aria-current="([^"]*)"/)?.[1],
    className: attrs.match(/class="([^"]*)"/)?.[1] ?? "",
  }));
}

describe("the site's rail", () => {
  beforeEach(() => {
    pathname = "/";
  });

  it("links every section, inside a named nav", () => {
    const html = renderToStaticMarkup(createElement(SiteNav));
    expect(html).toContain('<nav aria-label="Main"');
    expect(links(html).map((l) => l.href)).toEqual(SECTIONS.map((s) => s.href));
  });

  it.each(SECTIONS.map((s) => s.href))("marks exactly %s current on its own page", (href) => {
    pathname = href;
    const all = links(renderToStaticMarkup(createElement(SiteNav)));
    const current = all.filter((l) => l.current !== undefined);
    expect(current).toEqual([expect.objectContaining({ href, current: "page" })]);
    expect(current[0].className).toContain(navItemCurrentClass);
    for (const l of all.filter((l) => l.href !== href)) expect(l.className).toContain(navItemIdleClass);
  });

  it("keeps the section current below it, and the root only on itself", () => {
    pathname = "/colour/anything";
    const current = links(renderToStaticMarkup(createElement(SiteNav))).filter((l) => l.current);
    expect(current.map((l) => l.href)).toEqual(["/colour"]);
  });

  it("marks nothing on a page it does not link to", () => {
    pathname = "/no-such-page";
    expect(links(renderToStaticMarkup(createElement(SiteNav))).filter((l) => l.current)).toEqual([]);
  });
});
