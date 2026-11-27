import type { ComponentProps, ReactNode } from "react";

import { joinClasses, renderLink, type LinkRender } from "../link-render.js";
import {
  linkNavCurrentClass,
  linkNavIdleClass,
  linkNavItemClass,
  linkNavLabelClass,
  linkNavLinkClass,
  linkNavListClass,
  linkNavStatusClass,
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

/** What `aria-current` says about a current place: `"page"`, or `"true"` when the page's own entry in the rail already is. */
export type CurrentMark = "page" | "true";

/**
 * Previous, "Page N of M", Next: the pager for a result set, as links.
 *
 * `page` is the page the reader is on and `totalPages` how many there are,
 * both whole numbers: a fractional `page` is floored and a fractional
 * `totalPages` rounded up, so a last, part-filled page is never hidden.
 * `hrefFor` is the caller's builder, called only with a page that exists
 * (`1…totalPages`), and returns where it lives; keep the rest of the URL in it
 * (`(n) => withPage(searchParams, n)`), or the filters and sort are lost.
 *
 * - **Links, not buttons.** Previous and Next are `<a href>`, or the router's
 *   link through `render`, with `rel="prev"` and `rel="next"`. The one that
 *   cannot go further is a `<span role="link" aria-disabled="true">`: no
 *   `href`, no tab stop, announced as unavailable, drawn muted. `pending`
 *   makes both so, while a page loads.
 * - **The status** is plain text, "Page 2 of 10": no `aria-current`, because
 *   an app's rail already marks the current page and a second one would be
 *   heard as two; and no live region, because paging is a navigation and a
 *   `role="status"` would announce on every one.
 * - **The reader is never stranded.** Past the end (`page` 99 of 10) the status
 *   says so, Previous goes to the last page that exists and Next is
 *   unavailable. With one page or none and the reader on page 1 there is
 *   nothing to render and nothing is; on page 5 of 1 there is a way back.
 *   `Infinity` is the last page; `NaN` and anything below 1 are page 1.
 * - **44px** below `md` on every item, and the package's focus ring on the links.
 *
 * `label` names the `<nav>` and is required; give each one on a page its own
 * ("Pagination, reviews"). `previousLabel` and `nextLabel` ("Previous", "Next")
 * and `status` (a function of the page and the total, "Page 2 of 10" by
 * default) are the words, for other copy or another language. `render` is the
 * router's link, and needs the function form for React Router and for any
 * router whose link takes the destination as a prop of its own:
 * `render={({ href, ...props }) => <Link {...props} to={href ?? ""} />}`. An
 * element such as `<Link to="/" />` would send every page to `/`. Next's
 * `<Link href="/" />` is fine, since each `href` replaces the element's.
 * `...rest` reaches the `<nav>`.
 */
export function Pagination({
  page,
  totalPages,
  hrefFor,
  label,
  previousLabel = "Previous",
  nextLabel = "Next",
  status = (here, total) => `Page ${here} of ${total}`,
  pending = false,
  render,
  className,
  ...rest
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
  label: string;
  previousLabel?: string;
  nextLabel?: string;
  status?: (page: number, totalPages: number) => ReactNode;
  pending?: boolean;
  render?: LinkRender;
} & Omit<ComponentProps<"nav">, "children" | "aria-label">) {
  // The last page that exists: at least 1, so there is always a page to go back to.
  const last = Math.max(1, Number.isFinite(totalPages) ? Math.ceil(totalPages) : 1);
  const here = page === Number.POSITIVE_INFINITY ? last : Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
  if (last <= 1 && here <= 1) return null;

  const step = (target: number | null, side: "previous" | "next", words: string) => {
    const content = <Arrow side={side}>{words}</Arrow>;
    return target === null || pending ? (
      // A common pattern for a link that is not available (ARIA defines no
      // disabled link): a link role with no `href`, so it takes no focus, and
      // `aria-disabled` so it is read as unavailable.
      <span role="link" aria-disabled="true" className={joinClasses(linkNavItemClass, linkNavUnavailableClass)}>
        {content}
      </span>
    ) : (
      renderLink(
        {
          href: hrefFor(target),
          rel: side === "previous" ? "prev" : "next",
          className: joinClasses(linkNavLinkClass, linkNavIdleClass),
          children: content,
        },
        render,
      )
    );
  };

  return (
    <nav {...rest} aria-label={label} className={className}>
      <ul className={linkNavListClass}>
        <li>{step(here > 1 ? Math.min(here - 1, last) : null, "previous", previousLabel)}</li>
        <li>
          <span className={joinClasses(linkNavItemClass, linkNavStatusClass)}>{status(here, last)}</span>
        </li>
        <li>{step(here < last ? here + 1 : null, "next", nextLabel)}</li>
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
 * period ("13–26 Nov 2026"), shown as a `<span aria-current>`, not a
 * link. `ariaCurrent` is `"page"` unless the page that holds the nav is itself
 * the current page of the app's rail or tabs, as Work OS's holiday-year nav is
 * (its Settings tab is current): then `"true"`, so only one element claims
 * the page. `previous` and `next` are `{ href, label }`: leave one out where
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
  ariaCurrent = "page",
  render,
  className,
  ...rest
}: {
  label: string;
  current: ReactNode;
  ariaCurrent?: CurrentMark;
  previous?: PrevNextTarget;
  next?: PrevNextTarget;
  today?: PrevNextTarget;
  render?: LinkRender;
} & Omit<ComponentProps<"nav">, "children" | "aria-label">) {
  const link = (target: PrevNextTarget, rel: string | undefined, children: ReactNode) => (
    <li>{renderLink(
        { href: target.href, rel, className: joinClasses(linkNavLinkClass, linkNavIdleClass), children },
        render,
      )}</li>
  );
  return (
    <nav {...rest} aria-label={label} className={className}>
      <ul className={linkNavListClass}>
        {previous ? link(previous, "prev", <Arrow side="previous">{previous.label}</Arrow>) : null}
        <li>
          <span aria-current={ariaCurrent} className={joinClasses(linkNavItemClass, linkNavCurrentClass)}>
            {current}
          </span>
        </li>
        {next ? link(next, "next", <Arrow side="next">{next.label}</Arrow>) : null}
        {today ? link(today, undefined, today.label) : null}
      </ul>
    </nav>
  );
}
