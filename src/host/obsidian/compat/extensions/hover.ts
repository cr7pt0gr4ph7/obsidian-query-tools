import { Component } from "../../base/component.js";
import type { Point } from "../../base/point.js";
import { createDomElement } from "../fakedom.internal.js";

/**
 * A source for hover links.
 * @public
 */
export interface HoverLinkSource {
	/**
	 * Text displayed in the 'Page preview' plugin settings.
	 * It should match the plugin's display name.
	 * @public
	 */
	display: string;

	/**
	 * Whether the `hover-link` event requires the 'Mod' key to be pressed to trigger.
	 * @public
	 */
	defaultMod: boolean;
}

/**
 * An object that can own a hover popover.
 * @public
 * @since 0.11.13
 */
export interface HoverParent {
	/**
	 * The hover popover currently owned by this parent, if any.
	 * @public
	 * @since 0.11.13
	 */
	hoverPopover: HoverPopover | null;
}

/**
 * The state of a popover.
 * @public
 */
export enum PopoverState {}

/**
 * A hover popover.
 * @public
 * @since 0.15.0
 */
export class HoverPopover extends Component {
	/**
	 * The popover element.
	 * @public
	 */
	hoverEl: HTMLElement;

	/**
	 * The current state.
	 * @public
	 */
	state: PopoverState;

	/**
	 * @param parent The parent that owns the hover popover.
	 * @param targetEl The element that the hover popover is shown for.
	 * @param waitTime How long to wait before showing the hover popover, in milliseconds.
	 * @param staticPos A fixed position to show the hover popover at, instead of next to the target element.
	 * @public
	 */
	constructor(parent: HoverParent, targetEl: HTMLElement | null, waitTime?: number, staticPos?: Point | null) {
		super();
		this.hoverEl = createDomElement("div", "hover-popover");
		this.state = {} as PopoverState;
		parent.hoverPopover = this;
	}
}
