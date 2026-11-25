# JavaScript API

The JavaScript API is the shared interface used by the CLI and MCP server. It
opens one local vault, builds an in-memory index, and provides read-only folder
and relationship queries. It does not require Obsidian to be running.

The supported runtime is Node.js 24 or later on Linux with procfs. From a
checkout, build the package before importing it:

```sh
npm ci
npm run build
```

The package entry point exports the API and its TypeScript declarations:

```js
import { openVault, VaultQueryError } from "obsidian-query-tools";
```

## Open and close a vault

Pass `openVault` the path to the vault directory. It recursively indexes
Markdown files and configured frontmatter fields before returning a vault
handle. Index construction fails rather than returning a partially indexed
vault.

```js
const vault = await openVault("/home/me/Notes", {
	edgeFields: ["parent", "project"],
});

try {
	// Query the vault here.
} finally {
	vault.close();
}
```

`edgeFields` is optional and defaults to an empty array. Each entry is a
distinct, non-empty frontmatter field name to interpret as a relationship
type. Unknown options and invalid limits raise `VaultQueryError`.

The default resource limits are:

| Limit option   |   Default | Applies to                  |
| -------------- | --------: | --------------------------- |
| `maxEntries`   |   100,000 | Directory entries visited   |
| `maxFiles`     |    10,000 | Markdown files indexed      |
| `maxFileBytes` | 1,048,576 | Bytes in each Markdown file |
| `maxEdges`     |   100,000 | Configured relationships    |
| `maxResults`   |     1,000 | Results returned by a query |

You can lower or raise the index limits when opening the vault. Each configured
limit must be a positive safe integer. For example:

```js
const vault = await openVault("/home/me/Notes", {
	edgeFields: ["parent"],
	limits: {
		maxFiles: 2_000,
		maxResults: 250,
	},
});
```

## Dataview queries

`await vault.query(query, { limit, file })` evaluates upstream Dataview `LIST`
and `TABLE` queries, including `WHERE` and `SORT`. `file` is an optional,
existing vault-relative Markdown file used as the current-file context.
The JSON-safe result envelope contains `generation`, `diagnostics`,
`truncated`, and `data`: `{ type: "list", values: [...] }` or
`{ type: "table", headers: [...], values: [[...]] }`. File links are objects
with `type: "link"`, `path`, `linkType`, `embed`, `subpath`, and `display`;
dates and durations serialize as ISO strings, and nested values are retained.

```js
const result = await vault.query('TABLE status, priority FROM "Projects" WHERE status = "open" SORT priority ASC', {
	limit: 25,
});
console.log(result.data);
```

Only frontmatter and file paths are provided by the mock metadata cache.
Body tags, inline fields, headings, tasks and body-link metadata may be absent.
Queries using missing metadata are allowed and may be incomplete without a
warning. TASK, CALENDAR, and CSV sources are unsupported. Dataview may silently
drop individual rows when expressions fail. The output limit does not bound
the work needed to execute a query. This is not an Obsidian parity claim.
Dataview's index constructor starts Node workers even though snapshot imports
run in-process; incompatible inherited Node flags such as `--input-type=module`
can cause worker failure and `VAULT_READ_ERROR`.

## List Markdown paths

`list(query, options?)` supports only `LIST FROM "<folder>"`. The keywords are
case-insensitive; the folder is a vault-relative path with POSIX `/`
separators. The empty folder selects all indexed Markdown files. A non-empty
folder selects files below that folder, not files that merely share its name
prefix.

```js
const result = vault.list('LIST FROM "Projects/Active"');
console.log(result.data);
// ["Projects/Active/roadmap.md", "Projects/Active/tasks/today.md"]
```

Paths are sorted, vault-relative, and use `/` separators. Other query forms,
including `WHERE`, tags, links, tables, and Dataview-specific expressions, are
rejected with `INVALID_QUERY`; this API does not claim Dataview parity.

An optional per-query `limit` can lower the configured `maxResults`:

```js
const result = vault.list('LIST FROM ""', { limit: 25 });
if (result.truncated) {
	console.log("The result was limited.");
}
```

The limit must be a positive safe integer no greater than `maxResults`.
Exceeding the result limit does not fail the query: `data` contains the first
results in deterministic order and `truncated` is `true`.

`list` also accepts an optional `file` path to validate a current-file context.
It must be an existing indexed Markdown file using a vault-relative POSIX path;
it does not change `LIST FROM` results. The current query subset has no
current-file-dependent syntax or relative-link resolution.

