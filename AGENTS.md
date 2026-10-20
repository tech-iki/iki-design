# Repository Agent Instructions

Canonical shared instructions for every coding agent working in this repository
— Claude Code, Codex, and anything else that reads `AGENTS.md`.

<!-- BEGIN MANAGED PROJECT WORKFLOW REFERENCE -->

## Mandatory Project Workflow

Before analyzing, planning, editing, testing, committing, opening or updating a pull request, releasing, or deploying, read and follow [PROJECT_WORKFLOW.md](./PROJECT_WORKFLOW.md).

The workflow is mandatory for the entire task, including scope control, validation, versioning, release management, staging deployment, manual production promotion, production verification, rollback, approval boundaries, and completion reporting.

A production deployment must never be inferred from permission to implement, commit, push, open a pull request, merge, create a release, or deploy to staging. Production requires current successful staging evidence and a separate manual human trigger or approval.

If this workflow conflicts materially with more specific repository instructions, do not silently choose between them. Follow higher-priority instructions, retain the stronger safety requirement, and ask for clarification.

<!-- END MANAGED PROJECT WORKFLOW REFERENCE -->

## Skill Routing

When a request matches one of these, load the named skill before doing the work (in Claude Code, invoke it with the Skill tool or `/<name>`). These personal skills take precedence over built-in or plugin skills that cover similar ground.

| Request | Skill |
|---|---|
| New repo or project setup, `/init`, AGENTS.md / CLAUDE.md / PROJECT_WORKFLOW.md, syncing standards | `project-standards` |
| Progress report, status or client update, dev tracker, dependency chart, Gantt, roadmap view, milestones | `project-progress-artifacts` |
| What to work on, due dates on issues, workload or deadlines across repos, dev-task reminders | `portfolio-planner` |
| Audit, review, redesign or rebuild a live website or URL; website proposal or quote | `website-audit-rebuild` |
| Security review, threat model, pentest or hardening of code or an app the user owns | `security-assessment` |

If a listed skill is not available in the current agent, say so and continue without it.

## Mandatory Multi-Agent Coding Workflow

For every coding-related task, the top-level agent MUST use sub-agents before beginning substantive implementation. Coding tasks include code creation, debugging, refactoring, testing, code review, architecture, database work, infrastructure, configuration, security analysis, and dependency changes.

### 1. Mandatory delegation

- Delegate at least one meaningful, bounded subtask to a sub-agent.
- For medium or complex tasks, use multiple sub-agents whenever workstreams can be separated.
- For very small tasks, assign a sub-agent to independently inspect the relevant code, identify risks, propose tests, or review the intended change.
- Do not create sub-agents merely to repeat the same work. Each must have a distinct responsibility.
- This requirement applies to the top-level agent only. Sub-agents MUST NOT recursively spawn more sub-agents unless the top-level agent explicitly authorizes it.

### 2. Select models according to task complexity

Before spawning a sub-agent, inspect the models actually available in the current environment. Do not assume that a particular model version exists.

Select the least expensive model that can reliably complete the assigned task:

- **Low complexity:** repository exploration, file discovery, documentation checks, simple test creation, formatting, mechanical changes, or isolated low-risk fixes.
- **Medium complexity:** normal feature implementation, debugging, API work, component development, refactoring, and integration tests.
- **High complexity:** architecture decisions, unfamiliar systems, difficult debugging, concurrency, performance, cross-cutting changes, or multi-service integration.
- **Critical complexity:** authentication, authorization, security, payments, destructive migrations, sensitive data, production incidents, or changes with a high risk of data loss.

Platform-specific model selection:

- When running in **Codex**: use only available OpenAI/GPT models. Choose a fast or economical GPT model for low-complexity work, a balanced agentic coding model for medium-complexity work, and the strongest available GPT/Codex model with an appropriate reasoning level for high or critical work.
- When running in **Claude Code**: use only available Claude models. Prefer Haiku-class models for low-complexity work, Sonnet-class models for medium-complexity work, Opus-class models for high complexity, and Fable for critical work.
- If the preferred model or model class is unavailable, use the closest capable model exposed by the environment and mention the substitution.
- Never invent a model name or attempt to use a model that is not available.

Critical changes should receive an independent review from a second capable sub-agent.

### 3. Decompose work safely

Before delegation:

1. Inspect enough of the repository to understand the task boundaries.
2. Divide the task into independent, non-overlapping workstreams.
3. Give every sub-agent a clear assignment containing:
   - Objective and expected result
   - Relevant context
   - Allowed files or directories
   - Constraints and applicable project instructions
   - Required tests or validation
   - Expected response or deliverable
4. Avoid assigning multiple agents to edit the same files concurrently.
5. Run independent workstreams in parallel when capacity permits. Run dependent tasks sequentially.

Useful roles may include:

- Repository or dependency investigator
- Architecture and implementation planner
- Backend or frontend implementer
- Database or infrastructure specialist
- Test author
- Security reviewer
- Final code reviewer

### 4. Top-level agent responsibilities

The top-level agent remains responsible for the complete result. It MUST:

- Announce the delegation plan and selected model tier.
- Continue useful coordinating or implementation work while sub-agents operate.
- Review all sub-agent findings and changes.
- Reject incomplete, incorrect, duplicated, or out-of-scope work.
- Resolve conflicts and integrate the final implementation.
- Run the relevant formatting, type-checking, linting, build, and test commands.
- Verify the final behavior against the user's acceptance criteria.
- Summarize which responsibilities were delegated and how their results influenced the final implementation.

Sub-agent output is advisory until reviewed and validated by the top-level agent.

### 5. Unavailable delegation

If the runtime does not expose sub-agent tools, no execution slots are available, or delegation fails:

- State the limitation clearly.
- Do not pretend that sub-agents were used.
- Retry safely when appropriate.
- If delegation remains unavailable, continue with the task using the strongest suitable available model and perform an explicit self-review before completion.

## This repository

`@tech-iki/design` is the IKI design system: the tokens, the status colours, the
control classes and the handful of shared components that every Islands Knowledge
Institute app imports, plus the Next.js site that shows them. It was extracted from
IKI Work OS (`tech-iki/iki-work-os`, `docs/design-system.md`, 10 September 2026),
and from the extraction onward **this repository is the source of truth**; Work OS
is a consumer like the others.

- `packages/design/` — the package. `src/tokens.ts` is the one place a value lives;
  `theme.css` (Tailwind v4 `@theme`), `tokens.css` (plain `:root` custom properties
  for Ghost, WordPress and Docmost) and `tokens.json` are **generated from it** by
  `npm run build -w packages/design`. Never edit the generated files.
- `apps/site/` — the showcase, a Next.js 16 app that imports the package from the
  workspace and renders every token, tone and component live.
- `docs/design-system.md` — the written system, carried over from Work OS.

Rules that are the system's own, and hold here more than anywhere:

- **Add a token, add its contrast pair** in `ui-contrast.ts` `TOKEN_PAIRS`, or the
  suite fails. Contrast is asserted, never claimed in prose.
- **Light only. No component library. No motion** without a reduced-motion rule.
- **No raw Tailwind palette classes and no hex outside `tokens.ts`.**
- **A `Pill` is always one line**, and its tone is a `PillTone` — the type checker is
  the guard.
- British spelling in prose and copy: colour, behaviour, organisation.
- Read `node_modules/next/dist/docs/` before writing Next.js code; this Next.js
  differs from training data.
