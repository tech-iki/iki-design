import type { Metadata } from "next";
import {
  COLOUR,
  COLOURS,
  PageMain,
  PageTitle,
  THRESHOLD,
  TOKEN_PAIRS,
  blend,
  contrast,
  type Colour,
  type ColourGroup,
} from "@tech-iki/design";
import { DataTable } from "@/components/data-table";
import { Mono, Rich } from "@/components/rich";
import { RatioCell, Verdict, formatRatio, passes } from "@/components/ratio";
import { BulletList, P, Section } from "@/components/section";
import { Swatch } from "@/components/swatch";
import { DOC } from "@/lib/design-doc";

export const metadata: Metadata = {
  title: "Colour",
  description:
    "Every colour token with its role and reason, and the contrast ratio of every pair the system renders.",
};

const GROUPS: [group: ColourGroup, title: string][] = [
  ["brand", "Brand and chrome"],
  ["surface", "Surfaces, rules and text"],
  ["status", "Status fills"],
];

/** A ratio as the document prints it, from two hex values. */
const ratio = (fg: string, bg: string) => formatRatio(contrast(fg, bg));

/** White at an alpha over navy, flattened — the rail's text colours. */
const whiteOnNavy = (alpha: number) =>
  ratio(blend(COLOUR.paper, alpha, COLOUR.navy), COLOUR.navy);

/*
 * The rules below are §4's own words, which print their ratios as numbers.
 * These are the same ratios computed from the package, each with the words
 * the document prints just before it, so a number moved to the wrong token is
 * caught as well as a wrong number. Every other ratio the rules print must be
 * a WCAG threshold, so a token change that moves a ratio fails the build
 * until the document says the new number.
 */
const CITED: [before: string, ratio: string][] = [
  ["On `row-hover` it is ", ratio(COLOUR["teal-deep"], COLOUR["row-hover"])],
  [
    "composited to ",
    ratio(blend(COLOUR["warm-fg"], 0.4, COLOUR["warm-bg"]), COLOUR["warm-bg"]),
  ],
  [
    `clears ${THRESHOLD.nonText}:1 at `,
    ratio(blend(COLOUR["warm-fg"], 0.7, COLOUR["warm-bg"]), COLOUR["warm-bg"]),
  ],
  ["text `paper/75` (", whiteOnNavy(0.75)],
  ["saved views `paper/70` (", whiteOnNavy(0.7)],
  ["group headings `paper/50` (", whiteOnNavy(0.5)],
];
const RULES = DOC.colourRules.join(" ");
for (const [before, value] of CITED) {
  if (!RULES.includes(`${before}${value}`)) {
    throw new Error(`§4 Rules do not print "${before}${value}", which the package computes`);
  }
}
const THRESHOLDS = Object.values(THRESHOLD).map((t) => `${t}:1`);
for (const printed of RULES.match(/\d+(?:\.\d+)?:1\b/g) ?? []) {
  if (!CITED.some(([, value]) => value === printed) && !THRESHOLDS.includes(printed)) {
    throw new Error(`§4 Rules print ${printed}, which the package does not compute`);
  }
}

/** The fill/text pairs: every status `-bg` token with the `-fg` token beside it. */
const STATUS_PAIRS = COLOURS.filter(
  (c) => c.group === "status" && c.name.endsWith("-bg"),
).flatMap((bg) => {
  const fg = COLOURS.find((c) => c.name === bg.name.replace(/-bg$/, "-fg"));
  return fg ? [{ bg, fg }] : [];
});

function TokenList({ tokens }: { tokens: readonly Colour[] }) {
  return (
    <ul className="divide-y divide-grid overflow-hidden rounded-md border border-grid">
      {tokens.map((c, i) => (
        <li
          key={c.name}
          className={`flex items-start gap-3 px-3 py-2 ${
            i % 2 === 0 ? "bg-paper" : "bg-paper-tint"
          }`}
        >
          <Swatch hex={c.hex} />
          <div className="flex min-w-0 flex-col gap-1">
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-mono text-xs font-semibold text-ink">
                {c.name}
              </span>
              <span className="font-mono text-xs text-ink-muted">{c.hex}</span>
            </p>
            <p className="max-w-3xl text-sm text-ink">{c.role}</p>
            {c.note ? (
              <p className="max-w-3xl text-xs text-ink-muted">{c.note}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

function StatusPairs() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {STATUS_PAIRS.map(({ bg, fg }) => (
        <li
          key={bg.name}
          className="flex flex-col overflow-hidden rounded-md border border-grid bg-paper"
        >
          <p
            className="px-3 py-4 text-center text-xl font-semibold"
            style={{ background: bg.hex, color: fg.hex }}
          >
            Aa
          </p>
          <div className="flex flex-col gap-1 px-3 py-2 text-xs text-ink">
            <p className="font-mono">{bg.name}</p>
            <p className="font-mono">{fg.name}</p>
            <p className="text-ink-muted">
              Text on fill, <RatioCell fg={fg.hex} bg={bg.hex} />
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function ColourPage() {
  const passing = TOKEN_PAIRS.filter((p) => passes(p.fg, p.bg, p.kind)).length;

  return (
    <PageMain>
      <PageTitle
        title="Colour"
        description={`${COLOURS.length} tokens, each with the place it is used and the measurement behind its value. Text needs ${THRESHOLD.text}:1 (WCAG 1.4.3); a control boundary or meaningful graphic needs ${THRESHOLD.nonText}:1 (WCAG 1.4.11).`}
      />

      <div className="flex flex-col gap-8">
        {GROUPS.map(([group, title]) => (
          <Section key={group} title={title}>
            {group === "status" ? <StatusPairs /> : null}
            <TokenList tokens={COLOURS.filter((c) => c.group === group)} />
          </Section>
        ))}

        <Section title="Every pair the system renders">
          <P>
            Each row is a foreground on a background that the interface really
            draws. The ratio is computed here, from the two hex values, with the
            WCAG 2.2 formula — the same function the package’s test uses to fail
            the build.
          </P>
          <DataTable
            label="Every contrast pair the system renders"
            scrollable
            columns={[
              { header: "What" },
              { header: "Foreground" },
              { header: "Background" },
              { header: "Kind" },
              { header: "Ratio", numeric: true },
              { header: "Threshold", numeric: true },
              { header: "Result" },
            ]}
            rows={TOKEN_PAIRS.map((p) => [
              p.what,
              <span key="fg" className="flex items-center gap-2">
                <Swatch hex={p.fg} size="sm" />
                <Mono>{p.fg}</Mono>
              </span>,
              <span key="bg" className="flex items-center gap-2">
                <Swatch hex={p.bg} size="sm" />
                <Mono>{p.bg}</Mono>
              </span>,
              p.kind === "text" ? "Text" : "Non-text",
              <RatioCell key="ratio" fg={p.fg} bg={p.bg} />,
              `${THRESHOLD[p.kind]}:1`,
              <Verdict key="verdict" pass={passes(p.fg, p.bg, p.kind)} />,
            ])}
          />
          <p className="text-sm tabular-nums text-ink">
            {TOKEN_PAIRS.length} pairs, {passing} pass
          </p>
        </Section>

        <Section title="Rules">
          <BulletList
            items={DOC.colourRules.map((rule) => (
              <Rich key={rule}>{rule}</Rich>
            ))}
          />
        </Section>
      </div>
    </PageMain>
  );
}
