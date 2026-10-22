# Project Workflow

> Reusable, agent-agnostic workflow instructions for coding projects using GitHub. Customize every project-specific field before use. This workflow covers the complete path from task intake through versioned release, staging, manual production promotion, verification, and closeout.

## Mandatory Delivery Policy

- Every deployable project must publish versioned software.
- Every production deployment must identify an immutable release version, source commit, and build artifact.
- Every release candidate must be deployed to staging and verified there before production.
- Production deployment must be a separate manual human-triggered or human-approved action.
- Production must use the exact artifact that passed staging; do not rebuild between environments.
- Any code, dependency, configuration, migration, or artifact change after staging verification invalidates that verification and requires a new staging deployment.
- Never deploy directly from a developer workstation or feature branch to production.
- A merge, successful CI run, or staging deployment does not mean the change is shipped.

## Core Principles

- GitHub Issues are the source of truth for tasks, requirements, and acceptance criteria when an issue exists.
- Work on one clearly scoped issue at a time unless related work has been explicitly grouped.
- Inspect and understand the relevant code, tests, configuration, and delivery path before editing.
- Prefer the smallest complete, maintainable change that satisfies the task.
- Preserve existing behavior unless the task explicitly requires a change.
- Determine and fix root causes rather than treating only symptoms.
- Never discard, overwrite, commit, or reformat unrelated user changes.
- Use existing project scripts and conventions instead of inventing replacement workflows.
- Report the exact delivery state and never imply that unverified work is complete.

## Instruction Precedence and Conflicts

Follow higher-priority platform and safety instructions first. Within the project:

1. The current user request and explicit approvals
2. Scoped repository instructions such as AGENTS.md or CLAUDE.md
3. CONTRIBUTING.md, SECURITY.md, architecture decisions, and other project policies
4. The active issue, its acceptance criteria, and later comments that explicitly revise it
5. This workflow and established repository conventions

Do not silently resolve a material conflict between instructions, the issue, documentation, and existing behavior. Describe the conflict and request clarification.

## Task Authority

Do not infer permission for a later workflow stage from permission for an earlier one.

| Task mode | Permitted work |
| --- | --- |
| Review or diagnose | Read, inspect, run non-mutating diagnostics, and report findings |
| Implement | Make scoped local edits and run validation |
| Commit | Create local commits after implementation approval includes committing |
| Share | Push a branch or create or update a pull request when explicitly authorized |
| Merge | Merge only when explicitly authorized and all merge gates pass |
| Stage | Deploy the approved release candidate to staging when authorized or when the configured pipeline does so automatically |
| Production | Trigger or approve production only after staging verification and a separate human decision |

Authorization may be included in the original request when it clearly names the action and scope. Do not repeatedly request the same approval. Production is the exception: it must remain a separate manual gate after current staging evidence is available.

## Workflow States

Use these terms consistently:

1. **Planned** — scope and approach are understood.
2. **Locally implemented** — code is changed and local validation is complete.
3. **Committed** — approved local commits exist.
4. **PR open** — the branch is pushed and a pull request exists.
5. **Merge ready** — required checks and reviews pass and no blocking discussion remains.
6. **Merged** — the approved change is on the release branch.
7. **Staging deployed** — the immutable candidate is running in staging.
8. **Staging verified** — required staging tests and acceptance checks pass.
9. **Production deployed** — a human manually promoted the verified candidate.
10. **Production verified** — post-deployment health checks and monitoring pass.
11. **Released** — the version and release record are published and the task is closed according to project policy.

Do not use **complete**, **shipped**, or **released** without identifying the applicable state.

## Project Configuration

Every value below was verified against this repository on 20 October 2026. **NONE** means a
verified absence and **not yet configured** means the infrastructure does not exist yet — do not
substitute a plausible-sounding value to fill either gap.

### Repository

- Repository name: tech-iki/iki-design
- Primary remote: origin
- Default branch: main
- Release branch: main
- Branch format: `issue-{number}-{short-description}`; `docs/*` and `chore/*` also occur
- Issue required before implementation: yes when an issue exists — GitHub Issues are the source of truth
- Merge method: squash
- Required approving reviews: **NONE enforced by GitHub** — no branch protection has been configured yet.
  Review is a policy obligation, not a platform gate.
- Required CI checks: the `CI` workflow's jobs — `verify` (lint, type-check, test, build),
  `audit` (dependency audit), `secrets` (gitleaks over full history). None are enforced by branch protection.
