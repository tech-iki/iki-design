import type { Metadata } from "next";
import Link from "next/link";
import pkg from "@tech-iki/design/package.json" with { type: "json" };
import {
  FONT,
  PageMain,
  PageTitle,
  baseCss,
  linkClass,
  resetCss,
  themeCss,
  tokensCss,
  tokensJson,
} from "@tech-iki/design";
import { CodeBlock } from "@/components/code-block";
import { Mono, Rich } from "@/components/rich";
import { BulletList, Eyebrow, P, Section } from "@/components/section";
import { DOC } from "@/lib/design-doc";

export const metadata: Metadata = {
  title: "Adopt",
  description:
    "How to install the design system with Tailwind v4, plain CSS or the components, the opt-in reset for an app without Preflight, what a consumer must respect, and the generated stylesheets verbatim.",
};

const TAILWIND = `@import "tailwindcss";
@import "@tech-iki/design/theme.css";`;

/** An app that omits Preflight: the layer order first, so base sits under utilities, then the imports. */
const RESET_IMPORT = `@layer theme, base, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);
@import "@tech-iki/design/theme.css";
@import "@tech-iki/design/reset.css";`;

/** `iki-reset` goes on <body> so the portalled overlays are reached; `iki-app` stays a child of it. */
const RESET_BODY = `<body className="iki-reset">
  <div className="iki-app">{children}</div>
</body>`;

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

const GIT_TAG = `"@tech-iki/design": "https://github.com/tech-iki/iki-design/releases/download/v0.5.0/tech-iki-design-0.5.0.tgz"`;

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

      <Section title="Without Preflight">
        <P>
          The components assume Tailwind’s Preflight, which{" "}
          <Mono>@import &quot;tailwindcss&quot;</Mono> brings with it. An app
          that leaves it out gets the browser’s border and grey fill on every
          button and its margins on every paragraph in a{" "}
          <Mono>Notice</Mono>. Import Preflight, or opt in to{" "}
          <Mono>reset.css</Mono>: eight rules, each the value Preflight sets
          for those elements, scoped to <Mono>.iki-reset</Mono>. An app that
          has Preflight imports nothing and sees no change.
        </P>
        <CodeBlock code={RESET_IMPORT} file="globals.css" />
        <P>
          Put <Mono>iki-reset</Mono> on <Mono>&lt;body&gt;</Mono>, not on the
          page shell: <Mono>Drawer</Mono>, <Mono>Menu</Mono>,{" "}
          <Mono>Popover</Mono>, <Mono>Combobox</Mono> and{" "}
          <Mono>Tooltip</Mono> are portalled to <Mono>&lt;body&gt;</Mono>, and a
          reset on the shell would not reach them. It is a different element
          from the <Mono>iki-app</Mono> stacking root, which stays a child of{" "}
          <Mono>&lt;body&gt;</Mono>.
        </P>
        <CodeBlock code={RESET_BODY} file="app/layout.tsx" />
        <P>
          The table in design system §13e sets each rule against the Preflight
          rule it mirrors, the package classes that lean on it, and the copy
          the Digital Library carries today.
        </P>
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
          The components come from the package root, with the tones, the class
          strings and the contrast arithmetic. Most are server-safe and ship no
          client JavaScript. The overlays, <Mono>Tooltip</Mono>,{" "}
          <Mono>Tabs</Mono> and <Mono>Combobox</Mono> carry{" "}
          <Mono>&quot;use client&quot;</Mono>, so a Server Component can render
          them but they are shipped to the browser; all of them except{" "}
          <Mono>Disclosure</Mono> are built on Base UI.{" "}
          <Link href="/components" className={linkClass}>
            Components
          </Link>
          ,{" "}
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
          items={DOC.constraints.map((constraint) => (
            <Rich key={constraint}>{constraint}</Rich>
          ))}
        />
      </Section>

      <Section title="The generated files">
        <P>
          These are the package’s outputs, produced here by calling the same
          functions that write <Mono>dist/</Mono>. Edit{" "}
          <Mono>tokens.ts</Mono>, never these. The JSON block is stamped with
          the package’s version.
        </P>
        <CodeBlock code={themeCss()} file="theme.css" generated />
        <CodeBlock code={tokensCss()} file="tokens.css" generated />
        <CodeBlock code={baseCss()} file="base.css" generated />
        <CodeBlock code={resetCss()} file="reset.css" generated />
        <CodeBlock
          code={JSON.stringify(tokensJson(pkg.version), null, 2)}
          file="tokens.json"
          generated
        />
      </Section>
    </PageMain>
  );
}
