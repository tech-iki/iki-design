/**
 * `@tech-iki/design` — the IKI design system as code.
 *
 * `tokens.ts` is the source; `theme.css`, `tokens.css`, `base.css` and
 * `tokens.json` are generated from it by `scripts/build-css.ts` and exported
 * as subpaths. This module exports the values, the arithmetic that holds them
 * to their contrast thresholds, the class strings that are the component
 * library, the shared components, and the typed `Icon` whose drawings
 * `scripts/build-icons.ts` generates from Lucide into `icons.generated.tsx`.
 */

export * from "./tokens.js";
export * from "./ui-contrast.js";
export * from "./tones.js";
export * from "./ui-classes.js";
export * from "./pill-width.js";
export { Pill } from "./components/pill.js";
export { KpiTile, type KpiTone } from "./components/kpi-tile.js";
export { PageTitle } from "./components/page-title.js";
export { PageMain } from "./components/page-main.js";
export { Button, type ButtonVariant } from "./components/button.js";
export { Field, fieldErrorClass, fieldFrameClass, fieldHintClass } from "./components/field.js";
export { Notice, noticeClass, type NoticeTone } from "./components/notice.js";
export { EmptyState, emptyStateClass, emptyStateTextClass } from "./components/empty-state.js";
export { Icon } from "./components/icon.js";
export { TableFrame, ActionsHeader, rowClass } from "./components/table-frame.js";
export { Checkbox, Radio, RadioGroup } from "./components/choice.js";
// Client-only (ADR 0002; design system §13): each file starts with "use client".
// Base UI is behind them and is never re-exported.
export { Drawer, type DrawerCloseReason } from "./components/drawer.js";
export { Popover, PopoverOption } from "./components/popover.js";
export { Menu, MenuItem } from "./components/menu.js";
export { Disclosure } from "./components/disclosure.js";
export { Tooltip } from "./components/tooltip.js";
export { Tabs, TabList, Tab, TabPanel } from "./components/tabs.js";
export { Combobox, type ComboboxOption } from "./components/combobox.js";
export { ICONS, LUCIDE_VERSION, type IconName, type IconSize } from "./icons.generated.js";
export * from "./generate.js";
