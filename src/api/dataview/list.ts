import { Errors } from "../utils/errors.js";
import { validatePath } from "../utils/paths.js";
import { type QueryResult, result } from "../utils/result.js";

/** Optional controls for a supported folder-list query. */
export interface ListOptions {
	/** Maximum number of paths to return; cannot exceed the vault's configured maximum. */
	limit?: number;
	/** Optional vault-relative Markdown file context, validated but not used to change query semantics. */
	file?: string;
}

/**
 * Evaluate the supported `LIST FROM "<folder>"` query against indexed paths.
 * @param files Sorted vault-relative Markdown paths.
 * @param generation Index generation used by the query.
 * @param query Query text; other query forms are rejected.
 * @param limit Maximum number of paths to return.
 */
export function list(files: readonly string[], generation: number, query: string, limit: number): QueryResult<string> {
	if (typeof query !== "string") {
		throw Errors.Query.Invalid('Expected LIST FROM "<folder>".');
	}
	const match = /^\s*list\s+from\s+"([^"]*)"\s*$/i.exec(query);
	if (!match) {
		throw Errors.Query.Invalid('Only LIST FROM "<folder>" is supported.');
	}
	const folder = validatePath(match[1], true);
	const values = files.filter((file) => !folder || file.startsWith(`${folder}/`));
	return result(generation, values, limit);
}
