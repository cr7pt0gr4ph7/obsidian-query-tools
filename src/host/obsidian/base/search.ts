/**
 * A list of matched text ranges.
 * @public
 */
export type SearchMatches = SearchMatchPart[];

/**
 * Text position offsets within text file. Represents
 * a text range `[fromOffset, toOffset]`.
 * @public
 */
export type SearchMatchPart = [number, number];

/**
 * A search result.
 * @public
 * @since 0.9.21
 */
export interface SearchResult {
	/**
	 * The score.
	 * @public
	 */
	score: number;

	/**
	 * The matched text ranges.
	 * @public
	 */
	matches: SearchMatches;
}

/**
 * An object that contains a search result.
 * @public
 * @since 0.9.21
 */
export interface SearchResultContainer {
	/**
	 * The search result.
	 * @public
	 */
	match: SearchResult;
}
