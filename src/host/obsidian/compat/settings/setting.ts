import type { ButtonComponent, ExtraButtonComponent } from "../components/button.js";
import type { BaseComponent } from "../components/component.js";
import type { SearchComponent } from "../components/search.js";
import type { MomentFormatComponent, TextAreaComponent, TextComponent } from "../components/text.js";
import type {
	ColorComponent,
	DropdownComponent,
	ProgressBarComponent,
	SliderComponent,
	ToggleComponent,
} from "../components/value.js";
import { createDomElement } from "../fakedom.internal.js";
import type { TooltipOptions } from "../tooltips.js";
import type { DisplayValueComponent } from "./displayvalue.js";

/**
 * A single setting row, with a name, a description and controls.
 * @public
 * @since 0.9.7
 */
export class Setting {
	/**
	 * The root element of the setting.
	 * @public
	 * @since 0.9.7
	 */
	settingEl: HTMLElement;

	/**
	 * The element containing the name and description.
	 * @public
	 * @since 0.9.7
	 */
	infoEl: HTMLElement;

	/**
	 * The name element.
	 * @public
	 * @since 0.9.7
	 */
	nameEl: HTMLElement;

	/**
	 * The description element.
	 * @public
	 * @since 0.9.7
	 */
	descEl: HTMLElement;

	/**
	 * The element containing the controls.
	 * @public
	 * @since 0.9.7
	 */
	controlEl: HTMLElement;

	/**
	 * The components added to the setting.
	 * @public
	 * @since 0.9.7
	 */
	components: BaseComponent[];

	/**
	 * Error message element shown below the input.
	 * Created by {@link setErrorMessage}.
	 * @public
	 * @since 1.13.0
	 */
	errorEl: HTMLElement | null;

	/**
	 * @param containerEl The element to add the setting to.
	 * @public
	 */
	constructor(containerEl: HTMLElement) {
		this.settingEl = createDomElement("div", "setting", containerEl);
		this.infoEl = createDomElement("div", "setting-info", this.settingEl);
		this.nameEl = createDomElement("div", "setting-name", this.infoEl);
		this.descEl = createDomElement("div", "setting-desc", this.infoEl);
		this.controlEl = createDomElement("div", "setting-control", this.settingEl);
		this.components = [];
		this.errorEl = null;
	}

	/**
	 * Show a persistent validation error message below the setting. Pass an
	 * empty string or `null` to clear it. Adds the `is-invalid` class to the
	 * setting row when a message is present.
	 * @public
	 * @since 1.13.0
	 */
	setErrorMessage(message: string | null): this {
		// Ignored, as this is a stub implementation.
		return this;
	}

	/**
	 * Add a read-only display value to the row. On a navigable row, this
	 * surfaces the value edited on the page the row opens, so the user can see
	 * it without opening that page.
	 * @public
	 * @since 1.13.1
	 */
	addDisplayValue(cb: (component: DisplayValueComponent) => any): this {
		// Ignored, as this is a stub implementation.
		return this;
	}

	/**
	 * Set the name of the setting.
	 * @param name The name.
	 * @example
	 * ```ts
	 * const fragment = createFragment();
	 * fragment.createEl('strong', { text: 'bar' });
	 * setting.setName(fragment);
	 * ```
	 * @public
	 * @since 0.12.16
	 */
	setName(name: string | DocumentFragment): this {
		// Ignored, as this is a stub implementation.
		return this;
	}

	/**
	 * Set the description of the setting.
	 * @param desc The description.
	 * @public
	 * @since 0.9.7
	 */
	setDesc(desc: string | DocumentFragment): this {
		// Ignored, as this is a stub implementation.
		return this;
	}

	/**
	 * Add one or more CSS classes to the setting element.
	 * @param cls The classes, separated by spaces.
	 * @public
	 * @since 0.9.7
	 */
	setClass(cls: string): this {
		// Ignored, as this is a stub implementation.
		return this;
	}

	/**
	 * Set a tooltip on the name of the setting.
	 * @param tooltip The tooltip text.
	 * @param options The tooltip options.
	 * @public
	 * @since 1.1.0
	 */
	setTooltip(tooltip: string, options?: TooltipOptions): this {
		// Ignored, as this is a stub implementation.
		return this;
	}

	/**
	 * Make the setting a heading.
	 * @public
	 * @since 0.9.16
	 */
	setHeading(): this {
		// Ignored, as this is a stub implementation.
		return this;
	}

	/**
	 * Set whether the setting is disabled.
	 * @param disabled `true` to disable, `false` to enable.
	 * @public
	 * @since 1.2.3
	 */
	setDisabled(disabled: boolean): this {
		// Ignored, as this is a stub implementation.
		return this;
	}

	/**
	 * Add a button to the setting.
	 * @param cb Called with the new component.
	 * @example
	 * ```ts
	 * setting.addButton((button) => {
	 *     button.setButtonText('foo');
	 * });
	 * ```
	 * @public
	 * @since 0.9.7
	 */
	addButton(cb: (component: ButtonComponent) => any): this {
		// Ignored, as this is a stub implementation.
		return this;
	}

