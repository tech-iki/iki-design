import Link from "next/link";
import { focusRingOnNavy } from "@tech-iki/design";

/**
 * The site's navigation, drawn the way the system draws a rail: navy
 * furniture, white text at fixed alphas, weight and a left bar for the active
 * item rather than colour alone (Work OS §7). It is a plain list of links —
 * the active state is left to the browser's :target-free simplicity of a
 * server component, so there is no client JavaScript in the shell.
 */
export const SECTIONS: { href: string; label: string; blurb: string }[] = [
  { href: "/", label: "Overview", blurb: "What the system is and how to install it" },
  { href: "/colour", label: "Colour", blurb: "Twenty-five tokens and every contrast pair" },
  { href: "/tones", label: "Pills", blurb: "The nine status tones" },
  { href: "/type", label: "Type", blurb: "Geist, two faces, the scale in use" },
  { href: "/controls", label: "Controls", blurb: "Buttons, fields, links, tiles" },
  { href: "/components", label: "Components", blurb: "Button, Field, Notice, EmptyState, KpiTile" },
  { href: "/icons", label: "Icons", blurb: "Every name at its one size" },
  { href: "/layout", label: "Layout", blurb: "Spacing, radius, elevation, layering" },
  { href: "/adopt", label: "Adopt", blurb: "Tailwind, plain CSS, components" },
  { href: "/decisions", label: "Decisions", blurb: "What is open, what was reversed" },
];

export function SiteNav() {
  return (
    <aside className="sticky top-0 flex h-screen w-14 shrink-0 flex-col bg-navy lg:w-56 print:hidden">
      <div className="flex items-center gap-2 px-3 py-4">
        <span
          aria-hidden="true"
          className="grid size-7 shrink-0 place-items-center rounded-full bg-paper/12 font-mono text-xs font-semibold text-paper"
        >
          iki
        </span>
        <span className="max-lg:sr-only text-sm font-semibold text-paper">IKI design</span>
      </div>
      <nav aria-label="Sections" className="flex flex-col gap-1 px-2">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            title={s.blurb}
            className={`flex min-h-11 items-center justify-center rounded-md px-0 py-2 text-sm font-medium text-paper/75 hover:bg-paper/10 hover:text-paper md:min-h-0 lg:justify-start lg:px-3 ${focusRingOnNavy}`}
          >
            <span className="max-lg:sr-only">{s.label}</span>
            <span aria-hidden="true" className="font-mono text-xs lg:hidden">
              {s.label.slice(0, 2)}
            </span>
          </Link>
        ))}
      </nav>
      <p className="mt-auto px-3 py-4 text-[11px] uppercase tracking-wider text-paper/50 max-lg:sr-only">
        @tech-iki/design
      </p>
    </aside>
  );
}
