import type { QueryResult } from "../utils/result.js";
import type { ListOptions } from "../dataview/types.js";

export interface GraphLimits {
	maxEdges: number;
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

export interface VaultGraph {
	neighbors(node: string, options?: NeighborOptions): QueryResult<Edge>;
}

export interface GraphConfig {
	edgeFields: string[];
	limits: GraphLimits;
}

export interface GraphIndex {
	files: string[];
	edges: Edge[];
}
