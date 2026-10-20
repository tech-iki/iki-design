import type { ComponentPropsWithoutRef } from "react";

/**
 * The page heading (Work OS #58, F24.2).
 *
 * This used to be a navy band with a light description strip, mirroring rows
 * 1–2 of every workbook sheet (ADR 0003). ADR 0006 demotes navy to the app
 * shell: with a navy sidebar already framing the page, a second navy field on
 * every screen competed with the status colours in the data. The heading is
 * now plain type, and the description the muted line beneath it. `...rest`
 * reaches the header element.
 */
export function PageTitle({
  title,
  description,
  className,
  ...rest
}: {
  title: string;
  description?: string;
} & ComponentPropsWithoutRef<"header">) {
  return (
    <header className={className ? `mb-5 ${className}` : "mb-5"} {...rest}>
      <h1 className="text-xl font-semibold tracking-tight text-ink">{title}</h1>
      {description ? (
        <p className="mt-1 max-w-3xl text-sm text-ink-muted">{description}</p>
      ) : null}
    </header>
  );
}