- Code owner or protected paths: none
- Generated paths that must not be edited: `packages/design/dist/` (built from `packages/design/src/`),
  `apps/site/.next/`, `apps/site/next-env.d.ts`

### Toolchain and Setup

- Package manager: npm, with npm workspaces (`packages/*`, `apps/*`); one `package-lock.json` at the root
- Runtime and version: **Node 24.13.1**, pinned in `.nvmrc` (CI pins `node-version: 24`)
- Version manager: nvm, via `.nvmrc`
- Immutable install command: npm ci
- Development command: `npm run dev` (the showcase site, which imports the package from the workspace;
  `npm run build -w packages/design` first, or `npm run dev -w packages/design` alongside it for a watch)
- Required local services: none
- Test data or seed command: none

### Validation

- Targeted test command: `npm test -- {path}` (vitest)
- Unit test command: `npm test` (vitest, across the workspaces)
- Integration test command: none
- End-to-end test command: none
- Lint command: `npm run lint`
- Type-check command: `npm run typecheck`
- Formatting check command: **NONE — this repository has no formatter.** Never run one it does not own.
- Formatting fix command: NONE
- Production build command: `npm run build` (the package, then the site)
- Package or artifact validation command: `npm pack --dry-run -w packages/design` (lists exactly what would publish)
- Security scan command: `npm audit --audit-level=high --omit=dev` (the CI gate; a bare `npm audit` is advisory)
- Accessibility or visual test command: `npm test -- packages/design/src/ui-contrast.test.ts` — every
  foreground/background pair the system renders is asserted against its WCAG threshold; there is no
  browser-driven visual runner

### Versioning and Release

- Versioning scheme: Semantic Versioning 2.0.0
- Version source of truth: `packages/design/package.json`'s `"version"` field. The site is unversioned.
- Version bump strategy: manual, in a version-bump PR to `main`. Minor for a new token, tone or component;
  patch for a value correction that keeps every name; major for a renamed or removed token or class.
- Tag format: v{major}.{minor}.{patch}
- Changelog path: CHANGELOG.md
- Release notes source: the version's `CHANGELOG.md` section
- Build artifact type: npm package (`@tech-iki/design` tarball) and a static Next.js site
- Artifact registry or storage: **not yet configured.** The intended registry is npmjs.com under the
  `@tech-iki` scope; no npm account is logged in on the development machine and the scope has not been
  claimed. Until it is, consumers install the release tarball: `"@tech-iki/design": "https://github.com/tech-iki/iki-design/releases/download/v0.5.0/tech-iki-design-0.5.0.tgz"`
  with the package built by its `prepare` script.
- Artifact digest or checksum command: `npm pack --json -w packages/design` (reports `integrity` and `shasum`)
- Software bill of materials command: none
- Release creation command or workflow: `.github/workflows/release.yml` ("Release asset") on a pushed `v*`
  tag, or run by hand for an existing tag. It verifies the tarball's version equals the tag and that it holds
  `dist/theme.css`, then creates or updates the GitHub Release with `tech-iki-design-X.Y.Z.tgz` and its `.sha256`.
  `npm publish --access public -w packages/design` from CI is still intended once the registry exists.

### Deployment

- Staging environment name: **not yet configured** — the site has no hosting yet
- Staging URL or endpoint: not yet configured
- Staging deployment workflow: not yet configured
- Staging smoke-test command: not yet configured
- Staging integration or end-to-end command: none
- Staging approval owner: Brian
- Production environment name: not yet configured
- Production URL or endpoint: not yet configured
- Manual production workflow: not yet configured
- Production smoke-test command: not yet configured
- Production health checks: not yet configured
- Monitoring dashboard and alerts: none
- Minimum observation period: NONE stated
- Rollback workflow: not yet configured. For the package, a rollback is consumers pinning the previous
  tag; a published npm version is never unpublished, it is superseded.
- Last-known-good release lookup: the newest tag whose `CHANGELOG.md` section is not marked as withdrawn

### Data, Configuration, and Operations

- Database migration command: none — there is no database
- Migration validation command: none
- Backup or restore procedure: none — the repository is the only state
- Feature flag system: none
- Required environment variables: none
- Observability requirements: none

## Starting a Task

When beginning work:

1. Confirm that the current directory is the intended repository.
2. Confirm the repository and remote:

   ~~~bash
   git rev-parse --show-toplevel
   git remote get-url origin
   gh repo view
   ~~~

