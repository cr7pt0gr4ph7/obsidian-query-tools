/**
 * @public
 * @since 1.12.2
 */
export interface CliData {
	/**
	 * @public
	 * @since 1.12.2
	 */
	[key: string]: string | "true";
}

/**
 * @public
 * @since 1.12.2
 */
export interface CliFlag {
	/**
	 * Value placeholder (e.g., '<filename>', '<path>'). Omit for boolean flags.
	 * @public
	 * @since 1.12.2
	 */
	value?: string;

	/**
	 * Description shown in help and autocomplete
	 * @public
	 * @since 1.12.2
	 */
	description: string;

	/**
	 * Whether this flag is required (default: false)
	 * @public
	 * @since 1.12.2
	 */
	required?: boolean;
}

/**
 * @public
 * @since 1.12.2
 */
export type CliFlags = Record<string, CliFlag>;

/**
 * @public
 * @since 1.12.2
 */
export type CliHandler = (params: CliData) => string | Promise<string>;
