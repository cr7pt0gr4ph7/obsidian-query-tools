import type { ViewCreator } from "../view.js";

export interface IViewPlugin_ {
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
