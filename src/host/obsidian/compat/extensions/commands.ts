import type { Modifier } from "../../base/modifier.js";
import type { Editor } from "../editor/editor.js";
import type { IconName } from "../icons.js";
import type { MarkdownView } from "../views/markdown.js";
import type { MarkdownFileInfo } from "../views/markdown_file.js";

/**
 * A hotkey.
 * @example
 * ```ts
 * const hotkey: Hotkey = { modifiers: ['Mod'], key: 'a' };
 * ```
 * @public
 */
export interface Hotkey {
	/**
	 * The modifier keys.
	 * @public
	 */
	modifiers: Modifier[];

	/**
	 * The main key.
	 * @public
	 */
	key: string;
}

/**
 * A command that can be executed from the command palette or toolbar buttons.
 * @public
 */
export interface Command {
	/**
	 * Globally unique ID to identify this command.
	 * @public
	 */
	id: string;

	/**
	 * Human friendly name for searching.
	 * @public
	 */
	name: string;

	/**
	 * Icon ID to be used in the toolbar.
	 * See {@link https://docs.obsidian.md/Plugins/User+interface/Icons} for available icons and how to add your own.
	 * @example
	 * ```ts
	 * const command: Command = {
	 *   id: 'example-command',
	 *   name: 'Example command',
	 *   icon: 'dice',
	 * };
	 * ```
	 * @public
	 */
	icon?: IconName;

	/**
	 * Whether the command is only available on mobile.
	 * @public
	 */
	mobileOnly?: boolean;

	/**
	 * Whether holding the hotkey should repeatedly trigger this command.
	 * @defaultValue false.
	 * @public
	 */
	repeatable?: boolean;

	/**
	 * Simple callback, triggered globally.
	 * @example
	 * ```ts
	 * this.addCommand({
	 *   id: 'print-greeting-to-console',
	 *   name: 'Print greeting to console',
	 *   callback: () => {
	 *     console.log('Hey, you!');
	 *   },
	 * });
	 * ```
	 * @public
	 */
	callback?: () => any;

	/**
	 * Complex callback, overrides the simple callback.
	 * Used to 'check' whether your command can be performed in the current circumstances.
	 * For example, if your command requires the active focused pane to be a MarkdownView, then
	 * you should only return `true` if the condition is satisfied. Returning `false` or `undefined` causes
	 * the command to be hidden from the command palette.
	 * @param checking Whether the command palette is just 'checking' if your command should show right now.
	 * If checking is `true`, then this function should not perform any action.
	 * If checking is `false`, then this function should perform the action.
	 * @returns Whether this command can be executed at the moment.
	 * @example
	 * ```ts
	 * this.addCommand({
	 *   id: 'example-command',
	 *   name: 'Example command',
	 *   checkCallback: (checking: boolean) => {
	 *     const value = getRequiredValue();
	 *
	 *     if (value) {
	 *       if (!checking) {
	 *         doCommand(value);
	 *       }
	 *       return true;
	 *     }
	 *
	 *     return false;
	 *   }
	 * });
	 * ```
	 * @public
	 */
	checkCallback?: (checking: boolean) => boolean | undefined;

	/**
	 * A command callback that is only triggered when the user is in an editor.
	 * Overrides `callback` and `checkCallback`
	 * @example
	 * ```ts
	 * this.addCommand({
	 *   id: 'example-command',
	 *   name: 'Example command',
	 *   editorCallback: (editor: Editor, view: MarkdownView) => {
	 *     const sel = editor.getSelection();
	 *
	 *     console.log(`You have selected: ${sel}`);
	 *   }
	 * });
	 * ```
	 * @public
	 * @since 0.12.2
	 */
	editorCallback?: (editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => any;

	/**
	 * A command callback that is only triggered when the user is in an editor.
	 * Overrides `editorCallback`, `callback` and `checkCallback`
	 * @example
	 * ```ts
	 * this.addCommand({
	 *   id: 'example-command',
	 *   name: 'Example command',
	 *   editorCheckCallback: (checking: boolean, editor: Editor, view: MarkdownView) => {
	 *     const value = getRequiredValue();
	 *
	 *     if (value) {
	 *       if (!checking) {
	 *         doCommand(value);
	 *       }
	 *
	 *       return true;
	 *     }
	 *
	 *     return false;
	 *   }
	 * });
	 * ```
	 * @public
	 * @since 0.12.2
	 */
	editorCheckCallback?: (
		checking: boolean,
		editor: Editor,
		ctx: MarkdownView | MarkdownFileInfo,
	) => boolean | undefined;

	/**
	 * Sets the default hotkey. It is recommended for plugins to avoid setting default hotkeys if possible,
	 * to avoid conflicting hotkeys with one that's set by the user, even though customized hotkeys have higher priority.
	 * @example
	 * ```ts
	 * this.addCommand({
	 *   id: 'example-command',
	 *   name: 'Example command',
	 *   // WARNING: as per comment above, it's not recommended to set default hotkeys
	 *   // this example is just for syntax demonstration purposes, not the recommended way to do it
	 *   hotkeys: [{
	 *     modifiers: ['Mod', 'Shift'],
	 *     key: 'l',
	 *   }],
	 * });
	 * ```
	 * @public
	 */
	hotkeys?: Hotkey[];
}
