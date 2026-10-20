import type { Metadata } from "next";
import { ICONS, Icon, LUCIDE_VERSION, PageMain, PageTitle } from "@tech-iki/design";
import { CodeBlock } from "@/components/code-block";
import { Mono } from "@/components/rich";
import { P, Section } from "@/components/section";

export const metadata: Metadata = {
  title: "Icons",
  description:
    "Every icon name the package exports, at the one size it is drawn for.",
};

const USE = `<Icon name="settings" />

{/* an icon-only button: the glyph is aria-hidden, the name is the text */}
<Button variant="icon" title="Settings">
  <Icon name="settings" />
  <span className="sr-only">Settings</span>
</Button>`;

const entries = Object.entries(ICONS).sort(([a], [b]) => a.localeCompare(b));
const rail = entries.filter(([, def]) => def.size === 20);
const inline = entries.filter(([, def]) => def.size === 16);

type Entry = (typeof entries)[number];

function Grid({ items, onNavy }: { items: Entry[]; onNavy: boolean }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(([name, def]) => (
        <li
          key={name}
          className="flex items-start gap-3 rounded-md border border-grid bg-paper p-3"
        >
          <div className="flex shrink-0 gap-2">
            <span className="grid size-10 place-items-center rounded-md bg-paper-tint text-ink">
              <Icon name={name as keyof typeof ICONS} />
            </span>
            {onNavy ? (
              <span className="grid size-10 place-items-center rounded-md bg-navy text-paper">
                <Icon name={name as keyof typeof ICONS} />
              </span>
            ) : null}
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="font-mono text-xs font-semibold text-ink">{name}</span>
            <span className="font-mono text-xs text-ink-muted">{def.source}</span>
            <span className="text-xs text-ink">{def.meaning}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function IconsPage() {
  return (
    <PageMain variant="readable">
      <PageTitle
        title="Icons"
        description="Lucide drawings, vendored by a generator into a typed Icon. There are two sizes and no others, and every name is drawn at exactly one of them."
      />

      <Section title="What an icon is">
        <P>
          The drawings are Lucide (ISC licence), version{" "}
          <Mono>{LUCIDE_VERSION}</Mono>, copied in by the generator rather than
          imported, so the package carries no icon dependency. Two sizes:{" "}
          <Mono>16px</Mono> at a <Mono>1.5</Mono> stroke for rows and inline
          use, and <Mono>20px</Mono> at <Mono>1.4</Mono> for the rail. Caps and
          joins are round, the colour is <Mono>currentColor</Mono>, the glyph
          is <Mono>aria-hidden</Mono>, and the component is server-safe: no
          client JavaScript.
        </P>
        <P>
          Two judgements are kept from the hand-drawn set and held by test.{" "}
          <Mono>settings</Mono> is two sliders, not a cog: a cog’s teeth turn
          to fuzz at 20px on navy. <Mono>drop</Mono> is an arrow into an open
          tray, not a bin: a bin would promise a destruction the app does not
          perform, because the task goes to Trash and can be restored.
        </P>
        <CodeBlock code={USE} />
      </Section>

      <Section title="20px, the rail">
        <P>
          Drawn on paper and, because the rail is where they live, on navy.
        </P>
        <Grid items={rail} onNavy />
      </Section>

      <Section title="16px, rows and inline">
        <Grid items={inline} onNavy={false} />
      </Section>
    </PageMain>
  );
}
