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

const RADIUS: Record<RadiusName, { cls: string; where: string }> = {
  xs: { cls: "rounded-xs", where: "The focus-ring corner on inline links." },
  sm: {
    cls: "rounded-sm",
    where:
      "Things inside a cell or a panel: chips, cell triggers, option rows. Work OS writes this one as the bare `rounded`.",
  },
  md: {
    cls: "rounded-md",
    where: "The default box: fields, buttons, cards, tables, panels, tiles.",
  },
  lg: { cls: "rounded-lg", where: "The login card, once." },
  full: { cls: "rounded-full", where: "Pills, count badges, the active-nav bar." },
};

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

const LAYER: Record<ZName, { cls: string; what: string }> = {
  skipLink: {
    cls: "z-50",
    what: "The skip link when focused; every overlay portalled to document.body to escape a scroll container — the cell popovers and the Move to… menu.",
  },
  drawer: { cls: "z-40", what: "The record drawer and its scrim." },
  popover: { cls: "z-30", what: "Toolbar popovers." },
  frozenHeader: { cls: "z-20", what: "Frozen header cells." },
  stickyHeader: { cls: "z-10", what: "Header cells and the column-resize handle." },
  frozenBodyCell: { cls: "z-[1]", what: "Frozen body cells, which also inherit their row’s background." },
};

type BreakpointName = keyof typeof BREAKPOINTS_PX;

const BREAKPOINT: Record<BreakpointName, string> = {
  sm: "KPI tiles go from one to two columns; import chips from two to four; guide legend rows go horizontal; the create form goes two-column; record panel field rows become label and value pairs.",
  md: "The touch floor is released; tables stack or become cards; the toolbar collapses into a “Filter & sort” sheet; table minimum widths begin to apply.",
  lg: "The rail widens to 224px with labels; the record drawer becomes a 480px side panel instead of a full-screen sheet; KPI tiles reach four columns.",
};

const PREFIXES = Object.keys(BREAKPOINTS_PX) as BreakpointName[];
const LAYERS = (Object.keys(Z_INDEX) as ZName[]).sort(
  (a, b) => Z_INDEX[b] - Z_INDEX[a],
);

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
          rows={(Object.keys(RADIUS_PX) as RadiusName[]).map((name) => [
            <Mono key="name">{name}</Mono>,
            <Mono key="cls">{RADIUS[name].cls}</Mono>,
            name === "full" ? "full" : `${RADIUS_PX[name]}px`,
            <span
              key="sample"
              aria-hidden="true"
              className={`block h-8 w-14 border border-grid-strong bg-teal-soft ${RADIUS[name].cls}`}
            />,
            <Rich key="where">{RADIUS[name].where}</Rich>,
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
          rows={LAYERS.map((name) => [
            <Mono key="name">{name}</Mono>,
            <Mono key="cls">{LAYER[name].cls}</Mono>,
            String(Z_INDEX[name]),
            LAYER[name].what,
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
          rows={PREFIXES.map((p) => [
            <Mono key="p">{p}</Mono>,
            `${BREAKPOINTS_PX[p]}px`,
            BREAKPOINT[p],
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
          animations or keyframes. State changes are instant colour swaps,{" "}
          <Mono>opacity-50</Mono> when disabled, <Mono>opacity-60</Mono> while
          a cell commits, and a ring on focus.
        </P>
        <P>
          Nothing exists for <Mono>prefers-reduced-motion</Mono> to reduce, so
          there is no global rule to inherit. A consumer that introduces a
          transition must add the reduced-motion counterpart itself.
        </P>
      </Section>
    </PageMain>
  );
}
