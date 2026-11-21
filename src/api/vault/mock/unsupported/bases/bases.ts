import type { App } from "../../app.js";
import type { FrontmatterValue } from "../../cache/types.js";
import type { TFile } from "../../files/files.js";
import { Component } from "../../lifecycle.js";
import type { Value } from "../../values.js";
import { placeholder } from "../placeholder.js";
import type { BasesEntry, BasesEntryGroup } from "./entries.js";
import type { BasesPropertyId } from "./properties.js";

/**
 * Represents the serialized format of a Bases query as stored in a `.base` file.
 *
 * @public
 * @since 1.10.0
 */
export interface BasesConfigFile {
	/**
	 * @public
	 * @since 1.10.0
	 */
	filters?: BasesConfigFileFilter;

	/**
	 * Configuration for properties in this Base.
	 *
	 * Valid keys for this object currently include:
	 *
	 *   - displayName: string
	 *
	 * @public
	 * @since 1.10.0
	 */
	properties?: Record<string, Record<string, any>>;

	/**
	 * Configuration for formulas used in this Base.
	 *
	 * Key: Formula property name.
	 * Value: Formula string.
	 *
	 * @public
	 * @since 1.10.0
	 */
	formulas?: Record<string, string>;

	/**
	 * Configuration for summary formulas used in this Base.
	 *
	 * Key: Summary formula name.
	 * Value: Formula string.
	 *
	 * @public
	 * @since 1.10.0
	 */
	summaries?: Record<string, string>;

	/**
	 * Configuration for views used in this Base.
	 *
	 * @public
	 * @since 1.10.0
	 */
	views?: BasesConfigFileView[];
}

/**
 * @public
 * @since 1.10.0
 */
export type BasesConfigFileFilter =
	| string
	| {
			/**
			 * @public
			 * @since 1.10.0
			 */
			and: BasesConfigFileFilter[];
	  }
	| {
			/**
			 * @public
			 * @since 1.10.0
			 */
			or: BasesConfigFileFilter[];
	  }
	| {
			/**
			 * @public
			 * @since 1.10.0
			 */
			not: BasesConfigFileFilter[];
	  };

/**
 * @public
 * @since 1.10.0
 */
export interface BasesConfigFileView {
	/**
	 * Unique identifier for the view type. Used to select the correct view renderer.
	 *
	 * @public
	 * @since 1.10.0
	 */
	type: string;

	/**
	 * Friendly name for this view, displayed in the UI to select between views.
	 *
	 * @public
	 * @since 1.10.0
	 */
	name: string;

	/**
	 * Additional filters, applied only to this view.
	 *
	 * @public
	 * @since 1.10.0
	 */
	filters?: BasesConfigFileFilter;

	/**
	 * Configuration for grouping the results of this view.
	 *
	 * @public
	 * @since 1.10.0
	 */
	groupBy?: {};

	/**
	 * Ordered list of the groupBy values to show. When set, only these groups appear, in this order.
	 * `null` is the group of entries with no value.
	 *
	 * @public
	 * @since 1.14.3
	 */
	groupOrder?: FrontmatterValue[];

	/**
	 * An ordered list of the properties to display in this view.
	 *
	 * @public
	 * @since 1.10.0
	 */
	order?: string[];

	/**
	 * Configuration of summaries to display for each property in this view.
	 *
	 * Key: Property name.
	 * Value: Summary formula name.
	 *
	 * @public
	 * @since 1.10.0
	 */
	summaries?: Record<string, string>;
}

/**
 * The BasesQueryResult contains all of the available information from executing the
 * bases query, applying filters, and evaluating formulas. The `data` or `groupedData`
 * should be displayed by your view.
 *
 * @public
 * @since 1.10.0
 */
export class BasesQueryResult {
	/**
	 * An ungrouped version of the data, with user-configured sort and limit applied.
	 * Where appropriate, views should support groupBy by using `groupedData` instead of this value.
	 *
	 * @public
	 * @since 1.10.0
	 */
	data: BasesEntry[];

	constructor() {
		this.data = [];
	}

	/**
	 * The data to be rendered, grouped according to the groupBy config.
	 * If there is no groupBy configured, returns a single group with an empty key.
	 * @public
	 * @since 1.10.0
	 */
	get groupedData(): BasesEntryGroup[] {
		throw new Error("Method not implemented.");
	}

	/**
	 * Visible properties defined by the user.
	 * @public
	 * @since 1.10.0
	 */
	get properties(): BasesPropertyId[] {
		throw new Error("Method not implemented.");
	}

	/**
	 * Applies a summary function to a single property over a set of entries.
	 * @public
	 * @since 1.10.0
	 */
	getSummaryValue(
		queryController: QueryController,
		entries: BasesEntry[],
		prop: BasesPropertyId,
		summaryKey: string,
	): Value {
		throw new Error("Method not implemented.");
	}
}

/**
 * @public
 * @since 1.10.0
 */
export type BasesSortConfig = {
	/**
	 * @public
	 * @since 1.10.0
	 */
	property: BasesPropertyId;

	/**
	 * @public
	 * @since 1.10.0
	 */
	direction: "ASC" | "DESC";
};

