import type { ViewCreator } from "../views/view.js";

export interface IViewPluginRegistry {
	/**
	 * Register a custom view.
	 * @param type The view type.
	 * @param viewCreator A function that creates the view for a given leaf.
	 * @example
	 * ```ts
	 * plugin.registerView('my-view', (leaf) => {
	 *     return new MyView(leaf);
	 * });
	 * ```
	 * @public
	 * @since 0.9.7
	 */
	registerView(type: string, viewCreator: ViewCreator): void;
}

export function ViewPluginRegistry<Base extends new (...args: any[]) => any>(Base: Base) {
	return class extends Base implements IViewPluginRegistry {
		_views: Record<string, ViewCreator> = {};

		registerView(type: string, viewCreator: ViewCreator): void {
			this._views[type] = viewCreator;
		}
	};
}
