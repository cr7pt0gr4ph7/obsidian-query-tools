import { placeholder } from "./placeholder.js";
import type { TooltipOptions } from "./tooltips.js";
import type { App } from "../app.js";
import type { HexString, HSL, RGB } from "../colors.js";
import type { IconName } from "./extensions/icons.js";

/**
 * The base class for all components.
 * @public
 * @since 0.10.3
 */
export abstract class BaseComponent {
	/**
	 * Whether the component is disabled.
	 * @public
	 * @since 0.10.3
	 */
	disabled: boolean = false;

	/**
	 * Facilitates chaining.
	 * @param cb Called with this component.
	 * @public
	 * @since 0.9.7
	 */
	// biome-ignore lint/suspicious/noThenProperty: This is intended for chaining.
	then(cb: (component: this) => unknown): this {
		cb(this);
		return this;
	}

	/**
	 * Set whether the component is disabled.
	 * @param disabled `true` to disable, `false` to enable.
	 * @public
	 * @since 1.2.3
	 */
	setDisabled(disabled: boolean): this {
		this.disabled = disabled;
		return this;
	}
}

/**
 * The base class for components that hold a value.
 * @public
 * @since 0.9.7
 */
export abstract class ValueComponent<T> extends BaseComponent {
	/**
	 * Adds a function to `listeners` under `key` that gets the value of this component.
	 * If the function is called with a value, the component's value is set first.
	 * @param listeners The listener map.
	 * @param key The key.
	 * @example
	 * ```ts
	 * const listeners: Record<string, (value?: string) => string> = {};
	 * textComponent.registerOptionListener(listeners, 'foo');
	 * listeners.foo?.('bar');
	 * console.log(listeners.foo?.()); // bar
	 * ```
	 * @public
	 * @since 0.9.7
	 */
	registerOptionListener(listeners: Record<string, (value?: T) => T>, key: string): this {
		return this;
	}

	/**
	 * Get the value of the component.
	 * @public
	 * @since 0.9.7
	 */
	abstract getValue(): T;

	/**
	 * Set the value of the component.
	 * @param value The value.
	 * @public
	 * @since 0.9.7
	 */
	abstract setValue(value: T): this;
}

/**
 * A component that displays a progress bar.
 * @public
 * @since 1.4.4
 */
export class ProgressBarComponent extends ValueComponent<number> {
	/**
	 * @param containerEl The container element.
	 * @public
	 */
	constructor(containerEl: HTMLElement) {
		super();
	}

	/**
	 * Get the current value of the progress bar (0-100).
	 * @public
	 */
	getValue(): number {
		return 0;
	}

	/**
	 * Set the current value of the progress bar.
	 * @param value The progress, from 0 to 100.
	 * @public
	 */
	setValue(value: number): this {
		return this;
	}
}

/**
 * A toggle component.
 * @public
 * @since 0.9.7
 * @internal
 */
export class ToggleComponent extends ValueComponent<boolean> {
	/**
	 * The toggle element.
	 * @public
	 * @since 0.9.7
	 */
	toggleEl: HTMLElement = placeholder;

	private value: boolean = false;
	private onChangeCallback?: (value: boolean) => any;

	/**
	 * @param containerEl The container element.
	 * @public
	 * @since 0.9.7
	 */
	constructor(containerEl: HTMLElement) {
		super();
	}

	/**
	 * Set whether the toggle is disabled.
	 * @param disabled `true` to disable, `false` to enable.
	 * @public
	 * @since 1.2.3
	 */
	setDisabled(disabled: boolean): this {
		this.disabled = disabled;
		return this;
	}

	/**
	 * Get the value of the toggle.
	 * @public
	 * @since 0.9.7
	 */
	getValue(): boolean {
		return this.value;
	}

	/**
	 * Set the value of the toggle.
	 * @param on Whether the toggle is on.
	 * @public
	 * @since 0.9.7
	 */
	setValue(on: boolean): this {
		if (this.value !== on) {
			this.value = on;
			this.onChangeCallback?.(this.value);
		}
		return this;
	}

	/**
	 * Set the tooltip of the toggle.
	 * @param tooltip The tooltip text.
	 * @param options The tooltip options.
	 * @public
	 * @since 1.1.1
	 */
	setTooltip(tooltip: string, options?: TooltipOptions): this {
		return this;
	}

