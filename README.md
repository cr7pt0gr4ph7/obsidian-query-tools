# Obsidian Query Tools

An initial design draft for a Node.js application to query data in a local
Obsidian vault. The proposed interfaces are a shared JavaScript API, a CLI
built on that API, and an MCP server built on the same API. The design aims to
reuse [Dataview](https://github.com/blacksmithgu/obsidian-dataview) and
[Breadcrumbs](https://github.com/michaelpporter/breadcrumbs) code where
feasible.

**Status: design draft only.** There is no implementation, installation
process, or executable command yet. Standalone compatibility with either
Obsidian plugin has not been established. The proposed default is read-only
access to vault contents.

## Documentation

- [Requirements](design/REQUIREMENTS.md)
- [Components](design/COMPONENTS.md)
- [Architecture and design decisions](design/DESIGN.md)
- [Design directory overview](design/README.md)
- [Contributor guidance](AGENTS.md)
- [Dated upstream research](design/notes/2026-11-19-upstream.md)

This project is distributed under the [MIT License](LICENSE). Any reused
upstream code remains subject to its own license notices and terms.
