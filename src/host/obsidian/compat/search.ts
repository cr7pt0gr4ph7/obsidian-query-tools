import type { SearchMatches, SearchResult, SearchResultContainer } from "../base/search.js";

/**
 * Construct a fuzzy search callback that runs on a target string.
 * Performance may be an issue if you are running the search for more than a few thousand times.
 * If performance is a problem, consider using `prepareSimpleSearch` instead.
 * @param query the fuzzy query.
 * @returns A function that runs the search on a text, returning the result or `null` if the text does not match.
 * @public
 */
export function prepareFuzzySearch(query: string): (text: string) => SearchResult | null {
	// Ignored, as this is a stub implementation
	return (text) => null;
}

/**
 * Construct a simple search callback that runs on a target string.
 * @param query the space-separated words.
 * @returns A function that runs the search on a text, returning the result or `null` if the text does not match.
 * @public
 */
export function prepareSimpleSearch(query: string): (text: string) => SearchResult | null {
	// Ignored, as this is a stub implementation
	return (text) => null;
}

/**
 * Sort search results.
 * @param results The search results.
 * @public
 */
export function sortSearchResults(results: SearchResultContainer[]): void {
	// Ignored, as this is a stub implementation
}

/**
 * Render text with the given matches highlighted.
 * @param el The element to append the rendered text to.
 * @param text The text that was searched.
 * @param matches The matches.
 * @param offset An offset to add to each match position before highlighting.
 * @example
 * ```ts
 * renderMatches(document.body, 'Hello, world', [[0, 5]]); // <span class="suggestion-highlight">Hello</span>, world
 * ```
 * @public
 */
export function renderMatches(
	el: HTMLElement | DocumentFragment,
	text: string,
	matches: SearchMatches | null,
	offset?: number,
): void {
	// Ignored, as this is a stub implementation
}

/**
 * Render text with the matches of a search result highlighted.
 * @param el The element to append the rendered text to.
 * @param text The text that was searched.
 * @param result The search result.
 * @param offset An offset to add to each match position before highlighting.
 * @example
 * ```ts
 * renderResults(document.body, 'Hello, world', {
 *     score: 0.5,
 *     matches: [[0, 5]],
 * }); // <span class="suggestion-highlight">Hello</span>, world
 * ```
 * @public
 */
export function renderResults(el: HTMLElement, text: string, result: SearchResult, offset?: number): void {
	// Ignored, as this is a stub implementation
}
