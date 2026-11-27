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
 * Who owns what, when the package's props meet the element's:
 *
 * | Prop | Result |
 * | --- | --- |
 * | `className` | Both: the package's classes, then the element's. A function `className` (React Router's `NavLink`) is wrapped so its result is appended too. |
 * | `aria-current` | The package's, always: it comes from the `current` the app computed, and the look follows the same value. |
 * | `children` | The package's: the icon and label it lays out. The element's own children are dropped. |
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
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
} from "react";

/** What a link-shaped component hands to the link it renders. */
export type LinkSlotProps = Omit<ComponentPropsWithoutRef<"a">, "className" | "children"> & {
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
  const theirs = (render.props as { className?: unknown }).className;
  const merged =
    typeof theirs === "function"
      ? (state: unknown) => joinClasses(className, (theirs as (s: unknown) => string | undefined)(state))
      : joinClasses(className, typeof theirs === "string" ? theirs : undefined);

  return cloneElement(render as ReactElement<Record<string, unknown>>, {
    ...defined(rest),
    className: merged,
    "aria-current": current,
    children,
  });
}
