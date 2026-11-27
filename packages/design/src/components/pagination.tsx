import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { joinClasses, renderLink, type LinkRender } from "../link-render.js";
import {
  linkNavCurrentClass,
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

/** A label with its arrow: the label shows from `sm`, and is the name always. */
function Arrow({ side, children }: { side: "previous" | "next"; children: ReactNode }) {
  return (
    <>
      {side === "previous" ? <Icon name="previous" /> : null}
      <span className={linkNavLabelClass}>{children}</span>
      {side === "next" ? <Icon name="next" /> : null}
    </>
  );
}

/** `page` as a page that exists: the integer part held to `1…total`, and `1` when it is not a number. */
function clampPage(page: number, total: number): number {
  return Number.isFinite(page) ? Math.min(Math.max(Math.trunc(page), 1), total) : 1;
}

/**
 * Previous, "Page N of M", Next: the pager for a result set, as links.
 *
 * `page` is the current page and `totalPages` how many there are; `hrefFor`
 * is the caller's builder, called only with a page that exists (`1…totalPages`),
 * and returns where it lives (`(n) => `?page=${n}``). Returns nothing for a
 * single page, or none. An invalid `page` (`NaN`, `0`, `99` of 10) is read as
 * the nearest page that exists.
 *
 * - **Links, not buttons.** Previous and Next are `<a href>`, or the router's
 *   link through `render`, with `rel="prev"` and `rel="next"`. At the first
 *   or last page the one that cannot go further is a
 *   `<span role="link" aria-disabled="true">`: no `href`, no tab stop,
 *   announced as unavailable, drawn muted.
 * - **The status** is plain text, `<span aria-current="page">Page 2 of 10</span>`,
 *   not a live region. Paging is a navigation, so the new page loads (or a
 *   client router re-renders it) and a screen reader meets the status as part
 *   of the page; a `role="status"` would announce on every navigation.
 * - **44px** below `md` on every item, and the package's focus ring on the links.
 *
 * `label` names the `<nav>` ("Pagination"); give each one on a page its own.
 * `previousLabel` and `nextLabel` ("Previous", "Next") and `status` (a function
 * of the page and the total, "Page 2 of 10" by default) are the words, for
 * other copy or another language. `render` is the router's link: Next's
 * `render={<Link />}` takes the `href`; React Router's takes it as `to`,
 * `render={({ href, ...props }) => <Link {...props} to={href ?? ""} />}`.
 * `...rest` reaches the `<nav>`.
 */
export function Pagination({
  page,
  totalPages,
  hrefFor,
  label = "Pagination",
  previousLabel = "Previous",
  nextLabel = "Next",
  status = (current, total) => `Page ${current} of ${total}`,
  render,
  className,
  ...rest
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
  label?: string;
  previousLabel?: string;
  nextLabel?: string;
  status?: (page: number, totalPages: number) => ReactNode;
  render?: LinkRender;
} & Omit<ComponentPropsWithoutRef<"nav">, "children" | "aria-label">) {
  const total = Number.isFinite(totalPages) ? Math.trunc(totalPages) : 0;
  if (total <= 1) return null;
  const current = clampPage(page, total);

  const step = (target: number, side: "previous" | "next", words: string) => {
    const content = <Arrow side={side}>{words}</Arrow>;
    return target < 1 || target > total ? (
      // The standard disabled link: a link role with no `href`, so it takes no
      // focus, and `aria-disabled` so it is read as unavailable.
      <span role="link" aria-disabled="true" className={joinClasses(linkNavItemClass, linkNavUnavailableClass)}>
        {content}
      </span>
    ) : (
      renderLink(
        { href: hrefFor(target), rel: side === "previous" ? "prev" : "next", className: linkNavLinkClass, children: content },
        render,
      )
    );
  };

  return (
    <nav {...rest} aria-label={label} className={className}>
      <ul className={linkNavListClass}>
        <li>{step(current - 1, "previous", previousLabel)}</li>
        <li>
          <span aria-current="page" className={joinClasses(linkNavItemClass, "text-ink")}>
            {status(current, total)}
          </span>
        </li>
        <li>{step(current + 1, "next", nextLabel)}</li>
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