	/**
	 * Toggle the value, unless the toggle is disabled.
	 * @public
	 * @since 0.9.7
	 */
	onClick(): void {
		if (!this.disabled) {
			this.value = !this.value;
			this.onChangeCallback?.(this.value);
		}
	}

	/**
	 * Set the callback to be called when the value changes.
	 * @param callback Called with the new value.
	 * @public
	 * @since 0.9.7
	 */
	onChange(callback: (value: boolean) => unknown): this {
		this.onChangeCallback = callback;
		return this;
	}
}

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
 * Color picker component. Values are by default 6-digit hash-prefixed hex strings like `#000000`.
 * @public
 * @since 1.0.0
 */
export class ColorComponent extends ValueComponent<string> {
	/**
	 * @param containerEl The container element.
	 * @public
	 */
	constructor(containerEl: HTMLElement) {
		super();
	}

	/**
	 * Set whether the color picker is disabled.
	 * @param disabled `true` to disable, `false` to enable.
	 * @public
	 * @since 1.2.3
	 */
	setDisabled(disabled: boolean): this {
		return this;
	}

	/**
	 * Get the current value of the color picker.
	 * @public
	 * @since 1.0.0
	 */
	getValue(): HexString {
		return placeholder;
	}

	/**
	 * Get the current value of the color picker as an RGB object.
	 * @public
	 * @since 1.0.0
	 */
	getValueRgb(): RGB {
		return placeholder;
	}

	/**
	 * Get the current value of the color picker as an HSL object.
	 * @public
	 * @since 1.0.0
	 */
	getValueHsl(): HSL {
		return placeholder;
	}

	/**
	 * Set the current value of the color picker.
	 * @param value The color, as a hex string.
	 * @public
	 * @since 1.0.0
	 */
	setValue(value: HexString): this {
		return this;
	}

	/**
	 * Set the current value of the color picker as an RGB object.
	 * @param rgb The color.
	 * @public
	 * @since 1.0.0
	 */
	setValueRgb(rgb: RGB): this {
		return this;
	}

	/**
	 * Set the current value of the color picker as an HSL object.
	 * @param hsl The color.
	 * @public
	 * @since 1.0.0
	 */
	setValueHsl(hsl: HSL): this {
		return this;
	}

	/**
	 * Set the callback to be called when the value changes.
	 * @param callback Called with the new value.
	 * @public
	 * @since 1.0.0
	 */
	onChange(callback: (value: string) => any): this {
		return this;
	}
}

/**
 * A slider component.
 * @public
 * @since 0.9.7
 */
export class SliderComponent extends ValueComponent<number> {
	/**
	 * The slider `<input>` element.
	 * @public
	 */
	sliderEl: HTMLInputElement;

	/**
	 * @param containerEl The container element.
	 * @public
	 */
	constructor(containerEl: HTMLElement) {
		super();
		this.sliderEl = placeholder;
	}

	/**
	 * Set whether the slider is disabled.
	 * @param disabled `true` to disable, `false` to enable.
	 * @public
	 * @since 1.2.3
	 */
	setDisabled(disabled: boolean): this {
		return this;
	}

	/**
	 * Set whether the value should be updated while the slider is being dragged.
	 * @param instant `true` to update the value while dragging.
	 * @public
	 * @since 1.6.6
	 */
	setInstant(instant: boolean): this {
		return this;
	}

	/**
	 * Set the limits of the slider.
	 * @param min The minimum value.
	 * @param max The maximum value.
	 * @param step The step value.
	 * @public
	 * @since 0.9.7
	 */
	setLimits(min: number | null, max: number | null, step: number | "any"): this {
		return this;
	}

	/**
	 * Get the value of the slider.
	 * @public
	 * @since 0.9.7
	 */
	getValue(): number {
		return 0;
	}

	/**
	 * Set the value of the slider.
	 * @param value The value.
	 * @public
	 * @since 0.9.7
	 */
	setValue(value: number): this {
		return this;
	}

	/**
	 * Get the value of the slider, formatted for display.
	 * @public
	 * @since 0.9.7
	 */
	getValuePretty(): string {
		return "";
	}

