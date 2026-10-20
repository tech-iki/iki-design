"use client";

import { Popover as BasePopover } from "@base-ui/react/popover";
import { useRef, type ComponentPropsWithoutRef, type ReactNode } from "react";

import {
  popoverBadgeClass,
  popoverOptionClass,
  popoverPanelClass,
  popoverTriggerActiveClass,
  popoverTriggerClass,
} from "../ui-classes.js";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * A toolbar popover (§8 "Drawer and popover"; plan of 20 October 2026, phase
 * 1; Work OS's `Panel`, fifteen sites, and `panel-placement.ts`). A trigger on
 * `subtleButtonClass` that never wraps, with an optional count `badge` inside
 * it so the count is part of the accessible name ("Filters 2"), and a `w-80`
 * panel at `z-30` below it, portalled to `<body>`.
 *
 * Built on Base UI's Popover (ADR 0002). It owns the positioning — below the
 * trigger, start-aligned, flipped or shifted to stay inside the viewport with
 * a 16px gutter, which is what the hand-rolled clamp arithmetic did for the
 * horizontal axis only — the outside press and the Escape that close it, the
 * `aria-haspopup`/`aria-expanded`/`aria-controls` wiring, and the `data-popup-open`
 * attribute on the trigger while the panel is open. The trigger wears the
 * `active` style then, and also whenever the caller says `active` (a filter
 * that is applied), so the two states look the same: a shape and a weight, not
 * only a colour.
 *
 * Non-modal: the page stays live and scrollable behind it, as a toolbar
 * popover should. Focus moves into the panel on open — its first control,
 * however it was opened, as Work OS's `Panel` did — and returns to the
 * trigger on close. The children are the panel's content, usually
 * `PopoverOption` rows. Open is controlled (`open` + `onOpenChange`) when the
 * toolbar wants its panels mutually exclusive, or uncontrolled from
 * `defaultOpen`.
 */
export function Popover({
  label,
  badge,
  active = false,
  open,
  defaultOpen,
  onOpenChange,
  align = "start",
  triggerProps,
  className,
  children,
  ...rest
}: {
  /** The trigger's label. */
  label: ReactNode;
  /** A count beside the label, inside the button, so it is read with the name. */
  badge?: number | string;
  /** Draw the trigger in its open style while closed: a filter that is applied. */
  active?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Which edge of the trigger the panel lines up with. */
  align?: "start" | "center" | "end";
  /** Reaches the trigger `<button>`: `id`, `title`, `disabled`, `className`. */
  triggerProps?: Omit<ComponentPropsWithoutRef<"button">, "children">;
  /** Appended to the panel's own class string. */
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"div">, "children" | "className">) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { className: triggerClassName, ...triggerRest } = triggerProps ?? {};
  const triggerClass = (state: { open: boolean }) => {
    const base = state.open || active ? `${popoverTriggerClass} ${popoverTriggerActiveClass}` : popoverTriggerClass;
    return triggerClassName ? `${base} ${triggerClassName}` : base;
  };

  return (
    <BasePopover.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange ? (next) => onOpenChange(next) : undefined}
    >
      <BasePopover.Trigger {...triggerRest} className={triggerClass}>
        {label}
        {/* The space keeps the name "Filters 2", not "Filters2", whatever the layout. */}
        {badge !== undefined && badge !== null && badge !== 0 && badge !== "" ? (
          <>
            {" "}
            <span className={popoverBadgeClass}>{badge}</span>
          </>
        ) : null}
      </BasePopover.Trigger>
      <BasePopover.Portal>
        <BasePopover.Positioner side="bottom" align={align} sideOffset={4} collisionPadding={16} className="z-30">
          <BasePopover.Popup
            {...rest}
            ref={panelRef}
            initialFocus={() => panelRef.current?.querySelector<HTMLElement>(FOCUSABLE) ?? true}
            className={className ? `${popoverPanelClass} ${className}` : popoverPanelClass}
          >
            {children}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}

/**
 * One option row inside a panel: a `<label>` on `popoverOptionClass` wrapping
 * a checkbox or radio and its text, so the whole row is the click target and
 * the text is the control's name. `...rest` reaches the label.
 */
export function PopoverOption({
  className,
  children,
  ...rest
}: ComponentPropsWithoutRef<"label">) {
  return (
    <label {...rest} className={className ? `${popoverOptionClass} ${className}` : popoverOptionClass}>
      {children}
    </label>
  );
}
