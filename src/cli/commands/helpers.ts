import { Errors, type NeighborOptions } from "../../api/index.js";
import type { CliCommandSelector, NeighborCliOptions } from "./types.js";

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

export function invalidArguments(message: string): never {
	throw Errors.Options.InvalidOptions(message);
}

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
