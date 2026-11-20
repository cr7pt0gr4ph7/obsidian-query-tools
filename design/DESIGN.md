# Design

## Architectural approach

The process indexes one selected vault into a disposable in-memory index and
serves queries through the shared JavaScript API. The CLI and MCP server are
thin API clients; an Obsidian instance is not required.

Index construction publishes a generation only on success. Queries use one
published generation; refresh builds a replacement and preserves the previous
generation if construction fails. This does not guarantee an atomic snapshot
of a changing filesystem.

## Upstream integration

Dataview and Breadcrumbs are Obsidian plugins, not proven drop-in Node query
engines. Their examined revisions, licenses, and source/build/runtime evidence
are recorded in the [upstream research notes](notes/2026-11-19-upstream.md).
Neither is a project dependency. The implementation uses narrow,
project-defined semantics and makes no parity claim. Dataview tests are
syntax and fixture references, not an execution oracle. Any future reuse or
compatibility claim requires pinned revisions, documented deviations and
licenses, and evidence against those revisions.

## Interface contract

The TypeScript API in `src/api/` has a stable public `index.ts` entrypoint and
domain modules under `vault/`, `graph/`, and `dataview/`. Vault lifecycle,
index building, and open-option validation live under `vault/`; graph types
and neighbor lookup live under `graph/`; the project-defined `LIST FROM`
query and its options live under `dataview/`. Shared result types, path and
request validation, and errors remain at the API root. The root entrypoint
re-exports the public types and `openVault`; built JavaScript and declarations
are emitted under `dist/api/`. `openVault(root, options)` creates a context.
`list(query, { limit })` supports only `LIST FROM "<folder>"`; `graph()`
returns a `VaultGraph` with `neighbors(path, { direction, types, limit })`,
which returns direct `{ source, target, type }` edges. The dataview module
implements only the project's narrow query subset and does not load or claim
compatibility with the Dataview plugin. A graph obtained before refresh uses
the current generation, and is invalidated when the vault closes.
`VaultGraph` also provides `traverse(path, { direction, types, maxDepth, limit })`,
a breadth-first walk over the same configured edges (plain reachability, not
Breadcrumbs transitive rules), and `export({ format, types })`, which
serializes every Markdown file as a node plus the selected edges as `json`,
`csv` (formula-prefix guarded), `dot`, `mermaid`, or `graphml` with escaping.
The CLI exposes these as `graph traverse` and `graph export`; MCP exposes
`traverse` and `export`.
`VaultGraph` further provides `path()` (shortest chain), `stats()`, `nodes()`
(sources, sinks, isolated), and `cycles()` (strongly connected groups).
The optional `oppositeFields` open option (CLI/MCP `--opposite field:type`)
adds a Breadcrumbs-inspired implied reverse edge, flagged `implied: true`,
for each configured edge unless the same edge is declared; implied edges count
toward the edge limit. This is project-defined behavior, not Breadcrumbs parity.
The CLI accepts an explicit `--config <file>` (JSON, at most 64 KiB, keys `edgeFields`, `oppositeFields`, `allowWikilinks`, `limits`); it is never read from the vault and cannot enable unsafe JavaScript.
`describe()` and `obsidian-query-tools describe` print a vault-free JSON summary of operations, formats, limits and error codes for agent discovery.
`refresh()` publishes a new generation on success; `close()` invalidates the
context.
Results contain `{ generation, data, diagnostics, truncated }`; errors are
`VaultQueryError` instances with a stable `code` and optional relative `path`.
Index-build errors abort the generation rather than publishing partial data.
Paths use POSIX separators and results have deterministic ordering.

Internally, graph configuration holds edge fields and graph limits, and the
graph index holds file paths and edges. The vault index retains the graph index
as part of the same published generation. Public open options remain flat:
`edgeFields` and `limits.maxEdges` configure graph indexing.

Only fields listed in `edgeFields` are interpreted. A field value must be a
string or array of strings containing exact vault-root-relative Markdown
paths, with an optional `.md` suffix. Unresolved targets or unsupported
values fail the build. With `allowWikilinks` (CLI/MCP `--allow-wikilinks`),
`[[Note]]`, `[[Folder/Note|alias]]` and `[[Note#heading]]` values are also
accepted and resolved by exact vault path, then by unique case-insensitive
basename; ambiguity fails the build. Invalid UTF-8, unsupported YAML tags, and aliases are
rejected even in unconfigured fields. Note bodies, Obsidian settings, and
plugin code are not evaluated.

Default limits are 100,000 directory entries, 10,000 Markdown files, 1 MiB
per Markdown file, 100,000 edges, and 1,000 results. Requests may lower the
configured result limit. Excess results set `truncated: true`; build-limit
exhaustion is an error.

The CLI uses Commander for command and option parsing. Its graph commands
expose the shared API directly. The preliminary `obsidian-query query`
interface uses `dataview`/`dql` selectors over the shared
`Vault.list()` operation; only the project's `LIST FROM "<folder>"` subset is
supported. It accepts inline or bounded UTF-8 stdin input, validates optional
current-file context through the API, and defaults to JSON with optional
Markdown. JavaScript selectors (`dataviewjs`/`dqljs`) fail as unsupported unless
`--unsafe-allow-js` is passed, which opens the vault with
`unsafeJavaScript: true` and runs the query text through `Vault.script()`.
`script()` evaluates an async function body in a `node:vm` context exposing a
read-only `dv` helper (`current`, `paths()`, `list()`, `neighbors()`), with a
wall-clock timeout and a JSON-serializable result bounded by the result limit.
This is not a sandbox; it is for trusted scripts only, and MCP never enables
it. `query --limit` lowers the result limit. The
console includes diagnostics and truncation in JSON, and sends diagnostics to
stderr for Markdown. The preliminary interface makes no upstream parity
claim.
The [console note](notes/2026-11-19-console-interface.md) records the current
implementation boundary.
The MCP server uses the official MCP SDK v2 over stdio, with a vault bound by
server startup configuration rather than tool arguments. It exposes `list`,
`neighbors`, and `refresh`, with strict schemas, bounded inputs, and
structured results. Tool results include the API envelope as both
`structuredContent` and JSON text; API failures return `isError` and a
structured error. Protocol traffic alone goes to stdout. There is no generic
filesystem tool or arbitrary script execution.

## Security and operational decisions

- Reads use Linux `/proc/self/fd` and `O_NOFOLLOW`; symlinks and special files
  are rejected. Linux with usable procfs is required. Metadata checks detect
  many concurrent changes, but indexing is not an atomic filesystem snapshot.
- Treat vault content, queries, and MCP input as untrusted. Do not execute
  vault-supplied scripts, access the network, or log note contents by default.
- MCP binds the vault at server startup; clients cannot choose arbitrary
  server paths. Any authorized client can read the exposed vault. Do not
  expose stdio to untrusted clients.
- Refresh is explicit. Watchers, persistent caches, incremental indexing,
  and multi-vault service are out of scope.

## Validation and release gates

Tests cover the project-defined subset, API/CLI/MCP equivalence, protocol
output, limits, refresh, and filesystem boundaries. Current runtime support
is Node.js 24 or later on Linux with procfs; tests have run on Node.js
24.22.3 and 26.13.0. Any future parity claim requires pinned upstream
revisions and oracle evidence.
