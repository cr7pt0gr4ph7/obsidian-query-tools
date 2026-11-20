import vm from "node:vm";
import { ErrorCode as EC, VaultQueryError } from "../utils/errors.js";
import type { QueryResult } from "../utils/result.js";

/** Optional controls for unsafe script evaluation. */
export interface ScriptOptions {
	/** Maximum values returned; cannot exceed the vault's configured maximum. */
	limit?: number;
	/** Vault-relative Markdown file exposed to the script as `dv.current`. */
	file?: string;
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

const defaultTimeoutMs = 5000;

/**
 * Evaluate caller-supplied JavaScript. This is NOT a security sandbox: `node:vm`
 * contexts can be escaped. Only run scripts the caller fully trusts.
 */
export async function runScript(
	source: string,
	host: ScriptHost,
	timeoutMs: number = defaultTimeoutMs,
): Promise<unknown[]> {
	if (typeof source !== "string" || !source.trim())
		throw new VaultQueryError(EC.INVALID_QUERY, "Script must not be empty.");
	if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1)
		throw new VaultQueryError(EC.INVALID_OPTIONS, "Invalid script timeout.");
	const plain = <T>(value: T): T => structuredClone(value);
	const dv = {
		current: host.current,
		paths: () => plain(host.paths()),
		list: (query: string) => plain(host.list(query)),
		neighbors: (path: string, options?: object) =>
			plain(host.neighbors(path, options)),
	};
	let timer: NodeJS.Timeout | undefined;
	try {
		const context = vm.createContext(
			{ dv },
			{ codeGeneration: { strings: false, wasm: false } },
		);
		const script = new vm.Script(`(async () => {\n${source}\n})()`, {
			filename: "query-script.js",
		});
		const pending = script.runInContext(context, { timeout: timeoutMs });
		const timeout = new Promise<never>((_, reject) => {
			timer = setTimeout(
				() =>
					reject(new VaultQueryError(EC.LIMIT_EXCEEDED, "Script timed out.")),
				timeoutMs,
			);
		});
		const value: unknown = await Promise.race([pending, timeout]);
		if (value === undefined) return [];
		const json = JSON.stringify(value);
		if (json === undefined)
			throw new VaultQueryError(
				EC.INVALID_QUERY,
				"Script result must be JSON-serializable.",
			);
		const parsed: unknown = JSON.parse(json);
		return Array.isArray(parsed) ? parsed : [parsed];
	} catch (error) {
		if (error instanceof VaultQueryError) throw error;
		const name =
			error && typeof error === "object" && "name" in error
				? String(error.name)
				: "Error";
		throw new VaultQueryError(
			EC.INVALID_QUERY,
			name === "SyntaxError" || name === "Error" || /Error$/.test(name)
				? `Script failed: ${name}.`
				: "Script failed.",
		);
	} finally {
		clearTimeout(timer);
	}
}
