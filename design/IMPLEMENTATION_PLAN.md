# Implementation plan

## Current status

The repository has a deliberately narrow TypeScript implementation exposing a
standalone JavaScript API, CLI, and stdio MCP server. It does not claim
Dataview or Breadcrumbs parity.
The CLI and MCP prototypes were implemented before the API approval gate was
specified. The user approved API readiness for the proposed-console contract
test seam in this PR only; this does not approve production integration or
broader query semantics.

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
- [x] Verify the suite on Node 24.22.3 and 26.13.0 on Linux.
- [x] Add an unprivileged unreadable-file API test.
- [x] Import the pinned upstream Dataview test-vault Markdown data as an API
  fixture, excluding bundled plugin code, and test the supported folder form.
- [x] Convert implementation and tests to TypeScript and expose generated
  JavaScript and type declarations via the package entry point.
- [x] Add a push-triggered GitHub Actions workflow for Node 24 and 26.
- [x] Specify a proposed console query interface independently of the
  prototype, including output formats, vault and current-file selection, and
  a safety gate for requested JavaScript modes:
  [console specification](notes/2026-11-19-console-interface.md).
- [x] Add an injectable proposed-console command runner and mocked-API unit
  tests for argument/input handling, API dispatch, output, errors, and the
  disabled JavaScript modes. This is not a production executable or API
  adapter.

## Next

- [ ] Continue API-level implementation and unit tests, including
  filesystem-race coverage and documented residual limitations.
- [ ] Obtain separate API-ready approval before production integration of the
  proposed console query modes or any expansion beyond the existing API.
- [ ] Before enabling JavaScript query modes, obtain a separately approved
  execution and authorization design that preserves the vault-script
  prohibition and the project's privacy and read-only requirements.

## Tentative future

- [ ] Consider expanding query and relationship features only after
  documenting their project-defined semantics and adding fixtures. Any future
  upstream parity claim still requires oracle evidence at pinned revisions.

Future steps are tentative and should be revised when the compatibility spike
changes scope or technical decisions.
