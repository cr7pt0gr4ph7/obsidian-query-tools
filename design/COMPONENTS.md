# Proposed components

Dependencies flow from interfaces toward the shared core. These are logical
boundaries, not yet packages.

| Component | Responsibility | Depends on |
| --- | --- | --- |
| JavaScript API | Open/close a vault, refresh its index, dispatch the supported folder query and neighbor lookup, apply limits, and report errors. Own the public contract and index-generation lifecycle. | Vault access, index |
| Vault access | Resolve an authorized root; enumerate and read Markdown files while enforcing path and symlink boundaries. Report read and consistency failures. | Local filesystem |
| Index | Store sorted Markdown paths and direct typed edges extracted from configured frontmatter fields. Build and publish coherent generations. | Vault access, YAML parser |
| CLI | Parse user input, choose an authorized local vault, call the API, serialize results, and provide exit statuses and stderr diagnostics. | JavaScript API |
| MCP server | Bind a configured vault at startup; validate tool inputs, apply limits, dispatch to the API, and serialize results/errors over MCP. | JavaScript API, MCP SDK/transport |

## Boundaries

- The initial implementation does not load either upstream plugin and makes
  no parity claim. Dataview's tests are reference material for query syntax
  and fixture design, not an oracle for project-defined query execution.
- The initial edge index reads only explicitly configured frontmatter fields;
  it does not recreate Obsidian link resolution or Breadcrumbs inference.
- CLI and MCP contain no independent parsing, indexing, relationship
  inference, or query evaluation. Transport validation is separate from
  domain validation.
- The API returns JSON-safe relative paths and edge objects, with shared
  generation, diagnostics, and truncation metadata.

## Initial standalone slice

The first implementation deliberately does not load either Obsidian plugin.
The shared JavaScript API indexes Markdown paths and configured frontmatter
edge fields. It supports only `LIST FROM "<folder>"` path results and direct
neighbors. Its query and edge semantics are project-defined and must not be
described as Dataview or Breadcrumbs parity. The CLI and MCP server are thin
clients of this API.
