import { placeholder } from "../placeholder.js";
import { ValueComponent } from "./value.js";

/**
 * Component for a text input or text area.
 * @public
 * @since 0.9.21
 */
export class AbstractTextComponent<T extends HTMLInputElement | HTMLTextAreaElement> extends ValueComponent<string> {
	/**
	 * The input element.
	 * @public
	 * @since 0.9.7
	 */
	inputEl: T;

	/**
	 * @param inputEl The input element.
	 * @public
	 */
	constructor(inputEl: T) {
		super();
		this.inputEl = inputEl;
	}

	/**
	 * @inheritDoc
	 * @public
	 * @since 1.2.3
	 */
	setDisabled(disabled: boolean): this {
		return this;
	}

	/**
	 * Gets the value of the input element.
	 * @public
	 * @since 0.9.7
	 */
	getValue(): string {
		return "";
	}

	/**
	 * Sets the value of the input element.
	 * @param value The value.
	 * @public
	 * @since 0.9.7
	 */
	setValue(value: string): this {
		return this;
	}

	/**
	 * Sets the placeholder of the input element.
	 * @param placeholder The placeholder text.
	 * @public
	 * @since 0.9.7
	 */
	setPlaceholder(placeholder: string): this {
		return this;
	}

	/**
	 * Manually invokes the callback registered with `onChange`.
	 * @public
	 * @since 0.9.21
	 */
	onChanged(): void {}

	/**
	 * Set the callback to be called when the value changes.
	 * @param callback Called with the new value.
	 * @public
	 * @since 0.9.7
	 */
	onChange(callback: (value: string) => any): this {
		return this;
	}
}

/**
 * A text area component.
 * @public
 * @since 0.9.7
 */
export class TextAreaComponent extends AbstractTextComponent<HTMLTextAreaElement> {
	/**
	 * @param containerEl The container element.
	 * @public
	 */
	constructor(containerEl: HTMLElement) {
		super(placeholder);
	}
}

/**
 * A text component.
 * @public
 * @since 0.9.21
 */
export class TextComponent extends AbstractTextComponent<HTMLInputElement> {
	/**
	 * @param containerEl The container element.
	 * @public
	 */
	constructor(containerEl: HTMLElement) {
		super(placeholder);
	}
}

/**
 * A component that allows you to format dates using `Moment.js`.
 * @public
 * @since 0.9.7
 */
export class MomentFormatComponent extends TextComponent {
	/**
	 * The element that shows a sample of the current date in the selected format.
	 * @public
	 * @since 0.9.7
	 */
	sampleEl: HTMLElement = placeholder;

	/**
	 * Sets the default format when input is cleared. Also used for placeholder.
	 * @param defaultFormat The default format.
	 * @public
	 * @since 0.9.7
	 */
	setDefaultFormat(defaultFormat: string): this {
		return this;
	}

	/**
	 * Sets the element that shows a sample of the current date in the selected format.
	 * @param sampleEl The element.
	 * @public
	 * @since 0.9.7
	 */
	setSampleEl(sampleEl: HTMLElement): this {
		return this;
	}

	/**
	 * Sets the format string and updates the sample.
	 * @param value The `Moment.js` format string.
	 * @public
	 * @since 0.9.7
	 */
	setValue(value: string): this {
		return this;
	}

	/**
	 * Called when the value changes.
	 * @public
	 * @since 0.9.7
	 */
	onChanged(): void {}

	/**
	 * Updates the sample element with the current date in the selected format.
	 * @public
	 * @since 0.9.7
	 */
	updateSample(): void {}
}
