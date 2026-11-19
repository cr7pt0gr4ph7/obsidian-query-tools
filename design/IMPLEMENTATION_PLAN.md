# Implementation status

The project provides a read-only TypeScript API, CLI, and stdio MCP server for
a deliberately narrow, project-defined query subset. It does not claim
Dataview or Breadcrumbs parity. See [requirements](REQUIREMENTS.md) and
[design](DESIGN.md) for the contract and constraints.

## Implemented

- Shared vault index and API for `LIST FROM "<folder>"` and direct edges from
  configured frontmatter fields, with limits, refresh, and structured errors.
- CLI and stdio MCP adapters that use the API and return bounded results.
- Focused fixtures and tests for API behavior, interface equivalence,
  refresh, and filesystem boundaries.
- Node.js 24 and 26 CI coverage; reproducible install, build, and test commands.
- Upstream investigation and a non-production console test seam, documented
  in the [research notes](notes/2026-11-19-upstream.md) and
  [console note](notes/2026-11-19-console-interface.md).

## Remaining work

- Expand filesystem-race coverage and document any newly identified limits.
- Treat broader query or relationship semantics as new scope: define them,
  add fixtures, and preserve the vault privacy and read-only requirements.
- Do not enable JavaScript query modes or claim upstream parity without a
  separately justified design and the evidence required in the design docs.
