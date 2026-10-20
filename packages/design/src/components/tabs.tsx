"use client";

import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { tabClass, tabListClass, tabPanelClass } from "../ui-classes.js";

/**
 * APG tabs (§8 "Tabs"; plan of 20 October 2026, phase 2; Work OS's Edit and
 * Preview tabs in the policy text editor). Built on Base UI's Tabs (ADR 0002),
 * which owns the roles — `tablist`, `tab` with `aria-selected` and
 * `aria-controls`, `tabpanel` named by its tab — and the roving focus: one tab
 * stop for the row, the arrow keys move along it and wrap, Home and End jump.
 *
 * `Tabs` is the root and holds the value: controlled (`value` +
 * `onValueChange`) or uncontrolled from `defaultValue`, which is required
 * because Base UI otherwise selects a numeric `0` that no string tab matches.
 * Inside it go one `TabList` of `Tab`s and a `TabPanel` per tab.
 * `...rest` reaches the root `<div>`.
 */
export function Tabs({
  value,
  defaultValue,
  onValueChange,
  children,
  ...rest
}: {
  children: ReactNode;
  onValueChange?: (value: string) => void;
} & (
  | { value: string; defaultValue?: never }
  | { value?: never; defaultValue: string }
) &
  Omit<ComponentPropsWithoutRef<"div">, "children" | "defaultValue" | "onChange">) {
  return (
    <BaseTabs.Root
      {...rest}
      value={value}
      defaultValue={defaultValue}
      onValueChange={
        onValueChange
          ? (next, details) => {
              // Only a person's choice is news; Base UI's own fallbacks are not.
              if (details.reason === "none") onValueChange(String(next));
            }
          : undefined
      }
    >
      {children}
    </BaseTabs.Root>
  );
}

/**
 * The row of tabs, named by `label` ("Edit or preview").
 *
 * **Activation is automatic by default**: an arrow key moves focus and
 * selects the tab it lands on, which is what Work OS's editor does ("focus
 * follows selection, as tabs do") and what the APG recommends when a panel
 * shows without delay. `activation="manual"` moves focus only, and Enter or
 * Space selects — for a panel that is slow to produce.
 */
export function TabList({
  label,
  activation = "automatic",
  className,
  children,
  ...rest
}: {
  /** The tab row's accessible name. */
  label: string;
  activation?: "automatic" | "manual";
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"div">, "children" | "className">) {
  return (
    <BaseTabs.List
      {...rest}
      aria-label={label}
      activateOnFocus={activation === "automatic"}
      className={className ? `${tabListClass} ${className}` : tabListClass}
    >
      {children}
    </BaseTabs.List>
  );
}

/**
 * One tab, a `<button>`. The selected tab is semibold with a `teal-deep` bar
 * along its foot — weight and a shape, not colour alone. A `disabled` tab
 * stays in the row, muted, announced as unavailable, and cannot be selected.
 */
export function Tab({
  value,
  disabled,
  className,
  children,
  ...rest
}: {
  value: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"button">, "children" | "className" | "value">) {
  return (
    <BaseTabs.Tab
      {...rest}
      value={value}
      disabled={disabled}
      className={className ? `${tabClass} ${className}` : tabClass}
    >
      {children}
    </BaseTabs.Tab>
  );
}

/**
 * The panel for the tab of the same `value`. An inactive panel is not
 * rendered unless `keepMounted`, which keeps it in the DOM under the `hidden`
 * attribute — use that for a form whose fields must keep their state, and
 * remember that a `hidden` panel does not print.
 */
export function TabPanel({
  value,
  keepMounted,
  className,
  children,
  ...rest
}: {
  value: string;
  keepMounted?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"div">, "children" | "className">) {
  return (
    <BaseTabs.Panel
      {...rest}
      value={value}
      keepMounted={keepMounted}
      className={className ? `${tabPanelClass} ${className}` : tabPanelClass}
    >
      {children}
    </BaseTabs.Panel>
  );
}
