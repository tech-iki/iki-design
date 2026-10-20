# Changelog

Everything that changes in `@tech-iki/design`, newest first. The format follows
[Keep a Changelog](https://keepachangelog.com) and the versions follow
[Semantic Versioning](https://semver.org): a new token, tone or component is a
minor; a value correction that keeps every name is a patch; a renamed or removed
token or class is a major.

## [Unreleased]

## [0.2.0] — 2026-10-20

The three rule breaks the 20 October 2026 audit found (#6,
`docs/audits/2026-10-20-design-system-audit.md`).

### Changed

- **`theme.css` switches Tailwind's default palette off** (`--color-*: initial`)
  before declaring the tokens. In an app that imports it, `bg-red-500`,
  `text-gray-500` and `text-white` now compile to nothing: the "no raw palette
  classes" rule is a build fact. `paper` is the system's white (`#ffffff`) and
  `ink` its black; `paper/50` and the other alpha forms work as `white/50` did.
  **Breaking for a consumer that used any default-palette class:** it stops
  generating. `white` and `black` were the only ones a rule-abiding consumer
  could have had; they move to `paper` and `ink`. The system's own names are
  all unchanged, which is why this is a minor and not a major.
- `primaryButtonClass`, `focusRingOnNavy` and `KpiTile`'s label bar say
  `paper`, not `white`. Same pixels, one token for one value.

### Added

- `TOKEN_PAIRS` holds `KpiTile`'s `warn` and `bad` values on the tile's
  `teal-soft` body (7.46:1 and 7.96:1). They passed; they were not asserted.
- `design-system-doc.test.ts` holds §8's class blocks to `ui-classes.ts`, `Pill`
  and `KpiTile`, the way §4 and §13 are held to the generated CSS.

### Fixed

- §8 of the written system: `fieldClass` and `smallFieldClass` no longer show
  the `focus:outline-none` the code removed; `Pill`'s line carries its
  `whitespace-nowrap`; `invalidFieldClass` is listed.
