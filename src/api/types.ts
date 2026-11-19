export interface QueryResult<T> {
	generation: number;
	data: T[];
	diagnostics: { code: string; message: string }[];
	truncated: boolean;
}