## Query direct relationships

For each configured `edgeFields` entry, the API reads that field from each
Markdown file's YAML frontmatter. A value must be one vault-relative Markdown
path or an array of such paths. The `.md` suffix is optional; the value must
refer to an indexed file. For example:

```yaml
---
parent: Projects/roadmap
project:
  - Projects/roadmap.md
---
```

This creates typed, directed relationships from the note containing the
frontmatter to each target. Wikilink values and implied opposite edges are
available through explicit options; Breadcrumbs transitive rules are not
implemented. An unresolved target or an invalid field value fails indexing.

`vault.graph().neighbors(path, options?)` returns direct edges. `direction` defaults to
`"outgoing"`; use `"incoming"` to find edges that point to the requested note.
`types` defaults to all configured edge fields and may select a subset (or an
empty array for no edges). `limit` behaves as it does for `list`.

```js
const result = vault.graph().neighbors("Projects/Active/task.md", {
	direction: "outgoing",
	types: ["parent"],
});

console.log(result.data);
// [{ source: "Projects/Active/task.md",
//    target: "Projects/roadmap.md",
//    type: "parent" }]
```

The requested note must be an indexed Markdown file. Paths are vault-relative
POSIX paths; absolute paths, `.` and `..` path segments, and backslashes are
invalid. A path that is valid but not indexed raises `NOT_FOUND`.

## Results, refresh, and errors

The synchronous list and graph methods return a `QueryResult<T>`; the
asynchronous Dataview query uses the typed `data` shape described above:

```ts
interface QueryResult<T> {
	generation: number;
	data: T[];
	diagnostics: { code: string; message: string }[];
	truncated: boolean;
}
```

The initial index is generation `1`. Every query includes a
`NON_ATOMIC_SNAPSHOT` diagnostic: filesystem metadata checks detect many
concurrent changes, but indexing is not an atomic snapshot of a changing
vault.

Call `refresh()` after vault files change. It rebuilds both indexes and returns
the new generation number. A successful refresh replaces the index; if it
fails, the previous generation remains available. The independently captured indexes check for
matching file paths, but equal paths do not guarantee equal contents during
concurrent writes. Only one refresh can run at
a time. Close the handle with `close()` when finished; subsequent operations
raise `VAULT_CLOSED`.

API errors are `VaultQueryError` instances with a stable `code`, a message,
and an optional vault-relative `path` identifying the affected file:

```js
try {
	await vault.query("invalid query");
} catch (error) {
	if (error instanceof VaultQueryError) {
		console.error(error.code, error.path, error.message);
	} else {
		throw error;
	}
}
```

Common error codes include `INVALID_QUERY`, `INVALID_PATH`,
`INVALID_OPTIONS`, `NOT_FOUND`, and `VAULT_CLOSED`. Opening or refreshing can
also fail for invalid or unsupported frontmatter, unresolved edges, unreadable
or changing files, unsafe filesystem entries, or exceeded index limits. Check
the specific code rather than assuming a failed refresh produced a new
generation.

## Compatibility and privacy

The API reads local Markdown files and configured frontmatter only. It does
not modify vault contents, execute scripts embedded in notes, or send vault
data over the network. Symlinks and special files are rejected. The index is
in memory and is discarded when the process exits.

The Dataview query engine is upstream-backed but uses an incomplete host;
graph semantics are project-defined rather than Breadcrumbs-compatible.
Neither constitutes a parity claim. See [the design](../design/DESIGN.md) and
[requirements](../design/REQUIREMENTS.md) for the full contract and limits.

## Unsafe script execution

`openVault(root, { unsafeJavaScript: true })` enables `vault.script(source,
{ limit, file, timeoutMs })`, which runs an async function body with a `dv`
helper (`current`, `paths()`, `list(query)`, `neighbors(path, options)`). It is
not a sandbox; use only trusted scripts. Without the option it fails with
`UNSUPPORTED_FEATURE`.

## Traversal and export

`vault.graph().traverse(path, { direction, types, maxDepth, limit })` returns
edges reachable breadth-first. `vault.graph().export({ format, types })`
returns `{ generation, format, content, nodeCount, edgeCount, diagnostics,
truncated }` where `format` is `json`, `csv`, `dot`, `mermaid`, or `graphml`.
CLI: `graph traverse <path>` and `graph export --format <format>`.
