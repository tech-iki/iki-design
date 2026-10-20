import type { Metadata } from "next";
import Link from "next/link";
import { PageMain, PageTitle, linkClass } from "@tech-iki/design";
import { CodeBlock } from "@/components/code-block";
import { Mono, Rich } from "@/components/rich";
import { BulletList, Eyebrow, P, Section } from "@/components/section";
import { SECTIONS } from "@/components/site-nav";

export const metadata: Metadata = {
  // The root layout's title template does not apply to a page in the same segment, so the suffix is spelled out.
  title: "Overview · IKI design",
  description:
    "What the IKI design system is, the ten principles behind it, and the lines that install it.",
};

/** Design-system document §2, in order: the rule in bold, then what stands behind it. */
const PRINCIPLES: [rule: string, why: string][] = [
  [
    "The data carries the colour; the chrome gets out of the way.",
    "Navy is furniture, teal marks actions, and the status fills are the only colour that means something (ADR 0006).",
  ],
  [
    "Colour is never the only signal.",
    "A pill always carries its label; the active nav item has weight and a bar as well as a tint (#57).",
  ],
  [
    "Contrast is asserted, not claimed.",
    "ADR 0003 said “AA-safe throughout”; measurement said 4.11:1. Now a test walks every pair (#57).",
  ],
  [
    "Light only.",
    "The workbook is light and the fixed palette is the point; a parallel dark theme doubles every decision for no demand (ADR 0003).",
  ],
  [
    "No component library.",
    "The primitives are small hand-rolled Tailwind components; a themed library would fight the workbook look (ADR 0003, ADR 0006).",
  ],
  [
    "Measured, not assumed.",
    "Print orientation, row tints, logo legibility on navy: each rule cites the number that settled it.",
  ],
  [
    "Density on the desk, room on the phone.",
    "Controls are about 26px tall with a mouse and 44px under a thumb, through a responsive minimum rather than one loose size (#63).",
  ],
  [
    "One definition per rule.",
    "Focus rings, button classes, status colours and email chrome exist once; per-component copies were deleted so a component cannot drift (ADR 0006 §4).",
  ],
  [
    "An icon is not a name.",
    "Every icon is `aria-hidden`; its control carries an `sr-only` label and a `title` (#95).",
  ],
  [
    "Add a token, add its contrast pair.",
    "Otherwise the suite fails (ADR 0006).",
  ],
];

const TAILWIND = `@import "tailwindcss";
@import "@tech-iki/design/theme.css";`;

const PLAIN_CSS = `@import "@tech-iki/design/tokens.css";
/* optional: body, link and focus rules */
@import "@tech-iki/design/base.css";`;

const COMPONENTS = `import { Pill, tones } from "@tech-iki/design";

<Pill tone={tones.overdue}>Overdue</Pill>`;

const GIT_TAG = `"@tech-iki/design": "github:tech-iki/iki-design#v0.1.0"`;

export default function OverviewPage() {
  return (
    <PageMain variant="readable">
      <PageTitle
        title="The IKI design system"
        description="The visual language of IKI Work OS, extracted so every IKI project shares it. Everything on this site is rendered from the package it documents."
      />

      <Section title="What it is">
        <P>
          The design system is the visual language of IKI Work OS — its colour
          tokens, status tones, type, controls and a handful of shared
          components — written down and packaged as{" "}
          <Mono>@tech-iki/design</Mono> so that the
          Islands Knowledge Institute’s other projects can use the same thing
          rather than a copy of it. This repository is the source of truth: a
          value lives in one file, the stylesheets and this site are generated
          from it, and a test fails if anything disagrees.
        </P>
      </Section>

      <Section title="Principles">
        <BulletList
          ordered
          items={PRINCIPLES.map(([rule, why]) => (
            <span key={rule}>
              <span className="font-semibold">{rule}</span> <Rich>{why}</Rich>
            </span>
          ))}
        />
      </Section>

      <Section title="Install">
        <div className="flex flex-col gap-2">
          <Eyebrow>Tailwind v4</Eyebrow>
          <CodeBlock code={TAILWIND} file="globals.css" />
        </div>
        <div className="flex flex-col gap-2">
          <Eyebrow>Plain CSS</Eyebrow>
          <CodeBlock code={PLAIN_CSS} file="style.css" />
        </div>
        <div className="flex flex-col gap-2">
          <Eyebrow>Components</Eyebrow>
          <CodeBlock code={COMPONENTS} file="any component" />
        </div>
        <div className="flex flex-col gap-2">
          <Eyebrow>Until the npm scope exists</Eyebrow>
          <P>
            Depend on the tagged release on GitHub, in{" "}
            <Mono>dependencies</Mono>:
          </P>
          <CodeBlock code={GIT_TAG} file="package.json" />
        </div>
        <P>
          <Link href="/adopt" className={linkClass}>
            Adopt
          </Link>{" "}
          has the longer version, including what a consumer must respect.
        </P>
      </Section>

      <Section title="On this site">
        <ul className="flex flex-col gap-3">
          {SECTIONS.filter((s) => s.href !== "/").map((s) => (
            <li
              key={s.href}
              className="rounded-md border border-grid bg-paper p-4"
            >
              <Link href={s.href} className={linkClass}>
                {s.label}
              </Link>
              <p className="mt-1 max-w-3xl text-sm text-ink-muted">{s.blurb}</p>
            </li>
          ))}
        </ul>
      </Section>
    </PageMain>
  );
}
