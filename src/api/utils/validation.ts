import type { ListOptions } from "../dataview/list.js";
import { ErrorCode as EC, VaultQueryError } from "./errors.js";

/**
 * Validate result-limit options and return the effective limit.
 * @param options Options object supplied to the query.
 * @param max Maximum configured result count.
 * @param keys Option names allowed by the caller.
 */
export function requestLimit(options: ListOptions, max: number, keys: string[]): number {
	if (!options || typeof options !== "object" || Array.isArray(options)) {
		throw new VaultQueryError(EC.INVALID_OPTIONS, "Options must be an object.");
	}
	validateOptions(options, keys as (keyof ListOptions)[]);
	const limit = options.limit ?? max;
	if (!Number.isSafeInteger(limit) || limit < 1 || limit > max) {
		throw new VaultQueryError(EC.INVALID_OPTIONS, "Invalid result limit.");
	}
	return limit;
}

/**
 * Validate that the provided options object only contains allowed keys.
 * @param options Options object to validate.
 * @param keys Array of allowed option keys.
 */
export function validateOptions<T extends {}>(options: T, keys: (keyof T)[]) {
	for (const key of Object.keys(options)) {
		if (!keys.includes(key as keyof T)) {
			throw new VaultQueryError(EC.INVALID_OPTIONS, `Unknown option: ${key}`);
		}
	}
}
