import type { Metadata } from "next";
import Link from "next/link";
import {
  FONT,
  PageMain,
  PageTitle,
  TYPE_SCALE_PX,
  WEIGHTS,
  linkClass,
} from "@tech-iki/design";
import { CodeBlock } from "@/components/code-block";
import { DataTable } from "@/components/data-table";
import { Mono, Rich } from "@/components/rich";
import { BulletList, Eyebrow, P, Section } from "@/components/section";

export const metadata: Metadata = {
  title: "Type",
  description:
    "Geist and Geist Mono, the eight sizes in use, three weights, the heading hierarchy and tabular figures.",
};

type Size = (typeof TYPE_SCALE_PX)[number];
type Weight = (typeof WEIGHTS)[number];

/**
 * Each size in the scale and the Tailwind class that draws it. Typed over the
 * package's own scale, so a size added there is a type error here until it is
 * shown. 10px and 11px are the two sizes with no named class; the system writes
 * them as arbitrary values, and says so as drift (see Decisions).
 */
const SCALE: Record<Size, { cls: string; use: string }> = {
  10: { cls: "text-[10px]", use: "The compact pill on a policy card, through Pill’s layout-only className." },
  11: { cls: "text-[11px]", use: "Rail group headings, count badges, and a few sites on the policy board." },
  12: { cls: "text-xs", use: "Table headers, every pill, form labels, hints, mono identifiers, eyebrows, KPI label bars." },
  14: { cls: "text-sm", use: "The working size: tables, inputs, buttons, nav links, section headings, page descriptions." },
  16: { cls: "text-base", use: "The guide’s section headings; the login h1." },
  18: { cls: "text-lg", use: "Import summary chip value." },
  20: { cls: "text-xl", use: "Page h1; report h1." },
  30: { cls: "text-3xl", use: "KPI tile figure." },
};

const WEIGHT: Record<Weight, { cls: string; shown: string; use: string }> = {
  400: { cls: "font-normal", shown: "none — the body default", use: "Body text, descriptions, table cells." },
  500: { cls: "font-medium", shown: "font-medium", use: "Labels, pill text, inactive nav, card titles." },
  600: { cls: "font-semibold", shown: "font-semibold", use: "Headings, buttons, table headers, active nav, badges." },
};

const H1 = "text-xl font-semibold tracking-tight text-ink";
const H2 = "text-sm font-semibold text-ink";
const H3 = "text-xs font-semibold uppercase tracking-wide text-ink-muted";

const HIERARCHY = `h1  ${H1}
h2  ${H2}
h3  ${H3}   (eyebrow)

description  mt-1 max-w-3xl text-sm text-ink-muted`;

/** Sample figures, wide enough that proportional digits visibly misalign. */
const FIGURES = ["1,111.11", "8,888.88", "4,096.00", "12.50"];

const CHIP = "rounded bg-teal-soft px-1.5 py-0.5 font-mono text-xs text-navy";