3. Check authentication when GitHub access is needed:

   ~~~bash
   gh auth status
   ~~~

4. Check the branch and working tree:

   ~~~bash
   git branch --show-current
   git status --short
   ~~~

5. If unrelated changes exist, identify them before switching branches or editing. Do not stash, commit, move, format, or discard them automatically.
6. Read the relevant scoped instructions, including AGENTS.md, CLAUDE.md, CONTRIBUTING.md, SECURITY.md, README files, architecture decisions, package manifests, and CI or deployment configuration.
7. When an issue exists, load its full description and discussion:

   ~~~bash
   gh issue view {number} --comments
   ~~~

8. If no issue exists, follow the configured project policy. Do not invent an issue number.
9. Fetch the latest remote state before creating a branch or reviewing a branch diff:

   ~~~bash
   git fetch origin {default-branch}
   ~~~

10. Compare the local branch with the remote base. Do not pull, merge, or rebase automatically when the histories differ.
11. Create the task branch from the verified base only after the working tree is understood:

   ~~~bash
   gh issue develop {number} --checkout
   ~~~

   Or, when issue development is not used:

   ~~~bash
   git switch -c issue-{number}-{short-description} origin/{default-branch}
   ~~~

12. Confirm the resulting branch and working tree again.

## Definition of Ready

Before substantial editing, identify:

- The objective and user-visible outcome
- Testable acceptance criteria
- Explicit non-goals
- Relevant constraints and compatibility requirements
- Reproduction steps and current behavior for a bug
- Expected behavior
- Dependencies and linked issues or pull requests
- Likely affected code, callers, tests, data, and documentation
- Security, privacy, accessibility, performance, and operational impact
- Version-bump expectation
- Staging verification approach
- Production rollout and rollback approach
- Ambiguities or missing information

Ask for clarification when uncertainty could materially change behavior, security, data, public interfaces, release scope, or deployment risk.

## Change Risk Classification

Classify the task before implementation:

### Low Risk

Examples include documentation, tests without runtime changes, and small internal refactors with unchanged behavior.

### Medium Risk

Examples include user-interface behavior, backward-compatible API changes, dependency updates, performance changes, and feature-flagged functionality.

### High Risk

Examples include authentication, authorization, payments, sensitive data, destructive operations, public breaking changes, database migrations, infrastructure, deployment workflows, secrets, and production configuration.

Higher-risk work requires stronger tests, explicit rollback planning, appropriate reviewers, and longer staging or production observation. When uncertain, use the higher classification.

## Planning and Agent Coordination

Form a concise plan that maps:

- Each acceptance criterion to an implementation change
- Each changed behavior to a test
- Each operational risk to a mitigation
- The expected version bump
- The staging evidence required before production

When agent-specific instructions require sub-agents or parallel work:

- The primary agent retains responsibility for scope, integration, final review, and validation.
- Delegate bounded, independent tasks with clear deliverables and file ownership.
- Choose models according to task complexity using AGENTS.md or CLAUDE.md, keeping model-specific rules out of this agent-agnostic document.
- Avoid concurrent edits to the same files.
- Require each sub-agent to report findings, changed files, commands run, failures, and remaining risks.
- Independently inspect every delegated change before accepting it.
- Do not allow delegated agents to push, create pull requests, merge, release, or deploy unless that exact remote action was explicitly assigned and authorized.

## Investigation

Before editing:

1. Locate the implementation, callers, tests, configuration, schemas, and related types.
2. Review nearby patterns and recent relevant changes.
3. Understand public interfaces and backward-compatibility expectations.
4. Reproduce a reported bug when feasible.
5. For a bug fix, create or identify a test that fails for the reported behavior before applying the fix when practical.
6. Determine the root cause.
7. Inspect the build, release, staging, and production path affected by the change.
8. Confirm that the planned scope is the smallest complete solution.

Do not perform broad refactors unless necessary for the task or explicitly requested.

## Implementation

- Keep changes tightly scoped to the task.
- Follow existing architecture, naming, formatting, accessibility, logging, and error-handling conventions.
- Do not edit generated files directly.
- Add or update tests for every changed behavior.
- Include regression coverage for bug fixes unless technically impossible.
- Handle relevant error states, boundary conditions, retries, and failure modes.
- Preserve backward compatibility unless a breaking change is explicitly approved and reflected in the version.
- Update documentation when public behavior, configuration, interfaces, setup, operations, or developer workflows change.
- Add observability for new operationally significant behavior.
- Remove debug statements, temporary flags, test credentials, and local-only artifacts before review.
- Pause and report unexpected repository state, destructive operations, security concerns, or material scope expansion.

