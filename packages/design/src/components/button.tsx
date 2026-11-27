import type { ComponentPropsWithRef, ReactNode } from "react";

import {
  destructiveButtonClass,
  iconButtonClass,
  primaryButtonClass,
  subtleButtonClass,
  warnButtonClass,
  warnIconButtonClass,
} from "../ui-classes.js";

/**
 * The button treatments §8 names, each the class string of the same name.
 * `warn` is for an action that can be undone; `destructive` is for one that
 * cannot (reject, withdraw, delete).
 */
export type ButtonVariant =
  | "primary"
  | "subtle"
  | "warn"
  | "destructive"
  | "icon"
  | "warnIcon";

const VARIANT_CLASS: Readonly<Record<ButtonVariant, string>> = {
  primary: primaryButtonClass,
  subtle: subtleButtonClass,
  warn: warnButtonClass,
  destructive: destructiveButtonClass,
  icon: iconButtonClass,
  warnIcon: warnIconButtonClass,
};

/**
 * The verb in progress: "Save" → "Save…", "Sign in" → "Signing in…" is the
 * caller's to spell, but the ellipsis form is the one §8 asks for, so a plain
 * verb gets it for free. A trailing full stop is dropped first so "Save."
 * does not become "Save.…". A label that already ends in an ellipsis, the
 * single character or three full stops, is left as it is: "Save…" does not
 * become "Save……" (#35).
 */
function pendingForm(children: ReactNode): ReactNode {
  if (typeof children !== "string") return children;
  if (/(…|\.\.\.)$/.test(children)) return children;
  return `${children.replace(/\.$/, "")}…`;
}

/**
 * A button on one of the six class strings (plan of 20 October 2026, phase 0).
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
 * and the rest of `<button>` work as they would on the element itself, and
 * so does `ref` (a plain prop in React 19), so a caller can move focus to the
 * button without a cast (#35). `pendingLabel` is rendered exactly as given:
 * the component adds no ellipsis to it, so a caller that wants one writes it.
 *
 * A link drawn as a button is not a `Button`: it is an `<a>`, and has its own
 * strings, `primaryLinkButtonClass` and `subtleLinkButtonClass` (#36).
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
} & ComponentPropsWithRef<"button">) {
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
