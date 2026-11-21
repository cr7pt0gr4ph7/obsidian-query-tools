import type { App } from "../app.js";
import type { ConfirmationButton } from "./components/button.js";
import type { SearchResult } from "./components/search.js";
import type { HistoryHandler } from "./history.js";
import type { Scope } from "./keymap.js";
import { placeholder } from "./placeholder.js";
import type { ISuggestOwner } from "./suggest.js";

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
 * Modal dialog component.
 * @public
 */
export class Modal implements HistoryHandler {
	/**
	 * The app instance.
	 * @public
	 */
	app: App;

	/**
	 * The keymap scope that is active while the modal is open.
	 * @public
	 */
	scope: Scope;

	/**
	 * The outermost element of the modal. Contains the modal (`.modal`) and the modal background element (`.modal-bg`).
	 * @public
	 */
	containerEl: HTMLElement;

	/**
	 * The outermost element of the popup itself.
	 * @public
	 */
	modalEl: HTMLElement;

	/**
	 * The title element.
	 * @public
	 */
	titleEl: HTMLElement;

	/**
	 * The content element.
	 * @public
	 */
	contentEl: HTMLElement;

	/**
	 * Whether to save the text selection when the modal is opened, and restore it when the modal is closed.
	 * @public
	 * @since 0.9.16
	 */
	shouldRestoreSelection: boolean;

	/**
	 * @param app The app instance.
	 * @public
	 */
	constructor(app: App) {
		this.app = app;
		this.scope = placeholder;
		this.containerEl = placeholder;
		this.modalEl = placeholder;
		this.titleEl = placeholder;
		this.contentEl = placeholder;
		this.shouldRestoreSelection = false;
	}

	/**
	 * Show the modal on the active window. On phones, the modal will animate on screen.
	 * @public
	 */
	open(): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	onHistoryBack(): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Close the modal.
	 * @public
	 */
	close(): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Called when the modal is opened.
	 * @public
	 */
	onOpen(): Promise<void> | void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Called when the modal is closed.
	 * @public
	 */
	onClose(): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Set the title of the modal.
	 * @param title The title.
	 * @public
	 */
	setTitle(title: string): this {
		throw new Error("Method not implemented.");
	}

	/**
	 * Set the content of the modal.
	 * @param content The content.
	 * @example
	 * ```ts
	 * modal.setContent('foo');
	 *
	 * const fragment = createFragment();
	 * fragment.createEl('strong', { text: 'foo' });
	 * modal.setContent(fragment);
	 * ```
	 * @public
	 */
	setContent(content: string | DocumentFragment): this {
		throw new Error("Method not implemented.");
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	setCloseCallback(callback: () => any): this {
		throw new Error("Method not implemented.");
	}
}

/**
 * A modal that asks the user to confirm an action. Use {@link ConfirmationModal.addButton}
 * to add each option to the button row, and {@link ConfirmationModal.addCancelButton} for
 * the dismissal button. Buttons auto-close the modal on click unless the handler returns truthy.
 * @public
 * @since 1.13.0
 */
export class ConfirmationModal extends Modal {
	/**
	 * @public
	 * @since 1.13.0
	 */
	buttonContainerEl: HTMLElement;

	/**
	 * @public
	 * @since 1.13.0
	 */
	constructor(app: App) {
		super(app);
		this.buttonContainerEl = placeholder;
	}

	/**
	 * @public
	 * @since 1.13.0
	 */
	addClass(cls: string): this {
		throw new Error("Method not implemented.");
	}

	/**
	 * @public
	 * @since 1.13.0
	 */
	addCheckbox(label: string, cb: (value: boolean) => any | Promise<any>): this {
		throw new Error("Method not implemented.");
	}

	/**
	 * @public
	 * @since 1.13.0
	 */
	addButton(cb: (btn: ConfirmationButton) => any): this {
		throw new Error("Method not implemented.");
	}

	/**
	 * @public
	 * @since 1.13.0
	 */
	addCancelButton(text?: string): this {
		throw new Error("Method not implemented.");
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
		this.inputEl = placeholder;
		this.resultContainerEl = placeholder;
	}

	/**
	 * Set the placeholder text.
	 * @param placeholder The placeholder text.
	 * @public
	 * @since 0.9.20
	 */
	setPlaceholder(placeholder: string): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Set the instructions shown in the modal.
	 * @param instructions The instructions.
	 * @public
	 * @since 0.9.20
	 */
	setInstructions(instructions: Instruction[]): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Called when there are no suggestions to show. By default, this shows the {@link SuggestModal.emptyStateText}.
	 * @public
	 * @since 0.9.20
	 */
	onNoSuggestion(): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Select a suggestion.
	 * @param value The suggestion.
	 * @param evt The event that triggered the selection.
	 * @public
	 * @since 0.9.20
	 */
	selectSuggestion(value: T, evt: MouseEvent | KeyboardEvent): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Select the active suggestion.
	 * @param evt The event that triggered the selection.
	 * @public
	 * @since 1.7.2
	 */
	selectActiveSuggestion(evt: MouseEvent | KeyboardEvent): void {
		throw new Error("Method not implemented.");
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
