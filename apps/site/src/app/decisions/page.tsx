import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  COLOUR,
  PageMain,
  PageTitle,
  contrast,
} from "@tech-iki/design";
import { DataTable } from "@/components/data-table";
import { Mono, Rich } from "@/components/rich";
import { RatioCell, Verdict, formatRatio, passes } from "@/components/ratio";
import { BulletList, Eyebrow, P, Section } from "@/components/section";
import { Swatch } from "@/components/swatch";
import {
  DOC,
  DRIFT_COLUMNS,
  FAMILY_COLUMNS,
  REGISTER_COLUMNS,
} from "@/lib/design-doc";

export const metadata: Metadata = {
  title: "Decisions",
  description:
    "The open questions, the decisions that were reversed and must not be re-adopted, and the full decision register.",
};

/*
 * FOREIGN HEXES. This block is the one place on the site where a literal hex is
 * legitimate. These are not tokens of this system: they are facts about the
 * other IKI surfaces — the logo, the IKI Digital Library and the public website
 * — which design-system §3 compares Work OS against, measured on
 * 10 September 2026 from their assets and stylesheets. Nothing here can come
 * from the package, because the package is the system they are being compared
 * with. Work OS's own colours are read from the package, not written here.
 */
const LOGO_INDIGO = "#0b023b";
const LOGO_GRADIENT_START = "#1d1c60";
const LOGO_GRADIENT_END = "#224f97";
const LOGO_INSTITUTE_LINE = "#120b4a";
const LIBRARY_VIOLET_BLUE = "#2f429d"; // oklch(0.42 0.15 270), approximately
const WEBSITE_PACIFIC_BLUE = "#005f73";
const WEBSITE_LAGOON_GREEN = "#0a9396";

type FamilyColour = {
  name: string;
  hex: string;
  /** Hue / saturation / lightness, as measured. */
  hsl: string;
  note?: string;
};

const FAMILIES: { surface: string; colours: FamilyColour[] }[] = [
  {
    surface: "Logo",
    colours: [
      { name: "Nautilus mark — indigo", hex: LOGO_INDIGO, hsl: "249° / 93% / 12%" },
      { name: "Wordmark gradient, start — indigo", hex: LOGO_GRADIENT_START, hsl: "241°" },
      { name: "Wordmark gradient, end — mid blue", hex: LOGO_GRADIENT_END, hsl: "217°" },
      { name: "Institute line — indigo", hex: LOGO_INSTITUTE_LINE, hsl: "247° / 74% / 17%" },
    ],
  },
  {
    surface: "Work OS",
    colours: [
      { name: "Navy — slate-navy", hex: COLOUR.navy, hsl: "208° / 61% / 18%" },
      {
        name: "Teal",
        hex: COLOUR.teal,
        hsl: "181° / 73% / 32%",
        note: "Decorative fills only; text uses teal-deep.",
      },
    ],
  },
  {
    surface: "Digital Library",
    colours: [
      { name: "Primary — violet-blue", hex: LIBRARY_VIOLET_BLUE, hsl: "230° / 54% / 40%" },
    ],
  },
  {
    surface: "Website",
    colours: [
      { name: "Primary — Pacific blue", hex: WEBSITE_PACIFIC_BLUE, hsl: "190° / 100% / 23%" },
      {
        name: "Accent — lagoon green",
        hex: WEBSITE_LAGOON_GREEN,
        hsl: "181° / 88% / 31%",
        note: "Used for text on the site today.",
      },
    ],
  },
];

/*
 * The swatches below draw these colours; the table above them is §3's own.
 * A swatch whose hex the table does not carry is a colour the document never
 * measured, so it fails the build.
 */
const MEASURED = DOC.familyRows.map(([, , hex]) => hex.toLowerCase()).join(" ");
for (const c of FAMILIES.flatMap((f) => f.colours)) {
  if (!MEASURED.includes(`\`${c.hex.toLowerCase()}\``)) {
    throw new Error(`${c.name} ${c.hex} is not in the §3 table`);
  }
}

