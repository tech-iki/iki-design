import type { ReactNode } from "react";
import { linkClass } from "@tech-iki/design";

/** The design-system document on GitHub, which a `#anchor` link points into. */
export const DOC_URL =
  "https://github.com/tech-iki/iki-design/blob/main/docs/design-system.md";

/** An identifier, a hex value or a class name inline: Geist Mono at `text-xs`. */
export function Mono({ children }: { children: ReactNode }) {
  return <code className="font-mono text-xs">{children}</code>;
}

/**
 * The inline markdown the design-system document writes, and nothing more:
 * `backtick` spans in mono, `**double-star**` spans semibold, `*single-star*`
 * spans in italics, `[text](href)` links and backslash escapes. The page copy
 * follows the same conventions, so a sentence can stay a sentence instead of
 * a run of fragments, and a row read from the document renders as the
 * document does. (Semibold, not bold: nothing in the system is bold.)
 *
 * A link to `#anchor` is a section of the document, which the site does not
 * reproduce, so it points at the document on GitHub.
 */
export function Rich({ children }: { children: string }) {
  const parts = children.split(
    /(`[^`]*`|\*\*(?:[^*]|\*[^*]+\*)+\*\*|\*[^*\s][^*]*\*|\[[^\]]+\]\([^)\s]+\))/,
  );
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
          return <Mono key={i}>{part.slice(1, -1)}</Mono>;
        }
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return (
            <span key={i} className="font-semibold">
              <Rich>{part.slice(2, -2)}</Rich>
            </span>
          );
        }
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
          return (
            <em key={i}>
              <Rich>{part.slice(1, -1)}</Rich>
            </em>
          );
        }
        const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
        if (link) {
          const [, text, href] = link;
          return (
            <a
              key={i}
              href={href.startsWith("#") ? `${DOC_URL}${href}` : href}
              className={linkClass}
            >
              <Rich>{text}</Rich>
            </a>
          );
        }
        return part.replace(/\\([\\`*_{}[\]()#+\-.!|:])/g, "$1");
      })}
    </>
  );
}
