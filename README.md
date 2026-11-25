# Obsidian Query Tools

Read-only Node.js tools for querying a local Obsidian vault. The CLI and MCP
server share one JavaScript API; TypeScript declarations are included.

> **Status: initial implementation.** The supported subset is deliberately
> limited and does not claim Dataview or Breadcrumbs parity. The query and
> graph interfaces are read-only; unsafe JavaScript requires explicit opt-in.

## Features

- Dataview-backed `LIST` and `TABLE` queries support frontmatter, filtering,
  and sorting through the shared asynchronous API and CLI.
- The synchronous `list` API and MCP tool retain their folder-only path query.
- Configured frontmatter fields provide direct, typed graph edges.
- Graph analysis, traversal, export, and explicit refresh.

## Requirements and setup

- Node.js 24 or later on Linux with procfs (tested on Node 24.22.3 and 26.13.0).
- Bun is required to build the pinned Breadcrumbs dependency.

```sh
git submodule update --init --recursive
npm ci         # install dependencies
npm run build  # compile to dist/
npm test       # build, type-check, and run tests
```

## JavaScript API

```js
import { openVault } from "obsidian-query-tools";

const vault = await openVault("/path/to/vault", { edgeFields: ["parent"] });
try {
	console.log(await vault.query('TABLE status FROM "Tasks" SORT status'));
	console.log(vault.list('LIST FROM "Tasks"'));
	console.log(vault.graph().neighbors("Tasks/example.md", { direction: "outgoing" }));
} finally {
	vault.close();
}
```

Requests return `{ generation, data, diagnostics, truncated }`; errors expose
a `code`. Limits, error behavior, and filesystem race limitations are in the
[design](design/DESIGN.md).

### Edge field values

`parent` values are exact vault-root-relative Markdown paths, or arrays of
paths, with an optional `.md` suffix. These fail explicitly:

- unresolved targets and wikilinks
- invalid UTF-8 or unsupported YAML (including aliases)
- symlinks and special files

## CLI

The graph commands print JSON. The preliminary `query` command defaults to
JSON and can emit Markdown; errors go to stderr with exit status 1.

```sh
node dist/src/cli/index.js --help
node dist/src/cli/index.js query --vault /path/to/vault --type dataview \
  --query 'LIST FROM "Tasks"' --format markdown
node dist/src/cli/index.js query --vault /path/to/vault --type dql --stdin
node dist/src/cli/index.js --vault /path/to/vault --edge-field parent neighbors Tasks/example.md
node dist/src/cli/index.js --vault /path/to/vault graph neighbors Tasks/example.md --edge-field parent
```

The `obsidian-query` binary is an alias for the CLI. Its `query` command
accepts `dataview` and `dql` selectors for the shared `vault.query()` API.
`dataviewjs` and `dqljs`
are rejected unless `--unsafe-allow-js` is given, which runs the script in-process
without a sandbox (trusted scripts only; see the design notes). `--query` and `--stdin` are mutually
exclusive; stdin is UTF-8 and the query body is limited to 1 MiB. JSON is the
default output; Markdown renders lists and tables. An optional `--file`
must name an existing vault-relative Markdown file and supplies query context.
The host provides only frontmatter and file paths; body tags, inline fields,
headings, tasks and body-link metadata may be missing, so results depending on
them may be incomplete without warnings. CSV sources, TASK and CALENDAR queries
are disabled. Dataview can silently omit rows when expressions fail; result
limits bound returned rows, not query execution. See the [API guide](docs/api-usage.md).

| Option                 | Purpose                              |
| ---------------------- | ------------------------------------ |
| `--edge-field`         | Configure an edge field (repeatable) |
| `--edge-type`          | Filter neighbors by edge type        |
| `--direction incoming` | Select incoming edges                |
| `--limit`              | Lower the result limit               |

`graph neighbors` is an alternative spelling for direct-neighbor queries and
requires at least one `--edge-field`. Graph traversal and export are available
through `graph` subcommands.

## MCP server (stdio)

```sh
node dist/src/mcp/index.js --vault /path/to/vault --edge-field parent
```

The server exposes `list`, graph operations, and `refresh`; its `list` tool
retains the folder-only query, not the new Dataview query. The vault is bound at
startup; tool arguments cannot select a different vault. Successful results
carry the API result in `structuredContent` and as JSON text; failures have
`isError: true`.

> **Security:** any client authorized to use the server can read the exposed
> vault. Do not expose its stdio transport to untrusted clients.

## Documentation

- [JavaScript API usage](docs/api-usage.md)
- [Using the CLI from AI agents](docs/agent-usage.md)
- [Requirements](design/REQUIREMENTS.md)
- [Components](design/COMPONENTS.md)
- [Architecture and design decisions](design/DESIGN.md)
- [Design directory overview](design/README.md)
- [Contributor guidance](AGENTS.md)
- [Dated upstream research](design/notes/2026-11-19-upstream.md)

## License

Distributed under the [MIT License](LICENSE). Any reused upstream code remains
subject to its own license notices and terms.
