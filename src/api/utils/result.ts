export interface QueryResult<T> {
	generation: number;
	data: T[];
	diagnostics: { code: string; message: string }[];
	truncated: boolean;
}

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
