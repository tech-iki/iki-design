"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useRef, type ComponentPropsWithoutRef, type ReactNode } from "react";

import {
  drawerBodyClass,
  drawerFooterClass,
  drawerHeaderClass,
  drawerPanelClass,
  drawerRefusalClass,
  drawerScrimClass,
  iconButtonClass,
} from "../ui-classes.js";
import { Icon } from "./icon.js";

/**
 * Why a close was asked for. `escape` is the key, `scrim` a press outside the
 * panel, `close` the header's Close button (or any element the caller marks
 * as one), and `programmatic` anything else — a nested layer closing, an
 * action calling `close()`. Work OS's dismiss stack reads this during the
 * #443 migration to decide whether an Escape was its drawer's to take.
 */
export type DrawerCloseReason = "escape" | "scrim" | "close" | "programmatic";

/** Base UI's reason strings → the four this package speaks. */
function closeReason(reason: Dialog.Root.ChangeEventReason): DrawerCloseReason {
  switch (reason) {
    case "escape-key":
      return "escape";
    case "outside-press":
      return "scrim";
    case "close-press":
      return "close";
    default:
      return "programmatic";
  }
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The record drawer (§8 "Drawer and popover"; plan of 20 October 2026,
 * phase 1; Work OS's seven `Drawer` sites, its `focus-trap.ts`,
 * `dismiss-stack.ts` and `trapTab`). A side panel 30rem wide with a left
 * border at `lg`, a full-screen sheet below, over a `bg-navy/25` scrim.
 *
 * Built on Base UI's Dialog (ADR 0002), which owns what the hand-rolled one
 * had to: the portal to `<body>`, `role="dialog"` with `aria-modal`, the focus
 * trap, the scroll lock, the page behind made inert, and the return of focus
 * to the opener. The wrapper owns the shape: `title` in the header as the
 * dialog's name, an optional `subtitle`, the Close button, the scrolling body
 * (the children), the `refusal` band (`role="alert"`, the overdue pair) and
 * the `footer`.
 *
 * **Focus opens in the body**, on its first focusable control, not on the
 * header's Close button — the same rule as the original — and only falls back
 * to Base UI's default (the first tabbable in the panel) when the body has
 * none. `initialFocus` overrides it with a ref when the caller knows better.
 *
 * **Open is controlled.** The caller holds `open` and hears every request to
 * close through `onOpenChange(false, reason)`; it closes by setting `open`
 * false, or refuses by leaving it alone — which is how a dirty form keeps its
 * drawer and shows "Discard this task?" in the footer. **Escape belongs to the
 * innermost layer:** a nested `Drawer`, `Popover` or `Menu` takes it first and
 * Base UI never passes it on. `onEscape` is the veto for a layer Base UI does
 * not know about: return `false` and the Escape is cancelled before
 * `onOpenChange` is called, so Work OS's dismiss stack can keep deciding
 * which of its hand-rolled layers an Escape belongs to until the stack is gone.
 */
export function Drawer({
  open,
  onOpenChange,
  onEscape,
  title,
  subtitle,
  refusal,
  footer,
  initialFocus,
  closeLabel = "Close",
  className,
  children,
  ...rest
}: {
  open: boolean;
  onOpenChange: (open: boolean, reason: DrawerCloseReason) => void;
  /** Return `false` to keep the drawer open on Escape; the key is then consumed. */
  onEscape?: (event: KeyboardEvent) => boolean | void;
  title: ReactNode;
  subtitle?: ReactNode;
  /** The refusal band between body and footer, `role="alert"`. */
  refusal?: ReactNode;
  footer?: ReactNode;
  /** Where focus lands on open; by default the body's first focusable control. */
  initialFocus?: React.RefObject<HTMLElement | null>;
  /** The Close button's accessible name. */
  closeLabel?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"div">, "title" | "children" | "className"> & {
    /** Appended to the panel's own class string. */
    className?: string;
  }) {
  const bodyRef = useRef<HTMLDivElement>(null);

  function handleOpenChange(next: boolean, details: Dialog.Root.ChangeEventDetails) {
    if (next) {
      onOpenChange(true, "programmatic");
      return;
    }
    if (details.reason === "escape-key" && onEscape?.(details.event) === false) {
      details.cancel();
      return;
    }
    onOpenChange(false, closeReason(details.reason));
  }

  function chooseInitialFocus(): boolean | HTMLElement | null {
    if (initialFocus) return initialFocus.current;
    const first = bodyRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    return first ?? true;
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className={drawerScrimClass} />
        <Dialog.Popup
          {...rest}
          aria-modal="true"
          initialFocus={chooseInitialFocus}
          className={className ? `${drawerPanelClass} ${className}` : drawerPanelClass}
        >
          <div className={drawerHeaderClass}>
            <div className="min-w-0 flex-1">
              <Dialog.Title render={<h2 />} className="text-sm font-semibold text-ink">
                {title}
              </Dialog.Title>
              {subtitle ? (
                <Dialog.Description render={<p />} className="text-xs text-ink-muted">
                  {subtitle}
                </Dialog.Description>
              ) : null}
            </div>
            <Dialog.Close className={iconButtonClass} title={closeLabel}>
              <Icon name="close" />
              <span className="sr-only">{closeLabel}</span>
            </Dialog.Close>
          </div>
          <div ref={bodyRef} className={drawerBodyClass}>
            {children}
          </div>
          {refusal ? (
            <p role="alert" className={drawerRefusalClass}>
              {refusal}
            </p>
          ) : null}
          {footer ? <div className={drawerFooterClass}>{footer}</div> : null}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
