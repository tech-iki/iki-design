import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";

import { choiceGroupClass, choiceInputClass, choiceLabelClass, choiceLegendClass } from "../ui-classes.js";
import { fieldErrorClass, fieldHintClass } from "./field.js";

/** What a checkbox or radio takes: the input's own props, less what the component decides. */
type ChoiceProps = {
  /** The words beside the box, inside the label: the control's accessible name. */
  label: ReactNode;
  /** Appended to the label row's class string, for layout. */
  className?: string;
} & Omit<ComponentPropsWithoutRef<"input">, "type" | "className" | "children">;

function Choice({ type, label, className, ...rest }: ChoiceProps & { type: "checkbox" | "radio" }) {
  return (
    <label className={className ? `${choiceLabelClass} ${className}` : choiceLabelClass}>
      <input {...rest} type={type} className={choiceInputClass} />
      {label}
    </label>
  );
}

/**
 * A native checkbox, styled (§8 "Checkbox and radio"; plan of 20 October
 * 2026, phase 2; twelve in Work OS, four in Digital Library). Not Base UI:
 * the browser's own control already has the keyboard, the form value, the
 * indeterminate state and forced-colours support, and a styled native keeps
 * the component server-safe.
 *
 * A `<label>` wraps the input and its `label` text, so the whole row is the
 * click target and the text is the name — `Field`'s rule. The checked fill is
 * `teal-deep` through `accent-color`; the row keeps the 44px floor below
 * `md`; a `disabled` input mutes the row. The input is the control, so the
 * rest of the props — `name`, `value`, `checked`, `onChange`, `disabled`,
 * `aria-*` — reach the `<input>`, and `className` reaches the row.
 */
export function Checkbox(props: ChoiceProps) {
  return <Choice {...props} type="checkbox" />;
}

/**
 * A native radio, styled exactly as `Checkbox` is, for use inside a
 * `RadioGroup`, which gives it its `name` when it has none.
 */
export function Radio(props: ChoiceProps) {
  return <Choice {...props} type="radio" />;
}

/**
 * Give `name` to every `Radio` in the tree that has none, through any layout
 * elements around it: a radio left without its group's name leaves the group
 * silently — two can be checked, the arrow keys stop moving between them, and
 * the form submits nothing. Context would be simpler, but a Server Component
 * cannot read it, and the group must stay server-safe.
 */
function withName(children: ReactNode, name: string): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement<{ children?: ReactNode; name?: string }>(child)) return child;
    if (child.type === Radio) return child.props.name === undefined ? cloneElement(child, { name }) : child;
    if (child.props.children === undefined) return child;
    return cloneElement(child, { children: withName(child.props.children, name) });
  });
}

/**
 * A set of radios under one name (§8 "Checkbox and radio"; seven in Work OS).
 * A `<fieldset>` with a `<legend>`, so the question is read on entering the
 * group and the browser's arrow keys move between its radios. `name` is given
 * to every `Radio` inside it that has none of its own, however deep in layout
 * elements (not through another component's own render); `disabled` on the
 * fieldset disables every radio in it, natively. A `hint` and an `error` sit
 * under the radios as `Field`'s do, joined to the fieldset by
 * `aria-describedby`, the error `role="alert"`. `...rest` reaches the
 * fieldset.
 */
export function RadioGroup({
  legend,
  name,
  hint,
  error,
  className,
  children,
  ...rest
}: {
  /** The question the radios answer, as the fieldset's `<legend>`. */
  legend: ReactNode;
  name?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"fieldset">, "children" | "name">) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [rest["aria-describedby"], errorId, hintId].filter(Boolean).join(" ") || undefined;
  const radios = name ? withName(children, name) : children;

  return (
    <fieldset
      {...rest}
      aria-describedby={describedBy}
      className={className ? `${choiceGroupClass} ${className}` : choiceGroupClass}
    >
      <legend className={choiceLegendClass}>{legend}</legend>
      {radios}
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
    </fieldset>
  );
}
