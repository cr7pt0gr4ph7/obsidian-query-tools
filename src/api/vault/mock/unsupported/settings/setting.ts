import type {
	BaseComponent,
	ButtonComponent,
	ColorComponent,
	DropdownComponent,
	ExtraButtonComponent,
	MomentFormatComponent,
	ProgressBarComponent,
	SearchComponent,
	SliderComponent,
	TextAreaComponent,
	TextComponent,
	ToggleComponent,
} from "../components.js";
import { placeholder } from "../placeholder.js";
import type { TooltipOptions } from "../tooltips.js";

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
		this.settingEl = placeholder;
		this.infoEl = placeholder;
		this.nameEl = placeholder;
		this.descEl = placeholder;
		this.controlEl = placeholder;
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
		throw new Error("Method not implemented.");
	}
	/**
	 * Add a read-only display value to the row. On a navigable row, this
	 * surfaces the value edited on the page the row opens, so the user can see
	 * it without opening that page.
	 * @public
	 * @since 1.13.1
	 */
	addDisplayValue(cb: (component: DisplayValueComponent) => any): this {
		throw new Error("Method not implemented.");
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
		throw new Error("Method not implemented.");
	}
	/**
	 * Set the description of the setting.
	 * @param desc The description.
	 * @public
	 * @since 0.9.7
	 */
	setDesc(desc: string | DocumentFragment): this {
		throw new Error("Method not implemented.");
	}
	/**
	 * Add one or more CSS classes to the setting element.
	 * @param cls The classes, separated by spaces.
	 * @public
	 * @since 0.9.7
	 */
	setClass(cls: string): this {
		throw new Error("Method not implemented.");
	}
	/**
	 * Set a tooltip on the name of the setting.
	 * @param tooltip The tooltip text.
	 * @param options The tooltip options.
	 * @public
	 * @since 1.1.0
	 */
	setTooltip(tooltip: string, options?: TooltipOptions): this {
		throw new Error("Method not implemented.");
	}
	/**
	 * Make the setting a heading.
	 * @public
	 * @since 0.9.16
	 */
	setHeading(): this {
		throw new Error("Method not implemented.");
	}
	/**
	 * Set whether the setting is disabled.
	 * @param disabled `true` to disable, `false` to enable.
	 * @public
	 * @since 1.2.3
	 */
	setDisabled(disabled: boolean): this {
		throw new Error("Method not implemented.");
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
		throw new Error("Method not implemented.");
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
		throw new Error("Method not implemented.");
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
		throw new Error("Method not implemented.");
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
		throw new Error("Method not implemented.");
	}
	/**
	 * @public
	 * @since 1.11.0
	 */
	addComponent<T extends BaseComponent>(cb: (el: HTMLElement) => T): this {
		throw new Error("Method not implemented.");
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
		throw new Error("Method not implemented.");
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
		throw new Error("Method not implemented.");
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
		throw new Error("Method not implemented.");
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
		throw new Error("Method not implemented.");
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
		throw new Error("Method not implemented.");
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
		throw new Error("Method not implemented.");
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
		throw new Error("Method not implemented.");
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
		throw new Error("Method not implemented.");
	}
}

/**
 * A read-only display value for a setting row: a value label and an optional
 * status indicator. On a navigable row, it surfaces the value edited on the
 * page the row opens, so the user can see it without opening that page.
 * @public
 * @since 1.13.1
 */
export class DisplayValueComponent {
	/**
	 * @public
	 * @since 1.13.1
	 */
	valueEl: HTMLElement;

	/**
	 * @public
	 */
	constructor(containerEl: HTMLElement) {
        this.valueEl = placeholder;
    }

	/**
	 * Set the value label text. Pass an empty string or `null` to clear it.
	 * @public
	 * @since 1.13.1
	 */
	setValue(value: string | null): this {
        throw new Error("Method not implemented.");
    }

	/**
	 * Show a status indicator on the row. Use `'warning'` when the value needs
	 * the user's attention; the explanation itself belongs on the page this
	 * row leads to, while this only signals that there is something to look at.
	 * Pass `null` to clear it.
	 * @public
	 * @since 1.13.1
	 */
	setStatus(status: "warning" | null): this {
        throw new Error("Method not implemented.");
    }
}
