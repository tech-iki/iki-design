# iki-design

The design system of the Islands Knowledge Institute: the colour tokens, status
colours, control classes and shared components that every IKI app imports, and
the site that shows them.

It is one repository doing two jobs:

- **`packages/design`** publishes `@tech-iki/design` — `theme.css` for Tailwind v4
  apps, `tokens.css` for anything that is plain CSS, `tokens.json` for everything
  else, and the React primitives (`Pill`, `KpiTile`, `PageTitle`, `PageMain`) with
  the typed colour maps behind them.
- **`apps/site`** is a Next.js site that renders the package live: every token
  with its contrast ratio, every pill tone, every control, so a change to
  `tokens.ts` can be seen before it ships.

The system was extracted from [IKI Work OS](https://github.com/tech-iki/iki-work-os)
on 20 October 2026 and this repository is now its source of truth. The written
system is in [docs/design-system.md](docs/design-system.md).

## Using it

Tailwind v4 app — one line in your global stylesheet:

```css
@import "tailwindcss";
@import "@tech-iki/design/theme.css";
```

Plain CSS (a Ghost theme, WordPress, Docmost):

```css
@import "@tech-iki/design/tokens.css";
```

Components and the colour maps:

```tsx
import { Pill, tones } from "@tech-iki/design";
<Pill tone={tones.warm}>Awaiting Input</Pill>
```

Until the package is on npm, install it from a tag:

```json
"@tech-iki/design": "github:tech-iki/iki-design#v0.1.0"
```

## Working on it

```bash
nvm use
npm ci
npm run build -w packages/design
npm run dev
```

`npm test`, `npm run lint`, `npm run typecheck` and `npm run build` are what CI
runs. The workflow for changes is in [PROJECT_WORKFLOW.md](PROJECT_WORKFLOW.md).
