/** Maximum number of configured frontmatter edges to index. */
export interface GraphLimits {
	/** Indexing fails when the vault contains more edges than this count. */
	maxEdges: number;
}

/** Edge-field configuration and limits used to construct the graph index. */
export interface GraphConfig {
	/** Frontmatter field names interpreted as typed relationships. */
	edgeFields: string[];
	/** Maps a configured field to the type of the implied reverse edge. */
	opposites: Record<string, string>;
	/** Graph-specific resource limits. */
	limits: GraphLimits;
}

/** Every edge type that can appear: configured fields plus implied opposite types. */
export function edgeTypes(config: GraphConfig): string[] {
	return [
		...new Set([...config.edgeFields, ...Object.values(config.opposites)]),
	];
}
