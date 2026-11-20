import type { QueryResult } from "../utils/result.js";
import type { ListOptions } from "../dataview/list.js";

/** Filters for a direct-neighbor query. */
export interface NeighborOptions extends ListOptions {
	/** Return edges sourced from the node or edges targeting the node. */
	direction?: "outgoing" | "incoming";
	/** Configured frontmatter fields to include. */
	types?: string[];
}

/** Filters for a multi-hop traversal. */
export interface TraverseOptions extends NeighborOptions {
	/** Maximum number of hops from the start node (default and maximum 1000). */
	maxDepth?: number;
}

/** Filters for a shortest-path query. */
export type PathOptions = Omit<TraverseOptions, "maxDepth">;

/** Aggregate counts describing the graph. */
export interface GraphStats {
	generation: number;
	nodeCount: number;
	edgeCount: number;
	/** Edge count for every selected type, including zero counts. */
	edgesByType: Record<string, number>;
	/** Nodes with outgoing but no incoming edges. */
	sources: number;
	/** Nodes with incoming but no outgoing edges. */
	sinks: number;
	/** Nodes with no edges in either direction. */
	isolated: number;
	diagnostics: { code: string; message: string }[];
	truncated: boolean;
}

/** Filters for listing nodes by role. */
export interface NodesOptions extends ListOptions {
	/** `sources` have only outgoing edges, `sinks` only incoming, `isolated` none (default `all`). */
	role?: "all" | "sources" | "sinks" | "isolated";
	/** Configured edge fields that define the roles (default all). */
	types?: string[];
}

/** Filters for cycle detection. */
export interface CyclesOptions extends ListOptions {
	/** Configured edge fields to follow (default all). */
	types?: string[];
}

/** Supported graph serialization formats. */
export type ExportFormat = "json" | "csv" | "dot" | "mermaid" | "graphml";

/** Options for graph export. */
export interface ExportOptions {
	/** Output format (default `json`). */
	format?: ExportFormat;
	/** Configured edge fields to include (default all). */
	types?: string[];
}

/** A serialized graph document. Export is bounded by the index's edge limit, so it is never truncated. */
export interface GraphExport {
	generation: number;
	format: ExportFormat;
	/** The serialized graph. */
	content: string;
	nodeCount: number;
	edgeCount: number;
	diagnostics: { code: string; message: string }[];
	truncated: boolean;
}

/** A directed relationship extracted from a configured frontmatter field. */
export interface Edge {
	/** Vault-relative Markdown path where the relationship is declared. */
	source: string;
	/** Vault-relative Markdown path referenced by the relationship. */
	target: string;
	/** Frontmatter field that declared the relationship, or the opposite type for implied edges. */
	type: string;
	/** True when the edge was derived from an opposite-field mapping rather than declared. */
	implied?: true;
}

/** Direct-neighbor queries over the vault's current graph generation. */
export interface VaultGraph {
	/**
	 * Find direct edges incident to a Markdown file.
	 * @param node Vault-relative Markdown path to query.
	 * @param options Direction, edge-type, and result-limit filters.
	 */
	neighbors(node: string, options?: NeighborOptions): QueryResult<Edge>;
	/**
	 * Breadth-first walk of edges reachable from a node, visiting each node once.
	 * This is plain reachability, not Breadcrumbs' transitive rules.
	 */
	traverse(node: string, options?: TraverseOptions): QueryResult<Edge>;
	/**
	 * Shortest chain of edges from one node to another; `data` is empty when the
	 * target is unreachable or equals the start.
	 */
	path(from: string, to: string, options?: PathOptions): QueryResult<Edge>;
	/** Find groups of nodes that can reach each other (cycles), each sorted, ordered by first path. */
	cycles(options?: CyclesOptions): QueryResult<string[]>;
	/** List sorted Markdown paths, optionally only sources, sinks, or isolated nodes. */
	nodes(options?: NodesOptions): QueryResult<string>;
	/** Count nodes and edges, optionally limited to some edge types. */
	stats(options?: { types?: string[] }): GraphStats;
	/** Serialize the whole graph (all Markdown files as nodes) in a chosen format. */
	export(options?: ExportOptions): GraphExport;
}
