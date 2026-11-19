# Obsidian Query Tools

TypeScript-based Node.js tools for read-only queries over a local Obsidian
vault. The compiled JavaScript API is the source of behavior for the CLI and
MCP server; TypeScript declarations are provided alongside it.

**Status: initial implementation.** The supported subset is deliberately
narrow and project-defined: `LIST FROM "<folder>"` returns vault-relative
Markdown paths, and configured frontmatter fields provide direct typed graph
edges. This is not a Dataview or Breadcrumbs parity claim. All interfaces
are read-only.

Requires Node.js 24 or later on Linux with procfs. The test suite has run on
Node 24.22.3 and 26.13.0 on Linux. Run `npm ci` to install dependencies,
`npm run build` to compile to `dist/`, and `npm test` to build, type-check,
and run the test suite.

```js
import { openVault } from "obsidian-query-tools";

const vault = await openVault("/path/to/vault", { edgeFields: ["parent"] });
console.log(vault.list('LIST FROM "Tasks"'));
console.log(vault.neighbors("Tasks/example.md", { direction: "outgoing" }));
await vault.refresh();
vault.close();
```

`parent` values are exact vault-root-relative Markdown paths, or arrays of
paths, with an optional `.md` suffix. Unresolved targets, wikilinks, invalid
UTF-8 or unsupported YAML (including aliases), symlinks and special files
fail explicitly. Requests return
`{ generation, data, diagnostics, truncated }`; errors expose a `code`.
Limits, error behavior, and filesystem race limitations are described in the
[design](design/DESIGN.md).

The CLI emits a single JSON result on stdout, or a JSON error on stderr with
exit status 1. Repeat `--edge-field` to configure multiple fields; use
`--type` to filter neighbors, `--direction incoming` to select incoming
edges, and `--limit` to lower the result limit.

```sh
node dist/cli.js --vault /path/to/vault list 'LIST FROM "Tasks"'
node dist/cli.js --vault /path/to/vault --edge-field parent neighbors Tasks/example.md
```

For MCP stdio, start
`node dist/mcp.js --vault /path/to/vault --edge-field parent`. The server
exposes `list`, `neighbors`, and `refresh`, with the vault bound at startup;
tool arguments cannot select a different vault. Successful tool results carry
the API result in `structuredContent` and as JSON text; failures have
`isError: true`. Any client authorized to use the server can read the exposed
vault. Do not expose its stdio transport to untrusted clients.

## Documentation

- [Requirements](design/REQUIREMENTS.md)
- [Components](design/COMPONENTS.md)
- [Architecture and design decisions](design/DESIGN.md)
- [Design directory overview](design/README.md)
- [Contributor guidance](AGENTS.md)
- [Dated upstream research](design/notes/2026-11-19-upstream.md)

This project is distributed under the [MIT License](LICENSE). Any reused
upstream code remains subject to its own license notices and terms.
