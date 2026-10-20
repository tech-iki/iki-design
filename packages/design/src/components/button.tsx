import type { ComponentPropsWithoutRef, ReactNode } from "react";

import {
  iconButtonClass,
  primaryButtonClass,
  subtleButtonClass,
  warnButtonClass,
  warnIconButtonClass,
} from "../ui-classes.js";

/** The five button treatments §8 names, each the class string of the same name. */
export type ButtonVariant = "primary" | "subtle" | "warn" | "icon" | "warnIcon";

const VARIANT_CLASS: Readonly<Record<ButtonVariant, string>> = {
  primary: primaryButtonClass,
  subtle: subtleButtonClass,
  warn: warnButtonClass,
  icon: iconButtonClass,
  warnIcon: warnIconButtonClass,
};

/**
 * The verb in progress: "Save" → "Save…", "Sign in" → "Signing in…" is the
 * caller's to spell, but the ellipsis form is the one §8 asks for, so a plain
 * verb gets it for free. A trailing full stop is dropped first so "Save."
 * does not become "Save.…".
 */
function pendingForm(children: ReactNode): ReactNode {
  if (typeof children !== "string") return children;
  return `${children.replace(/\.$/, "")}…`;
}

/**
 * A button on one of the five class strings (plan of 20 October 2026, phase 0).
 *
 * The strings in `ui-classes.ts` stay the library: this component chooses one
 * by `variant` and adds nothing to it, so a consumer that keeps writing
 * `<button className={primaryButtonClass}>` renders the same pixels. What it
 * adds is the two things every one of the 238 hand-written sites had to
 * remember: `type="button"` by default, because a button inside a form submits
 * it otherwise; and the **pending** state — the verb with an ellipsis, the
 * button disabled at 50% opacity, `aria-busy` so a screen reader hears that
 * something is happening (§8, "a refused action costs the click, not the
 * page"). `pendingLabel` names the form when the verb changes shape
 * ("Sign in" → "Signing in…"); without it a string child gains the ellipsis,
 * and a child that is not a string (an icon and a span) is rendered as it is,
 * so such a button should pass `pendingLabel` to say anything at all.
 *
 * The `icon` and `warnIcon` variants are 28px square: the caller puts an
 * `<Icon>` and an `sr-only` span inside and a `title` on the button, as the
 * row actions do. `...rest` reaches the element, so `form`, `name`, `onClick`
 * and the rest of `<button>` work as they would on the element itself.
 */
export function Button({
  variant = "primary",
  pending = false,
  pendingLabel,
  type = "button",
  disabled,
  className,
  children,
  ...rest
}: {
  variant?: ButtonVariant;
  pending?: boolean;
  pendingLabel?: string;
} & ComponentPropsWithoutRef<"button">) {
  const base = VARIANT_CLASS[variant];
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={className ? `${base} ${className}` : base}
    >
      {pending ? (pendingLabel ?? pendingForm(children)) : children}
    </button>
  );
}
