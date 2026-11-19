# Console interface implementation

The preliminary `obsidian-query query` command is implemented by the injectable
runner in `src/console.ts` and is reachable through the `obsidian-query` and
`obsidian-query-tools` binaries. The CLI adapter routes declarative input
through `Vault.list()`; it does not implement a separate query parser.

The `dataview` and `dql` selectors accept only the project's
`LIST FROM "<folder>"` subset. `dataviewjs` and `dqljs` fail as unsupported and
are never evaluated. Query input is limited to 1 MiB. Optional file context is
validated by the shared API as an existing vault-relative Markdown path, but
the current query subset does not consume current-file context or resolve
relative links. Output is bounded by the API result limit, with JSON as the
default and a Markdown path-list representation.

These are project-defined semantics, not an upstream compatibility claim.
The implementation preserves read-only vault access and does not transmit
vault data. The tests run as part of `npm test`.