	/**
	 * Add an extra button to the setting.
	 * @param cb Called with the new component.
	 * @example
	 * ```ts
	 * setting.addExtraButton((extraButton) => {
	 *     extraButton.setIcon('dice');
	 * });
	 * ```
	 * @public
	 * @since 0.9.16
	 */
	addExtraButton(cb: (component: ExtraButtonComponent) => any): this {
		// Ignored, as this is a stub implementation.
		return this;
	}

	/**
	 * Add a toggle to the setting.
	 * @param cb Called with the new component.
	 * @example
	 * ```ts
	 * setting.addToggle((toggle) => {
	 *     toggle.setValue(true);
	 * });
	 * ```
	 * @public
	 * @since 0.9.7
	 */
	addToggle(cb: (component: ToggleComponent) => any): this {
		// Ignored, as this is a stub implementation.
		return this;
	}

	/**
	 * Add a text component to the setting.
	 * @param cb Called with the new component.
	 * @example
	 * ```ts
	 * setting.addText((text) => {
	 *     text.setValue('foo');
	 * });
	 * ```
	 * @public
	 * @since 0.9.7
	 */
	addText(cb: (component: TextComponent) => any): this {
		// Ignored, as this is a stub implementation.
		return this;
	}

	/**
	 * @public
	 * @since 1.11.0
	 */
	addComponent<T extends BaseComponent>(cb: (el: HTMLElement) => T): this {
		// Ignored, as this is a stub implementation.
		return this;
	}

	/**
	 * Add a search component to the setting.
	 * @param cb Called with the new component.
	 * @example
	 * ```ts
	 * setting.addSearch((search) => {
	 *     search.setValue('foo');
	 * });
	 * ```
	 * @public
	 * @since 0.9.21
	 */
	addSearch(cb: (component: SearchComponent) => any): this {
		// Ignored, as this is a stub implementation.
		return this;
	}

	/**
	 * Add a text area component to the setting.
	 * @param cb Called with the new component.
	 * @example
	 * ```ts
	 * setting.addTextArea((textArea) => {
	 *     textArea.setValue('foo');
	 * });
	 * ```
	 * @public
	 * @since 0.9.7
	 */
	addTextArea(cb: (component: TextAreaComponent) => any): this {
		// Ignored, as this is a stub implementation.
		return this;
	}

	/**
	 * Add a moment format component to the setting.
	 * @param cb Called with the new component.
	 * @example
	 * ```ts
	 * setting.addMomentFormat((momentFormat) => {
	 *     momentFormat.setValue('YYYY-MM-DD');
	 * });
	 * ```
	 * @public
	 * @since 0.9.7
	 */
	addMomentFormat(cb: (component: MomentFormatComponent) => any): this {
		// Ignored, as this is a stub implementation.
		return this;
	}

	/**
	 * Add a dropdown component to the setting.
	 * @param cb Called with the new component.
	 * @example
	 * ```ts
	 * setting.addDropdown((dropdown) => {
	 *     dropdown.addOption('foo', 'bar');
	 * });
	 * ```
	 * @public
	 * @since 0.9.7
	 */
	addDropdown(cb: (component: DropdownComponent) => any): this {
		// Ignored, as this is a stub implementation.
		return this;
	}

	/**
	 * Add a color picker component to the setting.
	 * @param cb Called with the new component.
	 * @example
	 * ```ts
	 * setting.addColorPicker((colorPicker) => {
	 *     colorPicker.setValue('#000000');
	 * });
	 * ```
	 * @public
	 * @since 0.16.0
	 */
	addColorPicker(cb: (component: ColorComponent) => any): this {
		// Ignored, as this is a stub implementation.
		return this;
	}

	/**
	 * Add a progress bar component to the setting.
	 * @param cb Called with the new component.
	 * @example
	 * ```ts
	 * setting.addProgressBar((progressBar) => {
	 *     progressBar.setValue(50);
	 * });
	 * ```
	 * @public
	 * @since 1.4.4
	 */
	addProgressBar(cb: (component: ProgressBarComponent) => any): this {
		// Ignored, as this is a stub implementation.
		return this;
	}

	/**
	 * Add a slider component to the setting.
	 * @param cb Called with the new component.
	 * @example
	 * ```ts
	 * setting.addSlider((slider) => {
	 *     slider.setValue(50);
	 * });
	 * ```
	 * @public
	 * @since 0.9.7
	 */
	addSlider(cb: (component: SliderComponent) => any): this {
		// Ignored, as this is a stub implementation.
		return this;
	}

	/**
	 * Facilitates chaining.
	 * @param cb Called with this setting.
	 * @example
	 * ```ts
	 * setting.then((x) => {
	 *     x.setName('foo');
	 * });
	 * ```
	 * @public
	 * @since 0.9.20
	 */
	// biome-ignore lint/suspicious/noThenProperty: This is intended for chaining.
	then(cb: (setting: this) => unknown): this {
		cb(this);
		return this;
	}

	/**
	 * Remove all controls from the setting.
	 * @public
	 * @since 0.13.8
	 */
	clear(): this {
		// Ignored, as this is a stub implementation.
		return this;
	}
}
