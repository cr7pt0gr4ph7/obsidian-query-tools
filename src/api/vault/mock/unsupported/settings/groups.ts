import type { ExtraButtonComponent, SearchComponent } from "../components.js";
import { placeholder } from "../placeholder.js";
import type { Setting } from "./setting.js";

/**
 * @public
 * @since 1.11.0
 */
export class SettingGroup {
	/**
	 * @public
	 * @since 1.11.0
	 */
	listEl: HTMLElement;

	/**
	 * @public
	 * @since 1.11.0
	 */
	constructor(containerEl: HTMLElement) {
		this.listEl = placeholder;
	}

	/**
	 * @public
	 * @since 1.11.0
	 */
	setHeading(text: string | DocumentFragment): this {
		throw new Error("Method not implemented.");
	}

	/**
	 * @public
	 * @since 1.11.0
	 */
	addClass(...classes: string[]): this {
		throw new Error("Method not implemented.");
	}

	/**
	 * @public
	 * @since 1.11.0
	 */
	addSetting(cb: (setting: Setting) => void): this {
		throw new Error("Method not implemented.");
	}

	/**
	 * Add a search input at the beginning of the setting group. Useful for filtering
	 * results or adding an input for quick entry.
	 * @public
	 * @since 1.11.0
	 */
	addSearch(cb: (component: SearchComponent) => unknown): this {
		throw new Error("Method not implemented.");
	}

	/**
	 * @public
	 * @since 1.11.0
	 */
	addExtraButton(cb: (component: ExtraButtonComponent) => unknown): this {
		throw new Error("Method not implemented.");
	}
}
