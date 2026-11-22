import type { HoverParent, HoverPopover } from "./extensions/hover.js";

/**
 * Utility functions for rendering Values within the app.
 * @public
 * @since 1.10.0
 */
export class RenderContext implements HoverParent {
	/**
	 * @public
	 * @since 1.10.0
	 */
	hoverPopover: HoverPopover | null = null;
}
