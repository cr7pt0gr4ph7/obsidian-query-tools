/**
 * A parsed data object for `obsidian://` URLs.
 * @example
 * `obsidian://foo?bar=baz&qux=true`
 * @public
 */
export interface ObsidianProtocolData {
	/**
	 * The action to perform.
	 * @example
	 * ```ts
	 * console.log(obsidianProtocolData.action); // foo
	 * ```
	 * @public
	 */
	action: string;

	/**
	 * Additional parameters.
	 * @example
	 * ```ts
	 * console.log(obsidianProtocolData['bar']); // baz
	 * console.log(obsidianProtocolData['qux']); // true
	 * ```
	 * @public
	 */
	[key: string]: string | "true";
}

/**
 * A handler for `obsidian://` URLs.
 * @param params The URL parameters.
 * @public
 */
export type ObsidianProtocolHandler = (params: ObsidianProtocolData) => any;
