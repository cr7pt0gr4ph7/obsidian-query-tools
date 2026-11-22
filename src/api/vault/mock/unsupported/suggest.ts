import type { HistoryHandler } from "../../../../host/obsidian/base/history.js";
import type { App } from "../app.js";
import type { Scope } from "./keymap.js";

/**
 * An owner that controls UI suggestions.
 * @public
 */
export interface ISuggestOwner<T> {
	/**
	 * Render the suggestion item into DOM.
	 * @param value The suggestion.
	 * @param el The element to render into.
	 * @example
	 * ```ts
	 * class MySuggestOwner implements ISuggestOwner<string> {
	 *     public renderSuggestion(value: string, el: HTMLElement): void {
	 *         el.createEl('strong', { text: value });
	 *     }
	 * }
	 * ```
	 * @public
	 */
	renderSuggestion(value: T, el: HTMLElement): void;

	/**
	 * Called when the user makes a selection.
	 * @param value The suggestion.
	 * @param evt The event that triggered the selection.
	 * @example
	 * ```ts
	 * class MySuggestOwner implements ISuggestOwner<string> {
	 *     public selectSuggestion(value: string, evt: MouseEvent | KeyboardEvent): void {
	 *         console.log(value, evt);
	 *     }
	 * }
	 * ```
	 * @public
	 */
	selectSuggestion(value: T, evt: MouseEvent | KeyboardEvent): void;
}

/**
 * Base class for adding a type-ahead popover.
 * @public
 */
export abstract class PopoverSuggest<T> implements ISuggestOwner<T>, HistoryHandler {
	/**
	 * The app instance.
	 * @public
	 */
	app: App;

	/**
	 * The keymap scope that is active while the popover is open.
	 * @public
	 */
	scope: Scope;

	/**
	 * @param app The app instance.
	 * @param scope The parent keymap scope. Defaults to the app scope.
	 * @public
	 */
	constructor(app: App, scope?: Scope) {
		this.app = app;
		this.scope = scope ?? app.scope;
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	onHistoryBack(): void {
		// Ignored.
	}

	/**
	 * Opens the popover.
	 * @public
	 */
	open(): void {
		// Ignored.
	}

	/**
	 * Closes the popover.
	 * @public
	 */
	close(): void {
		// Ignored.
	}

	/**
	 * Render the suggestion.
	 * @param value The suggestion.
	 * @param el The element to render into.
	 * @example
	 * ```ts
	 * class MyPopoverSuggest extends PopoverSuggest<string> {
	 *     public override renderSuggestion(value: string, el: HTMLElement): void {
	 *         el.createEl('strong', { text: value });
	 *     }
	 * }
	 * ```
	 * @inheritDoc
	 * @public
	 */
	abstract renderSuggestion(value: T, el: HTMLElement): void;

	/**
	 * Select the suggestion.
	 * @param value The suggestion.
	 * @param evt The event that triggered the selection.
	 * @inheritDoc
	 * @public
	 */
	abstract selectSuggestion(value: T, evt: MouseEvent | KeyboardEvent): void;
}

/**
 * Attach to an `<input>` element or a `<div contentEditable>` to add type-ahead
 * support.
 * @public
 * @since 1.4.10
 */
export abstract class AbstractInputSuggest<T> extends PopoverSuggest<T> {
	/**
	 * Limit to the number of elements rendered at once. Set to 0 to disable. Defaults to 100.
	 * @public
	 * @since 1.4.10
	 */
	limit: number;

	/**
	 * Accepts an `<input>` text box or a contenteditable div.
	 * @param app The app instance.
	 * @param textInputEl The input element.
	 * @public
	 */
	constructor(app: App, textInputEl: HTMLInputElement | HTMLDivElement) {
		super(app);
		this.limit = 100;
	}

	/**
	 * Sets the value into the input element.
	 * @param value The value.
	 * @public
	 * @since 1.4.10
	 */
	setValue(value: string): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Gets the value from the input element.
	 * @public
	 * @since 1.4.10
	 */
	getValue(): string {
		throw new Error("Method not implemented.");
	}

	/**
	 * Gets the suggestions for the input element.
	 * @param query The query.
	 * @example
	 * ```ts
	 * class MyInputSuggest extends AbstractInputSuggest<string> {
	 *     protected override getSuggestions(query: string): string[] {
	 *         return ['foo', 'bar'];
	 *     }
	 * }
	 * ```
	 * @example
	 * ```ts
	 * class MyInputSuggest extends AbstractInputSuggest<string> {
	 *     protected override async getSuggestions(query: string): Promise<string[]> {
	 *         return await Promise.resolve(['foo', 'bar']);
	 *     }
	 * }
	 * ```
	 * @public
	 * @since 1.5.7
	 */
	protected abstract getSuggestions(query: string): T[] | Promise<T[]>;

	/**
	 * @public
	 * @since 1.6.6
	 */
	selectSuggestion(value: T, evt: MouseEvent | KeyboardEvent): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Registers a callback to handle when a suggestion is selected by the user.
	 * @param callback Called with the selected suggestion.
	 * @public
	 * @since 1.4.10
	 */
	onSelect(callback: (value: T, evt: MouseEvent | KeyboardEvent) => any): this {
		throw new Error("Method not implemented.");
	}
}
