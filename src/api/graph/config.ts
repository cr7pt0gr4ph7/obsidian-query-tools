/** Maximum number of configured frontmatter edges to index. */
export interface GraphLimits {
	/** Indexing fails when the vault contains more edges than this count. */
	maxEdges: number;
}

/** Edge-field configuration and limits used to construct the graph index. */
export interface GraphConfig {
	/** Frontmatter field names interpreted as typed relationships. */
	edgeFields: string[];
	/** Accept `[[Note]]` values, resolved by vault path or unique basename. */
	wikilinks: boolean;
	/** Maps a configured field to the type of the implied reverse edge. */
	opposites: Record<string, string>;
	/** Graph-specific resource limits. */
	limits: GraphLimits;
}

/**
 * Return every edge type that can appear, including implied opposite types.
 *
 * @param config Graph configuration containing declared and opposite fields.
 * @returns Unique configured edge types, preserving first occurrence.
 */
export function edgeTypes(config: GraphConfig): string[] {
	return [...new Set([...config.edgeFields, ...Object.values(config.opposites)])];
}
