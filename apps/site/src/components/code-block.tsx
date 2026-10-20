import { focusRing } from "@tech-iki/design";

/**
 * A block of code or generated output. `file` names where it lives; `generated`
 * adds the "do not edit" mark the package stamps on every file it writes.
 *
 * The `<pre>` scrolls inside its own frame, never the page. A scrollable
 * region needs a tab stop so a keyboard user can scroll it (WCAG 2.1.1,
 * design-system §10), but a frame that cannot overflow does not. `scrollable`
 * therefore defaults to whether any line of `code` is longer than `FITS`
 * characters, and an explicit prop wins.
 */

/**
 * Longest line, in characters, that fits the narrowest frame at 375px: a
 * `<pre>` inside a Specimen leaves 211px for text (375 less the 56px rail, the
 * 48px page padding, the Specimen's 34px and the `<pre>`'s own 24px), and a
 * Geist Mono `text-xs` glyph is 7.2px wide.
 */
const FITS = 29;
export function CodeBlock({
  code,
  file,
  generated = false,
  scrollable,
}: {
  code: string;
  file?: string;
  generated?: boolean;
  scrollable?: boolean;
}) {
  const text = code.trimEnd();
  const focusable =
    scrollable ?? text.split("\n").some((line) => line.length > FITS);
  return (
    <figure className="flex flex-col gap-1">
      {file ? (
        <figcaption className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
          <span className="font-mono">{file}</span>
          {generated ? <span>generated — do not edit</span> : null}
        </figcaption>
      ) : null}
      <pre
        tabIndex={focusable ? 0 : undefined}
        className={`overflow-auto rounded-md border border-grid bg-paper-tint p-3 font-mono text-xs text-ink ${
          focusable ? focusRing : ""
        }`}
      >
        <code>{text}</code>
      </pre>
    </figure>
  );
}
