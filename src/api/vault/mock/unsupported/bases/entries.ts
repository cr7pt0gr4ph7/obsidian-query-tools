import type { TFile } from "../../files/files.js";
import type { Value } from "../../values.js";
import type { FormulaContext } from "./formulas.js";
import type { BasesPropertyId } from "./properties.js";

/**
 * Represent a single "row" or file in a base.
 * @public
 * @since 1.10.0
 */
export /*class*/ interface BasesEntry extends FormulaContext {
	/**
	 * @public
	 * @since 1.10.0
	 */
	file: TFile;

	/**
	 * Get the value of the property.
	 * Note: Errors are returned as {@link ErrorValue}
	 * @public
	 * @since 1.10.0
	 */
	getValue(propertyId: BasesPropertyId): Value | null;
}

/**
 * A group of BasesEntry objects for a given value of the groupBy key.
 * If there are entries in the results which do not have a value for the
 * groupBy key, the key will be the {@link NullValue}.
 * @public
 * @since 1.10.0
 */
export /*class*/ interface BasesEntryGroup {
	/**
	 * The value of the groupBy key for this entry group.
	 * @public
	 * @since 1.10.0
	 */
	key?: Value;

	/**
	 * @public
	 * @since 1.10.0
	 */
	entries: BasesEntry[];

	/**
	 * @returns true iff this entry group has a non-null key.
	 * @public
	 * @since 1.10.0
	 */
	hasKey(): boolean;
}