### Dependencies

When adding or changing a dependency:

- Explain why existing code or dependencies are insufficient.
- Use the project package manager and preserve lockfile integrity.
- Do not edit generated lockfiles manually.
- Check compatibility, maintenance status, license requirements, and known vulnerabilities.
- Review transitive dependency changes.
- Pin versions according to project policy.
- Include dependency and lockfile changes in security review.

### APIs, Schemas, and Migrations

For public API, configuration, database, or schema changes:

- Document compatibility and consumer impact.
- Prefer additive, backward-compatible changes.
- Use expand, migrate, and contract phases when one-step change is unsafe.
- Make migrations repeatable or safely resumable where supported.
- Test migrations against representative data.
- Define backup, restore, rollback, or roll-forward behavior before staging.
- Never assume reverting application code will reverse a data migration.
- Require explicit approval for destructive or irreversible migrations.

## Validation

Run the narrowest relevant checks first, then all configured mandatory checks.

1. Reproduction or regression test
2. Targeted tests
3. Static analysis, lint, and type checking
4. Unit tests
5. Integration tests
6. End-to-end tests
7. Formatting check
8. Production build
9. Package or artifact validation
10. Security and dependency checks

The project's required checks are mandatory, not optional. If a required check cannot run:

- State the exact skipped check.
- Explain why it could not run.
- Describe alternative verification.
- Identify the remaining risk.
- Do not mark the change merge ready unless project policy explicitly permits the exception.

Apply conditional checks:

| Change type | Additional verification |
| --- | --- |
| User interface | Supported viewports, keyboard use, accessibility, loading, empty and error states, and visual evidence |
| API | Contract, authentication, authorization, validation, error shape, compatibility, and integration tests |
| Dependency | Manifest and lockfile review, vulnerability check, license check, and production build |
| Database | Migration rehearsal, representative data, backup or recovery plan, and backward-compatible deployment sequence |
| Infrastructure or CI | Syntax validation, least-privilege review, dry run or plan output, and rollback |
| Security-sensitive | Threat-focused review, negative tests, secret scan, and appropriate human reviewer |
| Performance-sensitive | Relevant benchmark, resource use, and regression comparison |

Do not claim that a check passed unless it was actually run successfully.

## Diff and Artifact Review

Before committing, inspect all staged and unstaged work:

~~~bash
git status --short
git diff --check
git diff --cached --check
git diff HEAD
git diff --stat HEAD
~~~

Before pushing or opening a pull request, require a clean intended working tree, fetch the current base, and inspect the complete branch diff:

~~~bash
git fetch origin {default-branch}
git status --short
git diff --check origin/{default-branch}...HEAD
git diff --stat origin/{default-branch}...HEAD
git diff origin/{default-branch}...HEAD
~~~

Confirm that the final diff and artifact contain no:

- Secrets, credentials, private data, or sensitive logs
- Debug statements or temporary bypasses
- Accidental or unrelated files
- Unexplained generated changes
- Unintended lockfile changes
- Environment-specific values
- Build output that should not be committed

Use configured secret scanning and artifact inspection; visual diff review alone is not sufficient.

## Commits

- Keep commits focused, reviewable, and logically complete.
- Use the repository's established commit convention.
- Explain intent rather than restating filenames.
- Reference the issue when appropriate.
- Do not commit automatically unless authorized.
- Do not rewrite pushed or shared history without explicit approval.
- Do not amend or rebase when it could overwrite another contributor's work.
- Sign commits when required by project policy.

Suggested format:

~~~text
{type}({scope}): {concise description}

Refs #{issue-number}
~~~

## Push

Pushing is a separate remote mutation and requires authorization unless already included in the active request.

Before pushing:

1. Confirm the intended branch.
2. Confirm all intended commits and the complete diff.
3. Confirm required local checks.
4. Confirm no unrelated local changes will be included.
5. Push without force:

   ~~~bash
   git push --set-upstream origin {branch}
   ~~~

6. Verify that the remote branch points to the expected commit.

Never allow a pull-request command to perform an unreviewed implicit push.

## Pull Requests

Before creating or updating a pull request:

