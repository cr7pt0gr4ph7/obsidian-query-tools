import { parseArgs } from "node:util";

const maxQueryBytes = 1_048_576;
const modes = ["dataview", "dql", "dataviewjs", "dqljs"] as const;
const help = `Usage: obsidian-query query --vault <directory> --type <mode> (--query <source> | --stdin) [--file <vault-relative-path>] [--format <json|markdown>]

Modes: dataview, dql, dataviewjs, dqljs
Formats: json (default), markdown
Query input is limited to 1 MiB. JavaScript modes are currently unsupported.
`;

/** Query mode names accepted by the preliminary console interface. */
export type ConsoleMode = (typeof modes)[number];

/** Query request passed from the console adapter to the shared API. */
export interface ConsoleRequest {
	/** Local vault directory selected by the user. */
	vault: string;
	/** Supported non-JavaScript query mode. */
	type: "dataview" | "dataviewjs";
	/** Query source text. */
	query: string;
	/** Optional vault-relative Markdown file context. */
	file?: string;
}

/** Query output returned by the shared API adapter. */
export interface ConsoleResult {
	/** Query data to serialize as JSON or Markdown. */
	data: unknown;
	/** Non-fatal conditions reported by the query. */
	diagnostics: { code: string; message: string }[];
	/** Whether the result was limited. */
	truncated: boolean;
	/** Index generation used to produce the result, when available. */
	generation?: number;
}

/** API and I/O dependencies required by the console command. */
export interface ConsoleDependencies {
	/** Shared API adapter invoked for supported queries. */
	api: {
		/** Execute the request through the shared query API. */
		query(request: ConsoleRequest): Promise<ConsoleResult> | ConsoleResult;
	};
	/** Optional UTF-8 query input stream used with `--stdin`. */
	stdin?: AsyncIterable<Uint8Array>;
	/** Output stream for machine-readable results and help text. */
	stdout: { write(value: string): unknown };
	/** Output stream for diagnostics and errors. */
	stderr: { write(value: string): unknown };
	/** Optional package version displayed by `--version`. */
	version?: string;
}

class ConsoleError extends Error {
	constructor(
		readonly code: string,
		message: string,
	) {
		super(message);
	}
}

function parse(arguments_: string[]) {
	try {
		return parseArgs({
			args: arguments_,
			allowPositionals: true,
			strict: true,
			options: {
				vault: { type: "string" },
				type: { type: "string" },
				query: { type: "string" },
				stdin: { type: "boolean" },
				file: { type: "string" },
				format: { type: "string" },
				help: { type: "boolean", short: "h" },
				version: { type: "boolean", short: "v" },
			},
		});
	} catch {
		throw new ConsoleError("INVALID_OPTIONS", "Invalid command-line options.");
	}
}

async function readStdin(
	input: AsyncIterable<Uint8Array> | undefined,
): Promise<string> {
	if (!input)
		throw new ConsoleError("INVALID_INPUT", "No stdin input is available.");
	const chunks: Uint8Array[] = [];
	let length = 0;
	for await (const chunk of input) {
		length += chunk.byteLength;
		if (length > maxQueryBytes)
			throw new ConsoleError(
				"LIMIT_EXCEEDED",
				"Query input exceeds the 1 MiB limit.",
			);
		chunks.push(chunk);
	}
	try {
		return new TextDecoder("utf-8", { fatal: true }).decode(
			Buffer.concat(chunks),
		);
	} catch {
		throw new ConsoleError("INVALID_INPUT", "Stdin must contain valid UTF-8.");
	}
}

function markdownValue(value: unknown): string {
	if (
		value === null ||
		typeof value === "string" ||
		typeof value === "number" ||
		typeof value === "boolean"
	) {
		return String(value ?? "");
	}
	throw new ConsoleError(
		"UNSUPPORTED_FORMAT",
		"This result cannot be represented as Markdown.",
	);
}

