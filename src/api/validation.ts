import { fail } from "./errors.js";
import type { ListOptions } from "./dataview/types.js";

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
