# Design draft

## Architectural approach

The intended standalone process reads a selected Obsidian vault, constructs
an in-memory derived index, and serves requests through a JavaScript API.
The CLI and MCP server are thin clients of that API. The index is not the
source of truth and can be discarded and rebuilt. An Obsidian instance is not
required in the target design; feasibility is an explicit release gate.

Data flow:

1. Configure and validate the vault root, resource limits, and supported
   plugin settings. Establish the authorized filesystem boundary.
2. Enumerate and read the vault; build metadata and link-resolution services
   required by the pinned upstream code. Surface unreadable files and changes
   observed during the build.
3. Build Dataview's index and Breadcrumbs' graph in the dependency order
   actually required by the chosen plugin revisions. Publish an index
   generation only after its construction has completed according to the
   documented error policy.
4. Validate and execute a query against one published generation. Translate
   upstream values and errors into the public result contract, including
   diagnostics and any truncation.
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

## Interface contract

The API owns a vault context and exposes lifecycle, query, refresh and close
operations. Results carry a generation identifier, data, diagnostics and
completion/truncation status. Failures carry stable categories and useful
messages, without leaking unrelated filesystem contents. Specify exact
schemas, cancellation, ownership, and ordering during implementation.

The CLI takes an explicit local vault and query input, outputs normalized JSON
to stdout, and reports diagnostics on stderr with documented exit codes.
The MCP server initially targets stdio, with a vault bound by server startup
configuration rather than tool arguments. Tools expose declarative Dataview
queries and bounded graph operations; their schemas specify inputs, filters,
limits, normalized output, and errors. Protocol traffic alone goes to stdout.
Do not expose a generic filesystem tool or arbitrary script execution.

Normalizing values requires a documented tagged JSON encoding where JSON
alone is ambiguous, including links, dates/datetimes, missing versus null,
and non-finite numeric values if supported. Use vault-relative paths, preserve
edge type and direction, and make ordering stable unless a query explicitly
specifies another order. Unsupported inputs or values fail explicitly.
Apply limits before unbounded materialization where feasible; when a result
is truncated, state that fact and do not imply completeness.

## Security and operational decisions

- Canonicalize the configured root and enforce containment for every read,
  including symlinks and vault links; reject escapes and filesystem special
  files. Handle filesystem races as far as the platform allows and document
  residual limitations. Do not follow links outside the authorized boundary.
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

Create small synthetic vault fixtures covering frontmatter, inline fields,
links, tags, missing values, config-driven typed relationships, inference,
cycles, and malformed input. Capture expected outcomes from pinned upstream
plugins in Obsidian and compare normalized values rather than UI markup.
Test API/CLI/MCP equivalence, refresh behavior, boundary escapes, limits,
and protocol-clean output. Record known differences, unsupported features,
and fixture/oracle provenance.

Before committing to the initial compatibility matrix, resolve the supported
Node/OS range, query forms, plugin versions, serialization schema, limits,
error codes, and strategy for inconsistent reads. If a required upstream
feature cannot be reused without an impractical host bridge, explicitly
renegotiate scope instead of presenting it as supported.
