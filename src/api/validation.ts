import { fail } from "./errors.js";
import type {
	Config,
	GraphLimits,
	ListOptions,
	VaultLimits,
	VaultOptions,
} from "./types.js";

const defaults: VaultLimits & GraphLimits = Object.freeze({
	maxEntries: 100_000,
	maxFiles: 10_000,
	maxFileBytes: 1_048_576,
	maxEdges: 100_000,
	maxResults: 1_000,
});

export function validatePath(value: string, allowEmpty = false): string {
	if (
		typeof value !== "string" ||
		(!allowEmpty && !value) ||
		value.includes("\\") ||
		value.includes("\0") ||
		value.startsWith("/") ||
		/^[a-z]:/i.test(value) ||
		(value &&
			value.split("/").some((part) => !part || part === "." || part === ".."))
	) {
		fail("INVALID_PATH", "Expected a vault-relative POSIX path.");
	}
	return value;
}

export function optionsForOpen(options: VaultOptions): Config {
	if (!options || typeof options !== "object" || Array.isArray(options)) {
		fail("INVALID_OPTIONS", "Options must be an object.");
	}
	for (const key of Object.keys(options)) {
		if (!["edgeFields", "limits"].includes(key))
			fail("INVALID_OPTIONS", `Unknown option: ${key}`);
	}
	const edgeFields = options.edgeFields ?? [];
	if (
		!Array.isArray(edgeFields) ||
		edgeFields.some((x) => typeof x !== "string" || !x.trim()) ||
		new Set(edgeFields).size !== edgeFields.length
	) {
		fail(
			"INVALID_OPTIONS",
			"edgeFields must be an array of unique nonempty strings.",
		);
	}
	const limits = options.limits ?? {};
	if (!limits || typeof limits !== "object" || Array.isArray(limits)) {
		fail("INVALID_OPTIONS", "limits must be an object.");
	}
	for (const [key, value] of Object.entries(limits)) {
		if (
			!Object.hasOwn(defaults, key) ||
			!Number.isSafeInteger(value) ||
			value < 1
		) {
			fail("INVALID_OPTIONS", `Invalid limit: ${key}`);
		}
	}
	const { maxEdges, ...vaultLimits } = { ...defaults, ...limits };
	return {
		limits: vaultLimits,
		graph: { edgeFields: [...edgeFields], limits: { maxEdges } },
	};
}

export function requestLimit(
	options: ListOptions,
	max: number,
	keys: string[],
): number {
	if (!options || typeof options !== "object" || Array.isArray(options))
		fail("INVALID_OPTIONS", "Options must be an object.");
	for (const key of Object.keys(options)) {
		if (!keys.includes(key)) fail("INVALID_OPTIONS", `Unknown option: ${key}`);
	}
	const limit = options.limit ?? max;
	if (!Number.isSafeInteger(limit) || limit < 1 || limit > max)
		fail("INVALID_OPTIONS", "Invalid result limit.");
	return limit;
}
