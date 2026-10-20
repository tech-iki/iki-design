import { Pill, THRESHOLD, contrast, tones, type ContrastKind } from "@tech-iki/design";

/** `4.8481…` → `4.85:1`. Two decimals, as the design-system document prints them. */
export function formatRatio(value: number): string {
  return `${value.toFixed(2)}:1`;
}

/** The contrast of one pair, computed from the hex values — never typed. */
export function RatioCell({ fg, bg }: { fg: string; bg: string }) {
  return <span className="tabular-nums">{formatRatio(contrast(fg, bg))}</span>;
}

/** Whether a pair clears the WCAG threshold for its kind (the unrounded ratio). */
export function passes(fg: string, bg: string, kind: ContrastKind): boolean {
  return contrast(fg, bg) >= THRESHOLD[kind];
}

/** Pass or Fail as a pill: positive green, or the overdue red. The word is the signal, not the colour. */
export function Verdict({ pass }: { pass: boolean }) {
  return pass ? (
    <Pill tone={tones.positive}>Pass</Pill>
  ) : (
    <Pill tone={tones.overdue}>Fail</Pill>
  );
}
