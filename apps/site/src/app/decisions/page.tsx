import type { Metadata } from "next";
import {
  COLOUR,
  PageMain,
  PageTitle,
  THRESHOLD,
  contrast,
  linkClass,
} from "@tech-iki/design";
import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { Mono, Rich } from "@/components/rich";
import { RatioCell, Verdict, formatRatio, passes } from "@/components/ratio";
import { BulletList, Eyebrow, P, Section } from "@/components/section";
import { Swatch } from "@/components/swatch";

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
/** The rejected values Work OS’s email once hard-coded; the reversed list names them. */
const EMAIL_LINK_TEAL = "#0f766e";
const EMAIL_INK = "#0f172a";

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

/** A ratio on white, as the document prints it. */
const onWhite = (hex: string) => formatRatio(contrast(hex, COLOUR.paper));

/** Design-system §14, as it stood on 23 September 2026. These are Work OS's drift, not the package's. */
const DRIFT: [drift: string, where: string, fix: string][] = [
  [
    "The login inputs and the import page’s inputs hand-write their field classes, so they lack the 44px floor; the login labels are `text-sm` where every other label is `text-xs`",
    "`login-form.tsx`, `import-manager.tsx`",
    "Use `fieldClass`/`labelClass`, or record why the login page differs",
  ],
  [
    "The column-resize handle is the only control with `focus-visible:outline-none` and a fill instead of a ring, with no comment saying why",
    "`column-resizer.tsx`",
    "Either `focusRingOnNavy` with an inset offset, or write the geometric reason down",
  ],
  [
    "The rail’s `white/50`, `/70` and `/75` text pairs render but are not in `TOKEN_PAIRS`; all pass, the 11px headings by 0.09",
    "`app-sidebar.tsx`",
    "Add them; the file claims the list is complete",
  ],
  [
    "Confirmations are plain text while refusals carry `role=\"alert\"`, so a screen reader hears what failed and not what worked",
    "`tasks-manager.tsx`",
    "`role=\"status\"` on the success notice",
  ],
  [
    "The workstream chip is copied three times and one copy wraps a task reference, not a workstream code",
    "dashboard, workstreams, Summary",
    "Extract a component, and decide which identifier gets a chip",
  ],
  [
    "The import summary chips are a third KPI-tile shape",
    "`import-manager.tsx`",
    "Give `KpiTile` a compact size",
  ],
  [
    "11px is used at eight sites and 10px at one, but neither is a token; the section `h2` is `text-sm` on data pages and `text-base` on the guide, with no written rule",
    "several",
    "Decide, then write it here",
  ],
  [
    "Two policy-board controls have no 44px floor below `md`: the column header toggle and the card’s reference button",
    "`policy-board.tsx`",
    "`touchTarget`",
  ],
  [
    "The policy panel’s feedback textarea is `smallFieldClass` copied by hand, without its touch floor; the Move to… menu items restate the popover option class with different padding and layout; the card title is a link in behaviour but not `linkClass`",
    "`policy-panel.tsx`, `policy-board.tsx`",
    "Import the shared strings",
  ],
  [
    "The policy board has no phone layout: a fixed 1140px grid scrolls sideways at every width",
    "`policy-board.tsx`",
    "Decide whether column focus is the phone route, and write it down",
  ],
];

/** Design-system §15, “Reversed — do not re-adopt”: the rule in bold, then why. */
const REVERSED: [what: string, why: string][] = [
  ["The navy `PageTitle` band", "with a sky description strip. Removed once the rail carried navy."],
  ["The login card’s navy band.", "The mark cannot sit on navy."],
  ["“Teal: white text for large/bold only.”", "Stated in ADR 0003 and never honoured; `text-sm font-semibold` is not WCAG large text."],
  ["“Passes AA at 4.5:1 throughout.”", "The pills did; the chrome did not."],
  ["`focus:outline-none` with a 1px border change", "as the focus style."],
  ["Alpha row tints", "(`teal-soft/40`, `health-overdue-bg/30`) — see Colour."],
  ["Zebra via `:nth-child`.", "It inverted banding under injected rows and erased state tints."],
  ["Nine columns hidden by default.", ""],
  ["Native `<select>` as the cell editor.", ""],
  [`The email link teal \`${EMAIL_LINK_TEAL}\` and ink \`${EMAIL_INK}\`,`, "both Tailwind lookalikes."],
  ["`[page\\:report] table`", "as an attribute selector — it matched nothing."],
  ["The scaffold’s Vercel favicon,", "which survived three weeks because every eye was on what the change added."],
];

