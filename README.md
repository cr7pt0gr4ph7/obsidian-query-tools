# Obsidian Query Tools

Node.js tools for read-only queries over a local Obsidian vault. The shared
JavaScript API is the source of behavior for the CLI and planned MCP server.

**Status: initial implementation.** The supported subset is deliberately
narrow and project-defined: `LIST FROM "<folder>"` returns vault-relative
Markdown paths, and configured frontmatter fields provide direct typed graph
edges. This is not a Dataview or Breadcrumbs parity claim. The API is
read-only; an MCP interface is planned.

Requires Node.js 24 or later on Linux with procfs. Node 26 is the only
runtime tested so far. Run `npm ci` to install dependencies and `npm test`
to run the test suite.

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
frontmatter, symlinks and special files fail explicitly. Requests return
`{ generation, data, diagnostics, truncated }`; errors expose a `code`.
Limits, error behavior, and filesystem race limitations are described in the
[design](design/DESIGN.md).

The CLI emits a single JSON result on stdout, or a JSON error on stderr with
exit status 1. Repeat `--edge-field` to configure multiple fields; use
`--type` to filter neighbors, `--direction incoming` to select incoming
edges, and `--limit` to lower the result limit.

```sh
node src/cli.js --vault /path/to/vault list 'LIST FROM "Tasks"'
node src/cli.js --vault /path/to/vault --edge-field parent neighbors Tasks/example.md
```

## Documentation

- [Requirements](design/REQUIREMENTS.md)
- [Components](design/COMPONENTS.md)
- [Architecture and design decisions](design/DESIGN.md)
- [Design directory overview](design/README.md)
- [Contributor guidance](AGENTS.md)
- [Dated upstream research](design/notes/2026-11-19-upstream.md)

This project is distributed under the [MIT License](LICENSE). Any reused
upstream code remains subject to its own license notices and terms.
