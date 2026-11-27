import {
  Children,
  Fragment,
  createElement,
  isValidElement,
  useId,
  type ComponentProps,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
} from "react";

import type { IconName } from "../icons.generated.js";
import { joinClasses, renderLink, type LinkRender } from "../link-render.js";
import {
  navButtonClass,
  navDividerClass,
  navGroupClass,
  navHeadingClass,
  navItemClass,
  navItemCurrentClass,
  navItemIdleClass,
  navListClass,
  railBrandClass,
  railBrandNameClass,
  railClass,
  railFootClass,
  railGroupsClass,
  railHeaderClass,
  railLabelClass,
  railNavClass,
} from "../ui-classes.js";
import { Icon } from "./icon.js";

/*
 * The app shell's navigation (§7; #19, #23, and the Digital Library's #99):
 * the navy rail as components, server-safe. Nothing here reads the location:
 * the app computes which link is current (`isActivePath`) and says so through
 * `current`, so the same parts serve Next (Work OS, the members portal) and
 * React Router (the Digital Library). Links render the app's router link
 * through `render` (`link-render.ts`). Every component passes `...rest` to its
 * root element.
 */

/**
 * Each child of a list, unwrapped from fragments and with nothing-renders
 * (`false`, `null`) dropped, so `{isAdmin && <NavLink …/>}` and
 * `foot={<>…</>}` both give one `<li>` per item.
 */
function items(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? items(child.props.children)
      : [child],
  );
}

/** A list of rail items, one `<li>` each. */
function ItemList({ children, ...rest }: { children: ReactNode } & ComponentPropsWithoutRef<"ul">) {
  return (
    <ul {...rest} className={navListClass}>
      {items(children).map((child, i) => (
        // `Children.toArray` has keyed every element already.
        <li key={isValidElement(child) ? (child.key ?? i) : i}>{child}</li>
      ))}
    </ul>
  );
}

/**
 * The rail: an `<aside>` holding the brand, then one `<nav>` landmark with
 * the groups and the foot, so every destination — Guide and Sign out
 * included — is inside the landmark a screen reader jumps to.
 *
 * `label` names the `<nav>` ("Main" unless the app has two). `collapsed` is
 * the person's preference, which the app stores (a cookie, read on the
 * server, so the first paint is the right width — §7) and passes in; it
 * narrows the rail to 56px at every width, as the viewport does below `lg`.
 * `...rest` reaches the `<aside>`.
 */
export function Rail({
  label = "Main",
  collapsed = false,
  brand,
  foot,
  className,
  children,
  ...rest
}: {
  label?: string;
  collapsed?: boolean;
  /** The top of the rail: a `RailBrand`, and a collapse toggle if the app has one. */
  brand?: ReactNode;
  /** Items below the groups, after a rule: Guide, the person, Sign out (`NavButton`). */
  foot?: ReactNode;
  /** The `NavGroup`s. */
  children: ReactNode;
} & ComponentPropsWithoutRef<"aside">) {
  return (
    <aside {...rest} data-collapsed={collapsed || undefined} className={joinClasses(railClass, className)}>
      {brand ? <div className={railHeaderClass}>{brand}</div> : null}
      <nav aria-label={label} className={railNavClass}>
        <div className={railGroupsClass}>{children}</div>
        {foot ? (
          <div className={railFootClass}>
            <ItemList>{foot}</ItemList>
          </div>
        ) : null}
      </nav>
    </aside>
  );
}

/**
 * The brand slot's link: the mark, and the name beside it while the rail is
 * wide. The name is `sr-only` when narrow rather than gone, so it stays the
 * link's accessible name at every width and needs no `aria-label`. 44px at
 * every width. `mark` is decorative and is hidden from assistive technology:
 * an `<img alt="">` or an SVG. `href` defaults to `/`; `render` takes the
 * app's router link, as `NavLink`'s does.
 */
export function RailBrand({
  name,
  mark,
  href,
  render,
  className,
  ...rest
}: {
  name: string;
  mark: ReactNode;
  href?: string;
  render?: LinkRender;
} & Omit<ComponentProps<"a">, "children" | "href">) {
  return renderLink(
    {
      ...rest,
      // The default `/` is the plain link's alone: on a router's element it
      // would overwrite the element's own `href`.
      href: render === undefined ? (href ?? "/") : href,
      className: joinClasses(railBrandClass, className),
      children: (
        <>
          <span aria-hidden="true" className="flex shrink-0">
            {mark}
          </span>
          <span className={joinClasses(railBrandNameClass, railLabelClass)}>{name}</span>
        </>
      ),
    },
    render,
  );
}

