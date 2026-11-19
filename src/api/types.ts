export interface VaultLimits {
	maxEntries: number;
	maxFiles: number;
	maxFileBytes: number;
	maxEdges: number;
	maxResults: number;
}

export interface VaultOptions {
	edgeFields?: string[];
	limits?: Partial<VaultLimits>;
}

export interface ListOptions {
	limit?: number;
}

export interface NeighborOptions extends ListOptions {
	direction?: "outgoing" | "incoming";
	types?: string[];
}

export interface Edge {
	source: string;
	target: string;
	type: string;
}

export interface QueryResult<T> {
	generation: number;
	data: T[];
	diagnostics: { code: string; message: string }[];
	truncated: boolean;
}

export interface Vault {
	list(query: string, options?: ListOptions): QueryResult<string>;
	neighbors(node: string, options?: NeighborOptions): QueryResult<Edge>;
	refresh(): Promise<number>;
	close(): void;
}

export interface Config {
	edgeFields: string[];
	limits: VaultLimits;
}

export interface VaultIndex {
	files: string[];
	edges: Edge[];
}
