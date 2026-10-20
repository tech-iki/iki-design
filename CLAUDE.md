@AGENTS.md

# Claude Code Instructions

The canonical shared instructions are imported above from `AGENTS.md`.
Everything below is Claude-specific and applies in addition to them.

<!-- BEGIN MANAGED PROJECT WORKFLOW REFERENCE -->

## Mandatory Project Workflow

Before analyzing, planning, editing, testing, committing, opening or updating a pull request, releasing, or deploying, read and follow [PROJECT_WORKFLOW.md](./PROJECT_WORKFLOW.md).

The workflow is mandatory for the entire task, including scope control, validation, versioning, release management, staging deployment, manual production promotion, production verification, rollback, approval boundaries, and completion reporting.

A production deployment must never be inferred from permission to implement, commit, push, open a pull request, merge, create a release, or deploy to staging. Production requires current successful staging evidence and a separate manual human trigger or approval.

If this workflow conflicts materially with more specific repository instructions, do not silently choose between them. Follow higher-priority instructions, retain the stronger safety requirement, and ask for clarification.

<!-- END MANAGED PROJECT WORKFLOW REFERENCE -->
