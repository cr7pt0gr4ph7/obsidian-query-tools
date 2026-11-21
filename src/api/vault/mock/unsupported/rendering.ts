import type { SearchMatches, SearchResult } from "./components/search.js";
import type { HoverParent, HoverPopover } from "./extensions/hover.js";
import type { TooltipOptions } from "./tooltips.js";

/**
 * Converts HTML to a Markdown string.
 * @public
 */
export function htmlToMarkdown(html: string | HTMLElement | Document | DocumentFragment): string;

/**
 * Utility functions for rendering Values within the app.
 * @public
 * @since 1.10.0
 */
export class RenderContext implements HoverParent {
	/**
	 * @public
	 * @since 1.10.0
	 */
	hoverPopover: HoverPopover | null;
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
): void;

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
export function renderResults(el: HTMLElement, text: string, result: SearchResult, offset?: number): void;

/**
 * Sanitize HTML to a DOM fragment.
 * @param html The HTML.
 * @public
 */
export function sanitizeHTMLToDom(html: string): DocumentFragment;

/**
 * Set a tooltip on an element.
 * @param el The element.
 * @param tooltip The tooltip text.
 * @param options The tooltip options.
 * @public
 * @since 1.4.4
 */
export function setTooltip(el: HTMLElement, tooltip: string, options?: TooltipOptions): void;
