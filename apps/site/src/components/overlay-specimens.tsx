"use client";

import { useState } from "react";
import {
  Button,
  Disclosure,
  Drawer,
  Field,
  Menu,
  MenuItem,
  Notice,
  Popover,
  PopoverOption,
  linkClass,
  type DrawerCloseReason,
} from "@tech-iki/design";

/*
 * The live specimens for the four overlays on `/components`. The page is a
 * Server Component, as every page of this site is; the overlays are client
 * components (design system §13), and so is anything that holds their open
 * state. This file is the one `"use client"` the site allows, named in
 * `site-rules.test.ts`, and it is exactly the arrangement a consuming Next
 * app has: a server page that renders a small client island.
 */

/** The drawer, with the discard guard a dirty form uses: Escape and the scrim are refused while the note is unsaved. */
export function DrawerSpecimen() {
  const [open, setOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [lastClose, setLastClose] = useState<DrawerCloseReason | null>(null);

  function requestClose(reason: DrawerCloseReason) {
    setLastClose(reason);
    if (dirty && !confirming) {
      setConfirming(true);
      return;
    }
    setOpen(false);
    setConfirming(false);
    setDirty(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setOpen(true)}>New task</Button>
        <span className="text-xs text-ink-muted">
          {lastClose ? `Last close request: ${lastClose}` : "Focus returns here when it closes."}
        </span>
      </div>
      <Drawer
        open={open}
        onOpenChange={(next, reason) => (next ? setOpen(true) : requestClose(reason))}
        title="New task"
        subtitle="Saved to the Finance workstream."
        refusal={confirming ? "Discard this task? Nothing you have typed is saved." : undefined}
        footer={
          confirming ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="warn" onClick={() => requestClose("close")}>
                Discard
              </Button>
              <Button variant="subtle" onClick={() => setConfirming(false)}>
                Keep editing
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => requestClose("close")}>Save task</Button>
              <Button variant="subtle" onClick={() => requestClose("close")}>
                Cancel
              </Button>
            </div>
          )
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Task title" hint="Focus opens here, in the body, not on Close.">
            <input type="text" name="title" onChange={() => setDirty(true)} />
          </Field>
          <Field label="Owner">
            <select name="owner" defaultValue="amina" onChange={() => setDirty(true)}>
              <option value="amina">Amina</option>
              <option value="tui">Tui</option>
            </select>
          </Field>
          <Field label="Notes">
            <textarea name="notes" rows={3} onChange={() => setDirty(true)} />
          </Field>
          <Notice>Type anything, then press Escape: the drawer asks before it discards.</Notice>
        </div>
      </Drawer>
    </div>
  );
}

const OWNERS = ["Amina", "Tui", "Kemuel", "Rose"] as const;

/** Two toolbar popovers side by side, with one filter applied so the `active` style shows while closed. */
export function PopoverSpecimen() {
  const [owners, setOwners] = useState<string[]>(["Amina"]);
  const [health, setHealth] = useState("all");

  function toggleOwner(name: string) {
    setOwners((current) =>
      current.includes(name) ? current.filter((n) => n !== name) : [...current, name],
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover label="Owner" badge={owners.length} active={owners.length > 0}>
        <div className="flex flex-col gap-0.5">
          {OWNERS.map((name) => (
            <PopoverOption key={name}>
              <input
                type="checkbox"
                checked={owners.includes(name)}
                onChange={() => toggleOwner(name)}
              />
              {name}
            </PopoverOption>
          ))}
        </div>
      </Popover>
      <Popover label="Health" active={health !== "all"}>
        <div className="flex flex-col gap-0.5">
          {["all", "on track", "at risk", "overdue"].map((value) => (
            <PopoverOption key={value}>
              <input
                type="radio"
                name="health"
                value={value}
                checked={health === value}
                onChange={() => setHealth(value)}
              />
              {value === "all" ? "Any health" : value}
            </PopoverOption>
          ))}
        </div>
      </Popover>
      <span className="text-xs text-ink-muted">
        {owners.length} owner{owners.length === 1 ? "" : "s"}, health {health}.
      </span>
    </div>
  );
}

const STATUSES = ["Draft", "In review", "Approved", "Published", "Retired"] as const;

/** The Move to… menu from a policy card: the current status stays listed, disabled, with its tick. */
export function MenuSpecimen() {
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("In review");
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Menu label="Move to…">
        {STATUSES.map((s) => (
          <MenuItem key={s} disabled={s === status} onSelect={() => setStatus(s)}>
            {s === status ? `${s} ✓` : s}
          </MenuItem>
        ))}
      </Menu>
      <span className="text-xs text-ink-muted">Status: {status}</span>
    </div>
  );
}

const ROWS = [
  "Draft the quarterly report — Amina, due 24 Oct",
  "Chase the finance figures — Tui, due 22 Oct",
  "Book the board room — Rose, due 21 Oct",
];

/** Two sections, collapsed by default; print this page and every row is on the paper. */
export function DisclosureSpecimen() {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      {(["Overdue", "Due this week"] as const).map((title) => (
        <Disclosure
          key={title}
          title={title}
          count={ROWS.length}
          blurb={title === "Overdue" ? "Past their deadline." : "Due in the next seven days."}
          open={open[title] ?? false}
          onOpenChange={(next) => setOpen((o) => ({ ...o, [title]: next }))}
          action={
            <a href="#disclosure" className={`${linkClass} text-xs`}>
              Open in Tasks
            </a>
          }
        >
          <ul className="mt-1 divide-y divide-grid">
            {ROWS.map((row) => (
              <li key={row} className="py-1.5 text-sm text-ink">
                {row}
              </li>
            ))}
          </ul>
        </Disclosure>
      ))}
    </div>
  );
}
