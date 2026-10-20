/**
 * `@tech-iki/design` — the IKI design system as code.
 *
 * `tokens.ts` is the source; `theme.css`, `tokens.css`, `base.css` and
 * `tokens.json` are generated from it by `scripts/build-css.ts` and exported
 * as subpaths. This module exports the values, the arithmetic that holds them
 * to their contrast thresholds, the class strings that are the component
 * library, and the four shared components.
 */

export * from "./tokens.js";
export * from "./ui-contrast.js";
export * from "./tones.js";
export * from "./ui-classes.js";
export * from "./pill-width.js";
export { Pill } from "./components/pill.js";
export { KpiTile } from "./components/kpi-tile.js";
export { PageTitle } from "./components/page-title.js";
export { PageMain } from "./components/page-main.js";
export * from "./generate.js";
