# Components

- `src/cli/` — CLI interface for querying a vault.
- `src/mcp/` – MCP interface for querying a vault.
- `src/api/` – Shared implementation for the CLI and MCP interfaces. Also usable standalone as a JS/TS library for querying a vault.
- `src/host/` – Stub implementations of the official Obsidian APIs; used for integrating with the code of the `dataview` and `breadcrumbs` plugins.
