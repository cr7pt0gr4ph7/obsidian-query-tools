# Design

## Architectural approach

The process indexes one selected vault into a disposable in-memory index and
serves queries through the shared JavaScript API. The CLI and MCP server are
thin API clients; an Obsidian instance is not required.

Index construction publishes a generation only on success. Queries use one
published generation; refresh builds a replacement and preserves the previous
generation if construction fails. This does not guarantee an atomic snapshot
of a changing filesystem.

## Upstream integration

Dataview and Breadcrumbs are Obsidian plugins, not proven drop-in Node query
engines. Their examined revisions, licenses, and source/build/runtime evidence
are recorded in the [upstream research notes](notes/2026-11-19-upstream.md).

## Security and operational decisions

- Reads use Linux `/proc/self/fd` and `O_NOFOLLOW`; symlinks and special files
  are rejected. Linux with usable procfs is required. Metadata checks detect
  many concurrent changes, but indexing is not an atomic filesystem snapshot.
- Treat vault content, queries, and MCP input as untrusted. Do not execute
  vault-supplied scripts, access the network, or log note contents by default.
- MCP binds the vault at server startup; clients cannot choose arbitrary
  server paths. Any authorized client can read the exposed vault. Do not
  expose stdio to untrusted clients.
- Refresh is explicit. Watchers, persistent caches, incremental indexing,
  and multi-vault service are out of scope.

## Validation and release gates

(To be specified)