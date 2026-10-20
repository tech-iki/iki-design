import type { ReactNode } from "react";
import type { PillTone } from "../tones.js";

/**
 * A small status badge (F13). The colour is passed in as a `tone` class from
 * the central maps in tones.ts; the label always sits inside, so
 * the pill never conveys meaning by colour alone. `tone` is a `PillTone`, so a
 * hand-written colour literal is a compile error (tsc is the guard, Work OS #248).
 * `className` is for layout only — `bg-` colour classes are prohibited there,
 * because tone and className are rendered into one class string.
 *
 * **Always one line** (`whitespace-nowrap`). A two-word label — "Not Started",
 * "Awaiting Input" — broke onto a second line wherever its container was
 * narrower than the label, and the rounded-full ends stretched the pill into a
 * tall lozenge that no longer reads as a status chip. It had been fixed at call
 * sites before (a declared column width in Work OS #80, a wrapper in the monthly
 * report), which is why it kept coming back: each new caller had to remember.
 * Held by `pill-single-line.test.ts`, which renders this component. A caller's
 * `className` must never set `whitespace-*`: it would compete with this one.
 */
export function Pill({
  tone,
  title,
  className = "",
  children,
}: {
  tone?: PillTone;
  title?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      title={title}
      className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${tone ?? ""} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
