import { type Command, Option } from "commander";
import type {
	CyclesOptions,
	NodesOptions,
	PathOptions,
	SiblingsOptions,
	TraverseOptions,
} from "../../api/index.js";
import {
	createNeighborAction,
	invalidArguments,
	positiveInteger,
} from "./helpers.js";
import type { CliCommandSelector, RootOptions } from "./types.js";

function requireEdgeFields(
	command: Command,
	options: { edgeField?: string[] },
) {
	const globalOptions = command.optsWithGlobals<RootOptions>();
	if (
		!globalOptions.config &&
		[...globalOptions.edgeField, ...(options.edgeField ?? [])].length === 0
	)
		invalidArguments("Graph operations require at least one --edge-field.");
}

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
			if (!globalOptions.config && edgeFields.length === 0) {
				invalidArguments(
					"Use graph neighbors <path> with at least one --edge-field.",
				);
			}
			createNeighborAction(select)(path, options);
		});

	const collect = (value: string, previous: string[]) => [...previous, value];
	graph
		.command("traverse <path>")
		.description("Walk edges reachable from a node (breadth-first).")
		.addOption(
			new Option(
				"--direction <direction>",
				"Follow edges in a direction",
			).choices(["incoming", "outgoing"]),
		)
		.option(
			"--edge-type <type>",
			"Filter by edge type (repeatable)",
			collect,
			[],
		)
		.option("--max-depth <count>", "Maximum number of hops")
		.option("--limit <count>", "Lower the API's default result limit")
		.action((path: string, options, command: Command) => {
			requireEdgeFields(command, options);
			const traverseOptions: TraverseOptions = {};
			if (options.direction !== undefined)
				traverseOptions.direction = options.direction;
			if (options.edgeType.length) traverseOptions.types = options.edgeType;
			if (options.maxDepth !== undefined)
				traverseOptions.maxDepth = positiveInteger(
					options.maxDepth,
					"--max-depth",
				);
			if (options.limit !== undefined)
				traverseOptions.limit = positiveInteger(options.limit, "--limit");
			select({ operation: "traverse", path, options: traverseOptions });
		});

	graph
		.command("path <from> <to>")
		.description("Find the shortest edge path between two nodes.")
		.addOption(
			new Option(
				"--direction <direction>",
				"Follow edges in a direction",
			).choices(["incoming", "outgoing"]),
		)
		.option(
			"--edge-type <type>",
			"Filter by edge type (repeatable)",
			collect,
			[],
		)
		.option("--limit <count>", "Lower the API's default result limit")
		.action((from: string, to: string, options, command: Command) => {
			requireEdgeFields(command, options);
			const pathOptions: PathOptions = {};
			if (options.direction !== undefined)
				pathOptions.direction = options.direction;
			if (options.edgeType.length) pathOptions.types = options.edgeType;
			if (options.limit !== undefined)
				pathOptions.limit = positiveInteger(options.limit, "--limit");
			select({ operation: "path", from, to, options: pathOptions });
		});

	graph
		.command("siblings <path>")
		.description(
			"Find notes sharing a parent with a note through the same edge type.",
		)
		.option(
			"--edge-type <type>",
			"Filter by edge type (repeatable)",
			collect,
			[],
		)
		.option("--limit <count>", "Lower the API's default result limit")
		.action((path: string, options, command: Command) => {
			requireEdgeFields(command, options);
			const siblingOptions: SiblingsOptions = {};
			if (options.edgeType.length) siblingOptions.types = options.edgeType;
			if (options.limit !== undefined)
				siblingOptions.limit = positiveInteger(options.limit, "--limit");
			select({ operation: "siblings", path, options: siblingOptions });
		});

	graph
		.command("cycles")
		.description("Find groups of nodes that can reach each other.")
		.option(
			"--edge-type <type>",
			"Filter by edge type (repeatable)",
			collect,
			[],
		)
		.option("--limit <count>", "Lower the API's default result limit")
		.action((options, command: Command) => {
			requireEdgeFields(command, options);
			const cycleOptions: CyclesOptions = {};
			if (options.edgeType.length) cycleOptions.types = options.edgeType;
			if (options.limit !== undefined)
				cycleOptions.limit = positiveInteger(options.limit, "--limit");
			select({ operation: "cycles", options: cycleOptions });
		});

	graph
		.command("nodes")
		.description(
			"List Markdown paths, optionally only sources, sinks or isolated nodes.",
		)
		.addOption(
			new Option("--role <role>", "Select nodes by role")
				.choices(["all", "sources", "sinks", "isolated"])
				.default("all"),
		)
		.option(
			"--edge-type <type>",
			"Filter by edge type (repeatable)",
			collect,
			[],
		)
		.option("--limit <count>", "Lower the API's default result limit")
		.action((options, command: Command) => {
			requireEdgeFields(command, options);
			const nodeOptions: NodesOptions = { role: options.role };
			if (options.edgeType.length) nodeOptions.types = options.edgeType;
			if (options.limit !== undefined)
				nodeOptions.limit = positiveInteger(options.limit, "--limit");
			select({ operation: "nodes", options: nodeOptions });
		});

	graph
		.command("stats")
		.description("Count nodes, edges, sources, sinks and isolated nodes.")
		.option(
			"--edge-type <type>",
			"Filter by edge type (repeatable)",
			collect,
			[],
		)
		.action((options, command: Command) => {
			requireEdgeFields(command, options);
			select({
				operation: "stats",
				options: options.edgeType.length ? { types: options.edgeType } : {},
			});
		});

	graph
		.command("export")
		.description(
			"Export the whole graph as json, csv, dot, mermaid, or graphml.",
		)
		.addOption(
			new Option("--format <format>", "Output format")
				.choices(["json", "csv", "dot", "mermaid", "graphml"])
				.default("json"),
		)
		.option(
			"--edge-type <type>",
			"Filter by edge type (repeatable)",
			collect,
			[],
		)
		.action((options, command: Command) => {
			requireEdgeFields(command, options);
			select({
				operation: "export",
				options: {
					format: options.format,
					...(options.edgeType.length ? { types: options.edgeType } : {}),
				},
			});
		});
}
