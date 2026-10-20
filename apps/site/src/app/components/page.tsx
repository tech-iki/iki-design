import type { Metadata } from "next";
import {
  Button,
  EmptyState,
  Field,
  Icon,
  KpiTile,
  Notice,
  PageMain,
  PageTitle,
} from "@tech-iki/design";
import { CodeBlock } from "@/components/code-block";
import {
  DisclosureSpecimen,
  DrawerSpecimen,
  MenuSpecimen,
  PopoverSpecimen,
} from "@/components/overlay-specimens";
import { Mono } from "@/components/rich";
import { Specimen } from "@/components/specimen";
import { P, Section } from "@/components/section";

export const metadata: Metadata = {
  title: "Components",
  description:
    "Button, Field, Notice, EmptyState, KpiTile, and the four overlays — Drawer, Popover, Menu, Disclosure — drawn live with the usage beneath each.",
};

const BUTTON_USE = `<Button>Save task</Button>
<Button variant="subtle">Download PDF</Button>
<Button variant="warn">Move to Trash</Button>

{/* pending disables the button, sets aria-busy, and says the verb in progress */}
<Button pending>Save</Button>
<Button pending pendingLabel="Sending invitation…">Invite</Button>

{/* the icon variants: a glyph, a name for assistive technology, a title */}
<Button variant="icon" title="Expand">
  <Icon name="expand" />
  <span className="sr-only">Expand</span>
</Button>
<Button variant="warnIcon" title="Move to Trash">
  <Icon name="drop" />
  <span className="sr-only">Move to Trash</span>
</Button>`;

const FIELD_USE = `<Field label="Task title" hint="Shown in lists and on the board.">
  <input type="text" name="title" />
</Field>

<Field label="Due date" error="June has 30 days. Choose a date that exists.">
  <input type="text" name="due" />
</Field>

<Field label="Owner">
  <select name="owner">…</select>
</Field>

<Field label="Notes">
  <textarea name="notes" rows={3} />
</Field>`;

const NOTICE_USE = `<Notice>Changes apply to the next task anybody saves.</Notice>
<Notice tone="positive">Task saved.</Notice>
<Notice tone="warm">This task has no owner yet.</Notice>
<Notice tone="overdue">The task could not be saved. Nothing was changed.</Notice>`;

const EMPTY_USE = `<EmptyState action={<Button>New task</Button>}>
  No tasks yet. Create the first one.
</EmptyState>

<EmptyState>Nothing is overdue.</EmptyState>`;

const DRAWER_USE = `const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>New task</Button>
<Drawer
  open={open}
  onOpenChange={(next, reason) => {
    // reason: "escape" | "scrim" | "close" | "programmatic"
    if (!next && isDirty && reason !== "close") return askToDiscard();
    setOpen(next);
  }}
  onEscape={() => !innerLayerIsOpen}   // false consumes the key
  title="New task"
  subtitle="Saved to the Finance workstream."
  refusal={problem}                     // role="alert" band, when set
  footer={<Button>Save task</Button>}
>
  <Field label="Task title"><input name="title" /></Field>
</Drawer>`;

const POPOVER_USE = `<Popover label="Owner" badge={owners.length} active={owners.length > 0}>
  <PopoverOption>
    <input type="checkbox" checked={…} onChange={…} />
    Amina
  </PopoverOption>
</Popover>

{/* controlled, when a toolbar wants one panel open at a time */}
<Popover label="Health" open={openPanel === "health"} onOpenChange={(o) => setOpenPanel(o ? "health" : null)}>…</Popover>`;

const MENU_USE = `<Menu label="Move to…">
  {STATUSES.map((s) => (
    <MenuItem key={s} disabled={s === current} onSelect={() => move(s)}>
      {s}
    </MenuItem>
  ))}
</Menu>`;

const DISCLOSURE_USE = `<Disclosure
  title="Overdue"
  count={tasks.length}
  blurb="Past their deadline."
  open={isOpen("overdue")}
  onOpenChange={(next) => setOpen("overdue", next)}
  action={<Link href="/tasks?health=overdue" className={linkClass}>Open in Tasks</Link>}
>
  <ul>{tasks.map((t) => <TaskLine key={t.id} task={t} />)}</ul>
</Disclosure>`;

