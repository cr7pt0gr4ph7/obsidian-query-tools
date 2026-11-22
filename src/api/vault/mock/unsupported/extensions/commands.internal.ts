import type { Command } from "commander";

export interface ICommandPlugin_ {
	/**
	 * Register a command globally.
	 * Registered commands will be available from the {@link https://obsidian.md/help/plugins/command-palette Command palette}.
	 * The command id and name will be automatically prefixed with this plugin's id and name.
	 *
	 * @param command The command.
	 * @returns The command, with its ID and name prefixed.
	 * @example
	 * ```ts
	 * plugin.addCommand({
	 *     id: 'foo',
	 *     name: 'Foo',
	 * });
	 * ```
	 * @public
	 * @since 0.9.7
	 */
	addCommand(command: Command): Command;

	/**
	 * Manually remove a command from the list of global commands.
	 * This should not be needed unless your plugin registers commands dynamically.
	 *
	 * @param commandId The ID you passed to {@link Plugin.addCommand}, without the plugin ID prefix.
	 * @public
	 * @since 1.7.2
	 */
	removeCommand(commandId: string): void;
}
