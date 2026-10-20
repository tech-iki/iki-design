"use client";

import { Menu as BaseMenu } from "@base-ui/react/menu";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { menuClass, menuItemClass, menuTriggerClass } from "../ui-classes.js";

/**
 * An APG menu (§8 "Board, card and Move to… menu"; plan of 20 October 2026,
 * phase 1; Work OS's `MovePolicyMenu`): a trigger on `subtleButtonClass` at
 * the card's 11px scale, and a `role="menu"` of `role="menuitem"`s portalled
 * to `<body>` at `z-50`, so a column's scroll container cannot clip it.
 *
 * Built on Base UI's Menu (ADR 0002), which owns the keyboard: arrow keys
 * move a roving highlight and wrap at the ends, Home and End jump, typing a
 * letter jumps to the item that starts with it, Escape closes and returns
 * focus to the trigger, an outside press closes, and choosing an item closes
 * and returns focus to the trigger — which the hand-rolled one did not. The
 * trigger carries `aria-haspopup="menu"`, `aria-expanded` and `aria-controls`.
 * Non-modal: the page behind stays scrollable, as it was.
 *
 * The children are `MenuItem`s. A `MenuItem` with `disabled` stays in the
 * list, muted and announced — the current status keeps its place and its
 * tick — and cannot be chosen.
 */
export function Menu({
  label,
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
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Which edge of the trigger the menu lines up with. */
  align?: "start" | "center" | "end";
  /** Reaches the trigger `<button>`: `id`, `title`, `disabled`, `className`. */
  triggerProps?: Omit<ComponentPropsWithoutRef<"button">, "children">;
  /** Appended to the menu's own class string. */
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"div">, "children" | "className">) {
  const { className: triggerClassName, ...triggerRest } = triggerProps ?? {};
  return (
    <BaseMenu.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange ? (next) => onOpenChange(next) : undefined}
      modal={false}
    >
      <BaseMenu.Trigger
        {...triggerRest}
        className={triggerClassName ? `${menuTriggerClass} ${triggerClassName}` : menuTriggerClass}
      >
        {label}
      </BaseMenu.Trigger>
      <BaseMenu.Portal>
        <BaseMenu.Positioner side="bottom" align={align} sideOffset={4} collisionPadding={16} className="z-50">
          <BaseMenu.Popup {...rest} className={className ? `${menuClass} ${className}` : menuClass}>
            {children}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}

/**
 * One `role="menuitem"`. `onSelect` fires when it is chosen by pointer or
 * keyboard, and the menu closes; `disabled` keeps it in the list, muted, and
 * announced as unavailable. The highlight follows the keyboard as well as the
 * pointer (`data-highlighted`, the ink-on-teal-soft pair).
 */
export function MenuItem({
  onSelect,
  disabled,
  className,
  children,
  ...rest
}: {
  onSelect?: () => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"div">, "onSelect" | "children" | "className">) {
  return (
    <BaseMenu.Item
      {...rest}
      disabled={disabled}
      onClick={onSelect ? () => onSelect() : undefined}
      className={className ? `${menuItemClass} ${className}` : menuItemClass}
    >
      {children}
    </BaseMenu.Item>
  );
}
