# Requirements

Status: initial implementation scope. **Must** denotes a target requirement,
not necessarily an implemented feature. The initial subset is intentionally
not a plugin-compatibility claim.

## Goal and terminology

Provide a local Node.js library, CLI, and MCP server for querying an Obsidian
vault with a shared JavaScript API.
An Obsidian “database” here means the vault's Markdown files, attachments,
and relevant configuration, rather than a separate database server. An
index is a derived, disposable representation of that content.

Reuse upstream code unchanged where practical, but do not assume plugin
compatibility. The initial subset below has project-defined behavior and does
not rely on either plugin's broader semantics. Any later compatibility claim
must identify exact upstream revisions and disclose differences and
unsupported cases.

## Functional requirements

| ID | Requirement |
| --- | --- |
| F1 | Open an explicitly selected local vault and build a bounded index from Markdown files and explicitly supplied edge-field configuration. Do not require a running Obsidian instance. |
| F2 | Expose a JavaScript API for vault lifecycle, the supported folder query, direct typed-edge queries, and structured results and errors. The API is the shared source of behavior for all interfaces. |
| F3 | Provide a Node.js CLI that selects a vault, performs supported queries through the API, writes machine-readable results to stdout and diagnostics to stderr, and returns a nonzero exit status for errors. |
| F4 | Provide a Node.js MCP server that exposes supported read-only queries through the API, uses a standards-compliant MCP transport, and returns structured, bounded results or explicit errors. Stdio is the initial target. |
| F5 | Support only `LIST FROM "<folder>"` (case-insensitive keywords), returning sorted vault-relative Markdown paths. Reject all other query forms explicitly. This initial subset has project-defined behavior and makes no Dataview-parity claim. |
| F6 | Build typed, directed edges from explicitly configured frontmatter fields whose values are vault-relative Markdown paths; expose direct neighbors with direction and field filters. Do not infer edges or apply Breadcrumbs transitive rules in the initial subset. |
| F7 | Preserve relationship direction and field type. Return vault-relative POSIX paths and structured errors; reject unsupported field values rather than silently coercing them. |
| F8 | Support an explicit refresh or reopen operation so clients can obtain an updated index after vault changes. A query observes one coherent index generation; concurrent file changes during indexing are detected or reported rather than silently presented as a guaranteed atomic filesystem snapshot. |
| F9 | Return actionable errors for invalid vaults, configuration, queries, unsupported features, resource limits, and unreadable files. Partial results, if provided, must be explicitly marked with diagnostics. |
| F10 | Supply configurable resource limits for directory entries, Markdown files, file size, edge count, and results; signal truncation or a limit error rather than silently returning incomplete results. |

### Initial scope

The first implementation targets local, read-only access to one selected
vault at a time. Its intentionally narrow, project-defined subset is
`LIST FROM "<folder>"` (paths only) and direct typed edges from configured
frontmatter fields (direct neighbors only). Edge values are vault-root-relative
Markdown paths, optionally supplied as arrays; aliases, wikilinks, inference,
and transitive rules are excluded. It does not claim Dataview or Breadcrumbs
parity. The initial runtime target is Node.js 24 or later on Linux with
procfs; Node.js 24.22.3 and 26.13.0 have been tested.

Out of scope initially: vault mutation, Obsidian UI/rendering, arbitrary
DataviewJS or other JavaScript embedded in a vault or query, remote vault
access, hosting a multi-user service, and replacing Obsidian's plugin UI.
Running plugin code to implement queries is distinct from executing
user-supplied scripts; the latter is prohibited by default.

## Non-functional requirements

- **Safety and privacy:** read only within the configured vault and any
  explicit allowlist; account for symlinks and path traversal. No network
  transmission of vault data by default. MCP requests must not choose arbitrary
  server filesystem paths. Avoid logging note contents by default.
- **Reuse and maintenance:** assess existing upstream packages, source imports,
  submodules, and adapters in that order of suitability, without presuming an
  npm package is standalone-compatible. Pin exact revisions and dependencies
  reproducibly; retain required license notices and document any patches.
- **Correctness:** test the documented project-defined subset with
  representative fixtures, including negative, unsupported-feature, and
  security-boundary cases. Do not imply upstream parity; any future parity
  claim requires same-revision Obsidian oracle evidence.
- **Operational behavior:** provide deterministic serialization and ordering
  where query semantics do not specify an order, documented limits, clean
  lifecycle/shutdown, and actionable diagnostics without corrupting CLI JSON
  or MCP stdio.
- **Portability:** select supported Node.js and operating-system versions
  after the upstream compatibility spike; publish and test that matrix.

## Acceptance criteria for an initial implementation

1. A documented subset specification identifies the supported folder query
   and configured frontmatter edge semantics, explicitly states that they are
   not Dataview/Breadcrumbs parity, and unsupported constructs produce errors.
2. The same fixture and query through the API, CLI and MCP yield equivalent
   normalized results, including errors and truncation metadata. CLI stdout
   is valid machine-readable output; MCP stdio remains protocol-clean.
3. Refresh exposes additions, modifications, and deletions as a new index
   generation; tests cover changed and unreadable files without asserting an
   atomic filesystem snapshot.
4. Tests establish that vault content is not written, paths and symlinks cannot
   escape the authorized root, vault scripts are not executed, and the MCP
   interface cannot select an arbitrary vault. Limits and cycles terminate
   predictably.
5. A clean checkout can reproduce installation, build, and tests using
   documented commands, with upstream sources and their license notices
   available as specified.

Default limits are 100,000 directory entries, 10,000 Markdown files, 1 MiB
per Markdown file, 100,000 edges, and 1,000 results. Detailed API shapes and
commands are documented with the implementation.
