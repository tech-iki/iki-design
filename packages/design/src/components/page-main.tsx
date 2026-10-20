import type { ReactNode } from "react";

/**
 * The shared page container (F18). Every (app) page uses this instead of its
 * own centred, capped `<main>`, so content runs the full width of the desktop
 * and tablet viewport with consistent edge padding — like the workbook fills
 * its window.
 *
 * The `readable` variant keeps a comfortable measure for prose (the guide),
 * where a line stretched across 1900px would be unreadable.
 */
export function PageMain({
  children,
  variant = "full",
}: {
  children: ReactNode;
  variant?: "full" | "readable";
}) {
  const className =
    variant === "readable"
      ? "mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-8 lg:px-8"
      : "w-full px-6 py-8 lg:px-8";

  // The skip link in the (app) layout targets this id (Work OS #57, F24.1); `tabIndex`
  // makes the landmark focusable so the jump actually moves the caret.
  return (
    <main id="main-content" tabIndex={-1} className={className}>
      {children}
    </main>
  );
}
