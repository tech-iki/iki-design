import type { ComponentPropsWithoutRef, ReactNode } from "react";

/** The boxed frame §8 gives an empty state that replaces a whole page's content. */
export const emptyStateClass =
  "flex flex-col items-start gap-3 rounded-md border border-grid bg-paper p-5";

/** The sentence inside it: muted, because nothing is wrong. */
export const emptyStateTextClass = "text-sm text-ink-muted";

/**
 * The optional title above the sentence: ink, not muted, and semibold so it
 * reads as the headline of the box.
 */
export const emptyStateTitleClass = "text-sm font-semibold text-ink";

/**
 * Nothing here, said in a sentence (plan of 20 October 2026, phase 0; about
 * 26 hand-written sites).
 *
 * §8: a load is a sentence in `text-ink-muted` and so is an empty section —
 * no illustration, no skeleton, no spinner. The sentence is the children; the
 * optional `action` is the one thing the reader can do about it, usually a
 * `<Button>`, and sits beneath the sentence rather than inside it so the
 * sentence stays a sentence. Boxed, as §8 draws the empty state that stands
 * in for a page; a section that is merely empty prints its "none" line in
 * plain `text-ink-muted` and does not need a component.
 *
 * `title` is an optional short headline ("No resources found") above the
 * sentence. It is a `<div>`, not a heading: the component cannot know what level
 * the page is at, and a wrong `<h2>` breaks the outline for a screen reader.
 * A `<div>` rather than a `<p>` so a caller who does want a heading can pass
 * `<h3>` as the title and stay valid. Without it the markup is exactly what it
 * was before the prop existed. Note that it
 * takes the name of the HTML `title` attribute, so it no longer reaches the
 * root as a tooltip.
 */
export function EmptyState({
  action,
  className,
  children,
  title,
  ...rest
}: {
  action?: ReactNode;
  children: ReactNode;
  title?: ReactNode;
} & Omit<ComponentPropsWithoutRef<"div">, "title">) {
  return (
    <div className={className ? `${emptyStateClass} ${className}` : emptyStateClass} {...rest}>
      {title ? <div className={emptyStateTitleClass}>{title}</div> : null}
      <p className={emptyStateTextClass}>{children}</p>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
