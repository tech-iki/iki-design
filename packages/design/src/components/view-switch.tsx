import type { ComponentProps, ReactNode } from "react";

import { joinClasses, renderLink, type LinkRender } from "../link-render.js";
import { linkNavCurrentClass, linkNavLinkClass, linkNavListClass } from "../ui-classes.js";

/** One view of a `ViewSwitch`: a key for `current`, where it lives, and its name. */
export type ViewSwitchView = { id: string; href: string; label: ReactNode };

/**
 * Two or three views of the same page, as links (§8; #22): Board and List.
 * Each view is its own URL, so a view is addressable and survives a reload;
 * for panels that switch on one page without leaving it, use `Tabs`.
 *
 * `label` names the `<nav>`; `views` are the links, with the caller's `href`
 * each; `current` is the `id` of the view on show, which gets
 * `aria-current="page"`, weight and a bar (not colour alone) and stays a link,
 * so every view is in the list and exactly one is marked. `render` is the
 * router's link, as `Pagination`'s. `...rest` reaches the `<nav>`.
 * Server-safe.
 */
export function ViewSwitch({
  label,
  views,
  current,
  render,
  ...rest
}: {
  label: string;
  views: readonly ViewSwitchView[];
  current: string;
  render?: LinkRender;
} & Omit<ComponentProps<"nav">, "children" | "aria-label">) {
  return (
    <nav {...rest} aria-label={label}>
      <ul className={linkNavListClass}>
        {views.map((view) => {
          const here = view.id === current;
          return (
            <li key={view.id}>
              {renderLink(
                {
                  href: view.href,
                  "aria-current": here ? "page" : undefined,
                  className: joinClasses(linkNavLinkClass, here && linkNavCurrentClass),
                  children: view.label,
                },
                render,
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
