import type { SearchMatches } from "../base/search.js";
import type { AbstractInputSuggest } from "../compat/editor/suggest.js";
import type { Placeholder } from "../placeholder.internal.js";
import type { PropertyRenderContext } from "./property_widget.unofficial.js";

type FileSuggestManager = Placeholder;

/**
 * Suggest attached to the value input of a `text` or `multitext` property, offering the values the property already
 * holds across the vault, or links once the value starts with `[[`.
 *
 * @public
 * @unofficial
 */
export interface PropertyValueSuggest extends AbstractInputSuggest<PropertyValueSuggestItem> {
	/** Render context of the property widget the suggest belongs to. */
	context: PropertyRenderContext;

	/** The contenteditable value input. */
	inputEl: HTMLDivElement;

	/** Element holding the keyboard instructions shown under the suggestions. */
	instructionsEl: HTMLDivElement;

	/** Manager providing the link suggestions. */
	manager: FileSuggestManager;

	/** Path of the file whose property is edited. */
	sourcePath: string;

	/**
	 * Get the link query: the text between the opening `[[` and the closing `]]` or the caret, whichever comes first.
	 *
	 * @param text - Text of the value input.
	 * @returns The link query.
	 */
	getLinktextQuery(text: string): string;

	/**
	 * Get the suggestions for the query.
	 *
	 * @param query - The query.
	 * @returns The suggestions.
	 */
	getSuggestions__?(query: string): Promise<PropertyValueSuggestItem[]>;

	/**
	 * Called with the value to commit when a suggestion is chosen.
	 *
	 * @param value - The value to commit.
	 * @param evt - The event that chose the suggestion.
	 */
	onSelectLink(value: string, evt: KeyboardEvent | MouseEvent): void;

	/**
	 * Render a suggestion.
	 *
	 * @param value - The suggestion.
	 * @param el - The element to render into.
	 */
	renderSuggestion__?(value: PropertyValueSuggestItem, el: HTMLElement): void;

	/**
	 * Commit a suggestion, or the typed value when `value` is `null` (Shift+Enter).
	 *
	 * @param value - The suggestion, or `null` for the typed value.
	 * @param evt - The event that chose the suggestion.
	 */
	selectSuggestion(value: null | PropertyValueSuggestItem, evt: KeyboardEvent | MouseEvent): void;

	/**
	 * Filter applied to every suggestion, set by the `multitext` widget to hide values the property already lists.
	 *
	 * @param value - The suggestion.
	 * @returns Whether to keep the suggestion.
	 */
	suggestionFilter?(value: PropertyValueSuggestItem): boolean;

	/**
	 * Refresh the keyboard instructions.
	 *
	 * @param isLink - Whether to include the link suggester's instructions.
	 */
	updateInstructions(isLink: boolean): void;
}

/**
 * An item of the property-value suggest, discriminated by `type`.
 *
 * @public
 * @unofficial
 */
export type PropertyValueSuggestItem = PropertyValueSuggestLinkItem | PropertyValueSuggestTextItem;

/**
 * A link item of the property-value suggest, offered once the value starts with `[[`.
 *
 * These are the items of the link suggester the editor uses. Only the fields shared by every kind are modeled; each
 * kind carries more (`path` and `file` for `file`, `alias` for `alias`, `heading` and `level` for `heading`, ...).
 *
 * @public
 * @unofficial
 */
export interface PropertyValueSuggestLinkItem {
	/**
	 * Matched ranges, or `null` for the `none` placeholder.
	 */
	matches: null | SearchMatches;
	/**
	 * Match score.
	 */
	score: number;
	/**
	 * Kind of the link item; `none` is the placeholder shown when nothing matches.
	 */
	type: "alias" | "bases-view" | "block" | "file" | "heading" | "linktext" | "none";
}

/**
 * A plain-text item of the property-value suggest: one of the values the property already holds across the vault.
 *
 * @public
 * @unofficial
 */
export interface PropertyValueSuggestTextItem {
	/**
	 * Matched ranges in `text`, or `null` when the query is empty.
	 */
	matches: null | SearchMatches;
	/**
	 * Match score, `0` when the query is empty.
	 */
	score: number;
	/**
	 * The suggested value.
	 */
	text: string;
	/**
	 * Discriminator of a plain-text item.
	 */
	type: "text";
}
