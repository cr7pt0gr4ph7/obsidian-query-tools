import type { ObsidianProtocolHandler } from "./protocol.js";

export interface IObsidianProtocolHandlerPluginRegistry {
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

export function ObsidianProtocolHandlerPluginRegistry<Base extends new (...args: any[]) => any>(Base: Base) {
	return class extends Base implements IObsidianProtocolHandlerPluginRegistry {
		_obsidianProtocolHandlers: Record<string, ObsidianProtocolHandler> = {};

		registerObsidianProtocolHandler(action: string, handler: ObsidianProtocolHandler): void {
			this._obsidianProtocolHandlers[action] = handler;
		}
	};
}
