import { createElement, type ComponentPropsWithoutRef } from "react";
import { ICONS, type IconName } from "../icons.generated.js";

/**
 * A glyph from the IKI vocabulary (phase 0). `name` is a meaning, not a
 * picture: `drop`, `settings`, `mailOff`. The picture behind each name lives in
 * one place, `scripts/build-icons.ts`, and can change without a single caller
 * changing. `name` is an `IconName`, so a typo is a compile error, not a blank
 * space in the interface.
 *
 * There are two sizes and no others, and the caller never chooses: 16px at
 * stroke 1.5 for rows and inline glyphs, 20px at stroke 1.4 for the navigation
 * rail. Both come from the vocabulary entry. `className` and `style` pass
 * through for layout and colour (the stroke is `currentColor`).
 *
 * Two judgements from section 8 of the design system are held here:
 * - **Settings is sliders, not a cog.** A cog's teeth turn to fuzz at 20px on
 *   the navy rail.
 * - **Drop is a tray, not a bin.** Dropping, archiving and moving to Trash all
 *   move a record somewhere recoverable; a bin would promise a destruction the
 *   app does not perform.
 *
 * Server-safe on purpose: no client directive and no hooks, so a Server Component
 * can render it. The glyph is decorative (`aria-hidden`); the control around it
 * carries the accessible name. Held by `icon.test.ts`.
 */
/** What a caller cannot set: the two sizes, the stroke and the hidden state are the vocabulary's. */
type FixedAttribute =
  | "children"
  | "width"
  | "height"
  | "viewBox"
  | "fill"
  | "stroke"
  | "strokeWidth"
  | "strokeLinecap"
  | "strokeLinejoin"
  | "aria-hidden"
  | "focusable";

export function Icon({
  name,
  className,
  ...rest
}: { name: IconName } & Omit<ComponentPropsWithoutRef<"svg">, FixedAttribute>) {
  const { size, stroke, nodes } = ICONS[name];
  // `rest` is spread first: the size, stroke and hidden state are the system's, not the caller's.
  return (
    <svg
      {...rest}
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {nodes.map(([tag, attrs], i) => createElement(tag, { ...attrs, key: i }))}
    </svg>
  );
}
