import type { PropertyWidget } from "./property_widget.unofficial.js";

/**
 * Information about a frontmatter property across the vault.
 *
 * @unofficial
 */
export interface PropertyInfo {
	/**
	 * Name of property.
	 */
	name: string;
	/**
	 * Usage count of property.
	 */
	occurrences: number;
	/**
	 * Type of property.
	 */
	widget: string;
}

/**
 * Information about a property's expected and inferred widget types.
 *
 * @unofficial
 */
export interface TypeInfo {
	/**
	 * The explicitly assigned property widget type.
	 */
	expected: PropertyWidget;

	/**
	 * The property widget type inferred from the value.
	 */
	inferred: PropertyWidget;
}
