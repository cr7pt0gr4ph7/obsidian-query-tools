import type { FrontmatterValue } from "../../../../../host/obsidian/cache/types";

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
