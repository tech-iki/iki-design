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
export { ICONS, LUCIDE_VERSION, type IconName, type IconSize } from "./icons.generated.js";
export * from "./generate.js";
