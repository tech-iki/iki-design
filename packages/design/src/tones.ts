/**
 * The status tones: the colour half of every pill (Work OS F13).
 *
 * **The vocabulary belongs to the app, the colour belongs to the system.**
 * Whether a task is "Awaiting Input" or a policy is "Critical" is a fact about
 * one product; that the first is the warm pair and the second is the overdue
 * pair is a fact about the palette. So this module exports nine named tones and
 * no vocabulary. An app maps its own terms onto them:
 *
 *     const STATUS_PILL: Record<TaskStatus, PillTone> = {
 *       "Not Started": tones.neutral,
 *       "In Progress": tones.info,
 *       "Awaiting Input": tones.warm,
 *       …
 *     };
 *
 * and the type checker refuses any string that is not in the `PillTone` union —
 * a hand-written colour literal at a call site is a compile error rather than
 * something a source-shape test has to notice, and retinting a tone updates
 * every map that references it in one place. Work OS keeps its own
 * `HealthFlag`, `TaskStatus`, `TaskPriority`, `PlannedAction` and `ImportStatus`
 * maps; they are built from what is exported here.
 *
 * Each tone is a pair of Tailwind classes on the design tokens: a light fill
 * plus dark same-hue text, so every combination clears WCAG AA and never
 * relies on colour alone (the label always sits inside the pill).
 * `TONE_TOKENS` names the two tokens behind each tone and what it means, so the
 * showcase site can print each tone beside its measured ratio; `TOKEN_PAIRS`
 * in `ui-contrast.ts` holds every one of them to its threshold.
 */

import type { ColourToken } from "./tokens.js";

// `ink-muted` on the grid fill is 4.02:1 — under AA, caught by the token
// contrast test added in Work OS #57 (F24.1). Full `ink` on the same fill is
// 9.76:1; the pill still reads as the quiet one because the fill is grey.
export const NEUTRAL = "bg-grid text-ink";
export const POSITIVE = "bg-health-ontrack-bg text-health-ontrack-fg";

/**
 * The exact class strings a pill may use. `Pill.tone` takes this union (Work OS
 * #248), so a hand-written colour literal at a call site is a compile error
 * rather than something a source-shape test has to notice — and retinting a
 * shared constant updates every map that references it in one place.
 */
export type PillTone =
  | typeof NEUTRAL
  | typeof POSITIVE
  | "bg-health-overdue-bg text-health-overdue-fg"
  | "bg-warm-bg text-warm-fg"
  | "bg-health-stale-bg text-health-stale-fg"
  | "bg-teal-soft text-navy"
  | "bg-info-bg text-info-fg"
  | "bg-priority-low-bg text-priority-low-fg"
  | `${typeof NEUTRAL} line-through`;

/** The nine tones an app maps its vocabulary onto. */
export type ToneName =
  | "neutral"
  | "positive"
  | "overdue"
  | "warm"
  | "stale"
  | "completed"
  | "info"
  | "low"
  | "cancelled";

/**
 * Tone name → pill classes. Stale is amber, per the workbook (ADR 0003).
 * `cancelled` is the neutral pair struck through: the label stays readable and
 * the strike says the thing is no longer live.
 */
export const tones: Readonly<Record<ToneName, PillTone>> = {
  neutral: NEUTRAL,
  positive: POSITIVE,
  overdue: "bg-health-overdue-bg text-health-overdue-fg",
  warm: "bg-warm-bg text-warm-fg",
  stale: "bg-health-stale-bg text-health-stale-fg",
  completed: "bg-teal-soft text-navy",
  info: "bg-info-bg text-info-fg",
  low: "bg-priority-low-bg text-priority-low-fg",
  cancelled: `${NEUTRAL} line-through`,
};

/**
 * The two tokens behind each tone and what the tone means in Work OS (design
 * system §4, "Status fills"). `bg` is the fill and `fg` the text; `cancelled`
 * uses the neutral pair, struck through.
 */
export const TONE_TOKENS: Readonly<
  Record<ToneName, { bg: ColourToken; fg: ColourToken; meaning: string }>
> = {
  neutral: { bg: "grid", fg: "ink", meaning: "Neutral: Not Started, On Hold, Cancelled" },
  positive: {
    bg: "health-ontrack-bg",
    fg: "health-ontrack-fg",
    meaning: "On Track; Completed status; import create",
  },
  overdue: {
    bg: "health-overdue-bg",
    fg: "health-overdue-fg",
    meaning: "Overdue; High priority; import error",
  },
  warm: {
    bg: "warm-bg",
    fg: "warm-fg",
    meaning: "Due Soon; Medium; Awaiting Input; trash button",
  },
  stale: {
    bg: "health-stale-bg",
    fg: "health-stale-fg",
    meaning: "Stale — amber, per the workbook",
  },
  completed: { bg: "teal-soft", fg: "navy", meaning: "Completed health flag" },
  info: {
    bg: "info-bg",
    fg: "info-fg",
    meaning: "In Progress; import update; login notices",
  },
  low: { bg: "priority-low-bg", fg: "priority-low-fg", meaning: "Low priority" },
  cancelled: { bg: "grid", fg: "ink", meaning: "Cancelled: the neutral pair, struck through" },
};
