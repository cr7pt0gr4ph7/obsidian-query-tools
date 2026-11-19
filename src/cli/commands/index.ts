import { Command } from "commander";
import { registerGraphCommands } from "./graph.js";
import { registerNeighborsCommand } from "./neighbors.js";
import type { CliCommandSelector } from "./types.js";

export type { CliCommand } from "./types.js";

export function createProgram(
	version: string,
	select: CliCommandSelector,
): Command {
	const program = new Command()
		.name("obsidian-query-tools")
		.description("Query a local Obsidian vault.")
		.version(version, "-v, --version", "Output the installed version")
		.requiredOption("--vault <directory>", "Select the local vault to query")
		.option(
			"--edge-field <field>",
			"Index a configured frontmatter edge field (repeatable)",
			(value: string, previous: string[]) => [...previous, value],
			[],
		)
		.allowExcessArguments(false)
		.exitOverride()
		.configureOutput({
			writeOut: (text) => process.stdout.write(text),
			writeErr: () => {},
		});

	program
		.command("query [options]")
		.description("Run a supported query; use query --help for its options.");

	registerNeighborsCommand(program, select);
	registerGraphCommands(program, select);

	return program;
}
