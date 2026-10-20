/**
 * Writes `src/icons.generated.tsx` from the vocabulary below. Run by
 * `npm run build` before `tsc`, so the generated file exists when it compiles.
 *
 * Each entry names a MEANING (the key callers use) and the Lucide icon that
 * draws it. The script reads that icon's nodes from the installed `lucide`
 * package, camel-cases dashed attribute names for React, and writes them out
 * with the ISC notice, since the paths are redistributed inside this package.
 *
 * Node 24 runs this file by stripping types; import specifiers are not
 * rewritten. Lucide is therefore resolved with `import.meta.resolve` and loaded
 * with a dynamic `import()`, as build-css.ts does for its compiled module.
 * Output is sorted by name, so a re-run yields a byte-identical file.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type IconSize = 16 | 20;
type Stroke = 1.5 | 1.4;

interface Entry {
  readonly name: string;
  readonly source: string;
  readonly size: IconSize;
  readonly meaning: string;
}

const NAV = (name: string, source: string, meaning: string): Entry => ({ name, source, size: 20, meaning });
const ROW = (name: string, source: string, meaning: string): Entry => ({ name, source, size: 16, meaning });

const VOCABULARY: readonly Entry[] = [
  // 20px nav glyphs: the Work OS rail
  NAV("myTasks", "list-checks", "My tasks: a ticked list"),
  NAV("timesheet", "clock", "Timesheet: a clock"),
  NAV("tasks", "table", "Tasks: the grid"),
  NAV("review", "clipboard-check", "Summary / review"),
  NAV("workstreams", "workflow", "Workstreams: linked boxes"),
  NAV("policies", "folder-pen", "Policies: a folder being edited"),
  NAV("people", "users", "People"),
  NAV("import", "upload", "Import: an arrow up out of a tray"),
  NAV("settings", "sliders-horizontal", "Settings: two sliders, not a cog; a cog's teeth turn to fuzz at 20px on navy"),
  NAV("guide", "book-open", "Guide: an open book"),
  NAV("reports", "file-text", "Reports: a page of text"),
  NAV("updates", "bell-dot", "What's new"),
  NAV("record", "briefcase", "Own employment record"),
  NAV("sidebar", "panel-left", "Collapse or expand the rail"),
  NAV("signOut", "log-out", "Sign out"),
  // 16px row and inline glyphs
  ROW("expand", "maximize-2", "Open the full record"),
  ROW("drop", "download", "Drop, archive or move to Trash: an arrow into an open tray, not a bin; a bin would promise a destruction the app does not perform"),
  ROW("key", "key-round", "Set password"),
  ROW("mail", "mail", "Receives this mail"),
  ROW("mailOff", "mail-x", "Opted out of mail"),
  ROW("personOn", "user-check", "Reactivate person"),
  ROW("personOff", "user-x", "Deactivate person"),
  ROW("reminder", "clock", "Receives timesheet reminders"),
  ROW("reminderOff", "alarm-clock-off", "Reminders opted out"),
  ROW("employment", "briefcase", "Employment record (row)"),
  ROW("disclosure", "chevron-right", "Disclosure: rotated 90 degrees by the caller when open"),
  ROW("close", "x", "Close or remove (was ✕ and ×)"),
  ROW("check", "check", "Selected or current (was ✓)"),
  ROW("assigned", "dot", "Assigned to you (was ●)"),
  ROW("supporting", "diamond", "Supporting, not responsible (was ◇)"),
  ROW("sortAscending", "arrow-up", "Sorted ascending (was ↑)"),
  ROW("sortDescending", "arrow-down", "Sorted descending (was ↓)"),
  ROW("previous", "arrow-left", "Previous period (was ←)"),
  ROW("next", "arrow-right", "Next period (was →)"),
  ROW("externalLink", "external-link", "Opens elsewhere (was ↗)"),
  ROW("archive", "inbox", "Archive: a tray, not a bin"),
  ROW("chevronUp", "chevron-up", "Chevron up"),
  ROW("chevronDown", "chevron-down", "Chevron down (was ▾)"),
  ROW("chevronLeft", "chevron-left", "Chevron left"),
  ROW("chevronRight", "chevron-right", "Chevron right (was ▸)"),
  ROW("plus", "plus", "Add"),
  ROW("minus", "minus", "Remove or collapse"),
  ROW("search", "search", "Search"),
  ROW("filter", "funnel", "Filter"),
  ROW("calendar", "calendar", "Calendar or date"),
  ROW("dragHandle", "grip-vertical", "Drag handle"),
  ROW("warning", "triangle-alert", "Warning"),
  ROW("info", "info", "Information"),
];

const strokeFor = (size: IconSize): Stroke => (size === 20 ? 1.4 : 1.5);

type Node = readonly [string, Readonly<Record<string, string>>];

const camel = (attr: string) => attr.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

const lucideRoot = join(import.meta.dirname, "..", "node_modules", "lucide");
const rootCandidates = [lucideRoot, join(import.meta.dirname, "..", "..", "..", "node_modules", "lucide")];
const lucideDir = rootCandidates.find((dir) => {
  try {
    readFileSync(join(dir, "package.json"));
    return true;
  } catch {
    return false;
  }
});
if (!lucideDir) throw new Error("lucide is not installed");

const { version } = JSON.parse(readFileSync(join(lucideDir, "package.json"), "utf8")) as { version: string };
// The whole file, not the ISC block alone: the part after `---` is the MIT
// notice for the icons Lucide took over from Feather (x, check, the arrows,
// the chevrons, clock, calendar, download, upload, external-link, info, minus,
// plus, search, log-out are all in this vocabulary), and MIT asks for its
// notice in every copy.
const licence = readFileSync(join(lucideDir, "LICENSE"), "utf8").trim();

const sorted = [...VOCABULARY].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
const names = new Set<string>();
for (const entry of sorted) {
  if (names.has(entry.name)) throw new Error(`duplicate icon name: ${entry.name}`);
  names.add(entry.name);
}

const missing: string[] = [];
const rendered: string[] = [];
for (const entry of sorted) {
  let nodes: Node[];
  try {
    const mod = (await import(
      import.meta.resolve(`lucide/dist/esm/icons/${entry.source}.mjs`)
    )) as { default: Node[] };
    nodes = mod.default.map(([tag, attrs]) => [
      tag,
      Object.fromEntries(Object.entries(attrs).map(([k, v]) => [camel(k), String(v)])),
    ]);
  } catch (err) {
    missing.push(`${entry.name} -> ${entry.source} (${err instanceof Error ? err.message : String(err)})`);
    continue;
  }
  rendered.push(
    `  ${entry.name}: {\n` +
      `    source: ${JSON.stringify(entry.source)},\n` +
      `    size: ${entry.size},\n` +
      `    stroke: ${strokeFor(entry.size)},\n` +
      `    meaning: ${JSON.stringify(entry.meaning)},\n` +
      `    nodes: ${JSON.stringify(nodes)},\n` +
      `  },`,
  );
}
if (missing.length > 0) throw new Error(`Lucide icons not found: ${missing.join(", ")}`);

const header = [
  `/**`,
  ` * Generated from lucide v${version} by scripts/build-icons.ts — do not edit; change the vocabulary in the script.`,
  ` *`,
  ...licence.split("\n").map((line) => (line === "" ? " *" : ` * ${line}`)),
  ` */`,
].join("\n");

const out = `${header}

export type IconName =
${sorted.map((e) => `  | ${JSON.stringify(e.name)}`).join("\n")};

export type IconSize = 16 | 20;

export const LUCIDE_VERSION = ${JSON.stringify(version)};

export const ICONS: Readonly<
  Record<
    IconName,
    {
      source: string;
      size: IconSize;
      stroke: 1.5 | 1.4;
      meaning: string;
      nodes: readonly (readonly [string, Readonly<Record<string, string>>])[];
    }
  >
> = {
${rendered.join("\n")}
};
`;

writeFileSync(join(import.meta.dirname, "..", "src", "icons.generated.tsx"), out);
console.log(`@tech-iki/design: wrote ${sorted.length} icons from lucide v${version} to src/icons.generated.tsx`);
