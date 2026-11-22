import type { TooltipOptions } from "../../../../../host/obsidian/compat/tooltips.js";
import { placeholder } from "../../../../../host/obsidian/placeholder.internal.js";
import type { IconName } from "../extensions/icons.js";
import { BaseComponent } from "./component.js";

/**
 * A button component.
 * @public
 * @since 0.9.7
 */
export class ButtonComponent extends BaseComponent {
	/**
	 * The `<button>` element.
	 * @public
	 * @since 0.9.7
	 */
	buttonEl: HTMLButtonElement;

	/**
	 * @param containerEl The element to add the button to.
	 * @public
	 */
	constructor(containerEl: HTMLElement) {
		super();
		this.buttonEl = placeholder;
	}

	/**
	 * Set whether the button is disabled.
	 * @param disabled `true` to disable, `false` to enable.
	 * @public
	 * @since 1.2.3
	 */
	setDisabled(disabled: boolean): this {
		return this;
	}

	/**
	 * Styles the button as a call to action (CTA), to make it stand out from other buttons nearby.
	 * Use it sparingly.
	 * @public
	 * @since 0.9.7
	 */
	setCta(): this {
		return this;
	}

	/**
	 * Removes the call to action style from the button.
	 * @public
	 * @since 0.9.20
	 */
	removeCta(): this {
		return this;
	}

	/**
	 * Styles the button as a warning, usually for destructive actions such as deleting the user's data.
	 * @deprecated Use {@link setDestructive} for a destructive button, or
	 * `setDestructive().setCta()` for a destructive primary action.
	 * @public
	 * @since 0.11.0
	 */
	setWarning(): this {
		return this;
	}

	/**
	 * Style the button as destructive (e.g. for actions that delete data or are
	 * otherwise hard to undo). Compose with {@link setCta} for a destructive
	 * primary action.
	 * @public
	 * @since 1.13.0
	 */
	setDestructive(): this {
		return this;
	}

	/**
	 * @public
	 * @since 1.13.0
	 */
	removeDestructive(): this {
		return this;
	}

	/**
	 * Sets the tooltip of the button.
	 * @param tooltip The tooltip text.
	 * @param options The tooltip options.
	 * @public
	 * @since 1.1.0
	 */
	setTooltip(tooltip: string, options?: TooltipOptions): this {
		return this;
	}

	/**
	 * Sets the text of the button.
	 * @param name The text.
	 * @public
	 * @since 0.9.7
	 */
	setButtonText(name: string): this {
		return this;
	}

	/**
	 * Sets the icon of the button.
	 * @param icon The icon ID.
	 * @public
	 * @since 1.1.0
	 */
	setIcon(icon: IconName): this {
		return this;
	}

	/**
	 * Adds a CSS class to the button.
	 * @param cls The class.
	 * @public
	 * @since 0.9.7
	 */
	setClass(cls: string): this {
		return this;
	}

	/**
	 * Sets the callback to be called when the button is clicked.
	 * @param callback The callback.
	 * @public
	 * @since 0.12.16
	 */
	onClick(callback: (evt: MouseEvent) => unknown | Promise<unknown>): this {
		return this;
	}
}

/**
 * A button inside a {@link ConfirmationModal}'s button row. Clicking the button
 * closes the modal after the click handler resolves; return a truthy value from
 * the handler to keep the modal open (for example, to surface a validation error).
 * @public
 * @since 1.13.0
 */
export class ConfirmationButton extends ButtonComponent {
	/**
	 * Private constructor. Use {@link ConfirmationModal.addButton} instead.
	 * @public
	 */
	private constructor() {
		super(placeholder);
	}

	/**
	 * @public
	 * @since 1.13.0
	 */
	onClick(handler: (evt: MouseEvent) => unknown | Promise<unknown>): this {
		return this;
	}

	/**
	 * Mark this button as the focus target when the modal opens. If multiple
	 * buttons in the same modal have this set, the last-marked one wins.
	 * @public
	 * @since 1.13.0
	 */
	setInitialFocus(): this {
		return this;
	}

	/**
	 * Place the button separately from the main button group (e.g. for a
	 * tertiary action that shouldn't sit next to the primary/cancel pair).
	 * @public
	 * @since 1.13.0
	 */
	setSecondary(): this {
		return this;
	}

	/**
	 * Style the button as the dismissal action.
	 * @public
	 * @since 1.13.0
	 */
	setCancel(): this {
		return this;
	}
}

/**
 * Extra button component, for secondary actions.
 * @public
 * @since 0.9.7
 */
export class ExtraButtonComponent extends BaseComponent {
	/**
	 * The button element.
	 * @public
	 * @since 0.9.7
	 */
	extraSettingsEl: HTMLElement = placeholder;

	/**
	 * @param containerEl The element to add the button to.
	 * @public
	 */
	constructor(containerEl: HTMLElement) {
		super();
	}

	/**
	 * Set whether the extra button is disabled.
	 * @param disabled `true` to disable, `false` to enable.
	 * @public
	 * @since 1.2.3
	 */
	setDisabled(disabled: boolean): this {
		return this;
	}

	/**
	 * Set the tooltip of the extra button.
	 * @param tooltip The tooltip text.
	 * @param options The tooltip options.
	 * @public
	 * @since 1.1.0
	 */
	setTooltip(tooltip: string, options?: TooltipOptions): this {
		return this;
	}

	/**
	 * Set the icon of the extra button.
	 * @param icon ID of the icon, can use any icon loaded with {@link addIcon} or from the inbuilt library.
	 * @see The Obsidian icon library includes the {@link https://lucide.dev/ Lucide icon library}, any icon name from their site will work here.
	 * @public
	 * @since 0.9.7
	 */
	setIcon(icon: IconName): this {
		return this;
	}

	/**
	 * Set the callback to be called when the extra button is clicked.
	 * @param callback The callback.
	 * @public
	 * @since 0.9.7
	 */
	onClick(callback: () => unknown): this {
		return this;
	}
}
