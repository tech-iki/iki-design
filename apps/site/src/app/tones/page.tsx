import type { Metadata } from "next";
import {
  COLOUR,
  PageMain,
  PageTitle,
  Pill,
  TONE_TOKENS,
  contrast,
  pillWidth,
  tones,
  widestPill,
  type ToneName,
} from "@tech-iki/design";
import { CodeBlock } from "@/components/code-block";
import { DataTable } from "@/components/data-table";
import { Mono } from "@/components/rich";
import { formatRatio } from "@/components/ratio";
import { Eyebrow, P, Section } from "@/components/section";
import { Swatch } from "@/components/swatch";
import { DOC } from "@/lib/design-doc";
import { pillMapEntries } from "@/lib/pill-maps";

export const metadata: Metadata = {
  title: "Pills",
  description:
    "The nine status tones, each as a real pill with its two tokens, its meaning and its measured contrast.",
};

/**
 * A representative label for each tone. Typed as a `Record<ToneName, …>`, so
 * adding a tone to the package is a type error here until it is shown. The key
 * order is the order the page draws them in.
 */
const LABEL: Record<ToneName, string> = {
  overdue: "Overdue",
  warm: "Awaiting Input",
  stale: "Stale",
  positive: "On Track",
  completed: "Completed",
  info: "In Progress",
  low: "Low",
  neutral: "Not Started",
  cancelled: "Cancelled",
};

const ENTRIES = Object.entries(LABEL) as [ToneName, string][];
const LABELS = ENTRIES.map(([, label]) => label);

/** §4's `STATUS_PILL` row as label → tone, in the document's order. */
const STATUS_ENTRIES = pillMapEntries(DOC.pillMaps, "STATUS_PILL");

/** The example, written from §4's row, so it cannot show a mapping the system does not. */
const STATUS_PILL = `import { Pill, tones, type PillTone } from "@tech-iki/design";

type TaskStatus =
${STATUS_ENTRIES.map(([label]) => `  | ${JSON.stringify(label)}`).join("\n")};

// The vocabulary belongs to the app; the colour belongs to the system.
const STATUS_PILL: Record<TaskStatus, PillTone> = {
${STATUS_ENTRIES.map(
  ([label, tone]) =>
    `  ${/^[A-Za-z]+$/.test(label) ? label : JSON.stringify(label)}: tones.${tone},`,
).join("\n")}
};

<Pill tone={STATUS_PILL[task.status]}>{task.status}</Pill>`;

/** The widest label on the page, for the clipping demonstration. */
const WIDEST_LABEL = LABELS.reduce((a, b) => (pillWidth(b) > pillWidth(a) ? b : a));

export default function TonesPage() {
  return (
    <PageMain variant="readable">
      <PageTitle
        title="Pills"
        description="Nine tones, each a light fill with dark same-hue text. The label always sits inside the pill, so colour is never the only signal."
      />

      <Section title="The nine tones">
        <P>
          The package exports the tones and no vocabulary. Whether a task is
          “Awaiting Input” is a fact about one product; that it takes the warm
          pair is a fact about the palette. The labels below are examples.
        </P>
        <DataTable
          label="The nine status tones"
          scrollable
          columns={[
            { header: "Pill" },
            { header: "Tone" },
            { header: "Fill and text" },
            { header: "Meaning" },
            { header: "Ratio", numeric: true },
          ]}
          rows={ENTRIES.map(([name, label]) => {
            const t = TONE_TOKENS[name];
            return [
              <Pill key="pill" tone={tones[name]}>
                {label}
              </Pill>,
              <Mono key="tone">{name}</Mono>,
              <span key="tokens" className="flex flex-col gap-1 whitespace-nowrap">
                <span className="flex items-center gap-2">
                  <Swatch hex={COLOUR[t.bg]} size="sm" />
                  <Mono>{t.bg}</Mono>
                </span>
                <span className="flex items-center gap-2">
                  <Swatch hex={COLOUR[t.fg]} size="sm" />
                  <Mono>{t.fg}</Mono>
                </span>
              </span>,
              t.meaning,
              <span key="ratio" className="tabular-nums">
                {formatRatio(contrast(COLOUR[t.fg], COLOUR[t.bg]))}
              </span>,
            ];
          })}
        />
      </Section>

      <Section title="Mapping a vocabulary onto them">
        <P>
          An app keeps its own{" "}
          <Mono>Record&lt;Vocabulary, PillTone&gt;</Mono>. The type checker
          refuses any string that is not in the <Mono>PillTone</Mono> union, so
          a hand-written colour at a call site is a compile error, and retinting
          a tone moves every map that uses it.
        </P>
        <CodeBlock code={STATUS_PILL} file="status-pill.tsx" />
      </Section>

      <Section title="A pill never wraps">
        <P>
          <Mono>Pill</Mono> is <Mono>whitespace-nowrap</Mono>, so it cannot
          shrink to fit: its container must be at least{" "}
          <Mono>pillWidth(label)</Mono> wide. The widest of these nine is “
          {WIDEST_LABEL}”, at {widestPill(LABELS)}px.
        </P>
        <DataTable
          label="Pill width for each example label"
          scrollable
          columns={[
            { header: "Label" },
            { header: "pillWidth(label)", numeric: true },
          ]}
          rows={ENTRIES.map(([name, label]) => [
            <Pill key="pill" tone={tones[name]}>
              {label}
            </Pill>,
            `${pillWidth(label)}px`,
          ])}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Eyebrow>
              Failure mode — container too narrow
            </Eyebrow>
            <div className="w-15 overflow-hidden rounded-md border border-grid-strong p-1">
              <Pill tone={tones.warm}>{WIDEST_LABEL}</Pill>
            </div>
            <p className="text-xs text-ink-muted">
              60px wide with <Mono>overflow-hidden</Mono>: the pill clips
              rather than wraps. In a table with a fixed layout it would spill
              over the next column instead.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Eyebrow>
              Correct — width from the label
            </Eyebrow>
            <div
              className="overflow-hidden rounded-md border border-grid-strong"
              style={{ width: pillWidth(WIDEST_LABEL) + 10 }}
            >
              <div className="p-1">
                <Pill tone={tones.warm}>{WIDEST_LABEL}</Pill>
              </div>
            </div>
            <p className="text-xs text-ink-muted">
              <Mono>pillWidth(&quot;{WIDEST_LABEL}&quot;)</Mono> is{" "}
              {pillWidth(WIDEST_LABEL)}px, plus the box’s 4px padding and 1px border either side. Every
              fixed-width pill column derives its width this way.
            </p>
          </div>
        </div>
      </Section>
    </PageMain>
  );
}
