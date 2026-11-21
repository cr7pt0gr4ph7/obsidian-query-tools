/**
 * Manually trigger a tooltip that will appear over the provided element.
 * To display a tooltip on hover, use {@link setTooltip} instead.
 * @param newTargetEl The element.
 * @param content The content.
 * @param options The tooltip options.
 * @public
 * @since 1.8.7
 */
export function displayTooltip(
	newTargetEl: HTMLElement,
	content: string | DocumentFragment,
	options?: TooltipOptions,
): void;

/**
 * Options for the tooltip.
 * @public
 */
export interface TooltipOptions {
	/**
	 * The placement.
	 * @public
	 */
	placement?: TooltipPlacement;

	/**
	 * Extra CSS classes to add to the tooltip.
	 * @public
	 * @since 1.8.7
	 */
	classes?: string[];

	/**
	 * The gap between the tooltip and the element, in pixels.
	 * @public
	 * @since 1.8.7
	 */
	gap?: number;

	/**
	 * The delay before showing the tooltip, in milliseconds.
	 * @public
	 * @since 1.4.11
	 */
	delay?: number;
}

/**
 * Where to show a tooltip relative to its element.
 * @public
 */
export type TooltipPlacement = "bottom" | "right" | "left" | "top";
