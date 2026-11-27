import type { ComponentProps, ReactNode } from "react";

import { skipLinkClass } from "../ui-classes.js";

/**
 * The id `PageMain` gives its `<main>`, and the one `SkipLink` targets by
 * default: one constant, so the two cannot drift apart.
 */
export const MAIN_CONTENT_ID = "main-content";

/**
 * The skip link (§7, §10 2.4.1; #19, #23). Put it first in `<body>`, before
 * the rail, so it is the first thing Tab reaches; it stays `sr-only` until
 * focused, then shows at the top left over everything.
 *
 * It jumps to `PageMain`'s `<main id="main-content" tabIndex={-1}>`, which is
 * focusable so the jump moves the caret as well as the scroll. A plain
 * `<a href="#…">` on purpose, never the router's link: a fragment is not a
 * route, and both Next and React Router leave a plain anchor to the browser.
 * `targetId` is for a page whose main landmark is not `PageMain`; `...rest`,
 * `ref` included, reaches the anchor.
 */
export function SkipLink({
  targetId = MAIN_CONTENT_ID,
  className,
  children = "Skip to content",
  ...rest
}: {
  targetId?: string;
  children?: ReactNode;
} & Omit<ComponentProps<"a">, "href">) {
  return (
    <a {...rest} href={`#${targetId}`} className={className ? `${skipLinkClass} ${className}` : skipLinkClass}>
      {children}
    </a>
  );
}