const KPI_USE = `<KpiTile label="Open tasks" value={42} hint="across 6 workstreams" />
<KpiTile label="Due soon" value={7} hint="in the next 7 days" tone="warm" />
<KpiTile label="Overdue" value={3} hint="past their deadline" tone="overdue" />`;

export default function ComponentsPage() {
  return (
    <PageMain variant="readable">
      <PageTitle
        title="Components"
        description="The components the consumers’ counts asked for (plan of 20 October 2026): the shapes four apps had each written by hand. Each is drawn live, with its usage beneath."
      />

      <Section title="Button">
        <P>
          One component for the five control classes. <Mono>variant</Mono>{" "}
          defaults to <Mono>primary</Mono> and <Mono>type</Mono> to{" "}
          <Mono>button</Mono>, so a button never submits a form by accident.
          Every other prop goes to the element.
        </P>
        <Specimen name="variant" note="The five variants, in order of weight.">
          <Button>Save task</Button>
          <Button variant="subtle">Download PDF</Button>
          <Button variant="warn">Move to Trash</Button>
          <Button variant="icon" title="Expand">
            <Icon name="expand" />
            <span className="sr-only">Expand</span>
          </Button>
          <Button variant="warnIcon" title="Move to Trash">
            <Icon name="drop" />
            <span className="sr-only">Move to Trash</span>
          </Button>
        </Specimen>
        <Specimen
          name="pending, disabled"
          note="`pending` disables the button, sets `aria-busy`, and shows the verb in progress: a string child “Save” becomes “Save…”. `pendingLabel` overrides it. A plain `disabled` keeps its label."
        >
          <Button pending>Save</Button>
          <Button pending pendingLabel="Sending invitation…">
            Invite
          </Button>
          <Button disabled>Save task</Button>
        </Specimen>
        <CodeBlock code={BUTTON_USE} />
      </Section>

      <Section title="Field">
        <P>
          A label that wraps one control, with the hint and the error beside
          the label rather than inside it, so the field’s name stays the label
          alone. The child is cloned with its <Mono>id</Mono>,{" "}
          <Mono>aria-describedby</Mono> and <Mono>aria-invalid</Mono>, and gets
          the field class (<Mono>size=&quot;small&quot;</Mono> for the small one),
          the invalid border and fill when there is an error, and any class it
          brought for layout. The control can be any element. A disabled
          control draws itself muted.
        </P>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Task title"
            hint="Shown in lists and on the board."
          >
            <input type="text" name="title" defaultValue="Draft the quarterly report" />
          </Field>
          <Field
            label="Due date"
            error="June has 30 days. Choose a date that exists."
          >
            <input type="text" name="due" defaultValue="31 Jun 2026" />
          </Field>
          <Field label="Reference">
            <input type="text" name="reference" defaultValue="IKI-0042" disabled />
          </Field>
          <Field label="Owner">
            <select name="owner" defaultValue="amina">
              <option value="amina">Amina</option>
              <option value="tui">Tui</option>
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <textarea name="notes" rows={3} defaultValue="Waiting on the finance figures." />
            </Field>
          </div>
        </div>
        <CodeBlock code={FIELD_USE} />
      </Section>

      <Section title="Notice">
        <P>
          A sentence in a tinted box, for the outcome of something the person
          just did. The role follows the tone: <Mono>info</Mono> and{" "}
          <Mono>positive</Mono> are <Mono>role=&quot;status&quot;</Mono>, polite;{" "}
          <Mono>warm</Mono> and <Mono>overdue</Mono> are{" "}
          <Mono>role=&quot;alert&quot;</Mono>, interrupting. Confirmations used
          to be plain text that nothing announced, while refusals alerted;
          the roles keep that difference on purpose, and now the confirmations
          are announced too.
        </P>
        <div className="flex max-w-xl flex-col gap-3">
          <Notice>Changes apply to the next task anybody saves.</Notice>
          <Notice tone="positive">Task saved.</Notice>
          <Notice tone="warm">This task has no owner yet.</Notice>
          <Notice tone="overdue">
            The task could not be saved. Nothing was changed.
          </Notice>
        </div>
        <CodeBlock code={NOTICE_USE} />
      </Section>

      <Section title="Empty state">
        <P>
          A boxed sentence in muted type, saying what is missing and, where
          there is one, the next step. The action slot takes any node, usually
          a <Mono>Button</Mono>.
        </P>
        <div className="grid gap-3 sm:grid-cols-2">
          <EmptyState action={<Button>New task</Button>}>
            No tasks yet. Create the first one.
          </EmptyState>
          <EmptyState>Nothing is overdue.</EmptyState>
        </div>
        <CodeBlock code={EMPTY_USE} />
      </Section>

      <Section title="Drawer">
        <P>
          The record drawer: a 30rem side panel at <Mono>lg</Mono>, a
          full-screen sheet below, over a navy scrim. Base UI’s Dialog is
          behind it (ADR 0002) and owns the portal, the focus trap, the scroll
          lock and the return of focus to the opener; the package owns the
          shape — title, subtitle, Close, body, refusal band, footer. Focus
          opens in the body. Open is controlled: every request to close comes
          back as <Mono>onOpenChange(false, reason)</Mono>, and the caller
          closes by setting <Mono>open</Mono> or refuses by leaving it, which
          is how a dirty form keeps its drawer. Try the keyboard: Tab stays
          inside, Escape asks before discarding.
        </P>
        <Specimen name="open, controlled, with a discard guard">
          <DrawerSpecimen />
        </Specimen>
        <CodeBlock code={DRAWER_USE} />
      </Section>

      <Section title="Popover">
        <P>
          A toolbar popover: the trigger on <Mono>subtleButtonClass</Mono>{" "}
          with an optional count in its name, and a <Mono>w-80</Mono> panel
          below it that Base UI positions and keeps inside the viewport. The
          trigger wears the active style while open and whenever{" "}
          <Mono>active</Mono> is passed — a filter that is applied — so the
          state is a shape and a weight, not only a colour. Escape and an
          outside click close it; focus returns to the trigger.
        </P>
        <Specimen name="trigger, badge, active, panel">
          <PopoverSpecimen />
        </Specimen>
        <CodeBlock code={POPOVER_USE} />
      </Section>

      <Section title="Menu">
        <P>
          An APG menu, portalled to the body so a column’s scroll container
          cannot clip it. Arrow keys move the highlight and wrap, Home and End
          jump, a typed letter finds its item, Escape closes and returns focus
          to the trigger, and so does choosing an item. A{" "}
          <Mono>disabled</Mono> item stays in the list, muted and announced.
        </P>
        <Specimen name="trigger, items, a disabled current item">
          <MenuSpecimen />
        </Specimen>
        <CodeBlock code={MENU_USE} />
      </Section>

      <Section title="Disclosure">
        <P>
          A collapsible section whose rows stay on the page. The whole header
          row is one button inside the heading, its name carries the count
          (“Overdue, 3”), the blurb is read with it, and the action link sits
          beside it, outside the button. Collapsed rows are hidden by the class{" "}
          <Mono>hidden print:block</Mono>, never the <Mono>hidden</Mono>{" "}
          attribute, so a printed page shows every row. Built without Base UI:
          its Collapsible sets the attribute, which Tailwind’s preflight makes{" "}
          <Mono>!important</Mono>, and the handout would print empty.
        </P>
        <Specimen name="collapsed by default; print to see every row">
          <DisclosureSpecimen />
        </Specimen>
        <CodeBlock code={DISCLOSURE_USE} />
      </Section>

      <Section title="KPI tile">
        <P>
          A teal label bar over a large figure. The tone changes the figure’s
          colour only. The tones were <Mono>warn</Mono> and <Mono>bad</Mono>;
          they are now <Mono>warm</Mono> and <Mono>overdue</Mono>, the names
          the status tones already use.
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
    </PageMain>
  );
}
