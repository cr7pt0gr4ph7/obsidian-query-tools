import type { SearchResult, SearchResultContainer } from "./components/search.js";

/**
 * Construct a fuzzy search callback that runs on a target string.
 * Performance may be an issue if you are running the search for more than a few thousand times.
 * If performance is a problem, consider using `prepareSimpleSearch` instead.
 * @param query the fuzzy query.
 * @returns A function that runs the search on a text, returning the result or `null` if the text does not match.
 * @public
 */
export function prepareFuzzySearch(query: string): (text: string) => SearchResult | null;

/**
 * Construct a simple search callback that runs on a target string.
 * @param query the space-separated words.
 * @returns A function that runs the search on a text, returning the result or `null` if the text does not match.
 * @public
 */
export function prepareSimpleSearch(query: string): (text: string) => SearchResult | null;

/**
 * Sort search results.
 * @param results The search results.
 * @public
 */
export function sortSearchResults(results: SearchResultContainer[]): void;
