import type { Metadata } from "next";
import Link from "next/link";
import {
  BREAKPOINTS_PX,
  MOTION,
  PageMain,
  PageTitle,
  RADIUS_PX,
  TOUCH_TARGET_PX,
  VIEWPORTS_PX,
  Z_INDEX,
  linkClass,
} from "@tech-iki/design";
import { DataTable } from "@/components/data-table";
import { Mono, Rich } from "@/components/rich";
import { BulletList, P, Section } from "@/components/section";
import { DOC } from "@/lib/design-doc";

export const metadata: Metadata = {
  title: "Layout",
  description:
    "Spacing, radius, borders, elevation, layering, breakpoints and the absence of motion.",
};

/** Tailwind's spacing step. There are no spacing tokens; the scale is the default. */
const SPACING_UNIT_PX = 4;

const SPACING: { n: number; gap: string; bar: string; use: string }[] = [
  { n: 1, gap: "gap-1", bar: "w-1", use: "Inside a control" },
  { n: 2, gap: "gap-2", bar: "w-2", use: "The default between siblings" },
  { n: 3, gap: "gap-3", bar: "w-3", use: "Between fields" },
  { n: 4, gap: "gap-4", bar: "w-4", use: "In a form" },
  { n: 6, gap: "gap-6", bar: "w-6", use: "Between page sections" },
  { n: 8, gap: "gap-8", bar: "w-8", use: "Between page sections" },
];

type RadiusName = keyof typeof RADIUS_PX;

/*
 * Each radius as the document writes its class, and the class its sample is
 * drawn with. They differ only for `sm`, which the document writes as the bare
 * `rounded` (4px), as Work OS does. The sample stays a literal because
 * Tailwind generates only the classes it finds in the site's source and never
 * reads the document.
 */
const RADIUS_CLASS: Record<RadiusName, { doc: string; sample: string }> = {
  xs: { doc: "rounded-xs", sample: "rounded-xs" },
  sm: { doc: "rounded", sample: "rounded-sm" },
  md: { doc: "rounded-md", sample: "rounded-md" },
  lg: { doc: "rounded-lg", sample: "rounded-lg" },
  full: { doc: "rounded-full", sample: "rounded-full" },
};

/** The document's radius rows, one per package radius, in the package's order. */
const RADIUS = (Object.keys(RADIUS_PX) as RadiusName[]).map((name) => {
  const cls = RADIUS_CLASS[name].doc;
  const row = DOC.radius.find(([c]) => c.replace(/`/g, "") === cls);
  if (!row) throw new Error(`Radius "${name}" (${cls}) has no row in the design-system document`);
  // `full` has no pixel size; the document writes a dash.
  const px = name === "full" ? "—" : String(RADIUS_PX[name]);
  if (row[1] !== px) {
    throw new Error(`Radius ${cls} is ${px} in the package and ${row[1]} in the document`);
  }
  return { name, cls, where: row[2] };
});
for (const [c] of DOC.radius) {
  if (!RADIUS.some((r) => r.cls === c.replace(/`/g, ""))) {
    throw new Error(`The document's radius ${c} has no matching package radius`);
  }
}

const ELEVATION: { name: string; cls: string; use: string }[] = [
  {
    name: "Border only",
    cls: "",
    use: "Anything fixed in place: cards, tables, panels.",
  },
  {
    name: "shadow-sm",
    cls: "shadow-sm",
    use: "The login card, floating on a tinted page, and the policy card — the one resting object that can be picked up and dragged.",
  },
  {
    name: "shadow-lg",
    cls: "shadow-lg",
    use: "Popovers and cell pickers.",
  },
  {
    name: "shadow-2xl",
    cls: "shadow-2xl",
    use: "The record drawer.",
  },
];

type ZName = keyof typeof Z_INDEX;

/**
 * The document's layering rows, joined to the package by the number in the
 * class (`z-50`, or `z-[1]`), highest first.
 */
