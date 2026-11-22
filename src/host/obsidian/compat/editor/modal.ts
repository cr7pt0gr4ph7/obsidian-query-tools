import type { App } from "../../app.js";
import type { HistoryHandler } from "../../base/history.js";
import type { ConfirmationButton } from "../components/button.js";
import { createDomElement } from "../fakedom.internal.js";
import { Scope } from "./keyboard.js";

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

	/** @internal */
	closeCallback?: () => any;

	/**
	 * @param app The app instance.
	 * @public
	 */
	constructor(app: App) {
		this.app = app;
		this.scope = new Scope(app.scope);
		this.containerEl = createDomElement("div", "modal-container");
		this.modalEl = createDomElement("div", "modal", this.containerEl);
		this.titleEl = createDomElement("div", "modal-title", this.modalEl);
		this.contentEl = createDomElement("div", "modal-content", this.modalEl);
		this.shouldRestoreSelection = false;
	}

	/**
	 * Show the modal on the active window. On phones, the modal will animate on screen.
	 * @public
	 */
	open(): void {
		// Ignored, as this is a stub implementation.
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	onHistoryBack(): void {
		// Ignored, as this is a stub implementation.
	}

	/**
	 * Close the modal.
	 * @public
	 */
	close(): void {
		// Ignored, as this is a stub implementation.
		this.onClose();
	}

	/**
	 * Called when the modal is opened.
	 * @public
	 */
	onOpen(): Promise<void> | void {
		// Ignored, as this is a stub implementation.
	}

	/**
	 * Called when the modal is closed.
	 * @public
	 */
	onClose(): void {
		// Ignored, as this is a stub implementation.
		this.closeCallback?.();
	}

	/**
	 * Set the title of the modal.
	 * @param title The title.
	 * @public
	 */
	setTitle(title: string): this {
		// Ignored, as this is a stub implementation.
		return this;
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
		// Ignored, as this is a stub implementation.
		return this;
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	setCloseCallback(callback: () => any): this {
		this.closeCallback = callback;
		return this;
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
		this.buttonContainerEl = createDomElement("div", "modal-button-container", this.modalEl);
	}

	/**
	 * @public
	 * @since 1.13.0
	 */
	addClass(cls: string): this {
		// Ignored, as this is a stub implementation.
		return this;
	}

	/**
	 * @public
	 * @since 1.13.0
	 */
	addCheckbox(label: string, cb: (value: boolean) => any | Promise<any>): this {
		// Ignored, as this is a stub implementation.
		return this;
	}

	/**
	 * @public
	 * @since 1.13.0
	 */
	addButton(cb: (btn: ConfirmationButton) => any): this {
		// Ignored, as this is a stub implementation.
		return this;
	}

	/**
	 * @public
	 * @since 1.13.0
	 */
	addCancelButton(text?: string): this {
		// Ignored, as this is a stub implementation.
		return this;
	}
}