	/**
	 * Set a custom formatter for the value shown inline next to the slider.
	 * @public
	 * @since 1.13.0
	 */
	setDisplayFormat(format: (value: number) => string): this {
		return this;
	}

	/**
	 * Set the dynamic tooltip of the slider.
	 * @public
	 * @deprecated The value is now always shown inline next to the slider.
	 * @since 0.9.7
	 */
	setDynamicTooltip(): this {
		return this;
	}

	/**
	 * Set the callback to be called when the value changes.
	 * @param callback Called with the new value.
	 * @public
	 * @since 0.9.7
	 */
	onChange(callback: (value: number) => any): this {
		return this;
	}
}

/**
 * Dropdown component.
 * @public
 * @since 0.9.7
 */
export class DropdownComponent extends ValueComponent<string> {
	/**
	 * The `<select>` element.
	 * @public
	 * @since 0.9.7
	 */
	selectEl: HTMLSelectElement;

	/**
	 * @param containerEl The container element.
	 * @public
	 */
	constructor(containerEl: HTMLElement) {
		super();
		this.selectEl = placeholder;
	}

	/**
	 * Set whether the dropdown is disabled.
	 * @param disabled `true` to disable, `false` to enable.
	 * @public
	 * @since 1.2.3
	 */
	setDisabled(disabled: boolean): this {
		return this;
	}

	/**
	 * Add an option to the dropdown.
	 * @param value The option value.
	 * @param display The display text.
	 * @public
	 * @since 0.9.7
	 */
	addOption(value: string, display: string): this {
		return this;
	}

	/**
	 * Add multiple options to the dropdown.
	 * @param options A map from option value to display text.
	 * @public
	 * @since 0.9.7
	 */
	addOptions(options: Record<string, string>): this {
		return this;
	}

	/**
	 * Get the selected value of the dropdown.
	 * @public
	 * @since 0.9.7
	 */
	getValue(): string {
		return "";
	}

	/**
	 * Set the selected value of the dropdown.
	 * @param value The value.
	 * @public
	 * @since 0.9.7
	 */
	setValue(value: string): this {
		return this;
	}

	/**
	 * Set the callback to be called when the value changes.
	 * @param callback Called with the new value.
	 * @example
	 * ```ts
	 * dropdown.onChange((value) => console.log(value));
	 * ```
	 * @public
	 * @since 0.9.7
	 */
	onChange(callback: (value: string) => any): this {
		return this;
	}
}

/**
 * A search component.
 * @public
 * @since 0.9.21
 */
export class SearchComponent extends AbstractTextComponent<HTMLInputElement> {
	/**
	 * The clear button element.
	 * @public
	 * @since 0.9.21
	 */
	clearButtonEl: HTMLElement = placeholder;

	/**
	 * @param containerEl The container element.
	 * @public
	 */
	constructor(containerEl: HTMLElement) {
		super(placeholder);
	}

	/**
	 * Called when the value changes.
	 * @public
	 */
	onChanged(): void {}
}

/**
 * A list of matched text ranges.
 * @public
 */
export type SearchMatches = SearchMatchPart[];

/**
 * Text position offsets within text file. Represents
 * a text range `[fromOffset, toOffset]`.
 * @public
 */
export type SearchMatchPart = [number, number];

/**
 * A search result.
 * @public
 * @since 0.9.21
 */
export interface SearchResult {
	/**
	 * The score.
	 * @public
	 */
	score: number;

	/**
	 * The matched text ranges.
	 * @public
	 */
	matches: SearchMatches;
}

/**
 * An object that contains a search result.
 * @public
 * @since 0.9.21
 */
export interface SearchResultContainer {
	/**
	 * The search result.
	 * @public
	 */
	match: SearchResult;
}
/**
 * @public
 * @since 1.11.1
 */
export class SecretComponent extends BaseComponent {
	/**
	 * @public
	 */
	constructor(app: App, containerEl: HTMLElement) {
		super();
	}

	/**
	 * @public
	 * @since 1.11.4
	 */
	setValue(value: string): this {
		return this;
	}

	/**
	 * @public
	 * @since 1.11.4
	 */
	onChange(cb: (value: string | null) => unknown): this {
		return this;
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