const LAYER = (Object.keys(Z_INDEX) as ZName[])
  .sort((a, b) => Z_INDEX[b] - Z_INDEX[a])
  .map((name) => {
    const row = DOC.layers.find(
      ([c]) => zValue(c) === Z_INDEX[name],
    );
    if (!row) throw new Error(`Layer "${name}" (${Z_INDEX[name]}) has no row in the design-system document`);
    return { name, cls: row[0], what: row[1] };
  });
for (const [c] of DOC.layers) {
  if (!LAYER.some((l) => l.cls === c)) {
    throw new Error(`The document's layer ${c} has no matching package layer`);
  }
}

/** `z-50` → 50, `z-[1]` → 1. */
function zValue(cell: string): number {
  const m = /^`z-(?:(\d+)|\[(\d+)\])`$/.exec(cell);
  if (!m) throw new Error(`Not a z-index class: ${cell}`);
  return Number(m[1] ?? m[2]);
}

type BreakpointName = keyof typeof BREAKPOINTS_PX;

const BREAKPOINT = (Object.keys(BREAKPOINTS_PX) as BreakpointName[]).map(
  (prefix) => {
    const row = DOC.breakpoints.find(([c]) => c.replace(/`/g, "") === prefix);
    if (!row) throw new Error(`Breakpoint "${prefix}" has no row in the design-system document`);
    if (row[1] !== `${BREAKPOINTS_PX[prefix]}px`) {
      throw new Error(
        `Breakpoint ${prefix} is ${BREAKPOINTS_PX[prefix]}px in the package and ${row[1]} in the document`,
      );
    }
    return { prefix, what: row[2] };
  },
);
for (const [c] of DOC.breakpoints) {
  if (!BREAKPOINT.some((b) => b.prefix === c.replace(/`/g, ""))) {
    throw new Error(`The document's breakpoint ${c} has no matching package breakpoint`);
  }
}

