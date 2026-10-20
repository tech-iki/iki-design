import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { tones, type ToneName } from "../tones.js";

/** The four tones a notice may take: the pill tones that mean a message, not a status. */
export type NoticeTone = Extract<ToneName, "info" | "positive" | "warm" | "overdue">;

/** The frame every notice shares; the tone adds its fill and text pair. */
export const noticeClass = "rounded-md px-3 py-2 text-sm";

/**
 * Info and positive are news: `role="status"`, read when the reader gets to
 * it. Warm and overdue are refusals and warnings: `role="alert"`, read now.
 * Fixes the drift row "confirmations are plain text while refusals alert".
 */
const ROLE: Readonly<Record<NoticeTone, "status" | "alert">> = {
  info: "status",
  positive: "status",
  warm: "alert",
  overdue: "alert",
};

/**
 * An inline message on a tone (plan of 20 October 2026, phase 0; 98
 * hand-written `role="alert"` and `role="status"` paragraphs).
 *
 * The tone is a `ToneName`, so the fill and text are a pair `TOKEN_PAIRS`
 * already holds to AA, and the role is derived from it rather than chosen at
 * the call site: a confirmation can no longer be plain text while the refusal
 * beside it alerts. The message is the children, always words — a notice
 * never conveys its meaning by colour alone. `...rest` reaches the element,
 * so an `id` for `aria-describedby`, or an explicit `role` for the rare case
 * that needs the other one, passes through.
 */
export function Notice({
  tone = "info",
  className,
  children,
  ...rest
}: {
  tone?: NoticeTone;
  children: ReactNode;
} & ComponentPropsWithoutRef<"p">) {
  const base = `${noticeClass} ${tones[tone]}`;
  return (
    <p role={ROLE[tone]} className={className ? `${base} ${className}` : base} {...rest}>
      {children}
    </p>
  );
}
