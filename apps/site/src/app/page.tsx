import type { Metadata } from "next";
import Link from "next/link";
import { PageMain, PageTitle, linkClass } from "@tech-iki/design";
import { CodeBlock } from "@/components/code-block";
import { Mono, Rich } from "@/components/rich";
import { BulletList, Eyebrow, P, Section } from "@/components/section";
import { SECTIONS } from "@/components/site-nav";
import { DOC } from "@/lib/design-doc";

export const metadata: Metadata = {
  // The root layout's title template does not apply to a page in the same segment, so the suffix is spelled out.
  title: "Overview · IKI design",
  description:
    "What the IKI design system is, the principles behind it, and the lines that install it.",
};

const TAILWIND = `@import "tailwindcss";
@import "@tech-iki/design/theme.css";`;

const PLAIN_CSS = `@import "@tech-iki/design/tokens.css";
/* optional: body, link and focus rules */
@import "@tech-iki/design/base.css";`;

const COMPONENTS = `import { Pill, tones } from "@tech-iki/design";

<Pill tone={tones.overdue}>Overdue</Pill>`;

const GIT_TAG = `"@tech-iki/design": "https://github.com/tech-iki/iki-design/releases/download/v0.5.0/tech-iki-design-0.5.0.tgz"`;

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
          items={DOC.principles.map(([rule, why]) => (
            <span key={rule}>
              <span className="font-semibold">
                <Rich>{rule}</Rich>
              </span>
              <Rich>{why}</Rich>
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
