import type { ListOptions } from "../dataview/list.js";
import type {
	GraphConfig,
	GraphIndex,
	GraphLimits,
	VaultGraph,
} from "../graph/types.js";
import type { QueryResult } from "../utils/result.js";

export interface VaultLimits {
	maxEntries: number;
	maxFiles: number;
	maxFileBytes: number;
	maxResults: number;
}

export interface VaultOptions {
	edgeFields?: string[];
	limits?: Partial<VaultLimits & GraphLimits>;
}

export interface Vault {
	list(query: string, options?: ListOptions): QueryResult<string>;
	graph(): VaultGraph;
	refresh(): Promise<number>;
	close(): void;
}

export interface Config {
	limits: VaultLimits;
	graph: GraphConfig;
}

export interface VaultIndex {
	graph: GraphIndex;
}
