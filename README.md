# Obsidian Query Tools

Read-only Node.js tools for querying a local Obsidian vault. The CLI and MCP
server share one JavaScript API; TypeScript declarations are included.

> **Status: initial implementation.** The supported subset is deliberately
> narrow and project-defined. This is not a Dataview or Breadcrumbs parity
> claim. All interfaces are read-only.

## Features

- `LIST FROM "<folder>"` returns vault-relative Markdown paths.
- Configured frontmatter fields provide direct, typed graph edges.
- Three operations: `list`, `neighbors`, and `refresh`.

## Requirements and setup

- Node.js 24 or later on Linux with procfs (tested on Node 24.22.3 and 26.13.0).

```sh
npm ci         # install dependencies
npm run build  # compile to dist/
npm test       # build, type-check, and run tests
```

## JavaScript API

```js
import { openVault } from "obsidian-query-tools";

const vault = await openVault("/path/to/vault", { edgeFields: ["parent"] });
console.log(vault.list('LIST FROM "Tasks"'));
console.log(
	vault.graph().neighbors("Tasks/example.md", { direction: "outgoing" }),
);
await vault.refresh();
vault.close();
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

The existing `list` and graph commands print JSON. The preliminary `query`
command defaults to JSON and can emit Markdown; errors go to stderr with exit
status 1.

```sh
node dist/cli/index.js --help
node dist/cli/index.js query --vault /path/to/vault --type dataview \
  --query 'LIST FROM "Tasks"' --format markdown
node dist/cli/index.js query --vault /path/to/vault --type dql --stdin
node dist/cli/index.js --vault /path/to/vault list 'LIST FROM "Tasks"'
node dist/cli/index.js --vault /path/to/vault --edge-field parent neighbors Tasks/example.md
node dist/cli/index.js --vault /path/to/vault graph neighbors Tasks/example.md --edge-field parent
```

The `obsidian-query` binary is an alias for the CLI. Its preliminary `query`
command accepts `dataview` and `dql` selectors but supports only the shared
API's project-defined `LIST FROM "<folder>"` query. `dataviewjs` and `dqljs`
are rejected without execution. `--query` and `--stdin` are mutually
exclusive; stdin is UTF-8 and the query body is limited to 1 MiB. JSON is the
default output; Markdown emits path lists as bullets. An optional `--file`
must name an existing vault-relative Markdown file, but no current-file-
dependent query syntax is currently supported. This is not a Dataview
compatibility claim.

| Option                 | Purpose                              |
| ---------------------- | ------------------------------------ |
| `--edge-field`         | Configure an edge field (repeatable) |
| `--edge-type`          | Filter neighbors by edge type        |
| `--direction incoming` | Select incoming edges                |
| `--limit`              | Lower the result limit               |

`graph neighbors` is an alternative spelling for direct-neighbor queries and
requires at least one `--edge-field`. Graph traversal and export are not
implemented because the shared API does not yet provide those operations.

## MCP server (stdio)

```sh
node dist/mcp/index.js --vault /path/to/vault --edge-field parent
```

The server exposes `list`, `neighbors`, and `refresh`. The vault is bound at
startup; tool arguments cannot select a different vault. Successful results
carry the API result in `structuredContent` and as JSON text; failures have
`isError: true`.

> **Security:** any client authorized to use the server can read the exposed
> vault. Do not expose its stdio transport to untrusted clients.

## Documentation

- [JavaScript API usage](docs/api-usage.md)
- [Requirements](design/REQUIREMENTS.md)
- [Components](design/COMPONENTS.md)
- [Architecture and design decisions](design/DESIGN.md)
- [Design directory overview](design/README.md)
- [Contributor guidance](AGENTS.md)
- [Dated upstream research](design/notes/2026-11-19-upstream.md)

## License

Distributed under the [MIT License](LICENSE). Any reused upstream code remains
subject to its own license notices and terms.
