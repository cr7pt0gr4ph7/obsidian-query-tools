# Implementation plan

## Current status

This repository is a documentation-only design draft. There is no application,
dependency setup, or project build, lint, or test command. The first
implementation decision is gated on verifying whether the pinned upstream
plugins can be reused outside Obsidian.

## Current

- [x] Draft requirements, component boundaries, architecture, and upstream
  research notes.
- [ ] Resolve the upstream integration feasibility questions and record
  evidence, exact revisions, license handling, compatibility limits, and
  recommended integration approach.

## Next

- [ ] Run a small compatibility spike for Dataview and Breadcrumbs separately,
  then test their interoperation against representative fixtures and
  same-revision Obsidian results.
- [ ] Decide and document the initial supported query/graph subset, runtime
  matrix, serialization contract, resource limits, and error policy.
- [ ] Update requirements and design to reflect those decisions before
  committing to an implementation approach.

## Tentative future

- [ ] Implement the shared JavaScript API, vault access, index lifecycle, and
  upstream adapters with read-only and path-boundary safeguards.
- [ ] Build the CLI and MCP server as thin interfaces over the shared API.
- [ ] Add and document reproducible build, lint, and test commands; test
  upstream parity, interface equivalence, refresh behavior, limits, and
  security boundaries.
- [ ] Publish a compatibility matrix and document unsupported behavior before
  describing any plugin parity or release readiness.

Future steps are tentative and should be revised when the compatibility spike
changes scope or technical decisions.