export default function TypePage() {
  return (
    <PageMain variant="readable">
      <PageTitle
        title="Type"
        description="One family, two faces: Geist for everything, Geist Mono for identifiers. Two sizes carry about 97% of the interface."
      />

      <Section title="Two faces">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2 rounded-md border border-grid bg-paper p-4">
            <Eyebrow>{FONT.sans.family}</Eyebrow>
            <p className="font-sans text-3xl font-semibold text-ink">Aa Gg 0123</p>
            <p className="font-sans text-sm text-ink">
              The data carries the colour; the chrome gets out of the way.
            </p>
            <p className="text-xs text-ink-muted">
              Fallback: <Mono>{FONT.sans.fallback}</Mono>
            </p>
          </div>
          <div className="flex flex-col gap-2 rounded-md border border-grid bg-paper p-4">
            <Eyebrow>{FONT.mono.family}</Eyebrow>
            <p className="font-mono text-3xl font-semibold text-ink">Aa Gg 0123</p>
            <p className="font-mono text-sm text-ink">OPS-014 · OPS-015</p>
            <p className="text-xs text-ink-muted">
              Fallback: <Mono>{FONT.mono.fallback}</Mono>
            </p>
          </div>
        </div>
        <P>
          The apps load Geist through <Mono>next/font</Mono>, which self-hosts
          the files, so no request reaches Google and a{" "}
          <Mono>font-src &apos;self&apos;</Mono> policy holds. The two custom
          properties it sets are{" "}
          <Mono>{FONT.sans.variable}</Mono> and{" "}
          <Mono>{FONT.mono.variable}</Mono>.{" "}
          <Link href="/adopt" className={linkClass}>
            Adopt
          </Link>{" "}
          shows the lines.
        </P>
      </Section>

      <Section title="The scale in use">
        <P>
          There is no <Mono>leading-*</Mono> anywhere: every line height is
          Tailwind’s default for its size. The sizes 10 and 11 are not tokens;
          they are listed as drift on{" "}
          <Link href="/decisions" className={linkClass}>
            Decisions
          </Link>
          .
        </P>
        <DataTable
          label="The type scale in use"
          columns={[
            { header: "Size", numeric: true },
            { header: "Class" },
            { header: "Sample" },
            { header: "What it is for" },
          ]}
          rows={TYPE_SCALE_PX.map((px) => {
            const { cls, use } = SCALE[px];
            return [
              `${px}px`,
              <Mono key="cls">{cls}</Mono>,
              <span key="sample" className={`${cls} whitespace-nowrap text-ink`}>
                Islands Knowledge Institute
              </span>,
              use,
            ];
          })}
        />
      </Section>

      <Section title="Weight, tracking, numerals">
        <DataTable
          label="The three weights"
          columns={[
            { header: "Weight", numeric: true },
            { header: "Class" },
            { header: "Sample" },
            { header: "What it is for" },
          ]}
          rows={WEIGHTS.map((w) => {
            const { cls, shown, use } = WEIGHT[w];
            return [
              String(w),
              <Mono key="cls">{shown}</Mono>,
              <span key="sample" className={`${cls} text-sm text-ink`}>
                Awaiting Input
              </span>,
              use,
            ];
          })}
        />
        <P>
          Nothing is bold: a 700 weight appears nowhere in the interface. Two
          weights sit on a 400 body.
        </P>
        <BulletList
          items={[
            <Rich key="wide">
              `tracking-wide` (0.025em) on uppercase eyebrows, `tracking-wider` (0.05em) on the rail headings and the report’s institute line, `tracking-tight` (−0.025em) on the two 20px h1s only.
            </Rich>,
            <Rich key="tab">
              `tabular-nums` on every figure: KPI values, table counts, chart labels, percentages, timestamps.
            </Rich>,
            <Rich key="mono">
              Mono marks identifiers, never prose or table numbers: task references, workstream codes, generated passwords, error digests, chart axis labels.
            </Rich>,
          ]}
        />
      </Section>

      <Section title="Hierarchy">
        {/* A specimen, not page structure: hidden from assistive technology so
            the demonstration h1 does not become a second h1 on the page. The
            classes are printed beneath it. */}
        <div
          aria-hidden="true"
          className="flex flex-col gap-3 rounded-md border border-grid bg-paper p-4"
        >
          <header>
            <h1 className={H1}>Tasks</h1>
            <p className="mt-1 max-w-3xl text-sm text-ink-muted">
              Every task across the institute, soonest deadline first.
            </p>
          </header>
          <h2 className={H2}>Workstreams</h2>
          <h3 className={H3}>This fortnight</h3>
        </div>
        <CodeBlock code={HIERARCHY} />
        <P>
          Headings are plain type, never a chip or a band. Prose caps at{" "}
          <Mono>max-w-4xl</Mono>, descriptions at <Mono>max-w-3xl</Mono>, and
          tables run the full width, like the workbook fills its window.
        </P>
      </Section>

      <Section title="Tabular figures">
        <P>
          Geist’s digits are proportional unless asked otherwise, so a column of
          figures drifts. <Mono>tabular-nums</Mono> gives every digit the same
          advance, and the column lines up.
        </P>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Eyebrow>Without</Eyebrow>
            <ul className="flex w-40 flex-col rounded-md border border-grid bg-paper p-3 text-right text-sm text-ink">
              {FIGURES.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <Eyebrow>With tabular-nums</Eyebrow>
            <ul className="flex w-40 flex-col rounded-md border border-grid bg-paper p-3 text-right text-sm tabular-nums text-ink">
              {FIGURES.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Mono for identifiers">
        <p className="text-sm text-ink">
          Task <span className={CHIP}>OPS-014</span> is due on 15 Jul 2026, three
          days after <span className="font-mono text-xs">OPS-009</span>.
        </p>
        <CodeBlock code={CHIP} file="the chip" />
      </Section>
    </PageMain>
  );
}
