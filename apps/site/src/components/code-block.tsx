import { focusRing } from "@tech-iki/design";

/**
 * A block of code or generated output. `file` names where it lives; `generated`
 * adds the "do not edit" mark the package stamps on every file it writes.
 *
 * The `<pre>` is focusable so a keyboard user can scroll a long line: it
 * scrolls inside its own frame, never the page.
 */
export function CodeBlock({
  code,
  file,
  generated = false,
}: {
  code: string;
  file?: string;
  generated?: boolean;
}) {
  return (
    <figure className="flex flex-col gap-1">
      {file ? (
        <figcaption className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
          <span className="font-mono">{file}</span>
          {generated ? <span>generated — do not edit</span> : null}
        </figcaption>
      ) : null}
      <pre
        tabIndex={0}
        className={`overflow-auto rounded-md border border-grid bg-paper-tint p-3 font-mono text-xs text-ink ${focusRing}`}
      >
        <code>{code.trimEnd()}</code>
      </pre>
    </figure>
  );
}
