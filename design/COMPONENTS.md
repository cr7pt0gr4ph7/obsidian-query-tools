# Components

Dependencies flow from the interfaces to the shared API. These are logical
boundaries, not separate packages.

| Component                          | Responsibility                                                                                                                                        | Depends on                        |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| JavaScript API                     | Stable `src/api/index.ts` entrypoint; re-exports domain API.                                                                                          | Vault, graph, dataview            |
| Vault API (`src/api/vault/`)       | Open/close a vault, refresh its index, build the shared index, and validate open options. Own index-generation lifecycle.                             | Vault access, graph index         |
| Graph API (`src/api/graph/`)       | Define graph types and perform bounded direct-neighbor lookup over the shared index.                                                                  | Vault index                       |
| Dataview API (`src/api/dataview/`) | Define list-query options and implement the project's supported `LIST FROM "<folder>"` query only. This is not the Dataview plugin or a parity layer. | Vault index                       |
| Vault access                       | Resolve an authorized root; enumerate and read Markdown files while enforcing path and symlink boundaries. Report read and consistency failures.      | Local filesystem                  |
| Index                              | Store sorted Markdown paths and direct typed edges extracted from configured frontmatter fields. Build and publish coherent generations.              | Vault access, YAML parser         |
| CLI                                | Parse user input, choose an authorized local vault, call the API, serialize results, and provide exit statuses and stderr diagnostics.                | JavaScript API                    |
| MCP server                         | Bind a configured vault at startup; validate tool inputs, apply limits, dispatch to the API, and serialize results/errors over MCP.                   | JavaScript API, MCP SDK/transport |

## Constraints

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
- Graph and dataview queries are domain modules composed by the vault API;
  CLI and MCP continue to call the public shared entrypoint.
