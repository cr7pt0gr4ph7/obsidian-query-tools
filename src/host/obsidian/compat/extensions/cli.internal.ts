import type { CliFlags, CliHandler } from "./cli.js";

export interface ICliPluginRegistry {
	/**
	 * Register a CLI handler to handle a command from the CLI.
	 * Command IDs must be globally unique. Attempting to register a command that is already registered will throw an Error.
	 *
	 * Use the format `<plugin-id>` for your default command, and `<plugin-id>:<action>` for sub-commands and actions.
	 *
	 * @param command The command ID that will be used. Use alphanumeric characters without spaces.
	 * @param description The description text to provide in the help command, and in auto-completion prompts.
	 * @param flags Command line flags that can be passed in.
	 * @param handler The callback handler to handle a CLI invocation.
	 * @public
	 * @since 1.12.2
	 */
	registerCliHandler(command: string, description: string, flags: CliFlags | null, handler: CliHandler): void;
}

export interface ICliHandlerRegistration {
	/** The command ID that this registration corresponds to. Uses alphanumeric characters without spaces. */
	readonly command: string;
	/** The description text to provide in the help command, and in auto-completion prompts. */
	readonly description: string;
	/** Command line flags that can be passed in. */
	readonly flags: CliFlags | null;
	/** The callback handler to handle a CLI invocation. */
	readonly handler: CliHandler;
}

export function CliPluginRegistry<TBase extends new (...args: any[]) => any>(Base: TBase) {
	return class extends Base implements ICliPluginRegistry {
		_cliHandlers: Record<string, ICliHandlerRegistration> = {};

		registerCliHandler(command: string, description: string, flags: CliFlags | null, handler: CliHandler): void {
			this._cliHandlers[command] = { command, description, flags, handler };
		}
	};
}
