/**
 * What the overlays treat as a focusable control when choosing where focus
 * lands on open: the one list `Drawer` and `Popover` share, so the two never
 * disagree about a hidden input or a negative tabindex.
 */
export const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** The first focusable control inside `root`, or `null`. */
export function firstFocusable(root: HTMLElement | null | undefined): HTMLElement | null {
  return root?.querySelector<HTMLElement>(FOCUSABLE) ?? null;
}