1. Review the complete branch diff against the current remote base.
2. Run all required validation commands.
3. Confirm the proposed version impact.
4. Check for accidental, generated, dependency, migration, or workflow changes.
5. Review existing pull requests and repository templates for conventions.
6. Prepare the exact title and body for approval.

Use **Refs #{issue-number}** by default. Use **Closes #{issue-number}** only when the user explicitly approves closing on merge and project policy defines merged as done. When production verification defines done, close the issue after production verification instead.

Suggested PR body:

~~~md
## Summary

- {what changed}
- {why it changed}

## Acceptance Criteria

- [ ] {criterion and evidence}

## Changes

- {implementation detail}

## Versioning

- Current version: {version}
- Proposed version: {version}
- Bump: {major, minor, or patch}
- Changelog: {updated, not yet required, or explanation}

## Verification

- [x] {successful command}
- [ ] {skipped or pending command and reason}

## Deployment

- Staging plan: {plan}
- Production promotion: Manual only
- Migration or configuration impact: {details or none}

## Rollback

- {last-known-good version and procedure}

## Risks

- {known risk or None identified}

## Visual Evidence

- {screenshots, recording, preview URL, or Not applicable}

Refs #{issue-number}
~~~

Create a draft PR only after authorization:

~~~bash
gh pr create --draft --title "{title}" --body-file {file}
~~~

Checkboxes and verification statements must reflect actual results.

## CI and Review

Inspect pull request and workflow status with:

~~~bash
gh pr checks
gh run list --limit 10
gh run view {run-id} --log-failed
gh run watch {run-id}
~~~

When CI fails:

1. Identify the first causal failure rather than downstream noise.
2. Reproduce it locally when possible.
3. Determine whether it is caused by the current change, a pre-existing failure, an infrastructure failure, or a proven flaky test.
4. Implement the smallest appropriate fix.
5. Rerun the relevant local checks.
6. Review the resulting complete diff before another push.
7. Rerun CI without a code change only when there is evidence of a transient infrastructure or flaky-test failure.

Do not repeatedly rerun CI without understanding the failure.

A pull request is merge ready only when:

- All required checks pass.
- Required reviewers, including code owners, have approved.
- Requested changes are addressed.
- Blocking conversations are resolved.
- The branch satisfies the configured freshness or merge-queue policy.
- Versioning, changelog, release, deployment, migration, and rollback information are complete.
- The final reviewed commit is the commit that will be merged.

## Merge

Merging requires explicit authorization.

Before merging:

1. Reconfirm the pull request number, source branch, target branch, title, and version impact.
2. Confirm merge-readiness requirements.
3. Use the configured merge method.
4. Do not bypass protected-branch, review, CI, security, or deployment rules.
5. Record the resulting merge commit or release commit SHA.

The normal pipeline may deploy the merged release candidate automatically to staging. It must never deploy automatically to production.

## Mandatory Versioning

All deployable applications, services, libraries, command-line tools, websites, infrastructure bundles, and mobile builds must use [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).

### Version Rules

- Use MAJOR.MINOR.PATCH.
- Increment MAJOR for incompatible public behavior or breaking changes.
- Increment MINOR for backward-compatible functionality.
- Increment PATCH for backward-compatible fixes, maintenance, configuration-only production changes, and security fixes that do not introduce breaking behavior.
- Use prerelease identifiers such as -alpha.N, -beta.N, or -rc.N when publishing test candidates.
- Add build metadata only when useful for traceability; do not use it to replace a required version bump.
- Each deployable in a monorepo must document whether versions are independent or released in lockstep.
- Mobile applications must pair the semantic version with the platform's monotonically increasing build number.
- Container images must be tagged with the release version and resolved by immutable digest; do not rely on latest.
- A production deployment must expose or report its release version and commit SHA through an endpoint, metadata screen, CLI flag, deployment record, or equivalent.
- Never assign the same version to different source or artifact contents.
- Never move or reuse a published release tag.
- A rollback redeploys an existing, previously verified version and is recorded as a new deployment event, not a rewritten release.
- A fix following a failed production release must receive a new patch version.

### Version Source of Truth

- Maintain one authoritative version location.
- Keep secondary manifests synchronized through project tooling.
- Do not manually edit generated version files.
- Determine the required bump from all changes since the previous production release.
- Include the version change in the release candidate or release pull request.
- Verify the runtime-reported version against the intended version.

### Changelog and Release Notes

Every production version must include:

