# Proposed components

Dependencies flow from interfaces toward the shared core and adapters. These
are logical boundaries, not yet packages or implemented modules.

| Component | Responsibility | Depends on |
| --- | --- | --- |
| JavaScript API | Open/close a vault, refresh its index, dispatch queries, normalize results, apply limits and report errors. Own the public contract and index-generation lifecycle. | Vault access, index, adapters |
| Vault access | Resolve an authorized root; enumerate and read vault files and applicable settings while enforcing path and symlink boundaries. Report read and consistency failures. | Local filesystem |
| Index and metadata bridge | Provide the metadata, link resolution, settings and lifecycle services needed by supported upstream code. Build and publish coherent index generations. | Vault access, upstream adapters |
| Dataview adapter | Integrate reusable Dataview parsing, indexing and query code and translate between its values/errors and the API contract. | Pinned Dataview code, metadata bridge |
| Breadcrumbs adapter | Integrate reusable Breadcrumbs graph construction/inference and translate supported graph queries and configuration. | Pinned Breadcrumbs code, metadata bridge; Dataview adapter if required by the selected upstream version |
| CLI | Parse user input, choose an authorized local vault, call the API, serialize results, and provide exit statuses and stderr diagnostics. | JavaScript API |
| MCP server | Bind a configured vault at startup; validate tool inputs, apply limits, dispatch to the API, and serialize results/errors over MCP. | JavaScript API, MCP SDK/transport |

## Boundaries

- Upstream adapters isolate plugin-specific types, APIs, and runtime
  assumptions. They should use unchanged upstream modules where feasible;
  neither adapter implies that an entire plugin can be loaded in Node.
- The bridge is a compatibility layer for the smallest proven set of
  Obsidian services, not a promise to recreate the whole Obsidian runtime.
  Graph construction may require plugin-specific settings or metadata
  resolution; dependencies must be established experimentally.
- CLI and MCP contain no independent parsing, indexing, relationship
  inference, or query evaluation. Transport validation is separate from
  domain validation.
- The serialization boundary is shared so dates, links, graph edges, missing
  values, diagnostics, and truncation have consistent meanings. Native API
  types may be richer than JSON, but normalization must be lossless for the
  supported value types.

The exact package layout, API names and cross-component data types are open
until the integration spike establishes what can be reused.