/** §16-1: the colour families, measured, and the options laid out. */
function ColourFamilies() {
  return (
    <>
      {DOC.familiesLead.map((paragraph) => (
        <P key={paragraph}>
          <Rich>{paragraph}</Rich>
        </P>
      ))}
      <DataTable
        label="Colour families across IKI surfaces"
        scrollable
        columns={FAMILY_COLUMNS.map((header) => ({ header }))}
        rows={DOC.familyRows.map((row) =>
          row.map((cell, i) => <Rich key={i}>{cell}</Rich>),
        )}
      />
      <p className="max-w-3xl text-sm text-ink">
        Each colour beside the others, with its ratio on white and whether
        it would pass as text. The logo and the fills are not text, so a
        fail there limits where the colour can carry words, not whether it
        may exist.
      </p>
      <div className="flex flex-col gap-4">
        {FAMILIES.map((f) => (
          <div key={f.surface} className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-ink">{f.surface}</h4>
            <ul className="flex flex-wrap gap-3">
              {f.colours.map((c) => (
                <li
                  key={c.name}
                  className="flex w-full items-start gap-3 rounded-md border border-grid bg-paper p-3 sm:w-64"
                >
                  <Swatch hex={c.hex} />
                  <div className="flex min-w-0 flex-col gap-1">
                    <p className="text-xs text-ink">{c.name}</p>
                    <p className="font-mono text-xs text-ink-muted">
                      {c.hex}
                    </p>
                    <p className="flex flex-wrap items-center gap-2 text-xs text-ink">
                      <RatioCell fg={c.hex} bg={COLOUR.paper} />
                      <span className="text-ink-muted">on white</span>
                      <Verdict
                        pass={passes(c.hex, COLOUR.paper, "text")}
                      />
                    </p>
                    {c.note ? (
                      <p className="text-xs text-ink-muted">{c.note}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <BulletList
        items={DOC.familyNotes.map((note) => (
          <Rich key={note}>{note}</Rich>
        ))}
      />
      <P>
        <Rich>{DOC.familyOptions}</Rich>
      </P>
    </>
  );
}

/** §16-2: the ratio that keeps the mark off navy. */
function LogoIndigo() {
  return (
    <P>
      The nautilus mark is{" "}
      {formatRatio(contrast(LOGO_INDIGO, COLOUR.navy))} against{" "}
      <Mono>navy</Mono>, which is why the mark alone sits on navy only as the
      white reverse.
    </P>
  );
}

/** §16-3: the drift table itself, under the paragraph that dates it. */
function Drift() {
  return (
    <>
      {DOC.driftLead.map((paragraph) => (
        <P key={paragraph}>
          <Rich>{paragraph}</Rich>
        </P>
      ))}
      <DataTable
        label="Known drift inside Work OS"
        scrollable
        columns={DRIFT_COLUMNS.map((header) => ({ header }))}
        rows={DOC.driftRows.map(([drift, where, fix]) => [
          <Rich key="drift">{drift}</Rich>,
          <Rich key="where">{where}</Rich>,
          <Rich key="fix">{fix}</Rich>,
        ])}
      />
    </>
  );
}

/**
 * What the site adds under a §16 question, keyed by a phrase of the question's
 * bold lead. The questions themselves are the document's; a phrase that no
 * longer matches exactly one fails the build rather than dropping its detail.
 */
const OPEN_DETAIL: [phrase: string, detail: ReactNode][] = [
  ["colour families", <ColourFamilies key="families" />],
  ["logo's indigo", <LogoIndigo key="indigo" />],
  ["drift", <Drift key="drift" />],
];
for (const [phrase] of OPEN_DETAIL) {
  const matches = DOC.open.filter(([question]) => question.includes(phrase));
  if (matches.length !== 1) {
    throw new Error(
      `"${phrase}" matches ${matches.length} questions in §16, expected one`,
    );
  }
}

export default function DecisionsPage() {
  return (
    <PageMain variant="readable">
      <PageTitle
        title="Decisions"
        description="What is still open, what was reversed and must not come back, and the register of every decision with what settled it."
      />

      <Section title="Open">
        <P>
          The open questions in §16 of the design-system document, in its
          order, with what the site can show about each. The first is Brian’s
          to decide.
        </P>

        {DOC.open.map(([question, known], i) => (
          <div key={question} className="flex flex-col gap-3">
            <Eyebrow>
              {i + 1}. <Rich>{question}</Rich>
            </Eyebrow>
            <P>
              <Rich>{known.trim()}</Rich>
            </P>
            {OPEN_DETAIL.find(([phrase]) => question.includes(phrase))?.[1]}
          </div>
        ))}
      </Section>

      <Section title="Reversed — do not re-adopt">
        <BulletList
          items={DOC.reversed.map(([what, why]) => (
            <span key={what}>
              <span className="font-semibold">
                <Rich>{what}</Rich>
              </span>
              <Rich>{why}</Rich>
            </span>
          ))}
        />
      </Section>

      <Section title="Decision register">
        <DataTable
          label="Decision register"
          scrollable
          columns={REGISTER_COLUMNS.map((header) => ({ header }))}
          rows={DOC.register.map(([date, source, decision, settled]) => [
            <span key="date" className="whitespace-nowrap tabular-nums">
              {date}
            </span>,
            <Rich key="source">{source}</Rich>,
            <Rich key="decision">{decision}</Rich>,
            <Rich key="settled">{settled}</Rich>,
          ])}
        />
      </Section>
    </PageMain>
  );
}
