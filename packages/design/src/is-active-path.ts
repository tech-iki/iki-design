/**
 * Is the page at `pathname` the one a rail link points to? (#19)
 *
 * Work OS's rule (`onPath` and `isNavItemActive` in `app-sidebar.tsx`), as a
 * pure function so any router can use it: the app reads its own pathname —
 * `usePathname()` in Next, `useLocation().pathname` in React Router, the
 * request URL on a server — and passes the answer to `NavLink`'s `current`.
 * The package never reads the location itself, which is what keeps the rail
 * server-safe.
 *
 * - **On a segment boundary.** `/calls` is current on `/calls` and on
 *   `/calls/42/edit`, never on `/calls-admin`.
 * - **`/` is exact.** Every path starts with it, so the home link would
 *   otherwise be current everywhere.
 * - **`exact: true`** turns the prefix match off for any other link.
 * - **`exclude`** names pages under the link that have an entry of their own,
 *   so the parent gives up the state there and a screen reader never hears
 *   two current pages: `isActivePath("/tasks/summary", "/tasks", { exclude:
 *   ["/tasks/summary"] })` is false. Each is matched on a segment boundary
 *   too, so it takes the excluded page's descendants with it — except `/`,
 *   which is exact here as everywhere: `exclude: ["/"]` excludes the root
 *   page alone, never the whole site.
 * - **Query and hash are ignored**, on both sides, and so are trailing
 *   slashes: `/calls/?page=2#top` is `/calls`. So by design
 *   `isActivePath("/calls", "/calls?view=late")` is true, as is every saved
 *   view of `/calls`: a link whose meaning is its query is the app's to
 *   compare.
 * - **An `href` that is not a path** — `https://…`, `mailto:`, a relative
 *   `calls`, an empty string — is never current.
 *
 * Case and percent-encoding are compared as given: paths are case-sensitive,
 * and both values come from the same router, so they are encoded alike.
 */
export function isActivePath(
  pathname: string,
  href: string,
  options: { exact?: boolean; exclude?: readonly string[] } = {},
): boolean {
  const here = normalise(pathname);
  const target = normalise(href);
  if (here === null || target === null) return false;
  if (!within(here, target, options.exact === true)) return false;
  return !(options.exclude ?? []).some((child) => {
    const excluded = normalise(child);
    return excluded !== null && within(here, excluded, false);
  });
}

/** The path alone: no query, no hash, no trailing slash; `null` when it is not a rooted path. */
function normalise(value: string): string | null {
  const path = value.split(/[?#]/, 1)[0];
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  const trimmed = path.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

/** `here` is `target`, or (unless `exact`, and never for `/`) below it on a segment boundary. */
function within(here: string, target: string, exact: boolean): boolean {
  if (here === target) return true;
  if (exact || target === "/") return false;
  return here.startsWith(`${target}/`);
}
