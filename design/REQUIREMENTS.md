# Requirements

Status: initial implementation scope. **Must** denotes a target requirement,
not necessarily an implemented feature. The initial subset is intentionally
not a plugin-compatibility claim.

## Goal and scope

Provide a local Node.js library, CLI, and MCP server for querying an Obsidian
vault with a shared JavaScript API. The index is a derived, disposable
representation of vault content.

Reuse upstream code unchanged where practical, but do not assume plugin
compatibility. Declarative queries use the pinned Dataview engine with a
partial host; graph semantics remain project-defined. Any compatibility claim
must identify exact upstream revisions and disclose differences and
unsupported cases.

## Functional requirements

| ID  | Requirement                                                                                                                                                                                                                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | Open an explicitly selected local vault and build a bounded index from Markdown files and explicitly supplied edge-field configuration. Do not require a running Obsidian instance.                                                                                                                     |
| F2  | Expose a JavaScript API for vault lifecycle, the supported folder query, direct typed-edge queries, and structured results and errors. The API is the shared source of behavior for all interfaces.                                                                                                     |
| F3  | Provide a Node.js CLI that selects a vault, performs supported queries through the API, writes machine-readable results to stdout and diagnostics to stderr, and returns a nonzero exit status for errors.                                                                                              |
| F4  | Provide a Node.js MCP server that exposes supported read-only queries through the API, uses a standards-compliant MCP transport, and returns structured, bounded results or explicit errors. Stdio is the initial target.                                                                               |
| F5  | Support Dataview LIST and TABLE through the shared asynchronous query API and CLI, with partial host metadata and no parity claim. Retain the synchronous project-defined folder-only `list` API and MCP tool. Reject TASK, CALENDAR and CSV sources.                                                   |
| F6  | Build typed, directed edges from explicitly configured frontmatter fields whose values are vault-relative Markdown paths; expose direct neighbors with direction and field filters. Do not infer edges or apply Breadcrumbs transitive rules in the initial subset.                                     |
| F7  | Preserve relationship direction and field type. Return vault-relative POSIX paths and structured errors; reject unsupported field values rather than silently coercing them.                                                                                                                            |
| F8  | Support an explicit refresh or reopen operation so clients can obtain an updated index after vault changes. A query observes one coherent index generation; concurrent file changes during indexing are detected or reported rather than silently presented as a guaranteed atomic filesystem snapshot. |
| F9  | Return actionable errors for invalid vaults, configuration, queries, unsupported features, resource limits, and unreadable files. Document partial host metadata and upstream row-level expression behavior; do not emit per-query metadata warnings.                                                   |
| F10 | Supply configurable resource limits for directory entries, Markdown files, file size, edge count, and results; signal truncation or a limit error rather than silently returning incomplete results.                                                                                                    |

The implementation targets local, read-only access to one selected vault at
a time. Edge values are vault-root-relative Markdown paths, optionally
supplied as arrays; wikilinks and opposite edges are explicit opt-ins, and
Breadcrumbs transitive rules are excluded. The runtime target is Node.js 24 or later on Linux with procfs;
Node.js 24.22.3 and 26.13.0 have been tested.

Vault mutation, Obsidian UI/rendering, executing JavaScript embedded in a
vault, remote vault access, multi-user hosting, and replacing
Obsidian's plugin UI are out of scope. Upstream code reuse does not authorize
execution of user-supplied scripts. As the sole exception, the API and CLI
offer an explicit, off-by-default `unsafeJavaScript` / `--unsafe-allow-js`
opt-in that runs a caller-supplied script (never vault content) in-process
without a sandbox; the MCP server never enables it.

## Non-functional requirements

- **Safety and privacy:** read only within the configured vault and any
  explicit allowlist; account for symlinks and path traversal. No network
  transmission of vault data by default. MCP requests must not choose arbitrary
  server filesystem paths. Avoid logging note contents by default.
- **Reuse and maintenance:** assess upstream packages, source imports,
  submodules, and adapters without presuming standalone compatibility. Pin
  revisions and dependencies reproducibly, retain license notices, and
  document patches.
- **Correctness:** test the documented project-defined subset with
  representative fixtures, including negative, unsupported-feature, and
  security-boundary cases. Do not imply upstream parity; any future parity
  claim requires same-revision Obsidian oracle evidence.
- **Operations:** provide deterministic ordering and serialization where
  semantics do not specify an order, documented limits, clean lifecycle and
  shutdown, and actionable diagnostics without corrupting CLI JSON or MCP
  stdio.
- **Portability:** document and test the supported Node.js and operating
  system versions.

## Acceptance criteria for an initial implementation

1. A documented subset specification identifies supported Dataview queries,
   host metadata limits, and configured frontmatter edge semantics, explicitly
   stating that they are not Dataview/Breadcrumbs parity.
2. The API and CLI return equivalent Dataview results; the existing MCP list
   and graph operations retain their shared API behavior. CLI stdout
   is valid machine-readable output; MCP stdio remains protocol-clean.
3. Refresh exposes additions, modifications, and deletions as a new index
   generation; tests cover changed and unreadable files without asserting an
   atomic filesystem snapshot.
4. Tests establish that vault content is not written, paths and symlinks cannot
   escape the authorized root, vault scripts are not executed, and the MCP
   interface cannot select an arbitrary vault. Resource limits are enforced.
5. A clean checkout can reproduce installation, build, and tests using
   documented commands, with upstream sources and their license notices
   available as specified.

Default limits are 100,000 directory entries, 10,000 Markdown files, 1 MiB
per Markdown file, 100,000 edges, and 1,000 results.
