import type { TFile } from "../../files/files.js";
import type { Value } from "../../values.js";
import type { BasesPropertyId } from "./properties.js";

/**
 * Represent a single "row" or file in a base.
 * @public
 * @since 1.10.0
 */
export class BasesEntry {
	/**
	 * @public
	 * @since 1.10.0
	 */
	declare file: TFile;

	/**
	 * Get the value of the property.
	 * Note: Errors are returned as {@link ErrorValue}
	 * @public
	 * @since 1.10.0
	 */
	getValue(propertyId: BasesPropertyId): Value | null {
		throw new Error("Method not Implemented");
	}
}

/**
 * A group of BasesEntry objects for a given value of the groupBy key.
 * If there are entries in the results which do not have a value for the
 * groupBy key, the key will be the {@link NullValue}.
 * @public
 * @since 1.10.0
 */
export class BasesEntryGroup {
	/**
	 * The value of the groupBy key for this entry group.
	 * @public
	 * @since 1.10.0
	 */
	declare key?: Value;

	/**
	 * @public
	 * @since 1.10.0
	 */
	declare entries: BasesEntry[];

	/**
	 * @returns true iff this entry group has a non-null key.
	 * @public
	 * @since 1.10.0
	 */
	hasKey(): boolean {
		throw new Error("Method not Implemented");
	}
}
