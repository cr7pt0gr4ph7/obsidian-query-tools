# Implementation status

The project provides a read-only TypeScript API, CLI, and stdio MCP server for
a deliberately narrow, project-defined query subset. It does not claim
Dataview or Breadcrumbs parity. See [requirements](REQUIREMENTS.md) and
[design](DESIGN.md) for the contract and constraints.

## Implemented

- Shared vault index and API split across `vault/`, `graph/`, and `dataview/`
  modules for `LIST FROM "<folder>"` and direct edges from configured
  frontmatter fields, with limits, refresh, and structured errors.
- Public `VaultGraph` interface for direct-neighbor queries, obtained via `Vault.graph()`.
- Graph-specific limits, configuration, and index structures within the shared vault index.
- Shared API domain modules with a stable public entrypoint and unchanged
  CLI/MCP API usage.
- Commander-based CLI and stdio MCP adapters that use the API and return
  bounded results.
- Preliminary `obsidian-query query` command with `dataview`/`dql` aliases,
  bounded inline/stdin input, API-validated file context, JSON/Markdown output,
  and JavaScript selectors disabled unless `--unsafe-allow-js` is given
  (`Vault.script()`, opt-in `unsafeJavaScript` open option; not a sandbox).
- Focused fixtures and tests for API behavior, interface equivalence,
  refresh, and filesystem boundaries.
- Node.js 24 and 26 CI coverage; reproducible install, build, and test commands.
- Upstream investigation and the preliminary CLI boundary, documented in the
  [research notes](notes/2026-11-19-upstream.md) and
  [console note](notes/2026-11-19-console-interface.md).

- `VaultGraph.traverse()` and `export()` (json, csv, dot, mermaid, graphml)
  with CLI `graph traverse`/`graph export` and MCP `traverse`/`export` tools.

- Graph analysis (`path`, `stats`, `nodes`, `cycles`) and opposite/implied
  edges via `oppositeFields`.

## Remaining work

- Breadcrumbs integration: pin an upstream revision, then define edge-field
  semantics (implied/opposite edges, transitive rules) as new scoped work with
  fixtures; current traversal is plain reachability only.
- Optional list-style CLI command and CLI limit flags beyond `query --limit`.

- Expand filesystem-race coverage and document any newly identified limits.
- Treat broader query or relationship semantics as new scope: define them,
  add fixtures, and preserve the vault privacy and read-only requirements.
- Do not claim upstream parity without the evidence required in the design
  docs; `dataviewjs` support is only the unsafe `dv` helper, not Dataview's API.
