# Contributor guidance

This repository currently contains a design draft, not an implemented
application. Read [the requirements](design/REQUIREMENTS.md) and
[design](design/DESIGN.md) before making implementation decisions.

- Preserve the shared JavaScript API as the basis for both CLI and MCP
  interfaces; do not implement separate query semantics in each interface.
- Prefer unchanged upstream Dataview and Breadcrumbs code where feasible.
  Record the exact upstream revisions, integration method, licenses, and any
  deviations before relying on them. Do not assume either plugin can run
  unchanged outside Obsidian.
- Treat vault contents as private and untrusted. Keep the default operation
  read-only, do not execute vault-supplied JavaScript, and do not send vault
  data to external services without explicit authorization.
- Document compatibility limits and test behavior against pinned upstream
  versions and representative, non-sensitive fixtures. Do not claim parity
  without evidence.
- Keep design documents in sync with substantive implementation decisions.
- Store research and other project notes in `design/notes/` using filenames
  that begin with `YYYY-MM-` (for example, `2026-11-upstream.md`).

There are no project build, lint, or test commands yet. Add and document them
when the implementation is introduced.