- A CHANGELOG.md entry
- A concise user-facing summary
- Added, changed, deprecated, removed, fixed, and security notes as applicable
- Breaking-change and migration instructions
- Linked issues and pull requests
- Known limitations
- Upgrade and rollback instructions

Do not expose confidential vulnerability details before coordinated disclosure.

### Immutable Release Record

Each published release must record:

- Semantic version
- Git tag
- Exact source commit SHA
- Artifact name, identifier, digest, or checksum
- Build date and release date
- Included issues and pull requests
- Required migrations or configuration changes
- Staging verification evidence
- Production deployment result
- Known risks
- Last-known-good rollback version

Publish a GitHub Release or equivalent release record for every production version. Attach checksums, signed artifacts, provenance, and a software bill of materials when supported by the project.

### Build Once, Promote the Same Artifact

1. Determine or reserve the target version.
2. Build the release candidate once from the reviewed commit.
3. Record the commit SHA and artifact digest or checksum.
4. Scan and validate the artifact.
5. Deploy that exact artifact to staging.
6. After staging succeeds, manually promote the same digest or immutable artifact to production.
7. Publish or finalize the release record according to project policy.

Do not rebuild the artifact for production. If source, dependencies, build inputs, generated output, migrations, or artifact bytes change, create a new candidate and repeat staging.

## Staging Deployment

Staging is mandatory for every production release.

Before staging:

- The release candidate is merged or otherwise built from the approved release commit.
- CI and required security checks pass.
- The target version, commit SHA, and artifact digest are known.
- Required environment variables and secrets are configured without exposing their values.
- Database migration, backup, rollback, and feature-flag plans are documented when relevant.
- The staging environment and deployment target are explicitly identified.

Deploy the immutable candidate using the configured staging workflow. A merge may trigger staging automatically if the project is configured that way.

After staging:

1. Verify the deployed version, commit SHA, and artifact digest.
2. Run staging smoke tests.
3. Run required integration and end-to-end tests.
4. Validate migrations and backward compatibility.
5. Confirm acceptance criteria in the deployed environment.
6. Check logs, metrics, traces, health checks, queues, scheduled jobs, and integrations as relevant.
7. Record results, failures, screenshots, URLs, and remaining risks.
8. Obtain the required staging acceptance.

Any material change after these checks returns the workflow to a new release candidate and staging deployment.

## Manual Production Promotion

Production must never be triggered automatically by a push, merge, tag, release creation, or successful staging job.

After staging verification, present the human approver with:

- Release version
- Commit SHA
- Artifact digest or immutable identifier
- Staging deployment identifier and URL
- Staging checks and results
- Migration and configuration impact
- Known risks
- Last-known-good version
- Rollback procedure

The human must then manually trigger or approve the configured production workflow. Use a protected production environment, workflow dispatch, or equivalent manual gate.

The production workflow must:

- Require the exact version and immutable artifact verified in staging.
- Verify the selected target is production before making changes.
- Reject artifacts without successful current staging evidence.
- Prevent overlapping production deployments.
- Apply least-privilege credentials.
- Prevent the initiating agent or automation from bypassing the manual gate.
- Avoid unreviewed changes to secrets, environment variables, migrations, or feature flags.
- Record the approver, time, version, commit, artifact, and deployment result.

Production publication to a package registry, app store, container registry channel, or public download channel is also a production action and must follow this gate.

## Production Verification and Monitoring

Immediately after production deployment:

1. Confirm the deployed version, commit SHA, and artifact digest.
2. Run the configured production smoke tests.
3. Verify application health and critical user journeys.
4. Confirm database migration and background-job health.
5. Review logs, error rates, latency, resource use, queues, and alerts.
6. Check external integrations and scheduled work as applicable.
7. Observe for the configured minimum period.
8. Record the deployment and verification results.

If a critical check fails, stop the rollout, preserve evidence, and execute the approved rollback or roll-forward plan. Do not describe the release as successful until production verification passes.

## Rollback and Roll-Forward

Every production release must have a tested or reviewed recovery plan.

- Define objective rollback triggers before production.
- Prefer redeploying the last-known-good immutable version.
- A previous version may be manually redeployed without repeating staging only when that exact artifact previously passed staging and has not changed.
- Production rollback still requires a manual trigger or approval.
- Do not move tags, overwrite artifacts, or reuse version numbers during rollback.
- Treat data migrations separately from application rollback.
- Use roll-forward when reversing data or schema changes is unsafe.
- Preserve logs, deployment IDs, timestamps, and affected versions for incident review.
- Publish a new patch version for corrective code changes.
- Create follow-up work for temporary mitigations or deferred cleanup.

