# Implementation plan

## Current status

The repository has a deliberately narrow standalone JavaScript API, CLI, and
stdio MCP server. It does not claim Dataview or Breadcrumbs parity.

## Current

- [x] Draft requirements, component boundaries, architecture, and upstream
  research notes.
- [x] Record exact candidate revisions, licenses, and source/build/runtime
  smoke-test evidence in the upstream research notes.
- [x] Review the official Obsidian API and extended typings as host-bridge
  references; neither package supplies an Obsidian runtime.
- [x] Renegotiate the first implementation as a project-defined subset, and
  document its folder-query and direct-edge semantics without a parity claim.
- [x] Review focused Dataview unit tests for query grammar and Markdown
  parsing; use their cases as reference, not as an upstream oracle.
- [x] Implement the shared JavaScript API, read-only vault index, direct
  configured edges, resource limits, and lifecycle/refresh errors; add
  focused fixture and filesystem-boundary tests.
- [x] Add and document reproducible install and test commands.
- [x] Implement the CLI as a thin client of the shared API, including
  machine-readable output, error reporting, and API-equivalence tests.
- [x] Implement stdio MCP as a thin client of the shared API, with a
  startup-bound vault, structured results, and SDK integration tests.

## Next

- [ ] Expand negative and filesystem-race coverage and verify the runtime
  matrix before describing the initial implementation as release-ready.

## Tentative future

- [ ] Consider expanding query and relationship features only after
  documenting their project-defined semantics and adding fixtures. Any future
  upstream parity claim still requires oracle evidence at pinned revisions.

Future steps are tentative and should be revised when the compatibility spike
changes scope or technical decisions.
