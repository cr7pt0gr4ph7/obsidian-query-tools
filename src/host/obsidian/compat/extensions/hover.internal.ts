import type { HoverLinkSource } from "./hover.js";

export interface IHoverPluginRegistry {
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

export function HoverPluginRegistry<TBase extends new (...args: any[]) => any>(Base: TBase) {
	return class extends Base implements IHoverPluginRegistry {
		_hoverLinkSources: Record<string, HoverLinkSource> = {};

		registerHoverLinkSource(id: string, info: HoverLinkSource): void {
			this._hoverLinkSources[id] = info;
		}
	};
}