## Security and Supply Chain

- Enable and respect secret scanning and push protection where available.
- Run configured code scanning and dependency review.
- Review manifest and lockfile changes.
- Pin third-party automation according to project policy.
- Use least-privilege workflow permissions and short-lived credentials where supported.
- Do not place secret values in code, issues, pull requests, release notes, commands, screenshots, artifacts, or logs.
- Scan release artifacts before staging.
- Generate checksums, provenance, signatures, and a software bill of materials when supported.
- Review third-party agent extensions, plugins, skills, tools, integrations, packages, and CI actions before trusting them with project permissions.
- Never bypass a security control merely to make a check or deployment pass.

## GitHub Task Tracking

- Treat the active issue and approved acceptance criteria as authoritative unless explicitly revised.
- Do not post routine progress comments unless requested.
- Before posting an issue or pull-request comment, show the proposed text unless the action was already authorized.
- Do not change labels, assignees, milestones, issue state, or GitHub Project fields without authorization.
- Map final evidence to every acceptance criterion.
- Link pull requests with Refs #{number} by default.
- Close the issue only at the project's defined done state. For this workflow, the recommended default is after production verification and release publication.
- When closing, include the release version and production verification result.

## Context and Handoffs

Maintain three context layers:

1. **Stable project context** — conventions, commands, architecture, delivery policy, and safety rules in repository documentation.
2. **Task context** — the active issue, acceptance criteria, relevant comments, and linked pull requests.
3. **Working context** — investigation results, decisions, changed files, test results, commits, release candidate, deployments, and remaining work.

Keep context focused:

- Load only relevant issues and linked material.
- Summarize long logs while retaining identifiers and causal errors.
- Record durable project knowledge in repository documentation rather than relying on chat history.
- Use a separate session for each substantial issue when supported.
- Do not commit temporary handoff notes unless the project intends to retain them.

A handoff must preserve:

~~~text
Objective and acceptance criteria
Key decisions and unresolved questions
Risk classification
Branch, base branch, commit SHA, and pull request
Modified files
Commands and test results
Proposed version and changelog status
Artifact identifier and digest
Staging and production status
Migration, monitoring, and rollback details
Remaining work and exact next action
~~~

## Completion Report

At every stopping point, report:

1. **State** — the exact workflow state
2. **Summary** — what changed and why
3. **Files changed** — important modified files
4. **Acceptance criteria** — status and evidence for each
5. **Verification** — commands and actual results
6. **Version** — current, proposed, or released version
7. **Git** — branch, commit, push, and pull-request status
8. **Release artifact** — identifier and digest when built
9. **Deployment** — staging and production status
10. **Risks** — limitations, skipped checks, and operational concerns
11. **Rollback** — last-known-good version and readiness
12. **Next action** — the precise approval or follow-up required

Do not state that work is fully complete when required validation, staging, production deployment, or production verification has failed or remains pending.

## Safety and Approval Boundaries

Require explicit authorization before:

- Creating commits unless already included in the implementation request
- Pushing commits
- Creating or updating a pull request
- Posting GitHub comments
- Changing labels, milestones, assignees, issue state, or project fields
- Merging a pull request
- Creating or publishing tags, releases, packages, or public artifacts
- Deploying to staging unless the approved pipeline performs it automatically
- Triggering rollback or roll-forward procedures
- Changing remote configuration, secrets, feature flags, infrastructure, or databases
- Deleting branches, releases, tags, environments, infrastructure, or remote resources
- Rewriting shared history
- Running destructive or irreversible data, infrastructure, or deployment operations

Production has an additional non-bypassable rule: a human must manually trigger or approve it after reviewing current staging evidence.

The following are prohibited rather than approval-gated:

- Exposing credentials, tokens, secret values, private logs, personal data, or other sensitive information
- Bypassing branch, CI, review, security, staging, or production protections
- Force-pushing protected or shared branches
- Deploying an artifact that differs from the one verified in staging
- Reusing a version for different contents
- Moving or replacing a published release tag
- Hiding failed or skipped checks
- Discarding unrelated user work

For a destructive action, resolve and verify the exact target, assess recovery, and obtain confirmation immediately before execution. Prefer reversible operations and preserve evidence needed for recovery.
