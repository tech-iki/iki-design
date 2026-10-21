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
 * Longest line, in characters, that fits the narrowest frame at 320px, the
 * width WCAG 1.4.10 reflow is judged at. A `<pre>` inside a Specimen leaves
 * 141px for text: 320 less a 15px desktop scrollbar, the 56px rail, the 48px
 * page padding, the Specimen's 34px, and the `<pre>`'s 2px border and 24px
 * padding. A Geist Mono `text-xs` glyph is 7.2px wide.
 *
 * The cost is a tab stop on some frames that do not scroll at desktop width.
 * Knowing which do would take a measurement in the browser, and the site keeps
 * client components to the overlay specimens.
 */
const FITS = 19;
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
