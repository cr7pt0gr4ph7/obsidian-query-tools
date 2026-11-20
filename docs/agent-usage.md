# Using the CLI from AI agents

Run `obsidian-query-tools describe` first: it prints, as JSON and without a
vault, the operations, export formats, default limits and error codes.

## Conventions

- Global options come before the subcommand: `--vault <dir>`, repeatable
  `--edge-field <field>`, `--opposite <field:type>`, `--allow-wikilinks`.
- Success: exit status `0`, one JSON document on stdout, nothing on stderr.
- Failure: exit status `1`, nothing on stdout, and one line on stderr:
  `{"error":{"code":"...","message":"...","path":"..."}}` (the `query`
  command writes `CODE: message` instead).
- Query results are `{ generation, data, diagnostics, truncated }`. When
  `truncated` is `true`, raise `--limit` (up to the configured maximum) or
  narrow the query. `export` and `stats` return their own envelopes.
- The vault is only read. All paths are vault-relative with `/` separators.

## Recipes

    V="--vault ./notes --edge-field parent --edge-field related"
    obsidian-query-tools $V stats
    obsidian-query-tools $V graph nodes --role isolated
    obsidian-query-tools $V neighbors Projects/a.md --direction incoming
    obsidian-query-tools $V graph traverse Projects/a.md --max-depth 3
    obsidian-query-tools $V graph path Projects/a.md Areas/b.md
    obsidian-query-tools $V graph cycles
    obsidian-query-tools $V graph export --format mermaid
    obsidian-query-tools --vault ./notes query --type dataview --query 'LIST FROM "Projects"'

Use `--opposite parent:child` to also see implied reverse edges (flagged
`"implied": true`).

## Safety

`query --type dataviewjs --unsafe-allow-js` runs a caller-supplied script
in-process with no sandbox. Never pass vault or other untrusted text to it.
The MCP server (`obsidian-query-tools-mcp --vault <dir>`) exposes the same
read-only operations and never enables script execution.
