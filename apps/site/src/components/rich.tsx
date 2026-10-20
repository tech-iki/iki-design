import type { ReactNode } from "react";

/** An identifier, a hex value or a class name inline: Geist Mono at `text-xs`. */
export function Mono({ children }: { children: ReactNode }) {
  return <code className="font-mono text-xs">{children}</code>;
}

/**
 * A string with `backtick` spans set in mono and `**double-star**` spans set
 * semibold. The design-system document writes identifiers and emphasis that
 * way, and the page copy follows it, so a sentence can stay a sentence instead
 * of a run of fragments. (Semibold, not bold: nothing in the system is bold.)
 */
export function Rich({ children }: { children: string }) {
  const parts = children.split(/(`[^`]*`|\*\*[^*]*\*\*)/);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
          return <Mono key={i}>{part.slice(1, -1)}</Mono>;
        }
        if (part.startsWith("**") && part.endsWith("**") && part.length > 3) {
          return (
            <span key={i} className="font-semibold">
              <Rich>{part.slice(2, -2)}</Rich>
            </span>
          );
        }
        return part;
      })}
    </>
  );
}
