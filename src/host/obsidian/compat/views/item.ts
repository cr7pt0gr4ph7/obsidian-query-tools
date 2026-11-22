import { createDomElement } from "../fakedom.internal.js";
import type { IconName } from "../icons.js";
import type { WorkspaceLeaf } from "../workspace/leaf.js";
import { View } from "./view.js";

/**
 * A view with a header and a content area. Most custom views should extend this class.
 * @public
 * @since 0.9.7
 */
export abstract class ItemView extends View {
	/**
	 * The content element.
	 * @public
	 */
	contentEl: HTMLElement;

	/**
	 * @inheritDoc
	 * @public
	 */
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
		this.contentEl = createDomElement("div", "item-view-content");
	}

	/**
	 * Add an action to the item view.
	 * @param icon The icon.
	 * @param title The title, shown in a tooltip.
	 * @param callback Called when the action is clicked.
	 * @public
	 * @since 1.1.0
	 */
	addAction(icon: IconName, title: string, callback: (evt: MouseEvent) => any): HTMLElement {
		// Ignored, as this is a stub implementation.
		return createDomElement("div", "item-view-action", this.contentEl);
	}
}
