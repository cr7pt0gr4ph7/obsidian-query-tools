import type { App } from "../../app.js";
import type { HistoryHandler } from "../../base/history.js";
import { createDomElement } from "../fakedom.internal.js";
import type { Scope } from "./keyboard.js";
import { Modal } from "./modal.js";
/**
 * An instruction shown in a suggestion modal.
 * @example
 * ```ts
 * const instruction: Instruction = { command: '↑↓', purpose: 'Navigate' };
 * ```
 * @public
 * @since 0.9.20
 */
export interface Instruction {
	/**
	 * The command or the key combination.
	 * @public
	 * @since 0.9.20
	 */
	command: string;

	/**
	 * The purpose of the command.
	 * @public
	 * @since 0.9.20
	 */
	purpose: string;
}

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
		// Ignored, as this is a stub implementation.
	}

	/**
	 * Opens the popover.
	 * @public
	 */
	open(): void {
		// Ignored, as this is a stub implementation.
	}

	/**
	 * Closes the popover.
	 * @public
	 */
	close(): void {
		// Ignored, as this is a stub implementation.
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

	/** @internal */
	value: string;

	/** @internal */
	onSelectCallback?: (value: T, evt: MouseEvent | KeyboardEvent) => any;

	/** @internal */
	textInputEl: HTMLInputElement | HTMLDivElement;

	/**
	 * Accepts an `<input>` text box or a contenteditable div.
	 * @param app The app instance.
	 * @param textInputEl The input element.
	 * @public
	 */
	constructor(app: App, textInputEl: HTMLInputElement | HTMLDivElement) {
		super(app);
		this.limit = 100;
		this.textInputEl = textInputEl;
		this.value = "";
	}

	/**
	 * Sets the value into the input element.
	 * @param value The value.
	 * @public
	 * @since 1.4.10
	 */
	setValue(value: string): void {
		this.value = value;
		// if (this.textInputEl instanceof HTMLInputElement) {
		//     this.textInputEl.value = value;
		// } else if (this.textInputEl instanceof HTMLDivElement) {
		//     this.textInputEl.textContent = value;
		// }
	}

	/**
	 * Gets the value from the input element.
	 * @public
	 * @since 1.4.10
	 */
	getValue(): string {
		// if (this.textInputEl instanceof HTMLInputElement) {
		//     return this.textInputEl.value;
		// } else if (this.textInputEl instanceof HTMLDivElement) {
		//     return this.textInputEl.textContent || "";
		// }
		return this.value;
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
		if (this.onSelectCallback) {
			this.onSelectCallback(value, evt);
		}
	}

	/**
	 * Registers a callback to handle when a suggestion is selected by the user.
	 * @param callback Called with the selected suggestion.
	 * @public
	 * @since 1.4.10
	 */
	onSelect(callback: (value: T, evt: MouseEvent | KeyboardEvent) => any): this {
		this.onSelectCallback = callback;
		return this;
	}
}

/**
 * A modal that lets the user choose from a list of suggestions.
 * @public
 * @since 0.9.20
 */
export abstract class SuggestModal<T> extends Modal implements ISuggestOwner<T> {
	/**
	 * The maximum number of suggestions to show.
	 * @public
	 * @since 0.9.20
	 */
	limit: number;

	/**
	 * The text to display when there are no suggestions.
	 * @public
	 * @since 0.9.20
	 */
	emptyStateText: string;

	/**
	 * The input element.
	 * @public
	 * @since 0.9.20
	 */
	inputEl: HTMLInputElement;

	/**
	 * The result container element.
	 * @public
	 * @since 0.9.20
	 */
	resultContainerEl: HTMLElement;

	/**
	 * @param app The app instance.
	 * @public
	 */
	constructor(app: App) {
		super(app);
		this.limit = -1;
		this.emptyStateText = "";
		this.inputEl = createDomElement("input", "suggest-modal-input") as HTMLInputElement;
		this.resultContainerEl = createDomElement("div", "suggest-modal-result-container");
	}

	/**
	 * Set the placeholder text.
	 * @param placeholder The placeholder text.
	 * @public
	 * @since 0.9.20
	 */
	setPlaceholder(placeholder: string): void {
		// Ignored, as this is a stub implementation.
	}

	/**
	 * Set the instructions shown in the modal.
	 * @param instructions The instructions.
	 * @public
	 * @since 0.9.20
	 */
	setInstructions(instructions: Instruction[]): void {
		// Ignored, as this is a stub implementation.
	}

	/**
	 * Called when there are no suggestions to show. By default, this shows the {@link SuggestModal.emptyStateText}.
	 * @public
	 * @since 0.9.20
	 */
	onNoSuggestion(): void {
		// Ignored, as this is a stub implementation.
	}

	/**
	 * Select a suggestion.
	 * @param value The suggestion.
	 * @param evt The event that triggered the selection.
	 * @public
	 * @since 0.9.20
	 */
	selectSuggestion(value: T, evt: MouseEvent | KeyboardEvent): void {
		// Ignored, as this is a stub implementation.
		this.onChooseSuggestion(value, evt);
	}

	/**
	 * Select the active suggestion.
	 * @param evt The event that triggered the selection.
	 * @public
	 * @since 1.7.2
	 */
	selectActiveSuggestion(evt: MouseEvent | KeyboardEvent): void {
		// Ignored, as this is a stub implementation.
	}

	/**
	 * Get the suggestions.
	 * @param query The query.
	 * @example
	 * ```ts
	 * class MySuggestModal extends SuggestModal<string> {
	 *     public override getSuggestions(query: string): string[] {
	 *         return ['foo', 'bar'];
	 *     }
	 * }
	 * ```
	 * @example
	 * ```ts
	 * class MySuggestModal extends SuggestModal<string> {
	 *     public override async getSuggestions(query: string): Promise<string[]> {
	 *         return Promise.resolve(['foo', 'bar']);
	 *     }
	 * }
	 * ```
	 * @public
	 * @since 1.5.7
	 */
	abstract getSuggestions(query: string): T[] | Promise<T[]>;

	/**
	 * Render a suggestion.
	 * @param value The suggestion.
	 * @param el The element to render into.
	 * @example
	 * ```ts
	 * class MySuggestModal extends SuggestModal<string> {
	 *     public override renderSuggestion(value: string, el: HTMLElement): void {
	 *         el.createEl('strong', { text: value });
	 *     }
	 * }
	 * ```
	 * @public
	 * @since 1.5.7
	 */
	abstract renderSuggestion(value: T, el: HTMLElement): void;

	/**
	 * Called when the user chooses a suggestion.
	 * @param item The chosen suggestion.
	 * @param evt The event that triggered the choice.
	 * @public
	 * @since 1.5.7
	 */
	abstract onChooseSuggestion(item: T, evt: MouseEvent | KeyboardEvent): void;
}
