import type { ComponentPropsWithoutRef, ReactNode } from "react";

/** The boxed frame §8 gives an empty state that replaces a whole page's content. */
export const emptyStateClass =
  "flex flex-col items-start gap-3 rounded-md border border-grid bg-paper p-5";

/** The sentence inside it: muted, because nothing is wrong. */
export const emptyStateTextClass = "text-sm text-ink-muted";

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
 */
export function EmptyState({
  action,
  className,
  children,
  ...rest
}: {
  action?: ReactNode;
  children: ReactNode;
} & ComponentPropsWithoutRef<"div">) {
  return (
    <div className={className ? `${emptyStateClass} ${className}` : emptyStateClass} {...rest}>
      <p className={emptyStateTextClass}>{children}</p>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