/**
 * A headed group of rail items: the heading, and a list it names, so a
 * screen reader hears "Admin, list, 3 items". While the rail is narrow the
 * heading is visually hidden — still the list's name — and a rule takes its
 * place, as in Work OS. Each child becomes one `<li>`; a fragment's children
 * count one by one. The heading is an `<h2>` unless `headingLevel` says
 * otherwise, for an app whose outline puts the rail deeper. `...rest`
 * reaches the group's `<div>`.
 */
export function NavGroup({
  heading,
  headingLevel = 2,
  className,
  children,
  ...rest
}: {
  heading: string;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
} & ComponentPropsWithoutRef<"div">) {
  const id = useId();
  return (
    <div {...rest} className={joinClasses(navGroupClass, className)}>
      {createElement(
        `h${headingLevel}`,
        { id, className: joinClasses(navHeadingClass, railLabelClass) },
        heading,
      )}
      <hr aria-hidden="true" className={navDividerClass} />
      <ItemList aria-labelledby={id}>{children}</ItemList>
    </div>
  );
}

/** The icon a rail item leads with: a name from the vocabulary, or an element of the app's own. */
export type NavIcon = IconName | ReactElement;

function ItemContent({ icon, children }: { icon: NavIcon; children: ReactNode }) {
  return (
    <>
      <span aria-hidden="true" className="flex shrink-0">
        {typeof icon === "string" ? <Icon name={icon} /> : icon}
      </span>
      <span className={joinClasses("truncate", railLabelClass)}>{children}</span>
    </>
  );
}

/** `current` as the attribute: `true` is `"page"`; `"true"` is a current item in a set of its own. */
function ariaCurrent(current: boolean | "page" | "true" | undefined): "page" | "true" | undefined {
  if (current === true) return "page";
  return current || undefined;
}

/** Where a `NavLink` goes: an `href` for a plain `<a>`, or a `render` with the app's router link. */
type NavLinkTarget = { href: string; render?: undefined } | { href?: string; render: LinkRender };

/**
 * One destination on the rail: an icon, and its label beside it while the
 * rail is wide. When the rail is narrow the label is `sr-only`, so an
 * icon-only link keeps its name. 44px tall at every width, and 44px wide when
 * it is only an icon.
 *
 * `current` is the app's answer to "is this the page I am on?", usually
 * `isActivePath(pathname, href)`. `true` sets `aria-current="page"` and draws
 * the current state — weight, the tint and the left bar; `"true"` draws the
 * same and sets `aria-current="true"`, for the entry whose page carries its
 * own section navigation (Work OS #451), so only one element claims the page.
 *
 * Give `href` for a plain `<a>`, or `render` for the router's link
 * (`link-render.ts`): `render={<Link href="/calls" />}` in Next,
 * `render={<Link to="/calls" />}` in React Router — the router's `Link`,
 * never its `NavLink`, which overrides `aria-current` with its own matching
 * (`link-render.ts`): `current` is the single source. The package's classes,
 * `aria-current` and the icon and label land on that element. `icon` is an
 * `IconName` or an element (an `<svg aria-hidden>` of the app's own).
 * `...rest` (`title`, `ref`, `onClick`; `prefetch` is the router's and goes
 * on its element) reaches the link. An icon-only link's name is its hidden
 * label; give it a `title` (or wrap it in the package's `Tooltip`) too, so a
 * sighted mouse user on the narrow rail can read it.
 */
export function NavLink({
  href,
  render,
  icon,
  current,
  className,
  children,
  ...rest
}: NavLinkTarget & {
  icon: NavIcon;
  current?: boolean | "page" | "true";
  /** The label: the visible words while wide, the accessible name always. */
  children: ReactNode;
} & Omit<ComponentProps<"a">, "href" | "children" | "aria-current">) {
  const state = ariaCurrent(current);
  return renderLink(
    {
      ...rest,
      href,
      "aria-current": state,
      className: joinClasses(navItemClass, state ? navItemCurrentClass : navItemIdleClass, className),
      children: <ItemContent icon={icon}>{children}</ItemContent>,
    },
    render,
  );
}

/**
 * An action on the rail, not a destination: Sign out, which posts to the
 * API. A real `<button>` (`type="button"` unless the caller says `submit`,
 * as a Next form action's button does) with a rail link's look and its 44px
 * target. Never current. `...rest` reaches the button.
 */
export function NavButton({
  icon,
  type = "button",
  className,
  children,
  ...rest
}: {
  icon: NavIcon;
  children: ReactNode;
} & Omit<ComponentProps<"button">, "children">) {
  return (
    <button
      {...rest}
      type={type}
      className={joinClasses(navItemClass, navItemIdleClass, navButtonClass, className)}
    >
      <ItemContent icon={icon}>{children}</ItemContent>
    </button>
  );
}
