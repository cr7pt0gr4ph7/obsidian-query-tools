/**
 * The three valid "sources" of a property in a Base.
 *
 * - `note`: Properties from the frontmatter of markdown files in the vault.
 * - `formula`: Properties calculated by evaluating a formula from the base config file.
 * - `file`: Properties inherent to a file, such as the name, extension, size, etc.
 *
 * @public
 * @since 1.10.0
 */
export type BasesPropertyType = "note" | "formula" | "file";

/**
 * A parsed version of the {@link BasesPropertyId}.
 *
 * @public
 * @since 1.10.0
 */
export interface BasesProperty {
	/**
	 * @public
	 * @since 1.10.0
	 */
	type: BasesPropertyType;

	/**
	 * @public
	 * @since 1.10.0
	 */
	name: string;
}

/**
 * The full ID of a property, used in the bases config file. The prefixed
 * {@link BasesPropertyType} disambiguates properties of the same name but from different sources.
 *
 * @public
 * @since 1.10.0
 */
export type BasesPropertyId = `${BasesPropertyType}.${string}`;

/**
 * Split a Bases property ID into constituent parts.
 *
 * @param propertyId Property ID to split.
 * @returns The parsed property.
 * @public
 * @since 1.10.0
 */
export declare function parsePropertyId(propertyId: BasesPropertyId): BasesProperty;
