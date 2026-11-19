#!/usr/bin/env node
import { Command, CommanderError, Option } from "commander";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { VaultQueryError, openVault } from "../api/index.js";
import type { NeighborOptions, Vault } from "../api/index.js";
import { runConsole } from "../console.js";
import type { ConsoleRequest } from "../console.js";

const version = createRequire(import.meta.url)("../../package.json").version;

type CliCommand =
	| { operation: "list"; query: string; limit?: number }
	| { operation: "neighbors"; path: string; options: NeighborOptions };

interface RootOptions {
	vault?: string;
	edgeField: string[];
}

interface LimitOptions {
	limit?: string;
}

interface NeighborCliOptions extends LimitOptions {
	direction?: "incoming" | "outgoing";
	edgeType?: string[];
	edgeField?: string[];
}

function invalidArguments(message: string): never {
	throw new VaultQueryError("INVALID_OPTIONS", message);
}

function positiveInteger(value: string, option: string): number {
	if (!/^[0-9]+$/.test(value)) {
		invalidArguments(`${option} must be a positive integer.`);
	}
	const parsed = Number(value);
	if (!Number.isSafeInteger(parsed) || parsed < 1) {
		invalidArguments(`${option} must be a positive integer.`);
	}
	return parsed;
}

function serializeError(error: unknown): string {
	if (error instanceof VaultQueryError) {
		const detail: { code: string; message: string; path?: string } = {
			code: error.code,
			message: error.message,
		};
		if (error.path !== undefined) detail.path = error.path;
		return JSON.stringify({ error: detail });
	}
	return JSON.stringify({
		error: {
			code: "INTERNAL_ERROR",
			message: "An unexpected error occurred.",
		},
	});
}

async function execute(vault: Vault, command: CliCommand): Promise<unknown> {
	if (command.operation === "list") {
		return vault.list(command.query, { limit: command.limit });
	}
	return vault.graph().neighbors(command.path, command.options);
}

function createProgram(select: (command: CliCommand) => void): Command {
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

	program
		.command("list <query>")
		.description("Run a supported LIST query.")
		.option("--limit <count>", "Lower the API's default result limit")
		.action((query: string, options: LimitOptions) => {
			const command: CliCommand = {
				operation: "list",
				query,
			};
			if (options.limit !== undefined) {
				command.limit = positiveInteger(options.limit, "--limit");
			}
			select(command);
		});

	const neighbors = (path: string, options: NeighborCliOptions) => {
		const neighborOptions: NeighborOptions = {};
		if (options.direction !== undefined) {
			neighborOptions.direction = options.direction;
		}
		if (options.edgeType !== undefined) {
			neighborOptions.types = options.edgeType;
		}
		if (options.limit !== undefined) {
			neighborOptions.limit = positiveInteger(options.limit, "--limit");
		}
		select({ operation: "neighbors", path, options: neighborOptions });
	};

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
		.action(neighbors);

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
		.action((path: string, options: NeighborCliOptions, command: Command) => {
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
			neighbors(path, options);
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

	return program;
}

export async function runCli(args: string[]): Promise<number> {
	if (args[0] === "query") {
		return runConsole(args, {
			api: {
				async query(request: ConsoleRequest) {
					const vault = await openVault(request.vault);
					try {
						return vault.list(request.query, {
							...(request.file === undefined ? {} : { file: request.file }),
						});
					} finally {
						vault.close();
					}
				},
			},
			stdin: process.stdin,
			stdout: process.stdout,
			stderr: process.stderr,
			version,
		});
	}

	let selectedCommand: CliCommand | undefined;
	const program = createProgram((command) => {
		selectedCommand = command;
	});

	let vault: Vault | undefined;
	try {
		await program.parseAsync(args, { from: "user" });
		if (selectedCommand === undefined) {
			invalidArguments("Specify a supported operation.");
		}
		const options = program.opts<RootOptions>();
		if (!options.vault) invalidArguments("--vault is required.");
		vault = await openVault(options.vault, { edgeFields: options.edgeField });
		const result = await execute(vault, selectedCommand);
		process.stdout.write(`${JSON.stringify(result)}\n`);
		return 0;
	} catch (error) {
		if (error instanceof CommanderError && error.exitCode === 0) return 0;
		if (error instanceof CommanderError) {
			const message = error.message.replace(/^error: /, "");
			process.stderr.write(
				`${serializeError(new VaultQueryError("INVALID_OPTIONS", message))}\n`,
			);
			return 1;
		}
		process.stderr.write(`${serializeError(error)}\n`);
		return 1;
	} finally {
		vault?.close();
	}
}

if (
	process.argv[1] &&
	import.meta.url === pathToFileURL(process.argv[1]).href
) {
	process.exitCode = await runCli(process.argv.slice(2));
}
