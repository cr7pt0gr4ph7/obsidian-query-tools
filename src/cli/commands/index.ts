import { Command } from "commander";
import { registerGraphCommands } from "./graph.js";
import { registerNeighborsCommand } from "./neighbors.js";
import type { CliCommandSelector } from "./types.js";

export type { CliCommand } from "./types.js";

/**
 * Create the CLI command tree and connect command actions to the selection callback.
 *
 * @param version Version displayed by `--version`.
 * @param select Callback receiving the selected operation and its options.
 * @returns The configured Commander program.
 */
export function createProgram(version: string, select: CliCommandSelector): Command {
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
		.option("--config <file>", "Read edgeFields, oppositeFields, allowWikilinks and limits from a JSON file")
		.option("--allow-wikilinks", "Accept [[wikilink]] edge values, resolved by path or unique basename")
		.option(
			"--opposite <field:type>",
			"Imply a reverse edge of <type> for every <field> edge (repeatable)",
			(value: string, previous: string[]) => [...previous, value],
			[],
		)
		.allowExcessArguments(false)
		.exitOverride()
		.configureOutput({
			writeOut: (text) => process.stdout.write(text),
			writeErr: () => {},
		});

	program.command("describe").description("Print supported operations, limits and error codes as JSON.");

	program.command("query [options]").description("Run a supported query; use query --help for its options.");

	registerNeighborsCommand(program, select);
	registerGraphCommands(program, select);

	return program;
}
