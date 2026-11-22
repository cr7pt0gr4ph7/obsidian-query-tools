import type { BasesAllOptions } from "../bases/options.js";
import type { BasesView, BasesViewConfig, QueryController } from "../bases/view.js";
import type { IconName } from "../icons.js";

/**
 * Implement this factory function in a {@link BasesViewRegistration} to create a
 * new instance of a custom Bases view.
 * @param containerEl - The container below the Bases toolbar where the view will be displayed.
 * @public
 * @since 1.10.0
 */
export type BasesViewFactory = (controller: QueryController, containerEl: HTMLElement) => BasesView;

/**
 * Container for options when registering a new Bases view type.
 * @public
 * @since 1.10.0
 */
export interface BasesViewRegistration {
	/**
	 * @public
	 * @since 1.10.0
	 */
	name: string;

	/**
	 * Icon ID to be used in the Bases view selector.
	 * See {@link https://docs.obsidian.md/Plugins/User+interface/Icons} for available icons and how to add your own.
	 * @public
	 * @since 1.10.0
	 */
	icon: IconName;

	/**
	 * @public
	 * @since 1.10.0
	 */
	factory: BasesViewFactory;

	/**
	 * @public
	 * @since 1.10.0
	 */
	options?: (config: BasesViewConfig) => BasesAllOptions[];
}
