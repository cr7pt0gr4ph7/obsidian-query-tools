import type { TFile, TFolder } from "../../files/files.js";
import type { BasesPropertyId } from "./properties.js";

/**
 * @public
 * @since 1.10.0
 */
export type BasesOptions =
	| BasesDropdownOption
	| BasesFileOption
	| BasesFolderOption
	| BasesFormulaOption
	| BasesMultitextOption
	| BasesPropertyOption
	| BasesSliderOption
	| BasesTextOption
	| BasesToggleOption;

/**
 * BasesOptions and the associated sub-types are configuration-driven settings controls
 * which can be provided by a {@link BasesViewRegistration} to expose configuration options
 * to users in the view config menu of the Bases toolbar.
 * @public
 * @since 1.10.0
 */
export type BasesAllOptions = BasesOptions | BasesOptionGroup<BasesOptions>;

/**
 * @public
 * @since 1.10.0
 */
export interface BasesOption {
	/**
	 * @public
	 * @since 1.10.0
	 */
	key: string;

	/**
	 * @public
	 * @since 1.10.0
	 */
	type: string;

	/**
	 * @public
	 * @since 1.10.0
	 */
	displayName: string;

	/**
	 * If provided, the option will be hidden if the function returns true.
	 *
	 * @public
	 * @since 1.10.2
	 */
	shouldHide?: () => boolean;
}

/**
 * Collapsible container for other ViewOptions.
 * @public
 * @since 1.10.0
 */
export interface BasesOptionGroup<T extends BasesOption> {
	/**
	 * @public
	 * @since 1.10.0
	 */
	type: "group";

	/**
	 * @public
	 * @since 1.10.0
	 */
	displayName: string;

	/**
	 * @public
	 * @since 1.10.0
	 */
	items: T[];

	/**
	 * If provided, the group will be hidden if the function returns true.
	 * @public
	 * @since 1.10.2
	 */
	shouldHide?: () => boolean;
}

/**
 * @public
 * @since 1.10.0
 */
export interface BasesDropdownOption extends BasesOption {
	/**
	 * @public
	 * @since 1.10.0
	 */
	type: "dropdown";

	/**
	 * @public
	 * @since 1.10.0
	 */
	default?: string;

	/**
	 * @public
	 * @since 1.10.0
	 */
	options: Record<string, string>;
}

/**
 * A text input allowing selection of a file from in the vault.
 * @public
 * @since 1.10.2
 */
export interface BasesFileOption extends BasesOption {
	/**
	 * @public
	 * @since 1.10.2
	 */
	type: "file";

	/**
	 * @public
	 * @since 1.10.2
	 */
	default?: string;

	/**
	 * @public
	 * @since 1.10.2
	 */
	placeholder?: string;

	/**
	 * @public
	 * @since 1.10.2
	 */
	filter?: (file: TFile) => boolean;
}

/**
 * A text input allowing selection of a folder from in the vault.
 * @public
 * @since 1.10.2
 */
export interface BasesFolderOption extends BasesOption {
	/**
	 * @public
	 * @since 1.10.2
	 */
	type: "folder";

	/**
	 * @public
	 * @since 1.10.2
	 */
	default?: string;

	/**
	 * @public
	 * @since 1.10.2
	 */
	placeholder?: string;

	/**
	 * @public
	 * @since 1.10.2
	 */
	filter?: (folder: TFolder) => boolean;
}

/**
 * A text input supporting formula evaluation.
 * @public
 * @since 1.10.2
 */
export interface BasesFormulaOption extends BasesOption {
	/**
	 * @public
	 * @since 1.10.2
	 */
	type: "formula";

	/**
	 * @public
	 * @since 1.10.2
	 */
	default?: string;

	/**
	 * @public
	 * @since 1.10.2
	 */
	placeholder?: string;
}

/**
 * @public
 * @since 1.10.0
 */
export interface BasesMultitextOption extends BasesOption {
	/**
	 * @public
	 * @since 1.10.0
	 */
	type: "multitext";

	/**
	 * @public
	 * @since 1.10.0
	 */
	default?: string[];
}

/**
 * A dropdown menu allowing selection of a property.
 * @public
 * @since 1.10.0
 */
export interface BasesPropertyOption extends BasesOption {
	/**
	 * @public
	 * @since 1.10.0
	 */
	type: "property";

	/**
	 * @public
	 * @since 1.10.0
	 */
	default?: string;

	/**
	 * @public
	 * @since 1.10.0
	 */
	placeholder?: string;

	/**
	 * If provided, only properties which pass the filter will be included for selection in the property dropdown.
	 *
	 * @public
	 * @since 1.10.0
	 */
	filter?: (prop: BasesPropertyId) => boolean;
}

/**
 * @public
 * @since 1.10.0
 */
export interface BasesSliderOption extends BasesOption {
	/**
	 * @public
	 * @since 1.10.0
	 */
	type: "slider";

	/**
	 * @public
	 * @since 1.10.0
	 */
	default?: number;

	/**
	 * @public
	 * @since 1.10.0
	 */
	min?: number;

	/**
	 * @public
	 * @since 1.10.0
	 */
	max?: number;

	/**
	 * @public
	 * @since 1.10.0
	 */
	step?: number;

	/**
	 * @public
	 * @since 1.10.0
	 */
	instant?: boolean;
}

/**
 * @public
 * @since 1.10.0
 */
export interface BasesTextOption extends BasesOption {
	/**
	 * @public
	 * @since 1.10.0
	 */
	type: "text";

	/**
	 * @public
	 * @since 1.10.0
	 */
	default?: string;

	/**
	 * @public
	 * @since 1.10.0
	 */
	placeholder?: string;
}

/**
 * @public
 * @since 1.10.0
 */
export interface BasesToggleOption extends BasesOption {
	/**
	 * @public
	 * @since 1.10.0
	 */
	type: "toggle";

	/**
	 * @public
	 * @since 1.10.0
	 */
	default?: boolean;
}
