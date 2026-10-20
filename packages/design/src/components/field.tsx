import {
  Children,
  Fragment,
  cloneElement,
  isValidElement,
  useId,
  type AriaAttributes,
  type ComponentPropsWithoutRef,
  type ReactElement,
} from "react";

import { fieldClass, labelClass, smallFieldClass } from "../ui-classes.js";

/** The props `Field` sets on the control it wraps. */
type ControlProps = {
  id?: string;
  className?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: AriaAttributes["aria-invalid"];
};

/** The frame: the label, then the lines under it, `gap-1` apart as §8 asks. */
export const fieldFrameClass = "flex flex-col gap-1";

/** The classes of a hint line under a field. */
export const fieldHintClass = "text-xs text-ink-muted";

/** The classes of the error line under a field: `role="alert"` text in the overdue red. */
export const fieldErrorClass = "text-xs text-health-overdue-fg";

/** What `invalidFieldClass` adds to `fieldClass`; added to the small field the same way. */
const INVALID = "border-health-overdue-fg bg-health-overdue-bg";

/**
 * A label, its control, and the two lines that may sit under it (plan of
 * 20 October 2026, phase 0; 189 hand-written sites, three copies of the
 * invalid-marking helper).
 *
 * The label wraps the control, so the click target includes the label and no
 * `htmlFor` is needed (§8). The hint and the error sit **outside** the label,
 * as its siblings in the frame: a label's accessible name is every word
 * inside it, so a hint inside the label would be read as the field's name and
 * then again as its description. The control is the one child, and `Field`
 * gives it what the hand-written sites kept forgetting: an `id`;
 * `aria-describedby` pointing at the error and the hint so both are read with
 * the field; `aria-invalid` and the invalid border and fill when there is an
 * error, so the refused field is drawn to be found by scrolling (Work OS
 * #161). The error is `role="alert"`, so it is announced when it appears.
 *
 * `size` picks `fieldClass` or `smallFieldClass`; a `className` the child
 * brought is appended for layout (`w-24`), never swapped in for the base. A
 * disabled control needs nothing from here: `fieldClass` carries its own
 * `disabled:` state, so `<input disabled />` draws itself muted.
 *
 * `useId` is the one hook in the package. It is allowed in Server Components
 * — it is how React makes an id that matches between server and client — so
 * the component stays server-safe and carries no client directive.
 */
export function Field({
  label,
  hint,
  error,
  size = "default",
  className,
  children,
  ...rest
}: {
  label: string;
  hint?: string;
  error?: string;
  size?: "default" | "small";
  children: ReactElement<ControlProps>;
} & Omit<ComponentPropsWithoutRef<"div">, "children">) {
  const generated = useId();
  const control = Children.only(children);
  if (!isValidElement<ControlProps>(control) || control.type === Fragment) {
    throw new Error("Field takes exactly one control element as its child, not a fragment");
  }
  // A child that brought its own id keeps it, and the lines under it are named from it.
  const id = control.props.id ?? generated;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [control.props["aria-describedby"], errorId, hintId].filter(Boolean).join(" ") || undefined;
  const base = size === "small" ? smallFieldClass : fieldClass;
  const controlClass = [base, error ? INVALID : "", control.props.className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div {...rest} className={className ? `${fieldFrameClass} ${className}` : fieldFrameClass}>
      <label className={labelClass}>
        {label}
        {cloneElement(control, {
          id,
          className: controlClass,
          "aria-describedby": describedBy,
          "aria-invalid": error ? true : control.props["aria-invalid"],
        })}
      </label>
      {error ? (
        <span id={errorId} role="alert" className={fieldErrorClass}>
          {error}
        </span>
      ) : null}
      {hint ? (
        <span id={hintId} className={fieldHintClass}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}
