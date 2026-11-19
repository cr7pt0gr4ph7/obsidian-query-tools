import { fail } from "../errors.js";
import { result } from "../result.js";
import type { QueryResult } from "../types.js";
import { validatePath } from "../validation.js";

export function list(
	files: readonly string[],
	generation: number,
	query: string,
	limit: number,
): QueryResult<string> {
	if (typeof query !== "string")
		fail("INVALID_QUERY", 'Expected LIST FROM "<folder>".');
	const match = /^\s*list\s+from\s+"([^"]*)"\s*$/i.exec(query);
	if (!match) fail("INVALID_QUERY", 'Only LIST FROM "<folder>" is supported.');
	const folder = validatePath(match[1], true);
	const values = files.filter(
		(file) => !folder || file.startsWith(`${folder}/`),
	);
	return result(generation, values, limit);
}
