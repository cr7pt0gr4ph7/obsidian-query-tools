# Design draft

## Architectural approach

The standalone process reads a selected Obsidian vault, constructs
an in-memory derived index, and serves requests through a JavaScript API.
The CLI and MCP server are thin clients of that API. The index is not the
source of truth and can be discarded and rebuilt. An Obsidian instance is not
required for the initial project-defined subset.

Data flow:

1. Configure and validate the vault root, resource limits, and explicit edge
   fields. Establish the authorized filesystem boundary.
2. Enumerate and read Markdown files; build a path index and configured
   frontmatter edges, surfacing unreadable files and observed changes.
3. Publish a generation only after construction completes successfully.
4. Validate and execute a supported query against one published generation,
   returning diagnostics and truncation metadata.
5. CLI or MCP serializes that contract; closing the context releases
   resources. Refresh builds a replacement generation and makes it visible
   atomically to subsequent queries, without promising an atomic filesystem
   snapshot while files are being read.

## Upstream integration

Both projects are Obsidian plugins, not proven drop-in Node query engines.
Their repository package metadata declares MIT licensing, but installation,
exports, browser/Obsidian dependencies, graph settings, and runtime behavior
need verification at selected revisions. See [research notes](notes/2026-11-19-upstream.md).

First perform a small vertical spike against each pinned upstream revision:

1. Inventory reusable public exports and source modules, runtime imports and
   transitive dependencies; try the published package where appropriate.
   Establish how the plugin obtains metadata, settings, and vault access.
2. Exercise representative queries on a fixture in Node with unchanged
   upstream code and the smallest viable adapter. Compare with results from
   those same revisions running in Obsidian. Check Breadcrumbs' graph and
   inference, not just its UI or rendering.
3. Document the result and choose npm package, pinned Git dependency or
   submodule/source build based on actual exports, reproducibility,
   licensing, and maintenance. A submodule must pin a commit and have
   documented initialization and build steps; a dependency must be locked.
   Preserve upstream copyright and license notices in distributions.
4. If a standalone bridge is insufficient, investigate an upstream
   contribution, a minimal documented patch, or an Obsidian-hosted integration.
   Present the standalone/parity trade-off for a decision rather than silently
   reimplementing semantics or claiming compatibility.

No dependency, revision, or patch is selected by this draft. Track upstream
versions and supported features in a compatibility matrix, and rerun
differential tests when pins change.

