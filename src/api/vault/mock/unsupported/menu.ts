import type { HistoryHandler } from "./history.js";
import { Component } from "./lifecycle.js";

/**
 * The position to show a menu at.
 * @public
 * @since 1.1.0
 */
export interface MenuPositionDef {
	/**
	 * The x coordinate.
	 * @public
	 */
	x: number;

	/**
	 * The y coordinate.
	 * @public
	 */
	y: number;

	/**
	 * The width of the element the menu is shown next to, starting at `x`.
	 * @public
	 */
	width?: number;

	/**
	 * Whether the menu should overlap the element described by `x` and `width`, instead of opening beside it.
	 * @public
	 */
	overlap?: boolean;

	/**
	 * Whether to prefer opening the menu towards the left.
	 * @public
	 */
	left?: boolean;
}

/**
 * A component for context menus.
 * @public
 */
export class Menu extends Component implements HistoryHandler {
	/**
	 * @public
	 */
	constructor() {
		throw new Error("Method not implemented.");
	}

	/**
	 * Remove the space reserved for icons from the menu.
	 * @public
	 */
	setNoIcon(): this {
		throw new Error("Method not implemented.");
	}

	/**
	 * Force this menu to use native or DOM.
	 * (Only works on the desktop app)
	 * @param useNativeMenu Whether to use a native menu.
	 * @public
	 * @since 0.16.0
	 */
	setUseNativeMenu(useNativeMenu: boolean): this {
		throw new Error("Method not implemented.");
	}

	/**
	 * Adds a menu item. Only works when menu is not shown yet.
	 * @param cb Called with the new menu item.
	 * @example
	 * ```ts
	 * menu.addItem((item) => {
	 *     item.setTitle('foo');
	 * });
	 * ```
	 * @public
	 * @since 0.15.3
	 */
	addItem(cb: (item: MenuItem) => any): this {
		throw new Error("Method not implemented.");
	}

	/**
	 * Adds a separator. Only works when menu is not shown yet.
	 * @public
	 * @since 0.15.3
	 */
	addSeparator(): this {
		throw new Error("Method not implemented.");
	}

	/**
	 * @public
	 * @since 0.16.0
	 */
	setParentElement(el: HTMLElement): this {
		throw new Error("Method not implemented.");
	}

	/**
	 * Show the menu at the position of the mouse event.
	 * @param evt The mouse event.
	 * @public
	 * @since 0.12.6
	 */
	showAtMouseEvent(evt: MouseEvent): this {
		throw new Error("Method not implemented.");
	}

	/**
	 * Show the menu at a specific position.
	 * @param position The position.
	 * @param doc The document. Use if you need to show the menu in another window.
	 * @public
	 * @since 1.1.0
	 */
	showAtPosition(position: MenuPositionDef, doc?: Document): this {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	onHistoryBack(): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Hide the menu.
	 * @public
	 */
	hide(): this {
		throw new Error("Method not implemented.");
	}

	/**
	 * An alias for {@link Menu.hide}. No longer used.
	 * @deprecated Previously existed to satisfy ClosableComponent.
	 * @public
	 */
	close(): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Set the callback to be called when the menu is hidden.
	 * @param callback The callback.
	 * @public
	 */
	onHide(callback: () => any): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * @public
	 * @since 1.6.0
	 */
	static forEvent(evt: PointerEvent | MouseEvent): Menu {
		throw new Error("Method not implemented.");
	}
}

/**
 * A menu item.
 * @public
 */
export class MenuItem {
	/**
	 * Private constructor. Use {@link Menu.addItem} instead.
	 * @public
	 */
	private constructor() {}

	/**
	 * Set the title of the menu item.
	 * @param title The title.
	 * @example
	 * ```ts
	 * menuItem.setTitle('foo');
	 * // Or
	 * const fragment = createFragment();
	 * fragment.createEl('strong', { text: 'bar' });
	 * menuItem.setTitle(fragment);
	 * ```
	 * @public
	 */
	setTitle(title: string | DocumentFragment): this {
		throw new Error("Method not implemented.");
	}

	/**
	 * Set the icon of the menu item.
	 * @param icon ID of the icon, can use any icon loaded with {@link addIcon} or from the built-in lucide library.
	 * @see The Obsidian icon library includes the {@link https://lucide.dev/ Lucide icon library}, any icon name from their site will work here.
	 * @public
	 * @since 0.16.2
	 */
	setIcon(icon: IconName | null): this {
		throw new Error("Method not implemented.");
	}

	/**
	 * Set the checked state of the menu item.
	 * @param checked Whether the item is checked.
	 * @public
	 * @since 0.16.2
	 */
	setChecked(checked: boolean | null): this {
		throw new Error("Method not implemented.");
	}

	/**
	 * Set whether the menu item is disabled.
	 * @param disabled `true` to disable, `false` to enable.
	 * @public
	 * @since 0.15.0
	 */
	setDisabled(disabled: boolean): this {
		throw new Error("Method not implemented.");
	}

	/**
	 * @param state - If the warning state is enabled
	 * If set to true the MenuItem's title and icon will become red. Or whatever color is applied to the class 'is-warning' by a theme.
	 * @public
	 * @since 0.15.0
	 */
	setWarning(isWarning: boolean): this {
		throw new Error("Method not implemented.");
	}

	/**
	 * Set the menu item to be a label.
	 * @param isLabel Whether the item is a label.
	 * @public
	 * @since 0.15.0
	 */
	setIsLabel(isLabel: boolean): this {
		throw new Error("Method not implemented.");
	}

	/**
	 * Set the callback to be called when the menu item is clicked.
	 * @param callback The callback.
	 * @public
	 */
	onClick(callback: (evt: MouseEvent | KeyboardEvent) => any): this {
		throw new Error("Method not implemented.");
	}

	/**
	 * Sets the section this menu item should belong in.
	 * To find the section IDs of an existing menu, inspect the DOM elements
	 * to see their `data-section` attribute.
	 * @param section The section ID.
	 * @example
	 * ```ts
	 * menuItem.setSection('danger');
	 * ```
	 * @public
	 * @since 0.15.3
	 */
	setSection(section: string): this {
		throw new Error("Method not implemented.");
	}
}

/**
 * A separator for the menu.
 * @public
 * @since 0.15.3
 */
export class MenuSeparator {}
