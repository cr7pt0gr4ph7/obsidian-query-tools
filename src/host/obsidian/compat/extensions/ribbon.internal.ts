import { createDomElement } from "../fakedom.internal.js";
import type { IconName } from "../icons.js";

export interface IRibbonIconPluginRegistry {
	/**
	 * Adds a ribbon icon to the left bar.
	 * @param icon The icon name to be used. See {@link addIcon}.
	 * @param title The title to be displayed in the tooltip.
	 * @param callback The `click` callback.
	 * @returns The HTMLElement of the ribbon icon.
	 * @public
	 * @since 0.9.7
	 */
	addRibbonIcon(icon: IconName, title: string, callback: (evt: MouseEvent) => any): HTMLElement;
}

export interface IRibbonIconRegistration {
	/** The icon name to be used. */
	readonly icon: IconName;
	/** The title to be displayed in the tooltip. */
	readonly title: string;
	/** The `click` callback for the ribbon icon. */
	readonly callback: (evt: MouseEvent) => any;
}

export function RibbonIconPluginRegistry<TBase extends new (...args: any[]) => any>(Base: TBase) {
	return class extends Base implements IRibbonIconPluginRegistry {
		_ribbonIcons: Record<string, IRibbonIconRegistration> = {};

		addRibbonIcon(icon: IconName, title: string, callback: (evt: MouseEvent) => any): HTMLElement {
			const el = createDomElement("div", "ribbon-icon");
			this._ribbonIcons[icon] = { icon, title, callback };
			return el;
		}
	};
}
