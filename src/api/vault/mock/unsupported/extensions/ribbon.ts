import type { IconName } from "../../../../../host/obsidian/compat/icons";

export interface IRibbonIconPlugin_ {
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
