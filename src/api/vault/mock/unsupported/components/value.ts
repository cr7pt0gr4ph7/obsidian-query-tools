import type { HexString, HSL, RGB } from "../../../../host/obsidian/base/colors.js";
import type { TooltipOptions } from "../../../../host/obsidian/compat/tooltips.js";
import { placeholder } from "../placeholder.js";
import { BaseComponent } from "./component.js";

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