/** Design-system §15, every row, in the document’s order. */
const REGISTER: [date: string, source: string, decision: string, settled: string][] = [
  ["2026-07-23", "ADR 0001", "UI would be Tailwind + shadcn/ui", "**Revised**: shadcn was never installed"],
  ["2026-07-24", "ADR 0003 (#31)", "Adopt the workbook’s palette as Tailwind v4 `@theme` tokens", "Staff read both during the transition; the colours already mean something to them"],
  ["2026-07-24", "ADR 0003", "Dark mode dropped; light only", "A parallel theme doubles every decision for no demand"],
  ["2026-07-24", "ADR 0003", "No component library", "A themed library would fight the workbook look"],
  ["2026-07-24", "ADR 0003", "Remove the scaffold’s Arial override", "Geist was loaded and never applied"],
  ["2026-07-24", "#32", "Status colour lives in one map, exhaustively tested", "Four components had drifted; My tasks omitted two health flags"],
  ["2026-07-24", "#41", "One full-width `PageMain`, `readable` for prose", "Eight per-page wrappers ranged from `max-w-3xl` to `6xl`"],
  ["2026-07-29", "ADR 0006 (#56)", "Airtable is the interaction model", "42% of the grid off-screen at 1440px; a header that never stuck; row heights varying 2.1×"],
  ["2026-07-29", "ADR 0006 (#58)", "Navy demoted to app furniture", "A second navy field competed with the status colours"],
  ["2026-07-29", "ADR 0006 (#57)", "Add `teal-deep` and `grid-strong`; keep the originals for decoration", "teal 4.11:1, grid 1.36:1, neutral pill 4.02:1 — measured on the running app"],
  ["2026-07-29", "ADR 0006 (#57)", "Contrast is asserted by test, not claimed in prose", "ADR 0003’s “AA-safe throughout” was false for the chrome"],
  ["2026-07-29", "ADR 0006 (#57)", "One focus indicator, defined once", "The compiled stylesheet contained zero `:focus-visible` rules"],
  ["2026-07-29", "#58", "Left rail replaces a seven-link strip; collapse in a cookie", "The old nav wrapped to three rows at 375px"],
  ["2026-07-29", "#58", "Sticky headers only inside a bounded frame", "The frame was 3,961px tall and never scrolled"],
  ["2026-07-30", "#59, #69", "Frozen columns; row backgrounds opaque", "`teal-soft/40` flattened to 1.04:1 and showed the scroll through the pinned cells"],
  ["2026-07-30", "#61", "One record drawer for create, edit and history", "A 14-field form shoved the grid off the page"],
  ["2026-07-31", "#62", "Saved views, listed in the rail, addressed by slug", "Somebody rebuilt the same filter by hand before every meeting"],
  ["2026-07-31", "#63", "Phone cards; a 44px touch floor below `md`", "14% of the grid visible at 375px; controls about 26px tall"],
  ["2026-08-02", "#86", "Every column shows by default", "Hiding nine “was sound about pixels and wrong about people” — **reverses #59**"],
  ["2026-08-03", "ADR 0007 (#93)", "The grid gets a cursor; one tab stop; sheet skin", "2,881 focusable elements in the table body"],
  ["2026-08-03", "#95", "One-click choosers; icon-only row actions; hand-drawn icons", "A status change took four clicks; Safari has no `select.showPicker()`"],
  ["2026-08-04", "#98", "The cell is the unit: hover and cursor both on the `<td>`", "A hover ring inset 9/35/5/9px; a 172px input in a 216px cell"],
  ["2026-08-13", "#141, #143", "Lockup on the login card; the mark alone in the rail", "The mark is 1.42:1 on navy; the lockup’s small line smears below ~48px"],
  ["2026-08-15", "#165", "The scroll frame is `relative`, not `contain: paint`", "3,031px of phantom scroll; `contain` would trap the fixed popovers"],
  ["2026-08-22", "#167", "The email palette is named and held against the stylesheet", "The link teal was Tailwind’s teal-700"],
  ["2026-09-06", "#215", "A print stylesheet, not a PDF library; a named page box", "Chrome honours it; Safari has no `page` property at all"],
  ["2026-09-09", "#230", "A visible Safari print hint on the meeting page", "An A5-landscape control page still opened A4 portrait"],
  ["2026-10-14", "#413", "The Summary page’s Safari print hint removed", "Brian judged it noise above a now-compact agenda — **reverses #230** for that page; the policy print hints stay"],
  ["2026-09-10", "#241", "Email ink is the app’s ink; every email colour is guarded", "The guard covered two of five constants"],
  ["2026-09-10", "#242", "Pill tones come only from `ui-colors.ts`", "One pill still used the 4.02:1 pair ADR 0006 said was gone"],
  ["2026-09", "#217–#219", "The policy board: six kanban columns, drag-and-drop with a Move to… menu as its keyboard route, filters in the URL", "—"],
  ["2026-09-18", "#248", "`Pill.tone` is a typed union; the source scan is retired", "A type error cannot be satisfied by a comment or a runtime-built string"],
  ["2026-09-19", "#246", "The table guard scans `src/app` too; the dashboard’s workstream table stacks below `md`", "Its eight nowrap header cells alone were 820px, three times a 269px phone frame"],
  ["2026-09-23", "#261", "A pill is always one line, and every fixed-width pill column derives its width from its labels", "“Awaiting Input” clipped by 3px in the grid and spilled 30px over the next column on the printed report"],
];

