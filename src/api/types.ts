export interface VaultLimits {
	maxEntries: number;
	maxFiles: number;
	maxFileBytes: number;
	maxResults: number;
}

export interface GraphLimits {
	maxEdges: number;
}

export interface VaultOptions {
	edgeFields?: string[];
	limits?: Partial<VaultLimits & GraphLimits>;
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

export interface VaultGraph {
	neighbors(node: string, options?: NeighborOptions): QueryResult<Edge>;
}

export interface Vault {
	list(query: string, options?: ListOptions): QueryResult<string>;
	graph(): VaultGraph;
	refresh(): Promise<number>;
	close(): void;
}

export interface GraphConfig {
	edgeFields: string[];
	limits: GraphLimits;
}

export interface Config {
	limits: VaultLimits;
	graph: GraphConfig;
}

export interface GraphIndex {
	files: string[];
	edges: Edge[];
}

export interface VaultIndex {
	graph: GraphIndex;
}
