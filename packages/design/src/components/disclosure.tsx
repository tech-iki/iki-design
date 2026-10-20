"use client";

import { useId, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";

import { disclosureButtonClass, disclosureCollapsedClass } from "../ui-classes.js";
import { Icon } from "./icon.js";

/**
 * A collapsible section whose rows stay on the page (§8 "Disclosure"; plan
 * of 20 October 2026, phase 1; eleven hand-written sites in Work OS).
 *
 * The whole header row is one full-width `<button>` inside the heading, so the
 * heading stays a heading and the click target is the row. Its accessible
 * name carries the count — "Overdue, 50" — because the tiles that used to show
 * it are gone. The blurb beneath is `aria-describedby`, read with the button;
 * the `action` (an "Open in Tasks" link) sits beside the button, outside it,
 * because a link cannot live inside one. Focus stays on the button when it
 * toggles. The chevron is `Icon`'s `chevronRight`, turned a quarter when open,
 * hidden in print.
 *
 * **The rows are in the DOM whether open or shut.** Collapsed rows are hidden
 * by the class `hidden print:block`, never the `hidden` attribute: Tailwind's
 * preflight makes `[hidden]` `display: none !important`, which print cannot
 * override, and the Summary page is a meeting handout that must print every
 * row. That rule is why this component is **not built on Base UI's
 * Collapsible**: its Panel, kept mounted and closed, renders the boolean
 * `hidden` attribute (`useCollapsiblePanel.js`, `hidden = !open && !mounted`,
 * returned in `props`), and with `hiddenUntilFound` it sets
 * `hidden="until-found"` — either way the attribute, not a class, decides the
 * display, and the handout would print empty. A disclosure needs no keyboard
 * machinery beyond a button's own, so the wrapper is the whole component.
 * Checked against `@base-ui/react` 1.9.0 on 21 October 2026 (ADR 0002).
 *
 * Open state is controlled (`open` + `onOpenChange`) or, without `open`,
 * uncontrolled from `defaultOpen`. Work OS keeps its per-session store and
 * passes `open`; every section starts collapsed. A section with nothing in it
 * is not a disclosure: render its heading and an empty line instead.
 */
export function Disclosure({
  title,
  count,
  blurb,
  action,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  heading: Heading = "h2",
  id: idProp,
  className,
  children,
  ...rest
}: {
  title: ReactNode;
  count: number;
  blurb?: ReactNode;
  action?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The heading level the section sits at; `h2` by default. */
  heading?: "h2" | "h3" | "h4";
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"section">, "title">) {
  const generated = useId();
  const id = idProp ?? generated;
  const rowsId = `${id}-rows`;
  const blurbId = `${id}-blurb`;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;

  function toggle() {
    const next = !open;
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  return (
    <section
      {...rest}
      id={id}
      className={className ? `flex flex-col gap-1 ${className}` : "flex flex-col gap-1"}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Heading className="min-w-0 flex-1">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={rowsId}
            aria-describedby={blurb ? blurbId : undefined}
            onClick={toggle}
            className={disclosureButtonClass}
          >
            <Icon
              name="chevronRight"
              className={open ? "shrink-0 rotate-90 text-ink-muted print:hidden" : "shrink-0 text-ink-muted print:hidden"}
            />
            <span className="text-sm font-semibold text-ink">{title}</span>
            <span className="sr-only">, </span>
            <span className="text-xs text-ink-muted tabular-nums">{count}</span>
          </button>
        </Heading>
        {action}
      </div>
      {blurb ? (
        <p id={blurbId} className="text-xs text-ink-muted">
          {blurb}
        </p>
      ) : null}
      <div id={rowsId} className={open ? undefined : disclosureCollapsedClass}>
        {children}
      </div>
    </section>
  );
}