/**
 * Plugins can create a class which extends this in order to render a Base.
 * Plugins should create a {@link BaseViewHandlerFactory} function, then call
 * `plugin.registerView` to register the view factory.
 *
 * @public
 * @since 1.10.0
 */
export abstract class BasesView extends Component {
	/**
	 * The type ID of this view
	 * @public
	 * @since 1.10.0
	 */
	abstract type: string;

	/**
	 * @public
	 * @since 1.10.0
	 */
	app: App;

	/**
	 * The config object for this view.
	 * @public
	 * @since 1.10.0
	 */
	config: BasesViewConfig;

	/**
	 * All available properties from the dataset.
	 * @public
	 * @since 1.10.0
	 */
	allProperties: BasesPropertyId[];

	/**
	 * The most recent output from executing the bases query, applying filters, and evaluating formulas.
	 * This object will be replaced with a new result set when changes to the vault or Bases config occur,
	 * so views should not keep a reference to it. Also note the contained BasesEntry objects will be recreated.
	 * @public
	 * @since 1.10.0
	 */
	data: BasesQueryResult;

	/**
	 * @public
	 * @since 1.10.0
	 */
	protected constructor(controller: QueryController) {
		super();
		this.app = placeholder;
		this.config = placeholder;
		this.allProperties = placeholder;
		this.data = placeholder;
	}

	/**
	 * Called when there is new data for the query. This view should rerender with the updated data.
	 * @public
	 * @since 1.10.0
	 */
	abstract onDataUpdated(): void;

	/**
	 * Display the new note menu for a file with the provided filename and optionally a function to modify the frontmatter.
	 * @public
	 * @since 1.10.2
	 */
	async createFileForView(
		baseFileName?: string,
		frontmatterProcessor?: (frontmatter: any, file: TFile) => void,
	): Promise<void> {
		throw new Error("Method not implemented.");
	}
}

/**
 * The in-memory representation of a single entry in the "views" section of a Bases file.
 * Contains settings and configuration options set by the user from the toolbar menus and view options.
 * @public
 * @since 1.10.0
 */
export class BasesViewConfig {
	/**
	 * User-friendly name for this view.
	 * @public
	 * @since 1.10.0
	 */
	declare name: string;

	/**
	 * Retrieve the user-configured value of options exposed in `BasesViewRegistration.options`.
	 * @public
	 * @since 1.10.0
	 */
	get(key: string): unknown {
		throw new Error("Method not Implemented");
	}

	/**
	 * Retrieve a user-configured value from the config, converting it to a BasesPropertyId.
	 * Returns null if the requested key is not present in the config, or if the value is invalid.
	 * @public
	 * @since 1.10.0
	 */
	getAsPropertyId(key: string): BasesPropertyId | null {
		throw new Error("Method not Implemented");
	}

	/**
	 * Retrieve a user-configured value from the config, evaluating it as a
	 * formula in the context of the current Base. For embedded bases, or bases
	 * in the sidebar, this means evaluating the formula against the currently
	 * active file.
	 *
	 * @public
	 * @returns the Value result from evaluating the formula, or NullValue if the formula is invalid, or the key is not present.
	 * @since 1.10.2
	 */
	getEvaluatedFormula(view: BasesView, key: string): Value {
		throw new Error("Method not Implemented");
	}

	/**
	 * Store configuration data for the view. Views should prefer `BasesViewRegistration.options`
	 * to allow users to configure options where appropriate.
	 * @public
	 * @since 1.10.0
	 */
	set(key: string, value: any | null): void {
		throw new Error("Method not Implemented");
	}

	/**
	 * Ordered list of properties to display in this view.
	 * In a table, these can be interpreted as the list of visible columns.
	 * Order is configured by the user through the properties toolbar menu.
	 * @public
	 * @since 1.10.0
	 */
	getOrder(): BasesPropertyId[] {
		throw new Error("Method not Implemented");
	}

	/**
	 * Retrieve the sorting config for this view. Sort is configured by the user through the sort toolbar menu.
	 * Removes invalid sort configs. If no (valid) sort config, returns an empty array.
	 * Does not validate that the properties exists.
	 *
	 * Note that data from BasesQueryResult will be presorted.
	 *
	 * @public
	 * @since 1.10.0
	 */
	getSort(): BasesSortConfig[] {
		throw new Error("Method not Implemented");
	}

	/**
	 * Retrieve a friendly name for the provided property.
	 * If the property has been renamed by the user in the Base config, that value is returned.
	 * File properties may have a default name that is returned, otherwise the name with the property
	 * type prefix removed is returned.
	 *
	 * @public
	 * @since 1.10.0
	 */
	getDisplayName(propertyId: BasesPropertyId): string {
		throw new Error("Method not Implemented");
	}
}

/**
 * Responsible for executing the Bases query and evaluating filters and formulas.
 * Notifies views of updated results.
 * @public
 * @since 1.10.0
 */
export class QueryController extends Component {}
