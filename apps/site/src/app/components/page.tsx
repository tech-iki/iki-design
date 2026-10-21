import type { Metadata } from "next";
import {
  ActionsHeader,
  Button,
  Checkbox,
  EmptyState,
  Field,
  Icon,
  KpiTile,
  Notice,
  PageMain,
  PageTitle,
  Radio,
  RadioGroup,
  TableFrame,
  rowClass,
  tbodyClass,
  tdClass,
  theadClass,
  thClass,
} from "@tech-iki/design";
import { CodeBlock } from "@/components/code-block";
import {
  ComboboxSpecimen,
  DisclosureSpecimen,
  DrawerSpecimen,
  MenuSpecimen,
  PopoverSpecimen,
  TabsSpecimen,
  TooltipSpecimen,
} from "@/components/overlay-specimens";
import { Mono } from "@/components/rich";
import { Specimen } from "@/components/specimen";
import { P, Section } from "@/components/section";

export const metadata: Metadata = {
  title: "Components",
  description:
    "Button, Field, Notice, EmptyState, the four overlays, TableFrame, Checkbox and Radio, Tooltip, Tabs, Combobox and KpiTile, drawn live with the usage beneath each.",
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

const TABLE_USE = `<TableFrame caption="Tasks due this week" maxHeightClass={gridHeightClass} stacked minWidthClass="md:min-w-xl">
  <thead className={theadClass}>
    <tr>
      <th scope="col" className={thClass}>Task</th>
      <th scope="col" className={\`\${thClass} text-right\`}>Days</th>
      <ActionsHeader />
    </tr>
  </thead>
  <tbody className={tbodyClass}>
    {tasks.map((t, i) => (
      <tr key={t.id} className={rowClass(i)}>
        <td data-label="Task" className={tdClass}>{t.title}</td>
        <td data-label="Days" className={\`\${tdClass} text-right tabular-nums\`}>{t.days}</td>
        <td className={tdClass}>…</td>
      </tr>
    ))}
  </tbody>
</TableFrame>`;

const CHOICE_USE = `<Checkbox label="Share with everyone" name="share" defaultChecked />
<Checkbox label="Archived (read-only)" disabled />

<RadioGroup legend="Group by" name="group-by" hint="Applies to this view only.">
  <Radio label="None" value="none" defaultChecked />
  <Radio label="Owner" value="owner" />
  <Radio label="Workstream" value="workstream" />
</RadioGroup>`;

const TASKS = [
  { title: "Draft the quarterly report", owner: "Amina", days: 3 },
  { title: "Chase the finance figures", owner: "Tui", days: 1 },
  { title: "Book the board room", owner: "Rose", days: 0 },
  { title: "Send the agenda", owner: "Kemuel", days: 5 },
  { title: "Collect the apologies", owner: "Amina", days: 6 },
  { title: "Print the handouts", owner: "Rose", days: 7 },
];

const TOOLTIP_USE = `{/* the sr-only name stays; the tooltip shows it to a pointer or keyboard user */}
<Tooltip content="Expand record">
  <Button variant="icon">
    <Icon name="expand" />
    <span className="sr-only">Expand record</span>
  </Button>
</Tooltip>`;

const TABS_USE = `<Tabs value={tab} onValueChange={setTab}>
  <TabList label="Edit or preview">          {/* activation="manual" for a slow panel */}
    <Tab value="edit">Edit</Tab>
    <Tab value="preview">Preview</Tab>
  </TabList>
  <TabPanel value="edit">…</TabPanel>
  <TabPanel value="preview">…</TabPanel>
</Tabs>`;

const COMBOBOX_USE = `{/* the grid's cell chooser; forms keep the native <select> */}
<Combobox
  label="Status"
  options={[{ value: "draft", label: "Draft" }, { value: "review", label: "In review" }]}
  value={status}
  onValueChange={setStatus}
  onEscape={() => !innerLayerIsOpen}   // false keeps the list open
/>`;

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

      <Section title="Table frame">
        <P>
          The frame every table sits in: a bordered box that scrolls on its
          own, so a wide table never makes the page scroll sideways. Bounded
          by <Mono>maxHeightClass</Mono>, its header sticks — the sticky rule
          carries no z-index, so a frozen column’s header can still sit above
          it. <Mono>stacked</Mono> turns rows into labelled cards below{" "}
          <Mono>md</Mono>; narrow the window to see it. The caption is the
          table’s accessible name. Zebra comes from the row index, through{" "}
          <Mono>rowClass</Mono>.
        </P>
        <Specimen name="bounded, sticky header, stacked below md">
          <div className="w-full">
            <TableFrame caption="Tasks due this week" maxHeightClass="max-h-48" stacked minWidthClass="md:min-w-xl">
              <thead className={theadClass}>
                <tr>
                  <th scope="col" className={thClass}>Task</th>
                  <th scope="col" className={thClass}>Owner</th>
                  <th scope="col" className={`${thClass} text-right`}>Days</th>
                  <ActionsHeader />
                </tr>
              </thead>
              <tbody className={tbodyClass}>
                {TASKS.map((t, i) => (
                  <tr key={t.title} className={rowClass(i)}>
                    <td data-label="Task" className={tdClass}>{t.title}</td>
                    <td data-label="Owner" className={tdClass}>{t.owner}</td>
                    <td data-label="Days" className={`${tdClass} text-right tabular-nums`}>{t.days}</td>
                    <td className={tdClass}>
                      <Button variant="icon" title="Expand">
                        <Icon name="expand" />
                        <span className="sr-only">Expand {t.title}</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableFrame>
          </div>
        </Specimen>
        <P>
          The spreadsheet grids use <Mono>gridHeightClass</Mono> as their
          bound; the specimen uses a shorter one so the sticky header shows.
        </P>
        <CodeBlock code={TABLE_USE} />
      </Section>

      <Section title="Checkbox and radio">
        <P>
          The browser’s own controls, styled: the label wraps the input, so
          the words are the name and the whole row is the target; the checked
          fill is <Mono>teal-deep</Mono> through <Mono>accent-color</Mono>;
          the row is 44px tall below <Mono>md</Mono>; a disabled input mutes
          its row. A <Mono>RadioGroup</Mono> is a fieldset whose legend asks
          the question and whose <Mono>name</Mono> reaches every radio. Space
          toggles a checkbox and the arrow keys move within a group, natively.
        </P>
        <div className="flex flex-wrap gap-8">
          <div className="flex flex-col gap-1">
            <Checkbox label="Share with everyone" name="share" defaultChecked />
            <Checkbox label="Notify the owner" name="notify" />
            <Checkbox label="Archived (read-only)" name="archived" disabled />
          </div>
          <RadioGroup legend="Group by" name="group-by" hint="Applies to this view only.">
            <Radio label="None" value="none" defaultChecked />
            <Radio label="Owner" value="owner" />
            <Radio label="Workstream" value="workstream" />
          </RadioGroup>
          <RadioGroup legend="Row height" name="row-height" error="Choose a row height." disabled>
            <Radio label="Short" value="short" />
            <Radio label="Tall" value="tall" />
          </RadioGroup>
        </div>
        <CodeBlock code={CHOICE_USE} />
      </Section>

      <Section title="Tooltip">
        <P>
          A hint on hover and on keyboard focus, for an icon button whose
          picture may need a word. It never replaces the name: the button
          keeps its <Mono>sr-only</Mono> label and loses its{" "}
          <Mono>title</Mono>, so the hint is not shown twice. Escape closes
          it. Touch gets no tooltip — Base UI opens it on mouse and pen only,
          because a long press is the browser’s menu — so anything a person
          needs in order to act goes in visible words.
        </P>
        <Specimen name="IconButton with a tooltip">
          <TooltipSpecimen />
        </Specimen>
        <CodeBlock code={TOOLTIP_USE} />
      </Section>

      <Section title="Tabs">
        <P>
          APG tabs: one tab stop for the row, the arrow keys move along it,
          Home and End jump. By default the arrow selects as it moves, as Work
          OS’s editor does; <Mono>activation=&quot;manual&quot;</Mono> waits
          for Enter or Space. The selected tab is marked by weight and a bar,
          not colour alone. A disabled tab stays in the row, muted.
        </P>
        <Specimen name="automatic, then manual activation">
          <TabsSpecimen />
        </Specimen>
        <CodeBlock code={TABS_USE} />
      </Section>

      <Section title="Combobox">
        <P>
          The grid’s cell chooser: type to filter, the first match is
          highlighted, the arrows move, Enter chooses, Escape closes the list
          and nothing else. The chosen option has a tick. Forms keep the
          native <Mono>&lt;select&gt;</Mono>, which gets the phone’s own
          picker; this is for a cell, or for a list long enough that typing
          beats scrolling.
        </P>
        <Specimen name="in a Field, with a disabled option">
          <ComboboxSpecimen />
        </Specimen>
        <CodeBlock code={COMBOBOX_USE} />
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
