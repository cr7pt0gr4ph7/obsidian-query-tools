#!/usr/bin/env node
import { pathToFileURL } from "node:url";
import { VaultQueryError, openVault } from "../api/index.js";
import type { NeighborOptions, Vault } from "../api/types.js";

type Command =
	| { operation: "list"; query: string; limit?: number }
	| {
			operation: "neighbors";
			path: string;
			options: NeighborOptions;
	  };

interface ParsedArguments {
	vaultPath: string;
	edgeFields: string[];
	command: Command;
}

const usage = `Usage:
  obsidian-query-tools --vault <directory> [--edge-field <field> ...] list <query> [--limit <count>]
  obsidian-query-tools --vault <directory> [--edge-field <field> ...] neighbors <path> [--direction <incoming|outgoing>] [--edge-type <type> ...] [--limit <count>]

Options:
  --vault <directory>      Select the local vault to query
  --edge-field <field>     Index a configured frontmatter edge field (repeatable)
  --edge-type <type>       Filter neighbors by edge type (repeatable)
  --direction <direction>  Select incoming or outgoing neighbors
  --limit <count>          Lower the API's default result limit
  --help                   Show this help
`;

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

function parseArguments(args: string[]): ParsedArguments {
	let vaultPath: string | undefined;
	let direction: "incoming" | "outgoing" | undefined;
	let limit: number | undefined;
	const edgeFields: string[] = [];
	const types: string[] = [];
	const positionals: string[] = [];
	let sawDirection = false;
	let sawLimit = false;

	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];
		if (!arg.startsWith("--")) {
			positionals.push(arg);
			continue;
		}

		const equalsIndex = arg.indexOf("=");
		const option = equalsIndex < 0 ? arg : arg.slice(0, equalsIndex);
		let value = equalsIndex < 0 ? undefined : arg.slice(equalsIndex + 1);
		if (option === "--help") invalidArguments("Help requested.");

		if (
			![
				"--vault",
				"--edge-field",
				"--direction",
				"--edge-type",
				"--limit",
			].includes(option)
		) {
			invalidArguments(`Unknown option: ${option}`);
		}
		if (value === undefined) {
			index += 1;
			value = args[index];
		}
		if (value === undefined || value.startsWith("--")) {
			invalidArguments(`Missing value for ${option}.`);
		}

		switch (option) {
			case "--vault":
				if (vaultPath !== undefined)
					invalidArguments("--vault may be specified once.");
				vaultPath = value;
				break;
			case "--edge-field":
				edgeFields.push(value);
				break;
			case "--edge-type":
				types.push(value);
				break;
			case "--direction":
				if (sawDirection)
					invalidArguments("--direction may be specified once.");
				sawDirection = true;
				if (value !== "incoming" && value !== "outgoing") {
					invalidArguments("--direction must be incoming or outgoing.");
				}
				direction = value;
				break;
			case "--limit":
				if (sawLimit) invalidArguments("--limit may be specified once.");
				sawLimit = true;
				limit = positiveInteger(value, "--limit");
				break;
		}
	}

	if (vaultPath === undefined || !vaultPath)
		invalidArguments("--vault is required.");
	let operation: string;
	let input: string;
	if (positionals[0] === "graph") {
		if (positionals[1] === "traverse" || positionals[1] === "export") {
			throw new VaultQueryError(
				"UNSUPPORTED_FEATURE",
				`The graph ${positionals[1]} command requires shared API support that is not available.`,
			);
		}
		if (
			positionals.length !== 3 ||
			positionals[1] !== "neighbors" ||
			edgeFields.length === 0
		) {
			invalidArguments(
				"Use graph neighbors <path> with at least one --edge-field.",
			);
		}
		operation = "neighbors";
		input = positionals[2];
	} else {
		if (positionals.length !== 2) {
			invalidArguments("Specify exactly one operation and one query or path.");
		}
		operation = positionals[0];
		input = positionals[1];
	}

	if (operation === "list") {
		if (direction !== undefined || types.length > 0) {
			invalidArguments(
				"--direction and --edge-type are only valid for neighbors.",
			);
		}
		return {
			vaultPath,
			edgeFields,
			command: { operation, query: input, limit },
		};
	}
	if (operation === "neighbors") {
		const options: NeighborOptions = {};
		if (direction !== undefined) options.direction = direction;
		if (types.length > 0) options.types = types;
		if (limit !== undefined) options.limit = limit;
		return {
			vaultPath,
			edgeFields,
			command: { operation, path: input, options },
		};
	}
	invalidArguments(`Unsupported operation: ${operation}`);
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

async function execute(vault: Vault, command: Command): Promise<unknown> {
	if (command.operation === "list") {
		return vault.list(command.query, { limit: command.limit });
	}
	return vault.graph().neighbors(command.path, command.options);
}

export async function runCli(args: string[]): Promise<number> {
	if (args.includes("--help")) {
		process.stdout.write(usage);
		return 0;
	}

	let vault: Vault | undefined;
	try {
		const parsed = parseArguments(args);
		vault = await openVault(parsed.vaultPath, {
			edgeFields: parsed.edgeFields,
		});
		const result = await execute(vault, parsed.command);
		process.stdout.write(`${JSON.stringify(result)}\n`);
		return 0;
	} catch (error) {
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
