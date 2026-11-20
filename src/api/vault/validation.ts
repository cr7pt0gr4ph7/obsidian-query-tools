import type { GraphLimits } from "../graph/config.js";
import { Errors } from "../utils/errors.js";
import type { Config } from "./types.js";
import type { VaultLimits, VaultOptions } from "./vault.js";

export const defaultLimits: VaultLimits & GraphLimits = Object.freeze({
	maxEntries: 100_000,
	maxFiles: 10_000,
	maxFileBytes: 1_048_576,
	maxEdges: 100_000,
	maxResults: 1_000,
});

/**
 * Validate open options and combine caller settings with the default limits.
 *
 * @param options Caller-supplied vault options.
 * @returns Validated graph and vault configuration.
 */
export function optionsForOpen(options: VaultOptions): Config {
	if (!options || typeof options !== "object" || Array.isArray(options)) {
		throw Errors.Options.InvalidOptions("Options must be an object.");
	}
	for (const key of Object.keys(options)) {
		if (!["edgeFields", "oppositeFields", "allowWikilinks", "limits", "unsafeJavaScript"].includes(key)) {
			throw Errors.Options.InvalidOptions(`Unknown option: ${key}`);
		}
	}
	if (options.unsafeJavaScript !== undefined && typeof options.unsafeJavaScript !== "boolean") {
		throw Errors.Options.InvalidOptions("unsafeJavaScript must be a boolean.");
	}
	if (options.allowWikilinks !== undefined && typeof options.allowWikilinks !== "boolean") {
		throw Errors.Options.InvalidOptions("allowWikilinks must be a boolean.");
	}
	const edgeFields = options.edgeFields ?? [];
	if (
		!Array.isArray(edgeFields) ||
		edgeFields.some((x) => typeof x !== "string" || !x.trim()) ||
		new Set(edgeFields).size !== edgeFields.length
	) {
		throw Errors.Options.InvalidOptions("edgeFields must be an array of unique nonempty strings.");
	}
	const opposites = options.oppositeFields ?? {};
	if (!opposites || typeof opposites !== "object" || Array.isArray(opposites)) {
		throw Errors.Options.InvalidOptions("oppositeFields must be an object.");
	}
	const reverse = Object.values(opposites);
	if (
		Object.entries(opposites).some(
			([field, opposite]) =>
				!edgeFields.includes(field) ||
				typeof opposite !== "string" ||
				!opposite.trim() ||
				edgeFields.includes(opposite),
		) ||
		new Set(reverse).size !== reverse.length
	) {
		throw Errors.Options.InvalidOptions("oppositeFields must map configured fields to unique new nonempty type names.");
	}
	const limits = options.limits ?? {};
	if (!limits || typeof limits !== "object" || Array.isArray(limits)) {
		throw Errors.Options.InvalidOptions("limits must be an object.");
	}
	for (const [key, value] of Object.entries(limits)) {
		if (!Object.hasOwn(defaultLimits, key) || !Number.isSafeInteger(value) || value < 1) {
			throw Errors.Options.InvalidOptions(`Invalid limit: ${key}`);
		}
	}
	const { maxEdges, ...vaultLimits } = { ...defaultLimits, ...limits };
	return {
		limits: vaultLimits,
		unsafeJavaScript: options.unsafeJavaScript === true,
		graph: {
			edgeFields: [...edgeFields],
			wikilinks: options.allowWikilinks === true,
			opposites: { ...opposites },
			limits: { maxEdges },
		},
	};
}
