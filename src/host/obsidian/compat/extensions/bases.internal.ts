import type { BasesViewRegistration } from "./bases.js";

export interface IBasesViewPluginRegistry {
	/**
	 * Register a Base view handler that can be used to render data from property queries.
	 *
	 * @returns false if bases are not enabled in this vault.
	 * @public
	 * @since 1.10.0
	 */
	registerBasesView(viewId: string, registration: BasesViewRegistration): boolean;
}

export function BasesViewPluginRegistry<TBase extends new (...args: any[]) => any>(Base: TBase) {
	return class extends Base implements IBasesViewPluginRegistry {
		_basesViews: Record<string, BasesViewRegistration> = {};

		registerBasesView(viewId: string, registration: BasesViewRegistration): boolean {
			this._basesViews[viewId] = registration;
            // Return false to indicate that bases are not enabled in this vault.
			return false;
		}
	};
}