An initial source/build/runtime spike and follow-up reference review are
recorded in [the research notes](notes/2026-11-19-upstream.md#runtime-spike--2026-11-19).
The official Obsidian package contains API typings, not an Obsidian runtime;
the extended typings likewise describe API types. They inform what a host
bridge would need but do not make plugin code standalone.

The user chose to proceed without an Obsidian oracle by narrowing the first
implementation to project-defined semantics: `LIST FROM "<folder>"` returns
vault-relative Markdown paths; direct edges come only from explicitly
configured frontmatter fields containing vault-relative Markdown paths.
Keywords are case-insensitive, following Dataview's parser tests, but folder
sources must use this project's quoted path form. There is no arbitrary
expression evaluation, DataviewJS, alias or wikilink resolution, Breadcrumbs
inference, or transitive graph logic. Dataview unit tests are reference
material for syntax and edge cases, not a parity oracle for this API.

## Interface contract

The API is exported by `src/index.js`. `openVault(root, options)` creates a
context; `list(query, { limit })` accepts only `LIST FROM "<folder>"`;
`neighbors(path, { direction, types, limit })` returns direct
`{ source, target, type }` edges; `refresh()` builds and publishes the next
generation on success; and `close()` invalidates the context. A list result
contains `{ generation, data, diagnostics, truncated }`, with `data` an array
of relative paths. A neighbor result has the same envelope with edge objects
in `data`. Errors are `VaultQueryError` instances with a stable `code` and
optional relative `path`. Build errors abort the generation; no partial index
is published. Results are ordered by POSIX path, then edge type.

Frontmatter is YAML between opening and closing `---` lines. Only field names
listed in `edgeFields` at vault open are interpreted. A field value must be a
string or array of strings containing exact vault-root-relative Markdown
paths, with an optional `.md` suffix. Unresolved targets or unsupported
values fail the build. Invalid UTF-8 and unsupported YAML tags and aliases
are rejected, including outside configured fields. No note body, Obsidian
settings, or plugin code is evaluated.

Default limits are 100,000 visited directory entries, 10,000 Markdown files,
1 MiB per Markdown file, 100,000 edges, and 1,000 results. A request may
lower, but not raise, the configured result limit. Excess results are
truncated with `truncated: true`; index-building limit exhaustion is an
explicit error. Refresh leaves the previous generation available if building
the replacement fails.

The CLI takes an explicit local vault and query input, outputs normalized JSON
to stdout, and reports JSON errors on stderr with exit status 1. It exposes
the shared API's `list` and `neighbors` operations without separate query
semantics; results include their diagnostics in the JSON envelope.
The MCP server uses the official MCP SDK v2 over stdio, with a vault bound by
server startup configuration rather than tool arguments. It exposes `list`,
`neighbors`, and `refresh`, with strict schemas, bounded inputs, and
structured results. Tool results include the API envelope as both
`structuredContent` and JSON text; API failures return `isError` and a
structured error. Protocol traffic alone goes to stdout. There is no generic
filesystem tool or arbitrary script execution.

Normalizing values requires a documented tagged JSON encoding where JSON
alone is ambiguous, including links, dates/datetimes, missing versus null,
and non-finite numeric values if supported. Use vault-relative paths, preserve
edge type and direction, and make ordering stable unless a query explicitly
specifies another order. Unsupported inputs or values fail explicitly.
Apply limits before unbounded materialization where feasible; when a result
is truncated, state that fact and do not imply completeness.

## Security and operational decisions

- Canonicalize the configured root and anchor reads to open directory
  descriptors through Linux `/proc/self/fd`, using `O_NOFOLLOW`; reject
  symlinks and special files. Other platforms or systems without usable procfs
  are not supported. Metadata checks detect many changes during indexing,
  but are not an atomic filesystem snapshot: a concurrently moved directory
  may still be read through an already-open descriptor. Restrict write access
  to the vault while indexing when that matters.
- Treat Markdown, plugin settings, queries, and MCP input as untrusted. Never
  run DataviewJS, shell commands, or vault-provided scripts. Avoid network
  access and content-bearing logs by default. Read only; do not install or
  execute code from the vault.
- Bound file sizes/counts, query work, traversal depth, returned data and
  concurrency. Detect graph cycles. Make cancellation/timeouts and the
  precise behavior on exhaustion part of the implementation contract.
- Do not allow MCP clients to select arbitrary server-side paths. Document
  that any client permitted to use a server can read the exposed vault;
  authentication and authorization are the responsibility of the chosen
  deployment/transport and must be specified before enabling remote access.
- Index refresh is explicit initially. Watchers, persistent caches,
  incremental indexing and concurrent multi-vault service are later
  optimizations, subject to consistency and privacy review.

## Validation and release gates

Create small synthetic vault fixtures for folder queries, configured edge
fields, malformed frontmatter, unresolved targets, refresh, limits, and
filesystem boundaries. The pinned Dataview parser and Markdown tests inform
valid and invalid query cases, but do not establish parity for the
project-defined executor. Test the API subset and CLI/MCP equivalence,
including protocol-clean output and vault selection boundaries.

The initial Node target is 24 or later on Linux with procfs; tests have run on
Node 24.22.3 and 26.13.0 on Linux. The first release has no plugin
compatibility matrix because it makes no plugin-parity claim. Any expansion or
parity claim must first specify the relevant upstream revisions, OS/runtime
support, and oracle evidence.