export default function DecisionsPage() {
  return (
    <PageMain variant="readable">
      <PageTitle
        title="Decisions"
        description="What is still open, what was reversed and must not come back, and the register of every decision with what settled it."
      />

      <Section title="Open">
        <P>
          These are the five open questions in §16 of the design-system
          document. The first is Brian’s to decide.
        </P>

        <div className="flex flex-col gap-3">
          <Eyebrow>1. The colour families across IKI surfaces</Eyebrow>
          <P>
            Measured on 10 September 2026 from the assets and stylesheets.
            These are facts, not a decision.
          </P>
          <DataTable
            label="Colour families across IKI surfaces"
            scrollable
            columns={[
              { header: "Surface" },
              { header: "Colour" },
              { header: "Hex" },
              { header: "Hue / saturation / lightness" },
            ]}
            rows={FAMILIES.flatMap((f) =>
              f.colours.map((c) => [
                f.surface,
                c.name,
                <Mono key="hex">{c.hex}</Mono>,
                c.hsl,
              ]),
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

          <p className="max-w-3xl text-sm font-semibold text-ink">
            Three observations worth carrying
          </p>
          <BulletList
            items={[
              <Rich key="logo">
                The logo shares no hue with any app. The app palette came from the workbook, not the logo (ADR 0003), and teal has no counterpart anywhere in the mark.
              </Rich>,
              <Rich key="hue">
                {`The website’s lagoon \`${WEBSITE_LAGOON_GREEN}\` and Work OS’s \`teal\` \`${COLOUR.teal}\` are the **same hue**, 181°, differing only in saturation and lightness. They are the closest pair across the families.`}
              </Rich>,
              <Rich key="ratio">
                {`The website’s \`${WEBSITE_LAGOON_GREEN}\` is ${onWhite(WEBSITE_LAGOON_GREEN)} on white — below AA for text (${THRESHOLD.text}:1). Work OS hit the same wall with \`${COLOUR.teal}\` (${onWhite(COLOUR.teal)}) and answered it with \`teal-deep\` \`${COLOUR["teal-deep"]}\` at ${onWhite(COLOUR["teal-deep"])}.`}
              </Rich>,
            ]}
          />

          <p className="max-w-3xl text-sm font-semibold text-ink">
            The options
          </p>
          <BulletList
            ordered
            items={[
              <Rich key="a">
                **(a)** The apps keep navy and teal, and the website’s accent moves to `teal-deep` for text while keeping lagoon for decoration — the smallest change, and it fixes an existing contrast failure.
              </Rich>,
              <Rich key="b">
                **(b)** The apps adopt the website’s Pacific blue and lagoon, which re-opens every contrast pair and every workbook association staff already read.
              </Rich>,
              <Rich key="c">
                **(c)** Leave all three and treat the logo as the only shared mark.
              </Rich>,
            ]}
          />
          <p className="max-w-3xl text-sm text-ink">
            <span className="font-semibold">For Brian to decide.</span> The
            design-system document describes (a)’s palette without choosing,
            and so does this site. The website’s accent failing AA is the part
            with a deadline attached to it.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Eyebrow>2. Whether the logo’s indigo should become a token</Eyebrow>
          <P>
            Every app colour comes from the workbook; the login card is the
            only place the logo’s own hue appears. The nautilus mark is{" "}
            {formatRatio(contrast(LOGO_INDIGO, COLOUR.navy))} against{" "}
            <Mono>navy</Mono>, which is why the mark alone sits on navy only as
            the white reverse. Open: whether the indigo should ever be a token
            of its own.
          </P>
        </div>

        <div className="flex flex-col gap-3">
          <Eyebrow>3. Whether “no motion” is a decision or an absence</Eyebrow>
          <P>
            Nothing animates and nothing needs a reduced-motion guard. A
            consumer that adds transitions inherits no rule, so the rule should
            be written before that happens. See{" "}
            <Link href="/layout" className={linkClass}>
              Layout
            </Link>
            .
          </P>
        </div>

        <div className="flex flex-col gap-3">
          <Eyebrow>4. Known drift inside Work OS</Eyebrow>
          <P>
            True on <Mono>main</Mono> at 23 September 2026 (
            <Mono>3acb50b</Mono>), less the two rows #265 fixed on 24
            September. These are Work OS’s, not this package’s: a consumer
            should copy the rule, not the exception. Each is a candidate for
            its own issue.
          </P>
          <DataTable
            label="Known drift inside Work OS"
            scrollable
            columns={[
              { header: "Drift" },
              { header: "Where" },
              { header: "Fix" },
            ]}
            rows={DRIFT.map(([drift, where, fix]) => [
              <Rich key="drift">{drift}</Rich>,
              <Rich key="where">{where}</Rich>,
              <Rich key="fix">{fix}</Rich>,
            ])}
          />
        </div>

        <div className="flex flex-col gap-3">
          <Eyebrow>5. Whether the F-series labels should be mapped in-repo</Eyebrow>
          <P>
            The code’s reasoning cites F13, F24.2 and so on; the feature list
            stops at F11 and the rest resolve only on GitHub.
          </P>
        </div>
      </Section>

      <Section title="Reversed — do not re-adopt">
        <BulletList
          items={REVERSED.map(([what, why]) => (
            <span key={what}>
              <span className="font-semibold">
                <Rich>{what}</Rich>
              </span>{" "}
              <Rich>{why}</Rich>
            </span>
          ))}
        />
      </Section>

      <Section title="Decision register">
        <DataTable
          label="Decision register"
          scrollable
          columns={[
            { header: "Date" },
            { header: "Source" },
            { header: "Decision" },
            { header: "What settled it" },
          ]}
          rows={REGISTER.map(([date, source, decision, settled]) => [
            <span key="date" className="whitespace-nowrap tabular-nums">
              {date}
            </span>,
            source,
            <Rich key="decision">{decision}</Rich>,
            <Rich key="settled">{settled}</Rich>,
          ])}
        />
      </Section>
    </PageMain>
  );
}
