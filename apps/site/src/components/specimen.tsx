import type { ReactNode } from "react";
import { CodeBlock } from "@/components/code-block";
import { Rich } from "@/components/rich";

/**
 * One export or one component state: its name, an optional note, the live
 * element, and — when it is a class string — the string beneath. Shared by
 * `/controls` and `/components`, so the two pages frame a specimen one way.
 */
export function Specimen({
  name,
  note,
  classString,
  children,
}: {
  name: string;
  note?: string;
  classString?: string;
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
      <div className="flex flex-wrap items-start gap-3 py-2">{children}</div>
      {classString ? <CodeBlock code={classString} /> : null}
    </div>
  );
}
