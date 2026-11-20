import vm from "node:vm";
import { Errors } from "../utils/errors.js";

/** Options for unsafe script evaluation. */
export interface ScriptOptions {
	/** Maximum values returned; cannot exceed the vault's configured maximum. */
	limit?: number;
	/** Vault-relative Markdown file exposed to the script as `dv.current`. */
	file?: string;
	/** Synchronous-execution and overall wall-clock limit in milliseconds (default 5000). */
	timeoutMs?: number;
}

const defaultRunScriptOptions = {
	timeoutMs: 5000,
} satisfies RunScriptOptions;

export interface RunScriptOptions {
	/** Synchronous-execution and overall wall-clock limit in milliseconds (default 5000). */
	timeoutMs?: number;
}

/** Host operations exposed to a script as the `dv` object. */
export interface ScriptHost {
	/** Run a supported `LIST FROM` query and return its paths. */
	list(query: string): string[];
	/** Return all indexed Markdown paths. */
	paths(): string[];
	/** Return direct edges incident to a path. */
	neighbors(
		path: string,
		options?: { direction?: "incoming" | "outgoing"; types?: string[] },
	): { source: string; target: string; type: string }[];
	/** Current-file context, when supplied. */
	current?: string;
}

function validateTimeout(options: RunScriptOptions) {
	const timeoutMs = options.timeoutMs ?? defaultRunScriptOptions.timeoutMs;
	if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1) {
		throw Errors.Options.InvalidOptions("Invalid script timeout.");
	}
	return timeoutMs;
}

/**
 * Check if an error is a script timeout error.
 * @param error The error to check.
 * @returns True if the error is a script timeout error, false otherwise.
 */
function isTimeoutError(error: unknown) {
	// WORKAROUND: Detect timeout error from the V8 runtime
	return error instanceof Error && error.message === "Script execution timed out.";
}

/**
 * Evaluate caller-supplied JavaScript. This is NOT a security sandbox: `node:vm`
 * contexts can be escaped. Only run scripts the caller fully trusts.
 */
export async function runScript(
	source: string,
	host: ScriptHost,
	options: RunScriptOptions = defaultRunScriptOptions,
): Promise<unknown[]> {
	if (typeof source !== "string" || !source.trim()) {
		throw Errors.Query.InvalidQuery("Script must not be empty.");
	}
	const timeoutMs = validateTimeout(options);
	const plain = <T>(value: T): T => structuredClone(value);
	const dv = {
		current: host.current,
		paths: () => plain(host.paths()),
		list: (query: string) => plain(host.list(query)),
		neighbors: (path: string, options?: object) => plain(host.neighbors(path, options)),
	};
	try {
		const context = vm.createContext({ dv }, { codeGeneration: { strings: false, wasm: false } });
		const script = new vm.Script(`(async () => {\n${source}\n})()`, {
			filename: "query-script.js",
		});
		const pending = script.runInContext(context, { timeout: timeoutMs });
		const value = await pending;
		if (value === undefined) {
			return [];
		}
		const json = JSON.stringify(value);
		if (json === undefined) {
			throw Errors.Query.InvalidQuery("Script result must be JSON-serializable.");
		}
		const parsed: unknown = JSON.parse(json);
		return Array.isArray(parsed) ? parsed : [parsed];
	} catch (error) {
		if (Errors.is(error)) {
			throw error;
		}
		if (isTimeoutError(error)) {
			throw Errors.Limits.Exceeded("Script timed out.");
		}
		const name = error && typeof error === "object" && "name" in error ? String(error.name) : "Error";
		throw Errors.Query.InvalidQuery(
			name === "SyntaxError" || name === "Error" || /Error$/.test(name) ? `Script failed: ${name}.` : "Script failed.",
		);
	}
}
