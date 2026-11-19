import { Command, Option } from "commander";
import { VaultQueryError } from "../../api/index.js";
import { createNeighborAction, invalidArguments } from "./helpers.js";
import type { CliCommandSelector, RootOptions } from "./types.js";

export function registerGraphCommands(
	program: Command,
	select: CliCommandSelector,
): void {
	const graph = program.command("graph").description("Run a graph operation.");

	graph
		.command("neighbors <path>")
		.description("Query direct graph neighbors.")
		.option(
			"--edge-field <field>",
			"Index a configured frontmatter edge field",
			(value: string, previous: string[]) => [...previous, value],
			[],
		)
		.addOption(
			new Option(
				"--direction <direction>",
				"Select incoming or outgoing neighbors",
			).choices(["incoming", "outgoing"]),
		)
		.option(
			"--edge-type <type>",
			"Filter neighbors by edge type (repeatable)",
			(value: string, previous: string[]) => [...previous, value],
			[],
		)
		.option("--limit <count>", "Lower the API's default result limit")
		.action((path: string, options, command: Command) => {
			const globalOptions = command.optsWithGlobals<RootOptions>();
			const edgeFields = [
				...globalOptions.edgeField,
				...(options.edgeField ?? []),
			];
			if (edgeFields.length === 0) {
				invalidArguments(
					"Use graph neighbors <path> with at least one --edge-field.",
				);
			}
			createNeighborAction(select)(path, options);
		});

	for (const operation of ["traverse", "export"]) {
		graph
			.command(`${operation} [arguments...]`)
			.description(`Graph ${operation} is not available in the shared API.`)
			.action(() => {
				throw new VaultQueryError(
					"UNSUPPORTED_FEATURE",
					`The graph ${operation} command requires shared API support that is not available.`,
				);
			});
	}
}
