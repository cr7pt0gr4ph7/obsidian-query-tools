import { createDomElement } from "../fakedom.internal.js";

export interface IStatusBarPluginRegistry {
	/**
	 * Adds a status bar item to the bottom of the app.
	 * Not available on mobile.
	 *
	 * @see {@link https://docs.obsidian.md/Plugins/User+interface/Status+bar}.
	 * @returns The HTMLElement of the status bar item.
	 * @public
	 * @since 0.9.7
	 */
	addStatusBarItem(): HTMLElement;
}

export function StatusBarPluginRegistry<Base extends new (...args: any[]) => any>(Base: Base) {
	return class extends Base implements IStatusBarPluginRegistry {
		_statusBarItems: HTMLElement[] = [];

		addStatusBarItem(): HTMLElement {
			const item = createDomElement("div", "status-bar-item");
			this._statusBarItems.push(item);
			return item;
		}
	};
}
