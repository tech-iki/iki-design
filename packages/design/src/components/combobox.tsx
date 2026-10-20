"use client";

import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import {
  comboboxEmptyClass,
  comboboxOptionClass,
  comboboxPopupClass,
  comboboxTickClass,
  fieldClass,
  smallFieldClass,
} from "../ui-classes.js";
import { Icon } from "./icon.js";

/** One choice: what is stored, what is read, and whether it can be chosen now. */
export type ComboboxOption = { value: string; label: string; disabled?: boolean };

const toLabel = (option: ComboboxOption) => option.label;
const key = (option: ComboboxOption) => option.value;
const same = (a: ComboboxOption, b: ComboboxOption) => a.value === b.value;

/**
 * A text input that filters a list of options as you type (§8 "Combobox";
 * plan of 20 October 2026, phase 2; the grid cell chooser, Work OS's
 * `ChoicePopover` in `editable-cell.tsx`). Built on Base UI's Combobox
 * (ADR 0002), which owns the APG pattern the hand-rolled one wrote out: focus
 * stays in the `role="combobox"` input, the `role="listbox"` below it is
 * portalled and positioned under the input and flipped when there is no room,
 * and the highlight moves by `aria-activedescendant`.
 *
 * - **Typing filters**, a case- and accent-insensitive "contains" on the
 *   label, as `filterOptions` did; the first match is highlighted, so typing
 *   and Enter is a choice. "No matches." is said when nothing is left, in a
 *   `role="status"` line.
 * - **Arrow keys move the highlight**, Enter chooses it and closes, a press on
 *   an option chooses it. The chosen option carries a tick and
 *   `aria-selected`.
 * - **Escape closes the innermost layer.** Inside a `Drawer` or `Popover` it
 *   closes the list and nothing else. `onEscape` is the veto `Drawer` has, for
 *   a layer Base UI does not know about (Work OS's dismiss stack during the
 *   #443 migration): return `false` and the list stays open, the key
 *   consumed. **An Escape on a closed list clears nothing**: Base UI would
 *   clear the chosen value and the text, which in a drawer reads as data
 *   lost; the wrapper refuses both and the key goes on to the next layer. To
 *   offer "none", the caller adds it as an option.
 *
 * **Forms keep the native `<select>`** (plan §4.3): 58 of them work, meet the
 * touch floor through `fieldClass`, and get the platform's own picker on a
 * phone. This is for the grid's cell chooser and for lists long enough that
 * typing beats scrolling — not a replacement for `select`.
 *
 * The value is the option's `value` string, or `null` for none; `name`
 * submits it with a form. The input is the control, so the rest of the props
 * reach the `<input>`, `className` is appended to its field class, and
 * `size="small"` takes `smallFieldClass`, as `Field` does — a `Field` can
 * wrap it and its label names it. Without a `Field`, pass `label`.
 */
export function Combobox({
  options,
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  onEscape,
  label,
  emptyText = "No matches.",
  size = "default",
  disabled,
  required,
  name,
  popupClassName,
  className,
  ...rest
}: {
  options: readonly ComboboxOption[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Return `false` to keep the list open on Escape; the key is then consumed. */
  onEscape?: (event: KeyboardEvent) => boolean | void;
  /** The input's accessible name, when no `Field` label wraps it. */
  label?: string;
  /** Said when the typing matches nothing. */
  emptyText?: ReactNode;
  size?: "default" | "small";
  disabled?: boolean;
  required?: boolean;
  /** The form field the chosen value is submitted under. */
  name?: string;
  /** Appended to the list's own class string. */
  popupClassName?: string;
  /** Appended to the input's field class. */
  className?: string;
} & Omit<
  ComponentPropsWithoutRef<"input">,
  "value" | "defaultValue" | "onChange" | "size" | "className" | "disabled" | "required" | "name" | "children"
>) {
  const find = (v: string | null | undefined) =>
    v === undefined ? undefined : v === null ? null : (options.find((o) => o.value === v) ?? null);
  const base = size === "small" ? smallFieldClass : fieldClass;

  return (
    <BaseCombobox.Root<ComboboxOption>
      items={options as ComboboxOption[]}
      value={find(value)}
      defaultValue={find(defaultValue)}
      onValueChange={(next, details) => {
        // Escape on a closed list would clear the value; keep it.
        if (details.reason === "escape-key") {
          details.cancel();
          return;
        }
        onValueChange?.(next ? next.value : null);
      }}
      onInputValueChange={(_text, details) => {
        // …and the typed text with it.
        if (details.reason === "escape-key") details.cancel();
      }}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next, details) => {
        if (!next && details.reason === "escape-key" && onEscape?.(details.event) === false) {
          details.cancel();
          return;
        }
        onOpenChange?.(next);
      }}
      itemToStringLabel={toLabel}
      itemToStringValue={key}
      isItemEqualToValue={same}
      autoHighlight
      disabled={disabled}
      required={required}
      name={name}
    >
      <BaseCombobox.Input
        {...rest}
        aria-label={label ?? rest["aria-label"]}
        className={className ? `${base} ${className}` : base}
      />
      <BaseCombobox.Portal>
        <BaseCombobox.Positioner side="bottom" align="start" sideOffset={4} collisionPadding={16} className="z-50">
          <BaseCombobox.Popup className={popupClassName ? `${comboboxPopupClass} ${popupClassName}` : comboboxPopupClass}>
            <BaseCombobox.Empty className={comboboxEmptyClass}>{emptyText}</BaseCombobox.Empty>
            <BaseCombobox.List>
              {(option: ComboboxOption) => (
                <BaseCombobox.Item key={option.value} value={option} disabled={option.disabled} className={comboboxOptionClass}>
                  {option.label}
                  <BaseCombobox.ItemIndicator className={comboboxTickClass}>
                    <Icon name="check" />
                  </BaseCombobox.ItemIndicator>
                </BaseCombobox.Item>
              )}
            </BaseCombobox.List>
          </BaseCombobox.Popup>
        </BaseCombobox.Positioner>
      </BaseCombobox.Portal>
    </BaseCombobox.Root>
  );
}
