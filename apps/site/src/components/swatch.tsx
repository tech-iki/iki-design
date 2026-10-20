/**
 * A colour chip. The fill is an inline `style` — the one legitimate inline
 * style on the site (§13d allows style attributes) — because the value arrives
 * as data from the package and a Tailwind utility cannot be built from it at
 * run time. A `border-grid` keeps white and near-white fills visible.
 *
 * Decorative: the hex is always printed beside it, so it is `aria-hidden`.
 */
export function Swatch({
  hex,
  size = "md",
}: {
  hex: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      aria-hidden="true"
      className={`block shrink-0 rounded-md border border-grid ${
        size === "md" ? "size-10" : "size-5"
      }`}
      style={{ background: hex }}
    />
  );
}
