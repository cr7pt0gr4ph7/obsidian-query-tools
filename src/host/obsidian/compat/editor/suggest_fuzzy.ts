import type { SearchResult } from "../../base/search.js";
import { SuggestModal } from "./suggest.js";

/**
 * The result of a fuzzy search.
 * @public
 * @since 0.9.20
 */
export interface FuzzyMatch<T> {
	/**
	 * The matched item.
	 * @public
	 * @since 0.9.20
	 */
	item: T;

	/**
	 * The search result.
	 * @public
	 * @since 0.9.20
	 */
	match: SearchResult;
}

/**
 * Suggest modal for fuzzy search.
 * @typeParam T - The type of the items.
 * @public
 * @since 0.9.20
 */
export abstract class FuzzySuggestModal<T> extends SuggestModal<FuzzyMatch<T>> {
	/**
	 * Get the suggestions by fuzzy matching the query against the text of each item from {@link FuzzySuggestModal.getItems}.
	 * @param query The query.
	 * @returns The matching items, sorted by score.
	 * @example
	 * ```ts
	 * class MyFuzzySuggestModal extends FuzzySuggestModal<string> {
	 *     public override getSuggestions(query: string): FuzzyMatch<string>[] {
	 *         return [{ item: 'foo' + query, match: { score: 1, matches: [[0, 3]] } }];
	 *     }
	 * }
	 * ```
	 * @public
	 * @since 0.9.20
	 */
	getSuggestions(query: string): FuzzyMatch<T>[] {
		throw new Error("Method not implemented.");
	}

	/**
	 * Render the suggestion.
	 * @param item The match.
	 * @param el The element to render into.
	 * @example
	 * ```ts
	 * class MyFuzzySuggestModal extends FuzzySuggestModal<string> {
	 *     public override renderSuggestion(item: FuzzyMatch<string>, el: HTMLElement): void {
	 *         el.createEl('strong', { text: item.item });
	 *     }
	 * }
	 * ```
	 * @public
	 * @since 0.9.20
	 */
	renderSuggestion(item: FuzzyMatch<T>, el: HTMLElement): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Called when a suggestion is chosen.
	 * @param item The chosen match.
	 * @param evt The event that triggered the choice.
	 * @public
	 * @since 0.9.20
	 */
	onChooseSuggestion(item: FuzzyMatch<T>, evt: MouseEvent | KeyboardEvent): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get the items to be used in the fuzzy search.
	 * @example
	 * ```ts
	 * class MyFuzzySuggestModal extends FuzzySuggestModal<string> {
	 *     public override getItems(): string[] {
	 *         return ['foo', 'bar', 'baz'];
	 *     }
	 * }
	 * ```
	 * @public
	 * @since 0.9.20
	 */
	abstract getItems(): T[];

	/**
	 * Get the text of an item, which is used for the fuzzy search and displayed in the suggestion.
	 * @param item The item.
	 * @example
	 * ```ts
	 * class MyFuzzySuggestModal extends FuzzySuggestModal<string> {
	 *     public override getItemText(item: string): string {
	 *         return `--- ${item} ---`;
	 *     }
	 * }
	 * ```
	 * @public
	 * @since 0.9.20
	 */
	abstract getItemText(item: T): string;

	/**
	 * Called when an item is chosen.
	 * @param item The chosen item.
	 * @param evt The event that triggered the choice.
	 * @public
	 * @since 0.9.20
	 */
	abstract onChooseItem(item: T, evt: MouseEvent | KeyboardEvent): void;
}
