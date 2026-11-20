import { Errors, type NeighborOptions } from "../../api/index.js";
import type { CliCommandSelector, NeighborCliOptions } from "./types.js";

/**
 * Parse a positive safe integer command-line option.
 *
 * @param value Raw option value.
 * @param option Option name used in the error message.
 * @returns The parsed positive integer.
 */
export function positiveInteger(value: string, option: string): number {
	if (!/^[0-9]+$/.test(value)) {
		throw Errors.Options.InvalidOptions(`${option} must be a positive integer.`);
	}
	const parsed = Number(value);
	if (!Number.isSafeInteger(parsed) || parsed < 1) {
		throw Errors.Options.InvalidOptions(`${option} must be a positive integer.`);
	}
	return parsed;
}

/**
 * Throw a structured invalid-arguments error.
 *
 * @param message Explanation of the invalid argument.
 */
export function invalidArguments(message: string): never {
	throw Errors.Options.InvalidOptions(message);
}

/**
 * Create the action callback for the neighbors command.
 *
 * @param select Callback receiving the normalized neighbors command.
 * @returns A Commander action that translates CLI options to API options.
 */
export function createNeighborAction(select: CliCommandSelector) {
	return (path: string, options: NeighborCliOptions) => {
		const neighborOptions: NeighborOptions = {};
		if (options.direction !== undefined) {
			neighborOptions.direction = options.direction;
		}
		if (options.edgeType?.length) {
			neighborOptions.types = options.edgeType;
		}
		if (options.limit !== undefined) {
			neighborOptions.limit = positiveInteger(options.limit, "--limit");
		}
		select({
			operation: "neighbors",
			path,
			options: neighborOptions,
			...(options.edgeField?.length ? { edgeFields: options.edgeField } : {}),
		});
	};
}
