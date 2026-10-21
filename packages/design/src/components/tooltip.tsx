"use client";

import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { cloneElement, type ComponentPropsWithoutRef, type ReactElement, type ReactNode } from "react";

import { tooltipClass } from "../ui-classes.js";

/**
 * A hint on hover and on keyboard focus (§8 "Tooltip"; plan of 20 October
 * 2026, phase 2; Work OS's 29 native `title=` hints, 12 on icon-only buttons).
 * Built on Base UI's Tooltip (ADR 0002).
 *
 * **A supplement, never the name** (§2 principle 9). The child is the
 * trigger — usually an icon `Button` — and keeps its `sr-only` label, which
 * is its accessible name; the tooltip shows the same words to a sighted
 * pointer or keyboard user. So the popup is `role="tooltip"` and is **not**
 * wired to the trigger with `aria-describedby`: a description identical to the
 * name would be read twice (§10). Base UI wires nothing either.
 *
 * It opens after a hover delay (600ms, Base UI's default; `delay` changes
 * it), and at once on keyboard focus (`:focus-visible` only, so a click does
 * not leave it hanging); Escape, a press on the trigger, moving away and
 * blurring close it. No animation: it appears and disappears in one frame.
 *
 * **The child's `title` is removed.** A native tooltip beside this one would
 * show the hint twice, and the browser's has no keyboard route. **Touch gets
 * no tooltip**: Base UI opens on mouse and pen hover only, by design, because
 * a long press is the browser's context menu and there is no touch gesture
 * that reveals a hint before the tap acts. A touch user therefore relies on
 * the icon and the screen reader on the `sr-only` name — which is why a
 * confirm step stays in words (§8 Buttons), and why a hint a person needs to
 * act belongs in visible text, not here.
 *
 * **A disabled trigger shows nothing**: a disabled `<button>` fires no pointer
 * or focus events. Say why a control is unavailable in visible text.
 *
 * `...rest` reaches the popup. `side` defaults to `top`.
 */
export function Tooltip({
  content,
  side = "top",
  delay,
  disabled,
  className,
  children,
  ...rest
}: {
  /** The hint: the same words as the trigger's `sr-only` name, or a short gloss on it. */
  content: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  /** Milliseconds of hover before it opens; keyboard focus opens it at once. */
  delay?: number;
  disabled?: boolean;
  /** The trigger: one element that takes a ref and focus, usually a `Button`. */
  children: ReactElement<{ title?: string }>;
  /** Appended to the popup's own class string. */
  className?: string;
} & Omit<ComponentPropsWithoutRef<"div">, "children" | "className" | "content">) {
  return (
    <BaseTooltip.Root disabled={disabled}>
      <BaseTooltip.Trigger delay={delay} render={cloneElement(children, { title: undefined })} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner side={side} sideOffset={6} collisionPadding={8} className="z-50">
          <BaseTooltip.Popup
            {...rest}
            role="tooltip"
            className={className ? `${tooltipClass} ${className}` : tooltipClass}
          >
            {content}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}