export default function LayoutPage() {
  return (
    <PageMain variant="readable">
      <PageTitle
        title="Layout"
        description="Spacing, shape, elevation and layering are Tailwind’s defaults with a short list of rules. None of them is a token; all of them are written down."
      />

      <Section title="Spacing">
        <BulletList
          items={[
            <Rich key="scale">
              {`Tailwind’s default ${SPACING_UNIT_PX}px scale. There are no spacing tokens.`}
            </Rich>,
            <Rich key="gap">
              Flex and grid `gap` are the only sibling-spacing mechanism. There is no `space-x-*` or `space-y-*` anywhere.
            </Rich>,
            <Rich key="cell">
              Cell padding is `px-3 py-2`. Sheet cells halve the vertical to `py-1` while keeping `px-3`, so cell text stays aligned with the header labels.
            </Rich>,
            <Rich key="page">
              Page padding is `px-6 py-8 lg:px-8`, which `PageMain` supplies.
            </Rich>,
          ]}
        />
        <DataTable
          label="The gap steps in use"
          scrollable
          columns={[
            { header: "Class" },
            { header: "Size", numeric: true },
            { header: "Step" },
            { header: "Used for" },
          ]}
          rows={SPACING.map((s) => [
            <Mono key="cls">{s.gap}</Mono>,
            `${s.n * SPACING_UNIT_PX}px`,
            <span
              key="bar"
              aria-hidden="true"
              className={`block h-3 rounded-xs bg-teal-deep ${s.bar}`}
            />,
            s.use,
          ])}
        />
      </Section>

      <Section title="Radius and borders">
        <DataTable
          label="Border radius"
          scrollable
          columns={[
            { header: "Name" },
            { header: "Class" },
            { header: "Size", numeric: true },
            { header: "Sample" },
            { header: "Where" },
          ]}
          rows={RADIUS.map(({ name, cls, where }) => [
            <Mono key="name">{name}</Mono>,
            <Mono key="cls">{cls}</Mono>,
            name === "full" ? "full" : `${RADIUS_PX[name]}px`,
            <span
              key="sample"
              aria-hidden="true"
              className={`block h-8 w-14 border border-grid-strong bg-teal-soft ${RADIUS_CLASS[name].sample}`}
            />,
            <Rich key="where">{where}</Rich>,
          ])}
        />
        <P>
          Borders are 1px everywhere; a 2px border appears nowhere. Anything
          thicker is an <Mono>outline</Mono>, so it does not shift layout when
          it appears and can be drawn inside a box with a negative offset.
        </P>
      </Section>

      <Section title="Elevation">
        <P>
          A short ladder. Depth is reserved for what is over the page or can be
          lifted off it.
        </P>
        <ol className="grid gap-4 rounded-md bg-paper-tint p-4 sm:grid-cols-2">
          {ELEVATION.map((e) => (
            <li
              key={e.name}
              className={`flex flex-col gap-1 rounded-md border border-grid bg-paper p-4 ${e.cls}`}
            >
              <span className="font-mono text-xs font-semibold text-ink">
                {e.name}
              </span>
              <span className="text-xs text-ink-muted">{e.use}</span>
            </li>
          ))}
        </ol>
        <P>
          The one custom shadow is navy-tinted and conditional: it falls from
          the last frozen column, and only while the grid is scrolled sideways.
          The drawer’s scrim is <Mono>bg-navy/25</Mono>, not black.
        </P>
      </Section>

      <Section title="Layering">
        <DataTable
          label="The z-index layers"
          scrollable
          columns={[
            { header: "Layer" },
            { header: "Class" },
            { header: "Value", numeric: true },
            { header: "What" },
          ]}
          rows={LAYER.map(({ name, cls, what }) => [
            <Mono key="name">{name}</Mono>,
            <Rich key="cls">{cls}</Rich>,
            String(Z_INDEX[name]),
            <Rich key="what">{what}</Rich>,
          ])}
        />
        <P>
          <Mono>TableFrame</Mono>’s own sticky rule carries no z-index on
          purpose: as a descendant selector it out-specifies a utility, and a{" "}
          <Mono>z-10</Mono> there silently beat the grid’s frozen headers.
        </P>
      </Section>

      <Section title="Breakpoints">
        <P>
          Tailwind’s defaults, unmodified. <Mono>xl</Mono> and{" "}
          <Mono>2xl</Mono> are never used.
        </P>
        <DataTable
          label="Breakpoints and what changes at each"
          scrollable
          columns={[
            { header: "Prefix" },
            { header: "Min width", numeric: true },
            { header: "What changes" },
          ]}
          rows={BREAKPOINT.map(({ prefix, what }) => [
            <Mono key="p">{prefix}</Mono>,
            `${BREAKPOINTS_PX[prefix]}px`,
            <Rich key="what">{what}</Rich>,
          ])}
        />
        <BulletList
          items={[
            `The design-target viewport is ${VIEWPORTS_PX.desktop.width}px wide. The phone reference is ${VIEWPORTS_PX.phone.width} × ${VIEWPORTS_PX.phone.height}.`,
            <Rich key="css">
              Both layouts are always rendered and toggled with CSS (`md:hidden` and `hidden md:block`), never by measuring the viewport in JavaScript, so everything is server-rendered and cannot mismatch on hydration.
            </Rich>,
            <span key="touch">
              The touch floor is {TOUCH_TARGET_PX}px below <Mono>md</Mono>.{" "}
              <Link href="/controls" className={linkClass}>
                Controls
              </Link>{" "}
              shows it.
            </span>,
          ]}
        />
      </Section>

      <Section title={`Motion: ${MOTION}`}>
        <P>
          Nothing animates. The system has no transitions, durations,
          animations or keyframes, and the overlays add none: one frame in,
          one frame out. State changes are instant colour swaps,{" "}
          <Mono>opacity-50</Mono> when disabled, <Mono>opacity-60</Mono> while
          a cell commits, and a ring on focus.
        </P>
        <P>
          The rule is written. A transition is allowed only with a{" "}
          <Mono>motion-reduce:</Mono> counterpart on the class that removes
          it. <Mono>base.css</Mono> and <Mono>theme.css</Mono> ship a global{" "}
          <Mono>prefers-reduced-motion</Mono> reset that cuts animation and
          transition durations to almost nothing and turns smooth scrolling
          off, so a consumer inherits that floor from the stylesheet it already
          imports. The counterpart is still required: the reset is a floor, not
          a design.
        </P>
      </Section>
    </PageMain>
  );
}
