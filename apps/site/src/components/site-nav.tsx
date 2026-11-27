import { NavGroup, Rail, RailBrand } from "@tech-iki/design";
import { SiteNavLink } from "@/components/site-nav-link";

/**
 * The site's navigation, drawn with the package's own rail (#19, #23): navy
 * furniture, white text at fixed alphas, and weight, the tint and a left bar
 * on the current page as well as `aria-current="page"` (§7). This file is a
 * Server Component; only `SiteNavLink`, which reads the pathname, is a client
 * one.
 */
export const SECTIONS: { href: string; label: string; blurb: string }[] = [
  { href: "/", label: "Overview", blurb: "What the system is and how to install it" },
  { href: "/colour", label: "Colour", blurb: "Twenty-five tokens and every contrast pair" },
  { href: "/tones", label: "Pills", blurb: "The nine status tones" },
  { href: "/type", label: "Type", blurb: "Geist, two faces, the scale in use" },
  { href: "/controls", label: "Controls", blurb: "Buttons, fields, links, tiles" },
  { href: "/components", label: "Components", blurb: "Button, Field, Notice, EmptyState, the rail, KpiTile" },
  { href: "/icons", label: "Icons", blurb: "Every name at its one size" },
  { href: "/layout", label: "Layout", blurb: "Spacing, radius, elevation, layering" },
  { href: "/adopt", label: "Adopt", blurb: "Tailwind, plain CSS, components" },
  { href: "/decisions", label: "Decisions", blurb: "What is open, what was reversed" },
];

/** The site's mark: the initials in a paper/12 disc, decorative beside the name. */
const MARK = (
  <span className="grid size-7 place-items-center rounded-full bg-paper/12 font-mono text-xs font-semibold text-paper">
    iki
  </span>
);

export function SiteNav() {
  return (
    <Rail brand={<RailBrand name="IKI design" mark={MARK} />}>
      <NavGroup heading="Sections">
        {SECTIONS.map((s) => (
          <SiteNavLink key={s.href} href={s.href} label={s.label} blurb={s.blurb} />
        ))}
      </NavGroup>
    </Rail>
  );
}
