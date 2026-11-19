# Requirements

Status: initial draft. **Must** denotes a target requirement, not an existing
feature. Release scope and plugin compatibility remain subject to the
feasibility work in [DESIGN.md](DESIGN.md).

## Goal and terminology

Provide a local Node.js library, CLI, and MCP server for querying an Obsidian
vault using Dataview's data/query model and Breadcrumbs' relationship model.
An Obsidian “database” here means the vault's Markdown files, attachments,
and relevant configuration, rather than a separate database server. An
index is a derived, disposable representation of that content.

The goal is to reuse upstream code unchanged wherever practical, not to
independently reimplement both plugins by default. Exact compatibility is not
assumed. The project must identify its supported upstream revisions and
features and explicitly disclose differences and unsupported cases.

## Functional requirements

| ID | Requirement |
| --- | --- |
| F1 | Open an explicitly selected local vault and build an index from its contents and relevant configuration. Do not require a running Obsidian instance for the intended standalone mode; validate its feasibility first. |
| F2 | Expose a JavaScript API for vault lifecycle, Dataview-style queries, Breadcrumbs-style relationship queries, and structured results and errors. The API is the shared source of behavior for all interfaces. |
| F3 | Provide a Node.js CLI that selects a vault, performs supported queries through the API, writes machine-readable results to stdout and diagnostics to stderr, and returns a nonzero exit status for errors. |
| F4 | Provide a Node.js MCP server that exposes supported read-only queries through the API, uses a standards-compliant MCP transport, and returns structured, bounded results or explicit errors. Stdio is the initial target. |
| F5 | For the supported Dataview subset, interpret relevant frontmatter, inline fields, links, tags, file metadata, and query expressions as the pinned upstream version does. Identify the supported source and query forms in a compatibility matrix. |
| F6 | For the supported Breadcrumbs subset, construct typed, directed relationships using the pinned plugin's configuration and inference rules; expose at least direct neighbors and bounded traversal with direction and relationship type filters. Document missing or unsupported rules. |
| F7 | Preserve meaningful value types and relationship direction in the API; define a deterministic, JSON-safe representation for dates, links, missing values, errors, and other non-JSON values at the CLI/MCP boundary. Do not silently coerce unsupported values. |
| F8 | Support an explicit refresh or reopen operation so clients can obtain an updated index after vault changes. A query observes one coherent index generation; concurrent file changes during indexing are detected or reported rather than silently presented as a guaranteed atomic filesystem snapshot. |
| F9 | Return actionable errors for invalid vaults, configuration, queries, unsupported features, resource limits, and unreadable files. Partial results, if provided, must be explicitly marked with diagnostics. |
| F10 | Supply configurable resource limits for indexing, traversal and result size; signal truncation or a limit error rather than silently returning incomplete results. |

### Initial scope

The first release targets local, read-only access to one selected vault at a
time, Dataview declarative queries and Breadcrumbs graph queries, with
machine-readable output. The precise supported query forms, configuration
fields, Obsidian/plugin versions, Node.js versions and platform matrix must be
determined by the compatibility spike. Full parity remains a longer-term goal,
not a release claim.

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
- **Correctness:** test representative fixtures against results captured from
  the same pinned upstream plugins in Obsidian. Include negative,
  unsupported-feature, security-boundary, and adapter parity cases.
- **Operational behavior:** provide deterministic serialization and ordering
  where query semantics do not specify an order, documented limits, clean
  lifecycle/shutdown, and actionable diagnostics without corrupting CLI JSON
  or MCP stdio.
- **Portability:** select supported Node.js and operating-system versions
  after the upstream compatibility spike; publish and test that matrix.

## Acceptance criteria for an initial implementation

1. A documented, pinned compatibility matrix identifies the supported
   Dataview queries and Breadcrumbs relationship/configuration semantics.
   Representative fixtures agree with the corresponding upstream oracle, and
   documented unsupported constructs produce explicit errors.
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

Detailed schemas, commands, query support, and thresholds must be decided
before release; this draft does not prescribe names as if they already exist.
