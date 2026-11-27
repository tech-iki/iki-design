"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavLink, isActivePath } from "@tech-iki/design";

/**
 * One rail link that knows whether it is the current page (#23).
 *
 * A layout cannot read the pathname in Next (`usePathname` is a client hook,
 * by design, so layout state survives navigation), and the rail lives in the
 * layout. So this one small part is a client component: it reads the
 * pathname, asks the package's `isActivePath`, and hands the answer to the
 * package's server-safe `NavLink` as `current`, with Next's `Link` through
 * `render` so a click is a client navigation, not a page load. The rail
 * around it, `SiteNav`, stays a Server Component. Every route here is static,
 * so the pathname resolves during prerendering and the current link is in
 * the HTML (next/dist/docs, `usePathname`, "Cache Components").
 *
 * The alternative #23 names, each page passing its own `href`, would move the
 * rail out of the layout and into ten pages.
 */
export function SiteNavLink({ href, label, blurb }: { href: string; label: string; blurb: string }) {
  const pathname = usePathname();
  return (
    <NavLink
      render={<Link href={href} />}
      current={isActivePath(pathname, href)}
      title={blurb}
      // The site's sections have no glyphs in the vocabulary: a two-letter
      // stub stands in on the narrow rail, as it did before.
      icon={
        <span className="font-mono text-xs lg:hidden lg:group-data-collapsed/rail:inline">
          {label.slice(0, 2)}
        </span>
      }
    >
      {label}
    </NavLink>
  );
}
