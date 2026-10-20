import type { ReactNode } from "react";

/** `Every pair the system renders` → `every-pair-the-system-renders`, for the heading's id. */
function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * A titled block of a page: an h2 in the system's section-heading style
 * (`text-sm font-semibold text-ink`, plain type, never a chip or a band) over
 * its content. The section is labelled by its heading so it is a landmark
 * region a screen reader can jump to.
 *
 * The heading id is derived from the title, so two sections with the same title
 * on one page would share an id and break `aria-labelledby`. Pass `id` to
 * override the derived one when a title has to repeat or slugs to nothing.
 */
export function Section({
  title,
  id: idOverride,
  children,
}: {
  title: string;
  id?: string;
  children: ReactNode;
}) {
  const id = idOverride ?? slug(title);
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h2 id={id} className="text-sm font-semibold text-ink">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** The h3 eyebrow: `text-xs font-semibold uppercase tracking-wide text-ink-muted`. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
      {children}
    </h3>
  );
}

/** Body copy at the working size, capped at the system's description measure. */
export function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-sm text-ink">{children}</p>;
}

/** A bulleted or numbered list at body size. Spacing is `gap`, never `space-*`. */
export function BulletList({
  items,
  ordered = false,
}: {
  items: ReactNode[];
  ordered?: boolean;
}) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag
      className={`flex max-w-3xl flex-col gap-2 pl-5 text-sm text-ink ${
        ordered ? "list-decimal" : "list-disc"
      }`}
    >
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </Tag>
  );
}
