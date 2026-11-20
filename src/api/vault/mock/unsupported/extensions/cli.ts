export interface ICliPlugin_ {
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
