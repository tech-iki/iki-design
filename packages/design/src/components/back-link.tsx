import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";

import type { IconName } from "../icons.generated.js";
import { joinClasses, renderLink, type LinkRender } from "../link-render.js";
import { backLinkClass } from "../ui-classes.js";
import { Icon } from "./icon.js";

/** Where a `BackLink` goes: an `href` for a plain `<a>`, or a `render` with the app's router link. */
type BackLinkTarget = { href: string; render?: undefined } | { href?: string; render: LinkRender };

/**
 * The way back up: "Back to submissions" (§8; #22). A leading arrow, which is
 * decorative (`aria-hidden`), and the destination in the words, so a screen
 * reader hears where the link goes and not just "Back". 44px tall below `md`;
 * the label is underlined and the arrow is not.
 *
 * `children` is the whole label and should name the place: "Back to library".
 * `icon` is an `IconName` (the left arrow, `previous`, by default) or an
 * element of the app's own. Give `href` for a plain `<a>`, or `render` for the
 * router's link (`link-render.ts`): `render={<Link to="/library" />}` in React
 * Router, `render={<Link href="/library" />}` in Next. `...rest` reaches the
 * link. Server-safe.
 */
export function BackLink({
  href,
  render,
  icon = "previous",
  className,
  children,
  ...rest
}: BackLinkTarget & {
  icon?: IconName | ReactElement;
  /** The label, naming the destination. */
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"a">, "href" | "children">) {
  return renderLink(
    {
      ...rest,
      href,
      className: joinClasses(backLinkClass, className),
      children: (
        <>
          <span aria-hidden="true" className="flex shrink-0">
            {typeof icon === "string" ? <Icon name={icon} /> : icon}
          </span>
          <span className="underline">{children}</span>
        </>
      ),
    },
    render,
  );
}
