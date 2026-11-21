export interface IObsidianProtocolPlugin_ {
	/**
	 * Register a handler for obsidian:// URLs.
	 * @param action the action string. For example, 'open' corresponds to `obsidian://open`.
	 * @param handler the callback to trigger. A key-value pair that is decoded from the query will be passed in.
	 *                  For example, `obsidian://open?key=value` would generate `{'action': 'open', 'key': 'value'}`.
	 * @public
	 * @since 0.11.0
	 */
	registerObsidianProtocolHandler(action: string, handler: ObsidianProtocolHandler): void;
}

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
