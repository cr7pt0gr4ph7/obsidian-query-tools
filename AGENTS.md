# Contributor guidance

Read [the requirements](design/REQUIREMENTS.md) and
[design](design/DESIGN.md) before making implementation decisions.
Review [the implementation plan](design/IMPLEMENTATION_PLAN.md) for project
status and planned work, and update it when implementation progress or
substantive decisions change.

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
  Create a new file for separate runs if necessary, except if the information
  fits suitably into the existing files.

Run `npm ci` to install dependencies, `npm run build` to compile TypeScript,
and `npm test` to build, type-check, and run the current tests.
Use `npm run format` to reformat code with Biome's standard settings;
`npm run format:check` checks formatting and is a required CI check.
