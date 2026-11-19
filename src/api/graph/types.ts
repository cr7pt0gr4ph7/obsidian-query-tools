import type { QueryResult } from "../utils/result.js";
import type { ListOptions } from "../dataview/list.js";

/** Filters for a direct-neighbor query. */
export interface NeighborOptions extends ListOptions {
	/** Return edges sourced from the node or edges targeting the node. */
	direction?: "outgoing" | "incoming";
	/** Configured frontmatter fields to include. */
	types?: string[];
}

/** A directed relationship extracted from a configured frontmatter field. */
export interface Edge {
	/** Vault-relative Markdown path where the relationship is declared. */
	source: string;
	/** Vault-relative Markdown path referenced by the relationship. */
	target: string;
	/** Frontmatter field that declared the relationship. */
	type: string;
}

/** Direct-neighbor queries over the vault's current graph generation. */
export interface VaultGraph {
	/**
	 * Find direct edges incident to a Markdown file.
	 * @param node Vault-relative Markdown path to query.
	 * @param options Direction, edge-type, and result-limit filters.
	 */
	neighbors(node: string, options?: NeighborOptions): QueryResult<Edge>;
}

/** Indexed Markdown files and their configured directed relationships. */
export interface GraphIndex {
	/** Sorted vault-relative Markdown paths. */
	files: string[];
	/** Sorted directed edges extracted from configured frontmatter fields. */
	edges: Edge[];
}
