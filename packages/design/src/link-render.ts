/**
 * How a link-shaped component renders the app's router link (#19, from the
 * Digital Library's #99 and #101): the one convention every link in the
 * package uses — `NavLink` and `RailBrand` today, `Pagination`, `PrevNextNav`
 * and `BackLink` next (#20, #22).
 *
 * A plain `<a href>` is right in a server-rendered app and wrong in a
 * client-routed one, where every click reloads the page and drops the app's
 * state. So a link-shaped component takes a `render` prop, Base UI's name
 * for the same idea, in one of two forms:
 *
 * - **An element**, the usual form: `render={<Link href="/calls" />}` for
 *   Next.js, `render={<Link to="/calls" />}` for React Router. The component
 *   clones it with `cloneElement`, keeping its own props (`href`, `to`,
 *   `prefetch`, `ref`, `key`) and adding the package's.
 * - **A function** that takes the props and returns the link, for a link
 *   that has to be built rather than cloned:
 *   `render={(props) => <Link {...props} to={{ pathname, search }} />}`.
 *
 * Without `render` it is an `<a>`, so a server-rendered app passes nothing.
 *
 * **Pass the router's `Link`, not its `NavLink`: the package's `current` is
 * the single source of the current page.** React Router's `NavLink` (and any
 * link that works out its own `aria-current`) decides the attribute after
 * the props it is given, so it can always override the package: probed with
 * react-router 7, `current={false}` on a route its matching calls active
 * still rendered `aria-current="page"`, a second current page, and
 * `current` where it disagreed drew the current look with no attribute. No
 * prop can stop a component from overriding its own output, and reading its
 * state would take a hook, so this is a rule, not a fix: `Link` and a plain
 * `<a>` render exactly what the package says.
 *
 * Who owns what, when the package's props meet the element's:
 *
 * | Prop | Result |
 * | --- | --- |
 * | `className` | Both: the package's classes, then the element's (a string; a function `className` is not supported). |
 * | `aria-current` | The package's: it comes from the `current` the app computed, and the look follows the same value. True for `Link` and `<a>`; see above for a link that computes its own. |
 * | `children` | The package's: the icon and label it lays out. The element's own children are dropped. |
 * | `on*` handlers | Both, when both are given: the element's runs first, then the component's. |
 * | anything else | The element's, unless the component was given the same prop with a value: an `href` on `NavLink` beats one on the element. |
 *
 * Server-safe by construction: `cloneElement`, `createElement` and
 * `isValidElement` are in React's server build, and nothing here is a hook,
 * so a Server Component can render any of these links and the element it is
 * handed can be a Client Component such as Next's `Link`.
 */
import {
  cloneElement,
  createElement,
  isValidElement,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";

/** What a link-shaped component hands to the link it renders. */
export type LinkSlotProps = Omit<ComponentProps<"a">, "className" | "children"> & {
  className: string;
  children?: ReactNode;
};

/**
 * The `render` prop: an element to clone, or a function from the props to
 * the link. Typed loosely on purpose: a router's link takes props the package
 * cannot know (`to`, `prefetch`, `replace`), and the element's own type
 * checks them where it is written.
 */
export type LinkRender = ReactElement | ((props: LinkSlotProps) => ReactNode);

/** Classes joined with single spaces, empty parts dropped. */
export function joinClasses(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

/** The props with an `undefined` value removed, so they cannot erase the element's own. */
function defined(props: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined));
}

/**
 * Render `props` as an `<a>`, through `render`'s function, or onto `render`'s
 * element, by the rules in this module's header.
 */
export function renderLink(props: LinkSlotProps, render?: LinkRender): ReactNode {
  if (render === undefined) return createElement("a", props);
  if (typeof render === "function") return render(props);
  if (!isValidElement(render)) {
    throw new TypeError("render must be a React element or a function that returns one");
  }

  const { className, children, "aria-current": current, ...rest } = props;
  const own = render.props as Record<string, unknown>;
  const given = defined(rest);
  for (const [name, handler] of Object.entries(given)) {
    const theirs = own[name];
    if (/^on[A-Z]/.test(name) && typeof handler === "function" && typeof theirs === "function") {
      given[name] = (...args: unknown[]) => {
        theirs(...args);
        handler(...args);
      };
    }
  }

  return cloneElement(render as ReactElement<Record<string, unknown>>, {
    ...given,
    className: joinClasses(className, typeof own.className === "string" ? own.className : undefined),
    "aria-current": current,
    children,
  });
}
