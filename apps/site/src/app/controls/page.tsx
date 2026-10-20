import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  KpiTile,
  PageMain,
  PageTitle,
  TOUCH_TARGET_PX,
  cellCursor,
  cellHover,
  fieldClass,
  focusRing,
  focusRingOnNavy,
  iconButtonClass,
  invalidFieldClass,
  labelClass,
  linkClass,
  primaryButtonClass,
  smallFieldClass,
  subtleButtonClass,
  touchTarget,
  warnButtonClass,
  warnIconButtonClass,
} from "@tech-iki/design";
import { CodeBlock } from "@/components/code-block";
import { Mono, Rich } from "@/components/rich";
import { P, Section } from "@/components/section";

export const metadata: Metadata = {
  title: "Controls",
  description:
    "Every control class the package exports, drawn live with the string that makes it, plus the KPI tile and the page title.",
};

/** 16px stroke glyphs: `currentColor`, round caps, `aria-hidden` — the name lives in the button. */
function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

/** One export: its name, the live element, and the class string beneath. */
function Specimen({
  name,
  note,
  classString,
  children,
}: {
  name: string;
  note?: string;
  classString: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-grid bg-paper p-4">
      <h3 className="font-mono text-xs font-semibold text-ink">{name}</h3>
      {note ? (
        <p className="max-w-3xl text-xs text-ink-muted">
          <Rich>{note}</Rich>
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3 py-2">{children}</div>
      <CodeBlock code={classString} />
    </div>
  );
}

/** The sign-out button's on-navy treatment, design-system §8. */
const ON_NAVY_BUTTON = `flex ${touchTarget} items-center justify-center gap-2 rounded-md border border-paper/50 p-1.5 text-sm text-paper/90 hover:bg-paper/10 hover:text-paper ${focusRingOnNavy}`;

const KPI_USE = `<KpiTile label="Overdue" value={3} hint="past their deadline" tone="overdue" />`;

const PAGE_TITLE_USE = `<PageMain variant="readable">
  <PageTitle
    title="Settings"
    description="Rules that apply to everyone's tasks."
  />
  …
</PageMain>`;

export default function ControlsPage() {
  return (
    <PageMain variant="readable">
      <PageTitle
        title="Controls"
        description="There is no component library; these class strings are the library. Each is drawn below exactly as the package exports it."
      />

      <Section title="Buttons">
        <Specimen
          name="primaryButtonClass"
          note="The one action on a surface. Hovers to `navy`, not to a darker teal."
          classString={primaryButtonClass}
        >
          <button type="button" className={primaryButtonClass}>
            Save task
          </button>
          <button type="button" disabled className={primaryButtonClass}>
            Saving…
          </button>
        </Specimen>
        <Specimen
          name="subtleButtonClass"
          note="Everything that is not the main action."
          classString={subtleButtonClass}
        >
          <button type="button" className={subtleButtonClass}>
            Download PDF
          </button>
        </Specimen>
        <Specimen
          name="warnButtonClass"
          note="Destructive but reversible: warm, not alarming, because the task goes to Trash and can be restored."
          classString={warnButtonClass}
        >
          <button type="button" className={warnButtonClass}>
            Move to Trash
          </button>
        </Specimen>
        <Specimen
          name="iconButtonClass"
          note="A row action reduced to its icon: 28px square on a desk, 44px below `md`. The glyph is `aria-hidden`; the name lives in an `sr-only` span and a `title`."
          classString={iconButtonClass}
        >
          <button type="button" title="Edit" className={iconButtonClass}>
            <Glyph>
              <path d="M2.5 13.5l.7-3.2 7.6-7.6a1.4 1.4 0 0 1 2 0l.5.5a1.4 1.4 0 0 1 0 2l-7.6 7.6-3.2.7z" />
            </Glyph>
            <span className="sr-only">Edit</span>
          </button>
        </Specimen>
        <Specimen
          name="warnIconButtonClass"
          note="The same, for an action that withdraws something. The glyph is an arrow into a tray, not a bin: a bin would promise a destruction the app does not perform."
          classString={warnIconButtonClass}
        >
          <button
            type="button"
            title="Move to Trash"
            className={warnIconButtonClass}
          >
            <Glyph>
              <path d="M2.5 9.5v3h11v-3M8 2.5v7M5.5 7l2.5 2.5L10.5 7" />
            </Glyph>
            <span className="sr-only">Move to Trash</span>
          </button>
        </Specimen>
      </Section>

      <Section title="Fields and labels">
        <P>
          The label wraps its control, so the click target includes the label
          and no <Mono>htmlFor</Mono> is needed. Forms are <Mono>gap-4</Mono>;
          a label’s own parts are <Mono>gap-1</Mono>.
        </P>
        <Specimen
          name="labelClass, fieldClass"
          note="Borders use `grid-strong`: a control boundary needs 3:1."
          classString={`${labelClass}\n${fieldClass}`}
        >
          <label className={`${labelClass} w-full max-w-sm`}>
            Task title
            <input
              type="text"
              name="title"
              defaultValue="Draft the quarterly report"
              className={fieldClass}
            />
          </label>
        </Specimen>
        <Specimen name="smallFieldClass" classString={smallFieldClass}>
          <label className={`${labelClass} w-full max-w-sm`}>
            Feedback
            <input
              type="text"
              name="feedback"
              defaultValue="Looks right to me"
              className={smallFieldClass}
            />
          </label>
        </Specimen>
        <Specimen
          name="invalidFieldClass"
          note={
            'A field the last refusal named, drawn so it can be found by scrolling. The reason sits under it as `role="alert"` text in `health-overdue-fg`.'
          }
          classString={invalidFieldClass}
        >
          <div className="flex w-full max-w-sm flex-col gap-1">
            <label className={labelClass}>
              Due date
              <input
                type="text"
                name="due"
                defaultValue="31 Jun 2026"
                aria-invalid="true"
                aria-describedby="due-error"
                className={invalidFieldClass}
              />
            </label>
            <p
              id="due-error"
              role="alert"
              className="text-xs text-health-overdue-fg"
            >
              June has 30 days. Choose a date that exists.
            </p>
          </div>
        </Specimen>
        <P>
          A refused action costs the click, not the page: the form stays, the
          reason appears, the values are kept. Pending state is the verb in
          progress with an ellipsis — “Saving…” — and the button disabled at 50%
          opacity. There are no skeletons and no spinners.
        </P>
      </Section>

      <Section title="Links">
        <Specimen
          name="linkClass"
          note="An inline text link inside body copy or a cell."
          classString={linkClass}
        >
          <p className="text-sm text-ink">
            See the{" "}
            <Link href="/colour" className={linkClass}>
              contrast table
            </Link>{" "}
            for every pair.
          </p>
        </Specimen>
      </Section>

      <Section title="Focus and touch targets">
        <Specimen
          name="focusRing"
          note="The one focus indicator, applied to every interactive class. Press Tab to see it on any control on this page; it appears on `:focus-visible` only."
          classString={focusRing}
        >
          <button type="button" className={subtleButtonClass}>
            Tab to this
          </button>
        </Specimen>
        <Specimen
          name="focusRingOnNavy"
          note="Teal has no contrast on navy, so a control on a navy field rings in white."
          classString={focusRingOnNavy}
        >
          <div className="flex w-full flex-wrap items-center gap-3 rounded-md bg-navy p-4">
            <button type="button" className={ON_NAVY_BUTTON}>
              Sign out
            </button>
          </div>
        </Specimen>
        <Specimen
          name="touchTarget"
          note={`WCAG 2.5.8 wants ${TOUCH_TARGET_PX}px. This is a minimum, not a size, and it applies below \`md\` only, so the desk keeps its density and a thumb gets its room. The dashed box is ${TOUCH_TARGET_PX}px square.`}
          classString={touchTarget}
        >
          <span
            aria-hidden="true"
            className="block rounded-md border border-dashed border-grid-strong bg-paper-tint"
            style={{ width: TOUCH_TARGET_PX, height: TOUCH_TARGET_PX }}
          />
          <span
            className={`${touchTarget} inline-flex items-center justify-center rounded-md border border-grid-strong px-2 text-xs text-ink`}
          >
            Floor of 44px below md
          </span>
        </Specimen>
        <Specimen
          name="cellCursor"
          note="The spreadsheet cursor, drawn inside the cell by a negative offset so a scroll frame cannot clip it. It is applied from the grid’s own state, so it stays when the grid loses focus."
          classString={cellCursor}
        >
          <div className="w-full max-w-xs bg-paper-tint p-3 text-sm text-ink">
            <div className={`${cellCursor} px-3 py-2`}>15 Jul 2026</div>
          </div>
        </Specimen>
        <Specimen
          name="cellHover"
          note="The hover preview: the cursor’s own box, one weight lighter, on the same inset. Hover the cell."
          classString={cellHover}
        >
          <div className="w-full max-w-xs bg-paper-tint p-3 text-sm text-ink">
            <div className={`${cellHover} px-3 py-2`}>15 Jul 2026</div>
          </div>
        </Specimen>
      </Section>

      <Section title="KPI tile">
        <P>
          A teal label bar over a large figure on a light-teal body, mirroring
          the workbook’s summary cells. The tone changes the figure’s colour
          only; the label is always present.
        </P>
        <div className="grid gap-3 sm:grid-cols-3">
          <KpiTile label="Open tasks" value={42} hint="across 6 workstreams" />
          <KpiTile
            label="Due soon"
            value={7}
            hint="in the next 7 days"
            tone="warm"
          />
          <KpiTile
            label="Overdue"
            value={3}
            hint="past their deadline"
            tone="overdue"
          />
        </div>
        <CodeBlock code={KPI_USE} />
      </Section>

      <Section title="Page title">
        <P>
          The page heading is plain type: an h1 and a muted description. It was
          a navy band until the rail carried navy. The sample is hidden from
          assistive technology so it does not add a second h1 to this page.{" "}
          <Mono>PageMain</Mono> is the landmark the skip link targets, with the
          page padding: <Mono>full</Mono> runs the width of the window,{" "}
          <Mono>readable</Mono> keeps a measure for prose.
        </P>
        <div
          aria-hidden="true"
          className="rounded-md border border-grid bg-paper p-4"
        >
          <PageTitle
            title="Settings"
            description="Rules that apply to everyone’s tasks. A change takes effect immediately, on the next thing anybody saves."
          />
        </div>
        <CodeBlock code={PAGE_TITLE_USE} />
      </Section>
    </PageMain>
  );
}
