/** Maximum number of configured frontmatter edges to index. */
export interface GraphLimits {
	/** Indexing fails when the vault contains more edges than this count. */
	maxEdges: number;
}

/** Edge-field configuration and limits used to construct the graph index. */
export interface GraphConfig {
	/** Frontmatter field names interpreted as typed relationships. */
	edgeFields: string[];
	/** Graph-specific resource limits. */
	limits: GraphLimits;
}
