import type { Metadata } from "next";
import Link from "next/link";
import {
  FONT,
  PageMain,
  PageTitle,
  baseCss,
  linkClass,
  themeCss,
  tokensCss,
  tokensJson,
} from "@tech-iki/design";
import { CodeBlock } from "@/components/code-block";
import { Mono, Rich } from "@/components/rich";
import { BulletList, Eyebrow, P, Section } from "@/components/section";

export const metadata: Metadata = {
  title: "Adopt",
  description:
    "How to install the design system with Tailwind v4, plain CSS or the components, what a consumer must respect, and the generated stylesheets verbatim.",
};

const TAILWIND = `@import "tailwindcss";
@import "@tech-iki/design/theme.css";`;

/** The same lines this site's own layout uses, with the property names read from the package. */
const NEXT_FONTS = `import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({ variable: "${FONT.sans.variable}", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "${FONT.mono.variable}", subsets: ["latin"] });

// <html lang="en" className={\`\${geistSans.variable} \${geistMono.variable} h-full antialiased\`}>`;

const PLAIN_CSS = `@import "@tech-iki/design/tokens.css";
/* optional: the body, link and focus rules */
@import "@tech-iki/design/base.css";

.notice {
  background: var(--iki-info-bg);
  color: var(--iki-info-fg);
  border-radius: var(--iki-radius);
}`;

const COMPONENTS = `import { KpiTile, PageMain, PageTitle, Pill, tones } from "@tech-iki/design";

export default function Page() {
  return (
    <PageMain variant="readable">
      <PageTitle title="Tasks" description="Soonest deadline first." />
      <Pill tone={tones.overdue}>Overdue</Pill>
      <KpiTile label="Open tasks" value={42} />
    </PageMain>
  );
}`;

const GIT_TAG = `"@tech-iki/design": "github:tech-iki/iki-design#v0.1.0"`;

export default function AdoptPage() {
  return (
    <PageMain variant="readable">
      <PageTitle
        title="Adopt"
        description="Three ways in, depending on the stack. Use the lines for yours; the constraints and the generated files follow."
      />

      <Section title="Install the package">
        <P>
          The package is <Mono>@tech-iki/design</Mono>, from{" "}
          <Mono>packages/design/</Mono> in <Mono>tech-iki/iki-design</Mono>.
          Until npm publishing exists, depend on the tagged release on GitHub,
          in <Mono>dependencies</Mono>:
        </P>
        <CodeBlock code={GIT_TAG} file="package.json" />
      </Section>

      <Section title="Tailwind v4">
        <P>
          Import the theme after Tailwind itself. It declares every colour as a
          utility (<Mono>bg-teal-deep</Mono>, <Mono>text-ink</Mono>) and tells
          Tailwind to scan the package’s compiled components and class strings,
          which it would not do inside <Mono>node_modules</Mono> on its own.
          There is no <Mono>tailwind.config</Mono> file.
        </P>
        <CodeBlock code={TAILWIND} file="globals.css" />
        <div className="flex flex-col gap-2">
          <Eyebrow>Next.js: the fonts</Eyebrow>
          <P>
            The theme reads two custom properties for the font stacks.{" "}
            <Mono>next/font</Mono> self-hosts Geist and sets them, exactly as
            this site’s own layout does.
          </P>
          <CodeBlock code={NEXT_FONTS} file="app/layout.tsx" />
        </div>
      </Section>

      <Section title="Plain CSS">
        <P>
          For a Ghost theme, WordPress or Docmost: custom properties on{" "}
          <Mono>:root</Mono>, prefixed <Mono>--iki-</Mono>, with no build step.
          Load Geist yourself, from your own files, and load{" "}
          <Mono>tokens.css</Mono> before <Mono>base.css</Mono>. A Tailwind app
          does not need <Mono>base.css</Mono> and would only fight it.
        </P>
        <CodeBlock code={PLAIN_CSS} file="style.css" />
      </Section>

      <Section title="Components">
        <P>
          Four components come from the package root, with the tones, the class
          strings and the contrast arithmetic. They are React 19 server
          components with no client JavaScript.{" "}
          <Link href="/controls" className={linkClass}>
            Controls
          </Link>{" "}
          and{" "}
          <Link href="/tones" className={linkClass}>
            Pills
          </Link>{" "}
          show them.
        </P>
        <CodeBlock code={COMPONENTS} file="app/page.tsx" />
      </Section>

      <Section title="What a consumer must respect">
        <BulletList
          items={[
            <Rich key="cdn">
              {"**No CDN, for anything.** The policy is `default-src 'self'`, `script-src` nonce-only with `strict-dynamic`, `style-src` nonce-only, `img-src 'self' blob: data:`, `font-src 'self'`. A hosted stylesheet, an icon font, a CDN script and a remote image are all blocked. A shared package must be files in the repository."}
            </Rich>,
            <Rich key="cssinjs">
              {
                "**No CSS-in-JS that injects `<style>`** unless it can be given the per-request nonce. Tailwind v4 compiles to a static stylesheet and is fine."
              }
            </Rich>,
            <Rich key="inline">
              {"**Inline `style` attributes are allowed**, through `style-src-attr 'unsafe-inline'`, because a nonce cannot apply to an attribute and React server-renders the grid’s column widths that way. Everything else stays strict."}
            </Rich>,
            <Rich key="library">
              **No component library**, per ADR 0003 and ADR 0006. A shadcn project keeps its source-owned primitives and re-points their tokens.
            </Rich>,
            <Rich key="light">
              **Light only.** Do not add a dark palette on the consumer side; propose it as an ADR.
            </Rich>,
          ]}
        />
      </Section>

      <Section title="The generated files">
        <P>
          These are the package’s outputs, produced here by calling the same
          functions that write <Mono>dist/</Mono>. Edit{" "}
          <Mono>tokens.ts</Mono>, never these. The JSON is stamped with the
          package’s version, which this page does not read, so it shows a dash.
        </P>
        <CodeBlock code={themeCss()} file="theme.css" generated />
        <CodeBlock code={tokensCss()} file="tokens.css" generated />
        <CodeBlock code={baseCss()} file="base.css" generated />
        <CodeBlock
          code={JSON.stringify(tokensJson("—"), null, 2)}
          file="tokens.json"
          generated
        />
      </Section>
    </PageMain>
  );
}
