import { CommanderError } from "commander";
import { createRequire } from "node:module";
import { VaultQueryError, describe, openVault } from "../api/index.js";
import type { Vault } from "../api/index.js";
import { runConsole } from "../console.js";
import type { ConsoleRequest } from "../console.js";
import { loadConfig, mergeOptions } from "./config.js";
import { createProgram } from "./commands/index.js";
import type { CliCommand } from "./commands/index.js";

const version = createRequire(import.meta.url)("../../package.json").version;

function invalidArguments(message: string): never {
	throw new VaultQueryError("INVALID_OPTIONS", message);
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
	const graph = vault.graph();
	switch (command.operation) {
		case "neighbors":
			return graph.neighbors(command.path, command.options);
		case "traverse":
			return graph.traverse(command.path, command.options);
		case "path":
			return graph.path(command.from, command.to, command.options);
		case "siblings":
			return graph.siblings(command.path, command.options);
		case "cycles":
			return graph.cycles(command.options);
		case "nodes":
			return graph.nodes(command.options);
		case "stats":
			return graph.stats(command.options);
		case "export":
			return graph.export(command.options);
	}
}

/** Run the CLI with user arguments, writing results and diagnostics to process streams. */
export async function runCli(args: string[]): Promise<number> {
	if (args.length === 1 && args[0] === "describe") {
		process.stdout.write(`${JSON.stringify(describe())}\n`);
		return 0;
	}
	if (args[0] === "query") {
		return runConsole(args, {
			api: {
				async query(request: ConsoleRequest) {
					const vault = await openVault(request.vault, {
						...(request.unsafeJs ? { unsafeJavaScript: true } : {}),
					});
					try {
						const options = {
							...(request.file === undefined ? {} : { file: request.file }),
							...(request.limit === undefined ? {} : { limit: request.limit }),
						};
						return request.type === "dataviewjs"
							? await vault.script(request.query, options)
							: vault.list(request.query, options);
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
	const program = createProgram(version, (command) => {
		selectedCommand = command;
	});

	let vault: Vault | undefined;
	try {
		await program.parseAsync(args, { from: "user" });
		if (selectedCommand === undefined) {
			invalidArguments("Specify a supported operation.");
		}
		const options = program.opts<{
			vault?: string;
			edgeField: string[];
			opposite: string[];
			allowWikilinks?: boolean;
			config?: string;
		}>();
		if (!options.vault) invalidArguments("--vault is required.");
		const oppositeFields: Record<string, string> = {};
		for (const pair of options.opposite) {
			const at = pair.indexOf(":");
			if (at < 1 || at === pair.length - 1)
				invalidArguments("--opposite expects <field:type>.");
			oppositeFields[pair.slice(0, at)] = pair.slice(at + 1);
		}
		const fileOptions = options.config ? await loadConfig(options.config) : {};
		const merged = mergeOptions(fileOptions, {
			edgeFields: [
				...options.edgeField,
				...(selectedCommand.operation === "neighbors"
					? (selectedCommand.edgeFields ?? [])
					: []),
			],
			oppositeFields,
			allowWikilinks: options.allowWikilinks === true,
		});
		if (!merged.edgeFields?.length)
			invalidArguments("Specify at least one edge field.");
		vault = await openVault(options.vault, merged);
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
