import { Component } from "../lifecycle.js";
import { placeholder } from "../placeholder.js";

export interface IHoverPlugin_ {
	/**
	 * Registers a view with the 'Page preview' core plugin as an emitter of the 'hover-link' event.
	 * @param id The ID of the hover link source, usually the plugin ID.
	 * @param info How the source is shown in the 'Page preview' plugin settings.
	 * @example
	 * ```ts
	 * plugin.registerHoverLinkSource('foo', {
	 *     display: 'bar',
	 *     defaultMod: true,
	 * });
	 * ```
	 * @public
	 * @since 1.1.0
	 */
	registerHoverLinkSource(id: string, info: HoverLinkSource): void;
}

/**
 * Represents a point in a 2D coordinate system.
 * @public
 */
export interface Point {
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
}

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
		this.hoverEl = placeholder;
		this.state = placeholder;
	}
}
