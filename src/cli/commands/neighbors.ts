import { Command, Option } from "commander";
import { createNeighborAction } from "./helpers.js";
import type { CliCommandSelector } from "./types.js";

export function registerNeighborsCommand(
	program: Command,
	select: CliCommandSelector,
): void {
	program
		.command("neighbors <path>")
		.description("Query direct graph neighbors.")
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
		.action(createNeighborAction(select));
}
