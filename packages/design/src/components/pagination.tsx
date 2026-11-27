import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { joinClasses, renderLink, type LinkRender } from "../link-render.js";
import { clampPage, pageRange, wholePages } from "../page-range.js";
import {
  linkNavCurrentClass,
  linkNavGapClass,
  linkNavItemClass,
  linkNavLabelClass,
  linkNavLinkClass,
  linkNavListClass,
  linkNavUnavailableClass,
} from "../ui-classes.js";
import { Icon } from "./icon.js";

/*
 * Navigation by links (§8; #20): `Pagination` and `PrevNextNav`. Both are a
 * `<nav>` with an accessible name holding a list of **links**, so paging is
 * addressable, works without client JavaScript and opens in a new tab. The
 * caller supplies every `href`; nothing here reads the router. Links render
 * the app's router link through `render` (`link-render.ts`). Server-safe.
 */

/** An item that leads with an arrow, or ends with one: its label shows from `sm`, and is the name always. */
function Arrow({ side, children }: { side: "previous" | "next"; children: ReactNode }) {
  return (
    <>
      {side === "previous" ? <Icon name="previous" /> : null}
      <span className={linkNavLabelClass}>{children}</span>
      {side === "next" ? <Icon name="next" /> : null}
    </>
  );
}

/**
 * Page links for a result set: Previous, a row of page numbers, Next.
 *
 * `page` is the current page and `totalPages` how many there are; `hrefFor`
 * is the caller's builder, called with a page number that exists (`1…totalPages`),
 * and returns where it lives (`(n) => `?page=${n}``). Returns nothing for a
 * single page, or none. An invalid `page` (`NaN`, `0`, `99` of 10) is read as
 * the nearest page that exists.
 *
 * - **Links, not buttons.** Every page is an `<a href>` (or the router's
 *   link through `render`); the current page and an end that cannot go
 *   further are not links at all.
 * - **The current page** is a `<span aria-current="page">`: marked by weight
 *   and a bar as well as colour, so there is nothing to click that goes
 *   where you already are.
 * - **Previous and Next** carry `rel="prev"` and `rel="next"`. At the first
 *   or last page they are `<span role="link" aria-disabled="true">`: no
 *   `href`, no tab stop, announced as unavailable.
 * - **Long ranges truncate** with an ellipsis (`pageRange`) that is
 *   `aria-hidden`, a gap and not a link. The row is the same length wherever
 *   the current page is, and wraps rather than scrolling on a phone.
 * - **Names.** "Page 3" for a number, "Previous page" and "Next page" for
 *   the ends (an `aria-label` that contains the visible words), and the end
 *   words give way to the arrow below `sm`.
 *
 * `label` names the `<nav>` ("Pagination"); give each one on a page its own
 * ("Pagination, reviews"). `siblings` is how many numbers show either side
 * of the current page (1). `render` is the router's link: Next's
 * `render={<Link />}` takes the `href`; React Router's takes it as `to`,
 * `render={({ href, ...props }) => <Link {...props} to={href ?? ""} />}`.
 * `...rest` reaches the `<nav>`.
 */
export function Pagination({
  page,
  totalPages,
  hrefFor,
  label = "Pagination",
  siblings = 1,
  render,
  className,
  ...rest
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
  label?: string;
  siblings?: number;
  render?: LinkRender;
} & Omit<ComponentPropsWithoutRef<"nav">, "children" | "aria-label">) {
  const total = wholePages(totalPages);
  if (total <= 1) return null;
  const current = clampPage(page, total);

  // The name is an `aria-label` that contains the visible text ("Page 3" for
  // "3", "Next page" for "Next": WCAG 2.5.3), so it reads the same whatever
  // the layout does to the words around it.
  const link = (target: number, name: string, props: { rel?: string; children: ReactNode }) =>
    renderLink({ href: hrefFor(target), "aria-label": name, className: linkNavLinkClass, ...props }, render);
  const unavailable = (name: string, children: ReactNode) => (
    // The standard disabled link: a link role with no `href`, so it takes no
    // focus, and `aria-disabled` so it is read as unavailable.
    <span
      role="link"
      aria-disabled="true"
      aria-label={name}
      className={joinClasses(linkNavItemClass, linkNavUnavailableClass)}
    >
      {children}
    </span>
  );

  const previous = <Arrow side="previous">Previous</Arrow>;
  const next = <Arrow side="next">Next</Arrow>;

  return (
    <nav {...rest} aria-label={label} className={className}>
      <ul className={linkNavListClass}>
        <li>{current > 1 ? link(current - 1, "Previous page", { rel: "prev", children: previous }) : unavailable("Previous page", previous)}</li>
        {pageRange(current, total, siblings).map((item, i) =>
          item === "ellipsis" ? (
            <li key={`gap-${i}`} aria-hidden="true" className={linkNavGapClass}>
              …
            </li>
          ) : (
            <li key={item}>
              {item === current ? (
                // One inner span, so the word and the digits stay one run of text
                // ("Page 3") instead of two flex items with no space between.
                <span aria-current="page" className={joinClasses(linkNavItemClass, linkNavCurrentClass)}>
                  <span>
                    <span className="sr-only">Page </span>
                    {item}
                  </span>
                </span>
              ) : (
                link(item, `Page ${item}`, { children: item })
              )}
            </li>
          ),
        )}
        <li>{current < total ? link(current + 1, "Next page", { rel: "next", children: next }) : unavailable("Next page", next)}</li>
      </ul>
    </nav>
  );
}

/** A destination of a `PrevNextNav`: where it goes, and the words that name it. */
export type PrevNextTarget = { href: string; label: string };

/**
 * The period stepper: previous, the current period, next, and optionally a way
 * back to now. Work OS's fortnight and holiday-year steppers.
 *
 * `label` names the `<nav>` and is required ("Fortnights", "Holiday year"):
 * a page can hold two. `current` is what the nav is on, the words of the
 * period ("13–26 Nov 2026"), shown as a `<span aria-current="page">`, not a
 * link. `previous` and `next` are `{ href, label }`: leave one out where
 * there is no such period, and it is not rendered. The label is the link's
 * name ("Previous fortnight") and shows from `sm`; below it the arrow stands
 * alone, `aria-hidden`, and the name stays. `today` is the optional way back
 * to the period that is current *now*, for when the nav is on another: the
 * app renders it only then.
 *
 * `render` as `Pagination`'s: the router's link, by element or function.
 * `...rest` reaches the `<nav>`. Server-safe.
 */
export function PrevNextNav({
  label,
  current,
  previous,
  next,
  today,
  render,
  className,
  ...rest
}: {
  label: string;
  current: ReactNode;
  previous?: PrevNextTarget;
  next?: PrevNextTarget;
  today?: PrevNextTarget;
  render?: LinkRender;
} & Omit<ComponentPropsWithoutRef<"nav">, "children" | "aria-label">) {
  const link = (target: PrevNextTarget, rel: string | undefined, children: ReactNode) => (
    <li>{renderLink({ href: target.href, rel, className: linkNavLinkClass, children }, render)}</li>
  );
  return (
    <nav {...rest} aria-label={label} className={className}>
      <ul className={linkNavListClass}>
        {previous ? link(previous, "prev", <Arrow side="previous">{previous.label}</Arrow>) : null}
        <li>
          <span aria-current="page" className={joinClasses(linkNavItemClass, linkNavCurrentClass)}>
            {current}
          </span>
        </li>
        {next ? link(next, "next", <Arrow side="next">{next.label}</Arrow>) : null}
        {today ? link(today, undefined, today.label) : null}
      </ul>
    </nav>
  );
}
