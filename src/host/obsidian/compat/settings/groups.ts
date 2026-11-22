import type { ExtraButtonComponent } from "../components/button.js";
import type { SearchComponent } from "../components/search.js";
import { createDomElement } from "../fakedom.internal.js";
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
		this.listEl = createDomElement("div", "setting-group", containerEl);
	}

	/**
	 * @public
	 * @since 1.11.0
	 */
	setHeading(text: string | DocumentFragment): this {
		// Ignored, as this is a stub implementation.
		return this;
	}

	/**
	 * @public
	 * @since 1.11.0
	 */
	addClass(...classes: string[]): this {
		// Ignored, as this is a stub implementation.
		return this;
	}

	/**
	 * @public
	 * @since 1.11.0
	 */
	addSetting(cb: (setting: Setting) => void): this {
		// Ignored, as this is a stub implementation.
		return this;
	}

	/**
	 * Add a search input at the beginning of the setting group. Useful for filtering
	 * results or adding an input for quick entry.
	 * @public
	 * @since 1.11.0
	 */
	addSearch(cb: (component: SearchComponent) => unknown): this {
		// Ignored, as this is a stub implementation.
		return this;
	}

	/**
	 * @public
	 * @since 1.11.0
	 */
	addExtraButton(cb: (component: ExtraButtonComponent) => unknown): this {
		// Ignored, as this is a stub implementation.
		return this;
	}
}
