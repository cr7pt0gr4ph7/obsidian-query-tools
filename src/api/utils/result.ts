/** A bounded query response tied to the index generation that produced it. */
export interface QueryResult<T> {
	/** Index generation observed by the query. */
	generation: number;
	/** Returned values, limited to the requested maximum. */
	data: T[];
	/** Non-fatal conditions observed while producing the result. */
	diagnostics: { code: string; message: string }[];
	/** Whether additional matching values were omitted due to the limit. */
	truncated: boolean;
}

/**
 * Create a result envelope, trimming values to the requested limit.
 * @param generation Index generation used to produce the result.
 * @param values All matching values before applying the result limit.
 * @param limit Maximum number of values to return.
 */
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
