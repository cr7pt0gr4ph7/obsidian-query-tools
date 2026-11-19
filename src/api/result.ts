import type { QueryResult } from "./types.js";

export function result<T>(
	generation: number,
	values: T[],
	limit: number,
): QueryResult<T> {
	return {
		generation,
		data: values.slice(0, limit),
		diagnostics: [
			{
				code: "NON_ATOMIC_SNAPSHOT",
				message: "The filesystem may change during indexing.",
			},
		],
		truncated: values.length > limit,
	};
}