function escapeMarkdown(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll("\\", "\\\\")
		.replace(/([`*_{}[\]()#+.!|~-])/g, "\\$1")
		.replace(/\r\n|\r|\n/g, "&#10;");
}

function markdown(data: unknown): string {
	if (typeof data === "string") return `${escapeMarkdown(data)}\n`;
	if (!Array.isArray(data)) return `${markdownValue(data)}\n`;
	if (data.length === 0) return "\n";
	if (
		data.every(
			(item) =>
				item === null || ["string", "number", "boolean"].includes(typeof item),
		)
	) {
		return `${data.map((item) => `- ${escapeMarkdown(markdownValue(item))}`).join("\n")}\n`;
	}
	if (
		data.every(
			(item) =>
				item !== null && typeof item === "object" && !Array.isArray(item),
		)
	) {
		const records = data as Record<string, unknown>[];
		const columns = Object.keys(records[0]);
		if (
			records.some(
				(record) => Object.keys(record).join("\0") !== columns.join("\0"),
			)
		) {
			throw new ConsoleError(
				"UNSUPPORTED_FORMAT",
				"This result cannot be represented as a Markdown table.",
			);
		}
		const cell = (value: unknown) => escapeMarkdown(markdownValue(value));
		const header = `| ${columns.map(cell).join(" | ")} |`;
		const separator = `| ${columns.map(() => "---").join(" | ")} |`;
		return `${[header, separator, ...records.map((record) => `| ${columns.map((column) => cell(record[column])).join(" | ")} |`)].join("\n")}\n`;
	}
	throw new ConsoleError(
		"UNSUPPORTED_FORMAT",
		"This result cannot be represented as Markdown.",
	);
}

function outputError(
	stderr: ConsoleDependencies["stderr"],
	error: unknown,
	query?: string,
): number {
	const code =
		error instanceof ConsoleError
			? error.code
			: error &&
					typeof error === "object" &&
					"code" in error &&
					typeof error.code === "string"
				? error.code
				: "INTERNAL_ERROR";
	let message =
		error instanceof Error && error.message
			? error.message
			: "Unexpected internal error.";
	if (query) message = message.replaceAll(query, "[query]");
	stderr.write(`${code}: ${message}\n`);
	return 1;
}

/** Parse, execute, and format one console query command. */
export async function runConsole(
	arguments_: string[],
	dependencies: ConsoleDependencies,
): Promise<number> {
	let source: string | undefined;
	try {
		const { values, positionals } = parse(arguments_);
		if (values.help) {
			if (
				positionals.length > 1 ||
				(positionals.length === 1 && positionals[0] !== "query")
			) {
				throw new ConsoleError("INVALID_OPTIONS", "Invalid command.");
			}
			dependencies.stdout.write(help);
			return 0;
		}
		if (values.version) {
			if (
				positionals.length > 1 ||
				(positionals.length === 1 && positionals[0] !== "query")
			) {
				throw new ConsoleError("INVALID_OPTIONS", "Invalid command.");
			}
			dependencies.stdout.write(`${dependencies.version ?? "0.0.0"}\n`);
			return 0;
		}
		if (positionals.length !== 1 || positionals[0] !== "query") {
			throw new ConsoleError("INVALID_OPTIONS", "Expected the query command.");
		}
		if (!values.vault)
			throw new ConsoleError("INVALID_OPTIONS", "--vault is required.");
		if (
			typeof values.type !== "string" ||
			!modes.includes(values.type as ConsoleMode)
		) {
			throw new ConsoleError(
				"INVALID_OPTIONS",
				"A supported --type is required.",
			);
		}
		if (
			values.format !== undefined &&
			values.format !== "json" &&
			values.format !== "markdown"
		) {
			throw new ConsoleError("INVALID_OPTIONS", "Unsupported output format.");
		}
		if (values.file !== undefined && !values.file) {
			throw new ConsoleError(
				"INVALID_OPTIONS",
				"--file must be a nonempty vault-relative path.",
			);
		}
		const hasQuery = values.query !== undefined;
		const hasStdin = values.stdin === true;
		if (hasQuery === hasStdin) {
			throw new ConsoleError(
				"INVALID_OPTIONS",
				"Supply exactly one of --query or --stdin.",
			);
		}
		source = hasQuery ? values.query! : await readStdin(dependencies.stdin);
		if (!source.trim())
			throw new ConsoleError("INVALID_INPUT", "Query input must not be empty.");
		if (Buffer.byteLength(source, "utf8") > maxQueryBytes) {
			throw new ConsoleError(
				"LIMIT_EXCEEDED",
				"Query input exceeds the 1 MiB limit.",
			);
		}

		const javascript = values.type === "dataviewjs" || values.type === "dqljs";
		if (javascript) {
			throw new ConsoleError(
				"UNSUPPORTED_FEATURE",
				"JavaScript query modes are disabled.",
			);
		}
		const result = await dependencies.api.query({
			vault: values.vault,
			type: "dataview",
			query: source,
			...(values.file === undefined ? {} : { file: values.file }),
		});
		const format = values.format ?? "json";
		if (format === "json") {
			const envelope: ConsoleResult = {
				data: result.data,
				diagnostics: result.diagnostics,
				truncated: result.truncated,
				...(result.generation === undefined
					? {}
					: { generation: result.generation }),
			};
			dependencies.stdout.write(`${JSON.stringify(envelope)}\n`);
		} else {
			const output = markdown(result.data);
			if (result.diagnostics.length) {
				dependencies.stderr.write(
					`${result.diagnostics.map((item) => `${item.code}: ${item.message}`).join("\n")}\n`,
				);
			}
			if (result.truncated) dependencies.stderr.write("Result truncated.\n");
			dependencies.stdout.write(output);
		}
		return 0;
	} catch (error) {
		return outputError(dependencies.stderr, error, source);
	}
}
